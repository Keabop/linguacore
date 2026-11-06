import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, List, MapPin, Minus, Pencil, Search, Trash2, X } from 'lucide-react';
import { useNotes } from '../../hooks/useNotes';
import {
    NOTE_MAX_LENGTH,
    continueBullet,
    groupNotes,
    insertSeparator,
    parseNoteBody,
    searchNotes,
    toggleBullet,
    type Note,
} from '../../lib/notes';
import { useNotebook } from './NotebookContext';

interface NotebookPanelProps {
    onClose: () => void;
    /** Extra controls next to the close button (the sheet's grow button). */
    headerActions?: ReactNode;
}

/** A note's text: plain lines, points as a list and separators as a rule. */
export function NoteBody({ body }: { body: string }) {
    const blocks = parseNoteBody(body);
    return (
        <div className="notebook-body">
            {blocks.map((block, i) => {
                if (block.kind === 'separator') return <hr key={i} className="notebook-rule" />;
                if (block.kind === 'bullets') {
                    return (
                        <ul key={i} className="notebook-bullets">
                            {block.items.map((item, j) => <li key={j}>{item}</li>)}
                        </ul>
                    );
                }
                return <p key={i} className="whitespace-pre-line">{block.text}</p>;
            })}
        </div>
    );
}

function useNoteTime() {
    const { i18n, t } = useTranslation();
    return useMemo(() => {
        const time = new Intl.DateTimeFormat(i18n.language, { hour: 'numeric', minute: '2-digit' });
        const day = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' });
        return (iso: string) => {
            const date = new Date(iso);
            const today = new Date().toDateString() === date.toDateString();
            return today ? `${t('notebook.today')} ${time.format(date)}` : day.format(date);
        };
    }, [i18n.language, t]);
}

/**
 * The notebook itself, the same in the desktop panel and the phone sheet: the note being written
 * on top, then search and every note grouped by the place it was written in.
 */
