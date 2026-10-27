import type { DialogueLine } from './exam/types';

// Listening audio of the simulators. A question with `audioSrc` plays its pre-generated file;
// otherwise the dialogue is read with the browser's voices, one distinct voice per speaker.

export interface SpeakerVoice {
    voice?: SpeechSynthesisVoice;
    /** Changes the pitch when both speakers had to share one voice. */
    pitch: number;
}

const FEMALE = /female|woman|zira|samantha|hazel|susan|libby|sonia|aria|jenny|ava|allison|karen|moira|tessa|serena|victoria|fiona/i;
const MALE = /\bmale\b|\bman\b|david|george|mark|ryan|guy|daniel|alex|fred|oliver|thomas|james|arthur/i;

function score(voice: SpeechSynthesisVoice, line: DialogueLine): number {
    const lang = line.accent === 'US' ? 'en-US' : 'en-GB';
    let s = 0;
    if (voice.lang.replace('_', '-').startsWith(lang)) s += 4;
    else if (voice.lang.startsWith('en')) s += 1;
    else return -1;
    if ((line.gender === 'female' ? FEMALE : MALE).test(voice.name)) s += 3;
    if (voice.localService) s += 1;
    return s;
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
            .map(v => ({ v, s: score(v, line) }))
            .filter(x => x.s >= 0)
            .sort((a, b) => b.s - a.s);
        const free = ranked.find(x => !taken.has(x.v));
        const pick = free ?? ranked[0];
        if (pick) taken.add(pick.v);
        out[line.speaker] = { voice: pick?.v, pitch: !free && pick ? (line.gender === 'female' ? 1.2 : 0.8) : 1 };
    }
    return out;
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

/** Plays a pre-generated audio file of a listening question. */
export function playAudioFile(src: string, onComplete: () => void) {
    stopDialogueSpeech();
    const audio = new Audio(src);
    activeAudio = audio;
    const done = () => { if (activeAudio === audio) { activeAudio = null; onComplete(); } };
    audio.addEventListener('ended', done);
    audio.addEventListener('error', done);
    audio.play().catch(done);
}

export function playDialogueSpeech(
    lines: DialogueLine[],
    onLineStart: (index: number) => void,
    onComplete: () => void
) {
    if (!window.speechSynthesis) {
        onComplete();
        return;
    }

    stopDialogueSpeech();

    const start = () => {
        const voices = pickSpeakerVoices(lines, window.speechSynthesis.getVoices());
        const speakLine = (index: number) => {
            if (index >= lines.length) {
                onComplete();
                return;
            }
            const line = lines[index];
            onLineStart(index);

            const utterance = new SpeechSynthesisUtterance(line.text);
            activeUtterance = utterance;
            const { voice, pitch } = voices[line.speaker] ?? { pitch: 1 };
            if (voice) utterance.voice = voice;
            utterance.lang = line.accent === 'US' ? 'en-US' : 'en-GB';
            utterance.pitch = pitch;
            utterance.rate = 0.95;

            utterance.onend = () => {
                if (activeUtterance === utterance) setTimeout(() => speakLine(index + 1), 600);
            };
            utterance.onerror = () => {
                if (activeUtterance === utterance) speakLine(index + 1);
            };
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
