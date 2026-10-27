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
const { generateWithFallback, isOverloaded } = await import('./gemini');
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
            model: 'gemini-2.5-flash-lite',
            config: { responseMimeType: 'application/json' },
        }));
    });

    it('moves to the next model when one is busy', async () => {
        generateContent
            .mockRejectedValueOnce(new ApiError({ message: 'busy', status: 503 }))
            .mockResolvedValueOnce({ text: '{}' });
        await expect(generateWithFallback('hi')).resolves.toBe('{}');
        expect(generateContent.mock.calls[1][0].model).toBe('gemini-2.5-flash');
    });

    it('throws other errors right away', async () => {
        generateContent.mockRejectedValueOnce(new ApiError({ message: 'bad request', status: 400 }));
        await expect(generateWithFallback('hi')).rejects.toThrow('bad request');
        expect(generateContent).toHaveBeenCalledTimes(1);
    });

    it('gives up after the last model', async () => {
        generateContent.mockRejectedValue(new ApiError({ message: 'busy', status: 503 }));
        await expect(generateWithFallback('hi')).rejects.toThrow('busy');
        expect(generateContent).toHaveBeenCalledTimes(3);
    });
});
