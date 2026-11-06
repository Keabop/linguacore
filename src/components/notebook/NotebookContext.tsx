import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { NoteContext } from '../../lib/notes';
import { QUOTE_MAX_LENGTH } from '../../lib/notes';

/** The note being written: kept while the notebook is closed and across reloads. */
export interface NoteDraft {
    body: string;
    quote: string | null;
    /** The note being edited, or null for a new one. */
    editingId: string | null;
}

const EMPTY_DRAFT: NoteDraft = { body: '', quote: null, editingId: null };
/** Per learner: someone else signing in on this device never sees the draft. */
export const draftKey = (userId: string | undefined) => `voxie-notebook-draft:${userId ?? 'guest'}`;

export interface NotebookValue {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    /** Opens the notebook with this text quoted in the note being written. */
    quote: (text: string) => void;
    draft: NoteDraft;
    setDraft: (update: (draft: NoteDraft) => NoteDraft) => void;
    /** The place the learner is in: what a new note will remember. */
    context: NoteContext;
    setPageContext: (context: NoteContext | null) => void;
}

const NotebookContext = createContext<NotebookValue | null>(null);
export const NotebookProvider = NotebookContext.Provider;

/** The notebook, or null outside the signed-in app (the trial, tests of a lone component). */
export function useNotebook(): NotebookValue | null {
    return useContext(NotebookContext);
}

/**
 * A page says where the learner is, more precisely than its route («Unidad 2 · Gramática» instead
 * of «Ruta»). The place is forgotten when the page goes away.
 */
export function useNoteContext(context: NoteContext | null) {
    const notebook = useNotebook();
    const setPageContext = notebook?.setPageContext;
    const key = context?.key;
    const label = context?.label;
    const path = context?.path;
    useEffect(() => {
        if (!setPageContext || !key || !label || !path) return;
        setPageContext({ key, label, path });
        return () => setPageContext(null);
    }, [setPageContext, key, label, path]);
}

const ROUTE_LABELS: [prefix: string, labelKey: string][] = [
    ['/dashboard', 'nav.home'],
    ['/path', 'nav.path'],
    ['/review/simulator', 'nav.simulator'],
    ['/review', 'nav.review'],
    ['/learn', 'nav.learn'],
    ['/chat', 'nav.chat'],
    ['/practice', 'nav.practice'],
    ['/account', 'nav.profile'],
];

function readDraft(key: string): NoteDraft {
    try {
        const stored = JSON.parse(localStorage.getItem(key) ?? 'null') as Partial<NoteDraft> | null;
        if (stored && typeof stored.body === 'string') {
            return { body: stored.body, quote: stored.quote ?? null, editingId: stored.editingId ?? null };
        }
    } catch {
        // Private mode or a broken value: start blank
    }
    return EMPTY_DRAFT;
}

/**
 * The notebook's state, owned by the app layout and handed down with `NotebookProvider`. The draft
 * belongs to `userId`.
 */
export function useNotebookController(userId: string | undefined): NotebookValue {
    const { t } = useTranslation();
    const location = useLocation();
    const storageKey = draftKey(userId);
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraftState] = useState<NoteDraft>(() => readDraft(storageKey));
    const [pageContext, setPageContext] = useState<NoteContext | null>(null);

    // Another learner on this device: their own draft, and the notebook starts closed
    const [draftOwner, setDraftOwner] = useState(storageKey);
    if (draftOwner !== storageKey) {
        setDraftOwner(storageKey);
        setDraftState(readDraft(storageKey));
        setIsOpen(false);
    }

    const setDraft = useCallback((update: (draft: NoteDraft) => NoteDraft) => {
        setDraftState(current => {
            const next = update(current);
            try {
                if (next.body || next.quote || next.editingId) localStorage.setItem(storageKey, JSON.stringify(next));
                else localStorage.removeItem(storageKey);
            } catch {
                // Storage full or blocked: the draft lives until the page closes
            }
            return next;
        });
    }, [storageKey]);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(value => !value), []);
    const quote = useCallback((text: string) => {
        const clean = text.replace(/\s+/g, ' ').trim().slice(0, QUOTE_MAX_LENGTH);
        if (!clean) return;
        setDraft(current => ({ ...current, quote: clean }));
        setIsOpen(true);
    }, [setDraft]);

    // Alt+N opens and closes it (by key position, so it works on every layout). Not while typing in
    // the page: on a Mac, Option+N is how «ñ» is written (a dead key, never taken). In the notebook's
    // own fields it does close it
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typingInPage = target?.closest?.('input, textarea, select, [contenteditable="true"]') && !target.closest('[data-notebook]');
            if (event.key === 'Dead' || typingInPage) return;
            if (event.altKey && !event.ctrlKey && !event.metaKey && event.code === 'KeyN') {
                event.preventDefault();
                toggle();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [toggle]);

    const routeContext = useMemo<NoteContext>(() => {
        const match = ROUTE_LABELS.find(([prefix]) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`));
        return match
            ? { key: `page:${match[0]}`, label: t(match[1]), path: match[0] }
            : { key: 'general', label: t('notebook.general'), path: location.pathname };
    }, [location.pathname, t]);

    const context = pageContext ?? routeContext;

    return useMemo(
        () => ({ isOpen, open, close, toggle, quote, draft, setDraft, context, setPageContext }),
        [isOpen, open, close, toggle, quote, draft, setDraft, context],
    );
}
