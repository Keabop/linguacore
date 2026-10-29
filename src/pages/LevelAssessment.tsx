import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Star,
    ArrowLeft,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Headphones,
    Volume2,
} from 'lucide-react';
import type { CEFRLevel } from '../lib/db';
import type { Profile } from '../lib/database.types';
import type { AssessmentQuestion, ExamResponse } from '../lib/exam/types';
import { allExercises, getUnitsByLevel } from '../data';
import { levelFinalBanks, type LessonLevel } from '../data/assessments/level-final';
import { LEVEL_FINAL_PASS, buildLevelFinal, levelFinalResult } from '../lib/exam/levelFinal';
import { hasRecording, playListening, stopDialogueSpeech } from '../lib/assessmentSpeech';
import { offlineInsert, offlineUpdate } from '../lib/offlineMutation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '../lib/toast';
import QuestionView from '../components/exam/QuestionView';
import PassageView from '../components/exam/PassageView';
import BackButton from '../components/ui/BackButton';
import NoEnglishVoices from '../components/ui/NoEnglishVoices';

interface LevelAssessmentProps {
    level: CEFRLevel;
    unitId: string;
    onComplete: () => void;
}

type AssessmentState = 'intro' | 'testing' | 'passed' | 'failed' | 'error';

/** Times each recording can be heard, as in the Cambridge exams. */
const AUDIO_PLAYS = 2;

const nextLevelMap: Record<string, CEFRLevel> = {
    A1: 'A2',
    A2: 'B1',
    B1: 'B2',
};

/**
 * Screens of the exam: a text or recording shares one screen with all its questions, as in the
 * exam, so the learner reads every question before listening; grammar goes one per screen.
 */
function toPages(questions: AssessmentQuestion[]): AssessmentQuestion[][] {
    const pages: AssessmentQuestion[][] = [];
    for (const q of questions) {
        const last = pages[pages.length - 1];
        if (q.group && last?.[0].group === q.group) last.push(q);
        else pages.push([q]);
    }
    return pages;
}

const SECTION_KEY = { 'use-of-english': 'sectionGrammar', reading: 'sectionReading', listening: 'sectionListening' } as const;

