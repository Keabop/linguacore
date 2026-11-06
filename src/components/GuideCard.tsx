import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpenCheck, ChevronRight } from 'lucide-react';

/** Invites a newcomer to the guide on the home screen, until they open it or finish a unit. */
export default function GuideCard() {
    const { t } = useTranslation();
    return (
        <Link to="/guia" className="guide-card">
            <BookOpenCheck className="w-6 h-6 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
            <span className="flex-1 min-w-0">
                <span className="block font-semibold text-[var(--color-on-surface)]">{t('guide.cardTitle')}</span>
                <span className="block text-sm text-[var(--color-on-surface-muted)]">{t('guide.cardBody')}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[var(--color-primary)]">
                {t('guide.cardAction')} <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </span>
            <ChevronRight className="sm:hidden w-5 h-5 text-[var(--color-primary)]" aria-hidden="true" />
        </Link>
    );
}
