import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
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
                className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-2xl p-6 text-center"
            >
                <p className="text-xl leading-relaxed text-[var(--color-on-surface)]">
                    {parts.map((part, i) => (
                        <span key={i}>
                            <span className="text-[var(--color-on-surface-muted)]">{part}</span>
                            {i < parts.length - 1 && (
                                <span className="inline-block min-w-[80px] border-b-2 border-primary mx-1 text-[var(--color-primary)] font-bold">
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
                    className={`w-full bg-[var(--color-background)] border rounded-xl px-5 py-3.5 text-[var(--color-on-surface)] focus:outline-none transition-all ${
                        status === 'correct'
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : status === 'incorrect'
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-[var(--color-outline-subtle)] focus:border-[var(--color-primary)]'
                    }`}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                />

                {status === 'pending' && (
                    <button
                        type="submit"
                        disabled={!answer.trim()}
                        className="w-full bg-[var(--color-primary)] hover:brightness-90 disabled:opacity-40 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]"
                    >
                        {t('exercises.checkAnswer')}
                    </button>
                )}
            </form>

            {/* Feedback */}
            {status === 'correct' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-5"
                >
                    <div className="text-center">
                        <p className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                            <Check className="w-5 h-5" /> {t('exercises.correct')}
                        </p>
                    </div>
                    <div className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-5">
                        <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{exercise.explanation}</p>
                    </div>
                    <button
                        onClick={() => onAnswer(true)}
                        className="w-full bg-[var(--color-primary)] hover:brightness-90 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {t('exercises.next')} <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            )}

            {status === 'incorrect' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-5"
                >
                    <div className="text-center space-y-2">
                        <p className="text-lg font-bold text-red-400 flex items-center justify-center gap-1.5">
                            <X className="w-5 h-5" /> {t('exercises.incorrect')}
                        </p>
                        <p className="text-sm text-[var(--color-on-surface-muted)]">
                            <span className="text-[var(--color-primary)] font-bold">{exercise.correctAnswer}</span>
                        </p>
                    </div>
                    <div className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-5">
                        <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{exercise.explanation}</p>
                    </div>
                    <button
                        onClick={() => onAnswer(false)}
                        className="w-full bg-[var(--color-primary)] hover:brightness-90 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {t('exercises.next')} <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
