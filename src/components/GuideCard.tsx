import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpenCheck, ChevronRight } from 'lucide-react';

interface GuideCardProps {
    /** On the profile the card is a plain way back to the guide, with its own words and no action label */
    variant?: 'newcomer' | 'profile';
}

/** The way to the guide: an invitation for a newcomer on the home screen, and a fixed link on the profile. */
export default function GuideCard({ variant = 'newcomer' }: GuideCardProps) {
    const { t } = useTranslation();
    const profile = variant === 'profile';
    return (
        <Link to="/guia" className="guide-card">
            <BookOpenCheck className="w-6 h-6 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
            <span className="flex-1 min-w-0 text-left">
                <span className="block font-semibold text-[var(--color-on-surface)]">{profile ? t('guide.title') : t('guide.cardTitle')}</span>
                <span className="block text-sm text-[var(--color-on-surface-muted)]">{profile ? t('guide.profileBody') : t('guide.cardBody')}</span>
            </span>
            {!profile && (
                <span className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[var(--color-primary)]">
                    {t('guide.cardAction')} <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </span>
            )}
            <ChevronRight className={profile ? 'w-5 h-5 text-[var(--color-primary)]' : 'sm:hidden w-5 h-5 text-[var(--color-primary)]'} aria-hidden="true" />
        </Link>
    );
}
