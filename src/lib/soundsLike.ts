/**
 * How an English word sounds, written with Spanish letters: «hello» /həˈloʊ/ → «jelóu». It is
 * only an approximation, for whoever starts from zero and can't read IPA yet; the stressed
 * vowel carries an accent, as in Spanish. Built from the IPA the decks already have (CMUdict).
 */

// Longest first, so «tʃ» wins over «t» and «oʊ» over «o»
const SOUNDS: [string, string][] = [
    ['tʃ', 'ch'], ['dʒ', 'y'],
    ['eɪ', 'ei'], ['aɪ', 'ai'], ['oʊ', 'ou'], ['aʊ', 'au'], ['ɔɪ', 'oi'],
    ['iː', 'ii'], ['uː', 'uu'], ['ɑː', 'aa'], ['ɔː', 'oo'], ['ɝː', 'er'],
    ['ɝ', 'er'], ['ɚ', 'er'],
    ['æ', 'a'], ['ʌ', 'a'], ['ə', 'e'], ['ɪ', 'i'], ['ʊ', 'u'], ['ɑ', 'a'], ['ɔ', 'o'],
    ['a', 'a'], ['e', 'e'], ['i', 'i'], ['o', 'o'], ['u', 'u'],
    ['θ', 'th'], ['ð', 'd'], ['ʃ', 'sh'], ['ʒ', 'sh'], ['ŋk', 'nk'], ['ŋ', 'ng'],
    ['j', 'y'], ['h', 'j'], ['z', 's'], ['ɡ', 'g'], ['g', 'g'],
    ['b', 'b'], ['d', 'd'], ['f', 'f'], ['k', 'k'], ['l', 'l'], ['m', 'm'], ['n', 'n'],
    ['p', 'p'], ['r', 'r'], ['s', 's'], ['t', 't'], ['v', 'v'], ['w', 'w'],
];

const ACCENTED: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };

function word(ipa: string): string {
    let out = '';
    let stressNext = false;
    for (let i = 0; i < ipa.length;) {
        const ch = ipa[i];
        if (ch === 'ˈ') { stressNext = true; i++; continue; }
        if (ch === 'ˌ' || ch === '.') { i++; continue; }
        const match = SOUNDS.find(([sound]) => ipa.startsWith(sound, i));
        if (!match) { i++; continue; }
        let spelled = match[1];
        // The accent goes on the first vowel of the stressed syllable
        if (stressNext && ACCENTED[spelled[0]]) {
            spelled = ACCENTED[spelled[0]] + spelled.slice(1);
            stressNext = false;
        }
        out += spelled;
        i += match[0].length;
    }
    // In Spanish «ge» and «gi» sound like «je»: the English hard g is «gue», «gui»
    return out.replace(/g([eiéí])/g, 'gu$1');
}

/** «/həˈloʊ/» → «jelóu»; «/ɡʊd naɪt/» → «gud nait». Empty if there is no IPA. */
export function soundsLike(ipa: string | undefined): string {
    if (!ipa) return '';
    return ipa.replace(/\//g, '').trim().split(/\s+/).map(word).join(' ');
}
