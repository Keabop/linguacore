// The A2 deck with its IPA, loaded on its own (see ../load.ts)
import type { Vocabulary } from '../../../lib/db';
import { a2Vocabulary } from '../a2';
import { a2Phonetics } from '../phonetics/a2';

const deck: Vocabulary[] = a2Vocabulary.map(v => ({ ...v, phonetic: a2Phonetics[v.id] }));

export default deck;
