import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { calculateNextReview, Rating } from '../lib/fsrs';
import { CardState } from '../lib/db';
import type { SkillCard } from '../lib/db';
import type { SkillCardRow } from '../lib/database.types';
import { offlineInsert, offlineUpdate } from '../lib/offlineMutation';
import { getSkillsByUnit } from '../data';

const STABLE_THRESHOLD = 10;

function rowToSkillCard(row: SkillCardRow): SkillCard {
    return {
        id: String(row.id),
        skillId: row.skill_id,
        unitId: row.unit_id,
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

export type ReviewDepth = 'mini_quiz' | 'deep_review';

export function getReviewDepth(card: SkillCard): ReviewDepth {
    if (card.state === CardState.Review && card.stability > STABLE_THRESHOLD) {
        return 'mini_quiz';
    }
    return 'deep_review';
}

export function useSkillCards() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const userId = user?.id;

    const { data: dueSkillCardsRaw } = useQuery({
        queryKey: ['skill-cards', 'due', userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('skill_cards')
                .select('*')
                .lte('due', new Date().toISOString());
            return ((data ?? []) as SkillCardRow[]).map(rowToSkillCard);
        },
        enabled: !!userId,
    });

    const { data: totalSkillCards } = useQuery({
        queryKey: ['skill-cards', 'count', userId],
        queryFn: async () => {
            const { count } = await supabase
                .from('skill_cards')
                .select('*', { count: 'exact', head: true });
            return count ?? 0;
        },
        enabled: !!userId,
    });

    const getSkillCardsByUnit = useCallback(async (unitId: string): Promise<SkillCard[]> => {
        if (!userId) return [];
        const { data } = await supabase
            .from('skill_cards')
            .select('*')
            .eq('unit_id', unitId);
        return ((data ?? []) as SkillCardRow[]).map(rowToSkillCard);
    }, [userId]);

    const addSkillCards = useCallback(async (unitId: string) => {
        if (!userId) return 0;

        const skills = getSkillsByUnit(unitId);
        if (skills.length === 0) return 0;

        const tomorrow = new Date(Date.now() + 86400000).toISOString();
        let created = 0;

        for (const skill of skills) {
            try {
                await offlineInsert('skill_cards', {
                    user_id: userId,
                    skill_id: skill.id,
                    unit_id: unitId,
                    state: CardState.New,
                    due: tomorrow,
                    stability: 0,
                    difficulty: 0,
                    elapsed_days: 0,
                    scheduled_days: 1,
                    reps: 0,
                    lapses: 0,
                    last_review: null,
                });
                created++;
            } catch {
                // Likely duplicate (UNIQUE constraint) — skip silently
            }
        }

        qc.invalidateQueries({ queryKey: ['skill-cards'] });
        return created;
    }, [userId, qc]);

    const reviewSkillCard = useCallback(async (card: SkillCard, rating: Rating) => {
        if (!userId) return null;

        // Adapt SkillCard to Card shape for FSRS
        const cardForFSRS = {
            ...card,
            wordId: card.skillId,
            storyId: card.unitId,
        };
        const updates = calculateNextReview(cardForFSRS as any, rating);

        // Optimistic update
        qc.setQueryData(
            ['skill-cards', 'due', userId],
            (old: SkillCard[] | undefined) => {
                if (!old) return old;
                const now = new Date();
                return old
                    .map(c => c.id === card.id ? { ...c, ...updates } : c)
                    .filter(c => c.due <= now);
            },
        );

        try {
            await offlineUpdate('skill_cards', {
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
            qc.invalidateQueries({ queryKey: ['skill-cards'] });
        }

        return updates;
    }, [userId, qc]);

    return {
        dueSkillCards: dueSkillCardsRaw ?? [],
        totalSkillCards: totalSkillCards ?? 0,
        addSkillCards,
        reviewSkillCard,
        getSkillCardsByUnit,
    };
}
