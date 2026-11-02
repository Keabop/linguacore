// The A1 deck with its IPA, loaded on its own (see ../load.ts)
import type { Vocabulary } from '../../../lib/db';
import { a1Vocabulary } from '../a1';
import { a1Phonetics } from '../phonetics/a1';

const deck: Vocabulary[] = a1Vocabulary.map(v => ({ ...v, phonetic: a1Phonetics[v.id] }));

export default deck;
