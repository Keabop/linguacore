import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ rows: [] as unknown[], error: null as unknown }));
const offline = vi.hoisted(() => ({ insert: vi.fn(async () => true), update: vi.fn(async () => true) }));

vi.mock('../lib/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('../lib/offlineMutation', () => ({ offlineInsert: offline.insert, offlineUpdate: offline.update }));
vi.mock('../lib/supabase', () => {
    const chain = {
        select: () => chain,
        is: () => chain,
        order: () => chain,
        limit: async () => ({ data: db.rows, error: db.error }),
    };
    return { supabase: { from: () => chain } };
});

import { useNotes } from './useNotes';

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
        offline.update.mockReset().mockResolvedValue(true);
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
        expect(offline.update).toHaveBeenCalledWith('notes', expect.objectContaining({ deleted_at: expect.any(String) }), { id: 'old' });
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
});
