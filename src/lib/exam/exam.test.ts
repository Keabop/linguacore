import { describe, expect, it } from 'vitest';
import { chooseStage, endsRouter, visibleQuestions } from './adaptive';
import {
    cambridgeScale, cefrFromCambridge, cefrFromIelts, cefrFromToefl, ieltsBand, ieltsOverall, placementLevel,
    toeflBand, toeflOverall,
} from './bands';
import { grade, marksOf, normalizeAnswer, parseCompleteWords, ratioByLevel, scoreSections } from './grading';
import type { AssessmentQuestion } from './types';

const mc: AssessmentQuestion = { id: 'mc', section: 'use-of-english', level: 'A1', text: 'She ___ a doctor.', options: ['is', 'are'], correctIndex: 0 };
const tfng: AssessmentQuestion = { id: 'tf', kind: 'tfng', section: 'reading', level: 'B2', text: 'Maps began on paper.', answer: 'false' };
const gap: AssessmentQuestion = { id: 'gap', kind: 'gap', section: 'listening', level: 'B1', text: 'The tour leaves from the ___.', answers: ['main square', 'square'], maxWords: 2 };
const words: AssessmentQuestion = { id: 'cw', kind: 'complete-words', section: 'reading', level: 'B2', text: 'Bees vis[it] flow[ers] to col[lect] nectar.' };
const build: AssessmentQuestion = { id: 'bs', kind: 'build-sentence', section: 'use-of-english', level: 'B1', text: 'When does it open?', pieces: ['opens', 'at nine', 'It'], answer: 'It opens at nine' };

describe('grading', () => {
    it('normalises written answers', () => {
        expect(normalizeAnswer('  The Main   Square. ')).toBe('the main square');
        expect(normalizeAnswer('“Tom’s”')).toBe("tom's");
    });

    it('grades each kind of question', () => {
        expect(grade(mc, 0)).toBe(1);
        expect(grade(mc, 1)).toBe(0);
        expect(grade(tfng, 'false')).toBe(1);
        expect(grade(tfng, 'not-given')).toBe(0);
        expect(grade(gap, 'Main Square')).toBe(1);
        expect(grade(gap, 'the big main square')).toBe(0); // over the word limit
        expect(grade(words, ['it', 'ers', 'x'])).toBe(2);
        expect(grade(build, [2, 0, 1])).toBe(1);
        expect(grade(build, [0, 2, 1])).toBe(0);
        expect(grade(mc, undefined)).toBe(0);
    });

    it('counts one mark per missing word part', () => {
        expect(marksOf(words)).toBe(3);
        expect(parseCompleteWords('Bees vis[it] here.')).toEqual(['Bees ', { shown: 'vis', missing: 'it' }, ' here.']);
    });

    it('scores sections and levels by marks', () => {
        const qs = [mc, tfng, words];
        const sections = scoreSections(qs, { mc: 0, tf: 'true', cw: ['it', 'ers', 'lect'] });
        expect(sections['use-of-english']).toEqual({ earned: 1, total: 1, ratio: 1 });
        expect(sections.reading).toEqual({ earned: 3, total: 4, ratio: 0.75 });
        expect(sections.listening.ratio).toBeNull();
        expect(ratioByLevel(qs, { mc: 0 })).toEqual({ A1: 1, B2: 0 });
    });
});

describe('bands', () => {
    it('converts IELTS raw marks and averages like IELTS', () => {
        expect(ieltsBand(30, 40, 'reading')).toBe(7);
        expect(ieltsBand(26, 40, 'listening')).toBe(6.5);
        expect(ieltsBand(15, 20, 'listening')).toBe(7); // scaled to 30/40
        expect(ieltsOverall([6.5, 6.5, 5, 7])).toBe(6.5); // 6.25 → 6.5
        expect(ieltsOverall([4, 3.5, 4, 4])).toBe(4); // 3.875 → 4
        expect(cefrFromIelts(6)).toBe('B2');
        expect(cefrFromIelts(7)).toBe('C1');
    });

    it('converts TOEFL 2026 bands and caps the lower stage', () => {
        expect(toeflBand(0.9)).toBe(5.5);
        expect(toeflBand(0.9, 'lower')).toBe(4);
        expect(toeflOverall([5, 4.5, 4, 4.5])).toBe(4.5);
        expect(cefrFromToefl(4.5)).toBe('B2');
        expect(cefrFromToefl(6)).toBe('C2');
    });

    it('maps Cambridge marks onto the scale', () => {
        expect(cambridgeScale(0.7, 'b1')).toBe(140);
        expect(cambridgeScale(0.6, 'b2')).toBe(160);
        expect(cefrFromCambridge(cambridgeScale(0.95, 'b2'))).toBe('C1');
        expect(cefrFromCambridge(cambridgeScale(0.5, 'b1'))).toBe('A2');
    });

    it('places at the highest level reached before a clearly failed one', () => {
        expect(placementLevel({ A1: 1, A2: 0.8, B1: 0.6, B2: 0.25, C1: 0.75 })).toBe('B1');
        expect(placementLevel({ A1: 0.25, A2: 1 })).toBe('A1');
    });

    it('does not sink a strong learner for one shaky level', () => {
        expect(placementLevel({ A1: 0.75, A2: 0.5, B1: 1, B2: 1, C1: 1 })).toBe('C1');
    });
});

