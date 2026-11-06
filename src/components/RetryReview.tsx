import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { levelOfId, useLevelContent } from '../data/levels';
import { PASS_SCORE, type RetryPart, type ReviewItem } from '../lib/retryPolicy';

const RULES_MAX = 3;

interface Props {
    part: RetryPart;
    unitId: string;
    score: number;
    /** The learner's own mistakes, already kept short. */
    items: ReviewItem[];
    /** How many prompts the retry asks for again; absent when it repeats the whole set. */
    retryCount?: number;
    /** After the second try a practice part may be left as it is. */
    canContinue: boolean;
    onRetry: () => void;
    onContinue?: () => void;
}

/**
 * Below the pass mark: a short review before trying again, not the whole grammar card. The unit's
 * rule in a few lines and what the learner got wrong, with the right form and why.
 */
export default function RetryReview({ part, unitId, score, items, retryCount, canContinue, onRetry, onContinue }: Props) {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();
    const level = useLevelContent(levelOfId(unitId));
    const rules = level?.grammarCards?.find(card => card.unitId === unitId)?.rules.slice(0, RULES_MAX) ?? [];
    const headingRef = useRef<HTMLHeadingElement>(null);

    // The review replaces what was on screen: start reading it from the top
    useEffect(() => {
        headingRef.current?.focus({ preventScroll: true });
        headingRef.current?.scrollIntoView?.({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }, [reduceMotion]);

    return (
        <motion.section
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="app-sheet retry-review"
            aria-labelledby="retry-review-title"
        >
            <header className="space-y-1.5">
                <h3 id="retry-review-title" ref={headingRef} tabIndex={-1} className="app-h3 outline-none">
                    {t('retry.title')}
                </h3>
                <p className="text-sm text-[var(--color-on-surface-muted)]">
                    {t('retry.score', { score, pass: PASS_SCORE[part] })}
                </p>
            </header>

            {rules.length > 0 && (
                <div className="space-y-2">
                    <h4 className="retry-review-label">{t('retry.rules')}</h4>
                    <ul className="retry-review-rules">
                        {rules.map(rule => <li key={rule}>{rule}</li>)}
                    </ul>
                </div>
            )}

            {items.length > 0 && (
                <div className="space-y-2">
                    <h4 className="retry-review-label">{t('retry.mistakes')}</h4>
                    <ul className="space-y-2.5">
                        {items.map((item, i) => (
                            <li key={i} className="retry-review-item">
                                {item.prompt && <p className="text-xs text-[var(--color-on-surface-muted)]">{item.prompt}</p>}
                                {(item.wrong || item.right) && (
                                    <p className="text-sm">
                                        {item.wrong && <><s className="text-[var(--color-error)]">{item.wrong}</s>{item.right && ' → '}</>}
                                        {item.right && <strong className="text-[var(--color-on-surface)]">{item.right}</strong>}
                                    </p>
                                )}
                                <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{item.why}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-2.5 pt-1">
                <button type="button" onClick={onRetry} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    {retryCount ? t('retry.againPrompts', { count: retryCount }) : t('retry.again')}
                </button>
                {canContinue && onContinue && (
                    <>
                        <button type="button" onClick={onContinue} className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
                            {t('retry.continue')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <p className="text-xs text-center text-[var(--color-on-surface-muted)]">{t('retry.continueNote')}</p>
                    </>
                )}
            </div>
        </motion.section>
    );
}
