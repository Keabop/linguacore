import { describe, expect, it } from 'vitest';
import { PLACEMENT, answeredWhenTimeIsUp, nextPlacementBlock, placementStanding, tallyByLevel, type PlacementBlock } from './placement';
import type { AssessmentQuestion, ExamLevel, ExamResponse } from './types';

const LEVELS: ExamLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

// Three blocks of five per level; option 0 is always right
const bank: PlacementBlock[] = LEVELS.flatMap(level => [1, 2, 3].map(n => ({
    id: `${level}-${n}`,
    level,
    questions: [1, 2, 3, 4, 5].map(i => ({
        id: `${level}-${n}-${i}`, section: 'use-of-english' as const, level, text: `${level} ${n} ${i}`, options: ['a', 'b'], correctIndex: 0,
    })),
})));

/**
 * Runs the whole test for a learner who gets `right(level, blockNumber)` items right in each
 * block. Returns the levels of the blocks given, in order, and the questions seen.
 */
function run(right: (level: ExamLevel, nth: number) => number) {
    const seen: AssessmentQuestion[] = [];
    const responses: Record<string, ExamResponse> = {};
    const path: ExamLevel[] = [];
    for (let block = nextPlacementBlock(bank, seen, responses); block; block = nextPlacementBlock(bank, seen, responses)) {
        const nth = path.filter(l => l === block!.level).length;
        const k = right(block.level, nth);
        block.questions.forEach((q, i) => { responses[q.id] = i < k ? 0 : 1; });
        seen.push(...block.questions);
        path.push(block.level);
    }
    return { path, seen, standing: placementStanding(seen, responses) };
}

/** A learner who knows everything up to `level` (5 of 5) and nothing above it (1 of 5). */
const learner = (level: ExamLevel) => (l: ExamLevel) => (LEVELS.indexOf(l) <= LEVELS.indexOf(level) ? 5 : 1);

describe('adaptive placement', () => {
    it('starts at A2', () => {
        expect(nextPlacementBlock(bank, [], {})?.level).toBe('A2');
    });

    it('places a clear learner of each level, with high confidence, in 30 to 40 items', () => {
        for (const level of ['A2', 'B1', 'B2', 'C1'] as ExamLevel[]) {
            const { seen, standing } = run(learner(level));
            expect(standing.level, level).toBe(level);
            expect(standing.reason, level).toBe('clear');
            expect(seen.length, level).toBeGreaterThanOrEqual(PLACEMENT.minItems);
            expect(seen.length, level).toBeLessThanOrEqual(PLACEMENT.maxItems);
        }
    });

    it('climbs one level per block until it fails one, then firms up the boundary', () => {
        expect(run(learner('B1')).path).toEqual(['A2', 'B1', 'B2', 'B2', 'B1', 'B2']);
    });

    it('lets a beginner who clearly fails A1 stop early', () => {
        const { path, standing } = run(() => 1);
        expect(path).toEqual(['A2', 'A1', 'A1']);
        expect(standing).toMatchObject({ level: 'A1', ceiling: 'A1', reason: 'clear' });
    });

    it('recovers from one bad block instead of placing on it', () => {
        // A B2 learner who has a bad first B1 block
        const { standing } = run((l, nth) => (l === 'B1' && nth === 0 ? 2 : learner('B2')(l)));
        expect(standing.level).toBe('B2');
    });

    it('says the result is close when a side of the boundary is near the pass mark', () => {
        // B1 passed with 3 of 5 in each block: 60%, just on the pass mark
        const { standing } = run(l => (l === 'B1' ? 3 : learner('B1')(l)));
        expect(standing).toMatchObject({ level: 'B1', reason: 'close' });
    });

    it('never gives more than the item limit', () => {
        // Always on the pass mark's edge: the boundary keeps moving
        const { seen } = run((_, nth) => (nth % 2 ? 2 : 4));
        expect(seen.length).toBeLessThanOrEqual(PLACEMENT.maxItems);
    });

    it('calls a test cut short (time ran out) unfinished', () => {
        const seen = bank[3].questions; // one A2 block
        const responses = Object.fromEntries(seen.map(q => [q.id, 0]));
        expect(placementStanding(seen, responses)).toMatchObject({ level: 'A2', settled: false, reason: 'unfinished' });
    });

    it('leaves out the unanswered items of the block on screen when the time runs out', () => {
        // B1 5 of 5 and B2 4 of 5; the time runs out on a second B2 block after one right answer
        const seen = [...bank[6].questions, ...bank[9].questions, ...bank[10].questions];
        const responses: Record<string, ExamResponse> = Object.fromEntries([...bank[6].questions, ...bank[9].questions.slice(0, 4)].map(q => [q.id, 0]));
        responses[bank[9].questions[4].id] = 1;
        responses[bank[10].questions[0].id] = 0;
        expect(answeredWhenTimeIsUp(bank, seen, responses)).toHaveLength(11);
        expect(placementStanding(answeredWhenTimeIsUp(bank, seen, responses), responses).level).toBe('B2');
        expect(placementStanding(seen, responses).level).toBe('B1');
    });

    it('counts unanswered items as wrong', () => {
        expect(tallyByLevel(bank[0].questions, { 'A1-1-1': 0 })).toEqual({ A1: { earned: 1, total: 5 } });
    });
});
