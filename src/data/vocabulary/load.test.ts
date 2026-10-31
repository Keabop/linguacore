import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('levelOfWord', () => {
    it('finds the level of a card, of its old id, and nothing for a custom word', async () => {
        const { levelOfWord } = await import('./load');
        expect(levelOfWord('hello')).toBe('A1');
        expect(levelOfWord('teeth')).toBe(levelOfWord('tooth'));
        expect(levelOfWord('my-own-word')).toBeNull();
    });
});

describe('useVocabulary', () => {
    it('gives nothing while the decks load, then finds the words of every level asked for', async () => {
        vi.resetModules();
        const { useVocabulary, levelOfWord } = await import('./load');
        const { WORD_IDS } = await import('./wordLevels');
        const b2Word = WORD_IDS.B2.split('|')[0];
        const { result } = renderHook(() => useVocabulary(['hello', b2Word, 'teeth']));
        expect(result.current).toBeNull();
        await waitFor(() => expect(result.current).not.toBeNull());
        expect(result.current!.get('hello')?.cefrLevel).toBe('A1');
        expect(result.current!.get(b2Word)?.id).toBe(b2Word);
        expect(result.current!.map(['teeth']).get('teeth')?.id).toBe('tooth');
        expect(levelOfWord(b2Word)).toBe('B2');
    });

    it('answers at once with no words to look up', async () => {
        const { useVocabulary } = await import('./load');
        expect(renderHook(() => useVocabulary([])).result.current).not.toBeNull();
    });

    it('lists the cards a unit teaches once its level is loaded', async () => {
        const { loadVocabulary } = await import('./load');
        const vocabulary = await loadVocabulary([], ['A1']);
        const deck = vocabulary.unitDeck('a1-u1');
        expect(deck.length).toBeGreaterThan(0);
        expect(deck.every(v => v.unitId === 'a1-u1' && v.phonetic)).toBe(true);
    });

    it('throws a failed download, so the error boundary offers to reload', async () => {
        vi.resetModules();
        vi.doMock('./decks/b1', async () => { throw new TypeError('Failed to fetch dynamically imported module'); });
        const { useVocabulary } = await import('./load');
        const { WORD_IDS } = await import('./wordLevels');
        const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = renderHook(() => {
            try { return useVocabulary([WORD_IDS.B1.split('|')[0]]); } catch (e) { return e as Error; }
        });
        await waitFor(() => expect(result.current).toBeInstanceOf(Error));
        errors.mockRestore();
        vi.doUnmock('./decks/b1');
    });
});
