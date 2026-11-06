import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { NotebookPen } from 'lucide-react';
import { useNotebook } from './NotebookContext';

const MIN_LENGTH = 2;
const MAX_LENGTH = 1000;
const GUTTER = 16;
const PILL_HEIGHT = 40;

/** Text selected in the page itself: not in a field, not in the notebook. */
function pageSelection(): { text: string; rect: DOMRect } | null {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;
    const text = selection.toString().trim();
    if (text.length < MIN_LENGTH || text.length > MAX_LENGTH) return null;
    const node = selection.anchorNode;
    const element = node instanceof Element ? node : node?.parentElement;
    if (!element?.closest('.main-content')) return null;
    if (element.closest('input, textarea, [contenteditable="true"], [data-notebook]')) return null;
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (!rect.width && !rect.height) return null;
    return { text, rect };
}

/**
 * Selecting text in a lesson shows an «Anotar» pill next to it: it opens the notebook with the
 * selection quoted. On touch screens the pill goes below the selection, clear of the system menu.
 */
export default function SelectionCapture() {
    const { t } = useTranslation();
    const notebook = useNotebook();
    const [found, setFound] = useState<{ text: string; rect: DOMRect } | null>(null);

    useEffect(() => {
        let timer = 0;
        const update = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => setFound(pageSelection()), 120);
        };
        document.addEventListener('selectionchange', update);
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.clearTimeout(timer);
            document.removeEventListener('selectionchange', update);
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, []);

    if (!notebook || !found) return null;

    const touch = window.matchMedia('(pointer: coarse)').matches;
    const width = document.documentElement.clientWidth;
    const centre = Math.min(Math.max(found.rect.left + found.rect.width / 2, GUTTER + 48), width - GUTTER - 48);
    const above = found.rect.top - PILL_HEIGHT - 10;
    const top = touch || above < GUTTER ? found.rect.bottom + 12 : above;

    return createPortal(
        <button
            type="button"
            className="notebook-capture"
            style={{ top, left: centre }}
            // Keep the selection while the pill is pressed
            onPointerDown={event => event.preventDefault()}
            onClick={() => {
                notebook.quote(found.text);
                window.getSelection()?.removeAllRanges();
                setFound(null);
            }}
        >
            <NotebookPen className="size-4" aria-hidden="true" />
            {t('notebook.capture')}
        </button>,
        document.body,
    );
}
