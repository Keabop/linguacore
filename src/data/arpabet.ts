// ARPAbet (CMU Pronouncing Dictionary) to IPA, General American. Used to give new vocabulary
// entries a phonetic transcription from content/reference/pronunciations.json.

const VOWELS: Record<string, string> = {
    AA: 'ɑ', AE: 'æ', AH: 'ʌ', AO: 'ɔ', AW: 'aʊ', AY: 'aɪ', EH: 'e', ER: 'ɝ',
    EY: 'eɪ', IH: 'ɪ', IY: 'i', OW: 'oʊ', OY: 'ɔɪ', UH: 'ʊ', UW: 'u',
};

const CONSONANTS: Record<string, string> = {
    B: 'b', CH: 'tʃ', D: 'd', DH: 'ð', F: 'f', G: 'ɡ', HH: 'h', JH: 'dʒ', K: 'k', L: 'l',
    M: 'm', N: 'n', NG: 'ŋ', P: 'p', R: 'r', S: 's', SH: 'ʃ', T: 't', TH: 'θ', V: 'v',
    W: 'w', Y: 'j', Z: 'z', ZH: 'ʒ',
};

// Consonant clusters that can start an English syllable; the stress mark goes before them
const ONSETS = new Set([
    'B L', 'B R', 'D R', 'D W', 'F L', 'F R', 'G L', 'G R', 'K L', 'K R', 'K W', 'P L', 'P R',
    'S K', 'S L', 'S M', 'S N', 'S P', 'S T', 'S W', 'SH R', 'T R', 'T W', 'TH R', 'HH Y', 'K Y',
    'P Y', 'B Y', 'F Y', 'M Y', 'V Y', 'S K R', 'S K W', 'S P L', 'S P R', 'S T R', 'S K Y',
]);

interface Phone { symbol: string; stress: number } // stress -1 for consonants

function parse(arpabet: string): Phone[] {
    return arpabet.trim().split(/\s+/).map(token => {
        const m = token.match(/^([A-Z]+)([012])?$/);
        if (!m || !(m[1] in VOWELS || m[1] in CONSONANTS)) throw new Error(`Unknown ARPAbet token: ${token}`);
        return { symbol: m[1], stress: m[2] === undefined ? -1 : Number(m[2]) };
    });
}

const isVowel = (p: Phone) => p.symbol in VOWELS;

function vowelIpa(p: Phone): string {
    if (p.symbol === 'AH' && p.stress === 0) return 'ə';
    if (p.symbol === 'ER' && p.stress === 0) return 'ɚ';
    return VOWELS[p.symbol];
}

/** How many of the trailing consonants start the next syllable (longest legal onset, at most 3). */
function onsetLength(consonants: string[]): number {
    for (let take = Math.min(3, consonants.length); take > 1; take--) {
        if (ONSETS.has(consonants.slice(-take).join(' '))) return take;
    }
    return Math.min(1, consonants.length);
}

/** Converts an ARPAbet transcription (e.g. "AH0 B AW1 T") to IPA between slashes ("/əˈbaʊt/"). */
export function arpabetToIpa(arpabet: string): string {
    const phones = parse(arpabet);
    // One-syllable words carry no stress mark ("cat" → /kæt/)
    const marksStress = phones.filter(isVowel).length > 1;
    const out: string[] = [];
    let consonants: string[] = [];

    for (const p of phones) {
        if (!isVowel(p)) {
            consonants.push(p.symbol);
            continue;
        }
        if (marksStress && p.stress > 0) {
            const onset = onsetLength(consonants);
            const coda = consonants.slice(0, consonants.length - onset);
            out.push(...coda.map(c => CONSONANTS[c]), p.stress === 1 ? 'ˈ' : 'ˌ', ...consonants.slice(coda.length).map(c => CONSONANTS[c]));
        } else {
            out.push(...consonants.map(c => CONSONANTS[c]));
        }
        out.push(vowelIpa(p));
        consonants = [];
    }
    out.push(...consonants.map(c => CONSONANTS[c]));
    return `/${out.join('')}/`;
}
