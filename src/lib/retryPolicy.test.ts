import { describe, expect, it } from 'vitest';
import { PASS_SCORE, fromWriting, retryVerdict, settleRound, shortReview } from './retryPolicy';

describe('retryVerdict', () => {
    it('passes at the mark of each part', () => {
        expect(retryVerdict('exercises', 75, 1)).toBe('pass');
        expect(retryVerdict('writing', 74, 1)).toBe('retry');
        expect(retryVerdict('speaking', 70, 1)).toBe('pass');
        expect(retryVerdict('checkpoint', 79, 1)).toBe('retry');
        expect(PASS_SCORE.checkpoint).toBe(80);
    });

    it('lets a practice part go on after the second try, never the checkpoint', () => {
        expect(retryVerdict('exercises', 60, 2)).toBe('may-continue');
        expect(retryVerdict('speaking', 40, 3)).toBe('may-continue');
        expect(retryVerdict('checkpoint', 60, 5)).toBe('retry');
    });

    it('asks again for nothing right only on the first try, and passes with no evaluation', () => {
        expect(retryVerdict('exercises', 0, 1)).toBe('retry');
        // A 0 never leaves a practice part stuck: after the second try the learner may go on
        expect(retryVerdict('speaking', 0, 2)).toBe('may-continue');
        expect(retryVerdict('writing', 0, 4)).toBe('may-continue');
        expect(retryVerdict('checkpoint', 0, 4)).toBe('retry');
        expect(retryVerdict('writing', null, 1)).toBe('pass');
    });
});

describe('shortReview', () => {
    it('drops repeats and empty items and keeps the first few', () => {
        const item = { wrong: 'he go', right: 'he goes', why: 'Tercera persona: -s' };
        const items = [item, { ...item }, { why: ' ' }, ...Array.from({ length: 6 }, (_, i) => ({ why: `regla ${i}` }))];
        const review = shortReview(items);
        expect(review).toHaveLength(4);
        expect(review[0]).toEqual(item);
        expect(review[1].why).toBe('regla 0');
    });
});

describe('settleRound', () => {
    const low = { id: 'a', score: 50, review: [{ wrong: 'I is', right: 'I am', why: 'Con I va am' }] };
    const high = { id: 'b', score: 90, review: [{ why: 'bien' }] };

    it('asks again only for the prompts under the mark, with their mistakes', () => {
        const outcome = settleRound('writing', {}, [low, high], 1);
        expect(outcome.score).toBe(70);
        expect(outcome.verdict).toBe('retry');
        expect(outcome.failedIds).toEqual(['a']);
        expect(outcome.review).toEqual(low.review);
    });

    it('scores a retried prompt with its new score', () => {
        const first = settleRound('writing', {}, [low, high], 1);
        const second = settleRound('writing', first.results, [{ ...low, score: 80 }], 2);
        expect(second.score).toBe(85);
        expect(second.verdict).toBe('pass');
        expect(second.failedIds).toEqual([]);
    });

    it('passes when nothing could be evaluated', () => {
        expect(settleRound('speaking', {}, [{ id: 'a', score: null, review: [] }], 1).verdict).toBe('pass');
    });
});

describe('fromWriting', () => {
    const feedback = { grammar: { score: 40, note: 'Revisa el verbo to be.' }, vocabulary: { score: 90, note: 'Bien.' } };

    it('reviews each correction, or the weakest area when there are none', () => {
        expect(fromWriting({ corrections: [{ original: 'I is', corrected: 'I am', explanation: 'Con I va am.' }], feedback }))
            .toEqual([{ wrong: 'I is', right: 'I am', why: 'Con I va am.' }]);
        expect(fromWriting({ corrections: [], feedback })).toEqual([{ why: 'Revisa el verbo to be.' }]);
    });
});
