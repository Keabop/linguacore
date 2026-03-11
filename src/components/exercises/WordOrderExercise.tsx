import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import type { GrammarExercise } from '../../lib/db';

interface WordOrderExerciseProps {
    exercise: GrammarExercise;
    onAnswer: (correct: boolean) => void;
}

export default function WordOrderExercise({ exercise, onAnswer }: WordOrderExerciseProps) {
    const { t } = useTranslation();
    const [placedWords, setPlacedWords] = useState<string[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [status, setStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');

    useEffect(() => {
        setPlacedWords([]);
        setAvailableWords(exercise.scrambledWords ? [...exercise.scrambledWords] : []);
        setStatus('pending');
    }, [exercise.id, exercise.scrambledWords]);

    const handlePlaceWord = (word: string, index: number) => {
        if (status !== 'pending') return;

        const newAvailable = [...availableWords];
        newAvailable.splice(index, 1);
        setAvailableWords(newAvailable);
        setPlacedWords([...placedWords, word]);
    };

    const handleRemoveWord = (word: string, index: number) => {
        if (status !== 'pending') return;

        const newPlaced = [...placedWords];
        newPlaced.splice(index, 1);
        setPlacedWords(newPlaced);
        setAvailableWords([...availableWords, word]);
    };

    const handleCheck = () => {
        const builtSentence = placedWords.join(' ');
        const isCorrect = builtSentence.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
        setStatus(isCorrect ? 'correct' : 'incorrect');
    };

    const allPlaced = availableWords.length === 0 && placedWords.length > 0;

    const chipVariants = {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
    };

    return (
        <div className="space-y-8">
            {/* Instruction */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-card border border-border rounded-2xl p-6 text-center"
            >
                <p className="text-xl leading-relaxed text-text-primary">{exercise.question}</p>
            </motion.div>

            {/* Answer area */}
            <div
                className={`min-h-[72px] bg-bg-card border rounded-2xl p-4 transition-all ${
                    status === 'correct'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : status === 'incorrect'
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-border'
                }`}
            >
                <div className="flex flex-wrap gap-3 min-h-[40px] items-center">
                    <AnimatePresence mode="popLayout">
                        {placedWords.length === 0 && status === 'pending' && (
                            <motion.span
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm text-text-muted italic"
                            >
                                ...
                            </motion.span>
                        )}
                        {placedWords.map((word, i) => (
                            <motion.button
                                key={`placed-${word}-${i}`}
                                variants={chipVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                layout
                                onClick={() => handleRemoveWord(word, i)}
                                disabled={status !== 'pending'}
                                className={`bg-primary/20 border border-primary/40 rounded-lg px-4 py-2.5 text-sm font-medium text-text-primary transition-all ${
                                    status === 'pending' ? 'cursor-pointer hover:bg-primary/30 active:scale-95' : 'cursor-default'
                                }`}
                            >
                                {word}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Available words pool */}
            {status === 'pending' && (
                <div className="flex flex-wrap gap-3 justify-center">
                    <AnimatePresence mode="popLayout">
                        {availableWords.map((word, i) => (
                            <motion.button
                                key={`available-${word}-${i}`}
                                variants={chipVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                layout
                                onClick={() => handlePlaceWord(word, i)}
                                className="bg-bg-app border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-text-primary cursor-pointer hover:border-primary/50 active:scale-95 transition-all"
                            >
                                {word}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Check button */}
            {status === 'pending' && (
                <button
                    onClick={handleCheck}
                    disabled={!allPlaced}
                    className="w-full bg-primary hover:bg-primary-dark disabled:opacity-40 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]"
                >
                    {t('exercises.checkAnswer')}
                </button>
            )}

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
                    <div className="bg-bg-card border border-border rounded-xl p-5">
                        <p className="text-sm text-text-secondary leading-relaxed">{exercise.explanation}</p>
                    </div>
                    <button
                        onClick={() => onAnswer(true)}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
                        <p className="text-sm text-text-secondary">
                            <span className="text-primary font-bold">{exercise.correctAnswer}</span>
                        </p>
                    </div>
                    <div className="bg-bg-card border border-border rounded-xl p-5">
                        <p className="text-sm text-text-secondary leading-relaxed">{exercise.explanation}</p>
                    </div>
                    <button
                        onClick={() => onAnswer(false)}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {t('exercises.next')} <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
