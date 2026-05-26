import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { env } from './config.js';

export type AgentType = 'story-generator' | 'vocab-enricher' | 'exercise-creator' | 'conversation-tutor' | 'writing-evaluator';

// Models to try in order — if one is overloaded, fall back to the next
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'];

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
    if (_genAI) return _genAI;

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error(
            'GEMINI_API_KEY environment variable is not set. ' +
            'Please add it in Vercel Dashboard → Settings → Environment Variables.'
        );
    }

    _genAI = new GoogleGenerativeAI(apiKey);
    return _genAI;
}

export function getModel(modelName?: string): GenerativeModel {
    return getGenAI().getGenerativeModel({
        model: modelName || MODELS[0],
        generationConfig: {
            responseMimeType: 'application/json',
        },
    });
}

/**
 * Tries to generate content using fallback models if the primary is overloaded (503/429).
 */
export async function generateWithFallback(prompt: string): Promise<string> {
    for (let i = 0; i < MODELS.length; i++) {
        try {
            const model = getModel(MODELS[i]);
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error: any) {
            const status = error?.status || error?.httpStatusCode;
            const isOverloaded = status === 503 || status === 429 ||
                error.message?.includes('503') || error.message?.includes('429') ||
                error.message?.includes('overloaded') || error.message?.includes('high demand');

            if (isOverloaded && i < MODELS.length - 1) {
                console.log(`[Gemini] ${MODELS[i]} overloaded, falling back to ${MODELS[i + 1]}`);
                continue;
            }
            throw error;
        }
    }
    throw new Error('All Gemini models are currently unavailable. Please try again later.');
}

/**
 * Tries to run a chat session with fallback models.
 */
export async function chatWithFallback(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
    lastMessage: string
): Promise<string> {
    for (let i = 0; i < MODELS.length; i++) {
        try {
            const model = getModel(MODELS[i]);
            const chatSession = model.startChat({ history });
            const result = await chatSession.sendMessage(lastMessage);
            return result.response.text().trim();
        } catch (error: any) {
            const isOverloaded = error.message?.includes('503') || error.message?.includes('429') ||
                error.message?.includes('overloaded') || error.message?.includes('high demand');

            if (isOverloaded && i < MODELS.length - 1) {
                console.log(`[Gemini] ${MODELS[i]} overloaded, falling back to ${MODELS[i + 1]}`);
                continue;
            }
            throw error;
        }
    }
    throw new Error('All Gemini models are currently unavailable. Please try again later.');
}
