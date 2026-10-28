// Vocabulary cards and their lookups. Kept apart from src/data/index.ts so screens that only
// need units, grammar or exercises don't download the decks.
import type { Vocabulary } from '../../lib/db';
import { a1Vocabulary } from './a1';
import { a2Vocabulary } from './a2';
import { upperVocabulary } from './upper';
import { phonetics } from './phonetics';
import { vocabularyAliases } from './aliases';

export { savedIdsOf, vocabularyAliases } from './aliases';

export const allVocabulary: Vocabulary[] = [...a1Vocabulary, ...a2Vocabulary, ...upperVocabulary]
    .map(v => ({ ...v, phonetic: phonetics[v.id] }));

const vocabById = new Map(allVocabulary.map(v => [v.id, v]));

/** A card by its id, or by the old id it had when it was saved in an inflected form. */
export const getVocab = (id: string) => vocabById.get(vocabularyAliases[id] ?? id);

/** Cards keyed by the ids asked for (an old id maps to its current card). */
export const getVocabMap = (ids: string[]) => {
    const map = new Map<string, Vocabulary>();
    for (const id of ids) {
        const v = getVocab(id);
        if (v) map.set(id, v);
    }
    return map;
};

