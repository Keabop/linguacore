import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { BookOpen, CheckCircle2, Lightbulb } from 'lucide-react';
import { getGrammarCardByUnit } from '../data';
import { useUnitProgress } from '../hooks/useUnitProgress';

interface GrammarCardProps {
    unitId: string;
    onComplete: () => void;
}

export default function GrammarCard({ unitId, onComplete }: GrammarCardProps) {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    const { markStepComplete } = useUnitProgress(unitId);

    const card = getGrammarCardByUnit(unitId) ?? null;

    const handleUnderstood = async () => {
        if (saving) return;
        setSaving(true);
        try {
            await markStepComplete('grammar');
            onComplete();
        } catch {
            setSaving(false);
        }
    };

    // Loading state
    if (card === undefined) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-text-muted text-sm">{t('common.loading')}</div>
            </div>
        );
    }

    // No grammar card for this unit (e.g., assessment units)
    if (card === null) {
        return null;
    }

    const sanitizedExplanation = DOMPurify.sanitize(card.explanation);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-blue/10">
                    <BookOpen className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                        {t('grammar.title')}
                    </p>
                    <h2 className="text-xl font-extrabold leading-tight">{card.title}</h2>
                </div>
            </div>

            {/* Main card */}
            <div className="bg-bg-card border border-border rounded-2xl p-7 space-y-7">
                {/* Explanation (HTML content) */}
                <div
                    className="grammar-explanation text-text-secondary text-[0.9375rem] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizedExplanation }}
                />

                {/* Examples */}
                {card.examples.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
                            <Lightbulb className="w-4 h-4 text-accent-orange" />
                            <span>Ejemplos</span>
                        </div>
                        <div className="space-y-2">
                            {card.examples.map((example, i) => {
                                const parts = example.split(' \u2192 ');
                                const english = parts[0] ?? example;
                                const spanish = parts[1];

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15 + i * 0.06 }}
                                        className="bg-bg-app/60 border border-border rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3"
                                    >
                                        <span className="font-bold text-accent-blue text-[0.9375rem]">
                                            {english}
                                        </span>
                                        {spanish && (
                                            <>
                                                <span className="hidden sm:inline text-text-muted">&rarr;</span>
                                                <span className="text-text-muted text-sm">
                                                    {spanish}
                                                </span>
                                            </>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Rules */}
                {card.rules.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            <span>Reglas clave</span>
                        </div>
                        <ul className="space-y-2">
                            {card.rules.map((rule, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.06 }}
                                    className="flex items-start gap-3 text-[0.9375rem]"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                                    <span className="text-text-secondary leading-relaxed">{rule}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Entendido button */}
            <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleUnderstood}
                disabled={saving}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] hover:bg-primary-dark disabled:opacity-50"
            >
                {saving ? t('common.loading') : t('grammar.understood')}
            </motion.button>

            {/* Inline styles for HTML tables in the explanation */}
            <style>{`
                .grammar-explanation h3,
                .grammar-explanation h4 {
                    color: var(--color-text);
                    font-weight: 700;
                    margin-top: 1.25rem;
                    margin-bottom: 0.625rem;
                }
                .grammar-explanation h3 {
                    font-size: 1.0625rem;
                }
                .grammar-explanation h4 {
                    font-size: 0.9375rem;
                }
                .grammar-explanation p {
                    margin-bottom: 0.875rem;
                }
                .grammar-explanation ul,
                .grammar-explanation ol {
                    padding-left: 1.5rem;
                    margin-bottom: 0.875rem;
                }
                .grammar-explanation li {
                    margin-bottom: 0.375rem;
                }
                .grammar-explanation strong,
                .grammar-explanation b {
                    color: var(--color-text);
                    font-weight: 700;
                }
                .grammar-explanation em {
                    color: var(--color-accent-blue);
                    font-style: italic;
                }
                .grammar-explanation code {
                    background: rgba(255, 255, 255, 0.06);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.875rem;
                }
                .grammar-explanation table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 0.75rem 0;
                    font-size: 0.875rem;
                }
                .grammar-explanation thead th {
                    background: rgba(255, 255, 255, 0.06);
                    color: var(--color-text);
                    font-weight: 700;
                    padding: 10px 14px;
                    text-align: left;
                    border-bottom: 1px solid var(--color-border-light);
                }
                .grammar-explanation tbody td {
                    padding: 8px 14px;
                    border-bottom: 1px solid var(--color-border);
                    color: var(--color-text-secondary);
                }
                .grammar-explanation tbody tr:last-child td {
                    border-bottom: none;
                }
                .grammar-explanation tbody tr:hover td {
                    background: rgba(255, 255, 255, 0.03);
                }
                .grammar-explanation a {
                    color: var(--color-accent-blue);
                    text-decoration: underline;
                }
            `}</style>
        </motion.div>
    );
}
