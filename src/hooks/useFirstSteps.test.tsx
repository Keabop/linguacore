import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firstStepsLessons, FIRST_STEPS_UNIT } from '../data/firstSteps';

const mocks = vi.hoisted(() => ({
    insert: vi.fn(async () => true),
    enqueue: vi.fn(async () => {}),
    record: vi.fn(async () => {}),
}));
vi.mock('../lib/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('../lib/offlineMutation', () => ({ offlineInsert: mocks.insert }));
vi.mock('../lib/offlineQueue', () => ({ enqueue: mocks.enqueue }));
vi.mock('./useRecordActivity', () => ({ useRecordActivity: () => mocks.record }));
vi.mock('../lib/supabase', () => {
    const chain = { select: () => chain, eq: () => chain, maybeSingle: async () => ({ data: null }) };
    return { supabase: { from: () => chain } };
});

import { useFirstSteps } from './useFirstSteps';

function setup() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    return renderHook(() => useFirstSteps(), { wrapper });
}

describe('useFirstSteps', () => {
    beforeEach(() => {
        localStorage.clear();
        mocks.insert.mockReset().mockResolvedValue(true);
        mocks.enqueue.mockReset().mockResolvedValue(undefined);
        mocks.record.mockReset().mockResolvedValue(undefined);
    });

    it('counts every lesson for the streak and the daily goal', async () => {
        const { result } = setup();
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        await act(() => result.current.completeLesson(firstStepsLessons[0].id));
        expect(mocks.record).toHaveBeenCalledWith('unit_step');
        expect(result.current.done).toEqual([firstStepsLessons[0].id]);
        expect(mocks.insert).not.toHaveBeenCalled();
    });

    it('saves the unit 0 once every lesson is done', async () => {
        const { result } = setup();
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        for (const lesson of firstStepsLessons) await act(() => result.current.completeLesson(lesson.id));
        expect(mocks.insert).toHaveBeenCalledWith('unit_progress', expect.objectContaining({ unit_id: FIRST_STEPS_UNIT, completed_at: expect.any(String) }), { onConflict: 'user_id,unit_id' });
        expect(result.current.finished).toBe(true);
    });

    it('never throws when the save is refused: it waits in the queue', async () => {
        mocks.insert.mockRejectedValue(new Error('JWT expired'));
        const { result } = setup();
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        for (const lesson of firstStepsLessons) await act(() => result.current.completeLesson(lesson.id));
        expect(mocks.enqueue).toHaveBeenCalledWith(expect.objectContaining({ table: 'unit_progress', onConflict: 'user_id,unit_id' }));
        expect(result.current.finished).toBe(true);
    });
});
