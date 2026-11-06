import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { offlineInsert } from '../lib/offlineMutation';
import { enqueue, getPendingCount, getQueuedMutations } from '../lib/offlineQueue';
import { NOTE_MAX_LENGTH, QUOTE_MAX_LENGTH, type Note, type NoteContext } from '../lib/notes';

const COLUMNS = 'id, body, quote, context_key, context_label, context_path, created_at, updated_at';

export const notesKey = (userId: string | undefined) => ['notes', userId] as const;

export interface NoteInput {
    /** Present to edit that note; absent for a new one. */
    id?: string;
    body: string;
    quote?: string | null;
    context?: NoteContext | null;
}

type NoteWrite = Partial<Note> & { id: string; user_id: string; updated_at: string; deleted_at?: string };

/**
 * Every write is an upsert on the id, also a delete (it only sets `deleted_at`). While older writes
 * wait in the offline queue, a new one waits behind them, so they reach the server in order; the
 * server also keeps the newest by `updated_at`.
 */
async function writeNote(row: NoteWrite): Promise<void> {
    if (getPendingCount() > 0) {
        await enqueue({ table: 'notes', operation: 'insert', data: row, onConflict: 'id' });
        return;
    }
    await offlineInsert('notes', row, { onConflict: 'id' });
}

/** The notes from the server with this user's writes still waiting in the queue applied on top. */
export function withQueuedNotes(notes: Note[], userId: string): Note[] {
    const byId = new Map(notes.map(n => [n.id, n]));
    for (const mutation of getQueuedMutations()) {
        if (mutation.table !== 'notes' || mutation.operation !== 'insert') continue;
        const row = mutation.data as NoteWrite;
        if (row.user_id !== userId) continue;
        if (row.deleted_at) {
            byId.delete(row.id);
            continue;
        }
        // Fields a queued edit leaves out keep their value; a note only in the queue starts blank
        const { user_id: _owner, deleted_at: _deleted, ...fields } = row;
        const base: Note = byId.get(row.id) ?? {
            id: row.id, body: '', quote: null, context_key: null, context_label: null, context_path: null,
            created_at: row.updated_at, updated_at: row.updated_at,
        };
        byId.set(row.id, { ...base, ...fields });
    }
    return [...byId.values()].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

/**
 * The learner's notes. Saving and deleting show at once and work offline: they go through the
 * offline queue, and a note written offline keeps the id the device gave it.
 */
export function useNotes() {
    const { user } = useAuth();
    const userId = user?.id;
    const qc = useQueryClient();
    const key = useMemo(() => notesKey(userId), [userId]);

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notes')
                .select(COLUMNS)
                .is('deleted_at', null)
                .order('updated_at', { ascending: false })
                .limit(1000);
            if (error) throw error;
            return withQueuedNotes((data ?? []) as Note[], userId!);
        },
        enabled: !!userId,
    });

    /** Applies a change to the list at once; the returned function takes it back. */
    const optimistic = useCallback((update: (notes: Note[]) => Note[], id: string) => {
        const previous = qc.getQueryData<Note[]>(key);
        qc.setQueryData<Note[]>(key, current => update(current ?? []));
        return () => {
            // With no list loaded before, setting it back to undefined does nothing: drop the note instead
            if (previous) qc.setQueryData(key, previous);
            else qc.setQueryData<Note[]>(key, current => current?.filter(n => n.id !== id));
            void qc.invalidateQueries({ queryKey: key });
        };
    }, [qc, key]);

    const saveNote = useCallback(async (input: NoteInput): Promise<Note | null> => {
        if (!userId) return null;
        const body = input.body.trim().slice(0, NOTE_MAX_LENGTH);
        const quote = input.quote?.trim().slice(0, QUOTE_MAX_LENGTH) || null;
        if (!body && !quote) return null;

        const now = new Date().toISOString();
        let note: Note;
        let row: NoteWrite;
        if (input.id) {
            // An edit sends only what changes, so the place it was written in is never overwritten,
            // even when the list has not loaded yet
            const existing = query.data?.find(n => n.id === input.id);
            note = {
                context_key: null, context_label: null, context_path: null, created_at: now,
                ...existing, id: input.id, body, quote, updated_at: now,
            };
            row = { id: input.id, user_id: userId, body, quote, updated_at: now };
        } else {
            note = {
                id: crypto.randomUUID(),
                body,
                quote,
                context_key: input.context?.key ?? null,
                context_label: input.context?.label ?? null,
                context_path: input.context?.path ?? null,
                created_at: now,
                updated_at: now,
            };
            row = { ...note, user_id: userId };
        }

        const undo = optimistic(notes => [note, ...notes.filter(n => n.id !== note.id)], note.id);
        try {
            await writeNote(row);
            return note;
        } catch (error) {
            undo();
            throw error;
        }
    }, [userId, query.data, optimistic]);

    const deleteNote = useCallback(async (id: string): Promise<void> => {
        if (!userId) return;
        const undo = optimistic(notes => notes.filter(n => n.id !== id), id);
        const now = new Date().toISOString();
        try {
            await writeNote({ id, user_id: userId, deleted_at: now, updated_at: now });
        } catch (error) {
            undo();
            throw error;
        }
    }, [userId, optimistic]);

    return {
        notes: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        saveNote,
        deleteNote,
    };
}
