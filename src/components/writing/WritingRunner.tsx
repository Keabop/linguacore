import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Loader2 } from 'lucide-react';
import type { WritingPrompt, CEFRLevel } from '../../lib/db';
import { evaluateWriting, isLimitReached } from '../../lib/ai';
import type { WritingEvaluationResponse } from '../../lib/ai';
import SentenceConstruction from './SentenceConstruction';
import ErrorCorrection from './ErrorCorrection';
import FreeWriting from './FreeWriting';
import ParagraphCompletion from './ParagraphCompletion';
import WritingFeedback from './WritingFeedback';
import AIErrorCard from '../AIErrorCard';
import EvaluationLimitCard from '../EvaluationLimitCard';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';
import { sameWords } from '../../lib/sameText';

/**
 * Evaluations already made in this tab, by prompt and answer: sending the same text again
 * (after going back, or a retry) shows the same result without spending another evaluation.
 */
const evaluated = new Map<string, WritingEvaluationResponse>();

/** The model answer written as is needs no AI to say it is right. */
function perfectFeedback(text: string): WritingEvaluationResponse {
    const full = { score: 100, note: '' };
    return {
        score: 100,
        corrections: [],
        feedback: { grammar: full, vocabulary: full, coherence: full },
        improvedVersion: text,
        encouragement: i18n.t('writing.perfect'),
    };
}

interface Props {
    prompts: WritingPrompt[];
    level: CEFRLevel;
    /** Average of the evaluated answers; null when none could be evaluated (free plan limit). */
    onComplete: (avgScore: number | null) => void;
}

type Phase = 'writing' | 'evaluating' | 'feedback' | 'limit';

export default function WritingRunner({ prompts, level, onComplete }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>('writing');
    const [feedback, setFeedback] = useState<WritingEvaluationResponse | null>(null);
    const [answer, setAnswer] = useState('');
    const [scores, setScores] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const current = prompts[currentIndex];
    const isLast = currentIndex === prompts.length - 1;

    const handleSubmit = async (text: string) => {
        const key = `${level}|${current.id}|${current.instruction}|${text.trim().replace(/\s+/g, ' ')}`;
        setAnswer(text);
        const known = evaluated.get(key)
            ?? (current.referenceAnswer && sameWords(text, current.referenceAnswer) ? perfectFeedback(text) : undefined);
        if (known) {
            setFeedback(known);
            setScores(prev => [...prev, known.score]);
            setPhase('feedback');
            return;
        }

        setPhase('evaluating');
        setError(null);

        try {
            const result = await evaluateWriting(
                text,
                current.instruction,
                level,
                current.type,
                current.targetGrammar,
                current.referenceAnswer,
            );
            evaluated.set(key, result);
            setFeedback(result);
            setScores(prev => [...prev, result.score]);
            setPhase('feedback');
        } catch (err: any) {
            if (isLimitReached(err)) {
                setPhase('limit');
                return;
            }
            setError(err.message || 'Error al evaluar. Intenta de nuevo.');
            setPhase('writing');
        }
    };

    const handleNext = () => {
        if (isLast) {
            onComplete(scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null);
        } else {
            setCurrentIndex(prev => prev + 1);
            setPhase('writing');
            setFeedback(null);
        }
    };

    const renderExercise = () => {
        switch (current.type) {
            case 'sentence-construction':
                return (
                    <SentenceConstruction
                        instruction={current.instruction}
                        sourceText={current.sourceText || ''}
                        targetGrammar={current.targetGrammar}
                        onSubmit={handleSubmit}
                        disabled={phase !== 'writing'}
                    />
                );
            case 'error-correction':
                return (
                    <ErrorCorrection
                        instruction={current.instruction}
                        errorText={current.errorText || ''}
                        targetGrammar={current.targetGrammar}
                        onSubmit={handleSubmit}
                        disabled={phase !== 'writing'}
                    />
                );
            case 'free-writing':
                return (
                    <FreeWriting
                        instruction={current.instruction}
                        targetGrammar={current.targetGrammar}
                        wordLimit={current.wordLimit}
                        onSubmit={handleSubmit}
                        disabled={phase !== 'writing'}
                    />
                );
            case 'paragraph-completion':
                return (
                    <ParagraphCompletion
                        instruction={current.instruction}
                        sourceText={current.sourceText || ''}
                        targetGrammar={current.targetGrammar}
                        onSubmit={handleSubmit}
                        disabled={phase !== 'writing'}
                    />
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--color-on-surface-muted)] text-sm">
                    <PenLine className="w-4 h-4" />
                    <span>Escritura</span>
                </div>
                <span className="text-xs text-[var(--color-on-surface-muted)] font-medium">
                    {currentIndex + 1} / {prompts.length}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-[var(--color-card-hover)] rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-[var(--color-primary)] rounded-full"
                    animate={{ width: `${((currentIndex + (phase === 'feedback' ? 1 : 0)) / prompts.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {phase === 'limit' && <EvaluationLimitCard referenceAnswer={current.referenceAnswer} onContinue={handleNext} />}

            {/* Error message */}
            {error && (
                <AIErrorCard error={error} onRetry={() => setError(null)} />
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
                {phase === 'evaluating' && (
                    <motion.div
                        key="evaluating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-16 space-y-4"
                    >
                        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
                        <p className="text-sm text-[var(--color-on-surface-muted)]">Evaluando tu escritura...</p>
                    </motion.div>
                )}

                {phase === 'writing' && (
                    <motion.div
                        key={`writing-${currentIndex}`}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                    >
                        {renderExercise()}
                    </motion.div>
                )}

                {phase === 'feedback' && feedback && (
                    <motion.div
                        key={`feedback-${currentIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <WritingFeedback
                            data={feedback}
                            text={answer}
                            onNext={handleNext}
                            nextLabel={isLast ? 'Finalizar escritura' : 'Siguiente ejercicio'}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
