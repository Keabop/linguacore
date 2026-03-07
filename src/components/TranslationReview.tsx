import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { type Card, type Vocabulary } from '../lib/db';
import { Lightbulb, Check, X, ArrowRight } from 'lucide-react';

interface Props {
    card: Card;
    vocabulary: Vocabulary;
    onResult: (correct: boolean) => void;
}

export default function TranslationReview({ card, vocabulary, onResult }: Props) {
    const { t } = useTranslation();
    const [answer, setAnswer] = useState('');
    const [status, setStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');
    const [usedHint, setUsedHint] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim() || status !== 'pending') return;

        const normalize = (s: string) =>
            s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const normalized = normalize(answer);

        // Flatten translations: split comma-separated entries into individual items
        const allTranslations = vocabulary.translations
            .flatMap(tr => tr.split(','))
            .map(tr => normalize(tr));

        const isCorrect = allTranslations.some(tr => tr === normalized);

        if (isCorrect && !usedHint) {
            setStatus('correct');
            setTimeout(() => onResult(true), 1000);
        } else {
            setStatus(isCorrect ? 'correct' : 'incorrect');
            if (usedHint && isCorrect) {
                setTimeout(() => onResult(false), 1500);
            }
        }
    };

    const handleHint = () => {
        setUsedHint(true);
        setShowHint(true);
    };

    const handleContinue = () => {
        onResult(false);
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="widget text-center space-y-2 !py-10"
            >
                <p className="text-xs text-text-muted uppercase tracking-wider">
                    {t('review.translationMode')}
                </p>
                <h3 className="text-4xl font-extrabold text-accent-blue">{vocabulary.id}</h3>
                {vocabulary.phonetic && (
                    <p className="text-sm text-text-muted">{vocabulary.phonetic}</p>
                )}
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    ref={inputRef}
                    type="text"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder={t('review.writeTranslation')}
                    disabled={status !== 'pending'}
                    className={`review-input ${status === 'correct' ? 'correct' : status === 'incorrect' ? 'incorrect' : ''}`}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                />

                {status === 'pending' && (
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={!answer.trim()}
                            className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-40 text-bg-app py-3 rounded-xl font-bold transition-all active:scale-[0.98]"
                        >
                            {t('review.check')} ↵
                        </button>
                        {!showHint && (
                            <button
                                type="button"
                                onClick={handleHint}
                                className="bg-bg-card hover:bg-bg-card-hover text-text-secondary py-3 px-4 rounded-xl font-medium transition-all text-sm"
                            >
                                <Lightbulb className="w-4 h-4 inline" /> {t('review.hint')}
                            </button>
                        )}
                    </div>
                )}
            </form>

            {showHint && status === 'pending' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-center"
                >
                    <p className="text-sm text-accent-orange">
                        <Lightbulb className="w-4 h-4 inline text-accent-orange" /> {vocabulary.translations[0][0]}{vocabulary.translations[0].slice(1).replace(/./g, '_')}
                    </p>
                </motion.div>
            )}

            {status === 'correct' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <p className="text-lg font-bold text-primary flex items-center justify-center gap-1"><Check className="w-5 h-5" /> {t('review.correct')}</p>
                    <p className="text-sm text-text-secondary mt-1">{vocabulary.translations.join(', ')}</p>
                    {usedHint && (
                        <p className="text-xs text-text-muted mt-1">
                            ({t('review.hint')} → {t('review.again')})
                        </p>
                    )}
                </motion.div>
            )}

            {status === 'incorrect' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-3"
                >
                    <p className="text-lg font-bold text-accent-red flex items-center justify-center gap-1"><X className="w-5 h-5" /> {t('review.incorrect')}</p>
                    <p className="text-sm text-text-secondary">
                        {t('review.correctAnswer')}: <span className="text-primary font-bold">{vocabulary.translations.join(', ')}</span>
                    </p>
                    <button
                        onClick={handleContinue}
                        className="bg-bg-card hover:bg-bg-card-hover text-text px-6 py-2.5 rounded-xl font-medium transition-all"
                    >
                        {t('review.continueNext')} <ArrowRight className="w-4 h-4 inline" />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
