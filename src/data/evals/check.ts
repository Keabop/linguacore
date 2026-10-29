import { storyCoverage } from '../contentMetrics';
import type { EvalSample } from './samples';

/** Whether an evaluator's score falls in the sample's expected range (both ends included). */
export function checkScore(sample: EvalSample, score: number): { ok: boolean; detail: string } {
    const [min, max] = sample.expected;
    const ok = Number.isFinite(score) && score >= min && score <= max;
    return { ok, detail: `${score} (esperado ${min}–${max})` };
}

// Words only Spanish has, or that are far more common in Spanish than in English
const SPANISH = /[áéíóúñ¿¡]|\b(que|de|el|la|los|las|es|en|por|para|una|con|se|del|lo|como|pero|muy|significa|quiere|decir)\b/gi;

/**
 * The reply without its sentences in Spanish: the tutor explains in Spanish on purpose, and those
 * words are not English above the level.
 */
export function englishPart(reply: string): string {
    // Spanish: two markers, or a short sentence where one in four words is one ("Muy bien.")
    const isSpanish = (s: string) => {
        const markers = (s.match(SPANISH) ?? []).length;
        return markers >= 2 || markers / s.split(/\s+/).length >= 0.25;
    };
    return reply.split(/(?<=[.!?])\s+/).filter(s => !isSpanish(s)).join(' ');
}

/**
 * Share of a reply's English words a learner of the level would not know: above the level in the
 * CEFR-J list or not in it at all. Names and Spanish sentences don't count; `known` adds the app's
 * own cards.
 */
export function aboveLevelShare(reply: string, level: string, index: Map<string, string>, known = new Set<string>()): number {
    // A reply all in Spanish counts as all above the level: the tutor didn't talk in English
    const english = englishPart(reply);
    return english ? 1 - storyCoverage(english, level, index, known).coverage : 1;
}
