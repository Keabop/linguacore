import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface Correction {
    original: string;
    corrected: string;
    explanation: string;
    type: 'grammar' | 'vocabulary' | 'spelling' | 'style';
}

interface FeedbackData {
    score: number;
    corrections: Correction[];
    feedback: {
        grammar: { score: number; note: string };
        vocabulary: { score: number; note: string };
        coherence: { score: number; note: string };
    };
    improvedVersion: string;
    encouragement: string;
}

interface Props {
    data: FeedbackData;
    onNext?: () => void;
    nextLabel?: string;
}

const TYPE_LABELS: Record<string, string> = {
    grammar: 'Gramática',
    vocabulary: 'Vocabulario',
    spelling: 'Ortografía',
    style: 'Estilo',
};

const TYPE_COLORS: Record<string, string> = {
    grammar: 'text-accent-blue',
    vocabulary: 'text-purple-400',
    spelling: 'text-accent-orange',
    style: 'text-teal-400',
};

function ScoreRing({ score }: { score: number }) {
    const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-accent-orange' : 'text-accent-red';
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-24 h-24 mx-auto">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-bg-card-hover" />
                <motion.circle
                    cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="6"
                    className={color}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-extrabold ${color}`}>{score}</span>
            </div>
        </div>
    );
}

function CategoryBar({ label, score, note }: { label: string; score: number; note: string }) {
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-accent-orange' : 'bg-accent-red';
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
                <span className="text-text-secondary">{label}</span>
                <span className="text-white font-semibold">{score}</span>
            </div>
            <div className="h-2 bg-bg-card-hover rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
            </div>
            {note && <p className="text-xs text-text-muted">{note}</p>}
        </div>
    );
}

export default function WritingFeedback({ data, onNext, nextLabel = 'Siguiente' }: Props) {
    const [showImproved, setShowImproved] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Score */}
            <div className="text-center space-y-3">
                <ScoreRing score={data.score} />
                <p className="text-sm text-text-secondary">{data.encouragement}</p>
            </div>

            {/* Category scores */}
            <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
                <CategoryBar label="Gramática" score={data.feedback.grammar.score} note={data.feedback.grammar.note} />
                <CategoryBar label="Vocabulario" score={data.feedback.vocabulary.score} note={data.feedback.vocabulary.note} />
                <CategoryBar label="Coherencia" score={data.feedback.coherence.score} note={data.feedback.coherence.note} />
            </div>

            {/* Corrections */}
            {data.corrections.length > 0 && (
                <div className="bg-bg-card border border-border rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Correcciones</h3>
                    {data.corrections.map((c, i) => (
                        <div key={i} className="bg-bg-card-hover rounded-lg p-3.5 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                                <span className={`font-semibold ${TYPE_COLORS[c.type] || 'text-text-secondary'}`}>
                                    {TYPE_LABELS[c.type] || c.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <XCircle className="w-3.5 h-3.5 text-accent-red shrink-0" />
                                <span className="text-text-secondary line-through">{c.original}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                <span className="text-white">{c.corrected}</span>
                            </div>
                            <p className="text-xs text-text-muted italic pl-5">{c.explanation}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Improved version (expandable) */}
            <button
                onClick={() => setShowImproved(!showImproved)}
                className="w-full bg-bg-card border border-border rounded-xl p-4 flex items-center justify-between text-sm text-text-secondary hover:text-white transition-colors"
            >
                <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-blue" />
                    Ver versión mejorada
                </span>
                {showImproved ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
                {showImproved && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-5">
                            <p className="text-sm text-white leading-relaxed">{data.improvedVersion}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Next button */}
            {onNext && (
                <button
                    onClick={onNext}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]"
                >
                    {nextLabel}
                </button>
            )}
        </motion.div>
    );
}
