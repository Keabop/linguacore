import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Feather } from 'lucide-react';

interface Props {
    instruction: string;
    targetGrammar: string[];
    wordLimit?: { min: number; max: number };
    onSubmit: (text: string) => void;
    disabled: boolean;
}

export default function FreeWriting({ instruction, targetGrammar, wordLimit, onSubmit, disabled }: Props) {
    const [text, setText] = useState('');

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const minWords = wordLimit?.min ?? 10;
    const maxWords = wordLimit?.max ?? 200;
    const isInRange = wordCount >= minWords;
    const isOverLimit = wordCount > maxWords;

    const handleSubmit = () => {
        const trimmed = text.trim();
        if (trimmed && isInRange && !isOverLimit && !disabled) onSubmit(trimmed);
    };

    return (
        <div className="space-y-5">
            <div className="bg-bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                    <Feather className="w-4 h-4" />
                    Escritura libre
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{instruction}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {targetGrammar.map((g, i) => (
                    <span key={i} className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full">
                        {g}
                    </span>
                ))}
                {wordLimit && (
                    <span className="text-xs bg-bg-card-hover text-text-muted border border-border px-3 py-1 rounded-full">
                        {minWords}–{maxWords} palabras
                    </span>
                )}
            </div>

            <div className="space-y-2">
                <motion.textarea
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    value={text}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                    disabled={disabled}
                    placeholder="Escribe libremente en inglés..."
                    className="w-full bg-bg-card border border-border rounded-xl p-5 text-white text-sm leading-relaxed placeholder:text-text-muted resize-none focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all min-h-[180px] disabled:opacity-50"
                    rows={6}
                />
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        {wordCount > 0 && wordCount < minWords && (
                            <span className="text-xs text-accent-orange">
                                Mínimo {minWords} palabras
                            </span>
                        )}
                        {isOverLimit && (
                            <span className="text-xs text-accent-red">
                                Máximo {maxWords} palabras
                            </span>
                        )}
                    </div>
                    <p className={`text-xs font-medium ${isOverLimit ? 'text-accent-red' : isInRange ? 'text-green-400' : 'text-text-muted'}`}>
                        {wordCount} / {maxWords}
                    </p>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={disabled || !isInRange || isOverLimit}
                className="w-full bg-primary hover:bg-primary-dark text-bg-app py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
                Enviar
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
