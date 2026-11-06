import type { GrammarExercise } from './db';

/**
 * When a part of a unit asks to be done again. Below the pass mark, the learner first reads a short
 * review built from their own mistakes and then tries again. After the second try, the practice parts
 * let them go on (what failed stays in their review). The checkpoint is the unit's exam, so it asks
 * until it is passed.
 */
export type RetryPart = 'exercises' | 'writing' | 'speaking' | 'checkpoint';

/** Speaking asks a little less: speech recognition takes points even when the learner says it right. */
export const PASS_SCORE: Record<RetryPart, number> = { exercises: 75, writing: 75, speaking: 70, checkpoint: 80 };

/** Tries a practice part asks for before the learner may go on anyway. */
export const FORCED_ATTEMPTS = 2;

export type RetryVerdict = 'pass' | 'retry' | 'may-continue';

/**
 * `attempt` counts from 1. A null score (no AI evaluation left) passes: there is nothing to review.
 * Even a 0 lets a practice part go on after the second try: a microphone that doesn't understand the
 * learner, or an answer in Spanish, must never leave them stuck on the step.
 */
export function retryVerdict(part: RetryPart, score: number | null, attempt: number): RetryVerdict {
    if (score === null || score >= PASS_SCORE[part]) return 'pass';
    if (part === 'checkpoint' || attempt < FORCED_ATTEMPTS) return 'retry';
    return 'may-continue';
}

/** One thing to read again before retrying. */
export interface ReviewItem {
    /** The question or sentence it comes from. */
    prompt?: string;
    /** What the learner wrote or said. */
    wrong?: string;
    /** The right form. */
    right?: string;
    /** Why, in a sentence. */
    why: string;
}

/** Exercises answered wrong: the question, the right answer and its explanation. */
export function fromExercises(missed: GrammarExercise[]): ReviewItem[] {
    // A listening item asks with the very sentence it wants: it is shown once, as the answer
    return missed.map(e => ({ prompt: e.question === e.correctAnswer ? undefined : e.question, right: e.correctAnswer, why: e.explanation }));
}

/** A writing evaluation: its corrections, or the note of its weakest area when it has none. */
export function fromWriting(result: {
    corrections: { original: string; corrected: string; explanation: string }[];
    feedback: Record<string, { score: number; note: string }>;
}): ReviewItem[] {
    const items = result.corrections.map(c => ({ wrong: c.original, right: c.corrected, why: c.explanation }));
    if (items.length) return items;
    const weakest = Object.values(result.feedback).sort((a, b) => a.score - b.score)[0];
    return weakest?.note ? [{ why: weakest.note }] : [];
}

export const REVIEW_MAX = 4;

/** The review stays short: repeated mistakes once, and only the first few. */
export function shortReview(items: ReviewItem[], max = REVIEW_MAX): ReviewItem[] {
    const seen = new Set<string>();
    const out: ReviewItem[] = [];
    for (const item of items) {
        if (!item.why.trim() && !item.right) continue;
        const key = `${item.wrong ?? ''}|${item.right ?? ''}|${item.why}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(item);
        if (out.length === max) break;
    }
    return out;
}

/** How one prompt of a writing or speaking round went. */
export interface PromptResult {
    id: string;
    /** null when it could not be evaluated (free plan limit). */
    score: number | null;
    review: ReviewItem[];
}

export interface RoundOutcome {
    results: Record<string, PromptResult>;
    /** Average of every evaluated prompt so far, the retried ones with their new score. */
    score: number | null;
    verdict: RetryVerdict;
    /** Prompts under the pass mark: the only ones a retry asks for again. */
    failedIds: string[];
    review: ReviewItem[];
}

/** Adds a round's results to the earlier ones and says what comes next. */
export function settleRound(
    part: RetryPart,
    earlier: Record<string, PromptResult>,
    round: PromptResult[],
    attempt: number,
): RoundOutcome {
    const results = { ...earlier };
    // A retry the free plan could no longer evaluate keeps the score it had: running out of
    // evaluations never turns a failed prompt into a passed one
    for (const result of round) results[result.id] = result.score === null && earlier[result.id] ? earlier[result.id] : result;
    const scored = Object.values(results).filter((r): r is PromptResult & { score: number } => r.score !== null);
    const score = scored.length ? Math.round(scored.reduce((sum, r) => sum + r.score, 0) / scored.length) : null;
    const verdict = retryVerdict(part, score, attempt);
    const failed = scored.filter(r => r.score < PASS_SCORE[part]);
    return {
        results,
        score,
        verdict,
        failedIds: verdict === 'pass' ? [] : failed.map(r => r.id),
        review: verdict === 'pass' ? [] : shortReview(failed.flatMap(r => r.review)),
    };
}
