import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AnswerFeedback from './AnswerFeedback';
import { motion } from 'framer-motion';
import { Check, X, Volume2 } from 'lucide-react';
import SpeakButton from '../ui/SpeakButton';
import { speakEnglish } from '../../lib/speakEnglish';
import { useEnglishVoices } from '../../hooks/useEnglishVoices';
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
    const voices = useEnglishVoices();
    const listenItem = exercise.type === 'listen-choice';
    // With no English voice there is nothing to hear: it asks which sentence means the Spanish
    // instead, so the answer is neither guessed nor copied from the screen
    const noVoice = listenItem && voices.ready && !voices.hasEnglish && !!exercise.meaning;
    const listening = listenItem && !noVoice;

    // A listening exercise plays its sentence as it appears; it can be heard again any time
    useEffect(() => {
        if (listening) speakEnglish(exercise.question);
    }, [listening, exercise.question]);

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
                {exercise.type === 'multiple-choice' && (
                    <p className="text-xl leading-relaxed text-[var(--color-on-surface)]">{exercise.question}</p>
                )}
                {exercise.type === 'meaning-choice' && (
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-[var(--color-on-surface-muted)]">{t('exercises.whatDoesItMean')}</p>
                        <div className="flex items-center justify-center gap-3">
                            <SpeakButton text={exercise.question} />
                            <p className="text-xl leading-relaxed text-[var(--color-on-surface)]" lang="en">{exercise.question}</p>
                        </div>
                    </div>
                )}
                {listening && (
                    <div className="space-y-4">
                        <p className="text-sm font-semibold text-[var(--color-on-surface-muted)]">{t('exercises.listenAndChoose')}</p>
                        <button type="button" onClick={() => speakEnglish(exercise.question)} className="listen-play" aria-label={t('audio.listen')}>
                            <Volume2 className="size-7" aria-hidden="true" />
                        </button>
                        {status !== 'pending' && (
                            <p className="text-lg text-[var(--color-on-surface)]" lang="en">{exercise.question}</p>
                        )}
                    </div>
                )}
                {noVoice && (
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-[var(--color-on-surface-muted)]">{t('exercises.whichMeans')}</p>
                        <p className="text-xl leading-relaxed text-[var(--color-on-surface)]">{exercise.meaning}</p>
                    </div>
                )}
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
                        <span className="text-[var(--color-on-surface)] font-medium" lang={exercise.type === 'meaning-choice' ? 'es' : 'en'}>{option}</span>
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
