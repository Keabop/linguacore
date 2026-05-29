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
import type { CEFRLevel, GrammarExercise, Unit } from '../lib/db';
import type { Profile } from '../lib/database.types';
import { getExercisesByLevel, getUnitsByLevel } from '../data';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
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
    const { user: authUser } = useAuth();
    const qc = useQueryClient();
    const [state, setState] = useState<AssessmentState>('intro');
    const [exercises, setExercises] = useState<GrammarExercise[]>([]);
    const [score, setScore] = useState(0);
    const [failedTopics, setFailedTopics] = useState<FailedTopic[]>([]);
    const [nextLevel, setNextLevel] = useState<CEFRLevel | null>(null);

    const loadExercises = useCallback(async () => {
        setState('loading');
        try {
            // Fetch all exercises for this level from static data
            const allExercises = getExercisesByLevel(level);
            const selected = selectExercises(allExercises, unitId);

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
        await supabase.from('level_assessments').insert({
            user_id: authUser!.id,
            level,
            score: finalScore,
            passed: finalScore >= PASS_THRESHOLD,
            attempted_at: new Date().toISOString(),
        });

        if (finalScore >= PASS_THRESHOLD) {
            // Mark assessment unit as completed
            await supabase.from('unit_progress').insert({
                user_id: authUser!.id,
                unit_id: unitId,
                grammar_card_read: true,
                story_completed: true,
                vocab_reviewed: true,
                exercises_score: finalScore,
                output_completed: true,
                checkpoint_passed: true,
                completed_at: new Date().toISOString(),
            });

            // Unlock next level
            const nl = nextLevelMap[level] || null;
            setNextLevel(nl);
            if (nl) {
                const { data: profile } = await supabase.from('profiles').select('unlocked_levels').eq('id', authUser!.id).single() as { data: Pick<Profile, 'unlocked_levels'> | null };
                if (profile) {
                    const unlockedLevels = [...(profile.unlocked_levels || ['A1'])];
                    if (!unlockedLevels.includes(nl)) unlockedLevels.push(nl);
                    await supabase.from('profiles').update({
                        current_level: nl,
                        unlocked_levels: unlockedLevels,
                    }).eq('id', authUser!.id);
                }
                qc.invalidateQueries({ queryKey: ['profile'] });
                qc.invalidateQueries({ queryKey: ['levelProgression'] });
            }

            setState('passed');
        } else {
            // Determine which topics need review
            const units = getUnitsByLevel(level);
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
    }, [level, unitId, exercises, authUser, qc]);

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
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
                    <div className="w-5 h-5 rounded-full bg-amber-500/40 animate-spin" />
                </div>
            </div>
        );
    }

    if (state === 'error') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[40vh] space-y-6"
            >
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-[var(--color-on-surface-muted)] text-center">
                    No se encontraron ejercicios para esta evaluaci&oacute;n.
                </p>
                <button
                    onClick={onComplete}
                    className="flex items-center gap-2 text-[var(--color-primary)] font-bold hover:brightness-110 transition-all duration-300"
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
                <div className="text-center space-y-5">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    >
                        <div className="w-20 h-20 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto shadow-[0_4px_24px_rgba(245,158,11,0.15)]">
                            <Trophy className="w-10 h-10 text-amber-400" />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl font-black tracking-tight">
                        {t('assessment.title', { level })}
                    </h1>

                    <p className="text-[var(--color-on-surface-muted)] text-base leading-relaxed max-w-sm mx-auto">
                        Demuestra tu dominio del nivel {level}. Se evaluar&aacute;n todos
                        los temas de gram&aacute;tica que has estudiado.
                    </p>
                </div>

                <div className="bg-[var(--color-card)] rounded-[2rem] p-7 w-full max-w-sm space-y-5 shadow-[var(--shadow-card)]">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="font-black text-sm">15–20 ejercicios</p>
                            <p className="text-xs text-[var(--color-on-surface-muted)]">Todos los temas del nivel</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <Star className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="font-black text-sm">80% para aprobar</p>
                            <p className="text-xs text-[var(--color-on-surface-muted)]">
                                Necesitas al menos 80% de respuestas correctas
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="font-black text-sm">Desbloquea el siguiente nivel</p>
                            <p className="text-xs text-[var(--color-on-surface-muted)]">
                                {nextLevelMap[level]
                                    ? `Al aprobar, desbloquear\u00e1s el nivel ${nextLevelMap[level]}`
                                    : 'Completa tu dominio del nivel'}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={loadExercises}
                    className="w-full max-w-sm bg-gradient-to-br from-amber-500 to-amber-600 text-black py-4 rounded-full font-black text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(245,158,11,0.3)] active:scale-[0.97]"
                >
                    Comenzar
                </button>

                <button
                    onClick={onComplete}
                    className="flex items-center gap-2 text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-all duration-300 text-sm group"
                >
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--color-surface-container)] group-hover:bg-[var(--color-surface-container-highest)] transition-all duration-300">
                        <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                    Volver a la ruta
                </button>
            </motion.div>
        );
    }

    // -- Testing Screen --
    if (state === 'testing') {
        return (
            <div className="space-y-8">
                {/* Assessment Header */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center">
                        <Trophy className="w-4.5 h-4.5 text-amber-400" />
                    </div>
                    <h2 className="text-lg font-black tracking-tight text-amber-400">
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
                        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center shadow-[0_8px_40px_rgba(245,158,11,0.2)]">
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
                        <h1 className="text-4xl font-black tracking-tight text-amber-400">
                            {t('levelUp.congratulations')}
                        </h1>
                        <p className="text-[var(--color-on-surface-muted)] text-lg">
                            {t('assessment.pass')}
                        </p>
                    </motion.div>

                    {/* Score Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[var(--color-card)] rounded-[2rem] p-8 w-full max-w-sm text-center space-y-5 shadow-[0_8px_40px_rgba(245,158,11,0.12)]"
                    >
                        <p className="text-sm text-[var(--color-on-surface-muted)] uppercase tracking-wider font-bold">
                            {t('assessment.title', { level })}
                        </p>
                        <p className="text-6xl font-black tracking-tight text-amber-400">
                            {score}%
                        </p>
                        <p className="text-[var(--color-on-surface-muted)] text-sm">
                            {t('assessment.score', { score })}
                        </p>

                        {nl && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="pt-4"
                            >
                                <div className="bg-amber-500/10 rounded-2xl py-3 px-4">
                                    <p className="text-amber-300 font-black text-base">
                                        {t('levelUp.unlocked', { level: nl })}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        onClick={onComplete}
                        className="w-full max-w-sm bg-gradient-to-br from-amber-500 to-amber-600 text-black py-4 rounded-full font-black text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(245,158,11,0.3)] active:scale-[0.97]"
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
                        className="bg-[var(--color-card)] rounded-[2rem] p-8 w-full max-w-sm text-center space-y-5 shadow-[0_8px_40px_rgba(239,68,68,0.1)]"
                    >
                        <p className="text-sm text-[var(--color-on-surface-muted)] uppercase tracking-wider font-bold">
                            {t('assessment.title', { level })}
                        </p>
                        <p className="text-6xl font-black tracking-tight text-red-400">
                            {score}%
                        </p>
                        <p className="text-[var(--color-on-surface-muted)] text-sm leading-relaxed">
                            {t('assessment.fail')}
                        </p>
                    </motion.div>

                    {/* Topics to Review */}
                    {failedTopics.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[var(--color-card)] rounded-[2rem] p-6 w-full max-w-sm space-y-4 shadow-[var(--shadow-card)]"
                        >
                            <p className="text-sm font-black text-[var(--color-on-surface-muted)]">
                                Temas a repasar:
                            </p>
                            <div className="space-y-3">
                                {failedTopics.map((topic) => (
                                    <div
                                        key={topic.unitId}
                                        className="flex items-start gap-3 text-sm bg-[var(--color-surface-container)] rounded-2xl p-3"
                                    >
                                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-[var(--color-on-surface-muted)] leading-snug">
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
                        className="w-full max-w-sm space-y-4"
                    >
                        <button
                            onClick={handleRetry}
                            className="w-full bg-gradient-to-br from-amber-500 to-amber-600 text-black py-4 rounded-full font-black text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(245,158,11,0.3)] active:scale-[0.97] flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {t('assessment.retry')}
                        </button>

                        <button
                            onClick={onComplete}
                            className="w-full bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-muted)] py-4 rounded-full font-black text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)] active:scale-[0.97] flex items-center justify-center gap-2"
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
