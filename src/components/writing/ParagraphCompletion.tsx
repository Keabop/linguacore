import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';

interface Props {
    instruction: string;
    sourceText: string;
    targetGrammar: string[];
    onSubmit: (text: string) => void;
    disabled: boolean;
}

export default function ParagraphCompletion({ instruction, sourceText, targetGrammar, onSubmit, disabled }: Props) {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        const trimmed = text.trim();
        if (trimmed && !disabled) onSubmit(trimmed);
    };

    return (
        <div className="space-y-6">
            <div className="bg-bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold">
                    <FileText className="w-4 h-4" />
                    Completar párrafo
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{instruction}</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-bg-card-hover border border-border-light rounded-xl p-5"
            >
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">Contexto</p>
                <p className="text-white text-sm leading-relaxed">{sourceText}</p>
                <div className="mt-3 border-l-2 border-primary/40 pl-3">
                    <p className="text-xs text-text-muted italic">Continúa desde aquí...</p>
                </div>
            </motion.div>

            {targetGrammar.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {targetGrammar.map((g, i) => (
                        <span key={i} className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full">
                            {g}
                        </span>
                    ))}
                </div>
            )}

            <div className="space-y-2">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    disabled={disabled}
                    placeholder="Escribe la continuación en inglés..."
                    className="w-full bg-bg-card border border-border rounded-xl p-4 text-white text-sm leading-relaxed placeholder:text-text-muted resize-none focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all min-h-[120px] disabled:opacity-50"
                    rows={4}
                />
                <p className="text-xs text-text-muted text-right">
                    {text.trim().split(/\s+/).filter(Boolean).length} palabras
                </p>
            </div>

            <button
                onClick={handleSubmit}
                disabled={disabled || !text.trim()}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
                Enviar
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
