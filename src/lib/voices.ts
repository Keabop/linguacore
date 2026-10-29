import type { CEFRLevel } from './database.types';

// Browser voices: which ones to prefer per accent, and how fast to speak to each level.

export type Accent = 'US' | 'UK' | 'AU';
export type VoiceGender = 'female' | 'male';

/**
 * Name fragments of the best-sounding voices of each accent, best first: the natural voices of
 * Edge and Windows, then Chrome's, then macOS and iOS, then the older Windows ones.
 */
export const PREFERRED_VOICES: Record<Accent, string[]> = {
    US: ['Aria', 'Jenny', 'Ava', 'Andrew', 'Guy', 'Google US English', 'Samantha', 'Allison', 'Zira', 'David', 'Mark'],
    UK: ['Sonia', 'Libby', 'Ryan', 'Thomas', 'Google UK English Female', 'Google UK English Male', 'Serena', 'Daniel', 'Hazel', 'George', 'Susan'],
    AU: ['Natasha', 'William', 'Annette', 'Karen', 'Catherine', 'James'],
};

/**
 * Speed of the browser voices and of the generated audio for each level: slower for beginners,
 * normal speed from B1 (the learner can still change it in the story player).
 */
export const SPEECH_RATE: Record<CEFRLevel, number> = { A1: 0.8, A2: 0.9, B1: 1, B2: 1 };

const LANG: Record<Accent, string> = { US: 'en-US', UK: 'en-GB', AU: 'en-AU' };
const FEMALE = /female|woman|zira|samantha|hazel|susan|libby|sonia|aria|jenny|ava|allison|karen|moira|tessa|serena|victoria|fiona|natasha|annette|catherine/i;
const MALE = /\bmale\b|\bman\b|david|george|mark|ryan|guy|daniel|alex|fred|oliver|thomas|james|arthur|andrew|william/i;

const langOf = (voice: SpeechSynthesisVoice) => voice.lang.replace('_', '-');

export const englishVoices = (voices: SpeechSynthesisVoice[]) => voices.filter(v => langOf(v).toLowerCase().startsWith('en'));

/** How well a voice fits an accent (and a gender, when one is asked for); below zero if not English. */
export function rankVoice(voice: SpeechSynthesisVoice, accent: Accent, gender?: VoiceGender): number {
    const lang = langOf(voice);
    if (!lang.toLowerCase().startsWith('en')) return -1;
    let score = lang.toLowerCase().startsWith(LANG[accent].toLowerCase()) ? 50 : 10;
    const preferred = PREFERRED_VOICES[accent].findIndex(name => voice.name.toLowerCase().includes(name.toLowerCase()));
    if (preferred >= 0) score += 20 - preferred;
    if (gender && (gender === 'female' ? FEMALE : MALE).test(voice.name)) score += 30;
    if (voice.localService) score += 1;
    return score;
}

/** The best English voice for an accent, another English accent if that one is missing, or null. */
export function pickVoice(voices: SpeechSynthesisVoice[], accent: Accent, gender?: VoiceGender): SpeechSynthesisVoice | null {
    let best: SpeechSynthesisVoice | null = null;
    let bestScore = -1;
    for (const voice of voices) {
        const score = rankVoice(voice, accent, gender);
        if (score > bestScore) {
            best = voice;
            bestScore = score;
        }
    }
    return best;
}
