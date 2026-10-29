// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateContent = vi.fn();

vi.mock('@google/genai', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@google/genai')>();
    return {
        ...actual,
        GoogleGenAI: class {
            models = { generateContent };
        },
    };
});

const { ApiError } = await import('@google/genai');
const { MODELS, generateWithFallback, isOverloaded, jsonConfig } = await import('./gemini');
const { setEnv } = await import('./config');

beforeEach(() => {
    generateContent.mockReset();
    setEnv({ GEMINI_API_KEY: 'test-key' });
    vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('isOverloaded', () => {
    it('treats 429 and 503 as busy', () => {
        expect(isOverloaded(new ApiError({ message: 'busy', status: 503 }))).toBe(true);
        expect(isOverloaded(new ApiError({ message: 'quota', status: 429 }))).toBe(true);
        expect(isOverloaded(new Error('The model is overloaded'))).toBe(true);
    });

    it('does not retry other errors', () => {
        expect(isOverloaded(new ApiError({ message: 'bad', status: 400 }))).toBe(false);
        expect(isOverloaded(new Error('Invalid JSON'))).toBe(false);
    });
});

describe('generateWithFallback', () => {
    it('returns the trimmed text of the first model', async () => {
        generateContent.mockResolvedValueOnce({ text: '  {"ok":true}\n' });
        await expect(generateWithFallback('hi')).resolves.toBe('{"ok":true}');
        expect(generateContent).toHaveBeenCalledWith(expect.objectContaining({
            model: 'gemini-3.5-flash-lite',
            config: { responseMimeType: 'application/json', thinkingConfig: { thinkingLevel: 'MINIMAL' } },
        }));
    });

    it('asks Gemini 2.5 for a thinking budget of 0, which Gemini 3.5 rejects', () => {
        expect(jsonConfig('gemini-2.5-flash-lite').thinkingConfig).toEqual({ thinkingBudget: 0 });
        expect(jsonConfig('gemini-3.5-flash-lite', { temperature: 0 })).toMatchObject({ temperature: 0, thinkingConfig: { thinkingLevel: 'MINIMAL' } });
        expect(jsonConfig('gemini-3.8-flash').thinkingConfig).toEqual({ thinkingLevel: 'LOW' });
        expect(jsonConfig('gemma-4-31b-it')).toEqual({ responseMimeType: 'application/json' });
    });

    it('moves to the next model when one is busy', async () => {
        generateContent
            .mockRejectedValueOnce(new ApiError({ message: 'busy', status: 503 }))
            .mockResolvedValueOnce({ text: '{}' });
        await expect(generateWithFallback('hi')).resolves.toBe('{}');
        expect(generateContent.mock.calls[1][0].model).toBe(MODELS[1]);
    });

    it('moves on from a retired model or an internal error', async () => {
        generateContent
            .mockRejectedValueOnce(new ApiError({ message: 'not found', status: 404 }))
            .mockRejectedValueOnce(new ApiError({ message: 'internal', status: 500 }))
            .mockResolvedValueOnce({ text: '{}' });
        await expect(generateWithFallback('hi')).resolves.toBe('{}');
    });

    it('throws other errors right away', async () => {
        generateContent.mockRejectedValueOnce(new ApiError({ message: 'bad request', status: 400 }));
        await expect(generateWithFallback('hi')).rejects.toThrow('bad request');
        expect(generateContent).toHaveBeenCalledTimes(1);
    });

    it('explains a blocked response instead of returning empty text', async () => {
        generateContent.mockResolvedValueOnce({ text: undefined, promptFeedback: { blockReason: 'SAFETY' } });
        await expect(generateWithFallback('hi')).rejects.toThrow('Gemini returned no text (SAFETY)');
    });

    it('gives up after the last model', async () => {
        generateContent.mockRejectedValue(new ApiError({ message: 'busy', status: 503 }));
        await expect(generateWithFallback('hi')).rejects.toThrow('busy');
        expect(generateContent).toHaveBeenCalledTimes(MODELS.length);
    });
});
