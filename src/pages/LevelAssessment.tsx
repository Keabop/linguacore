import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Star,
    ArrowLeft,
    RotateCcw,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { db } from '../lib/db';
import type { CEFRLevel, GrammarExercise, Unit } from '../lib/db';
import ExerciseRunner from '../components/exercises/ExerciseRunner';

interface LevelAssessmentProps {
    level: CEFRLevel;
    unitId: string;
    onComplete: () => void;
}

type AssessmentState = 'intro' | 'loading' | 'testing' | 'passed' | 'failed' | 'error';

interface FailedTopic {
    unitId: string;
    grammarTopic: string;
    count: number;
}

const EXERCISE_COUNT_MIN = 15;
const EXERCISE_COUNT_MAX = 20;
const PASS_THRESHOLD = 80;

const nextLevelMap: Record<string, CEFRLevel> = {
    A1: 'A2',
    A2: 'B1',
    B1: 'B2',
};

/**
 * Selects a balanced mix of exercises across units and types.
 * Picks 2-3 exercises per non-assessment unit, shuffled.
 */
function selectExercises(allExercises: GrammarExercise[], assessmentUnitId: string): GrammarExercise[] {
    // Filter out exercises from the assessment unit
    const eligible = allExercises.filter(e => e.unitId !== assessmentUnitId);
    if (eligible.length === 0) return [];

    // Group by unitId
    const byUnit = new Map<string, GrammarExercise[]>();
    for (const ex of eligible) {
        const group = byUnit.get(ex.unitId) || [];
        group.push(ex);
        byUnit.set(ex.unitId, group);
    }

    const unitIds = Array.from(byUnit.keys());
    const targetCount = Math.min(
        Math.max(EXERCISE_COUNT_MIN, Math.min(EXERCISE_COUNT_MAX, eligible.length)),
        eligible.length,
    );

    // Calculate how many per unit (roughly balanced)
    const perUnit = Math.max(2, Math.ceil(targetCount / unitIds.length));
    const selected: GrammarExercise[] = [];

    // First pass: pick up to `perUnit` from each unit, ensuring type diversity
    for (const uid of unitIds) {
        const unitExercises = byUnit.get(uid)!;
        // Shuffle unit exercises
        const shuffled = [...unitExercises].sort(() => Math.random() - 0.5);

        // Try to get a mix of types
        const types = new Set(shuffled.map(e => e.type));
        const picked: GrammarExercise[] = [];

        // First, pick one of each type available
        for (const type of types) {
            const ofType = shuffled.find(e => e.type === type && !picked.includes(e));
            if (ofType && picked.length < perUnit) {
                picked.push(ofType);
            }
        }

        // Fill remaining slots
        for (const ex of shuffled) {
            if (picked.length >= perUnit) break;
            if (!picked.includes(ex)) {
                picked.push(ex);
            }
        }

        selected.push(...picked);
    }

    // Trim to target count if we have too many
    const trimmed = selected.sort(() => Math.random() - 0.5).slice(0, targetCount);

    // Final shuffle
    return trimmed.sort(() => Math.random() - 0.5);
}

