import type { Vocabulary } from '../../lib/db';

/** A card as written in the data files; its IPA is added from phonetics.ts. */
export type VocabularyEntry = Omit<Vocabulary, 'phonetic'>;

type Level = Vocabulary['cefrLevel'];

/**
 * Card writer for one unit: `word('name', ['nombre'], 'My name is Ana.', 'What's your name?')`.
 * The level is the deck's, which the tests check against CEFR-J.
 */
export const unitWords = (cefrLevel: Level, unitId: string) =>
    (id: string, translations: string[], ...examples: string[]): VocabularyEntry => ({ id, translations, cefrLevel, examples, unitId });
