import { grade, marksOf } from './grading';
import type { AssessmentQuestion, ExamLevel, ExamResponse } from './types';

/**
 * Adaptive placement test. The bank comes in blocks of five items of one level; the test
 * starts at A2 and looks for the boundary between the highest level the learner passes and
 * the level just above it, which it fails. Once both sides of that boundary have enough
 * items, the test stops and places the learner on the lower side.
 */
export interface PlacementBlock {
    id: string;
    level: ExamLevel;
    questions: AssessmentQuestion[];
}

export const PLACEMENT = {
    start: 'A2' as ExamLevel,
    /** Share of a level's marks that passes it. */
    passMark: 0.6,
    /** Items on each side of the boundary before it counts as settled. */
    settledItems: 10,
    minItems: 30,
    maxItems: 40,
    /** Margins that make a settled result clear: well above the pass mark below, well under it above. */
    clearPass: 0.7,
    clearFail: 0.4,
};

const LEVELS: ExamLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const above = (l: ExamLevel) => LEVELS[LEVELS.indexOf(l) + 1] as ExamLevel | undefined;
const below = (l: ExamLevel) => LEVELS[LEVELS.indexOf(l) - 1] as ExamLevel | undefined;

export interface LevelTally {
    earned: number;
    total: number;
}

/** Marks earned and available on each level's items (only levels seen). */
export function tallyByLevel(questions: AssessmentQuestion[], responses: Record<string, ExamResponse>): Partial<Record<ExamLevel, LevelTally>> {
    const out: Partial<Record<ExamLevel, LevelTally>> = {};
    for (const q of questions) {
        const t = (out[q.level] ??= { earned: 0, total: 0 });
        t.total += marksOf(q);
        t.earned += grade(q, responses[q.id]);
    }
    return out;
}

export type ConfidenceReason =
    /** Settled, with a clear margin on both sides of the boundary. */
    | 'clear'
    /** Settled, but close to the pass mark on one side. */
    | 'close'
    /** The test ended (time, items) before the boundary was settled. */
    | 'unfinished';

export interface PlacementStanding {
    level: ExamLevel;
    /** Lowest level failed; the learner is placed just under it (A1 when it is A1). */
    ceiling: ExamLevel | null;
    settled: boolean;
    reason: ConfidenceReason;
}

/** Where the answers so far place the learner, and how firmly. */
export function placementStanding(questions: AssessmentQuestion[], responses: Record<string, ExamResponse>): PlacementStanding {
    const tally = tallyByLevel(questions, responses);
    const ratio = (l: ExamLevel) => tally[l]!.earned / tally[l]!.total;
    const items = (l: ExamLevel | undefined) => (l && tally[l]?.total) || 0;
    const seen = LEVELS.filter(l => tally[l]);
    const passed = seen.filter(l => ratio(l) >= PLACEMENT.passMark);
    const ceiling = seen.find(l => ratio(l) < PLACEMENT.passMark) ?? null;

    let level: ExamLevel;
    let settled: boolean;
    let clear: boolean;
    if (!ceiling) {
        // Nothing failed: the highest level passed, settled once C1 itself is confirmed
        level = passed.at(-1) ?? 'A1';
        settled = level === 'C1' && items('C1') >= PLACEMENT.settledItems;
        clear = settled && ratio('C1') >= PLACEMENT.clearPass;
    } else if (ceiling === 'A1') {
        level = 'A1';
        settled = items('A1') >= PLACEMENT.settledItems;
        clear = ratio('A1') <= PLACEMENT.clearFail;
    } else {
        level = below(ceiling)!;
        settled = items(level) >= PLACEMENT.settledItems && items(ceiling) >= PLACEMENT.settledItems;
        clear = settled && ratio(level) >= PLACEMENT.clearPass && ratio(ceiling) <= PLACEMENT.clearFail;
    }
    // The test never climbs past a failed level, so no level above the ceiling is ever passed
    const reason: ConfidenceReason = !settled ? 'unfinished' : clear ? 'clear' : 'close';
    return { level, ceiling, settled, reason };
}

/**
 * The items that count when the time runs out: the unanswered ones of the block on screen
 * are left out, as the learner never got to them; counting them wrong would fail a level the
 * learner may have passed. Unanswered items of finished blocks still count as wrong.
 */
export function answeredWhenTimeIsUp(bank: PlacementBlock[], questions: AssessmentQuestion[], responses: Record<string, ExamResponse>): AssessmentQuestion[] {
    const last = questions.at(-1);
    const onScreen = new Set(bank.find(b => b.questions.some(q => q.id === last?.id))?.questions.map(q => q.id));
    return questions.filter(q => !onScreen.has(q.id) || responses[q.id] !== undefined);
}

/**
 * The next block to give, or null when the test is over: the boundary is settled and enough
 * items were answered (a beginner who clearly fails A1 stops early), the item limit is
 * reached, or the bank has nothing left where the boundary lies.
 */
export function nextPlacementBlock(bank: PlacementBlock[], seen: AssessmentQuestion[], responses: Record<string, ExamResponse>): PlacementBlock | null {
    if (seen.length >= PLACEMENT.maxItems) return null;
    const seenIds = new Set(seen.map(q => q.id));
    const unused = (level: ExamLevel) => bank.find(b => b.level === level && !b.questions.some(q => seenIds.has(q.id)));
    if (!seen.length) return unused(PLACEMENT.start) ?? null;

    const standing = placementStanding(seen, responses);
    if (standing.settled && (seen.length >= PLACEMENT.minItems || standing.ceiling === 'A1')) return null;

    const tally = tallyByLevel(seen, responses);
    const items = (l: ExamLevel) => tally[l]?.total ?? 0;
    let candidates: ExamLevel[];
    if (!standing.ceiling) {
        // Climb while nothing is failed; at the top, keep confirming C1
        candidates = [above(standing.level) ?? 'C1'];
    } else if (standing.ceiling === 'A1') {
        candidates = ['A1'];
    } else if (!items(standing.level)) {
        candidates = [standing.level];
    } else {
        // Both sides seen: firm up the one with fewer items (the upper one on a tie)
        const [low, high] = [standing.level, standing.ceiling];
        candidates = items(low) < items(high) ? [low, high] : [high, low];
    }
    for (const level of candidates) {
        const block = unused(level);
        if (block) return block;
    }
    return null;
}