export default function LevelAssessment({ level, unitId, onComplete }: LevelAssessmentProps) {
    const { t } = useTranslation();
    const [state, setState] = useState<AssessmentState>('intro');
    const [exercises, setExercises] = useState<GrammarExercise[]>([]);
    const [score, setScore] = useState(0);
    const [failedTopics, setFailedTopics] = useState<FailedTopic[]>([]);
    const [nextLevel, setNextLevel] = useState<CEFRLevel | null>(null);

    const loadExercises = useCallback(async () => {
        setState('loading');
        try {
            // Fetch all exercises for this level
            const allExercises = await db.grammarExercises.toArray();
            // Get all units for this level to know which exercises belong
            const levelUnits = await db.units.where('level').equals(level).toArray();
            const levelUnitIds = new Set(levelUnits.map(u => u.id));

            // Filter to only exercises from units belonging to this level
            const levelExercises = allExercises.filter(e => levelUnitIds.has(e.unitId));
            const selected = selectExercises(levelExercises, unitId);

            if (selected.length === 0) {
                setState('error');
                return;
            }

            setExercises(selected);
            setState('testing');
        } catch {
            setState('error');
        }
    }, [level, unitId]);

    const handleComplete = useCallback(async (finalScore: number) => {
        setScore(finalScore);

        // Save assessment record
        await db.levelAssessments.add({
            level,
            score: finalScore,
            passed: finalScore >= PASS_THRESHOLD,
            attemptedAt: new Date(),
        });

        if (finalScore >= PASS_THRESHOLD) {
            // Mark assessment unit as completed
            await db.unitProgress.add({
                unitId,
                grammarCardRead: true,
                storyCompleted: true,
                vocabReviewed: true,
                exercisesScore: finalScore,
                outputCompleted: true,
                checkpointPassed: true,
                completedAt: new Date(),
            });

            // Unlock next level
            const nl = nextLevelMap[level] || null;
            setNextLevel(nl);
            if (nl) {
                const user = await db.users.toCollection().first();
                if (user) {
                    const unlockedLevels = [...(user.unlockedLevels || ['A1'])];
                    if (!unlockedLevels.includes(nl)) unlockedLevels.push(nl);
                    await db.users.update(user.id!, {
                        currentLevel: nl,
                        unlockedLevels,
                    });
                }
            }

            setState('passed');
        } else {
            // Determine which topics need review
            // We can identify from exercises which ones were wrong
            // Since ExerciseRunner only gives us the final score, we can show
            // grammar topics from units that had exercises in the assessment
            const units = await db.units.where('level').equals(level).toArray();
            const unitMap = new Map<string, Unit>();
            for (const u of units) {
                if (!u.isAssessment) unitMap.set(u.id, u);
            }

            // Group exercises by unit for the topics that need review
            const topicCounts = new Map<string, { topic: string; count: number }>();
            for (const ex of exercises) {
                const u = unitMap.get(ex.unitId);
                if (u) {
                    const existing = topicCounts.get(ex.unitId);
                    if (existing) {
                        existing.count++;
                    } else {
                        topicCounts.set(ex.unitId, { topic: u.grammarTopic, count: 1 });
                    }
                }
            }

            setFailedTopics(
                Array.from(topicCounts.entries()).map(([uid, data]) => ({
                    unitId: uid,
                    grammarTopic: data.topic,
                    count: data.count,
                })),
            );

            setState('failed');
        }
    }, [level, unitId, exercises]);

    const handleRetry = useCallback(() => {
        setScore(0);
        setExercises([]);
        setFailedTopics([]);
        loadExercises();
    }, [loadExercises]);

    // -- Render states --

    if (state === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (state === 'error') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[40vh] space-y-4"
            >
                <XCircle className="w-12 h-12 text-red-400" />
                <p className="text-text-secondary text-center">
                    No se encontraron ejercicios para esta evaluaci&oacute;n.
                </p>
                <button
                    onClick={onComplete}
                    className="flex items-center gap-2 text-primary font-semibold hover:text-primary-light transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a la ruta
                </button>
            </motion.div>
        );
    }

    // -- Intro Screen --
    if (state === 'intro') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[50vh] space-y-8"
            >
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    >
                        <Trophy className="w-16 h-16 text-amber-400 mx-auto" />
                    </motion.div>

                    <h1 className="text-3xl font-extrabold">
                        {t('assessment.title', { level })}
                    </h1>

                    <p className="text-text-secondary text-base leading-relaxed max-w-sm mx-auto">
                        Demuestra tu dominio del nivel {level}. Se evaluar&aacute;n todos
                        los temas de gram&aacute;tica que has estudiado.
                    </p>
                </div>

                <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">15–20 ejercicios</p>
                            <p className="text-xs text-text-muted">Todos los temas del nivel</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Star className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">80% para aprobar</p>
                            <p className="text-xs text-text-muted">
                                Necesitas al menos 80% de respuestas correctas
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Desbloquea el siguiente nivel</p>
                            <p className="text-xs text-text-muted">
                                {nextLevelMap[level]
                                    ? `Al aprobar, desbloquear\u00e1s el nivel ${nextLevelMap[level]}`
                                    : 'Completa tu dominio del nivel'}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={loadExercises}
                    className="w-full max-w-sm bg-amber-500 hover:bg-amber-600 text-black py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20"
                >
                    Comenzar
                </button>

                <button
                    onClick={onComplete}
                    className="flex items-center gap-2 text-text-muted hover:text-text-secondary transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a la ruta
                </button>
            </motion.div>
        );
    }

    // -- Testing Screen --
    if (state === 'testing') {
        return (
            <div className="space-y-6">
                {/* Assessment Header */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-bold text-amber-400">
                        {t('assessment.title', { level })}
                    </h2>
                </motion.div>

                {/* ExerciseRunner handles progress bar, exercises, and score screen */}
                <ExerciseRunner
                    exercises={exercises}
                    onComplete={handleComplete}
                />
            </div>
        );
    }

    // -- Passed Screen --
    if (state === 'passed') {
        const nl = nextLevel;
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 py-8"
                >
                    {/* Trophy Animation */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                        className="relative"
                    >
                        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <Trophy className="w-12 h-12 text-amber-400" />
                        </div>
                        {/* Sparkle accents */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="absolute -top-1 -right-1"
                        >
                            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
                        </motion.div>
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -bottom-1 -left-2"
                        >
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </motion.div>
                    </motion.div>

                    {/* Congratulations Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center space-y-3"
                    >
                        <h1 className="text-4xl font-extrabold text-amber-400">
                            {t('levelUp.congratulations')}
                        </h1>
                        <p className="text-text-secondary text-lg">
                            {t('assessment.pass')}
                        </p>
                    </motion.div>

                    {/* Score Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-bg-card border border-amber-500/30 rounded-2xl p-6 w-full max-w-sm text-center space-y-4"
                    >
                        <p className="text-sm text-text-muted uppercase tracking-wider font-medium">
                            {t('assessment.title', { level })}
                        </p>
                        <p className="text-6xl font-extrabold text-amber-400">
                            {score}%
                        </p>
                        <p className="text-text-secondary text-sm">
                            {t('assessment.score', { score })}
                        </p>

                        {nl && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="pt-3 border-t border-amber-500/20"
                            >
                                <p className="text-amber-300 font-bold text-base">
                                    {t('levelUp.unlocked', { level: nl })}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        onClick={onComplete}
                        className="w-full max-w-sm bg-amber-500 hover:bg-amber-600 text-black py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20"
                    >
                        Volver a la ruta
                    </motion.button>
                </motion.div>
            </AnimatePresence>
        );
    }

    // -- Failed Screen --
    if (state === 'failed') {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 py-8"
                >
                    {/* Score Display */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="bg-bg-card border border-red-500/30 rounded-2xl p-6 w-full max-w-sm text-center space-y-4"
                    >
                        <p className="text-sm text-text-muted uppercase tracking-wider font-medium">
                            {t('assessment.title', { level })}
                        </p>
                        <p className="text-6xl font-extrabold text-red-400">
                            {score}%
                        </p>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            {t('assessment.fail')}
                        </p>
                    </motion.div>

                    {/* Topics to Review */}
                    {failedTopics.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-bg-card border border-border rounded-2xl p-5 w-full max-w-sm space-y-3"
                        >
                            <p className="text-sm font-bold text-text-secondary">
                                Temas a repasar:
                            </p>
                            <div className="space-y-2">
                                {failedTopics.map((topic) => (
                                    <div
                                        key={topic.unitId}
                                        className="flex items-start gap-2.5 text-sm"
                                    >
                                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-text-secondary leading-snug">
                                            {topic.grammarTopic}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full max-w-sm space-y-3"
                    >
                        <button
                            onClick={handleRetry}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-black py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {t('assessment.retry')}
                        </button>

                        <button
                            onClick={onComplete}
                            className="w-full bg-bg-card border border-border hover:border-primary/40 text-text-secondary py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver a la ruta
                        </button>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return null;
}
