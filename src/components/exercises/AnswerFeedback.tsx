import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import PlayOnMount from '../icons/PlayOnMount';
import { CheckIcon } from '../icons';

interface AnswerFeedbackProps {
    correct: boolean;
    /** Shown after a wrong answer */
    correctAnswer?: string;
    explanation?: string;
    onNext: () => void;
}

/**
 * Time to read the explanation before a right answer moves on by itself: a moment to see the
 * result plus about a quarter of a second per word, within 2.5 and 7 seconds.
 */
export function readingTime(text = ''): number {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return Math.min(7000, Math.max(2500, 1800 + words * 220));
}

/**
 * The result of an exercise. A right answer moves on by itself once there was time to read why
 * (the button fills while it waits, and a tap moves on now); a wrong one waits for the learner,
 * who has the right answer to look at. On a phone the block scrolls into view with its button.
 */
export default function AnswerFeedback({ correct, correctAnswer, explanation, onNext }: AnswerFeedbackProps) {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const done = useRef(false);
    const [waitMs] = useState(() => readingTime(explanation));
    const [paused, setPaused] = useState(false);

    const next = () => {
        if (done.current) return;
        done.current = true;
        onNext();
    };

    // The button below the explanation is often off screen on a phone: bring it up
    useEffect(() => {
        buttonRef.current?.scrollIntoView?.({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    }, [reduceMotion]);

    // Counting down only while the page is in view, so a learner who left doesn't come back further on
    useEffect(() => {
        if (!correct) return;
        let remaining = waitMs;
        let startedAt = Date.now();
        let timer: ReturnType<typeof setTimeout> | undefined = setTimeout(next, remaining);
        const onVisibility = () => {
            if (document.hidden) {
                clearTimeout(timer);
                timer = undefined;
                remaining -= Date.now() - startedAt;
                setPaused(true);
            } else if (!timer) {
                startedAt = Date.now();
                timer = setTimeout(next, Math.max(remaining, 800));
                setPaused(false);
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [correct, waitMs]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
        >
            <div className="text-center space-y-2">
                {correct ? (
                    <p className="text-lg font-bold text-[var(--color-success)] flex items-center justify-center gap-1.5">
                        <PlayOnMount icon={CheckIcon} size={20} /> {t('exercises.correct')}
                    </p>
                ) : (
                    <>
                        <p className="text-lg font-bold text-[var(--color-error)] flex items-center justify-center gap-1.5">
                            <X className="w-5 h-5" aria-hidden="true" /> {t('exercises.incorrect')}
                        </p>
                        {correctAnswer && (
                            <p className="text-sm text-[var(--color-on-surface-muted)]">
                                <span className="text-[var(--color-primary)] font-bold">{correctAnswer}</span>
                            </p>
                        )}
                    </>
                )}
            </div>
            {explanation && (
                <div className="card p-5">
                    <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{explanation}</p>
                </div>
            )}
            <button
                ref={buttonRef}
                type="button"
                onClick={next}
                aria-describedby={correct ? 'answer-auto-next' : undefined}
                className={`btn-primary answer-next w-full py-3.5 flex items-center justify-center gap-2 ${correct ? 'is-counting' : ''} ${paused ? 'is-paused' : ''}`}
                style={correct ? { ['--answer-wait' as string]: `${waitMs}ms` } : undefined}
            >
                <span className="relative inline-flex items-center gap-2">
                    {t('exercises.next')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
            </button>
            {correct && <p id="answer-auto-next" className="sr-only">{t('exercises.autoNext')}</p>}
        </motion.div>
    );
}