export default function NotebookPanel({ onClose, headerActions }: NotebookPanelProps) {
    const { t } = useTranslation();
    const notebook = useNotebook();
    const { notes, isLoading, isError, saveNote, deleteNote } = useNotes();
    const navigate = useNavigate();
    const location = useLocation();
    const formatTime = useNoteTime();
    const titleId = useId();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [query, setQuery] = useState('');
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState(false);

    // Opening the notebook puts the cursor in the note; not on a touch screen, where that would
    // pull up the keyboard over the notes the learner may only want to read
    useEffect(() => {
        if (!window.matchMedia?.('(pointer: coarse)').matches) textareaRef.current?.focus({ preventScroll: true });
    }, []);

    // A quote or an edit that arrives while it is open also takes the cursor there
    const draftQuote = notebook?.draft.quote;
    const editingId = notebook?.draft.editingId;
    useEffect(() => {
        if (draftQuote || editingId) textareaRef.current?.focus({ preventScroll: true });
    }, [draftQuote, editingId]);

    const filtered = useMemo(() => searchNotes(notes, query), [notes, query]);
    const groups = useMemo(() => groupNotes(filtered), [filtered]);

    if (!notebook) return null;
    const { draft, setDraft, context } = notebook;
    const editing = draft.editingId ? notes.find(n => n.id === draft.editingId) : undefined;
    const place = editing ? editing.context_label : context.label;
    const canSave = (draft.body.trim() || draft.quote) && status !== 'saving';

    const editAtCursor = (edit: (value: string, cursor: number) => { value: string; cursor: number } | null) => {
        const area = textareaRef.current;
        if (!area) return false;
        const result = edit(draft.body, area.selectionStart);
        if (!result) return false;
        setDraft(d => ({ ...d, body: result.value.slice(0, NOTE_MAX_LENGTH) }));
        requestAnimationFrame(() => {
            area.focus();
            area.setSelectionRange(result.cursor, result.cursor);
        });
        return true;
    };

    const handleSave = async () => {
        if (!canSave) return;
        setStatus('saving');
        try {
            await saveNote({ id: draft.editingId ?? undefined, body: draft.body, quote: draft.quote, context });
            setDraft(() => ({ body: '', quote: null, editingId: null }));
            setStatus('saved');
        } catch {
            setStatus('error');
        }
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            void handleSave();
        } else if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            if (editAtCursor(continueBullet)) event.preventDefault();
        } else if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
        }
    };

    const startEdit = (note: Note) => {
        setDraft(() => ({ body: note.body, quote: note.quote, editingId: note.id }));
        setConfirmingId(null);
        setStatus('idle');
    };

    const handleDelete = async (id: string) => {
        setDeleteError(false);
        try {
            await deleteNote(id);
            if (draft.editingId === id) setDraft(() => ({ body: '', quote: null, editingId: null }));
        } catch {
            setDeleteError(true);
        }
        setConfirmingId(null);
    };

    return (
        <div className="notebook-sheet flex h-full min-h-0 flex-col" data-notebook>
            {/* Header */}
            <div className="flex items-center gap-2 px-5 pb-3 pt-4">
                <h2 id={titleId} className="flex-1 font-display text-xl font-bold tracking-tight text-[var(--color-on-surface)]">
                    {t('notebook.title')}
                    {notes.length > 0 && (
                        <span className="ml-2 align-middle font-mono text-xs font-medium text-[var(--color-on-surface-variant)]">
                            {t('notebook.count', { count: notes.length })}
                        </span>
                    )}
                </h2>
                {headerActions}
                <button type="button" onClick={onClose} aria-label={t('notebook.close')} className="notebook-icon-button">
                    <X className="size-5" aria-hidden="true" />
                </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
                {/* The note being written */}
                <section aria-labelledby={`${titleId}-new`} className="notebook-composer">
                    <h3 id={`${titleId}-new`} className="sr-only">{editing ? t('notebook.editing') : t('notebook.newNote')}</h3>
                    <p className="notebook-place">
                        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{editing ? t('notebook.editingIn', { place }) : place}</span>
                    </p>
                    {draft.quote && (
                        <figure className="notebook-quote">
                            <blockquote className="whitespace-pre-line">{draft.quote}</blockquote>
                            <button
                                type="button"
                                onClick={() => setDraft(d => ({ ...d, quote: null }))}
                                aria-label={t('notebook.removeQuote')}
                                className="notebook-icon-button -my-2 -mr-2 shrink-0"
                            >
                                <X className="size-4" aria-hidden="true" />
                            </button>
                        </figure>
                    )}
                    <label htmlFor={`${titleId}-text`} className="sr-only">{t('notebook.placeholder')}</label>
                    <textarea
                        id={`${titleId}-text`}
                        ref={textareaRef}
                        value={draft.body}
                        onChange={e => { setDraft(d => ({ ...d, body: e.target.value })); if (status !== 'idle') setStatus('idle'); }}
                        onKeyDown={handleKeyDown}
                        maxLength={NOTE_MAX_LENGTH}
                        rows={4}
                        placeholder={t('notebook.placeholder')}
                        className="notebook-textarea"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => editAtCursor(toggleBullet)} className="notebook-tool">
                            <List className="size-4" aria-hidden="true" />{t('notebook.bullet')}
                        </button>
                        <button type="button" onClick={() => editAtCursor(insertSeparator)} className="notebook-tool">
                            <Minus className="size-4" aria-hidden="true" />{t('notebook.separator')}
                        </button>
                        <p role="status" className={`min-w-0 flex-1 text-xs ${status === 'error' ? 'text-[var(--color-error)]' : 'text-[var(--color-on-surface-variant)]'}`}>
                            {status === 'saved' && t('notebook.saved')}
                        </p>
                        {editing && (
                            <button
                                type="button"
                                onClick={() => setDraft(() => ({ body: '', quote: null, editingId: null }))}
                                className="notebook-tool"
                            >
                                {t('notebook.cancel')}
                            </button>
                        )}
                        <button type="button" onClick={handleSave} disabled={!canSave} className="btn-primary min-h-10 px-4 text-sm disabled:opacity-50">
                            {editing ? t('notebook.saveEdit') : t('notebook.save')}
                        </button>
                    </div>
                    {status === 'error' && <p role="alert" className="text-xs text-[var(--color-error)]">{t('notebook.saveError')}</p>}
                </section>

                {/* Every note */}
                {notes.length > 0 && (
                    <div className="relative mb-4 mt-2">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-on-surface-variant)]" aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder={t('notebook.search')}
                            aria-label={t('notebook.search')}
                            className="notebook-search"
                        />
                    </div>
                )}

                {deleteError && <p role="alert" className="mb-3 text-xs text-[var(--color-error)]">{t('notebook.deleteError')}</p>}
                {isLoading && <p className="text-sm text-[var(--color-on-surface-variant)]">{t('common.loading')}</p>}
                {isError && <p className="text-sm text-[var(--color-error)]">{t('notebook.loadError')}</p>}
                {!isLoading && !isError && notes.length === 0 && (
                    <p className="notebook-empty">{t('notebook.empty')}</p>
                )}
                {notes.length > 0 && groups.length === 0 && (
                    <p className="text-sm text-[var(--color-on-surface-muted)]">{t('notebook.noResults', { query })}</p>
                )}

                <div className="space-y-6">
                    {groups.map(group => {
                        const here = group.path === location.pathname;
                        return (
                            <section key={group.key} aria-label={group.label ?? t('notebook.general')}>
                                <div className="notebook-group-head">
                                    <h3 className="min-w-0 truncate">{group.label ?? t('notebook.general')}</h3>
                                    {group.path && !here && (
                                        <button type="button" onClick={() => navigate(group.path!)} className="notebook-go">
                                            {t('notebook.goThere')}<ArrowUpRight className="size-3.5" aria-hidden="true" />
                                        </button>
                                    )}
                                    {here && <span className="notebook-here">{t('notebook.here')}</span>}
                                </div>
                                <ul>
                                    {group.notes.map(note => (
                                        <li key={note.id} className={`notebook-note ${note.id === draft.editingId ? 'is-editing' : ''}`}>
                                            {note.quote && <blockquote className="notebook-note-quote whitespace-pre-line">{note.quote}</blockquote>}
                                            {note.body && <NoteBody body={note.body} />}
                                            {confirmingId === note.id ? (
                                                <div className="notebook-confirm" role="group" aria-label={t('notebook.confirmDelete')}>
                                                    <span>{t('notebook.confirmDelete')}</span>
                                                    <button type="button" onClick={() => handleDelete(note.id)} className="text-[var(--color-error)]" autoFocus>
                                                        {t('notebook.delete')}
                                                    </button>
                                                    <button type="button" onClick={() => setConfirmingId(null)}>{t('notebook.cancel')}</button>
                                                </div>
                                            ) : (
                                                <div className="notebook-note-foot">
                                                    <time dateTime={note.updated_at}>{formatTime(note.updated_at)}</time>
                                                    <span className="notebook-note-actions">
                                                        <button type="button" onClick={() => startEdit(note)} aria-label={t('notebook.edit')} className="notebook-icon-button">
                                                            <Pencil className="size-4" aria-hidden="true" />
                                                        </button>
                                                        <button type="button" onClick={() => setConfirmingId(note.id)} aria-label={t('notebook.delete')} className="notebook-icon-button">
                                                            <Trash2 className="size-4" aria-hidden="true" />
                                                        </button>
                                                    </span>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
