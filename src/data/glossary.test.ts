import { beforeAll, describe, expect, it } from 'vitest';
import { GLOSSARY, getGlossaryEntry } from './glossary';
import { loadLevel } from './levels';
import type { ContentLevel, LevelContent } from './levels';

describe('glossary', () => {
    it('has one entry per id and each form belongs to one term', () => {
        const ids = GLOSSARY.map(e => e.id);
        expect(new Set(ids).size).toBe(ids.length);
        const forms = GLOSSARY.flatMap(e => e.forms);
        expect(new Set(forms).size).toBe(forms.length);
        for (const form of forms) expect(form).toBe(form.toLowerCase().trim());
    });

    it('gives every term a definition and an example', () => {
        for (const entry of GLOSSARY) {
            expect(entry.forms.length, entry.id).toBeGreaterThan(0);
            expect(entry.definition.trim(), entry.id).not.toBe('');
            expect(entry.example.trim(), entry.id).not.toBe('');
        }
    });

    describe('in the grammar cards', () => {
        const levels: LevelContent[] = [];
        beforeAll(async () => {
            for (const level of ['A1', 'A2', 'B1', 'B2'] as ContentLevel[]) levels.push(await loadLevel(level));
        });

        it('every term marked by hand exists', () => {
            for (const level of levels) {
                for (const card of level.grammarCards) {
                    for (const [, id] of card.explanation.matchAll(/data-term="([^"]*)"/g)) {
                        expect(getGlossaryEntry(id), `${card.unitId}: ${id}`).toBeDefined();
                    }
                }
            }
        });
    });
});
