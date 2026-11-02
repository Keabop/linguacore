import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Wordmark from './ui/Wordmark';

/** The frame of the trial pages (`/probar`): no sidebar, only the way back and the sign-up. */
export default function TrialShell({ children }: { children: ReactNode }) {
    const { t } = useTranslation();
    return (
        <div className="min-h-dvh bg-[var(--color-background)] text-[var(--color-on-surface)]">
            <header className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 sm:px-6 py-5">
                <Link to="/" aria-label={t('trial.home')}><Wordmark className="text-2xl" /></Link>
                <Link to="/auth" className="btn-primary px-4 sm:px-5 py-2.5 text-sm whitespace-nowrap">{t('trial.createAccountShort')}</Link>
            </header>
            <main className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">{children}</main>
        </div>
    );
}
