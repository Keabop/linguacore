import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';
import type { SpeakingPrompt, CEFRLevel } from '../../lib/db';
import ReadAloud from './ReadAloud';
import type { PromptResult, ReviewItem } from '../../lib/retryPolicy';
import OralResponse from './OralResponse';

interface Props {
    prompts: SpeakingPrompt[];
    level: CEFRLevel;
    /** Average of the evaluated answers (null when none could be evaluated, free plan limit) and each one's result. */
    onComplete: (avgScore: number | null, results: PromptResult[]) => void;
    onFirstAttempt?: () => void;
}

export default function SpeakingRunner({ prompts, level, onComplete, onFirstAttempt }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState<PromptResult[]>([]);

    const current = prompts[currentIndex];
    const isLast = currentIndex === prompts.length - 1;

    const handleExerciseComplete = (score: number | null, review: ReviewItem[] = []) => {
        const newResults = [...results, { id: current.id, score, review }];
        setResults(newResults);
        // Notify parent on first completed attempt (hide defer button)
        if (results.length === 0 && onFirstAttempt) {
            onFirstAttempt();
        }
        if (isLast) {
            const evaluated = newResults.map(r => r.score).filter((s): s is number => s !== null);
            onComplete(evaluated.length ? Math.round(evaluated.reduce((a, b) => a + b, 0) / evaluated.length) : null, newResults);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--color-on-surface-muted)] text-sm">
                    <Mic className="w-4 h-4" />
                    <span>Habla</span>
                </div>
                <span className="text-xs text-[var(--color-on-surface-muted)] font-medium">{currentIndex + 1} / {prompts.length}</span>
            </div>

            <div className="h-1.5 bg-[var(--color-card-hover)] rounded-full overflow-hidden">
                <motion.div className="h-full bg-[var(--color-primary)] rounded-full"
                    animate={{ width: `${(currentIndex / prompts.length) * 100}%` }}
                    transition={{ duration: 0.3 }} />
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={currentIndex}
                    initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
                    {current.type === 'read-aloud' ? (
                        <ReadAloud instruction={current.instruction} targetText={current.targetText || ''} onComplete={handleExerciseComplete} />
                    ) : (
                        <OralResponse instruction={current.instruction} targetGrammar={current.targetGrammar || []} level={level} onComplete={handleExerciseComplete} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
