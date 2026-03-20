import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { type Card, type Vocabulary } from '../lib/db';
import { getVocab, getSkill } from '../data';
import { useCards } from '../hooks/useCards';
import { useSkillCards, getReviewDepth } from '../hooks/useSkillCards';
import { useErrorCards } from '../hooks/useErrorCards';
import { Rating } from '../lib/fsrs';
import ReviewModeSelector, { type ReviewMode } from '../components/ReviewModeSelector';
import ClozeReview from '../components/ClozeReview';
import TranslationReview from '../components/TranslationReview';
import GrammarReview from '../components/GrammarReview';
import ErrorReview from '../components/ErrorReview';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Trophy, ArrowLeft, RefreshCw, BookOpen, AlertTriangle, Lock } from 'lucide-react';
import { toast } from '../lib/toast';
import { useTier } from '../hooks/useTier';
import { UsageBadge } from '../components/UsageBadge';
import { CountUp } from '../components/reactbits';

export default function ReviewSession() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isFree, limits } = useTier();
    const { dueCards: allDueCards, reviewCard } = useCards();
    const { dueSkillCards: allDueSkillCards, reviewSkillCard } = useSkillCards();
    const { dueErrorCards: allDueErrorCards, reviewErrorCard } = useErrorCards();

    const cardLimit = isFree ? limits.fsrsCardsPerDay : Infinity;
    const dueCards = isFree ? allDueCards.slice(0, cardLimit) : allDueCards;
    const dueSkillCards = isFree ? allDueSkillCards.slice(0, cardLimit) : allDueSkillCards;
    const dueErrorCards = isFree ? allDueErrorCards.slice(0, cardLimit) : allDueErrorCards;
    const totalTruncated = (allDueCards.length - dueCards.length) + (allDueSkillCards.length - dueSkillCards.length) + (allDueErrorCards.length - dueErrorCards.length);
    const [reviewType, setReviewType] = useState<'vocab' | 'grammar' | 'errors' | null>(null);
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
    if (dueCards.length === 0 && dueSkillCards.length === 0 && dueErrorCards.length === 0 && !sessionDone && !mode && !reviewType) {
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
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all mt-4"
                >
                    {t('reader.backToStories')}
                </button>
            </motion.div>
        );
    }

    // Type selector: Vocabulary vs Grammar vs Errors
    if (!reviewType && !mode && (dueCards.length > 0 || dueSkillCards.length > 0 || dueErrorCards.length > 0)) {
        const typesWithDue = [
            dueCards.length > 0 ? 'vocab' as const : null,
            dueSkillCards.length > 0 ? 'grammar' as const : null,
            dueErrorCards.length > 0 ? 'errors' as const : null,
        ].filter((v): v is 'vocab' | 'grammar' | 'errors' => v !== null);

        if (typesWithDue.length === 1) {
            setReviewType(typesWithDue[0]);
        } else {
            return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 py-4">
                    <h2 className="text-xl font-bold text-center">{t('review.chooseType', '¿Qué quieres repasar?')}</h2>
                    {isFree && (
                        <div className="flex justify-center">
                            <UsageBadge remaining={dueCards.length + dueSkillCards.length + dueErrorCards.length} limit={cardLimit} label="repasos hoy" />
                        </div>
                    )}
                    <div className="space-y-4">
                        {dueCards.length > 0 && (
                            <button onClick={() => setReviewType('vocab')} className="w-full widget hover:border-primary/50 transition-all text-left space-y-1">
                                <div className="flex items-center gap-3">
                                    <RefreshCw className="w-5 h-5 text-accent-blue" />
                                    <div>
                                        <p className="font-bold">{t('review.vocabulary', 'Vocabulario')}</p>
                                        <p className="text-sm text-text-muted">{dueCards.length} {t('review.wordsDue', 'palabras pendientes')}</p>
                                    </div>
                                </div>
                            </button>
                        )}
                        {dueSkillCards.length > 0 && (
                            <button onClick={() => setReviewType('grammar')} className="w-full widget hover:border-primary/50 transition-all text-left space-y-1">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-accent-purple" />
                                    <div>
                                        <p className="font-bold">{t('review.grammar', 'Gramática')}</p>
                                        <p className="text-sm text-text-muted">{dueSkillCards.length} {t('review.skillsDue', 'habilidades pendientes')}</p>
                                    </div>
                                </div>
                            </button>
                        )}
                        {dueErrorCards.length > 0 && (
                            <button onClick={() => setReviewType('errors')} className="w-full widget hover:border-primary/50 transition-all text-left space-y-1">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-accent-orange" />
                                    <div>
                                        <p className="font-bold">{t('review.myErrors', 'Mis errores')}</p>
                                        <p className="text-sm text-text-muted">{dueErrorCards.length} {t('review.errorsDue', 'errores pendientes')}</p>
                                    </div>
                                </div>
                            </button>
                        )}
                        {isFree && totalTruncated > 0 && (
                            <div className="text-center py-4 space-y-2 border-t border-border mt-2 pt-4">
                                <p className="text-sm text-text-muted">
                                    <Lock className="w-3.5 h-3.5 inline mr-1" />
                                    Tienes {totalTruncated} tarjetas mas. Desbloquea repasos ilimitados con Plan Pro
                                </p>
                                <Link to="/pricing" className="text-xs text-primary font-semibold hover:underline">
                                    Ver Plan Pro
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            );
        }
    }

    // Grammar review flow
    if (reviewType === 'grammar') {
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
                            <CountUp from={0} to={totalReviewed} duration={1.2} className="text-2xl font-extrabold text-accent-blue" />
                            <p className="text-[10px] text-text-muted">{t('review.reviewed')}</p>
                        </div>
                        <div className="widget text-center">
                            <span><CountUp from={0} to={accuracy} duration={1.5} className={`text-2xl font-extrabold ${accuracy >= 90 ? 'gold-shimmer' : accuracy >= 70 ? 'text-success' : 'text-accent-orange'}`} />%</span>
                            <p className="text-[10px] text-text-muted">{t('review.accuracy')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all"
                    >
                        {t('review.backHome')}
                    </button>
                </motion.div>
            );
        }

        const currentSkillCard = dueSkillCards[0];
        const currentSkill = currentSkillCard ? getSkill(currentSkillCard.skillId) : undefined;

        if (!currentSkillCard || !currentSkill) {
            setSessionDone(true);
            return null;
        }

        const depth = getReviewDepth(currentSkillCard);

        return (
            <div className="space-y-10">
                <style>{`.floating-bar { display: none !important; }`}</style>
                {/* Progress header */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <button
                            onClick={() => { setReviewType(null); setSessionDone(false); setCorrectCount(0); setTotalReviewed(0); }}
                            className="text-text-muted hover:text-text transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 inline" /> {t('review.changeMode', 'Cambiar modo')}
                        </button>
                        <span className="text-text-muted font-mono text-xs">
                            {t('review.grammar', 'Gramática')} · {dueSkillCards.length} {t('review.remaining', 'restantes')}
                        </span>
                    </div>
                </div>
                <GrammarReview
                    key={currentSkillCard.id}
                    skillCard={currentSkillCard}
                    skill={currentSkill}
                    depth={depth}
                    onComplete={async (rating) => {
                        await reviewSkillCard(currentSkillCard, rating);
                        setTotalReviewed(tr => tr + 1);
                        if (rating !== Rating.Again) setCorrectCount(c => c + 1);
                        if (dueSkillCards.length <= 1) {
                            setSessionDone(true);
                        }
                    }}
                />
            </div>
        );
    }

    // Error cards review flow
    if (reviewType === 'errors') {
        if (sessionDone) {
            const accuracy = totalReviewed > 0 ? Math.round((correctCount / totalReviewed) * 100) : 0;
            return (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-5">
                    <style>{`.floating-bar { display: none !important; }`}</style>
                    <Trophy className="w-12 h-12 text-accent-gold mx-auto" />
                    <h2 className="text-2xl font-extrabold">{t('review.sessionDone')}</h2>
                    <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                        <div className="widget text-center">
                            <CountUp from={0} to={totalReviewed} duration={1.2} className="text-2xl font-extrabold text-accent-blue" />
                            <p className="text-[10px] text-text-muted">{t('review.reviewed')}</p>
                        </div>
                        <div className="widget text-center">
                            <span><CountUp from={0} to={accuracy} duration={1.5} className={`text-2xl font-extrabold ${accuracy >= 90 ? 'gold-shimmer' : accuracy >= 70 ? 'text-success' : 'text-accent-orange'}`} />%</span>
                            <p className="text-[10px] text-text-muted">{t('review.accuracy')}</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/')} className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all">
                        {t('review.backHome')}
                    </button>
                </motion.div>
            );
        }

        const currentErrorCard = dueErrorCards[0];
        if (!currentErrorCard) {
            setSessionDone(true);
            return null;
        }

        return (
            <div className="space-y-10">
                <style>{`.floating-bar { display: none !important; }`}</style>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <button
                            onClick={() => { setReviewType(null); setSessionDone(false); setCorrectCount(0); setTotalReviewed(0); }}
                            className="text-text-muted hover:text-text transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 inline" /> {t('review.changeMode', 'Cambiar modo')}
                        </button>
                        <span className="text-text-muted font-mono text-xs">
                            {t('review.myErrors', 'Mis errores')} · {dueErrorCards.length} {t('review.remaining', 'restantes')}
                        </span>
                    </div>
                </div>
                <ErrorReview
                    key={currentErrorCard.id}
                    card={currentErrorCard}
                    onComplete={async (rating) => {
                        await reviewErrorCard(currentErrorCard, rating);
                        setTotalReviewed(tr => tr + 1);
                        if (rating !== Rating.Again) setCorrectCount(c => c + 1);
                        if (dueErrorCards.length <= 1) {
                            setSessionDone(true);
                        }
                    }}
                />
            </div>
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
                        <CountUp from={0} to={totalReviewed} duration={1.2} className="text-2xl font-extrabold text-accent-blue" />
                        <p className="text-[10px] text-text-muted">{t('review.reviewed')}</p>
                    </div>
                    <div className="widget text-center">
                        <span><CountUp from={0} to={accuracy} duration={1.5} className={`text-2xl font-extrabold ${accuracy >= 90 ? 'gold-shimmer' : accuracy >= 70 ? 'text-success' : 'text-accent-orange'}`} />%</span>
                        <p className="text-[10px] text-text-muted">{t('review.accuracy')}</p>
                    </div>
                </div>
                {isFree && totalTruncated > 0 && (
                    <div className="space-y-2 pt-2">
                        <p className="text-sm text-text-muted">
                            <Lock className="w-3.5 h-3.5 inline mr-1" />
                            Tienes {totalTruncated} tarjetas mas. Desbloquea repasos ilimitados con Plan Pro
                        </p>
                        <Link to="/pricing" className="text-sm text-primary font-semibold hover:underline">
                            Ver Plan Pro
                        </Link>
                    </div>
                )}
                <button
                    onClick={() => navigate('/')}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all"
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
        <div className="space-y-10">
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
                        initial={{ x: 80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -80, opacity: 0 }}
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
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
