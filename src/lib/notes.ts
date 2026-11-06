import type { NoteRow } from './database.types';

/** Where a note is written: shown on the note and used to go back there. */
export interface NoteContext {
    /** Stable id of the place: `unit:a1-u2`, `story:the-lost-cat`, `page:/chat`. */
    key: string;
    label: string;
    path: string;
}

/** What the notebook keeps of a note. */
export type Note = Pick<NoteRow, 'id' | 'body' | 'quote' | 'context_key' | 'context_label' | 'context_path' | 'created_at' | 'updated_at'>;

export const NOTE_MAX_LENGTH = 5000;
export const QUOTE_MAX_LENGTH = 1000;

export const BULLET = '• ';
export const SEPARATOR = '———';

/** A line of a note, as the notebook draws it. */
export type NoteBlock =
    | { kind: 'text'; text: string }
    | { kind: 'bullets'; items: string[] }
    | { kind: 'separator' };

const isSeparator = (line: string) => /^\s*(—{3,}|-{3,}|_{3,})\s*$/.test(line);
const bulletText = (line: string) => line.match(/^\s*[•\-*]\s+(.*)$/)?.[1];

/**
 * A note is plain text with two marks: a line that starts with «• » (or «- ») is a point, and a
 * line of three dashes is a separator. Consecutive points make one list.
 */
export function parseNoteBody(body: string): NoteBlock[] {
    const blocks: NoteBlock[] = [];
    let text: string[] = [];
    const flushText = () => {
        const joined = text.join('\n').trim();
        if (joined) blocks.push({ kind: 'text', text: joined });
        text = [];
    };
    for (const line of body.split('\n')) {
        if (isSeparator(line)) {
            flushText();
            blocks.push({ kind: 'separator' });
            continue;
        }
        const item = bulletText(line);
        if (item !== undefined) {
            flushText();
            const last = blocks[blocks.length - 1];
            if (last?.kind === 'bullets') last.items.push(item);
            else blocks.push({ kind: 'bullets', items: [item] });
            continue;
        }
        text.push(line);
    }
    flushText();
    return blocks;
}

/** Turns the line under the cursor into a point, or back into plain text. */
export function toggleBullet(value: string, cursor: number): { value: string; cursor: number } {
    const start = value.lastIndexOf('\n', cursor - 1) + 1;
    const line = value.slice(start);
    if (line.startsWith(BULLET)) {
        return { value: value.slice(0, start) + line.slice(BULLET.length), cursor: Math.max(start, cursor - BULLET.length) };
    }
    return { value: value.slice(0, start) + BULLET + line, cursor: cursor + BULLET.length };
}

/** Puts a separator on its own line at the cursor and leaves the cursor on the next line. */
export function insertSeparator(value: string, cursor: number): { value: string; cursor: number } {
    const before = value.slice(0, cursor);
    const after = value.slice(cursor);
    const lead = before === '' || before.endsWith('\n') ? '' : '\n';
    const insert = `${lead}${SEPARATOR}\n`;
    return { value: before + insert + after, cursor: cursor + insert.length };
}

/** Pressing Enter on a point starts the next point; on an empty point it ends the list. */
export function continueBullet(value: string, cursor: number): { value: string; cursor: number } | null {
    const start = value.lastIndexOf('\n', cursor - 1) + 1;
    const line = value.slice(start, cursor);
    if (!line.startsWith(BULLET)) return null;
    if (line === BULLET) {
        return { value: value.slice(0, start) + value.slice(cursor), cursor: start };
    }
    const insert = `\n${BULLET}`;
    return { value: value.slice(0, cursor) + insert + value.slice(cursor), cursor: cursor + insert.length };
}

const fold = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Notes whose text, quote or place contain every word searched, accents ignored. */
export function searchNotes<T extends Note>(notes: T[], query: string): T[] {
    const words = fold(query).split(/\s+/).filter(Boolean);
    if (!words.length) return notes;
    return notes.filter(note => {
        const haystack = fold([note.body, note.quote, note.context_label].filter(Boolean).join(' '));
        return words.every(word => haystack.includes(word));
    });
}

export interface NoteGroup<T extends Note = Note> {
    key: string;
    label: string | null;
    path: string | null;
    notes: T[];
}

/** Notes by place, the place written in most recently first; newest note first inside each. */
export function groupNotes<T extends Note>(notes: T[]): NoteGroup<T>[] {
    const sorted = [...notes].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    const groups = new Map<string, NoteGroup<T>>();
    for (const note of sorted) {
        const key = note.context_key ?? 'general';
        let group = groups.get(key);
        if (!group) {
            group = { key, label: note.context_label, path: safeNotePath(note.context_path), notes: [] };
            groups.set(key, group);
        }
        group.notes.push(note);
    }
    return [...groups.values()];
}

/** Only an in-app route is followed: a stored path never becomes a link elsewhere. */
export function safeNotePath(path: string | null | undefined): string | null {
    return path && /^\/(?!\/)[^\s\\]*$/.test(path) ? path : null;
}
