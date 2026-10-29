import { storyCoverage } from '../contentMetrics';
import type { EvalSample } from './samples';

/** Whether an evaluator's score falls in the sample's expected range (both ends included). */
export function checkScore(sample: EvalSample, score: number): { ok: boolean; detail: string } {
    const [min, max] = sample.expected;
    const ok = Number.isFinite(score) && score >= min && score <= max;
    return { ok, detail: `${score} (esperado ${min}–${max})` };
}

/**
 * Share of a reply's words a learner of the level would not know: above the level in the CEFR-J
 * list or not in it at all. Names don't count; `known` adds the app's own cards.
 */
export function aboveLevelShare(reply: string, level: string, index: Map<string, string>, known = new Set<string>()): number {
    return 1 - storyCoverage(reply, level, index, known).coverage;
}
