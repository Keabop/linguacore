import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
    /** Route to go back to. Use a route inside the app (e.g. /dashboard), never `/`, which leaves the layout. */
    to?: string;
    onClick?: () => void;
    /** Visible text next to the arrow; without it the button is the round arrow alone. */
    label?: string;
    className?: string;
}

/** The one back button of the app: a round arrow, optionally followed by a label. */
export default function BackButton({ to, onClick, label, className = '' }: BackButtonProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const handleClick = onClick ?? (() => (to ? navigate(to) : navigate(-1)));

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={label ? undefined : t('common.back')}
            className={`group inline-flex shrink-0 items-center gap-2.5 text-sm font-semibold text-[var(--color-on-surface-muted)] transition-colors duration-[var(--dur-short)] hover:text-[var(--color-on-surface)] ${className}`}
        >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-card)] shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-[var(--dur-short)] ease-[var(--ease-out)] group-hover:-translate-x-0.5 group-hover:shadow-[var(--shadow-elevated)]">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </span>
            {label && <span>{label}</span>}
        </button>
    );
}
