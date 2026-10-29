import { describe, expect, it } from 'vitest';
import { PREFERRED_VOICES, SPEECH_RATE, englishVoices, pickVoice, rankVoice } from './voices';

const voice = (name: string, lang: string, localService = true) => ({ name, lang, localService, default: false, voiceURI: name }) as SpeechSynthesisVoice;

describe('pickVoice', () => {
    it('prefers the first voice of the preferred list over any other of the accent', () => {
        const best = PREFERRED_VOICES.US[0];
        const picked = pickVoice([voice('Some US Voice', 'en-US'), voice(`Microsoft ${best} Online (Natural)`, 'en-US', false)], 'US');
        expect(picked?.name).toContain(best);
    });

    it('falls back to another English accent when the one asked for is missing', () => {
        expect(pickVoice([voice('Google UK English Female', 'en-GB'), voice('Español', 'es-ES')], 'US')?.lang).toBe('en-GB');
    });

    it('returns null when there is no English voice', () => {
        expect(pickVoice([voice('Español', 'es-ES'), voice('Français', 'fr-FR')], 'UK')).toBeNull();
    });

    it('takes the gender asked for into account', () => {
        const voices = [voice('Microsoft David', 'en-US'), voice('Microsoft Zira', 'en-US')];
        expect(pickVoice(voices, 'US', 'female')?.name).toBe('Microsoft Zira');
        expect(pickVoice(voices, 'US', 'male')?.name).toBe('Microsoft David');
    });
});

describe('rankVoice', () => {
    it('ranks non-English voices below zero', () => {
        expect(rankVoice(voice('Español', 'es-ES'), 'US')).toBeLessThan(0);
    });

    it('reads language codes written with an underscore (Android)', () => {
        expect(rankVoice(voice('English', 'en_GB'), 'UK')).toBeGreaterThan(rankVoice(voice('English', 'en_US'), 'UK'));
    });
});

describe('englishVoices', () => {
    it('keeps only English voices', () => {
        expect(englishVoices([voice('A', 'en-AU'), voice('B', 'es-MX')]).map(v => v.name)).toEqual(['A']);
    });
});

describe('SPEECH_RATE', () => {
    it('is slower for beginners and never above normal speed', () => {
        expect(SPEECH_RATE.A1).toBeLessThan(SPEECH_RATE.A2);
        expect(SPEECH_RATE.A2).toBeLessThan(SPEECH_RATE.B1);
        expect(Math.max(...Object.values(SPEECH_RATE))).toBe(1);
    });
});
