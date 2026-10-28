// Small on purpose: the card hooks import it, and they must not pull the decks in.

/**
 * Cards that used to be saved in an inflected form, by their old id. Saved cards with the old
 * id still find their word, so nothing in the database has to change.
 */
export const vocabularyAliases: Record<string, string> = {
    teeth: 'tooth',
    decided: 'decide',
    vegetables: 'vegetable',
};

/** The ids a card can be saved under: its own and any old one (to find what a learner saved). */
export const savedIdsOf = (id: string) => [id, ...Object.keys(vocabularyAliases).filter(old => vocabularyAliases[old] === id)];
