import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronsDown, ChevronsUp, NotebookPen } from 'lucide-react';
import NotebookPanel from './NotebookPanel';
import SelectionCapture from './SelectionCapture';
import { useNotebook } from './NotebookContext';

export type NotebookSide = 'left' | 'right';

const PHONE_QUERY = '(max-width: 1024px)';
const BUBBLE_SIZE = 52;
const EDGE_GAP = 8;
/** Bands the bubble never sits in: the page head on top, the floating bar and fixed actions below. */
const TOP_BAND = 72;
const BOTTOM_BAND = 168;
const BUBBLE_KEY = 'voxie-notebook-bubble';

function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(
        onChange => {
            const list = window.matchMedia(query);
            list.addEventListener('change', onChange);
            return () => list.removeEventListener('change', onChange);
        },
        () => window.matchMedia(query).matches,
    );
}

/** How far the on-screen keyboard covers the bottom of the page, so the sheet rides above it. */
function useKeyboardInset(): number {
    const [inset, setInset] = useState(0);
    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;
        const update = () => setInset(Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop));
        update();
        viewport.addEventListener('resize', update);
        viewport.addEventListener('scroll', update);
        return () => {
            viewport.removeEventListener('resize', update);
            viewport.removeEventListener('scroll', update);
        };
    }, []);
    return inset;
}

interface BubblePlace { side: NotebookSide; y: number }

function readBubblePlace(): BubblePlace {
    try {
        const stored = JSON.parse(localStorage.getItem(BUBBLE_KEY) ?? 'null') as BubblePlace | null;
        if (stored && (stored.side === 'left' || stored.side === 'right') && typeof stored.y === 'number') return stored;
    } catch {
        // Nothing stored or storage blocked
    }
    return { side: 'right', y: 0.55 };
}

const clampY = (y: number, height: number) =>
    Math.min(Math.max(y, TOP_BAND), Math.max(TOP_BAND, height - BOTTOM_BAND - BUBBLE_SIZE));

/**
 * The phone's way in: a bubble that sticks to the left or right edge. Drag it anywhere along an
 * edge; it remembers where. A tap opens the notebook.
 */
function NotebookBubble({ onOpen }: { onOpen: () => void }) {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();
    const [place, setPlace] = useState(readBubblePlace);
    const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
    const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
    // A drag ends with a click too: only a tap opens it
    const dragged = useRef(false);
    const [height, setHeight] = useState(window.innerHeight);
    const width = document.documentElement.clientWidth;

    useEffect(() => {
        const onResize = () => setHeight(window.innerHeight);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const keep = (next: BubblePlace) => {
        setPlace(next);
        try { localStorage.setItem(BUBBLE_KEY, JSON.stringify(next)); } catch { /* not kept */ }
    };

    const top = drag ? clampY(drag.y - BUBBLE_SIZE / 2, height) : clampY(place.y * height, height);
    const left = drag
        ? Math.min(Math.max(drag.x - BUBBLE_SIZE / 2, EDGE_GAP), width - EDGE_GAP - BUBBLE_SIZE)
        : place.side === 'left' ? EDGE_GAP : width - EDGE_GAP - BUBBLE_SIZE;

    const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0) return;
        start.current = { x: event.clientX, y: event.clientY, moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
        const s = start.current;
        if (!s) return;
        if (!s.moved && Math.hypot(event.clientX - s.x, event.clientY - s.y) < 6) return;
        s.moved = true;
        setDrag({ x: event.clientX, y: event.clientY });
    };
    const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
        const s = start.current;
        start.current = null;
        if (!s?.moved) return;
        dragged.current = true;
        const y = clampY(event.clientY - BUBBLE_SIZE / 2, height);
        keep({ side: event.clientX < width / 2 ? 'left' : 'right', y: y / height });
        setDrag(null);
    };
    const onClick = () => {
        if (dragged.current) {
            dragged.current = false;
            return;
        }
        onOpen();
    };
    const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        const moves: Record<string, () => BubblePlace> = {
            ArrowLeft: () => ({ ...place, side: 'left' }),
            ArrowRight: () => ({ ...place, side: 'right' }),
            ArrowUp: () => ({ ...place, y: clampY(place.y * height - 48, height) / height }),
            ArrowDown: () => ({ ...place, y: clampY(place.y * height + 48, height) / height }),
        };
        const move = moves[event.key];
        if (!move) return;
        event.preventDefault();
        keep(move());
    };

    return (
        <motion.button
            type="button"
            aria-label={t('notebook.open')}
            title={t('notebook.bubbleHint')}
            data-notebook-toggle
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { start.current = null; setDrag(null); }}
            onClick={onClick}
            onKeyDown={onKeyDown}
            className={`notebook-bubble ${drag ? 'is-dragging' : ''}`}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.8 }}
            animate={{ opacity: 1, scale: 1, top, left }}
            exit={{ opacity: 0 }}
            transition={drag || reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
            <NotebookPen className="size-6" aria-hidden="true" />
        </motion.button>
    );
}

