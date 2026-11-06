import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Footprints, ChevronRight } from 'lucide-react';
import { useFirstSteps } from '../hooks/useFirstSteps';

/** Invites whoever starts from zero to «Primeros pasos» before unit 1, until they are done. */
export default function FirstStepsCard() {
    const { t } = useTranslation();
    const { done, finished, isLoading } = useFirstSteps();
    if (finished || isLoading) return null;
    return (
        <Link to="/primeros-pasos" className="first-steps-card">
            <Footprints className="w-6 h-6 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
            <span className="flex-1 min-w-0">
                <span className="block font-semibold text-[var(--color-on-surface)]">{t('firstSteps.cardTitle')}</span>
                <span className="block text-sm text-[var(--color-on-surface-muted)]">{t('firstSteps.cardBody')}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[var(--color-primary)]">
                {done.length ? t('firstSteps.cardContinue') : t('firstSteps.cardAction')} <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </span>
            <ChevronRight className="sm:hidden w-5 h-5 text-[var(--color-primary)]" aria-hidden="true" />
        </Link>
    );
}
