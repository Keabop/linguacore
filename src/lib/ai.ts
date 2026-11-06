import type { CEFRLevel, Story, StoryTranslation, Vocabulary } from './db';
import { apiFetch } from './apiFetch';
import i18n from '../i18n/config';

const API_BASE = '/api/orchestrator';

/** A free plan limit answered by the orchestrator (`daily_limit_reached`, `weekly_limit_reached`). */
export function isLimitReached(error: unknown): boolean {
    const code = (error as { code?: unknown } | null)?.code;
    return typeof code === 'string' && code.endsWith('_limit_reached');
}

async function retry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    baseDelay = 1000,
): Promise<T> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            const isLast = attempt === maxAttempts - 1;
            const status = error.status as number | undefined;
            // A free plan limit stays reached until tomorrow: asking again only wastes the wait
            const isRetryable = (!status || status >= 500 || status === 429) && !isLimitReached(error);
            if (isLast || !isRetryable) throw error;
            await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
        }
    }
    throw new Error('Unreachable');
}

async function callAgent<T>(agent: string, params: Record<string, any>): Promise<T> {
    return retry(async () => {
        const response = await apiFetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent, params }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            // The AI can't serve some regions (see the terms): say so instead of a bare status.
            // A server failure, or an answer that is not ours, gets a plain message: not the
            // server's English, not a status code
            const message = data.error === 'region_unavailable'
                ? i18n.t('legal.regionUnavailable')
                : response.status >= 500 || !data.message ? i18n.t('common.aiUnavailable') : data.message;
            const err = new Error(message);
            (err as any).status = response.status;
            (err as any).code = data.error;
            throw err;
        }

        return response.json();
    });
}

// ===== Story Generator =====

interface GeneratedStoryResponse {
    id: string;
    level: string;
    title: string;
    content: string;
    wordCount: number;
    estimatedMinutes: number;
    vocabulary: Array<{
        id: string;
        translations: string[];
        cefrLevel: string;
        examples: string[];
        phonetic?: string;
    }>;
}

export async function generateStory(
    level: CEFRLevel,
    knownWords: string[] = [],
    topic?: string
): Promise<GeneratedStoryResponse> {
    return callAgent<GeneratedStoryResponse>('story-generator', { level, knownWords, topic });
}

// ===== Vocabulary Enricher =====

export interface VocabEnrichment {
    word: string;
    translations: string[];
    cefrLevel: string;
    examples: string[];
    phonetic: string;
    synonyms: string[];
    antonyms: string[];
    usageNotes: string;
    collocations: string[];
}

export async function enrichVocabulary(
    word: string,
    level: CEFRLevel,
    context?: string
): Promise<VocabEnrichment> {
    return callAgent<VocabEnrichment>('vocab-enricher', { word, level, context });
}

// ===== Exercise Creator =====

export interface MultipleChoiceExercise {
    type: 'multiple-choice';
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface SentenceOrderExercise {
    type: 'sentence-order';
    scrambled: string[];
    correct: string;
    hint: string;
}

export interface ContextMatchExercise {
    type: 'context-match';
    sentences: Array<{ sentence: string; blank: string }>;
    words: string[];
}

export type Exercise = MultipleChoiceExercise | SentenceOrderExercise | ContextMatchExercise;

export interface ExerciseSet {
    exercises: Exercise[];
    level: string;
}

export async function createExercises(
    words: string[],
    level: CEFRLevel,
    type?: 'multiple-choice' | 'sentence-order' | 'context-match' | 'mixed'
): Promise<ExerciseSet> {
    return callAgent<ExerciseSet>('exercise-creator', { words, level, type });
}

// ===== Conversation Tutor =====

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ConversationResponse {
    reply: string;
    corrections: Array<{
        original: string;
        corrected: string;
        explanation: string;
        example_variants?: string[];
    }>;
    suggestions: string[];
}

export async function chatWithTutor(
    messages: ConversationMessage[],
    level: CEFRLevel,
    topic?: string
): Promise<ConversationResponse> {
    return callAgent<ConversationResponse>('conversation-tutor', { messages, level, topic });
}

// ===== Writing Evaluator =====

export interface WritingCorrection {
    original: string;
    corrected: string;
    explanation: string;
    type: 'grammar' | 'vocabulary' | 'spelling' | 'style';
    example_variants?: string[];
}

export interface WritingEvaluationResponse {
    score: number;
    corrections: WritingCorrection[];
    feedback: {
        grammar: { score: number; note: string };
        vocabulary: { score: number; note: string };
        coherence: { score: number; note: string };
    };
    improvedVersion: string;
    encouragement: string;
    /** The exam's official criteria, each banded 0 to 5, when an exam was given. */
    criteria?: CriterionScore[];
}

/** One official criterion of an exam, as the AI scored it. */
export interface CriterionScore {
    name: string;
    band: number;
    note: string;
}

export async function evaluateWriting(
    text: string,
    prompt: string,
    level: CEFRLevel,
    type: 'sentence-construction' | 'paragraph-completion' | 'free-writing' | 'error-correction',
    targetGrammar: string[],
    referenceAnswer?: string,
    exam?: string,
    /** Redoing a prompt under the pass mark: it spends the day's retries, not its evaluations. */
    retry?: boolean,
): Promise<WritingEvaluationResponse> {
    return spendsEvaluation(callAgent<WritingEvaluationResponse>('writing-evaluator', {
        text, prompt, level, type, targetGrammar, referenceAnswer, exam, ...(retry ? { retry: true } : {}),
    }));
}

/** An evaluation changes the free plan's remaining count, wherever it is shown. */
export const USAGE_CHANGED = 'voxie-usage-changed';
function spendsEvaluation<T>(call: Promise<T>): Promise<T> {
    return call.finally(() => window.dispatchEvent(new Event(USAGE_CHANGED)));
}

export interface CareerWord {
    word: string;
    translation: string;
    example: string;
    exampleTranslation: string;
}

export async function generateCareerDeck(profession: string, level: string): Promise<CareerWord[]> {
    return callAgent<CareerWord[]>('career-deck', { profession, level });
}

export interface SpeakingCorrection {
    phrase: string;
    suggestion: string;
    explanation: string;
}

export interface SpeakingEvaluationResponse {
    score: number;
    corrections: SpeakingCorrection[];
    pronunciationScore: number;
    fluencyScore: number;
    vocabularyScore: number;
    detailedFeedback: string;
    criteria?: CriterionScore[];
}

/** The Spanish of a B1 or B2 story, translated once and served from the cache after. */
export async function translateStory(storyId: string): Promise<StoryTranslation> {
    return callAgent<StoryTranslation>('story-translator', { storyId });
}

export async function evaluateSpeaking(
    transcripts: string[],
    prompts: string[],
    level: string,
    exam?: string,
): Promise<SpeakingEvaluationResponse> {
    return spendsEvaluation(callAgent<SpeakingEvaluationResponse>('speaking-evaluator', { transcripts, prompts, level, exam }));
}

