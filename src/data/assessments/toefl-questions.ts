// TOEFL iBT simulator (format of January 2026), in exam order: Reading and Listening (each
// adaptive in two modules), then Writing (Build a Sentence, email, academic discussion) and
// Speaking.
import { toeflReading } from './toefl/reading';
import { toeflListening } from './toefl/listening';
import { toeflBuildSentence } from './toefl/productive';
import type { AssessmentQuestion } from '../../lib/exam/types';

export { toeflWriting, toeflSpeaking } from './toefl/productive';

export const toeflQuestions: AssessmentQuestion[] = [...toeflReading, ...toeflListening, ...toeflBuildSentence];
