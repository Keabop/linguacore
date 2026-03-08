import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { createNewCard, calculateNextReview, Rating } from '../lib/fsrs';
import { CardState } from '../lib/db';
import type { CardRow, Profile } from '../lib/database.types';

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
        const { data } = await supabase
            .from('cards')
            .select('id')
            .eq('word_id', wordId)
            .limit(1);
        return (data?.length ?? 0) > 0;
    }, []);

    const isWordKnown = useCallback(async (wordId: string): Promise<boolean> => {
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

        await supabase.from('cards').insert({
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
        });

        // Update profile word count
        const { data: profile } = await supabase
            .from('profiles')
            .select('total_words_learned')
            .eq('id', userId)
            .single() as { data: Pick<Profile, 'total_words_learned'> | null };

        if (profile) {
            await supabase.from('profiles').update({
                total_words_learned: profile.total_words_learned + 1,
            }).eq('id', userId);
        }

        qc.invalidateQueries({ queryKey: ['cards'] });
        qc.invalidateQueries({ queryKey: ['profile'] });
        return true;
    }, [userId, isWordInDeck, qc]);

    const markAsKnown = useCallback(async (wordId: string) => {
        if (!userId) return false;
        const alreadyKnown = await isWordKnown(wordId);
        const alreadyInDeck = await isWordInDeck(wordId);
        if (alreadyKnown || alreadyInDeck) return false;

        await supabase.from('known_words').insert({
            user_id: userId,
            word_id: wordId,
            known_at: new Date().toISOString(),
        });

        // Update profile word count
        const { data: profile } = await supabase
            .from('profiles')
            .select('total_words_learned')
            .eq('id', userId)
            .single() as { data: Pick<Profile, 'total_words_learned'> | null };

        if (profile) {
            await supabase.from('profiles').update({
                total_words_learned: profile.total_words_learned + 1,
            }).eq('id', userId);
        }

        qc.invalidateQueries({ queryKey: ['profile'] });
        return true;
    }, [userId, isWordInDeck, isWordKnown, qc]);

    const reviewCard = useCallback(async (card: ReturnType<typeof rowToCard>, rating: Rating) => {
        if (!userId) return null;
        const updates = calculateNextReview(card as any, rating);

        await supabase.from('cards').update({
            state: updates.state,
            due: updates.due?.toISOString(),
            stability: updates.stability,
            difficulty: updates.difficulty,
            elapsed_days: updates.elapsedDays,
            scheduled_days: updates.scheduledDays,
            reps: updates.reps,
            lapses: updates.lapses,
            last_review: updates.lastReview?.toISOString(),
        }).eq('id', Number(card.id));

        // Update streak
        const today = new Date().toISOString().split('T')[0];
        const { data: profile } = await supabase
            .from('profiles')
            .select('streak, last_study_date')
            .eq('id', userId)
            .single() as { data: Pick<Profile, 'streak' | 'last_study_date'> | null };

        if (profile && profile.last_study_date !== today) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const newStreak = profile.last_study_date === yesterday ? profile.streak + 1 : 1;
            await supabase.from('profiles').update({
                streak: newStreak,
                last_study_date: today,
            }).eq('id', userId);
        }

        qc.invalidateQueries({ queryKey: ['cards'] });
        qc.invalidateQueries({ queryKey: ['profile'] });
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
