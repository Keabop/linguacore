import { describe, expect, it } from 'vitest';
import { firstStepsLessons } from './firstSteps';
import { comprehensionExercises, guidedWritingExercises } from '../lib/comprehension';
import { a1Vocabulary } from './vocabulary/a1';
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

    it('has a dialogue, words of the A1 deck, writing and phrases to say in every lesson', () => {
        const deck = new Set(a1Vocabulary.map(v => v.id));
        for (const lesson of firstStepsLessons) {
            expect(lesson.dialogue.length, lesson.id).toBeGreaterThanOrEqual(4);
            for (const line of lesson.dialogue) expect(line.en && line.es && line.who, lesson.id).toBeTruthy();
            for (const word of lesson.words) expect(deck.has(word), `${lesson.id}: ${word}`).toBe(true);
            expect(lesson.writing.length, lesson.id).toBeGreaterThanOrEqual(2);
            expect(lesson.repeat.length, lesson.id).toBeGreaterThanOrEqual(2);
        }
    });

    it('builds guided writing that can be answered: the gap is a whole word, the order uses every word', () => {
        for (const lesson of firstStepsLessons) {
            const exercises = guidedWritingExercises(lesson.writing, lesson.id);
            lesson.writing.forEach((sentence, i) => {
                const exercise = exercises[i];
                if (sentence.blank) {
                    expect(exercise.type).toBe('fill-blank');
                    expect(exercise.question, sentence.en).toContain('___');
                    expect(exercise.question.replace('___', sentence.blank).startsWith(sentence.en), sentence.en).toBe(true);
                    expect(exercise.correctAnswer).toBe(sentence.blank);
                } else {
                    expect(exercise.type).toBe('word-order');
                    expect([...exercise.scrambledWords!].sort()).toEqual(sentence.en.split(' ').sort());
                    expect(exercise.question).toContain(sentence.es);
                }
            });
        }
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
