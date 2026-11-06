import { describe, expect, it, vi } from 'vitest';

const gemini = vi.hoisted(() => ({ generateWithFallback: vi.fn() }));
vi.mock('../lib/gemini.js', () => gemini);

import { translateStory, translatableStory, translationCacheParams } from './story-translator';
import { storySentences } from '../../src/lib/storySentences';

const story = translatableStory('b1-001')!;
const sentences = storySentences(story.content);
const questions = story.questions ?? [];

describe('story translator', () => {
    it('asks for natural Spanish, carefully, sentence by sentence', async () => {
        gemini.generateWithFallback.mockResolvedValueOnce(JSON.stringify({
            sentences: sentences.map((_, i) => `Oración ${i}.`),
            questions: questions.map(q => ({ question: 'Pregunta', options: q.options.map(() => 'Opción') })),
        }));
        const result = await translateStory({ storyId: 'b1-001' });
        expect(result.sentences).toHaveLength(sentences.length);
        const [prompt, options] = gemini.generateWithFallback.mock.calls[0];
        expect(prompt).toContain(`exactly ${sentences.length} strings`);
        expect(prompt).toMatch(/agree with its real subject/);
        expect(options).toEqual({ temperature: 0.3 });
    });

    it('refuses a translation that does not line up with the story', async () => {
        gemini.generateWithFallback.mockResolvedValueOnce(JSON.stringify({ sentences: ['Sólo una.'], questions: [] }));
        await expect(translateStory({ storyId: 'b1-001' })).rejects.toThrow(/does not match/);
    });

    it('keys the cache on the text, so an edited story is translated again', () => {
        const params = translationCacheParams('b1-001');
        expect(params.storyId).toBe('b1-001');
        expect(params.source?.sentences).toEqual(sentences);
        expect(translationCacheParams('no-existe').source).toBeNull();
    });
});
