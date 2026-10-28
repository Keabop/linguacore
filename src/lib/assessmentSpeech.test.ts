import { describe, expect, it } from 'vitest';
import { pickSpeakerVoices, splitSentences } from './assessmentSpeech';
import type { DialogueLine } from './exam/types';

const voice = (name: string, lang: string) => ({ name, lang, localService: true, default: false, voiceURI: name }) as SpeechSynthesisVoice;

const lines: DialogueLine[] = [
    { speaker: 'A', accent: 'US', gender: 'female', text: 'Hi.' },
    { speaker: 'B', accent: 'UK', gender: 'male', text: 'Hello.' },
    { speaker: 'A', accent: 'US', gender: 'female', text: 'Ready?' },
];

describe('pickSpeakerVoices', () => {
    it('matches accent and gender for each speaker', () => {
        const picked = pickSpeakerVoices(lines, [voice('Microsoft David', 'en-US'), voice('Microsoft Zira', 'en-US'), voice('Google UK English Male', 'en-GB')]);
        expect(picked.A.voice?.name).toBe('Microsoft Zira');
        expect(picked.B.voice?.name).toBe('Google UK English Male');
    });

    it('gives the two speakers different voices when there are two', () => {
        const picked = pickSpeakerVoices(lines, [voice('Voice One', 'en-US'), voice('Voice Two', 'en-US')]);
        expect(picked.A.voice?.name).not.toBe(picked.B.voice?.name);
        expect(picked.A.pitch).toBe(1);
    });

    it('changes the pitch when only one English voice exists', () => {
        const picked = pickSpeakerVoices(lines, [voice('Only', 'en-US'), voice('Español', 'es-ES')]);
        expect(picked.A.voice?.name).toBe('Only');
        expect(picked.B.voice?.name).toBe('Only');
        expect(picked.B.pitch).not.toBe(1);
    });

    it('ignores voices that are not English', () => {
        expect(pickSpeakerVoices(lines, [voice('Español', 'es-ES')]).A.voice).toBeUndefined();
    });
});

describe('splitSentences', () => {
    it('splits a long line into its sentences', () => {
        expect(splitSentences('Hello there. Is it ready? Yes! And the rest')).toEqual(['Hello there.', 'Is it ready?', 'Yes!', 'And the rest']);
    });
});
