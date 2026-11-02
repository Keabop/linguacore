// The B2 deck with its IPA, loaded on its own (see ../load.ts)
import type { Vocabulary } from '../../../lib/db';
import { b2Vocabulary } from '../b2';
import { b2Phonetics } from '../phonetics/b2';

const deck: Vocabulary[] = b2Vocabulary.map(v => ({ ...v, phonetic: b2Phonetics[v.id] }));

export default deck;
