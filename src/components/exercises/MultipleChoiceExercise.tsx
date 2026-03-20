import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import type { GrammarExercise } from '../../lib/db';

interface MultipleChoiceExerciseProps {
    exercise: GrammarExercise;
    onAnswer: (correct: boolean) => void;
}

export default function MultipleChoiceExercise({ exercise, onAnswer }: MultipleChoiceExerciseProps) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<string | null>(null);
    const [status, setStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');

    const handleSelect = (option: string) => {
        if (status !== 'pending') return;

        setSelected(option);
        const isCorrect = option.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
        setStatus(isCorrect ? 'correct' : 'incorrect');
    };

    const getOptionStyle = (option: string) => {
        if (status === 'pending') {
            return 'bg-bg-app border border-border hover:border-primary/50';
        }

        const isSelected = option === selected;
        const isCorrectOption = option.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

        if (isCorrectOption) {
            return 'border-emerald-500 bg-emerald-500/10';
        }
        if (isSelected && !isCorrectOption) {
            return 'border-red-500 bg-red-500/10';
        }
        return 'bg-bg-app border border-border opacity-50';
    };

    const getOptionFeedbackClass = (option: string) => {
        if (status === 'pending') return '';
        const isCorrectOption = option.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
        if (isCorrectOption) return 'border-flash-correct';
        if (option === selected && !isCorrectOption) return 'border-flash-incorrect';
        return '';
    };

    const getOptionIcon = (option: string) => {
        if (status === 'pending') return null;

        const isSelected = option === selected;
        const isCorrectOption = option.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

        if (isCorrectOption) {
            return <Check className="w-5 h-5 text-emerald-400 shrink-0" />;
        }
        if (isSelected && !isCorrectOption) {
            return <X className="w-5 h-5 text-red-400 shrink-0" />;
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Question */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-card border border-border rounded-2xl p-6 text-center"
            >
                <p className="text-xl leading-relaxed text-text-primary">{exercise.question}</p>
            </motion.div>

            {/* Options */}
            <div className="space-y-5">
                {exercise.options?.map((option, i) => (
                    <motion.button
                        key={option}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={() => handleSelect(option)}
                        disabled={status !== 'pending'}
                        className={`relative w-full rounded-xl p-5 text-left transition-all flex items-center justify-between gap-3 ${getOptionStyle(option)} ${
                            status === 'pending' ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                        } ${getOptionFeedbackClass(option)}`}
                    >
                        <span className="text-text-primary font-medium">{option}</span>
                        {getOptionIcon(option)}
                    </motion.button>
                ))}
            </div>

            {/* Feedback */}
            {status !== 'pending' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-5"
                >
                    <div className="text-center">
                        {status === 'correct' ? (
                            <p className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                                <Check className="w-5 h-5" /> {t('exercises.correct')}
                            </p>
                        ) : (
                            <p className="text-lg font-bold text-red-400 flex items-center justify-center gap-1.5">
                                <X className="w-5 h-5" /> {t('exercises.incorrect')}
                            </p>
                        )}
                    </div>
                    <div className="bg-bg-card border border-border rounded-xl p-5">
                        <p className="text-sm text-text-secondary leading-relaxed">{exercise.explanation}</p>
                    </div>
                    <button
                        onClick={() => onAnswer(status === 'correct')}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {t('exercises.next')} <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
