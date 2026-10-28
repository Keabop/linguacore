// IELTS Academic simulator, in exam order: Listening, Reading, then Writing and Speaking.
import { ieltsListening } from './ielts/listening';
import { ieltsReading } from './ielts/reading';
import type { AssessmentQuestion } from '../../lib/exam/types';

export { ieltsWriting, ieltsSpeaking } from './ielts/productive';

export const ieltsQuestions: AssessmentQuestion[] = [...ieltsListening, ...ieltsReading];
