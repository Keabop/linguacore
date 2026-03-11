import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';
import type { SpeakingPrompt, CEFRLevel } from '../../lib/db';
import ReadAloud from './ReadAloud';
import OralResponse from './OralResponse';

interface Props {
    prompts: SpeakingPrompt[];
    level: CEFRLevel;
    onComplete: (avgScore: number) => void;
}

export default function SpeakingRunner({ prompts, level, onComplete }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scores, setScores] = useState<number[]>([]);

    const current = prompts[currentIndex];
    const isLast = currentIndex === prompts.length - 1;

    const handleExerciseComplete = (score: number) => {
        const newScores = [...scores, score];
        setScores(newScores);
        if (isLast) {
            const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
            onComplete(avg);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Mic className="w-4 h-4" />
                    <span>Habla</span>
                </div>
                <span className="text-xs text-text-muted font-medium">{currentIndex + 1} / {prompts.length}</span>
            </div>

            <div className="h-1.5 bg-bg-card-hover rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full"
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
