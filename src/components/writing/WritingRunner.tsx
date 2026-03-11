import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Loader2 } from 'lucide-react';
import type { WritingPrompt, CEFRLevel } from '../../lib/db';
import { evaluateWriting } from '../../lib/ai';
import type { WritingEvaluationResponse } from '../../lib/ai';
import SentenceConstruction from './SentenceConstruction';
import ErrorCorrection from './ErrorCorrection';
import FreeWriting from './FreeWriting';
import ParagraphCompletion from './ParagraphCompletion';
import WritingFeedback from './WritingFeedback';
import AIErrorCard from '../AIErrorCard';

interface Props {
    prompts: WritingPrompt[];
    level: CEFRLevel;
    onComplete: (avgScore: number) => void;
}

type Phase = 'writing' | 'evaluating' | 'feedback';

export default function WritingRunner({ prompts, level, onComplete }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>('writing');
    const [feedback, setFeedback] = useState<WritingEvaluationResponse | null>(null);
    const [scores, setScores] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const current = prompts[currentIndex];
    const isLast = currentIndex === prompts.length - 1;

    const handleSubmit = async (text: string) => {
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
            setFeedback(result);
            setScores(prev => [...prev, result.score]);
            setPhase('feedback');
        } catch (err: any) {
            setError(err.message || 'Error al evaluar. Intenta de nuevo.');
            setPhase('writing');
        }
    };

    const handleNext = () => {
        if (isLast) {
            const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            onComplete(avg);
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
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <PenLine className="w-4 h-4" />
                    <span>Escritura</span>
                </div>
                <span className="text-xs text-text-muted font-medium">
                    {currentIndex + 1} / {prompts.length}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-bg-card-hover rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${((currentIndex + (phase === 'feedback' ? 1 : 0)) / prompts.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

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
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-text-secondary">Evaluando tu escritura...</p>
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
                            onNext={handleNext}
                            nextLabel={isLast ? 'Finalizar escritura' : 'Siguiente ejercicio'}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
