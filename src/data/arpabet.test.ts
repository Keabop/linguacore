import { describe, expect, it } from 'vitest';
import { arpabetToIpa } from './arpabet';
import pronunciations from '../../content/reference/pronunciations.json';

const ipa = (word: string) => arpabetToIpa((pronunciations as Record<string, string>)[word]);

describe('arpabetToIpa', () => {
    it.each([
        ['cat', '/kæt/'],
        ['about', '/əˈbaʊt/'],
        ['water', '/ˈwɔtɚ/'],
        ['student', '/ˈstudənt/'],
        ['teacher', '/ˈtitʃɚ/'],
        ['understand', '/ˌʌndɚˈstænd/'],
        ['computer', '/kəmˈpjutɚ/'],
        ['family', '/ˈfæməli/'],
        ['breakfast', '/ˈbrekfəst/'],
    ])('%s → %s', (word, expected) => {
        expect(ipa(word)).toBe(expected);
    });

    it('rejects tokens that are not ARPAbet', () => {
        expect(() => arpabetToIpa('XX1')).toThrow();
        expect(() => arpabetToIpa('k@t')).toThrow();
    });

    it('converts every pronunciation in the reference data', () => {
        for (const [word, arpabet] of Object.entries(pronunciations as Record<string, string>)) {
            expect(arpabetToIpa(arpabet), word).toMatch(/^\/[^A-Z0-9]+\/$/);
        }
    });
});
