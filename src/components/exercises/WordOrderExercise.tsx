import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AnswerFeedback from './AnswerFeedback';
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion';
import type { GrammarExercise } from '../../lib/db';
import { answersMatch } from '../../lib/normalizeAnswer';

interface WordOrderExerciseProps {
    exercise: GrammarExercise;
    onAnswer: (correct: boolean) => void;
}

/** One word of the sentence, with an id of its own: the same word can appear twice */
interface Token {
    id: string;
    word: string;
}

export default function WordOrderExercise({ exercise, onAnswer }: WordOrderExerciseProps) {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();
    const [placedWords, setPlacedWords] = useState<Token[]>([]);
    const [availableWords, setAvailableWords] = useState<Token[]>([]);
    const [status, setStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');

    useEffect(() => {
        setPlacedWords([]);
        setAvailableWords((exercise.scrambledWords ?? []).map((word, i) => ({ id: `${exercise.id}-${i}`, word })));
        setStatus('pending');
    }, [exercise.id, exercise.scrambledWords]);

    // A tapped word keeps its id, so it flies to the other row and only that chip moves; the rest
    // keep their place instead of remounting (keys by position made every chip blink)
    const handlePlaceWord = (token: Token) => {
        if (status !== 'pending') return;
        setAvailableWords(words => words.filter(w => w.id !== token.id));
        setPlacedWords(words => [...words, token]);
    };

    const handleRemoveWord = (token: Token) => {
        if (status !== 'pending') return;
        setPlacedWords(words => words.filter(w => w.id !== token.id));
        setAvailableWords(words => [...words, token]);
    };

    const handleCheck = () => {
        const builtSentence = placedWords.map(w => w.word).join(' ');
        const isCorrect = answersMatch(builtSentence, exercise.correctAnswer);
        setStatus(isCorrect ? 'correct' : 'incorrect');
    };

    const allPlaced = availableWords.length === 0 && placedWords.length > 0;

    const chipMotion = {
        layout: 'position' as const,
        transition: reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 520, damping: 38, mass: 0.7 },
        whileTap: reduceMotion ? undefined : { scale: 0.94 },
    };

    return (
        <div className="space-y-8">
            {/* Instruction */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="app-sheet p-6 text-center"
            >
                <p className="text-xl leading-relaxed text-[var(--color-on-surface)]">{exercise.question}</p>
            </motion.div>

            <LayoutGroup id={`word-order-${exercise.id}`}>
                {/* Answer area */}
                <div
                    className={`min-h-[72px] bg-[var(--color-card)] rounded-[var(--radius-lg)] p-4 transition-[background-color,box-shadow] duration-300 ${
                        status === 'correct'
                            ? 'bg-[var(--color-success)]/10 shadow-[0_0_0_3px_var(--color-success)] border-flash-correct'
                            : status === 'incorrect'
                              ? 'bg-[var(--color-error)]/10 shadow-[0_0_0_3px_var(--color-error)] border-flash-incorrect'
                              : 'shadow-[var(--shadow-card)]'
                    }`}
                >
                    <div className="flex flex-wrap gap-3 min-h-[40px] items-center">
                        <AnimatePresence initial={false}>
                            {placedWords.length === 0 && status === 'pending' && (
                                <motion.span
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                    className="text-sm text-[var(--color-on-surface-muted)]"
                                >
                                    ...
                                </motion.span>
                            )}
                        </AnimatePresence>
                        {placedWords.map(token => (
                            <motion.button
                                key={token.id}
                                layoutId={token.id}
                                {...chipMotion}
                                type="button"
                                onClick={() => handleRemoveWord(token)}
                                disabled={status !== 'pending'}
                                className={`word-chip is-placed ${status === 'pending' ? '' : 'cursor-default'}`}
                            >
                                {token.word}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Available words pool */}
                {status === 'pending' && (
                    <div className="flex flex-wrap gap-3 justify-center">
                        {availableWords.map(token => (
                            <motion.button
                                key={token.id}
                                layoutId={token.id}
                                {...chipMotion}
                                type="button"
                                onClick={() => handlePlaceWord(token)}
                                className="word-chip"
                            >
                                {token.word}
                            </motion.button>
                        ))}
                    </div>
                )}
            </LayoutGroup>

            {/* Check button */}
            {status === 'pending' && (
                <button
                    onClick={handleCheck}
                    disabled={!allPlaced}
                    className="btn-primary w-full disabled:opacity-40 py-3.5"
                >
                    {t('exercises.checkAnswer')}
                </button>
            )}

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
