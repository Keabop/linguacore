import { describe, expect, it } from 'vitest';
import reference from '../../content/reference/cefrj-vocabulary.json';
import {
    buildLevelIndex, checkVocabularyLevels, lemmaCandidates, lemmaOf, levelOf, storyCoverage, storyEncounters,
    tokenize, tokenizeWithNames, type ReferenceEntry,
} from './contentMetrics';

const index = buildLevelIndex(reference as ReferenceEntry[]);
const inIndex = (w: string) => index.has(w);

describe('tokenize', () => {
    it('drops markup and splits contractions', () => {
        expect(tokenize('<p>I <span data-word="like">don\'t</span> know. She\'s here; it\'s Tom\'s.</p>'))
            .toEqual(['i', 'do', 'not', 'know', 'she', 'here', 'it', 'tom']);
        expect(tokenize("I can't and won't")).toEqual(['i', 'can', 'not', 'and', 'will', 'not']);
    });

    it('keeps accented letters and decodes numeric entities', () => {
        expect(tokenize('A café, naïve. Don&#8217;t')).toEqual(['a', 'café', 'naïve', 'do', 'not']);
    });

    it('keeps word endings written after inline markup', () => {
        expect(tokenize('<p>I <span data-word="walk">walk</span>ed and <strong>play</strong>ing.</p>')).toEqual(['i', 'walked', 'and', 'playing']);
    });

    it('notes capitals and sentence starts', () => {
        const tokens = tokenizeWithNames('Yesterday Maria went to Paris. Then she slept.');
        expect(tokens.filter(t => t.capitalised).map(t => t.word)).toEqual(['yesterday', 'maria', 'paris', 'then']);
        expect(tokens.filter(t => t.sentenceStart).map(t => t.word)).toEqual(['yesterday', 'then']);
    });
});

describe('lemmas', () => {
    it.each([
        ['studies', 'study'], ['went', 'go'], ['stopped', 'stop'], ['making', 'make'], ['children', 'child'],
        ['bigger', 'big'], ['watched', 'watch'], ['fled', 'flee'], ['lying', 'lie'],
        ['thieves', 'thief'], ['houses', 'house'],
    ])('%s → %s', (form, base) => {
        expect(lemmaOf(form, inIndex)).toBe(base);
    });

    it.each([['career'], ['happily'], ['user'], ['shed'], ['wing'], ['digest'], ['upper'], ['outer']])(
        '%s stays itself because the list holds it', word => {
            expect(lemmaOf(word, inIndex)).toBe(word);
        },
    );

    it('lists the possible forms', () => {
        expect(lemmaCandidates('studies')).toEqual(expect.arrayContaining(['study']));
    });
});

describe('reference levels', () => {
    it('takes the level of the word as written, not of a shorter look-alike', () => {
        expect(levelOf('career', index)).toBe('B1');
        expect(levelOf('went', index)).toBe('A1');
        expect(levelOf('houses', index)).toBe('A1');
    });

    it('reports words above the reader level', () => {
        const report = storyCoverage('His career was in the inner city.', 'A1', index);
        expect(report.aboveLevel).toEqual(expect.arrayContaining(['career']));
        expect(report.coverage).toBeLessThan(1);
    });

    it('counts words outside the list as unreadable unless they are names', () => {
        const report = storyCoverage('The ubiquitous paradigm faced scrutiny. Ana left with Maria.', 'A1', index);
        expect(report.unknown).toEqual(expect.arrayContaining(['ubiquitous', 'paradigm', 'scrutiny']));
        expect(report.names).toEqual(['ana', 'maria']);
    });

    it('counts words the learner already knows as covered', () => {
        expect(storyCoverage('The economy is big.', 'A1', index, new Set(['economy'])).coverage).toBe(1);
    });
});

describe('story encounters', () => {
    it('counts each story once per word, in any form', () => {
        const counts = storyEncounters([{ content: 'She studies.' }, { content: 'I study.' }, { content: 'No.' }], ['study'], index);
        expect(counts.get('study')).toBe(2);
    });

    it('does not count look-alike words', () => {
        const counts = storyEncounters([{ content: 'Her career, a shower, the forest.' }], ['care', 'show', 'for'], index);
        expect([...counts.values()]).toEqual([0, 0, 0]);
    });

    it('finds multi-word expressions, inflected or split', () => {
        const counts = storyEncounters(
            [{ content: 'She figured out the answer.' }, { content: 'I will figure it out.' }, { content: 'Figure this.' }],
            ['figure-out'], index,
        );
        expect(counts.get('figure-out')).toBe(2);
    });
});

describe('vocabulary levels', () => {
    it('flags levels that disagree with the list', () => {
        expect(checkVocabularyLevels([{ id: 'house', cefrLevel: 'B2' }], index).mismatched)
            .toEqual([{ id: 'house', ours: 'B2', reference: 'A1' }]);
    });

    it('flags ids that are inflected forms and ids missing from the list', () => {
        const check = checkVocabularyLevels([{ id: 'teeth', cefrLevel: 'A1' }, { id: 'zzzz', cefrLevel: 'A1' }], index);
        expect(check.notLemma).toEqual([{ id: 'teeth', lemma: 'tooth' }]);
        expect(check.missing).toEqual(['zzzz']);
    });

    it('checks phrasal verbs by their verb', () => {
        expect(checkVocabularyLevels([{ id: 'grow-up', cefrLevel: 'A2' }], index)).toEqual({ mismatched: [], notLemma: [], missing: [] });
    });
});
