// Everything that has pre-generated audio: each listening script of the exams and each static
// story. `npm run content:audio` generates the files; the content tests check none is missing.
import type { AssessmentQuestion, DialogueLine } from '../../lib/exam/types';
import { dialogueKey, storyKey } from '../../lib/audioKey';
import { splitSentences } from '../../lib/assessmentSpeech';
import { storySentences } from '../../lib/storySentences';
import { SPEECH_RATE, listeningRate } from '../../lib/voices';
import { allStories } from '../index';
import { placementQuestions } from '../assessments/placement';
import { cambridgeB1Questions } from '../assessments/cambridge/b1';
import { cambridgeB2Questions } from '../assessments/cambridge/b2';
import { ieltsQuestions } from '../assessments/ielts-questions';
import { toeflQuestions } from '../assessments/toefl-questions';
import { levelFinalQuestions } from '../assessments/level-final';

export interface AudioSegment {
    /** Kokoro voice id. */
    voice: string;
    lang: 'en-us' | 'en-gb';
    text: string;
    /** Silence after the segment, in seconds. */
    pause: number;
}

export interface AudioJob {
    key: string;
    kind: 'dialogue' | 'story';
    rate: number;
    segments: AudioSegment[];
}

// Two voices per accent and gender, so two speakers of the same kind still sound different
const VOICES: Record<string, [string, string]> = {
    'US|female': ['af_heart', 'af_bella'],
    'US|male': ['am_michael', 'am_fenrir'],
    'UK|female': ['bf_emma', 'bf_isabella'],
    'UK|male': ['bm_george', 'bm_lewis'],
};
const STORY_VOICE = 'af_heart';

function dialogueJob(lines: DialogueLine[], rate: number): AudioJob {
    const voiceOf = new Map<string, string>();
    const used = new Set<string>();
    for (const l of lines) {
        if (voiceOf.has(l.speaker)) continue;
        const [first, second] = VOICES[`${l.accent}|${l.gender}`];
        const voice = used.has(first) ? second : first;
        used.add(voice);
        voiceOf.set(l.speaker, voice);
    }
    const segments = lines.flatMap((l, i) => {
        const parts = splitSentences(l.text);
        return parts.map((text, j): AudioSegment => ({
            voice: voiceOf.get(l.speaker)!,
            lang: l.accent === 'US' ? 'en-us' : 'en-gb',
            text,
            // A short pause between sentences, a longer one when the speaker changes turn
            pause: j < parts.length - 1 ? 0.15 : i < lines.length - 1 ? 0.6 : 0,
        }));
    });
    return { key: dialogueKey(lines, rate), kind: 'dialogue', rate, segments };
}

const banks: AssessmentQuestion[][] = [placementQuestions, cambridgeB1Questions, cambridgeB2Questions, ieltsQuestions, toeflQuestions, levelFinalQuestions];

export function audioJobs(): AudioJob[] {
    const jobs = new Map<string, AudioJob>();
    for (const q of banks.flat()) {
        if (!q.dialogue?.length || q.audioSrc) continue;
        const job = dialogueJob(q.dialogue, listeningRate(q.level));
        jobs.set(job.key, job);
    }
    for (const story of allStories) {
        const rate = SPEECH_RATE[story.level];
        const sentences = storySentences(story.content);
        const key = storyKey(sentences, rate);
        jobs.set(key, {
            key, kind: 'story', rate,
            segments: sentences.map((text, i) => ({ voice: STORY_VOICE, lang: 'en-us', text, pause: i < sentences.length - 1 ? 0.35 : 0 })),
        });
    }
    return [...jobs.values()];
}
