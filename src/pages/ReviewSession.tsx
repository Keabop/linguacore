import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { type Card, type Vocabulary } from '../lib/db';
import { getVocab } from '../data';
import { useCards } from '../hooks/useCards';
import { Rating } from '../lib/fsrs';
import ReviewModeSelector, { type ReviewMode } from '../components/ReviewModeSelector';
import ClozeReview from '../components/ClozeReview';
import TranslationReview from '../components/TranslationReview';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, ArrowLeft } from 'lucide-react';
import { toast } from '../lib/toast';

export default function ReviewSession() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { dueCards, reviewCard } = useCards();
    const [mode, setMode] = useState<ReviewMode | null>(null);
    const [sessionDone, setSessionDone] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [totalReviewed, setTotalReviewed] = useState(0);
    const initialCount = useRef<number | null>(null);
    const [cardKey, setCardKey] = useState(0);

    if (initialCount.current === null && dueCards.length > 0) {
        initialCount.current = dueCards.length;
    }

    const currentCard = dueCards[0] as Card | undefined;
    const currentVocab = currentCard ? getVocab(currentCard.wordId) : undefined;

    const handleResult = useCallback(async (correct: boolean) => {
        if (!currentCard) return;
        const rating = correct ? Rating.Good : Rating.Again;
        await reviewCard(currentCard, rating);
        if (correct) setCorrectCount(c => c + 1);
        setTotalReviewed(t => t + 1);
        setCardKey(k => k + 1);

        // Session done if no more due cards after this update
        setTimeout(() => {
            if (dueCards.length <= 1) {
                setSessionDone(true);
                const acc = totalReviewed + 1 > 0 ? Math.round(((correctCount + (correct ? 1 : 0)) / (totalReviewed + 1)) * 100) : 0;
                toast.success({ title: t('review.sessionDone', '¡Sesión completada!'), description: `${totalReviewed + 1} ${t('review.reviewed', 'repasadas')} · ${acc}% ${t('review.accuracy', 'precisión')}` });
            }
        }, 300);
    }, [currentCard, dueCards.length, reviewCard]);

    // No due cards and no session
    if (dueCards.length === 0 && !sessionDone && !mode) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 space-y-4"
            >
                <Sparkles className="w-12 h-12 text-text-secondary mx-auto" />
                <h2 className="text-2xl font-bold">{t('review.allDone')}</h2>
                <p className="text-text-secondary">{t('review.comeBack')}</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-primary hover:bg-primary-dark text-bg-app px-6 py-3 rounded-xl font-bold transition-all mt-4"
                >
                    {t('reader.backToStories')}
                </button>
            </motion.div>
        );
    }

    // Session complete
    if (sessionDone) {
        const accuracy = totalReviewed > 0 ? Math.round((correctCount / totalReviewed) * 100) : 0;
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-5"
            >
                <style>{`.floating-bar { display: none !important; }`}</style>
                <Trophy className="w-12 h-12 text-accent-gold mx-auto" />
                <h2 className="text-2xl font-extrabold">{t('review.sessionDone')}</h2>
                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    <div className="widget text-center">
                        <p className="text-2xl font-extrabold text-accent-blue">{totalReviewed}</p>
                        <p className="text-[10px] text-text-muted">{t('review.reviewed')}</p>
                    </div>
                    <div className="widget text-center">
                        <p className={`text-2xl font-extrabold ${accuracy >= 70 ? 'text-primary' : 'text-accent-orange'}`}>{accuracy}%</p>
                        <p className="text-[10px] text-text-muted">{t('review.accuracy')}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="bg-primary hover:bg-primary-dark text-bg-app px-8 py-3 rounded-xl font-bold transition-all"
                >
                    {t('review.backHome')}
                </button>
            </motion.div>
        );
    }

    // Mode selection
    if (!mode) {
        return <ReviewModeSelector dueCount={dueCards.length} onSelect={setMode} />;
    }

    // Review in progress
    const progressPercent = initialCount.current
        ? ((totalReviewed) / initialCount.current) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Hide floating navbar while reviewing */}
            <style>{`.floating-bar { display: none !important; }`}</style>
            {/* Progress header */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <button
                        onClick={() => setMode(null)}
                        className="text-text-muted hover:text-text transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 inline" /> {t('review.changeMode')}
                    </button>
                    <span className="text-text-muted font-mono">
                        {totalReviewed}/{initialCount.current ?? dueCards.length}
                    </span>
                </div>
                <div className="h-2 bg-bg-card rounded-full overflow-hidden">
                    <motion.div
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-primary rounded-full"
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Card */}
            {currentCard && currentVocab && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={cardKey}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.2 }}
                    >
                        {mode === 'cloze' ? (
                            <ClozeReview card={currentCard} vocabulary={currentVocab} onResult={handleResult} />
                        ) : (
                            <TranslationReview card={currentCard} vocabulary={currentVocab} onResult={handleResult} />
                        )}
                    </motion.div>
                </AnimatePresence>
            )}

            {!currentCard && !sessionDone && (
                <div className="text-center text-text-muted py-8">{t('common.loading')}</div>
            )}
        </div>
    );
}
