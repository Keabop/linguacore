import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { createNewCard, calculateNextReview, Rating } from '../lib/fsrs';
import { CardState } from '../lib/db';
import type { CardRow, Profile } from '../lib/database.types';
import { offlineInsertMany, offlineUpdate } from '../lib/offlineMutation';

// Convert Supabase row to the shape FSRS expects
function rowToCard(row: CardRow) {
    return {
        id: String(row.id),
        wordId: row.word_id,
        storyId: row.story_id,
        state: row.state as CardState,
        due: new Date(row.due),
        stability: row.stability,
        difficulty: row.difficulty,
        elapsedDays: row.elapsed_days,
        scheduledDays: row.scheduled_days,
        reps: row.reps,
        lapses: row.lapses,
        lastReview: row.last_review ? new Date(row.last_review) : undefined,
    };
}

export function useCards() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const userId = user?.id;

    const { data: dueCardsRaw } = useQuery({
        queryKey: ['cards', 'due', userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('cards')
                .select('*')
                .lte('due', new Date().toISOString());
            return ((data ?? []) as CardRow[]).map(rowToCard);
        },
        enabled: !!userId,
    });

    const { data: totalCards } = useQuery({
        queryKey: ['cards', 'count', userId],
        queryFn: async () => {
            const { count } = await supabase
                .from('cards')
                .select('*', { count: 'exact', head: true });
            return count ?? 0;
        },
        enabled: !!userId,
    });

    const isWordInDeck = useCallback(async (wordId: string): Promise<boolean> => {
        // Check cache first for offline support
        const cachedDue = qc.getQueryData<ReturnType<typeof rowToCard>[]>(['cards', 'due', userId]);
        if (cachedDue?.some(c => c.wordId === wordId)) return true;

        if (!navigator.onLine) return false;
        const { data } = await supabase
            .from('cards')
            .select('id')
            .eq('word_id', wordId)
            .limit(1);
        return (data?.length ?? 0) > 0;
    }, [userId, qc]);

    const isWordKnown = useCallback(async (wordId: string): Promise<boolean> => {
        if (!navigator.onLine) return false;
        const { data } = await supabase
            .from('known_words')
            .select('word_id')
            .eq('word_id', wordId)
            .limit(1);
        return (data?.length ?? 0) > 0;
    }, []);

    /**
     * Saves the words of a finished story in one write per table: new cards for the words
     * added to the deck, and the words the learner already knew. A word already saved is
     * skipped by the database (unique on user and word), so a retry can't fail on it.
     */
    const saveStoryWords = useCallback(async (storyId: string, deckIds: string[], knownIds: string[]) => {
        if (!userId) return 0;
        const now = new Date().toISOString();
        const cards = deckIds.map(wordId => {
            const card = createNewCard(wordId, storyId);
            return {
                user_id: userId,
                word_id: wordId,
                story_id: storyId,
                state: card.state,
                due: card.due.toISOString(),
                stability: card.stability,
                difficulty: card.difficulty,
                elapsed_days: card.elapsedDays,
                scheduled_days: card.scheduledDays,
                reps: card.reps,
                lapses: card.lapses,
                last_review: null,
            };
        });
        const known = knownIds.map(wordId => ({ user_id: userId, word_id: wordId, known_at: now }));
        const added = cards.length + known.length;
        if (!added) return 0;

        const skipSaved = { onConflict: 'user_id,word_id', ignoreDuplicates: true };
        if (cards.length) await offlineInsertMany('cards', cards, skipSaved);
        if (known.length) await offlineInsertMany('known_words', known, skipSaved);

        // Offline, the cached profile is the base, and the update waits in the queue
        const cached = qc.getQueryData<Pick<Profile, 'total_words_learned'>>(['profile', userId]);
        const { data: fresh } = navigator.onLine
            ? await supabase.from('profiles').select('total_words_learned').eq('id', userId).single() as { data: Pick<Profile, 'total_words_learned'> | null }
            : { data: null };
        const base = (fresh ?? cached)?.total_words_learned;
        if (base !== undefined) {
            await offlineUpdate('profiles', { total_words_learned: base + added }, { id: userId });
        }
        qc.invalidateQueries({ queryKey: ['cards'] });
        qc.invalidateQueries({ queryKey: ['profile'] });
        return added;
    }, [userId, qc]);

    const reviewCard = useCallback(async (card: ReturnType<typeof rowToCard>, rating: Rating) => {
        if (!userId) return null;
        const updates = calculateNextReview(card as any, rating);

        // 1. Optimistically update the due cards cache
        qc.setQueryData(
            ['cards', 'due', userId],
            (old: ReturnType<typeof rowToCard>[] | undefined) => {
                if (!old) return old;
                const now = new Date();
                return old.map(c =>
                    c.id === card.id ? { ...c, ...updates } : c,
                ).filter(c => c.due <= now);
            },
        );

        // 2. Optimistically update profile streak
        const today = new Date().toISOString().split('T')[0];
        const cachedProfile = qc.getQueryData<any>(['profile', userId]);
        if (cachedProfile && cachedProfile.last_study_date !== today) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const newStreak = cachedProfile.last_study_date === yesterday
                ? cachedProfile.streak + 1 : 1;
            qc.setQueryData(['profile', userId], {
                ...cachedProfile,
                streak: newStreak,
                last_study_date: today,
            });
        }

        // 3. Execute or queue the Supabase mutations
        try {
            await offlineUpdate('cards', {
                state: updates.state,
                due: updates.due?.toISOString(),
                stability: updates.stability,
                difficulty: updates.difficulty,
                elapsed_days: updates.elapsedDays,
                scheduled_days: updates.scheduledDays,
                reps: updates.reps,
                lapses: updates.lapses,
                last_review: updates.lastReview?.toISOString(),
            }, { id: Number(card.id) });

            // Streak update
            if (cachedProfile && cachedProfile.last_study_date !== today) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                const newStreak = cachedProfile.last_study_date === yesterday
                    ? cachedProfile.streak + 1 : 1;
                await offlineUpdate('profiles', {
                    streak: newStreak,
                    last_study_date: today,
                }, { id: userId });
            }
        } catch {
            // Revert optimistic updates on error
            qc.invalidateQueries({ queryKey: ['cards'] });
            qc.invalidateQueries({ queryKey: ['profile'] });
        }

        return updates;
    }, [userId, qc]);

    return {
        dueCards: dueCardsRaw ?? [],
        totalCards: totalCards ?? 0,
        isWordInDeck,
        isWordKnown,
        saveStoryWords,
        reviewCard,
    };
}
