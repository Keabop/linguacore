import { describe, expect, it } from 'vitest';
import { chooseStage, endsRouter, visibleQuestions } from './adaptive';
import {
    cambridgeScale, cefrFromCambridge, cefrFromIelts, cefrFromToefl, ieltsBand, ieltsOverall,
    toeflBand, toeflOverall,
} from './bands';
import { grade, marksOf, normalizeAnswer, parseCompleteWords, scoreSections } from './grading';
import { tallyByLevel } from './placement';
import type { AssessmentQuestion, ExamLevel } from './types';

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
        expect(tallyByLevel(qs, { mc: 0 })).toEqual({ A1: { earned: 1, total: 1 }, B2: { earned: 0, total: 4 } });
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
    const r = (id: string, section: 'reading' | 'listening' | 'use-of-english', level: ExamLevel = 'B1'): AssessmentQuestion =>
        ({ id, section, level, text: id, options: ['a', 'b'], correctIndex: 0 });

    it('reports IELTS bands and leaves unevaluated skills out instead of guessing', async () => {
        const { buildReport } = await import('./report');
        const qs = [r('r1', 'reading'), r('r2', 'reading'), r('l1', 'listening'), r('l2', 'listening')];
        const report = buildReport('ielts', qs, { r1: 0, r2: 0, l1: 0, l2: 1 }, {}, null, 70);
        expect(report.breakdown).toEqual([
            { skill: 'Listening', value: '5.5' }, // 1 of 2 → 20 of 40
            { skill: 'Reading', value: '9.0' },
            { skill: 'Writing', value: null },
            { skill: 'Speaking', value: '6.5' },
        ]);
        expect(report.headline.value).toBe('7.0'); // mean of 5.5, 9 and 6.5
        expect(report.percent.writing).toBeNull();
    });

    it('reports the placement level, its confidence and the marks per level seen', async () => {
        const { buildReport } = await import('./report');
        const qs = [r('a', 'use-of-english', 'A2'), r('b', 'use-of-english', 'B1'), r('c', 'use-of-english', 'B2')];
        const report = buildReport('placement', qs, { a: 0, b: 0, c: 1 }, {}, null, null);
        expect(report).toMatchObject({ level: 'B1', confidence: 'unfinished' });
        expect(report.breakdown).toEqual([
            { skill: 'levelQuestions_A2', value: '1/1' },
            { skill: 'levelQuestions_B1', value: '1/1' },
            { skill: 'levelQuestions_B2', value: '0/1' },
        ]);
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

describe('word limits with numbers', () => {
    it('does not count figures as words when the task allows a number', async () => {
        const { countWords } = await import('./grading');
        expect(countWords('07946 381 205', true)).toBe(0);
        expect(countWords('14th March', true)).toBe(1);
        expect(countWords('14th March')).toBe(2);
        const phone: AssessmentQuestion = { ...gap, id: 'ph', text: 'Phone: ___', answers: ['07946 381 205'], maxWords: 1, allowNumber: true };
        expect(grade(phone, '07946 381 205')).toBe(1);
    });
});

describe('pages', () => {
    const lq = (id: string, group?: string, section: 'listening' | 'reading' = 'listening'): AssessmentQuestion =>
        ({ id, section, level: 'B1', group, text: id, options: ['a', 'b'], correctIndex: 0, dialogue: [] });

    it('puts a listening part on one page and keeps other questions alone', async () => {
        const { pageEnd, pageStart } = await import('./adaptive');
        const qs = [lq('a', 'p1'), lq('b', 'p1'), lq('c', 'p2'), lq('d', 'r1', 'reading'), lq('e', 'r1', 'reading')];
        expect(pageEnd(qs, 0)).toBe(1);
        expect(pageEnd(qs, 2)).toBe(2);
        expect(pageEnd(qs, 3)).toBe(3); // reading passages keep one question per screen
        expect(pageStart(qs, 1)).toBe(0);
        expect(pageStart(qs, 2)).toBe(2);
    });

    it('puts a reading group marked sharePage on one page (a cloze or a gapped text)', async () => {
        const { pageEnd, pageStart } = await import('./adaptive');
        const shared = (id: string): AssessmentQuestion => ({ ...lq(id, 'cloze', 'reading'), sharePage: true });
        const qs = [lq('a', 'r1', 'reading'), shared('b'), shared('c'), shared('d'), lq('e', 'r2', 'reading')];
        expect(pageEnd(qs, 1)).toBe(3);
        expect(pageStart(qs, 3)).toBe(1);
        expect(pageEnd(qs, 0)).toBe(0);
        expect(pageEnd(qs, 4)).toBe(4);
    });
});

describe('marks', () => {
    it('counts the marks a question is worth (B2 First Parts 4 to 6 are worth 2)', async () => {
        const { grade, marksOf } = await import('./grading');
        const q: AssessmentQuestion = { id: 'k', section: 'use-of-english', level: 'B2', kind: 'gap', text: 'x ___', answers: ['was called off'], marks: 2 };
        expect(marksOf(q)).toBe(2);
        expect(grade(q, 'was called off')).toBe(2);
        expect(grade(q, 'was cancelled')).toBe(0);
    });
});
