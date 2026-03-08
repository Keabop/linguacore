import { describe, it, expect } from 'vitest';
import { createNewCard, calculateNextReview, Rating } from './fsrs';
import { CardState, type Card } from './db';

function makeCard(overrides: Partial<Card> = {}): Card {
    return {
        id: 1,
        wordId: 'test-word',
        storyId: 'test-story',
        state: CardState.New,
        due: new Date(),
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        ...overrides,
    };
}

describe('createNewCard', () => {
    it('returns correct defaults', () => {
        const card = createNewCard('word1', 'story1');
        expect(card.wordId).toBe('word1');
        expect(card.storyId).toBe('story1');
        expect(card.state).toBe(CardState.New);
        expect(card.stability).toBe(0);
        expect(card.difficulty).toBe(0);
        expect(card.reps).toBe(0);
        expect(card.lapses).toBe(0);
        expect(card.due).toBeInstanceOf(Date);
    });
});

describe('calculateNextReview', () => {
    it('New + Good → Review, stability > 0, difficulty > 0', () => {
        const card = makeCard();
        const result = calculateNextReview(card, Rating.Good);

        expect(result.state).toBe(CardState.Review);
        expect(result.stability).toBeGreaterThan(0);
        expect(result.difficulty).toBeGreaterThan(0);
        expect(result.reps).toBe(1);
        expect(result.lapses).toBe(0);
    });

    it('New + Again → Learning, due is now (same session)', () => {
        const card = makeCard();
        const result = calculateNextReview(card, Rating.Again);

        expect(result.state).toBe(CardState.Learning);
        expect(result.scheduledDays).toBe(0);
        expect(result.lapses).toBe(1);
    });

    it('Review + Again → Relearning, lapses increments', () => {
        const card = makeCard({
            state: CardState.Review,
            stability: 5,
            difficulty: 5,
            reps: 3,
            lapses: 0,
            lastReview: new Date(Date.now() - 5 * 86400000),
        });
        const result = calculateNextReview(card, Rating.Again);

        expect(result.state).toBe(CardState.Relearning);
        expect(result.lapses).toBe(1);
    });

    it('Review + Easy → longer interval than Good', () => {
        const card = makeCard({
            state: CardState.Review,
            stability: 10,
            difficulty: 5,
            reps: 5,
            lastReview: new Date(Date.now() - 10 * 86400000),
        });

        const resultGood = calculateNextReview(card, Rating.Good);
        const resultEasy = calculateNextReview(card, Rating.Easy);

        expect(resultEasy.scheduledDays!).toBeGreaterThanOrEqual(resultGood.scheduledDays!);
    });

    it('difficulty stays between 1 and 10', () => {
        // Extreme case: many Easy ratings should not push difficulty below 1
        let card = makeCard();
        let result = calculateNextReview(card, Rating.Easy);
        expect(result.difficulty).toBeGreaterThanOrEqual(1);
        expect(result.difficulty).toBeLessThanOrEqual(10);

        // Extreme case: many Again ratings should not push difficulty above 10
        card = makeCard({
            state: CardState.Review,
            stability: 2,
            difficulty: 9.5,
            reps: 10,
            lastReview: new Date(Date.now() - 86400000),
        });
        result = calculateNextReview(card, Rating.Again);
        expect(result.difficulty).toBeGreaterThanOrEqual(1);
        expect(result.difficulty).toBeLessThanOrEqual(10);
    });

    it('interval does not exceed 365 days', () => {
        const card = makeCard({
            state: CardState.Review,
            stability: 500, // very high stability
            difficulty: 1,
            reps: 50,
            lastReview: new Date(Date.now() - 100 * 86400000),
        });
        const result = calculateNextReview(card, Rating.Easy);

        expect(result.scheduledDays).toBeLessThanOrEqual(365);
    });

    it('consecutive Good ratings increase stability monotonically', () => {
        let card = makeCard();
        let prevStability = 0;

        for (let i = 0; i < 5; i++) {
            const result = calculateNextReview(card, Rating.Good);
            expect(result.stability).toBeGreaterThan(prevStability);
            prevStability = result.stability!;

            card = makeCard({
                ...result,
                id: 1,
                wordId: 'test-word',
                storyId: 'test-story',
                reps: result.reps!,
                lapses: result.lapses!,
                state: result.state!,
                stability: result.stability!,
                difficulty: result.difficulty!,
                due: result.due!,
                scheduledDays: result.scheduledDays!,
                elapsedDays: result.scheduledDays!, // simulate waiting the full interval
                lastReview: new Date(Date.now() - result.scheduledDays! * 86400000),
            });
        }
    });
});
