import { useEffect, useId, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { NotebookPen, X } from 'lucide-react';
import type { GlossaryEntry } from '../data/glossary';
import { useDialogKeys } from '../hooks/useDialogKeys';

const GUTTER = 16;
const GAP = 8;
const MAX_WIDTH = 320;

interface GlossaryPopoverProps {
    entry: GlossaryEntry;
    /** The underlined term that opened it. */
    anchor: HTMLElement;
    onClose: () => void;
    /** Present inside the app: copies the definition into the notebook. */
    onSaveToNotebook?: () => void;
}

/**
 * The definition of a grammar term, next to the term: below it, or above when there is no room.
 * Escape, the close button or a tap outside close it, and focus goes back to the term.
 */
export default function GlossaryPopover({ entry, anchor, onClose, onSaveToNotebook }: GlossaryPopoverProps) {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();
    const ref = useDialogKeys<HTMLDivElement>(true, onClose);
    const id = useId();
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const width = Math.min(MAX_WIDTH, document.documentElement.clientWidth - GUTTER * 2);

    // Place it against the term, and keep it there while the page scrolls
    useLayoutEffect(() => {
        const place = () => {
            const popover = ref.current;
            if (!popover) return;
            const term = anchor.getBoundingClientRect();
            const viewportWidth = document.documentElement.clientWidth;
            const height = popover.offsetHeight;
            const left = Math.min(
                Math.max(term.left + term.width / 2 - width / 2, GUTTER),
                viewportWidth - GUTTER - width,
            );
            const below = term.bottom + GAP;
            const fitsBelow = below + height <= window.innerHeight - GUTTER;
            const fitsAbove = term.top - GAP - height >= GUTTER;
            setPosition({ top: !fitsBelow && fitsAbove ? term.top - GAP - height : below, left });
        };
        place();
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        return () => {
            window.removeEventListener('resize', place);
            window.removeEventListener('scroll', place, true);
        };
    }, [anchor, entry, width, ref]);

    // The term says it is open; focus moves in, and back to the term when it closes from inside
    useEffect(() => {
        const popover = ref.current;
        anchor.setAttribute('aria-expanded', 'true');
        anchor.setAttribute('aria-controls', id);
        popover?.focus({ preventScroll: true });
        return () => {
            anchor.setAttribute('aria-expanded', 'false');
            anchor.removeAttribute('aria-controls');
            const active = document.activeElement;
            if (!active || active === document.body || popover?.contains(active)) {
                anchor.focus({ preventScroll: true });
            }
        };
    }, [anchor, id, ref]);

    // A tap anywhere else closes it; a tap on its own term is left to the term, which toggles it
    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (ref.current?.contains(target) || anchor.contains(target)) return;
            onClose();
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [anchor, onClose, ref]);

    return createPortal(
        <motion.div
            ref={ref}
            id={id}
            role="dialog"
            aria-labelledby={`${id}-term`}
            tabIndex={-1}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: 'fixed',
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                width,
                visibility: position ? 'visible' : 'hidden',
            }}
            className="z-[80] rounded-[var(--radius-md)] bg-[var(--color-card)] p-4 pt-3 pr-2 shadow-[var(--shadow-elevated)] ring-1 ring-[var(--color-outline-variant)] outline-none"
        >
            <div className="flex items-start gap-2">
                <h3
                    id={`${id}-term`}
                    className="flex-1 pt-2 text-[1.0625rem] font-bold leading-snug text-[var(--color-on-surface)]"
                >
                    {entry.term}
                </h3>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('common.close')}
                    className="grid size-11 shrink-0 place-items-center rounded-full text-[var(--color-on-surface-muted)] transition-colors hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]"
                >
                    <X className="size-4" aria-hidden="true" />
                </button>
            </div>
            <div className="space-y-3 pr-2">
                <p className="text-[0.9375rem] leading-relaxed text-[var(--color-on-surface-muted)]">
                    {entry.definition}
                </p>
                <p className="rounded-[var(--radius-sm)] bg-[var(--color-tertiary-container)] px-3 py-2 text-[0.9375rem] font-medium leading-snug text-[var(--color-on-surface)]">
                    <span className="sr-only">{t('glossary.example')}: </span>
                    {entry.example}
                </p>
                {onSaveToNotebook && (
                    <button
                        type="button"
                        onClick={onSaveToNotebook}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-outline-variant)] px-4 text-sm font-semibold text-[var(--color-on-surface)] transition-colors hover:border-[var(--color-on-surface-muted)]"
                    >
                        <NotebookPen className="size-4" aria-hidden="true" />
                        {t('notebook.saveToNotebook')}
                    </button>
                )}
            </div>
        </motion.div>,
        document.body,
    );
}
