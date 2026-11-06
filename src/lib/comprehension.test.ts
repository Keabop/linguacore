import { describe, expect, it } from 'vitest';
import { comprehensionExercises, examplePairs } from './comprehension';
import { a1GrammarCards } from '../data/curriculum/a1';
import { allGrammarCards } from '../data';

describe('comprehension exercises', () => {
    const pairs = examplePairs(a1GrammarCards[0]);

    it('reads the English and the Spanish of each grammar example', () => {
        expect(pairs[0]).toEqual({ en: 'I am a student.', es: 'Yo soy estudiante.' });
    });

    it('asks for the meaning and for what was heard, with the answer among three options', () => {
        const exercises = comprehensionExercises(pairs, 'a1-u1');
        expect(exercises.map(e => e.type)).toEqual(['meaning-choice', 'meaning-choice', 'listen-choice', 'listen-choice']);
        for (const e of exercises) {
            expect(e.options).toHaveLength(3);
            expect(new Set(e.options).size).toBe(3);
            expect(e.options).toContain(e.correctAnswer);
        }
        const listen = exercises.find(e => e.type === 'listen-choice')!;
        expect(listen.correctAnswer).toBe(listen.question);
    });

    it('needs three pairs to have wrong options', () => {
        expect(comprehensionExercises(pairs.slice(0, 2), 'a1-u1')).toEqual([]);
    });

    it('every grammar card has enough examples for them', () => {
        for (const card of allGrammarCards) expect(examplePairs(card).length, card.unitId).toBeGreaterThanOrEqual(4);
    });
});