export default function LevelAssessment({ level, unitId, onComplete }: LevelAssessmentProps) {
    const { t } = useTranslation();
    const { user: authUser } = useAuth();
    const qc = useQueryClient();
    const [state, setState] = useState<AssessmentState>('intro');
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [page, setPage] = useState(0);
    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);
    const [responses, setResponses] = useState<Record<string, ExamResponse>>({});
    const [plays, setPlays] = useState<Record<string, number>>({});
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [score, setScore] = useState(0);
    const [weakTopics, setWeakTopics] = useState<{ unitId: string; grammarTopic: string }[]>([]);
    const [nextLevel, setNextLevel] = useState<CEFRLevel | null>(null);

    const bank = levelFinalBanks[level as LessonLevel];
    const units = useMemo(() => getUnitsByLevel(level).filter(u => !u.isAssessment), [level]);
    // What the exam will really have: a unit without a usable exercise gets no review item
    const grammarCount = useMemo(
        () => (bank ? buildLevelFinal({ units, exercises: allExercises, bank }).filter(q => q.section === 'use-of-english').length : 0),
        [bank, units],
    );
    const pages = useMemo(() => toPages(questions), [questions]);

    // Leaving the exam stops its recording
    useEffect(() => () => stopDialogueSpeech(), []);

    const start = useCallback(() => {
        if (!bank) {
            setState('error');
            return;
        }
        const exam = buildLevelFinal({ units, exercises: allExercises, bank });
        if (exam.length === 0) {
            setState('error');
            return;
        }
        setQuestions(exam);
        setPage(0);
        setResponses({});
        setPlays({});
        setState('testing');
    }, [bank, units]);

    const finish = useCallback(async () => {
        // A double tap on "Finish" must not save the attempt twice
        if (savingRef.current) return;
        savingRef.current = true;
        setSaving(true);
        stopDialogueSpeech();
        setIsPlayingAudio(false);
        const result = levelFinalResult(questions, responses);
        setScore(result.score);
        setNextLevel(null);

        try {
            // Queued when offline, like the rest of the progress
            await offlineInsert('level_assessments', {
                user_id: authUser!.id,
                level,
                score: result.score,
                passed: result.passed,
                attempted_at: new Date().toISOString(),
            });

            if (result.passed) {
                // Mark assessment unit as completed (a retake of a passed exam updates the same row)
                await offlineInsert('unit_progress', {
                    user_id: authUser!.id,
                    unit_id: unitId,
                    grammar_card_read: true,
                    story_completed: true,
                    vocab_reviewed: true,
                    exercises_score: result.score,
                    output_completed: true,
                    checkpoint_passed: true,
                    completed_at: new Date().toISOString(),
                }, { onConflict: 'user_id,unit_id' });

                // Unlock next level. Offline, the cached profile says which levels are open and the update is queued
                const nl = nextLevelMap[level] || null;
                if (nl) {
                    let unlocked: CEFRLevel[] | undefined;
                    if (navigator.onLine) {
                        const { data: profile, error } = await supabase.from('profiles').select('unlocked_levels').eq('id', authUser!.id).single() as { data: Pick<Profile, 'unlocked_levels'> | null; error: unknown };
                        if (error || !profile) throw error ?? new Error('profile not found');
                        unlocked = profile.unlocked_levels;
                    } else {
                        unlocked = qc.getQueryData<Profile | null>(['profile', authUser!.id])?.unlocked_levels;
                        if (!unlocked) throw new Error('profile not cached');
                    }
                    // Already open (a retake): nothing to write, so a stale cache can't drop a level
                    // and the current level doesn't move back
                    if (!(unlocked || ['A1']).includes(nl)) {
                        const changes = { current_level: nl, unlocked_levels: [...(unlocked || ['A1']), nl] };
                        await offlineUpdate('profiles', changes, { id: authUser!.id });
                        qc.setQueryData<Profile | null>(['profile', authUser!.id], p => p && { ...p, ...changes });
                    }
                    setNextLevel(nl);
                    qc.invalidateQueries({ queryKey: ['profile'] });
                    qc.invalidateQueries({ queryKey: ['levelProgression'] });
                }
            }
        } catch {
            // The result still shows; only what was saved is announced (no "level unlocked")
            toast.error({ title: t('assessment.saveFailed') });
        } finally {
            savingRef.current = false;
            setSaving(false);
        }

        if (result.passed) {
            setState('passed');
        } else {
            const topicOf = new Map(units.map(u => [u.id, u.grammarTopic]));
            setWeakTopics(result.weakUnits.filter(u => topicOf.has(u)).map(u => ({ unitId: u, grammarTopic: topicOf.get(u)! })));
            setState('failed');
        }
    }, [questions, responses, level, unitId, authUser, qc, t, units]);

    const onPage = pages[page] ?? [];
    const current = onPage[0];
    const audioGroup = current?.group ?? current?.id;
    const playsUsed = audioGroup ? plays[audioGroup] ?? 0 : 0;

    const handlePlay = () => {
        if (!current?.dialogue || isPlayingAudio || playsUsed >= AUDIO_PLAYS) return;
        const group = audioGroup!;
        setIsPlayingAudio(true);
        setPlays(prev => ({ ...prev, [group]: playsUsed + 1 }));
        const done = () => setIsPlayingAudio(false);
        // Nothing could be played: the play isn't spent
        const failed = () => {
            setIsPlayingAudio(false);
            setPlays(prev => ({ ...prev, [group]: playsUsed }));
        };
        playListening(current.dialogue, current.level, () => {}, done, failed);
    };

    const handleNext = () => {
        stopDialogueSpeech();
        setIsPlayingAudio(false);
        if (page + 1 < pages.length) setPage(page + 1);
        else finish();
    };

    // -- Render states --

    if (state === 'error') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[40vh] space-y-6"
            >
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-error)]/10 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-[var(--color-error)]" />
                </div>
                <p className="text-[var(--color-on-surface-muted)] text-center">{t('assessment.noQuestions')}</p>
                <BackButton onClick={onComplete} label={t('assessment.back')} />
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
                        <div className="w-20 h-20 rounded-full bg-[var(--color-tertiary)]/15 flex items-center justify-center mx-auto shadow-[0_4px_24px_color-mix(in_oklch,var(--color-tertiary)_15%,transparent)]">
                            <Trophy className="w-10 h-10 text-[var(--color-tertiary-ink)]" />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl font-black tracking-tight">
                        {t('assessment.title', { level })}
                    </h1>

                    <p className="text-[var(--color-on-surface-muted)] text-base leading-relaxed max-w-sm mx-auto">
                        {t('assessment.intro', { level })}
                    </p>
                </div>

                <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-7 w-full max-w-sm space-y-5 shadow-[var(--shadow-card)]">
                    {[
                        { icon: CheckCircle2, title: t('assessment.partGrammar', { count: grammarCount }), body: t('assessment.partGrammarBody') },
                        { icon: Headphones, title: t('assessment.partSkills'), body: t('assessment.partSkillsBody') },
                        { icon: Star, title: t('assessment.passMark', { pass: LEVEL_FINAL_PASS }), body: t('assessment.passMarkBody', { pass: LEVEL_FINAL_PASS }) },
                        {
                            icon: Trophy,
                            title: t('assessment.unlockTitle'),
                            body: nextLevelMap[level] ? t('assessment.unlock', { level: nextLevelMap[level] }) : t('assessment.unlockLast'),
                        },
                    ].map(({ icon: Icon, title, body }) => (
                        <div key={title} className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-[var(--color-tertiary)]/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-[var(--color-tertiary-ink)]" />
                            </div>
                            <div>
                                <p className="font-black text-sm">{title}</p>
                                <p className="text-xs text-[var(--color-on-surface-muted)]">{body}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={start}
                    className="w-full max-w-sm bg-[var(--color-tertiary)] text-[var(--color-on-tertiary)] py-4 rounded-full font-black text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_color-mix(in_oklch,var(--color-tertiary)_30%,transparent)] active:scale-[0.97]"
                >
                    {t('assessment.start')}
                </button>

                <BackButton onClick={onComplete} label={t('assessment.back')} />
            </motion.div>
        );
    }

    // -- Testing Screen --
    if (state === 'testing' && current) {
        const first = questions.indexOf(current);
        const progress = ((first + onPage.length) / questions.length) * 100;
        const answered = onPage.every(q => responses[q.id] !== undefined);
        const label = onPage.length > 1
            ? t('assessment.progressRange', { from: first + 1, to: first + onPage.length, total: questions.length })
            : t('assessment.progress', { n: first + 1, total: questions.length });
        return (
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[var(--color-tertiary)]/15 flex items-center justify-center">
                                <Trophy className="w-4.5 h-4.5 text-[var(--color-tertiary-ink)]" />
                            </div>
                            <h2 className="text-lg font-black tracking-tight text-[var(--color-tertiary-ink)]">
                                {t('assessment.title', { level })}
                            </h2>
                        </div>
                        <span className="text-xs font-bold text-[var(--color-on-surface-muted)]">
                            {t(`assessment.${SECTION_KEY[current.section]}`)} · {label}
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-surface-container)] overflow-hidden" role="progressbar" aria-valuenow={first + onPage.length} aria-valuemin={1} aria-valuemax={questions.length}>
                        <div className="h-full bg-[var(--color-tertiary)] transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {current.passage && <PassageView text={current.passage} />}

                {current.dialogue && (
                    <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-5 space-y-3 shadow-[var(--shadow-card)]">
                        {!hasRecording(current.dialogue, current.level) && <NoEnglishVoices />}
                        <button
                            onClick={handlePlay}
                            disabled={isPlayingAudio || playsUsed >= AUDIO_PLAYS}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold disabled:opacity-50 transition-all active:scale-[0.97]"
                        >
                            <Volume2 className="w-4 h-4" />
                            {isPlayingAudio ? t('assessment.playing') : t('assessment.play')}
                        </button>
                        <p className="text-xs text-center text-[var(--color-on-surface-muted)]">
                            {playsUsed >= AUDIO_PLAYS ? t('assessment.noPlaysLeft') : t('assessment.playsLeft', { count: AUDIO_PLAYS - playsUsed })}
                        </p>
                    </div>
                )}

                {onPage.map(q => (
                    <div key={q.id} className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)]">
                        <QuestionView
                            question={q}
                            response={responses[q.id]}
                            onChange={r => setResponses(prev => ({ ...prev, [q.id]: r }))}
                        />
                    </div>
                ))}

                <button
                    onClick={handleNext}
                    disabled={!answered || saving}
                    className="w-full bg-[var(--color-tertiary)] text-[var(--color-on-tertiary)] py-4 rounded-full font-black text-base transition-all duration-300 disabled:opacity-50 active:scale-[0.97]"
                >
                    {page + 1 < pages.length ? t('assessment.next') : t('assessment.finish')}
                </button>
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
                        <div className="w-24 h-24 rounded-full bg-[var(--color-tertiary)]/20 flex items-center justify-center shadow-[0_8px_40px_color-mix(in_oklch,var(--color-tertiary)_20%,transparent)]">
                            <Trophy className="w-12 h-12 text-[var(--color-tertiary-ink)]" />
                        </div>
                        {/* Sparkle accents */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="absolute -top-1 -right-1"
                        >
                            <Star className="w-6 h-6 text-[var(--color-tertiary-ink)] fill-[var(--color-tertiary)]" />
                        </motion.div>
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -bottom-1 -left-2"
                        >
                            <Star className="w-4 h-4 text-[var(--color-tertiary-ink)] fill-[var(--color-tertiary)]" />
                        </motion.div>
                    </motion.div>

                    {/* Congratulations Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center space-y-3"
                    >
                        <h1 className="text-4xl font-black tracking-tight text-[var(--color-tertiary-ink)]">
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
                        className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-8 w-full max-w-sm text-center space-y-5 shadow-[0_8px_40px_color-mix(in_oklch,var(--color-tertiary)_12%,transparent)]"
                    >
                        <p className="text-sm text-[var(--color-on-surface-muted)] uppercase tracking-wider font-bold">
                            {t('assessment.title', { level })}
                        </p>
                        <p className="text-6xl font-black tracking-tight text-[var(--color-tertiary-ink)]">
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
                                <div className="bg-[var(--color-tertiary)]/10 rounded-2xl py-3 px-4">
                                    <p className="text-[var(--color-tertiary-ink)] font-black text-base">
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
                        className="w-full max-w-sm bg-[var(--color-tertiary)] text-[var(--color-on-tertiary)] py-4 rounded-full font-black text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_color-mix(in_oklch,var(--color-tertiary)_30%,transparent)] active:scale-[0.97]"
                    >
                        {t('assessment.back')}
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
                        className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-8 w-full max-w-sm text-center space-y-5 shadow-[0_8px_40px_color-mix(in_oklch,var(--color-error)_10%,transparent)]"
                    >
                        <p className="text-sm text-[var(--color-on-surface-muted)] uppercase tracking-wider font-bold">
                            {t('assessment.title', { level })}
                        </p>
                        <p className="text-6xl font-black tracking-tight text-[var(--color-error)]">
                            {score}%
                        </p>
                        <p className="text-[var(--color-on-surface-muted)] text-sm leading-relaxed">
                            {t('assessment.fail', { pass: LEVEL_FINAL_PASS })}
                        </p>
                    </motion.div>

                    {/* Topics to Review: only the units with a wrong answer */}
                    {weakTopics.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-6 w-full max-w-sm space-y-4 shadow-[var(--shadow-card)]"
                        >
                            <p className="text-sm font-black text-[var(--color-on-surface-muted)]">
                                {t('assessment.reviewTopics')}
                            </p>
                            <div className="space-y-3">
                                {weakTopics.map((topic) => (
                                    <div
                                        key={topic.unitId}
                                        className="flex items-start gap-3 text-sm bg-[var(--color-surface-container)] rounded-2xl p-3"
                                    >
                                        <XCircle className="w-4 h-4 text-[var(--color-error)] mt-0.5 flex-shrink-0" />
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
                            onClick={start}
                            className="w-full bg-[var(--color-tertiary)] text-[var(--color-on-tertiary)] py-4 rounded-full font-black text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_color-mix(in_oklch,var(--color-tertiary)_30%,transparent)] active:scale-[0.97] flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {t('assessment.retry')}
                        </button>

                        <button
                            onClick={onComplete}
                            className="w-full bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-muted)] py-4 rounded-full font-black text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)] active:scale-[0.97] flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('assessment.back')}
                        </button>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return null;
}
