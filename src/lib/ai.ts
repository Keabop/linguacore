import type { CEFRLevel, Story, Vocabulary } from './db';

const API_BASE = '/api/orchestrator';

async function callAgent<T>(agent: string, params: Record<string, any>): Promise<T> {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent, params }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `Agent ${agent} failed with status ${response.status}`);
    }

    return response.json();
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
