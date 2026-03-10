import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { createNewCard, calculateNextReview, Rating } from '../lib/fsrs';
import { CardState } from '../lib/db';
import type { CardRow, Profile } from '../lib/database.types';
import { offlineInsert, offlineUpdate } from '../lib/offlineMutation';

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

    const addCard = useCallback(async (wordId: string, storyId: string) => {
        if (!userId) return false;
        const exists = await isWordInDeck(wordId);
        if (exists) return false;

        const cardData = createNewCard(wordId, storyId);
        const insertPayload = {
            user_id: userId,
            word_id: wordId,
            story_id: storyId,
            state: cardData.state,
            due: cardData.due.toISOString(),
            stability: cardData.stability,
            difficulty: cardData.difficulty,
            elapsed_days: cardData.elapsedDays,
            scheduled_days: cardData.scheduledDays,
            reps: cardData.reps,
            lapses: cardData.lapses,
            last_review: null,
        };

        // Optimistic: increment card count
        qc.setQueryData(['cards', 'count', userId], (old: number | undefined) =>
            (old ?? 0) + 1,
        );

        // Optimistic: update profile word count
        qc.setQueryData(['profile', userId], (old: any) => {
            if (!old) return old;
            return { ...old, total_words_learned: (old.total_words_learned ?? 0) + 1 };
        });

        try {
            const executed = await offlineInsert('cards', insertPayload);
            if (executed) {
                // Also update profile word count on server
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('total_words_learned')
                    .eq('id', userId)
                    .single() as { data: Pick<Profile, 'total_words_learned'> | null };
                if (profile) {
                    await offlineUpdate('profiles', {
                        total_words_learned: profile.total_words_learned + 1,
                    }, { id: userId });
                }
            }
            qc.invalidateQueries({ queryKey: ['cards'] });
        } catch {
            // Revert optimistic updates on error
            qc.invalidateQueries({ queryKey: ['cards'] });
            qc.invalidateQueries({ queryKey: ['profile'] });
        }
        return true;
    }, [userId, isWordInDeck, qc]);

    const markAsKnown = useCallback(async (wordId: string) => {
        if (!userId) return false;
        const alreadyKnown = await isWordKnown(wordId);
        const alreadyInDeck = await isWordInDeck(wordId);
        if (alreadyKnown || alreadyInDeck) return false;

        // Optimistic: update profile word count
        qc.setQueryData(['profile', userId], (old: any) => {
            if (!old) return old;
            return { ...old, total_words_learned: (old.total_words_learned ?? 0) + 1 };
        });

        try {
            await offlineInsert('known_words', {
                user_id: userId,
                word_id: wordId,
                known_at: new Date().toISOString(),
            });

            if (navigator.onLine) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('total_words_learned')
                    .eq('id', userId)
                    .single() as { data: Pick<Profile, 'total_words_learned'> | null };
                if (profile) {
                    await offlineUpdate('profiles', {
                        total_words_learned: profile.total_words_learned + 1,
                    }, { id: userId });
                }
            }
            qc.invalidateQueries({ queryKey: ['profile'] });
        } catch {
            qc.invalidateQueries({ queryKey: ['profile'] });
        }
        return true;
    }, [userId, isWordInDeck, isWordKnown, qc]);

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
        addCard,
        markAsKnown,
        reviewCard,
    };
}
