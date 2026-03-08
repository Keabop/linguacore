import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { CEFRLevel, Profile, UnitProgressRow } from '../lib/database.types';

// Import static data directly — no DB needed for these
import {
    a1Units, a2Units, b1Units, b2Units,
} from '../data/curriculum';

const ALL_UNITS = [...a1Units, ...a2Units, ...b1Units, ...b2Units];

function getUnitsForLevel(level: CEFRLevel) {
    return ALL_UNITS.filter(u => u.level === level).sort((a, b) => a.unitNumber - b.unitNumber);
}

export const LEVEL_REQUIREMENTS: Record<CEFRLevel, {
    minWords: number;
    retention: number;
    storiesRead: number;
}> = {
    A1: { minWords: 0, retention: 0, storiesRead: 0 },
    A2: { minWords: 30, retention: 0.70, storiesRead: 5 },
    B1: { minWords: 60, retention: 0.70, storiesRead: 10 },
    B2: { minWords: 100, retention: 0.65, storiesRead: 20 },
};

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

export interface LevelProgressInfo {
    currentLevel: CEFRLevel;
    nextLevel: CEFRLevel | null;
    unitsCompleted: number;
    unitsTotal: number;
    overallPercent: number;
    currentUnitId: string | null;
    wordsProgress: number;
    wordsRequired: number;
    storiesProgress: number;
    storiesRequired: number;
}

export function useLevelProgression() {
    const { user: authUser } = useAuth();
    const qc = useQueryClient();
    const userId = authUser?.id;

    // Fetch profile
    const { data: profile } = useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId!)
                .single();
            return data as Profile | null;
        },
        enabled: !!userId,
    });

    // Fetch read stories count
    const { data: readStoriesCount } = useQuery({
        queryKey: ['read-stories-count', userId],
        queryFn: async () => {
            const { count } = await supabase
                .from('read_stories')
                .select('*', { count: 'exact', head: true });
            return count ?? 0;
        },
        enabled: !!userId,
    });

    // Fetch unit progress for current level
    const currentLevel = profile?.current_level ?? 'A1';
    const levelUnits = getUnitsForLevel(currentLevel);
    const levelUnitIds = levelUnits.map(u => u.id);

    const { data: unitProgressRecords } = useQuery({
        queryKey: ['unit-progress-level', currentLevel, userId],
        queryFn: async () => {
            if (levelUnitIds.length === 0) return [];
            const { data } = await supabase
                .from('unit_progress')
                .select('*')
                .in('unit_id', levelUnitIds);
            return (data ?? []) as UnitProgressRow[];
        },
        enabled: !!userId,
    });

    const getProgressInfo = (): LevelProgressInfo | null => {
        if (!profile) return null;

        const currentIdx = LEVELS.indexOf(profile.current_level);
        const nextLevel = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;

        const progressMap = new Map<string, UnitProgressRow>();
        if (unitProgressRecords) {
            for (const p of unitProgressRecords) {
                progressMap.set(p.unit_id, p);
            }
        }

        const unitsTotal = levelUnits.length;
        let unitsCompleted = 0;
        let currentUnitId: string | null = null;

        for (const unit of levelUnits) {
            const progress = progressMap.get(unit.id);
            if (progress?.completed_at) {
                unitsCompleted++;
            } else if (currentUnitId === null) {
                currentUnitId = unit.id;
            }
        }

        const overallPercent = unitsTotal > 0
            ? Math.round((unitsCompleted / unitsTotal) * 100)
            : 0;

        const wordsProgress = profile.total_words_learned;
        const storiesProgress = readStoriesCount ?? 0;
        const nextReq = nextLevel ? LEVEL_REQUIREMENTS[nextLevel] : null;

        return {
            currentLevel: profile.current_level,
            nextLevel,
            unitsCompleted,
            unitsTotal,
            overallPercent,
            currentUnitId,
            wordsProgress,
            wordsRequired: nextReq?.minWords ?? 0,
            storiesProgress,
            storiesRequired: nextReq?.storiesRead ?? 0,
        };
    };

    const unlockLevel = async (level: CEFRLevel) => {
        if (!userId || !profile) return;
        await supabase.from('profiles').update({
            current_level: level,
            unlocked_levels: [...profile.unlocked_levels, level],
        }).eq('id', userId);
        qc.invalidateQueries({ queryKey: ['profile'] });
        qc.invalidateQueries({ queryKey: ['unit-progress-level'] });
    };

    // Adapt profile to the shape Layout/Dashboard expect
    const userCompat = profile ? {
        currentLevel: profile.current_level,
        unlockedLevels: profile.unlocked_levels,
        totalWordsLearned: profile.total_words_learned,
        streak: profile.streak,
        lastStudyDate: profile.last_study_date,
        levelProgress: profile.level_progress,
    } : undefined;

    return {
        user: userCompat,
        progressInfo: getProgressInfo(),
        unlockLevel,
    };
}
