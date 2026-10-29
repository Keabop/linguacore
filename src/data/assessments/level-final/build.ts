// Helpers for writing the end-of-level banks. The right option is always listed first; the
// exam shuffles the options before showing them.
import type { AssessmentQuestion, DialogueLine, ExamLevel, TfngAnswer } from '../../../lib/exam/types';

type Voice = Omit<DialogueLine, 'text'>;

export const line = (voice: Voice, text: string): DialogueLine => ({ ...voice, text });
export const ukWoman: Voice = { speaker: 'A', accent: 'UK', gender: 'female' };
export const usWoman: Voice = { speaker: 'A', accent: 'US', gender: 'female' };
export const ukMan: Voice = { speaker: 'B', accent: 'UK', gender: 'male' };
export const usMan: Voice = { speaker: 'B', accent: 'US', gender: 'male' };

/** The bank of one level: ids are `lf_<level>_<part><n>`. */
export function bankOf(level: ExamLevel) {
    const id = (part: string, n: number) => `lf_${level.toLowerCase()}_${part}${n}`;
    let t = 0;
    let r = 0;
    let l = 0;
    return {
        /** Transfer item, multiple choice: the answer goes first. */
        choice: (unitId: string, text: string, options: string[]): AssessmentQuestion => ({
            id: id('t', ++t), section: 'use-of-english', task: 'Grammar', level, unitId, text, options, correctIndex: 0,
        }),
        /** Transfer item: write the missing words. */
        gap: (unitId: string, text: string, answers: string[], maxWords = 1): AssessmentQuestion => ({
            id: id('t', ++t), section: 'use-of-english', task: 'Grammar', level, unitId, kind: 'gap', text, answers, maxWords,
        }),
        /** Transfer item: put the pieces in order. */
        order: (unitId: string, text: string, answer: string, pieces: string[]): AssessmentQuestion => ({
            id: id('t', ++t), section: 'use-of-english', task: 'Grammar', level, unitId, kind: 'build-sentence', text, answer, pieces,
        }),
        reading: (passage: string) => ({
            choice: (text: string, options: string[], evidence: string): AssessmentQuestion => ({
                id: id('r', ++r), section: 'reading', task: 'Reading', level, group: id('reading', 0), sharePage: true, passage, text, options, correctIndex: 0, evidence,
            }),
            judge: (text: string, answer: TfngAnswer, evidence?: string): AssessmentQuestion => ({
                id: id('r', ++r), section: 'reading', task: 'Reading', level, group: id('reading', 0), sharePage: true, passage, kind: 'tfng', text, answer, ...(evidence ? { evidence } : {}),
            }),
        }),
        listening: (dialogue: DialogueLine[]) => ({
            choice: (text: string, options: string[], evidence: string): AssessmentQuestion => ({
                id: id('l', ++l), section: 'listening', task: 'Listening', level, group: id('listening', 0), dialogue, text, options, correctIndex: 0, evidence,
            }),
            judge: (text: string, answer: TfngAnswer, evidence?: string): AssessmentQuestion => ({
                id: id('l', ++l), section: 'listening', task: 'Listening', level, group: id('listening', 0), dialogue, kind: 'tfng', text, answer, ...(evidence ? { evidence } : {}),
            }),
        }),
    };
}
