import { useLiveQuery } from 'dexie-react-hooks';
import { db, type CEFRLevel } from '../lib/db';

// Legacy level requirements — kept for backward compatibility with Stats page
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
    currentUnitId: string | null; // First incomplete unit's ID
    // Backward compatibility fields for stats page:
    wordsProgress: number;
    wordsRequired: number;
    storiesProgress: number;
    storiesRequired: number;
}

/**
 * Hook to manage level progression based on learning path units.
 * A user levels up ONLY by completing all units + passing the level assessment.
 * Level-up is handled exclusively through the Level Assessment page.
 */
export function useLevelProgression() {
    const user = useLiveQuery(() => db.users.toCollection().first());
    const readStoriesCount = useLiveQuery(() => db.readStories.count(), []);

    const currentLevel = user?.currentLevel ?? 'A1';

    // Fetch all units for the current level, sorted by unitNumber
    const units = useLiveQuery(
        () => db.units.where('level').equals(currentLevel).sortBy('unitNumber'),
        [currentLevel],
    );

    // Fetch unit progress for those units
    const unitProgressRecords = useLiveQuery(
        async () => {
            if (!units || units.length === 0) return [];
            const ids = units.map(u => u.id);
            return db.unitProgress.where('unitId').anyOf(ids).toArray();
        },
        [units],
    );

    const getProgressInfo = (): LevelProgressInfo | null => {
        if (!user) return null;

        const currentIdx = LEVELS.indexOf(user.currentLevel);
        const nextLevel = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;

        // Build a map of unitId -> UnitProgress for quick lookup
        const progressMap = new Map<string, typeof unitProgressRecords extends (infer T)[] | undefined ? T : never>();
        if (unitProgressRecords) {
            for (const p of unitProgressRecords) {
                progressMap.set(p.unitId, p);
            }
        }

        // Calculate unit-based metrics
        const unitsTotal = units?.length ?? 0;
        let unitsCompleted = 0;
        let currentUnitId: string | null = null;

        if (units) {
            for (const unit of units) {
                const progress = progressMap.get(unit.id);
                if (progress?.completedAt) {
                    unitsCompleted++;
                } else if (currentUnitId === null) {
                    // First incomplete unit becomes the current one
                    currentUnitId = unit.id;
                }
            }
        }

        const overallPercent = unitsTotal > 0
            ? Math.round((unitsCompleted / unitsTotal) * 100)
            : 0;

        // Backward compatibility: keep words/stories progress for stats page
        const wordsProgress = user.totalWordsLearned;
        const storiesProgress = readStoriesCount ?? 0;
        const nextReq = nextLevel ? LEVEL_REQUIREMENTS[nextLevel] : null;
        const wordsRequired = nextReq?.minWords ?? 0;
        const storiesRequired = nextReq?.storiesRead ?? 0;

        return {
            currentLevel: user.currentLevel,
            nextLevel,
            unitsCompleted,
            unitsTotal,
            overallPercent,
            currentUnitId,
            wordsProgress,
            wordsRequired,
            storiesProgress,
            storiesRequired,
        };
    };

    const unlockLevel = async (level: CEFRLevel) => {
        if (!user || user.id === undefined) return;
        await db.users.update(user.id, {
            currentLevel: level,
            unlockedLevels: [...user.unlockedLevels, level],
        });
    };

    return {
        user,
        progressInfo: getProgressInfo(),
        unlockLevel,
    };
}
