import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Something that went wrong and the learner has to know: it is written on the page they are on
 * (a band at the top of the screen, in the flow of the page), not floated over it. Successes are
 * not announced: the screen itself shows what changed.
 */
export interface Notice {
    tone: 'error' | 'warning';
    title: string;
    description?: string;
    /** Kept through the next screen change: the sign-out after an ended session lands on the sign-in */
    persist?: boolean;
}

type NoticeInput = Omit<Notice, 'tone'>;

let current: Notice | null = null;
const listeners = new Set<() => void>();

function set(next: Notice | null) {
    current = next;
    listeners.forEach(listener => listener());
}

export const notice = {
    error: (input: NoticeInput) => set({ tone: 'error', ...input }),
    warning: (input: NoticeInput) => set({ tone: 'warning', ...input }),
    clear: () => set(null),
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export function useNotice(): Notice | null {
    return useSyncExternalStore(subscribe, () => current, () => null);
}

/** The band where the current notice is written; it leaves with the screen it belongs to */
export function PageNotice({ className = '' }: { className?: string }) {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const shown = useNotice();
    const ref = useRef<HTMLDivElement>(null);
    const firstPath = useRef(pathname);

    useEffect(() => {
        if (pathname === firstPath.current) return;
        firstPath.current = pathname;
        if (!current) return;
        if (current.persist) set({ ...current, persist: false });
        else set(null);
    }, [pathname]);

    // A notice raised far down a long screen is brought into view
    useEffect(() => {
        if (shown) ref.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    }, [shown]);

    if (!shown) return null;
    return (
        <div ref={ref} role="alert" className={`page-notice is-${shown.tone} ${className}`}>
            <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-[var(--color-on-surface)]">{shown.title}</p>
                {shown.description && <p className="text-[var(--color-on-surface-muted)]">{shown.description}</p>}
            </div>
            <button type="button" onClick={notice.clear} aria-label={t('common.close')} className="page-notice-close">
                <X className="w-4 h-4" aria-hidden="true" />
            </button>
        </div>
    );
}
