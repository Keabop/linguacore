import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AnswerFeedback from './AnswerFeedback';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { GrammarExercise } from '../../lib/db';
import { shuffle } from '../../lib/shuffle';

interface MultipleChoiceExerciseProps {
    exercise: GrammarExercise;
    onAnswer: (correct: boolean) => void;
}

export default function MultipleChoiceExercise({ exercise, onAnswer }: MultipleChoiceExerciseProps) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<string | null>(null);
    const [status, setStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');
    // The data lists the right answer early most of the time, so the order is shuffled per exercise
    const options = useMemo(() => shuffle(exercise.options ?? []), [exercise.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSelect = (option: string) => {
        if (status !== 'pending') return;

        setSelected(option);
        const isCorrect = option.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
        setStatus(isCorrect ? 'correct' : 'incorrect');
    };

    const getOptionStyle = (option: string) => {
        if (status === 'pending') {
            return 'bg-[var(--color-card)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5';
        }

        const isSelected = option === selected;
        const isCorrectOption = option.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

        if (isCorrectOption) {
            return 'bg-[var(--color-success)]/10 shadow-[0_0_0_3px_var(--color-success)]';
        }
        if (isSelected && !isCorrectOption) {
            return 'bg-[var(--color-error)]/10 shadow-[0_0_0_3px_var(--color-error)]';
        }
        return 'bg-[var(--color-card)] shadow-[var(--shadow-card)] opacity-50';
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
            return <Check className="w-5 h-5 text-[var(--color-success)] shrink-0" />;
        }
        if (isSelected && !isCorrectOption) {
            return <X className="w-5 h-5 text-[var(--color-error)] shrink-0" />;
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Question */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="app-sheet p-6 text-center"
            >
                <p className="text-xl leading-relaxed text-[var(--color-on-surface)]">{exercise.question}</p>
            </motion.div>

            {/* Options */}
            <div className="space-y-5">
                {options.map((option, i) => (
                    <motion.button
                        key={option}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={() => handleSelect(option)}
                        disabled={status !== 'pending'}
                        className={`relative w-full rounded-2xl p-4 text-left transition-all duration-300 flex items-center justify-between gap-3 ${getOptionStyle(option)} ${
                            status === 'pending' ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                        } ${getOptionFeedbackClass(option)}`}
                    >
                        <span className="text-[var(--color-on-surface)] font-medium">{option}</span>
                        {getOptionIcon(option)}
                    </motion.button>
                ))}
            </div>

            {/* Feedback */}
            {status !== 'pending' && (
                <AnswerFeedback
                    correct={status === 'correct'}
                    explanation={exercise.explanation}
                    onNext={() => onAnswer(status === 'correct')}
                />
            )}
        </div>
    );
}
