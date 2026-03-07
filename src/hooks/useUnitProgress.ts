import { useLiveQuery } from 'dexie-react-hooks';
import { db, type UnitProgress } from '../lib/db';

export type UnitStep = 'grammar' | 'story' | 'vocab' | 'exercises' | 'checkpoint' | 'completed';

export interface UseUnitProgressReturn {
    progress: UnitProgress | null;
    currentStep: UnitStep;
    isLoading: boolean;
    updateProgress: (updates: Partial<UnitProgress>) => Promise<void>;
    markStepComplete: (step: UnitStep) => Promise<void>;
}

function determineStep(progress: UnitProgress | null | undefined): UnitStep {
    if (!progress) return 'grammar';
    if (!progress.grammarCardRead) return 'grammar';
    if (!progress.storyCompleted) return 'story';
    if (!progress.vocabReviewed) return 'vocab';
    if (progress.exercisesScore === 0) return 'exercises';
    if (!progress.checkpointPassed) return 'checkpoint';
    return 'completed';
}

export function useUnitProgress(unitId: string): UseUnitProgressReturn {
    const progress = useLiveQuery(
        async () => {
            const record = await db.unitProgress.where('unitId').equals(unitId).first();
            return record ?? null;
        },
        [unitId],
    );

    const isLoading = progress === undefined;
    const currentStep = determineStep(progress);

    const updateProgress = async (updates: Partial<UnitProgress>) => {
        const existing = await db.unitProgress.where('unitId').equals(unitId).first();
        if (existing && existing.id !== undefined) {
            await db.unitProgress.update(existing.id, updates);
        } else {
            await db.unitProgress.add({
                unitId,
                grammarCardRead: false,
                storyCompleted: false,
                vocabReviewed: false,
                exercisesScore: 0,
                checkpointPassed: false,
                ...updates,
            });
        }
    };

    const markStepComplete = async (step: UnitStep) => {
        switch (step) {
            case 'grammar':
                await updateProgress({ grammarCardRead: true });
                break;
            case 'story':
                await updateProgress({ storyCompleted: true });
                break;
            case 'vocab':
                await updateProgress({ vocabReviewed: true });
                break;
            case 'exercises':
                // exercises score is set via updateProgress directly
                break;
            case 'checkpoint':
                await updateProgress({ checkpointPassed: true, completedAt: new Date() });
                break;
            default:
                break;
        }
    };

    return {
        progress: progress ?? null,
        currentStep,
        isLoading,
        updateProgress,
        markStepComplete,
    };
}
