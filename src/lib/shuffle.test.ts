import { describe, expect, it } from 'vitest';
import { shuffle, shuffleQuestion } from './shuffle';

describe('shuffle', () => {
    it('keeps every item and leaves the input untouched', () => {
        const input = [1, 2, 3, 4, 5];
        const out = shuffle(input);
        expect([...out].sort()).toEqual(input);
        expect(input).toEqual([1, 2, 3, 4, 5]);
    });

    it('puts the first item anywhere, not mostly first', () => {
        const firsts = new Map<number, number>();
        for (let i = 0; i < 4000; i++) {
            const pos = shuffle([0, 1, 2, 3]).indexOf(0);
            firsts.set(pos, (firsts.get(pos) ?? 0) + 1);
        }
        for (const pos of [0, 1, 2, 3]) expect(firsts.get(pos)).toBeGreaterThan(800);
    });
});

describe('shuffleQuestion', () => {
    it('moves the correct index along with its option', () => {
        const q = { id: 'q', options: ['is', 'are', 'be', 'am'], correctIndex: 0 };
        for (let i = 0; i < 50; i++) {
            const s = shuffleQuestion(q);
            expect(s.options[s.correctIndex]).toBe('is');
            expect([...s.options].sort()).toEqual([...q.options].sort());
        }
    });
});
