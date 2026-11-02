import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';

interface Props {
    /** A model answer to compare with, when the exercise has one. */
    referenceAnswer?: string;
    onContinue: () => void;
}

/**
 * Shown when the free plan has used today's AI evaluations. The exercise is not lost: the learner
 * compares with the model answer and goes on, and Pro is an option, not a wall.
 */
export default function EvaluationLimitCard({ referenceAnswer, onContinue }: Props) {
    const { t } = useTranslation();
    return (
        <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-6 space-y-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-3">
                <Droplet className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--color-on-surface)]">{t('evaluationLimit.title')}</p>
                    <p className="text-sm text-[var(--color-on-surface-muted)]">{t('evaluationLimit.body')}</p>
                </div>
            </div>
            {referenceAnswer && (
                <div className="rounded-xl bg-[var(--color-primary-container)] p-4 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-muted)]">{t('evaluationLimit.modelAnswer')}</p>
                    <p className="text-sm text-[var(--color-on-surface)]">{referenceAnswer}</p>
                </div>
            )}
            <div className="flex flex-wrap items-center gap-4">
                <button onClick={onContinue} className="btn-primary px-5 py-2.5 text-sm">{t('evaluationLimit.continue')}</button>
                <Link to="/pricing" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">{t('evaluationLimit.pro')}</Link>
            </div>
        </div>
    );
}
