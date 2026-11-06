import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Languages, Lightbulb } from 'lucide-react';
import { grammarLabel } from '../../data/grammarLabels';

interface Props {
    instruction: string;
    sourceText: string;
    targetGrammar: string[];
    onSubmit: (text: string) => void;
    disabled: boolean;
    /** A1: the words the sentence needs, shuffled, shown on request and added with a tap. */
    hintWords?: string[];
}

export default function SentenceConstruction({ instruction, sourceText, targetGrammar, onSubmit, disabled, hintWords }: Props) {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [showHint, setShowHint] = useState(false);
    const addWord = (word: string) => setText(current => (current.trim() ? `${current.trimEnd()} ${word}` : word));

    const handleSubmit = () => {
        const trimmed = text.trim();
        if (trimmed && !disabled) onSubmit(trimmed);
    };

    return (
        <div className="space-y-6">
            {/* Instruction */}
            <div className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[var(--color-primary)] text-sm font-semibold">
                    <Languages className="w-4 h-4" />
                    Construcción de oración
                </div>
                <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{instruction}</p>
            </div>

            {/* Source text */}
            {sourceText && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="app-note"
                >
                    <p className="text-xs text-[var(--color-tertiary-ink)] font-semibold mb-2">Texto en español</p>
                    <p className="text-[var(--color-on-surface)] text-base leading-relaxed">{sourceText}</p>
                </motion.div>
            )}

            {/* Grammar hints */}
            {targetGrammar.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {targetGrammar.map((g, i) => (
                        <span key={i} className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-3 py-1 rounded-full">
                            {grammarLabel(g)}
                        </span>
                    ))}
                </div>
            )}

            {/* Guided writing for whoever starts: the words to build it with */}
            {hintWords && hintWords.length > 0 && (
                <div className="space-y-3">
                    <button type="button" onClick={() => setShowHint(v => !v)} aria-expanded={showHint} className="btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" aria-hidden="true" /> {showHint ? t('writing.hideHint') : t('writing.showHint')}
                    </button>
                    {showHint && (
                        <div className="space-y-2">
                            <p className="text-xs text-[var(--color-on-surface-muted)]">{t('writing.hintHelp')}</p>
                            <div className="flex flex-wrap gap-2">
                                {hintWords.map((word, i) => (
                                    <button key={`${word}-${i}`} type="button" onClick={() => addWord(word)} disabled={disabled} className="word-chip" lang="en">
                                        {word}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Input */}
            <div className="space-y-2">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    disabled={disabled}
                    placeholder="Escribe tu oración en inglés..."
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
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={disabled || !text.trim()}
                className="btn-primary w-full py-3.5 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
                Enviar
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