describe('two-stage adaptive sections', () => {
    const q = (id: string, stage: 'router' | 'lower' | 'upper'): AssessmentQuestion =>
        ({ id, section: 'reading', level: 'B1', stage, text: id, options: ['a', 'b'], correctIndex: 0 });
    const exam = [q('r1', 'router'), q('r2', 'router'), q('l1', 'lower'), q('u1', 'upper')];

    it('hides the second stage until the router is done', () => {
        expect(visibleQuestions(exam, {}).map(x => x.id)).toEqual(['r1', 'r2']);
        expect(endsRouter(exam, visibleQuestions(exam, {}), 1, {})).toBe(true);
        expect(endsRouter(exam, visibleQuestions(exam, {}), 0, {})).toBe(false);
        expect(endsRouter(exam, visibleQuestions(exam, { reading: 'upper' }), 1, { reading: 'upper' })).toBe(false);
    });

    it('routes by router results', () => {
        expect(chooseStage(exam, 'reading', { r1: 0, r2: 0 })).toBe('upper');
        expect(chooseStage(exam, 'reading', { r1: 0, r2: 1 })).toBe('lower');
        expect(visibleQuestions(exam, { reading: 'upper' }).map(x => x.id)).toEqual(['r1', 'r2', 'u1']);
    });
});

describe('exam report', () => {
    const r = (id: string, section: 'reading' | 'listening' | 'use-of-english', level: 'A1' | 'B1' | 'C1' = 'B1'): AssessmentQuestion =>
        ({ id, section, level, text: id, options: ['a', 'b'], correctIndex: 0 });

    it('reports IELTS bands and leaves unevaluated skills out instead of guessing', async () => {
        const { buildReport } = await import('./report');
        const qs = [r('r1', 'reading'), r('r2', 'reading'), r('l1', 'listening'), r('l2', 'listening')];
        const report = buildReport('ielts', qs, { r1: 0, r2: 0, l1: 0, l2: 1 }, {}, null, 70);
        expect(report.breakdown).toEqual([
            { skill: 'Listening', value: '5.5' }, // 1 of 2 → 20 of 40
            { skill: 'Reading', value: '9.0' },
            { skill: 'Writing', value: 'sin evaluar' },
            { skill: 'Speaking', value: '6.5' },
        ]);
        expect(report.headline.value).toBe('7.0'); // mean of 5.5, 9 and 6.5
        expect(report.percent.writing).toBeNull();
    });

    it('places by levels in the placement test', async () => {
        const { buildReport } = await import('./report');
        const qs = [r('a', 'use-of-english', 'A1'), r('b', 'use-of-english', 'B1'), r('c', 'use-of-english', 'C1')];
        expect(buildReport('placement', qs, { a: 0, b: 0, c: 1 }, {}, null, null).level).toBe('B1');
    });

    it('caps a TOEFL section answered on the lower stage', async () => {
        const { buildReport } = await import('./report');
        const report = buildReport('toefl', [r('r1', 'reading')], { r1: 0 }, { reading: 'lower' }, null, null);
        expect(report.breakdown[0]).toEqual({ skill: 'Reading', value: '4.0' });
    });

    it('averages the five B2 First papers on the scale', async () => {
        const { buildReport } = await import('./report');
        const qs = [r('rd', 'reading'), r('u', 'use-of-english'), r('l', 'listening')];
        const report = buildReport('cambridge_b2', qs, { rd: 0, u: 1, l: 0 }, {}, 60, 60);
        expect(report.breakdown.map(b => b.skill)).toEqual(['Reading', 'Use of English', 'Listening', 'Writing', 'Speaking']);
        expect(report.headline.value).toBe('160'); // (190 + 102 + 190 + 160 + 160) / 5 = 160.4
        expect(report.level).toBe('B2');
    });

    it('counts an empty writing task as zero, not as missing', async () => {
        const { buildReport } = await import('./report');
        const qs = [r('r1', 'reading'), r('l1', 'listening')];
        const skipped = buildReport('ielts', qs, { r1: 0, l1: 0 }, {}, 0, 0);
        const failedAi = buildReport('ielts', qs, { r1: 0, l1: 0 }, {}, null, null);
        expect(Number(skipped.headline.value)).toBeLessThan(Number(failedAi.headline.value));
    });
});

describe('validateQuestion', () => {
    it('accepts well-formed questions of every kind', async () => {
        const { validateQuestion } = await import('./validate');
        for (const q of [mc, { ...tfng, passage: 'Maps began on clay.' }, { ...gap, dialogue: [{ speaker: 'A', accent: 'US', gender: 'male', text: 'Hi' }] } as AssessmentQuestion, words, build]) {
            expect(validateQuestion(q), q.id).toEqual([]);
        }
    });

    it('explains what is wrong', async () => {
        const { validateQuestion } = await import('./validate');
        expect(validateQuestion({ ...mc, correctIndex: 5 })).toContain('correctIndex fuera de rango');
        expect(validateQuestion({ ...build, answer: 'It closes at nine' })).toContain('las piezas no forman la respuesta');
        expect(validateQuestion({ ...gap, answers: ['the big main square'] })).toEqual(expect.arrayContaining(['una respuesta aceptada pasa el límite de palabras', 'escucha sin audio ni guion']));
    });
});

describe('validateExamStructure', () => {
    const q = (id: string, stage?: 'router' | 'lower' | 'upper'): AssessmentQuestion =>
        ({ id, section: 'reading', level: 'B1', stage, text: id, options: ['a', 'b'], correctIndex: 0 });

    it('accepts router then both stages', async () => {
        const { validateExamStructure } = await import('./validate');
        expect(validateExamStructure([q('a'), q('r', 'router'), q('l', 'lower'), q('u', 'upper')])).toEqual([]);
    });

    it('rejects a missing stage or a stage before its router', async () => {
        const { validateExamStructure } = await import('./validate');
        expect(validateExamStructure([q('r', 'router'), q('u', 'upper')])).toHaveLength(1);
        expect(validateExamStructure([q('l', 'lower'), q('r', 'router'), q('u', 'upper')])).toHaveLength(1);
    });
});
