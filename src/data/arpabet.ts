// ARPAbet (CMU Pronouncing Dictionary) to IPA in the Cambridge Dictionary's American style:
// General American (the accent of the app's audio) with length marks, so learners can tell
// ship /ʃɪp/ from sheep /ʃiːp/. Gives vocabulary cards their transcription from
// content/reference/pronunciations.json.

const VOWELS: Record<string, string> = {
    AA: 'ɑː', AE: 'æ', AH: 'ʌ', AO: 'ɔː', AW: 'aʊ', AY: 'aɪ', EH: 'e', ER: 'ɝː',
    EY: 'eɪ', IH: 'ɪ', IY: 'iː', OW: 'oʊ', OY: 'ɔɪ', UH: 'ʊ', UW: 'uː',
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
    'P Y', 'B Y', 'F Y', 'G Y', 'M Y', 'V Y', 'S K R', 'S K W', 'S P L', 'S P R', 'S T R', 'S K Y',
]);

// stress -1 for consonants; secondary stresses the dictionary style leaves unmarked become -2
interface Phone { symbol: string; stress: number }

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
    // Unstressed i and u are short ("happy" /ˈhæpi/, "influence" /ˈɪnfluəns/), also where a
    // secondary stress goes unmarked ("probably" /ˈprɑːbəbli/)
    if (p.symbol === 'IY' && p.stress <= 0) return 'i';
    if (p.symbol === 'UW' && p.stress <= 0) return 'u';
    return VOWELS[p.symbol];
}

/**
 * Brings CMUdict's transcription to the Cambridge Dictionary's style:
 * - an unstressed r-coloured vowel before another vowel is /ə/ plus an /r/ that starts the next
 *   syllable ("arrive" /əˈraɪv/, "different" /ˈdɪfərənt/, not /ɚˈaɪv/);
 * - secondary stress is marked only before the main stress and with a syllable between them
 *   ("understand" /ˌʌndɚˈstænd/, but "important" /ɪmˈpɔːrtənt/, "perfect" /ˈpɝːfɪkt/).
 */
function normalize(phones: Phone[]): Phone[] {
    const out: Phone[] = [];
    phones.forEach((p, i) => {
        if (p.symbol === 'ER' && p.stress === 0 && phones[i + 1] && isVowel(phones[i + 1])) {
            out.push({ symbol: 'AH', stress: 0 }, { symbol: 'R', stress: -1 });
        } else out.push({ ...p });
    });
    const vowels = out.filter(isVowel);
    const primary = vowels.findIndex(v => v.stress === 1);
    vowels.forEach((v, k) => {
        if (v.stress === 2 && (k > primary || k === primary - 1)) v.stress = -2;
    });
    return out;
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
    const phones = normalize(parse(arpabet));
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
