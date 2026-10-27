import { ApiError, GoogleGenAI, type Content } from '@google/genai';
import { env } from './config.js';

export const AGENT_TYPES = [
    'story-generator',
    'vocab-enricher',
    'exercise-creator',
    'conversation-tutor',
    'writing-evaluator',
    'career-deck',
    'speaking-evaluator',
] as const;

export type AgentType = typeof AGENT_TYPES[number];

// Models to try in order — if one is overloaded, fall back to the next
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'];

const JSON_CONFIG = { responseMimeType: 'application/json' };

let _genAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
    if (_genAI) return _genAI;

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error(
            'GEMINI_API_KEY environment variable is not set. ' +
            'Add it in Cloudflare Pages → Settings → Variables and Secrets (or .dev.vars locally).'
        );
    }

    _genAI = new GoogleGenAI({ apiKey });
    return _genAI;
}

/** 429 and 503 mean the model is busy, so the next one in MODELS is worth a try. */
export function isOverloaded(error: unknown): boolean {
    if (error instanceof ApiError) return error.status === 429 || error.status === 503;
    const message = error instanceof Error ? error.message : String(error);
    return /\b(429|503)\b|overloaded|high demand/i.test(message);
}

async function withFallback(run: (model: string) => Promise<string | undefined>): Promise<string> {
    for (let i = 0; i < MODELS.length; i++) {
        try {
            return ((await run(MODELS[i])) ?? '').trim();
        } catch (error) {
            if (isOverloaded(error) && i < MODELS.length - 1) {
                console.log(`[Gemini] ${MODELS[i]} overloaded, falling back to ${MODELS[i + 1]}`);
                continue;
            }
            throw error;
        }
    }
    throw new Error('All Gemini models are currently unavailable. Please try again later.');
}

/**
 * Tries to generate content using fallback models if the primary is overloaded (503/429).
 */
export function generateWithFallback(prompt: string): Promise<string> {
    return withFallback(async (model) => {
        const response = await getGenAI().models.generateContent({ model, contents: prompt, config: JSON_CONFIG });
        return response.text;
    });
}

/**
 * Tries to run a chat session with fallback models. The history must start with a user turn.
 */
export function chatWithFallback(history: Content[], lastMessage: string): Promise<string> {
    return withFallback(async (model) => {
        const chat = getGenAI().chats.create({ model, history, config: JSON_CONFIG });
        const response = await chat.sendMessage({ message: lastMessage });
        return response.text;
    });
}
