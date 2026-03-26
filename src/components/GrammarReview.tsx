import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import type { SkillCard, GrammarSkill } from '../lib/db';
import { Rating } from '../lib/fsrs';
import { type ReviewDepth } from '../hooks/useSkillCards';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface Props {
    skillCard: SkillCard;
    skill: GrammarSkill;
    depth: ReviewDepth;
    onComplete: (rating: Rating) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function GrammarReview({ skillCard, skill, depth, onComplete }: Props) {
    const { t } = useTranslation();
    const exerciseCount = depth === 'mini_quiz' ? Math.min(4, skill.exercises.length) : Math.min(7, skill.exercises.length);
    const [exercises] = useState(() => shuffleArray(skill.exercises).slice(0, exerciseCount));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [showTip, setShowTip] = useState(depth === 'deep_review');
    const [showAssessment, setShowAssessment] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const currentExercise = exercises[currentIndex];
    const isLastExercise = currentIndex >= exercises.length - 1;

    const handleAnswer = useCallback((answer: string) => {
        if (answered) return;
        setAnswered(true);
        setSelectedAnswer(answer);
        const isCorrect = answer.trim().toLowerCase() === currentExercise.answer.trim().toLowerCase();
        if (isCorrect) setCorrectCount(c => c + 1);
    }, [answered, currentExercise]);

    const handleNext = useCallback(() => {
        if (isLastExercise) {
            setShowAssessment(true);
        } else {
            setCurrentIndex(i => i + 1);
            setAnswered(false);
            setSelectedAnswer(null);
        }
    }, [isLastExercise]);

    // Self-assessment screen
    if (showAssessment) {
        const accuracy = exercises.length > 0 ? Math.round((correctCount / exercises.length) * 100) : 0;
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="text-center space-y-3">
                    <h3 className="text-xl font-bold">{skill.name}</h3>
                    <p className="text-[var(--color-on-surface-muted)] text-sm">
                        {correctCount}/{exercises.length} correct ({accuracy}%)
                    </p>
                </div>

                <p className="text-center text-[var(--color-on-surface-muted)] text-sm">
                    {t('review.howWasIt', 'How well did you know this?')}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { rating: Rating.Again, label: t('review.again', 'Again'), desc: t('review.againDesc', 'I forgot'), color: 'bg-red-500/10 border-red-500/30 text-red-400' },
                        { rating: Rating.Hard, label: t('review.hard', 'Hard'), desc: t('review.hardDesc', 'Difficult'), color: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
                        { rating: Rating.Good, label: t('review.good', 'Good'), desc: t('review.goodDesc', 'I knew it'), color: 'bg-green-500/10 border-green-500/30 text-green-400' },
                        { rating: Rating.Easy, label: t('review.easy', 'Easy'), desc: t('review.easyDesc', 'Very easy'), color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
                    ].map(({ rating, label, desc, color }) => (
                        <button
                            key={rating}
                            onClick={() => onComplete(rating)}
                            className={`border rounded-xl p-4 text-center transition-all hover:scale-[1.02] ${color}`}
                        >
                            <p className="font-bold text-sm">{label}</p>
                            <p className="text-xs opacity-70 mt-1">{desc}</p>
                        </button>
                    ))}
                </div>
            </motion.div>
        );
    }

    // Grammar tip screen (deep review only)
    if (showTip) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="space-y-2">
                    <h3 className="text-lg font-bold">{skill.name}</h3>
                    <p className="text-[var(--color-on-surface-muted)] text-sm">{skill.description}</p>
                </div>

                <div className="widget border-l-4 border-[var(--color-primary)] space-y-3">
                    <div className="flex items-center gap-2 text-[var(--color-primary)]">
                        <Lightbulb className="w-4 h-4" />
                        <span className="text-sm font-bold">{t('review.grammarTip', 'Grammar Tip')}</span>
                    </div>
                    <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{skill.grammarTip}</p>
                </div>

                <button
                    onClick={() => setShowTip(false)}
                    className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    {t('review.startExercises', 'Start Exercises')}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </motion.div>
        );
    }

    // Exercise screen
    const isCorrect = selectedAnswer?.trim().toLowerCase() === currentExercise.answer.trim().toLowerCase();

    return (
        <div className="space-y-8">
            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-[var(--color-on-surface-muted)]">
                    <span>{skill.name}</span>
                    <span>{currentIndex + 1}/{exercises.length}</span>
                </div>
                <div className="h-1.5 bg-[var(--color-card)] rounded-full overflow-hidden">
                    <motion.div
                        animate={{ width: `${((currentIndex + (answered ? 1 : 0)) / exercises.length) * 100}%` }}
                        className="h-full bg-[var(--color-primary)] rounded-full"
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Exercise */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="space-y-6"
                >
                    <p className="text-base font-semibold leading-relaxed">{currentExercise.prompt}</p>

                    {/* Options-based exercise */}
                    {currentExercise.options && currentExercise.options.length > 0 ? (
                        <div className="space-y-3">
                            {currentExercise.options.map((option) => {
                                const isSelected = selectedAnswer === option;
                                const isOptionCorrect = option.trim().toLowerCase() === currentExercise.answer.trim().toLowerCase();
                                let optionClass = 'border-[var(--color-outline-subtle)] hover:border-[var(--color-primary)]/50';
                                if (answered) {
                                    if (isOptionCorrect) optionClass = 'border-green-500 bg-green-500/10';
                                    else if (isSelected && !isOptionCorrect) optionClass = 'border-red-500 bg-red-500/10';
                                    else optionClass = 'border-[var(--color-outline-subtle)] opacity-50';
                                }
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswer(option)}
                                        disabled={answered}
                                        className={`w-full text-left border rounded-xl p-4 transition-all ${optionClass}`}
                                    >
                                        <span className="text-sm">{option}</span>
                                        {answered && isOptionCorrect && <CheckCircle2 className="w-4 h-4 text-green-400 inline ml-2" />}
                                        {answered && isSelected && !isOptionCorrect && <XCircle className="w-4 h-4 text-red-400 inline ml-2" />}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        /* Free-form input for word-order */
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder={t('review.typeAnswer', 'Type your answer...')}
                                disabled={answered}
                                className="w-full bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAnswer((e.target as HTMLInputElement).value);
                                    }
                                }}
                            />
                            {!answered && (
                                <p className="text-xs text-[var(--color-on-surface-muted)]">{t('review.pressEnter', 'Press Enter to submit')}</p>
                            )}
                        </div>
                    )}

                    {/* Feedback */}
                    {answered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className={`rounded-xl p-4 text-sm ${isCorrect ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                                {isCorrect ? (
                                    <p className="font-semibold">{t('review.correct', 'Correct!')}</p>
                                ) : (
                                    <p><span className="font-semibold">{t('review.incorrect', 'Incorrect.')}</span> {t('review.correctAnswer', 'Answer')}: <span className="font-bold">{currentExercise.answer}</span></p>
                                )}
                                <p className="text-xs mt-2 opacity-80">{currentExercise.explanation}</p>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                            >
                                {isLastExercise ? t('review.finish', 'Finish') : t('review.next', 'Next')}
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
