import type { DialogueLine } from './exam/types';
import { listeningRate, rankVoice } from './voices';
import { audioFor, dialogueKey } from './audioKey';

// Listening audio of the simulators. A question with `audioSrc` plays its pre-generated file;
// otherwise the dialogue is read with the browser's voices, one distinct voice per speaker.

export interface SpeakerVoice {
    voice?: SpeechSynthesisVoice;
    /** Changes the pitch when both speakers had to share one voice. */
    pitch: number;
}

/**
 * One voice per speaker, matching accent and gender as well as the device allows, and never
 * the same voice for both speakers when there is a second English voice.
 */
export function pickSpeakerVoices(lines: DialogueLine[], voices: SpeechSynthesisVoice[]): Record<string, SpeakerVoice> {
    const out: Record<string, SpeakerVoice> = {};
    const taken = new Set<SpeechSynthesisVoice>();
    const speakers = [...new Map(lines.map(l => [l.speaker, l])).values()];
    for (const line of speakers) {
        const ranked = voices
            .map(v => ({ v, s: rankVoice(v, line.accent, line.gender) }))
            .filter(x => x.s >= 0)
            .sort((a, b) => b.s - a.s);
        const free = ranked.find(x => !taken.has(x.v));
        const pick = free ?? ranked[0];
        if (pick) taken.add(pick.v);
        out[line.speaker] = { voice: pick?.v, pitch: !free && pick ? (line.gender === 'female' ? 1.2 : 0.8) : 1 };
    }
    return out;
}

/**
 * Splits a line into sentences. Some browser voices stop after about 15 seconds without
 * signalling the end, so long monologue lines are spoken one sentence at a time.
 */
export function splitSentences(text: string): string[] {
    return (text.match(/[^.!?]+(?:[.!?]+["')]*|$)/g) ?? [text]).map(t => t.trim()).filter(Boolean);
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudio: HTMLAudioElement | null = null;

export function stopDialogueSpeech() {
    window.speechSynthesis?.cancel();
    activeUtterance = null;
    if (activeAudio) {
        activeAudio.pause();
        activeAudio = null;
    }
}

/**
 * Longest a sentence may take before it counts as spoken: some voices stop without signalling
 * the end, and the exam must never wait for them forever.
 */
export const sentenceTimeoutMs = (text: string) => 4000 + text.split(/\s+/).length * 600;

/**
 * Plays a pre-generated audio file of a listening question. `onFail` runs instead of
 * `onComplete` when the file can't be played at all.
 */
export function playAudioFile(src: string, onComplete: () => void, onFail: () => void = onComplete) {
    stopDialogueSpeech();
    const audio = new Audio(src);
    activeAudio = audio;
    let started = false;
    const finish = (ok: boolean) => {
        if (activeAudio !== audio) return;
        activeAudio = null;
        if (ok) onComplete();
        else onFail();
    };
    audio.addEventListener('playing', () => { started = true; });
    audio.addEventListener('ended', () => finish(true));
    audio.addEventListener('error', () => finish(started));
    audio.play().catch(() => finish(false));
}

/**
 * Speaks a dialogue sentence by sentence with the browser's voices. `onFail` runs instead of
 * `onComplete` when nothing could be spoken (no speech synthesis, or every sentence failed);
 * a sentence that never signals its end is skipped after `sentenceTimeoutMs`.
 */
export function playDialogueSpeech(
    lines: DialogueLine[],
    onLineStart: (index: number) => void,
    onComplete: () => void,
    onFail: () => void = onComplete,
    rate = 0.95,
) {
    if (!window.speechSynthesis) {
        onFail();
        return;
    }

    stopDialogueSpeech();

    // Each sentence is spoken on its own; onLineStart still reports the line it belongs to
    const chunks = lines.flatMap((l, lineIndex) => splitSentences(l.text).map(text => ({ ...l, text, lineIndex })));
    let heard = false;

    const start = () => {
        const voices = pickSpeakerVoices(lines, window.speechSynthesis.getVoices());
        const speakLine = (index: number) => {
            if (index >= chunks.length) {
                if (heard) onComplete();
                else onFail();
                return;
            }
            const line = chunks[index];
            if (index === 0 || chunks[index - 1].lineIndex !== line.lineIndex) onLineStart(line.lineIndex);

            const utterance = new SpeechSynthesisUtterance(line.text);
            activeUtterance = utterance;
            const { voice, pitch } = voices[line.speaker] ?? { pitch: 1 };
            if (voice) utterance.voice = voice;
            utterance.lang = line.accent === 'US' ? 'en-US' : 'en-GB';
            utterance.pitch = pitch;
            utterance.rate = rate;

            // Moves on once, whichever comes first: the end, an error or the time limit
            let settled = false;
            const next = (pause: number) => {
                if (settled || activeUtterance !== utterance) return;
                settled = true;
                clearTimeout(limit);
                setTimeout(() => { if (activeUtterance === utterance) speakLine(index + 1); }, pause);
            };
            const limit = setTimeout(() => {
                if (settled || activeUtterance !== utterance) return;
                next(0);
                window.speechSynthesis.cancel();
            }, sentenceTimeoutMs(line.text));

            utterance.onstart = () => { heard = true; };
            // A short pause between sentences, a longer one when the speaker changes turn
            utterance.onend = () => next(chunks[index + 1]?.lineIndex === line.lineIndex ? 150 : 600);
            utterance.onerror = () => next(0);
            window.speechSynthesis.speak(utterance);
        };
        speakLine(0);
    };

    // Chrome and Safari load their voices asynchronously
    if (window.speechSynthesis.getVoices().length > 0) {
        start();
        return;
    }
    let started = false;
    const once = () => { if (!started) { started = true; start(); } };
    window.speechSynthesis.addEventListener('voiceschanged', once, { once: true });
    setTimeout(once, 500);
}

/**
 * Plays a listening script: its recording (npm run content:audio) when there is one, else the
 * browser's voices, which also take over when the file can't be played (no network, an old
 * browser without Ogg Opus). Both go at the speed of the item's level.
 */
export function playListening(
    lines: DialogueLine[],
    level: string,
    onLineStart: (index: number) => void,
    onComplete: () => void,
    onFail: () => void = onComplete,
) {
    const rate = listeningRate(level);
    const speak = () => playDialogueSpeech(lines, onLineStart, onComplete, onFail, rate * 0.95);
    const entry = audioFor(dialogueKey(lines, rate));
    if (entry) playAudioFile(entry.src, onComplete, speak);
    else speak();
}
