import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import type { GrammarExercise } from '../../lib/db';

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

        const normalized = answer.trim().toLowerCase();
        const target = exercise.correctAnswer.trim().toLowerCase();
        const isCorrect = normalized === target;

        setStatus(isCorrect ? 'correct' : 'incorrect');
    };

    // Split question around the blank marker
    const parts = exercise.question.split('___');

    return (
        <div className="space-y-6">
            {/* Question with blank */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-card border border-border rounded-2xl p-6 text-center"
            >
                <p className="text-xl leading-relaxed text-text-primary">
                    {parts.map((part, i) => (
                        <span key={i}>
                            <span className="text-text-secondary">{part}</span>
                            {i < parts.length - 1 && (
                                <span className="inline-block min-w-[80px] border-b-2 border-primary mx-1 text-primary font-bold">
                                    {status !== 'pending' ? exercise.correctAnswer : '______'}
                                </span>
                            )}
                        </span>
                    ))}
                </p>
            </motion.div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    ref={inputRef}
                    type="text"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    disabled={status !== 'pending'}
                    className={`w-full bg-bg-app border rounded-xl px-4 py-3 text-text-primary focus:outline-none transition-all ${
                        status === 'correct'
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : status === 'incorrect'
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-border focus:border-primary'
                    }`}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                />

                {status === 'pending' && (
                    <button
                        type="submit"
                        disabled={!answer.trim()}
                        className="w-full bg-primary hover:bg-primary-dark disabled:opacity-40 text-bg-app py-3 rounded-xl font-bold transition-all active:scale-[0.98]"
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
                    className="space-y-4"
                >
                    <div className="text-center">
                        <p className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                            <Check className="w-5 h-5" /> {t('exercises.correct')}
                        </p>
                    </div>
                    <div className="bg-bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-text-secondary leading-relaxed">{exercise.explanation}</p>
                    </div>
                    <button
                        onClick={() => onAnswer(true)}
                        className="w-full bg-primary hover:bg-primary-dark text-bg-app py-3 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {t('exercises.next')} <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            )}

            {status === 'incorrect' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <div className="text-center space-y-2">
                        <p className="text-lg font-bold text-red-400 flex items-center justify-center gap-1.5">
                            <X className="w-5 h-5" /> {t('exercises.incorrect')}
                        </p>
                        <p className="text-sm text-text-secondary">
                            <span className="text-primary font-bold">{exercise.correctAnswer}</span>
                        </p>
                    </div>
                    <div className="bg-bg-card border border-border rounded-xl p-4">
                        <p className="text-sm text-text-secondary leading-relaxed">{exercise.explanation}</p>
                    </div>
                    <button
                        onClick={() => onAnswer(false)}
                        className="w-full bg-primary hover:bg-primary-dark text-bg-app py-3 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {t('exercises.next')} <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
