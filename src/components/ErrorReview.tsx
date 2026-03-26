import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Rating } from '../lib/fsrs';
import { CardState } from '../lib/db';
import type { ErrorCard } from '../lib/db';

interface Props {
    card: ErrorCard;
    onComplete: (rating: Rating) => void;
}

type Phase = 'exercise' | 'feedback' | 'rating';

export default function ErrorReview({ card, onComplete }: Props) {
    const { t } = useTranslation();
    const isStable = card.state === CardState.Review && card.stability > 10;
    const [phase, setPhase] = useState<Phase>('exercise');
    const [userAnswer, setUserAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    // For multiple choice: generate options from card data
    const [options] = useState(() => {
        if (isStable) return [];
        const opts = [
            card.correctedSentence,
            card.originalSentence,
        ];
        if (card.exampleVariants.length > 0) {
            opts.push(card.exampleVariants[0]);
        } else {
            // Generate a plausible wrong option by shuffling words
            const words = card.correctedSentence.split(' ');
            if (words.length > 2) {
                const shuffled = [...words].sort(() => Math.random() - 0.5).join(' ');
                if (shuffled !== card.correctedSentence) opts.push(shuffled);
            }
        }
        // Shuffle options
        return opts.sort(() => Math.random() - 0.5);
    });

    const handleSubmitFreeForm = () => {
        if (!userAnswer.trim()) return;
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const correct = normalize(userAnswer) === normalize(card.correctedSentence);
        setIsCorrect(correct);
        setPhase('feedback');
    };

    const handleSelectOption = (option: string) => {
        const correct = option === card.correctedSentence;
        setIsCorrect(correct);
        setUserAnswer(option);
        setPhase('feedback');
    };

    if (phase === 'rating') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <p className="text-center text-sm font-semibold text-[var(--color-on-surface-muted)]">
                    {t('review.howWasIt', '¿Cómo te fue?')}
                </p>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { rating: Rating.Again, label: t('review.again', 'Otra vez'), color: 'bg-accent-red/10 border-accent-red/20 text-accent-red' },
                        { rating: Rating.Hard, label: t('review.hard', 'Difícil'), color: 'bg-accent-orange/10 border-accent-orange/20 text-accent-orange' },
                        { rating: Rating.Good, label: t('review.good', 'Bien'), color: 'bg-green-500/10 border-green-500/20 text-green-400' },
                        { rating: Rating.Easy, label: t('review.easy', 'Fácil'), color: 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue' },
                    ].map(({ rating, label, color }) => (
                        <button
                            key={rating}
                            onClick={() => onComplete(rating)}
                            className={`py-3 rounded-xl text-sm font-bold border transition-all active:scale-[0.96] ${color}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </motion.div>
        );
    }

    if (phase === 'feedback') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className={`rounded-xl p-5 border space-y-3 ${
                    isCorrect
                        ? 'bg-green-500/8 border-green-500/20'
                        : 'bg-accent-red/8 border-accent-red/20'
                }`}>
                    <div className="flex items-center gap-2">
                        {isCorrect
                            ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                            : <XCircle className="w-5 h-5 text-accent-red" />
                        }
                        <span className="font-bold text-sm">
                            {isCorrect ? t('review.correct', '¡Correcto!') : t('review.incorrect', 'Incorrecto')}
                        </span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p><span className="text-[var(--color-on-surface-muted)]">Error:</span> <span className="line-through text-accent-red">{card.originalSentence}</span></p>
                        <p><span className="text-[var(--color-on-surface-muted)]">Correcto:</span> <span className="text-green-400 font-semibold">{card.correctedSentence}</span></p>
                    </div>
                </div>

                <div className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-4">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-accent-orange flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{card.explanation}</p>
                    </div>
                </div>

                <button
                    onClick={() => setPhase('rating')}
                    className="w-full bg-[var(--color-primary)] hover:brightness-90 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <ArrowRight className="w-4 h-4" /> {t('review.next', 'Siguiente')}
                </button>
            </motion.div>
        );
    }

    // Exercise phase
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-[var(--color-card-hover)] border border-[var(--color-outline-subtle)] rounded-xl p-5 space-y-2">
                <p className="text-xs text-accent-orange font-semibold uppercase tracking-wider">
                    {card.errorType === 'grammar' ? 'Gramática' :
                     card.errorType === 'vocabulary' ? 'Vocabulario' :
                     card.errorType === 'spelling' ? 'Ortografía' : 'Estilo'}
                </p>
                <p className="text-sm text-[var(--color-on-surface-muted)]">
                    {isStable
                        ? 'Corrige la siguiente oración:'
                        : 'Selecciona la oración correcta:'}
                </p>
            </div>

            <div className="bg-accent-red/8 border border-accent-red/20 rounded-xl p-5">
                <p className="text-lg leading-relaxed">{card.originalSentence}</p>
            </div>

            {isStable ? (
                <div className="space-y-4">
                    <input
                        type="text"
                        value={userAnswer}
                        onChange={e => setUserAnswer(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmitFreeForm()}
                        placeholder={t('review.typeAnswer', 'Escribe la corrección...')}
                        className="w-full bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl px-5 py-4 text-sm placeholder:text-[var(--color-on-surface-muted)] focus:outline-none focus:border-[var(--color-primary)]/40 focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all"
                        autoFocus
                    />
                    <button
                        onClick={handleSubmitFreeForm}
                        disabled={!userAnswer.trim()}
                        className="w-full bg-[var(--color-primary)] hover:brightness-90 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                    >
                        {t('review.check', 'Verificar')}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {options.map((option, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelectOption(option)}
                            className="w-full text-left bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-4 text-sm hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-card-hover)] transition-all"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
