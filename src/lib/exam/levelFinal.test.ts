import { describe, expect, it } from 'vitest';
import { LEVEL_FINAL_PASS, buildLevelFinal, exerciseToQuestion, levelFinalResult } from './levelFinal';
import { grade, marksOf } from './grading';
import { validateQuestion } from './validate';
import { isMultipleChoice, type AssessmentQuestion, type ExamResponse } from './types';
import { allExercises, getUnitsByLevel } from '../../data';
import { levelFinalBanks } from '../../data/assessments/level-final';

/** A seeded random number generator, so each run builds the same exam. */
function seeded(seed: number) {
    return () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };
}

const units = getUnitsByLevel('A1').filter(u => !u.isAssessment);
const source = { units, exercises: allExercises, bank: levelFinalBanks.A1 };

/** The right response to a question, of the shape the exam expects. */
function rightAnswer(q: AssessmentQuestion): ExamResponse {
    if (isMultipleChoice(q)) return q.correctIndex;
    switch (q.kind) {
        case 'tfng': return q.answer;
        case 'gap': return q.answers[0];
        case 'build-sentence': {
            const words = q.answer;
            const used = new Set<number>();
            const order: number[] = [];
            let rest = words;
            while (rest.length) {
                const i = q.pieces.findIndex((p, k) => !used.has(k) && rest.startsWith(p));
                used.add(i);
                order.push(i);
                rest = rest.slice(q.pieces[i].length).trimStart();
            }
            return order;
        }
        default: throw new Error(`unexpected kind ${q.kind}`);
    }
}

describe('exerciseToQuestion', () => {
    it('turns every A1 and A2 exercise into an answerable exam question', () => {
        for (const ex of allExercises.filter(e => /^a[12]-/.test(e.unitId))) {
            const q = exerciseToQuestion(ex);
            expect(validateQuestion(q), ex.id).toEqual([]);
            expect(grade(q, rightAnswer(q)), ex.id).toBe(marksOf(q));
        }
    });
});

describe('buildLevelFinal', () => {
    const exam = buildLevelFinal(source, seeded(7));

    it('has one review item per unit, the transfer items, and then the reading and listening', () => {
        const review = exam.filter(q => !q.id.startsWith('lf_'));
        expect(review.map(q => q.unitId).sort()).toEqual(units.map(u => u.id).sort());
        for (const q of review) expect(allExercises.some(e => e.id === q.id), q.id).toBe(true);
        expect(exam.filter(q => q.id.startsWith('lf_a1_t'))).toHaveLength(levelFinalBanks.A1.transfer.length);
        expect(exam.slice(-10).map(q => q.section)).toEqual([...Array(5).fill('reading'), ...Array(5).fill('listening')]);
    });

    it('shuffles the options, so the answer is not always first', () => {
        const firsts = exam.filter(isMultipleChoice).filter(q => q.correctIndex === 0).length;
        expect(firsts).toBeLessThan(exam.filter(isMultipleChoice).length);
    });

    it('builds the same exam from the same seed', () => {
        expect(buildLevelFinal(source, seeded(7)).map(q => q.id)).toEqual(exam.map(q => q.id));
    });
});

describe('levelFinalResult', () => {
    const exam = buildLevelFinal(source, seeded(3));
    const all = Object.fromEntries(exam.map(q => [q.id, rightAnswer(q)]));

    it('scores 100 with every answer right and lists no unit to review', () => {
        expect(levelFinalResult(exam, all)).toEqual({ score: 100, passed: true, weakUnits: [] });
    });

    it(`passes at exactly ${LEVEL_FINAL_PASS} %`, () => {
        const questions = exam.slice(0, 10);
        const eight = Object.fromEntries(questions.slice(0, 8).map(q => [q.id, rightAnswer(q)]));
        expect(levelFinalResult(questions, eight)).toMatchObject({ score: 80, passed: true });
    });

    it('lists only the units with a wrong item, the most missed first', () => {
        const wrong = exam.filter(q => q.unitId === 'a1-u4' || q.id === exam.find(x => x.unitId === 'a1-u1')!.id);
        const responses = { ...all };
        for (const q of wrong) delete responses[q.id];
        const { weakUnits } = levelFinalResult(exam, responses);
        expect(weakUnits[0]).toBe('a1-u4');
        expect(new Set(weakUnits)).toEqual(new Set(['a1-u4', 'a1-u1']));
    });
});
