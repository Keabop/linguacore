import { pickVoice } from './voices';

/** Whether this browser can read English aloud. */
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * Reads an English word or sentence aloud with the browser's voice, a little slower than normal
 * so whoever starts can follow it. Stops whatever was being read.
 */
export function speakEnglish(text: string, rate = 0.85): void {
    if (!canSpeak()) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    const voice = pickVoice(synth.getVoices(), 'US');
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
}
