import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronRight, Footprints, Lightbulb } from 'lucide-react';
import PageHead from '../components/ui/PageHead';
import BackButton from '../components/ui/BackButton';
import SpeakButton from '../components/ui/SpeakButton';
import ExerciseRunner from '../components/exercises/ExerciseRunner';
import RetryReview from '../components/RetryReview';
import { firstStepsLessons, FIRST_STEPS_UNIT, type FirstStepsLesson } from '../data/firstSteps';
import { a1Phonetics } from '../data/vocabulary/phonetics/a1';
import { useFirstSteps } from '../hooks/useFirstSteps';
import { comprehensionExercises } from '../lib/comprehension';
import { PASS_SCORE, fromExercises, retryVerdict, shortReview, type ReviewItem } from '../lib/retryPolicy';
import { soundsLike } from '../lib/soundsLike';
import type { GrammarExercise } from '../lib/db';

/** «Nice to meet you» in Spanish letters, when every word has its IPA in the A1 deck. */
function phraseSounds(en: string): string {
    const words = en.toLowerCase().replace(/[^a-z' ]/g, '').split(/\s+/).filter(Boolean);
    const ipa = words.map(w => a1Phonetics[w]);
    return ipa.every(Boolean) ? ipa.map(soundsLike).join(' ') : '';
}

type View = { lesson: FirstStepsLesson; mode: 'learn' | 'practice' } | null;

/**
 * «Primeros pasos», the unit 0 for whoever starts from zero: five lessons of phrases to hear,
 * understand and repeat, each practiced by listening and by meaning. Optional, before unit 1.
 */
export default function FirstSteps() {
    const { t } = useTranslation();
    const { done, finished, completeLesson } = useFirstSteps();
    const [view, setView] = useState<View>(null);

    if (view?.mode === 'learn') {
        return <LessonLearn lesson={view.lesson} onBack={() => setView(null)} onPractice={() => setView({ lesson: view.lesson, mode: 'practice' })} />;
    }
    if (view?.mode === 'practice') {
        return (
            <LessonPractice
                lesson={view.lesson}
                onBack={() => setView({ lesson: view.lesson, mode: 'learn' })}
                onDone={async () => { await completeLesson(view.lesson.id); setView(null); }}
            />
        );
    }

    const next = firstStepsLessons.find(l => !done.includes(l.id));
    return (
        <div className="space-y-8">
            <BackButton to="/path" />
            <PageHead
                title={t('firstSteps.title')}
                lead={t('firstSteps.lead')}
                meta={[t('firstSteps.count', { done: done.length, total: firstStepsLessons.length })]}
            />

            {finished && (
                <div className="app-sheet p-6 space-y-3">
                    <p className="app-h3">{t('firstSteps.finishedTitle')}</p>
                    <p className="text-sm text-[var(--color-on-surface-muted)]">{t('firstSteps.finishedBody')}</p>
                    <Link to="/path/a1-u1" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
                        {t('firstSteps.goToUnit1')} <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                </div>
            )}

            <ol className="space-y-3" aria-label={t('firstSteps.lessons')}>
                {firstStepsLessons.map((lesson, i) => {
                    const isDone = done.includes(lesson.id);
                    return (
                        <li key={lesson.id}>
                            <button
                                type="button"
                                onClick={() => setView({ lesson, mode: 'learn' })}
                                className={`first-steps-lesson ${lesson === next ? 'is-next' : ''}`}
                            >
                                <span className="first-steps-number" aria-hidden="true">
                                    {isDone ? <Check className="w-4 h-4" /> : i + 1}
                                </span>
                                <span className="flex-1 min-w-0 text-left">
                                    <span className="block font-semibold text-[var(--color-on-surface)]">{lesson.title}</span>
                                    <span className="block text-xs text-[var(--color-on-surface-muted)]">
                                        {isDone ? t('firstSteps.done') : t('firstSteps.phrases', { count: lesson.items.length })}
                                    </span>
                                </span>
                                <ChevronRight className="w-5 h-5 text-[var(--color-on-surface-muted)]" aria-hidden="true" />
                            </button>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

function LessonLearn({ lesson, onBack, onPractice }: { lesson: FirstStepsLesson; onBack: () => void; onPractice: () => void }) {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();
    return (
        <div className="space-y-6">
            <BackButton onClick={onBack} label={t('firstSteps.allLessons')} />
            <PageHead title={lesson.title} lead={lesson.intro} />
            <ul className="space-y-2.5">
                {lesson.items.map((item, i) => {
                    const sounds = phraseSounds(item.en);
                    return (
                        <motion.li
                            key={item.en}
                            initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.04, 0.4) }}
                            className="first-steps-phrase"
                        >
                            <SpeakButton text={item.en} />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[1.0625rem] text-[var(--color-on-surface)]" lang="en">{item.en}</p>
                                {sounds && <p className="sounds-like">{t('audio.soundsLike')} <b>{sounds}</b></p>}
                                <p className="text-sm text-[var(--color-on-surface-muted)]">{item.es}</p>
                            </div>
                        </motion.li>
                    );
                })}
            </ul>
            {lesson.tip && (
                <p className="app-sheet p-5 text-sm leading-relaxed flex gap-3">
                    <Lightbulb className="w-5 h-5 shrink-0 text-accent-orange" aria-hidden="true" />
                    <span>{lesson.tip}</span>
                </p>
            )}
            <button type="button" onClick={onPractice} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                <Footprints className="w-4 h-4" aria-hidden="true" /> {t('firstSteps.practice')}
            </button>
        </div>
    );
}

function LessonPractice({ lesson, onBack, onDone }: { lesson: FirstStepsLesson; onBack: () => void; onDone: () => void }) {
    const { t } = useTranslation();
    const [attempt, setAttempt] = useState(1);
    const [review, setReview] = useState<{ score: number; items: ReviewItem[]; canContinue: boolean } | null>(null);
    const best = useRef(0);
    const exercises = useMemo<GrammarExercise[]>(
        () => comprehensionExercises(lesson.items, `${FIRST_STEPS_UNIT}-${lesson.id}-${attempt}`, lesson.practice),
        [lesson, attempt],
    );

    const handleComplete = (score: number, missed: GrammarExercise[] = []) => {
        best.current = Math.max(best.current, score);
        const verdict = retryVerdict('exercises', score, attempt);
        if (verdict === 'pass') {
            onDone();
            return;
        }
        setReview({ score, items: shortReview(fromExercises(missed)), canContinue: verdict === 'may-continue' });
    };

    return (
        <div className="space-y-6">
            <BackButton onClick={onBack} label={lesson.title} />
            <PageHead title={t('firstSteps.practiceTitle')} lead={lesson.title} />
            {review ? (
                <RetryReview
                    part="exercises"
                    unitId={FIRST_STEPS_UNIT}
                    score={review.score}
                    items={review.items}
                    canContinue={review.canContinue}
                    onRetry={() => { setReview(null); setAttempt(n => n + 1); }}
                    onContinue={onDone}
                />
            ) : (
                <ExerciseRunner key={attempt} exercises={exercises} passScore={PASS_SCORE.exercises} onComplete={handleComplete} />
            )}
        </div>
    );
}
