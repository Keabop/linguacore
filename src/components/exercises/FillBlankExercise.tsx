import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AnswerFeedback from './AnswerFeedback';
import { motion } from 'framer-motion';
import type { GrammarExercise } from '../../lib/db';
import { answersMatch } from '../../lib/normalizeAnswer';

interface FillBlankExerciseProps {
    exercise: GrammarExercise;
    onAnswer: (correct: boolean) => void;
}

export default function FillBlankExercise({ exercise, onAnswer }: FillBlankExerciseProps) {
    const { t } = useTranslation();
    const [answer, setAnswer] = useState('');
    const [status, setStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setAnswer('');
        setStatus('pending');
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [exercise.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim() || status !== 'pending') return;

        const isCorrect = answersMatch(answer, exercise.correctAnswer);

        setStatus(isCorrect ? 'correct' : 'incorrect');
    };

    // Split question around the blank marker
    const parts = exercise.question.split('___');

    return (
        <div className="space-y-8">
            {/* Question with blank */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="app-sheet p-6 text-center"
            >
                <p className="text-xl leading-relaxed text-[var(--color-on-surface)]">
                    {parts.map((part, i) => (
                        <span key={i}>
                            <span className="text-[var(--color-on-surface-muted)]">{part}</span>
                            {i < parts.length - 1 && (
                                <span className="inline-block min-w-[80px] border-b-2 border-[var(--color-primary)] mx-1 text-[var(--color-primary)] font-bold">
                                    {status !== 'pending' ? exercise.correctAnswer : '______'}
                                </span>
                            )}
                        </span>
                    ))}
                </p>
            </motion.div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <input
                    ref={inputRef}
                    type="text"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    disabled={status !== 'pending'}
                    className={`w-full bg-[var(--color-surface-container-highest)] rounded-full px-6 py-3.5 text-[var(--color-on-surface)] focus:outline-none transition-all duration-300 ${
                        status === 'correct'
                            ? 'bg-[var(--color-success)]/10 shadow-[0_0_0_3px_var(--color-success)] border-flash-correct'
                            : status === 'incorrect'
                              ? 'bg-[var(--color-error)]/10 shadow-[0_0_0_3px_var(--color-error)] border-flash-incorrect'
                              : 'shadow-[var(--shadow-card)] focus:shadow-[var(--shadow-elevated)]'
                    }`}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                />

                {status === 'pending' && (
                    <button
                        type="submit"
                        disabled={!answer.trim()}
                        className="btn-primary w-full disabled:opacity-40 py-3.5"
                    >
                        {t('exercises.checkAnswer')}
                    </button>
                )}
            </form>

            {/* Feedback */}
            {status !== 'pending' && (
                <AnswerFeedback
                    correct={status === 'correct'}
                    correctAnswer={exercise.correctAnswer}
                    explanation={exercise.explanation}
                    onNext={() => onAnswer(status === 'correct')}
                />
            )}
        </div>
    );
}
