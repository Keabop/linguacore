import { grade, marksOf } from './grading';
import type { AssessmentQuestion, ExamResponse, ExamSection } from './types';

/** Share of router marks needed to get the upper (harder) stage. */
export const UPPER_STAGE_THRESHOLD = 0.6;

export type StageChoice = Partial<Record<ExamSection, 'lower' | 'upper'>>;

/** Sections whose questions come in router + lower/upper stages. */
export function adaptiveSections(questions: AssessmentQuestion[]): ExamSection[] {
    return [...new Set(questions.filter(q => q.stage === 'lower' || q.stage === 'upper').map(q => q.section))];
}

/** Which second stage a section's router results lead to. */
export function chooseStage(questions: AssessmentQuestion[], section: ExamSection, responses: Record<string, ExamResponse>): 'lower' | 'upper' {
    const router = questions.filter(q => q.section === section && q.stage === 'router');
    const total = router.reduce((n, q) => n + marksOf(q), 0);
    const earned = router.reduce((n, q) => n + grade(q, responses[q.id]), 0);
    return total > 0 && earned / total >= UPPER_STAGE_THRESHOLD ? 'upper' : 'lower';
}

/**
 * The questions the learner sees, in order: everything without a stage, the routers, and for
 * each adaptive section only the stage already chosen (none until its router is finished).
 */
export function visibleQuestions(questions: AssessmentQuestion[], chosen: StageChoice): AssessmentQuestion[] {
    return questions.filter(q => !q.stage || q.stage === 'router' || chosen[q.section] === q.stage);
}

/**
 * True when `visible[index]` is the last router question of an adaptive section whose stage
 * isn't chosen yet. `all` is the whole exam (the stages aren't visible before the choice).
 */
export function endsRouter(all: AssessmentQuestion[], visible: AssessmentQuestion[], index: number, chosen: StageChoice): boolean {
    const q = visible[index];
    if (q?.stage !== 'router' || chosen[q.section]) return false;
    const next = visible.slice(index + 1).find(n => n.section === q.section);
    return next?.stage !== 'router' && adaptiveSections(all).includes(q.section);
}
