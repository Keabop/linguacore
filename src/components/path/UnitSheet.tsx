import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface Props {
    /** Small line above the title: "Unidad 3", "Final del nivel". */
    label: string;
    title: string;
    subtitle?: string;
    status: string;
    onClose: () => void;
    children: ReactNode;
}

/**
 * A unit's details beside the garden (right panel on desktop, bottom sheet on phones). Not a
 * modal: the garden stays usable, and another plot swaps what the panel shows.
 */
export default function UnitSheet({ label, title, subtitle, status, onClose, children }: Props) {
    const { t } = useTranslation();
    const ref = useRef<HTMLElement>(null);

    // Focus goes back to the sign or row that opened the panel when it closes
    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null;
        return () => { if (opener?.isConnected) opener.focus({ preventScroll: true }); };
    }, []);

    useEffect(() => {
        ref.current?.focus();
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        addEventListener('keydown', onKey);
        return () => removeEventListener('keydown', onKey);
    }, [title, onClose]);

    return createPortal(
        <aside ref={ref} tabIndex={-1} className="unit-sheet" aria-label={t('pathView.details', { title })}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                    <p className="text-xs font-semibold text-[var(--color-on-surface-variant)]">{label} · {status}</p>
                    <h2 className="font-display text-2xl font-extrabold leading-tight tracking-[-0.02em]">{title}</h2>
                    {subtitle && <p className="text-sm text-[var(--color-on-surface-muted)]">{subtitle}</p>}
                </div>
                <button type="button" onClick={onClose} aria-label={t('pathView.close')} className="unit-sheet-close">
                    <X className="w-4 h-4" aria-hidden="true" />
                </button>
            </div>
            {children}
        </aside>,
        document.body,
    );
}
