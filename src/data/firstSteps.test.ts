import { describe, expect, it } from 'vitest';
import { firstStepsLessons } from './firstSteps';
import { comprehensionExercises } from '../lib/comprehension';
import { allUnits, getUnitsByLevel } from './curriculum/units';

describe('Primeros pasos', () => {
    it('gives every lesson its full practice, with distinct options', () => {
        for (const lesson of firstStepsLessons) {
            const { meaning, listen } = lesson.practice;
            expect(lesson.items.length, lesson.id).toBeGreaterThanOrEqual(meaning + listen);
            const exercises = comprehensionExercises(lesson.items, lesson.id, lesson.practice);
            expect(exercises, lesson.id).toHaveLength(meaning + listen);
            for (const e of exercises) expect(new Set(e.options).size, `${lesson.id}: ${e.question}`).toBe(3);
        }
        // A word may come back in another lesson (three is a number and a sound), never twice in one
        for (const lesson of firstStepsLessons) expect(new Set(lesson.items.map(i => i.en)).size, lesson.id).toBe(lesson.items.length);
    });

    it('is not one of the units of A1, so it locks nothing', () => {
        expect(allUnits.some(u => u.id === 'a1-u0')).toBe(false);
        expect(getUnitsByLevel('A1')[0].id).toBe('a1-u1');
    });
});

describe('grammar labels', () => {
    it('names in Spanish what every A1 and A2 task practices', async () => {
        const { grammarLabel } = await import('./grammarLabels');
        const { a1WritingPrompts, a1SpeakingPrompts } = await import('./output/a1-output');
        const { a2WritingPrompts, a2SpeakingPrompts } = await import('./output/a2-output');
        const tags = new Set([...a1WritingPrompts, ...a1SpeakingPrompts, ...a2WritingPrompts, ...a2SpeakingPrompts].flatMap(p => p.targetGrammar ?? []));
        for (const tag of tags) expect(grammarLabel(tag), tag).not.toBe(tag);
    });
});
