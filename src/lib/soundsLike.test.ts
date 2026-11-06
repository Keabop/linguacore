import { describe, expect, it } from 'vitest';
import { soundsLike } from './soundsLike';

describe('soundsLike', () => {
    it('writes the IPA with Spanish letters and marks the stress', () => {
        expect(soundsLike('/həˈloʊ/')).toBe('jelóu');
        expect(soundsLike('/pliːz/')).toBe('pliis');
        expect(soundsLike('/neɪm/')).toBe('neim');
        expect(soundsLike('/ɡʊd ˈmɔːrnɪŋ/')).toBe('gud móorning');
        expect(soundsLike('/θæŋks/')).toBe('thanks');
        expect(soundsLike('/eɪdʒ/')).toBe('eiy');
        expect(soundsLike('/ˈtʃɪkən/')).toBe('chíken');
    });

    it('keeps the hard g before e and i', () => {
        expect(soundsLike('/ɡɪv/')).toBe('guiv');
        expect(soundsLike('/ɡet/')).toBe('guet');
    });

    it('is empty without IPA', () => {
        expect(soundsLike(undefined)).toBe('');
    });
});
