import { describe, expect, it } from 'vitest';
import { FORCED_ATTEMPTS, PASS_SCORE } from '../lib/retryPolicy';
import { LEVEL_FINAL_PASS } from '../lib/exam/levelFinal';
import { CHAPTERS, PLAN_GOAL, PLAN_MINUTES, STEP_ORDER, TOOL_ORDER, TOOL_PATHS, guideLanguage, guideText } from './guide';

const marks = { ...PASS_SCORE, exam: LEVEL_FINAL_PASS, tries: FORCED_ATTEMPTS };

describe('Guía «Cómo aprender con Voxie»', () => {
    it('has every chapter, step and tool in both languages', () => {
        for (const text of Object.values(guideText)) {
            for (const id of CHAPTERS) expect(text.chapters[id]).toBeTruthy();
            for (const key of STEP_ORDER) expect(text.path.steps[key].body).toBeTruthy();
            for (const key of TOOL_ORDER) expect(text.tools.items[key].when).toBeTruthy();
            expect(text.start.options.length).toBe(2);
            expect(text.notebook.items.length).toBe(guideText.es.notebook.items.length);
            expect(text.method.principles.length).toBe(guideText.es.method.principles.length);
        }
    });

    it('plans a whole week for each time, starting every day with the review', () => {
        for (const text of Object.values(guideText)) {
            const stepNames = new Set(STEP_ORDER.map(k => text.path.steps[k].name));
            for (const minutes of PLAN_MINUTES) {
                const days = text.method.plans[minutes].days;
                expect(days).toHaveLength(7);
                for (const day of days) expect(day.items[0]).toBe(text.method.plans[10].days[0].items[0]);
                // Each plan walks the six steps of a unit in order, as often as it says
                const steps = days.flatMap(d => d.items.filter(i => stepNames.has(i)));
                const units = minutes === 40 ? 2 : 1;
                expect(steps).toEqual(Array.from({ length: units }, () => STEP_ORDER.map(k => text.path.steps[k].name)).flat());
            }
        }
    });

    it('asks a daily goal of 1 to 3 activities, one per plan', () => {
        expect(PLAN_MINUTES.map(n => PLAN_GOAL[n])).toEqual([1, 2, 3]);
    });

    it('states the pass marks it is given', () => {
        const rules = guideText.es.path.rules(marks).join(' ');
        expect(rules).toContain(`${PASS_SCORE.exercises}% en ejercicios`);
        expect(rules).toContain(`${PASS_SCORE.writing}% en escritura`);
        expect(rules).toContain(`${PASS_SCORE.speaking}% en habla`);
        expect(rules).toContain(`${PASS_SCORE.checkpoint}% en el checkpoint`);
        expect(rules).toContain(`${LEVEL_FINAL_PASS}% o más`);
        expect(rules).toContain(`intento ${FORCED_ATTEMPTS}`);
    });

    it('links every tool to a real place, except the notebook panel and the glossary', () => {
        expect(Object.entries(TOOL_PATHS).filter(([, to]) => to === null).map(([k]) => k)).toEqual(['notebook', 'glossary']);
    });

    it('reads in English only when the app is in English', () => {
        expect(guideLanguage('en-US')).toBe('en');
        expect(guideLanguage('es')).toBe('es');
        expect(guideLanguage(undefined)).toBe('es');
    });
});
