import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { offlineInsert, offlineUpdate } from '../lib/offlineMutation';
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

/**
 * The learner's notes. Saving and deleting show at once and work offline: they go through the
 * offline queue, and a note written offline keeps the id the device gave it.
 */
export function useNotes() {
    const { user } = useAuth();
    const userId = user?.id;
    const qc = useQueryClient();

    const query = useQuery({
        queryKey: notesKey(userId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notes')
                .select(COLUMNS)
                .is('deleted_at', null)
                .order('updated_at', { ascending: false })
                .limit(1000);
            if (error) throw error;
            return (data ?? []) as Note[];
        },
        enabled: !!userId,
    });

    const setNotes = useCallback(
        (update: (notes: Note[]) => Note[]) => qc.setQueryData<Note[]>(notesKey(userId), current => update(current ?? [])),
        [qc, userId],
    );

    const saveNote = useCallback(async (input: NoteInput): Promise<Note | null> => {
        if (!userId) return null;
        const body = input.body.trim().slice(0, NOTE_MAX_LENGTH);
        const quote = input.quote?.trim().slice(0, QUOTE_MAX_LENGTH) || null;
        if (!body && !quote) return null;

        const now = new Date().toISOString();
        const existing = input.id ? query.data?.find(n => n.id === input.id) : undefined;
        const note: Note = existing
            ? { ...existing, body, quote, updated_at: now }
            : {
                id: crypto.randomUUID(),
                body,
                quote,
                context_key: input.context?.key ?? null,
                context_label: input.context?.label ?? null,
                context_path: input.context?.path ?? null,
                created_at: now,
                updated_at: now,
            };

        const previous = qc.getQueryData<Note[]>(notesKey(userId));
        setNotes(notes => [note, ...notes.filter(n => n.id !== note.id)]);
        try {
            // An upsert on the id: the same call creates the note or saves an edit, also from the queue
            await offlineInsert('notes', { ...note, user_id: userId }, { onConflict: 'id' });
            return note;
        } catch (error) {
            qc.setQueryData(notesKey(userId), previous);
            throw error;
        }
    }, [userId, query.data, qc, setNotes]);

    const deleteNote = useCallback(async (id: string): Promise<void> => {
        if (!userId) return;
        const previous = qc.getQueryData<Note[]>(notesKey(userId));
        setNotes(notes => notes.filter(n => n.id !== id));
        const now = new Date().toISOString();
        try {
            await offlineUpdate('notes', { deleted_at: now, updated_at: now }, { id });
        } catch (error) {
            qc.setQueryData(notesKey(userId), previous);
            throw error;
        }
    }, [userId, qc, setNotes]);

    return {
        notes: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        saveNote,
        deleteNote,
    };
}
