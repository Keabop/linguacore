import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { calculateNextReview, Rating } from '../lib/fsrs';
import { CardState } from '../lib/db';
import type { ErrorCard } from '../lib/db';
import type { ErrorCardRow } from '../lib/database.types';
import { offlineInsert, offlineUpdate } from '../lib/offlineMutation';

function rowToErrorCard(row: ErrorCardRow): ErrorCard {
    return {
        id: String(row.id),
        errorPattern: row.error_pattern,
        originalSentence: row.original_sentence,
        correctedSentence: row.corrected_sentence,
        explanation: row.explanation,
        errorType: row.error_type,
        source: row.source,
        exampleVariants: (row.example_variants || []) as string[],
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

export interface CorrectionInput {
    original: string;
    corrected: string;
    explanation: string;
    type?: 'grammar' | 'vocabulary' | 'spelling' | 'style';
}

export function useErrorCards() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const userId = user?.id;

    const { data: dueErrorCardsRaw } = useQuery({
        queryKey: ['error-cards', 'due', userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('error_cards')
                .select('*')
                .lte('due', new Date().toISOString());
            return ((data ?? []) as ErrorCardRow[]).map(rowToErrorCard);
        },
        enabled: !!userId,
    });

    const { data: totalErrorCards } = useQuery({
        queryKey: ['error-cards', 'count', userId],
        queryFn: async () => {
            const { count } = await supabase
                .from('error_cards')
                .select('*', { count: 'exact', head: true });
            return count ?? 0;
        },
        enabled: !!userId,
    });

    const addErrorCard = useCallback(async (
        correction: CorrectionInput,
        source: 'tutor' | 'writing' | 'unit',
        exampleVariants: string[] = [],
    ): Promise<boolean> => {
        if (!userId) return false;

        const pattern = `${correction.original} → ${correction.corrected}`.slice(0, 200);

        // Deduplication
        const { data: existing } = await supabase
            .from('error_cards')
            .select('id, stability, reps')
            .eq('error_pattern', pattern)
            .limit(1);

        if (existing && existing.length > 0) {
            const card = existing[0];
            if (card.stability > 1) {
                await offlineUpdate('error_cards', {
                    stability: Math.max(0.5, card.stability * 0.5),
                    due: new Date().toISOString(),
                }, { id: card.id });
                qc.invalidateQueries({ queryKey: ['error-cards'] });
            }
            return false;
        }

        try {
            await offlineInsert('error_cards', {
                user_id: userId,
                error_pattern: pattern,
                original_sentence: correction.original,
                corrected_sentence: correction.corrected,
                explanation: correction.explanation,
                error_type: correction.type || 'grammar',
                source,
                example_variants: exampleVariants,
                state: CardState.New,
                due: new Date().toISOString(),
                stability: 0,
                difficulty: 0,
                elapsed_days: 0,
                scheduled_days: 0,
                reps: 0,
                lapses: 0,
                last_review: null,
            });
            qc.invalidateQueries({ queryKey: ['error-cards'] });
            return true;
        } catch {
            return false;
        }
    }, [userId, qc]);

    const reviewErrorCard = useCallback(async (card: ErrorCard, rating: Rating) => {
        if (!userId) return null;

        const cardForFSRS = {
            ...card,
            wordId: card.errorPattern,
            storyId: card.source,
        };
        const updates = calculateNextReview(cardForFSRS as any, rating);

        qc.setQueryData(
            ['error-cards', 'due', userId],
            (old: ErrorCard[] | undefined) => {
                if (!old) return old;
                const now = new Date();
                return old
                    .map(c => c.id === card.id ? { ...c, ...updates } : c)
                    .filter(c => c.due <= now);
            },
        );

        try {
            await offlineUpdate('error_cards', {
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
        } catch {
            qc.invalidateQueries({ queryKey: ['error-cards'] });
        }

        return updates;
    }, [userId, qc]);

    return {
        dueErrorCards: dueErrorCardsRaw ?? [],
        totalErrorCards: totalErrorCards ?? 0,
        addErrorCard,
        reviewErrorCard,
    };
}
