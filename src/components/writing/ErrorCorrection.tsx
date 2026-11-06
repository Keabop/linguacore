import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sameWords } from '../../lib/sameText';
import { grammarLabel } from '../../data/grammarLabels';

interface Props {
    instruction: string;
    errorText: string;
    targetGrammar: string[];
    onSubmit: (text: string) => void;
    disabled: boolean;
}

export default function ErrorCorrection({ instruction, errorText, targetGrammar, onSubmit, disabled }: Props) {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    // The text with errors sent back as is would spend an AI evaluation on nothing
    const unchanged = sameWords(text, errorText);

    const handleSubmit = () => {
        const trimmed = text.trim();
        if (trimmed && !unchanged && !disabled) onSubmit(trimmed);
    };

    return (
        <div className="space-y-6">
            <div className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-accent-orange text-sm font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    Corrección de errores
                </div>
                <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{instruction}</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-accent-red/8 border border-accent-red/20 rounded-xl p-5"
            >
                <p className="text-xs text-accent-red font-semibold mb-2">Texto con errores</p>
                <p className="text-[var(--color-on-surface)] text-base leading-relaxed italic">&quot;{errorText}&quot;</p>
            </motion.div>

            {targetGrammar.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {targetGrammar.map((g, i) => (
                        <span key={i} className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-3 py-1 rounded-full">
                            {grammarLabel(g)}
                        </span>
                    ))}
                </div>
            )}

            <div className="space-y-2">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    disabled={disabled}
                    placeholder="Escribe la versión corregida..."
                    className="w-full bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-4 text-[var(--color-on-surface)] text-sm leading-relaxed placeholder:text-[var(--color-on-surface-muted)] resize-none focus:outline-none focus:border-[var(--color-primary)]/40 focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all min-h-[100px] disabled:opacity-50"
                    rows={3}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />
                <p className="text-xs text-[var(--color-on-surface-muted)] text-right">
                    {text.trim().split(/\s+/).filter(Boolean).length} palabras
                </p>
                {text.trim() && unchanged && (
                    <p className="text-xs font-semibold text-accent-orange">{t('writing.unchanged')}</p>
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={disabled || !text.trim() || unchanged}
                className="btn-primary w-full py-3.5 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
                Enviar corrección
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
