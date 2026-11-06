import { describe, expect, it } from 'vitest';
import {
    continueBullet,
    groupNotes,
    insertSeparator,
    parseNoteBody,
    safeNotePath,
    searchNotes,
    toggleBullet,
    type Note,
} from './notes';

const note = (over: Partial<Note>): Note => ({
    id: 'n', body: '', quote: null, context_key: null, context_label: null, context_path: null,
    created_at: '2026-11-06T10:00:00Z', updated_at: '2026-11-06T10:00:00Z', ...over,
});

describe('parseNoteBody', () => {
    it('reads text, consecutive points as one list, and separators', () => {
        expect(parseNoteBody('Artículos\n• a + consonante\n- an + vocal\n———\nRepasar the')).toEqual([
            { kind: 'text', text: 'Artículos' },
            { kind: 'bullets', items: ['a + consonante', 'an + vocal'] },
            { kind: 'separator' },
            { kind: 'text', text: 'Repasar the' },
        ]);
    });

    it('keeps line breaks inside a paragraph and drops blank edges', () => {
        expect(parseNoteBody('\nuno\ndos\n\n')).toEqual([{ kind: 'text', text: 'uno\ndos' }]);
    });

    it('takes «---» as a separator too', () => {
        expect(parseNoteBody('---')).toEqual([{ kind: 'separator' }]);
    });
});

describe('editing marks', () => {
    it('toggles a point on the line under the cursor', () => {
        expect(toggleBullet('uno\ndos', 5)).toEqual({ value: 'uno\n• dos', cursor: 7 });
        expect(toggleBullet('uno\n• dos', 7)).toEqual({ value: 'uno\ndos', cursor: 5 });
        expect(toggleBullet('uno\n- dos\ntres', 7)).toEqual({ value: 'uno\ndos\ntres', cursor: 5 });
        expect(toggleBullet('• uno\n• dos', 9)).toEqual({ value: '• uno\ndos', cursor: 7 });
    });

    it('puts a separator on its own line', () => {
        expect(insertSeparator('uno', 3)).toEqual({ value: 'uno\n———\n', cursor: 8 });
        expect(insertSeparator('', 0)).toEqual({ value: '———\n', cursor: 4 });
    });

    it('continues a list on Enter and ends it on an empty point', () => {
        expect(continueBullet('• uno', 5)).toEqual({ value: '• uno\n• ', cursor: 8 });
        expect(continueBullet('• uno\n• ', 8)).toEqual({ value: '• uno\n', cursor: 6 });
        expect(continueBullet('texto', 5)).toBeNull();
        expect(continueBullet('- uno', 5)).toEqual({ value: '- uno\n- ', cursor: 8 });
        expect(continueBullet('- uno\n- ', 8)).toEqual({ value: '- uno\n', cursor: 6 });
    });
});

describe('searchNotes', () => {
    const notes = [
        note({ id: '1', body: 'Sustantivos contables', context_label: 'Unidad 2' }),
        note({ id: '2', body: 'Present perfect', quote: 'I have eaten' }),
    ];

    it('matches every word in the text, quote or place, ignoring accents and case', () => {
        expect(searchNotes(notes, 'unidad CONTABLES').map(n => n.id)).toEqual(['1']);
        expect(searchNotes(notes, 'eaten').map(n => n.id)).toEqual(['2']);
        expect(searchNotes(notes, 'sustántivos').map(n => n.id)).toEqual(['1']);
    });

    it('returns every note for an empty search', () => {
        expect(searchNotes(notes, '  ')).toHaveLength(2);
    });
});

describe('groupNotes', () => {
    it('groups by place, the most recent place and note first', () => {
        const groups = groupNotes([
            note({ id: 'a', context_key: 'unit:a1-u1', context_label: 'Unidad 1', context_path: '/path/a1-u1', updated_at: '2026-11-01T00:00:00Z' }),
            note({ id: 'b', context_key: 'unit:a1-u2', context_label: 'Unidad 2', updated_at: '2026-11-03T00:00:00Z' }),
            note({ id: 'c', context_key: 'unit:a1-u1', context_label: 'Unidad 1', updated_at: '2026-11-02T00:00:00Z' }),
            note({ id: 'd', updated_at: '2026-10-01T00:00:00Z' }),
        ]);
        expect(groups.map(g => [g.key, g.notes.map(n => n.id)])).toEqual([
            ['unit:a1-u2', ['b']],
            ['unit:a1-u1', ['c', 'a']],
            ['general', ['d']],
        ]);
    });
});

describe('safeNotePath', () => {
    it('follows only routes inside the app', () => {
        expect(safeNotePath('/path/a1-u2')).toBe('/path/a1-u2');
        expect(safeNotePath('//evil.example')).toBeNull();
        expect(safeNotePath('javascript:alert(1)')).toBeNull();
        expect(safeNotePath('https://evil.example')).toBeNull();
        expect(safeNotePath(null)).toBeNull();
    });
});
