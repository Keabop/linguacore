import { pickVoice } from './voices';

/** Whether this browser can read English aloud. */
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * Reads an English word or sentence aloud with the browser's voice, a little slower than normal
 * so whoever starts can follow it. Stops whatever was being read.
 */
export function speakEnglish(text: string, rate = 0.85): void {
    speakLines([text], rate);
}

/** Reads several lines one after another (a dialogue), stopping whatever was being read. */
export function speakLines(lines: string[], rate = 0.85): void {
    if (!canSpeak()) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const voice = pickVoice(synth.getVoices(), 'US');
    for (const line of lines) {
        const utterance = new SpeechSynthesisUtterance(line);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        if (voice) utterance.voice = voice;
        synth.speak(utterance);
    }
}
