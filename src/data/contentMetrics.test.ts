import { describe, expect, it } from 'vitest';
import reference from '../../content/reference/cefrj-vocabulary.json';
import {
    buildLevelIndex, lemmaCandidates, levelMismatches, levelOf, storyCoverage, storyEncounters, tokenize,
    type ReferenceEntry,
} from './contentMetrics';

const index = buildLevelIndex(reference as ReferenceEntry[]);

describe('tokenize', () => {
    it('drops markup and splits contractions', () => {
        expect(tokenize('<p>I <span data-word="like">don\'t</span> know. She\'s here; it\'s Tom\'s.</p>'))
            .toEqual(['i', 'do', 'not', 'know', 'she', 'here', 'it', 'tom']);
        expect(tokenize("I can't and won't")).toEqual(['i', 'can', 'not', 'and', 'will', 'not']);
    });
});

describe('lemmaCandidates', () => {
    it.each([
        ['studies', 'study'], ['went', 'go'], ['stopped', 'stop'], ['making', 'make'],
        ['children', 'child'], ['bigger', 'big'], ['happily', 'happy'], ['watched', 'watch'],
    ])('%s can come from %s', (form, base) => {
        expect(lemmaCandidates(form)).toContain(base);
    });
});

describe('reference levels', () => {
    it('finds the level through inflections', () => {
        expect(levelOf('went', index)).toBe('A1');
        expect(levelOf('houses', index)).toBe('A1');
    });

    it('reports words above the reader level', () => {
        const report = storyCoverage('The house is big. The economy is complex.', 'A1', index);
        expect(report.aboveLevel).toEqual(expect.arrayContaining(['economy']));
        expect(report.coverage).toBeLessThan(1);
    });

    it('counts words the learner already knows as covered', () => {
        const report = storyCoverage('The economy is big.', 'A1', index, new Set(['economy']));
        expect(report.coverage).toBe(1);
    });

    it('counts story encounters per word in any form', () => {
        const counts = storyEncounters([{ content: 'She studies.' }, { content: 'I study.' }, { content: 'No.' }], ['study']);
        expect(counts.get('study')).toBe(2);
    });

    it('flags levels that disagree with the list', () => {
        expect(levelMismatches([{ id: 'house', cefrLevel: 'B2' }], index)).toEqual([{ id: 'house', ours: 'B2', reference: 'A1' }]);
    });
});
