import { useMemo } from 'react';
import { settleRound, type PromptResult, type RetryPart, type RoundOutcome } from '../lib/retryPolicy';
import { useSessionState } from './useSessionState';

interface RoundState {
    attempt: number;
    /** The prompts this round asks for; null for all of them. */
    ids: string[] | null;
    results: Record<string, PromptResult>;
    /** Set when a round ends under the pass mark: the review is showing. */
    outcome: RoundOutcome | null;
}

const FIRST_ROUND: RoundState = { attempt: 1, ids: null, results: {}, outcome: null };

/**
 * Writing and speaking in rounds: under the pass mark the learner reviews what failed and redoes
 * only those prompts; the score is the average of every prompt with its latest result. The rounds
 * survive a reload (`storageKey`), so the prompts already passed are not evaluated again.
 */
export function useRetryRounds<T extends { id: string }>(part: RetryPart, all: T[], onDone: (score: number | null) => void, storageKey: string) {
    const [state, setState, clear] = useSessionState<RoundState>(`voxie-rounds:${storageKey}:${part}`, FIRST_ROUND);
    const prompts = useMemo(() => (state.ids ? all.filter(p => state.ids!.includes(p.id)) : all), [all, state.ids]);

    const finish = (score: number | null) => {
        clear();
        onDone(score);
    };

    const finishRound = (round: PromptResult[]) => {
        const outcome = settleRound(part, state.results, round, state.attempt);
        if (outcome.verdict === 'pass') {
            finish(outcome.score);
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

    return { attempt: state.attempt, prompts, outcome: state.outcome, finishRound, retry, finish };
}
