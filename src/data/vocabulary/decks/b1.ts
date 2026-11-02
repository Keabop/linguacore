// The B1 deck with its IPA, loaded on its own (see ../load.ts)
import type { Vocabulary } from '../../../lib/db';
import { b1Vocabulary } from '../b1';
import { b1Phonetics } from '../phonetics/b1';

const deck: Vocabulary[] = b1Vocabulary.map(v => ({ ...v, phonetic: b1Phonetics[v.id] }));

export default deck;
