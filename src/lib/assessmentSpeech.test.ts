import { afterEach, describe, expect, it, vi } from 'vitest';
import { pickSpeakerVoices, playDialogueSpeech, sentenceTimeoutMs, splitSentences } from './assessmentSpeech';
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

describe('playDialogueSpeech', () => {
    const speakers: DialogueLine[] = [{ speaker: 'A', accent: 'US', gender: 'female', text: 'One sentence only' }];

    /** A fake speech engine: `behave` decides what each utterance does once it is spoken. */
    function fakeSynthesis(behave: (u: { onstart?: () => void; onend?: () => void; onerror?: () => void }) => void) {
        vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; constructor(t: string) { this.text = t; } });
        vi.stubGlobal('speechSynthesis', { getVoices: () => [voice('Voice', 'en-US')], speak: behave, cancel: vi.fn() });
    }

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('reports a failure when the browser has no speech synthesis', () => {
        vi.stubGlobal('speechSynthesis', undefined);
        const done = vi.fn(), failed = vi.fn();
        playDialogueSpeech(speakers, () => {}, done, failed);
        expect(failed).toHaveBeenCalledOnce();
        expect(done).not.toHaveBeenCalled();
    });

    it('finishes a sentence that never signals its end, after the time limit', () => {
        vi.useFakeTimers();
        fakeSynthesis(u => u.onstart?.());
        const done = vi.fn();
        playDialogueSpeech(speakers, () => {}, done, vi.fn());
        vi.advanceTimersByTime(sentenceTimeoutMs('One sentence only') + 10);
        expect(done).toHaveBeenCalledOnce();
    });

    it('reports a failure when no sentence could be spoken', () => {
        vi.useFakeTimers();
        fakeSynthesis(u => u.onerror?.());
        const done = vi.fn(), failed = vi.fn();
        playDialogueSpeech(speakers, () => {}, done, failed);
        vi.runAllTimers();
        expect(failed).toHaveBeenCalledOnce();
        expect(done).not.toHaveBeenCalled();
    });
});
