import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { offlineInsert } from '../lib/offlineMutation';
import { FIRST_STEPS_UNIT, firstStepsLessons } from '../data/firstSteps';

const storageKey = (userId: string | undefined) => `voxie-first-steps:${userId ?? 'guest'}`;

function readDone(userId: string | undefined): string[] {
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]');
        return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : [];
    } catch {
        return [];
    }
}

/**
 * Where the learner is in «Primeros pasos». Each lesson done is kept on this device; finishing
 * them all is saved as the unit `a1-u0`, which no list of A1 units counts, so it locks nothing.
 */
export function useFirstSteps() {
    const { user } = useAuth();
    const userId = user?.id;
    const qc = useQueryClient();
    const [done, setDone] = useState<string[]>(() => readDone(userId));

    const finished = useQuery({
        queryKey: ['firstSteps', userId],
        queryFn: async () => {
            const { data } = await supabase.from('unit_progress').select('completed_at').eq('unit_id', FIRST_STEPS_UNIT).maybeSingle();
            return !!data?.completed_at;
        },
        enabled: !!userId,
    });

    const completeLesson = useCallback(async (lessonId: string) => {
        const next = done.includes(lessonId) ? done : [...done, lessonId];
        setDone(next);
        try { localStorage.setItem(storageKey(userId), JSON.stringify(next)); } catch { /* kept until the page closes */ }
        const all = firstStepsLessons.every(l => next.includes(l.id));
        if (all && userId && !finished.data) {
            const now = new Date().toISOString();
            await offlineInsert('unit_progress', {
                user_id: userId,
                unit_id: FIRST_STEPS_UNIT,
                grammar_card_read: true,
                story_completed: true,
                vocab_reviewed: true,
                exercises_score: 100,
                output_completed: true,
                checkpoint_passed: true,
                completed_at: now,
            }, { onConflict: 'user_id,unit_id' });
            qc.setQueryData(['firstSteps', userId], true);
        }
    }, [done, userId, finished.data, qc]);

    return {
        done,
        /** All five lessons done, here or on another device. */
        finished: !!finished.data || firstStepsLessons.every(l => done.includes(l.id)),
        isLoading: finished.isLoading,
        completeLesson,
    };
}
