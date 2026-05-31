import type { CEFRLevel, Story, Vocabulary } from './db';
import { supabase } from './supabase';

const API_BASE = '/api/orchestrator';

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
            const isRetryable = !status || status >= 500 || status === 429;
            if (isLast || !isRetryable) throw error;
            await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
        }
    }
    throw new Error('Unreachable');
}

async function callAgent<T>(agent: string, params: Record<string, any>): Promise<T> {
    return retry(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch(API_BASE, {
            method: 'POST',
            headers,
            body: JSON.stringify({ agent, params }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({ message: 'Unknown error' }));
            const err = new Error(data.message || `Agent ${agent} failed: ${response.status}`);
            (err as any).status = response.status;
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
}

export async function evaluateWriting(
    text: string,
    prompt: string,
    level: CEFRLevel,
    type: 'sentence-construction' | 'paragraph-completion' | 'free-writing' | 'error-correction',
    targetGrammar: string[],
    referenceAnswer?: string
): Promise<WritingEvaluationResponse> {
    return callAgent<WritingEvaluationResponse>('writing-evaluator', {
        text, prompt, level, type, targetGrammar, referenceAnswer,
    });
}

export interface CareerWord {
    word: string;
    translation: string;
    example: string;
    exampleTranslation: string;
}

export async function generateCareerDeck(profession: string, level: string): Promise<CareerWord[]> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) throw new Error('API key missing');

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
    Eres un lingüista experto en inglés profesional. Genera una lista de 15 palabras o frases esenciales en inglés especializadas para la profesión: "${profession}", adaptadas para el nivel CEFR: "${level}".
    
    Debes retornar un JSON array con el siguiente formato exacto de objetos:
    [
      {
        "word": "palabra en inglés (ej. reluctancy)",
        "translation": "traducción directa en español (ej. renuencia)",
        "example": "una oración de ejemplo en inglés simple y clara que use la palabra",
        "exampleTranslation": "la traducción de la oración de ejemplo al español"
      }
    ]
    `;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return JSON.parse(text) as CareerWord[];
}
