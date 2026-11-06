import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BookmarkPlus, Check, ChevronRight, Footprints, Lightbulb, MessagesSquare, MicOff, Play } from 'lucide-react';
import PageHead from '../components/ui/PageHead';
import BackButton from '../components/ui/BackButton';
import SpeakButton from '../components/ui/SpeakButton';
import ExerciseRunner from '../components/exercises/ExerciseRunner';
import SpeakingRunner from '../components/speaking/SpeakingRunner';
import RetryReview from '../components/RetryReview';
import { useSessionState } from '../hooks/useSessionState';
import { firstStepsLessons, FIRST_STEPS_UNIT, type FirstStepsLesson } from '../data/firstSteps';
import { phraseSounds } from '../lib/phraseSounds';
import { useFirstSteps } from '../hooks/useFirstSteps';
import { comprehensionExercises, guidedWritingExercises } from '../lib/comprehension';
import { canSpeak, speakLines } from '../lib/speakEnglish';
import { useCards } from '../hooks/useCards';
import { PASS_SCORE, fromExercises, retryVerdict, shortReview, type ReviewItem } from '../lib/retryPolicy';
import type { GrammarExercise, SpeakingPrompt } from '../lib/db';

type View = { lesson: FirstStepsLesson; mode: 'learn' | 'practice' | 'repeat' } | null;

/**
 * «Primeros pasos», the unit 0 for whoever starts from zero: five lessons of phrases and a short
 * dialogue to hear and understand, words for the review, a practice by listening, meaning and
 * writing, and phrases to say aloud. Optional, before unit 1.
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
                // Done once the practice passes; saying it aloud comes after and is optional
                onDone={() => { setView({ lesson: view.lesson, mode: 'repeat' }); void completeLesson(view.lesson.id); }}
            />
        );
    }
    if (view?.mode === 'repeat') {
        return <LessonRepeat lesson={view.lesson} onDone={() => setView(null)} />;
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
                                {item.note && <p className="text-sm text-[var(--color-on-surface)] mt-1">{item.note}</p>}
                            </div>
                        </motion.li>
                    );
                })}
            </ul>
            <LessonDialogue lesson={lesson} />
            <LessonWords lesson={lesson} />
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
    const [attempt, setAttempt, forgetAttempt] = useSessionState(`voxie-tries:${FIRST_STEPS_UNIT}:${lesson.id}`, 1);
    const [review, setReview] = useState<{ score: number; items: ReviewItem[]; canContinue: boolean } | null>(null);
    const finish = () => {
        forgetAttempt();
        onDone();
    };
    const exercises = useMemo<GrammarExercise[]>(
        () => [
            ...comprehensionExercises(lesson.items, `${FIRST_STEPS_UNIT}-${lesson.id}-${attempt}`, lesson.practice),
            ...guidedWritingExercises(lesson.writing, `${FIRST_STEPS_UNIT}-${lesson.id}-${attempt}`),
        ],
        [lesson, attempt],
    );

    const handleComplete = (score: number, missed: GrammarExercise[] = []) => {
        const verdict = retryVerdict('exercises', score, attempt);
        if (verdict === 'pass') {
            finish();
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
                    onContinue={finish}
                />
            ) : (
                <ExerciseRunner key={attempt} exercises={exercises} passScore={PASS_SCORE.exercises} onComplete={handleComplete} />
            )}
        </div>
    );
}

/** The lesson's phrases in use: a short dialogue, each line heard and translated, or all in a row. */
function LessonDialogue({ lesson }: { lesson: FirstStepsLesson }) {
    const { t } = useTranslation();
    return (
        <section className="app-sheet p-5 space-y-4" aria-labelledby={`dialogue-${lesson.id}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 id={`dialogue-${lesson.id}`} className="app-h3 flex items-center gap-2">
                    <MessagesSquare className="w-5 h-5 text-[var(--color-primary)]" aria-hidden="true" />
                    {t('firstSteps.dialogueTitle')}
                </h3>
                {canSpeak() && (
                    <button type="button" onClick={() => speakLines(lesson.dialogue.map(line => line.en))} className="btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2">
                        <Play className="w-4 h-4" aria-hidden="true" /> {t('firstSteps.playDialogue')}
                    </button>
                )}
            </div>
            <ol className="space-y-3">
                {lesson.dialogue.map((line, i) => (
                    <li key={i} className="first-steps-line">
                        <span className="first-steps-who">{line.who}</span>
                        <SpeakButton text={line.en} />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[var(--color-on-surface)]" lang="en">{line.en}</p>
                            <p className="text-sm text-[var(--color-on-surface-muted)]">{line.es}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}

/** The lesson's words go to the review with one tap (words already there are skipped). */
function LessonWords({ lesson }: { lesson: FirstStepsLesson }) {
    const { t } = useTranslation();
    const { saveStoryWords } = useCards();
    const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    if (!lesson.words.length) return null;
    const add = async () => {
        setState('saving');
        try {
            await saveStoryWords(FIRST_STEPS_UNIT, lesson.words, [], { countLearned: false });
            setState('saved');
        } catch {
            setState('error');
        }
    };
    return (
        <div className="space-y-1.5">
            <button
                type="button"
                onClick={add}
                disabled={state === 'saving' || state === 'saved'}
                className="btn-secondary w-full py-3 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {state === 'saved' ? <Check className="w-4 h-4" aria-hidden="true" /> : <BookmarkPlus className="w-4 h-4" aria-hidden="true" />}
                {state === 'saved' ? t('firstSteps.wordsAdded') : t('firstSteps.addWords', { count: lesson.words.length })}
            </button>
            <p role="status" className={`text-xs text-center ${state === 'error' ? 'text-[var(--color-error)]' : 'text-[var(--color-on-surface-muted)]'}`}>
                {state === 'error' ? t('firstSteps.wordsError') : t('firstSteps.wordsHint')}
            </p>
        </div>
    );
}

/** At the end of a lesson: a few phrases said aloud, compared with what was heard. Optional. */
function LessonRepeat({ lesson, onDone }: { lesson: FirstStepsLesson; onDone: () => void }) {
    const { t } = useTranslation();
    const prompts = useMemo<SpeakingPrompt[]>(() => lesson.repeat.map((text, i) => ({
        id: `${FIRST_STEPS_UNIT}-${lesson.id}-say-${i}`,
        unitId: FIRST_STEPS_UNIT,
        type: 'read-aloud',
        level: 'A1',
        instruction: t('firstSteps.repeatInstruction'),
        targetText: text,
    })), [lesson, t]);
    return (
        <div className="space-y-6">
            <BackButton onClick={onDone} label={t('firstSteps.allLessons')} />
            <PageHead title={t('firstSteps.repeatTitle')} lead={t('firstSteps.repeatLead')} />
            <SpeakingRunner prompts={prompts} level="A1" onComplete={onDone} />
            <button type="button" onClick={onDone} className="btn-secondary w-full py-3 text-sm inline-flex items-center justify-center gap-2">
                <MicOff className="w-4 h-4" aria-hidden="true" /> {t('firstSteps.skipRepeat')}
            </button>
        </div>
    );
}
