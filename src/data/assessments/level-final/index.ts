// End-of-level exam: new items for each level, beside the review items drawn from its units
// (src/lib/exam/levelFinal.ts). Checked by src/data/content.test.ts.
import type { AssessmentQuestion } from '../../../lib/exam/types';
import { a1Final } from './a1';
import { a2Final } from './a2';
import { b1Final } from './b1';
import { b2Final } from './b2';

export type LessonLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface LevelFinalBank {
    /** The level's grammar in contexts its units don't have, each tagged with its unit. */
    transfer: AssessmentQuestion[];
    /** One new text with its questions. */
    reading: AssessmentQuestion[];
    /** One new two-voice recording with its questions. */
    listening: AssessmentQuestion[];
}

export const levelFinalBanks: Record<LessonLevel, LevelFinalBank> = { A1: a1Final, A2: a2Final, B1: b1Final, B2: b2Final };

export const levelFinalQuestions: AssessmentQuestion[] = Object.values(levelFinalBanks).flatMap(b => [...b.transfer, ...b.reading, ...b.listening]);
