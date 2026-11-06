import { describe, expect, it } from 'vitest';
import { comprehensionExercises, examplePairs, storyPairs } from './comprehension';
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

describe('storyPairs', () => {
    it('gives every A1 and A2 unit with stories enough sentences for its checkpoint', async () => {
        const levels = [(await import('../data/levels/a1')).default, (await import('../data/levels/a2')).default];
        for (const level of levels) {
            const units = new Set(level.stories.map(s => s.unitId).filter(Boolean));
            for (const unitId of units) {
                const pairs = storyPairs(level.stories.filter(s => s.unitId === unitId));
                expect(pairs.length, unitId).toBeGreaterThanOrEqual(6);
            }
        }
    });

    it('leaves out a story whose translation does not line up', () => {
        const story = { id: 's', level: 'A1', title: 'S', content: '<p>I am Ana. She is my sister. We are at home.</p>', wordCount: 9, estimatedMinutes: 1 } as const;
        expect(storyPairs([{ ...story, translation: { sentences: ['Soy Ana.', 'Ella es mi hermana.'] } }])).toEqual([]);
        expect(storyPairs([{ ...story, translation: { sentences: ['Soy Ana.', 'Ella es mi hermana.', 'Estamos en casa.'] } }])).toEqual([
            { en: 'I am Ana.', es: 'Soy Ana.' },
            { en: 'She is my sister.', es: 'Ella es mi hermana.' },
            { en: 'We are at home.', es: 'Estamos en casa.' },
        ]);
    });
});