/** The phone's notebook: a sheet from the bottom, with no veil, so the lesson stays usable above it. */
function NotebookSheet({ onClose }: { onClose: () => void }) {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();
    const keyboard = useKeyboardInset();
    const [tall, setTall] = useState(false);

    return (
        <motion.div
            role="dialog"
            aria-modal="false"
            aria-label={t('notebook.title')}
            className="notebook-dock is-sheet"
            style={{ bottom: keyboard, height: tall || keyboard > 0 ? `calc(92dvh - ${keyboard}px)` : '60dvh' }}
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
        >
            <NotebookPanel
                onClose={onClose}
                headerActions={(
                    <button
                        type="button"
                        onClick={() => setTall(v => !v)}
                        aria-label={tall ? t('notebook.shrink') : t('notebook.grow')}
                        aria-expanded={tall}
                        className="notebook-icon-button"
                    >
                        {tall ? <ChevronsDown className="size-5" aria-hidden="true" /> : <ChevronsUp className="size-5" aria-hidden="true" />}
                    </button>
                )}
            />
        </motion.div>
    );
}

/** The desktop notebook: a panel on the side away from the rail; the page moves over to make room. */
function NotebookSidePanel({ side, railEdge, onClose }: { side: NotebookSide; railEdge: 'top' | 'bottom' | null; onClose: () => void }) {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();
    const offscreen = side === 'right' ? '110%' : '-110%';
    return (
        <motion.aside
            aria-label={t('notebook.title')}
            className={`notebook-dock is-panel side-${side} ${railEdge ? `rail-${railEdge}` : ''}`}
            initial={reduceMotion ? { opacity: 0 } : { x: offscreen }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: offscreen }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={e => {
                if (e.key !== 'Escape') return;
                onClose();
                document.querySelector<HTMLElement>('[data-notebook-toggle]')?.focus();
            }}
        >
            <NotebookPanel onClose={onClose} />
        </motion.aside>
    );
}

/** Where the notebook lives on this screen size, plus the «Anotar» pill for selected text. */
export default function NotebookDock({ side, railEdge }: { side: NotebookSide; railEdge: 'top' | 'bottom' | null }) {
    const notebook = useNotebook();
    const isPhone = useMediaQuery(PHONE_QUERY);
    if (!notebook) return null;
    const { isOpen, open, close } = notebook;

    return (
        <>
            <SelectionCapture />
            <AnimatePresence>
                {isPhone && !isOpen && <NotebookBubble key="bubble" onOpen={open} />}
                {isPhone && isOpen && <NotebookSheet key="sheet" onClose={close} />}
                {!isPhone && isOpen && <NotebookSidePanel key="panel" side={side} railEdge={railEdge} onClose={close} />}
            </AnimatePresence>
        </>
    );
}
