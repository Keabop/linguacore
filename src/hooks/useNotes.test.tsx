import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ rows: [] as unknown[], error: null as unknown }));
const offline = vi.hoisted(() => ({ insert: vi.fn(async () => true) }));
const queue = vi.hoisted(() => ({ pending: [] as { table: string; operation: string; data: Record<string, unknown> }[], enqueue: vi.fn(async () => {}) }));

vi.mock('../lib/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('../lib/offlineMutation', () => ({ offlineInsert: offline.insert }));
vi.mock('../lib/offlineQueue', () => ({
    enqueue: queue.enqueue,
    getPendingCount: () => queue.pending.length,
    getQueuedMutations: () => queue.pending,
}));
vi.mock('../lib/supabase', () => {
    const chain = {
        select: () => chain,
        is: () => chain,
        order: () => chain,
        limit: async () => ({ data: db.rows, error: db.error }),
    };
    return { supabase: { from: () => chain } };
});

import { useNotes, withQueuedNotes } from './useNotes';

const stored = {
    id: 'old', body: 'Antes', quote: null, context_key: 'page:/chat', context_label: 'Tutor IA', context_path: '/chat',
    created_at: '2026-11-01T00:00:00Z', updated_at: '2026-11-01T00:00:00Z',
};

function setup() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    return renderHook(() => useNotes(), { wrapper });
}

describe('useNotes', () => {
    beforeEach(() => {
        db.rows = [stored];
        db.error = null;
        offline.insert.mockReset().mockResolvedValue(true);
        queue.pending = [];
        queue.enqueue.mockReset().mockResolvedValue(undefined);
    });

    it('saves a new note with the place it was written in, shown at once', async () => {
        const { result } = setup();
        await waitFor(() => expect(result.current.notes).toHaveLength(1));
        const context = { key: 'unit:a1-u2', label: 'Unidad 2', path: '/path/a1-u2' };
        await act(() => result.current.saveNote({ body: '  a + consonante  ', quote: 'a book', context }));

        await waitFor(() => expect(result.current.notes[0]).toMatchObject({ body: 'a + consonante', quote: 'a book', context_key: 'unit:a1-u2', context_label: 'Unidad 2' }));
        expect(offline.insert).toHaveBeenCalledWith(
            'notes',
            expect.objectContaining({ user_id: 'user-1', body: 'a + consonante', context_path: '/path/a1-u2' }),
            { onConflict: 'id' },
        );
    });

    it('edits a note in place, keeping its id and place', async () => {
        const { result } = setup();
        await waitFor(() => expect(result.current.notes).toHaveLength(1));
        await act(() => result.current.saveNote({ id: 'old', body: 'Después', context: { key: 'x', label: 'X', path: '/x' } }));

        await waitFor(() => expect(result.current.notes[0]).toMatchObject({ id: 'old', body: 'Después', context_key: 'page:/chat' }));
        expect(result.current.notes).toHaveLength(1);
        // Only what changes is sent: the place it was written in is never overwritten
        expect(offline.insert).toHaveBeenCalledWith('notes', { id: 'old', user_id: 'user-1', body: 'Después', quote: null, updated_at: expect.any(String) }, { onConflict: 'id' });
    });

    it('does not save an empty note', async () => {
        const { result } = setup();
        await waitFor(() => expect(result.current.notes).toHaveLength(1));
        expect(await result.current.saveNote({ body: '   ' })).toBeNull();
        expect(offline.insert).not.toHaveBeenCalled();
    });

    it('marks a note deleted and takes it off the list', async () => {
        const { result } = setup();
        await waitFor(() => expect(result.current.notes).toHaveLength(1));
        await act(() => result.current.deleteNote('old'));

        await waitFor(() => expect(result.current.notes).toHaveLength(0));
        // A delete is an upsert too, so it lands right whatever order the queue replays writes in
        expect(offline.insert).toHaveBeenCalledWith('notes', { id: 'old', user_id: 'user-1', deleted_at: expect.any(String), updated_at: expect.any(String) }, { onConflict: 'id' });
    });

    it('puts the list back when saving fails', async () => {
        offline.insert.mockRejectedValueOnce(new Error('denied'));
        const { result } = setup();
        await waitFor(() => expect(result.current.notes).toHaveLength(1));
        await act(async () => {
            await expect(result.current.saveNote({ body: 'nueva' })).rejects.toThrow('denied');
        });
        await waitFor(() => expect(result.current.notes.map(n => n.id)).toEqual(['old']));
    });

    it('waits behind older writes still in the queue', async () => {
        queue.pending = [{ table: 'error_cards', operation: 'insert', data: {} }];
        const { result } = setup();
        await waitFor(() => expect(result.current.notes).toHaveLength(1));
        await act(() => result.current.saveNote({ body: 'después de la cola' }));
        expect(offline.insert).not.toHaveBeenCalled();
        expect(queue.enqueue).toHaveBeenCalledWith({ table: 'notes', operation: 'insert', data: expect.objectContaining({ body: 'después de la cola' }), onConflict: 'id' });
    });

    it('leaves no ghost note when the first save fails before the list loaded', async () => {
        db.error = new Error('offline');
        offline.insert.mockRejectedValueOnce(new Error('denied'));
        const { result } = setup();
        await waitFor(() => expect(result.current.isError).toBe(true));
        await act(async () => {
            await expect(result.current.saveNote({ body: 'fantasma' })).rejects.toThrow('denied');
        });
        await waitFor(() => expect(result.current.notes.some(n => n.body === 'fantasma')).toBe(false));
    });
});

describe('withQueuedNotes', () => {
    beforeEach(() => { queue.pending = []; });

    it('shows writes still waiting to sync on top of the server notes', () => {
        queue.pending = [
            { table: 'notes', operation: 'insert', data: { id: 'new', user_id: 'user-1', body: 'sin red', quote: null, updated_at: '2026-11-06T00:00:00Z', context_label: 'Tutor IA' } },
            { table: 'notes', operation: 'insert', data: { id: 'old', user_id: 'user-1', body: 'editada', updated_at: '2026-11-05T00:00:00Z' } },
            { table: 'notes', operation: 'insert', data: { id: 'other', user_id: 'someone-else', body: 'ajena', updated_at: '2026-11-07T00:00:00Z' } },
        ];
        const notes = withQueuedNotes([stored], 'user-1');
        expect(notes.map(n => [n.id, n.body])).toEqual([['new', 'sin red'], ['old', 'editada']]);
        expect(notes[1].context_label).toBe('Tutor IA');
        expect(notes[0]).not.toHaveProperty('user_id');
    });

    it('drops a note whose delete is still waiting', () => {
        queue.pending = [{ table: 'notes', operation: 'insert', data: { id: 'old', user_id: 'user-1', deleted_at: '2026-11-06T00:00:00Z', updated_at: '2026-11-06T00:00:00Z' } }];
        expect(withQueuedNotes([stored], 'user-1')).toEqual([]);
    });
});
