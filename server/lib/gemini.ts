import { ApiError, GoogleGenAI, type Content, type GenerateContentResponse } from '@google/genai';
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

// Models to try in order — if one is overloaded, fall back to the next. Pro is left out on
// purpose: a 429 also means our own quota ran out, and escalating then multiplies the bill.
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

// Thinking tokens are billed as output; these tasks don't need them (Flash thinks by default)
const JSON_CONFIG = { responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } };

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

/** The text of a response, or an error that says why there is none (e.g. a safety block). */
export function responseText(response: GenerateContentResponse): string {
    const text = response.text;
    if (text !== undefined) return text.trim();
    const reason = response.promptFeedback?.blockReason ?? response.candidates?.[0]?.finishReason ?? 'empty response';
    throw new Error(`Gemini returned no text (${reason})`);
}

async function withFallback(run: (model: string) => Promise<GenerateContentResponse>): Promise<string> {
    for (let i = 0; i < MODELS.length; i++) {
        try {
            return responseText(await run(MODELS[i]));
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
    return withFallback(model => getGenAI().models.generateContent({ model, contents: prompt, config: JSON_CONFIG }));
}

/**
 * Tries to run a chat session with fallback models. The history must start with a user turn.
 */
export function chatWithFallback(history: Content[], lastMessage: string): Promise<string> {
    return withFallback(model => getGenAI().chats.create({ model, history, config: JSON_CONFIG }).sendMessage({ message: lastMessage }));
}
