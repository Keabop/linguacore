import { ApiError, GoogleGenAI, ThinkingLevel, type Content, type GenerateContentConfig, type GenerateContentResponse } from '@google/genai';
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

// Models to try in order — if one is overloaded, down or out of quota, the next. The free tier
// (2026-10-29) gives the 3.x Flash Lite models 500 requests a day each and the Flash ones 20, so
// the Lite ones go first and every other text model follows, until all the day's quota is used.
// Gemma 4 closes the list: 14 400 a day, but slower (it always reasons) and 16K tokens a minute.
// Pro is left out on purpose: a 429 also means our own quota ran out, and escalating then
// multiplies the bill.
export const MODELS = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemma-4-31b-it',
    'gemma-4-26b-a4b-it',
];

// Gemini 3 models take a thinking level, the lowest each accepts (3.8 Flash rejects MINIMAL)
const LOWEST_THINKING: Record<string, ThinkingLevel> = { 'gemini-3.8-flash': ThinkingLevel.LOW };

/**
 * JSON out and as little thinking as each model allows: thinking tokens are billed as output and
 * these tasks don't need them. Gemini 2.5 takes a budget, Gemini 3 a level (3.5 rejects a budget)
 * and Gemma neither: it always reasons, in parts marked as thought that `response.text` leaves out.
 */
export function jsonConfig(model: string, extra: GenerateContentConfig = {}): GenerateContentConfig {
    const json = { responseMimeType: 'application/json', ...extra };
    if (model.startsWith('gemma-')) return json;
    const thinkingConfig = model.startsWith('gemini-2.')
        ? { thinkingBudget: 0 }
        : { thinkingLevel: LOWEST_THINKING[model] ?? ThinkingLevel.MINIMAL };
    return { ...json, thinkingConfig };
}

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

/**
 * 404 (the model was retired, as previews are) or 500 (an internal error, which Gemma gives now
 * and then): the next one in MODELS is worth a try too.
 */
export function isModelDown(error: unknown): boolean {
    return error instanceof ApiError && (error.status === 404 || error.status === 500);
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
            if ((isOverloaded(error) || isModelDown(error)) && i < MODELS.length - 1) {
                console.log(`[Gemini] ${MODELS[i]} unavailable, falling back to ${MODELS[i + 1]}`);
                continue;
            }
            throw error;
        }
    }
    throw new Error('All Gemini models are currently unavailable. Please try again later.');
}

/**
 * Tries to generate content using fallback models if the primary is overloaded (503/429).
 * Evaluators pass `temperature: 0`, so the same answer gets the same score.
 */
export function generateWithFallback(prompt: string, { temperature }: { temperature?: number } = {}): Promise<string> {
    const extra = temperature === undefined ? {} : { temperature };
    return withFallback(model => getGenAI().models.generateContent({ model, contents: prompt, config: jsonConfig(model, extra) }));
}

/**
 * Tries to run a chat session with fallback models. The history must start with a user turn.
 */
export function chatWithFallback(history: Content[], lastMessage: string): Promise<string> {
    return withFallback(model => getGenAI().chats.create({ model, history, config: jsonConfig(model) }).sendMessage({ message: lastMessage }));
}
