import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { GrammarExercise } from '../../lib/db';
import FillBlankExercise from './FillBlankExercise';
import MultipleChoiceExercise from './MultipleChoiceExercise';
import WordOrderExercise from './WordOrderExercise';

interface ExerciseRunnerProps {
    exercises: GrammarExercise[];
    onComplete: (score: number) => void;
}

export default function ExerciseRunner({ exercises, onComplete }: ExerciseRunnerProps) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [direction, setDirection] = useState(1);

    const total = exercises.length;
    const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

    const handleAnswer = (correct: boolean) => {
        const newCorrectCount = correct ? correctCount + 1 : correctCount;
        if (correct) setCorrectCount(newCorrectCount);

        if (currentIndex + 1 >= total) {
            // All exercises done
            const score = Math.round((newCorrectCount / total) * 100);
            setTimeout(() => {
                setFinished(true);
            }, 300);
        } else {
            // Advance to next
            setDirection(1);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 300);
        }
    };

    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const getScoreColor = () => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-amber-400';
        return 'text-red-400';
    };

    const getScoreBorderColor = () => {
        if (score >= 80) return 'border-emerald-500/30';
        if (score >= 60) return 'border-amber-500/30';
        return 'border-red-500/30';
    };

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 80 : -80,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -80 : 80,
            opacity: 0,
        }),
    };

    if (finished) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
            >
                <div className={`bg-bg-card border ${getScoreBorderColor()} rounded-2xl p-8 w-full max-w-sm text-center space-y-6`}>
                    <div className="space-y-2">
                        <p className="text-sm text-text-muted uppercase tracking-wider font-medium">
                            {t('exercises.title')}
                        </p>
                        <p className={`text-6xl font-extrabold ${getScoreColor()}`}>
                            {score}%
                        </p>
                        <p className="text-text-secondary text-sm">
                            {t('exercises.score', { score })}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                            <Check className="w-4 h-4" />
                            <span className="font-bold">{correctCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-red-400">
                            <X className="w-4 h-4" />
                            <span className="font-bold">{total - correctCount}</span>
                        </div>
                        <div className="text-text-muted">
                            / {total}
                        </div>
                    </div>

                    <button
                        onClick={() => onComplete(score)}
                        className="w-full bg-primary hover:bg-primary-dark text-bg-app py-3 rounded-xl font-bold transition-all active:scale-[0.98]"
                    >
                        {t('exercises.finish')}
                    </button>
                </div>
            </motion.div>
        );
    }

    const currentExercise = exercises[currentIndex];

    const renderExercise = () => {
        switch (currentExercise.type) {
            case 'fill-blank':
                return (
                    <FillBlankExercise
                        key={currentExercise.id}
                        exercise={currentExercise}
                        onAnswer={handleAnswer}
                    />
                );
            case 'multiple-choice':
                return (
                    <MultipleChoiceExercise
                        key={currentExercise.id}
                        exercise={currentExercise}
                        onAnswer={handleAnswer}
                    />
                );
            case 'word-order':
                return (
                    <WordOrderExercise
                        key={currentExercise.id}
                        exercise={currentExercise}
                        onAnswer={handleAnswer}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress indicator */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary font-medium">
                        {t('exercises.progress', { current: currentIndex + 1, total })}
                    </span>
                    <span className="text-text-muted text-xs">
                        {t('exercises.title')}
                    </span>
                </div>
                <div className="h-2 bg-bg-app rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Exercise content with slide transitions */}
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentExercise.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                    {renderExercise()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
