import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UnitProgressRow } from '../lib/database.types';

const db = vi.hoisted(() => ({ row: null as unknown }));
// The fake database keeps what is written, as Supabase would, so the refetch after a step sees it
const writes = vi.hoisted(() => ({
    offlineInsert: vi.fn(async (_table: string, data: Record<string, unknown>) => { db.row = { id: 1, ...data }; return true; }),
    offlineUpdate: vi.fn(async (_table: string, data: Record<string, unknown>) => { db.row = { ...(db.row as object), ...data }; return true; }),
}));

vi.mock('../lib/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('../lib/offlineMutation', () => writes);
vi.mock('../lib/supabase', () => ({
    supabase: { from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: db.row }) }) }) }) },
}));

import { determineStep, useUnitProgress } from './useUnitProgress';

const row = (over: Partial<UnitProgressRow> = {}): UnitProgressRow => ({
    id: 7, user_id: 'user-1', unit_id: 'a1-u1',
    grammar_card_read: false, story_completed: false, vocab_reviewed: false, exercises_score: 0,
    output_completed: false, checkpoint_passed: false, completed_at: null,
    ...over,
} as UnitProgressRow);

describe('determineStep', () => {
    it('goes through the unit in order: grammar, story, vocabulary, exercises, output, checkpoint', () => {
        expect(determineStep(null)).toBe('grammar');
        expect(determineStep(row({ grammar_card_read: true }))).toBe('story');
        expect(determineStep(row({ grammar_card_read: true, story_completed: true }))).toBe('vocab');
        expect(determineStep(row({ grammar_card_read: true, story_completed: true, vocab_reviewed: true }))).toBe('exercises');
        expect(determineStep(row({ grammar_card_read: true, story_completed: true, vocab_reviewed: true, exercises_score: 80 }))).toBe('output');
        expect(determineStep(row({ grammar_card_read: true, story_completed: true, vocab_reviewed: true, exercises_score: 80, output_completed: true }))).toBe('checkpoint');
        expect(determineStep(row({ grammar_card_read: true, story_completed: true, vocab_reviewed: true, exercises_score: 80, output_completed: true, checkpoint_passed: true }))).toBe('completed');
    });

    it('never skips a step, even if a later one is marked done', () => {
        expect(determineStep(row({ story_completed: true, vocab_reviewed: true, exercises_score: 90 }))).toBe('grammar');
    });
});

describe('useUnitProgress', () => {
    // One client per test: a new one on every render would forget the query
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

    beforeEach(() => {
        client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        writes.offlineInsert.mockClear();
        writes.offlineUpdate.mockClear();
    });

    it('creates the row on the first step, as an upsert so a retry does not duplicate it', async () => {
        db.row = null;
        const { result } = renderHook(() => useUnitProgress('a1-u1'), { wrapper });
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        await act(() => result.current.markStepComplete('grammar'));
        expect(writes.offlineInsert).toHaveBeenCalledWith(
            'unit_progress',
            expect.objectContaining({ user_id: 'user-1', unit_id: 'a1-u1', grammar_card_read: true, story_completed: false }),
            { onConflict: 'user_id,unit_id' },
        );
        await waitFor(() => expect(result.current.currentStep).toBe('story'));
    });

    it('updates only the finished step on an existing row', async () => {
        db.row = row({ grammar_card_read: true });
        const { result } = renderHook(() => useUnitProgress('a1-u1'), { wrapper });
        await waitFor(() => expect(result.current.currentStep).toBe('story'));
        await act(() => result.current.markStepComplete('story'));
        expect(writes.offlineUpdate).toHaveBeenCalledWith('unit_progress', { story_completed: true }, { id: 7 });
    });

    it('saves the exercise score and moves on to the output step', async () => {
        db.row = row({ grammar_card_read: true, story_completed: true, vocab_reviewed: true });
        const { result } = renderHook(() => useUnitProgress('a1-u1'), { wrapper });
        await waitFor(() => expect(result.current.currentStep).toBe('exercises'));
        await act(() => result.current.updateProgress({ exercises_score: 80 }));
        expect(writes.offlineUpdate).toHaveBeenCalledWith('unit_progress', { exercises_score: 80 }, { id: 7 });
        await waitFor(() => expect(result.current.currentStep).toBe('output'));
    });

    it('stamps the date when the checkpoint is passed', async () => {
        db.row = row({ grammar_card_read: true, story_completed: true, vocab_reviewed: true, exercises_score: 80, output_completed: true });
        const { result } = renderHook(() => useUnitProgress('a1-u1'), { wrapper });
        await waitFor(() => expect(result.current.currentStep).toBe('checkpoint'));
        await act(() => result.current.markStepComplete('checkpoint'));
        const [, data] = writes.offlineUpdate.mock.calls[0] as unknown as [string, Record<string, unknown>];
        expect(data.checkpoint_passed).toBe(true);
        expect(typeof data.completed_at).toBe('string');
    });
});
