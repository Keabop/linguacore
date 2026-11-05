import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';
import { CHECK_EVERY_MS, shouldApplyNow } from '../lib/updatePolicy';

/**
 * New versions of the app. The service worker installs one in the background and leaves it
 * waiting; this asks the server for it now and then, applies it by itself when nothing is in
 * progress (right after opening, or on the way to a resting screen) and otherwise offers a button.
 */
export default function UpdatePrompt() {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const openedAt = useRef(Date.now());
    const found = useRef<{ pathname: string; afterMs: number } | null>(null);
    const [dismissed, setDismissed] = useState(false);
    const [applying, setApplying] = useState(false);

    const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
        onRegisteredSW(_url, registration) {
            if (!registration) return;
            const check = () => {
                if (navigator.onLine && !registration.installing) registration.update().catch(() => {});
            };
            setInterval(check, CHECK_EVERY_MS);
            // Coming back to a tab left open for days is when an old version is most likely
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') check();
            });
        },
    });

    const apply = () => {
        setApplying(true);
        void updateServiceWorker(true);
        // The reload waits for the new worker to take over; a page it never controlled (the very
        // first visit) gets no such signal, so it reloads by itself after a moment
        setTimeout(() => window.location.reload(), 3000);
    };

    useEffect(() => {
        if (!needRefresh || applying) return;
        found.current ??= { pathname, afterMs: Date.now() - openedAt.current };
        if (shouldApplyNow({ pathname, pathnameWhenFound: found.current.pathname, foundAfterMs: found.current.afterMs })) apply();
    }, [needRefresh, pathname, applying]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!needRefresh || dismissed) return null;

    return (
        <div role="status" className="update-toast">
            <RefreshCw className="w-5 h-5 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm">
                <span className="block font-semibold text-[var(--color-on-surface)]">{t('update.title')}</span>
                <span className="block text-[var(--color-on-surface-muted)]">{t('update.body')}</span>
            </p>
            <div className="flex shrink-0 items-center gap-1">
                <button type="button" className="update-toast-later" onClick={() => setDismissed(true)}>
                    {t('update.later')}
                </button>
                <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={apply} disabled={applying}>
                    {t('update.action')}
                </button>
            </div>
        </div>
    );
}
