import { useMemo, useState } from 'react';
import { settleRound, type PromptResult, type RetryPart, type RoundOutcome } from '../lib/retryPolicy';

interface RoundState {
    attempt: number;
    /** The prompts this round asks for; null for all of them. */
    ids: string[] | null;
    results: Record<string, PromptResult>;
    /** Set when a round ends under the pass mark: the review is showing. */
    outcome: RoundOutcome | null;
}

/**
 * Writing and speaking in rounds: under the pass mark the learner reviews what failed and redoes
 * only those prompts; the score is the average of every prompt with its latest result.
 */
export function useRetryRounds<T extends { id: string }>(part: RetryPart, all: T[], onDone: (score: number | null) => void) {
    const [state, setState] = useState<RoundState>({ attempt: 1, ids: null, results: {}, outcome: null });
    const prompts = useMemo(() => (state.ids ? all.filter(p => state.ids!.includes(p.id)) : all), [all, state.ids]);

    const finishRound = (round: PromptResult[]) => {
        const outcome = settleRound(part, state.results, round, state.attempt);
        if (outcome.verdict === 'pass') {
            onDone(outcome.score);
            return;
        }
        setState(s => ({ ...s, results: outcome.results, outcome }));
    };

    const retry = () => setState(s => ({
        attempt: s.attempt + 1,
        ids: s.outcome?.failedIds.length ? s.outcome.failedIds : null,
        results: s.results,
        outcome: null,
    }));

    return { attempt: state.attempt, prompts, outcome: state.outcome, finishRound, retry };
}
