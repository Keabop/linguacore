import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { UnitProgressRow } from '../lib/database.types';

export type UnitStep = 'grammar' | 'story' | 'vocab' | 'exercises' | 'output' | 'checkpoint' | 'completed';

export interface UseUnitProgressReturn {
    progress: UnitProgressRow | null;
    currentStep: UnitStep;
    isLoading: boolean;
    updateProgress: (updates: Partial<UnitProgressRow>) => Promise<void>;
    markStepComplete: (step: UnitStep) => Promise<void>;
}

function determineStep(progress: UnitProgressRow | null): UnitStep {
    if (!progress) return 'grammar';
    if (!progress.grammar_card_read) return 'grammar';
    if (!progress.story_completed) return 'story';
    if (!progress.vocab_reviewed) return 'vocab';
    if (progress.exercises_score === 0) return 'exercises';
    if (!progress.output_completed) return 'output';
    if (!progress.checkpoint_passed) return 'checkpoint';
    return 'completed';
}

export function useUnitProgress(unitId: string): UseUnitProgressReturn {
    const { user } = useAuth();
    const qc = useQueryClient();
    const userId = user?.id;

    const { data: progress, isLoading } = useQuery({
        queryKey: ['unit-progress', unitId, userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('unit_progress')
                .select('*')
                .eq('unit_id', unitId)
                .single() as { data: UnitProgressRow | null };
            return data;
        },
        enabled: !!userId && !!unitId,
    });

    const currentStep = determineStep((progress as UnitProgressRow | null | undefined) ?? null);

    const updateProgress = async (updates: Partial<UnitProgressRow>) => {
        if (!userId) return;

        const existing = progress as UnitProgressRow | null | undefined;
        if (existing) {
            // Map updates for Supabase
            const mapped: Record<string, any> = {};
            if ('grammar_card_read' in updates) mapped.grammar_card_read = updates.grammar_card_read;
            if ('story_completed' in updates) mapped.story_completed = updates.story_completed;
            if ('vocab_reviewed' in updates) mapped.vocab_reviewed = updates.vocab_reviewed;
            if ('exercises_score' in updates) mapped.exercises_score = updates.exercises_score;
            if ('output_completed' in updates) mapped.output_completed = updates.output_completed;
            if ('checkpoint_passed' in updates) mapped.checkpoint_passed = updates.checkpoint_passed;
            if ('completed_at' in updates) mapped.completed_at = updates.completed_at;

            await supabase.from('unit_progress').update(mapped).eq('id', existing.id);
        } else {
            const insertData: any = {
                user_id: userId,
                unit_id: unitId,
                grammar_card_read: false,
                story_completed: false,
                vocab_reviewed: false,
                exercises_score: 0,
                output_completed: false,
                checkpoint_passed: false,
                completed_at: null,
                ...updates,
            };
            await supabase.from('unit_progress').insert(insertData);
        }

        qc.invalidateQueries({ queryKey: ['unit-progress'] });
    };

    const markStepComplete = async (step: UnitStep) => {
        switch (step) {
            case 'grammar':
                await updateProgress({ grammar_card_read: true });
                break;
            case 'story':
                await updateProgress({ story_completed: true });
                break;
            case 'vocab':
                await updateProgress({ vocab_reviewed: true });
                break;
            case 'exercises':
                // Score is set via updateProgress directly
                break;
            case 'output':
                await updateProgress({ output_completed: true });
                break;
            case 'checkpoint':
                await updateProgress({ checkpoint_passed: true, completed_at: new Date().toISOString() });
                break;
        }
    };

    return {
        progress: (progress as UnitProgressRow | null | undefined) ?? null,
        currentStep,
        isLoading,
        updateProgress,
        markStepComplete,
    };
}
