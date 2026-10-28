import { describe, expect, it } from 'vitest';
import { arpabetToIpa } from './arpabet';
import pronunciations from '../../content/reference/pronunciations.json';

const variants = pronunciations as Record<string, string[]>;
const ipa = (word: string, variant = 0) => arpabetToIpa(variants[word][variant]);

describe('arpabetToIpa', () => {
    it.each([
        ['cat', '/kæt/'],
        ['sheep', '/ʃiːp/'],
        ['about', '/əˈbaʊt/'],
        ['water', '/ˈwɔːtɚ/'],
        ['student', '/ˈstuːdənt/'],
        ['teacher', '/ˈtiːtʃɚ/'],
        ['understand', '/ˌʌndɚˈstænd/'],
        ['computer', '/kəmˈpjuːtɚ/'],
        ['family', '/ˈfæməli/'],
        ['breakfast', '/ˈbrekfəst/'],
        ['bird', '/bɝːd/'],
        ['ambiguity', '/ˌæmbɪˈɡjuːəti/'],
        ['happy', '/ˈhæpi/'],
        // An unstressed r-vowel before a vowel: /ər/, with the r starting the next syllable
        ['arrive', '/əˈraɪv/'],
        ['different', '/ˈdɪfərənt/'],
        ['restaurant', '/ˈrestərɑːnt/'],
        // Secondary stress only before the main one, with a syllable between them
        ['important', '/ɪmˈpɔːrtənt/'],
        ['probably', '/ˈprɑːbəbli/'],
        ['tomorrow', '/təˈmɑːroʊ/'],
    ])('%s → %s', (word, expected) => {
        expect(ipa(word)).toBe(expected);
    });

    it('rejects tokens that are not ARPAbet', () => {
        expect(() => arpabetToIpa('XX1')).toThrow();
        expect(() => arpabetToIpa('k@t')).toThrow();
    });

    it('converts every pronunciation in the reference data', () => {
        for (const [word, list] of Object.entries(variants)) {
            for (const arpabet of list) expect(arpabetToIpa(arpabet), word).toMatch(/^\/[^A-Z0-9]+\/$/);
        }
    });

    it('keeps both readings of homographs', () => {
        expect([ipa('read', 0), ipa('read', 1)].sort()).toEqual(['/red/', '/riːd/']);
    });
});
