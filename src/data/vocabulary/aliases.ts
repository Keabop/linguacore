// Small on purpose: the card hooks import it, and they must not pull the decks in.

/**
 * Cards that used to be saved in an inflected form, by their old id. Saved cards with the old
 * id still find their word, so nothing in the database has to change.
 */
export const vocabularyAliases: Record<string, string> = {
    teeth: 'tooth',
    decided: 'decide',
    vegetables: 'vegetable',
    // Phase 8: the B1–B2 cards before their decks were rebuilt
    'figure-out': 'figure out',
    'keep-up': 'keep up',
    'mix-up': 'mix up',
    'point-out': 'point out',
    'pick-up': 'pick up',
    'put-up': 'put up',
    'look-into': 'look into',
    'come-across': 'come across',
    'grow-up': 'grow up',
    // Cards above B2 (not in CEFR-J), sent to the nearest card the decks still have
    sustainable: 'environmentally',
    rising: 'increase',
    alarming: 'shocking',
    elaborate: 'explain',
    profound: 'deep',
    speculate: 'guess',
    spontaneous: 'unexpected',
    undermine: 'damage',
};

/** The ids a card can be saved under: its own and any old one (to find what a learner saved). */
export const savedIdsOf = (id: string) => [id, ...Object.keys(vocabularyAliases).filter(old => vocabularyAliases[old] === id)];
