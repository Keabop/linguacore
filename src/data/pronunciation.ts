// The IPA of each vocabulary card, from CMUdict (content/reference/pronunciations.json) through
// arpabet.ts. Only the build script and the tests read the dictionary; the app gets the result
// in src/data/vocabulary/phonetics.ts (`npm run content:phonetics`).
import { arpabetToIpa } from './arpabet';

export type Pronunciations = Record<string, string[]>;

/**
 * Words whose CMUdict variants are different words (homographs) or whose first variant is a
 * weak or less usual form: the variant that matches the card's meaning, as in the dictionary.
 */
export const PRONUNCIATION_VARIANT: Record<string, string> = {
    read: 'R IY1 D', // leer, not the past /red/
    live: 'L IH1 V', // vivir, not the adjective /laɪv/
    close: 'K L OW1 Z', // cerrar, not cercano /kloʊs/
    use: 'Y UW1 Z', // usar
    wind: 'W IH1 N D', // viento
    minute: 'M IH1 N AH0 T', // minuto
    present: 'P R EH1 Z AH0 N T', // regalo
    desert: 'D EH1 Z ER0 T', // desierto
    research: 'R IY1 S ER0 CH', // investigación (the noun)
    graduate: 'G R AE1 JH UW0 EY2 T', // graduarse (the verb)
    perfect: 'P ER1 F IH2 K T', // the adjective
    ear: 'IH1 R',
    essay: 'EH1 S EY2',
    often: 'AO1 F AH0 N',
    usually: 'Y UW1 ZH AH0 L IY0',
    sometimes: 'S AH1 M T AY2 M Z',
    // The days end alike, in /deɪ/
    monday: 'M AH1 N D EY2',
    tuesday: 'T UW1 Z D EY2',
    wednesday: 'W EH1 N Z D EY2',
    thursday: 'TH ER1 Z D EY2',
    friday: 'F R AY1 D EY2',
    sunday: 'S AH1 N D EY2',
}

/** Words CMUdict lacks, transcribed by hand in the same style (American, with length marks). */
export const MANUAL_IPA: Record<string, string> = {
    'dining room': '/ˈdaɪnɪŋ ruːm/',
    saturday: '/ˈsætɚdeɪ/', // CMUdict has no /deɪ/ reading of it
    genuine: '/ˈdʒenjuɪn/',
    stomachache: '/ˈstʌməkeɪk/',
    toothache: '/ˈtuːθeɪk/',
    // B1–B2 cards outside CEFR-J (phase 8 of the plan revises them)
    rising: '/ˈraɪzɪŋ/',
    alarming: '/əˈlɑːrmɪŋ/',
    sustainable: '/səˈsteɪnəbəl/',
    elaborate: '/ɪˈlæbəreɪt/', // the verb, as on its card
    profound: '/prəˈfaʊnd/',
    speculate: '/ˈspekjəleɪt/',
    spontaneous: '/spɑːnˈteɪniəs/',
    undermine: '/ˌʌndɚˈmaɪn/',
};

const strip = (ipa: string) => ipa.replace(/^\/|\/$/g, '');

/**
 * IPA of a card's id: the chosen variant of a homograph, otherwise CMUdict's first one. Phrases
 * ("bus stop", "look for") join the IPA of their words. Null when a word is missing from both
 * dictionaries.
 */
export function ipaOf(id: string, pronunciations: Pronunciations): string | null {
    const word = id.toLowerCase(); // names of days and months are capitalised ("Monday")
    if (MANUAL_IPA[word]) return MANUAL_IPA[word];
    const whole = pronunciations[word];
    if (whole) return arpabetToIpa(PRONUNCIATION_VARIANT[word] ?? whole[0]);
    const words = word.split(/[\s-]+/);
    if (words.length < 2) return null;
    const parts = words.map(w => ipaOf(w, pronunciations));
    return parts.every(Boolean) ? `/${parts.map(p => strip(p!)).join(' ')}/` : null;
}
