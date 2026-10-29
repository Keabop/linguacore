import { describe, expect, it } from 'vitest';
import reference from '../../../content/reference/cefrj-vocabulary.json';
import { buildLevelIndex, type ReferenceEntry } from '../contentMetrics';
import { aboveLevelShare, checkScore } from './check';
import { EXPECTED, evalSamples, injectionSamples, tutorSamples } from './samples';

const index = buildLevelIndex(reference as ReferenceEntry[]);

describe('checkScore', () => {
    const meets = evalSamples.find(s => s.quality === 'meets')!;

    it('accepts both ends of the expected range and rejects what falls outside', () => {
        expect(checkScore(meets, 60).ok).toBe(true);
        expect(checkScore(meets, 79).ok).toBe(true);
        expect(checkScore(meets, 59).ok).toBe(false);
        expect(checkScore(meets, 80).ok).toBe(false);
        expect(checkScore(meets, Number.NaN).ok).toBe(false);
    });
});

describe('evaluator samples', () => {
    it('has a below, meets and above answer per level and skill', () => {
        for (const skill of ['writing', 'speaking'] as const) {
            for (const level of ['A1', 'A2', 'B1', 'B2'] as const) {
                const qualities = evalSamples.filter(s => s.skill === skill && s.level === level).map(s => s.quality).sort();
                expect(qualities, `${skill} ${level}`).toEqual(['above', 'below', 'meets']);
            }
        }
        const all = [...evalSamples, ...injectionSamples];
        expect(new Set(all.map(s => s.id)).size).toBe(all.length);
    });

    it('keeps the ranges apart, so a sample can only fit one quality', () => {
        expect(EXPECTED.below[1]).toBeLessThan(EXPECTED.meets[0]);
        expect(EXPECTED.meets[1]).toBeLessThan(EXPECTED.above[0]);
    });

    it('writes longer answers the higher the quality, within each level and skill', () => {
        for (const s of evalSamples.filter(s => s.quality === 'meets')) {
            const of = (q: string) => evalSamples.find(x => x.skill === s.skill && x.level === s.level && x.quality === q)!.answer.split(/\s+/).length;
            expect(of('below'), s.id).toBeLessThan(of('meets'));
        }
    });

    it('has two tutor openings per level', () => {
        for (const level of ['A1', 'A2', 'B1', 'B2']) expect(tutorSamples.filter(s => s.level === level)).toHaveLength(2);
    });
});

describe('aboveLevelShare', () => {
    it('finds almost nothing above A1 in a simple A1 reply, and names do not count', () => {
        expect(aboveLevelShare('Hi Carla! Nice to meet you. I like Mexico. What is your favourite food?', 'A1', index)).toBeLessThan(0.05);
    });

    it('fails a reply with no English at all', () => {
        expect(aboveLevelShare('Muy bien. Ahora dime qué comes los viernes.', 'A1', index)).toBe(1);
    });

    it('leaves out the sentences in Spanish', () => {
        const reply = 'Very good! "Went" es el pasado de "go", y se usa para hablar de ayer. Where did you go?';
        expect(aboveLevelShare(reply, 'A1', index)).toBeLessThan(0.05);
    });

    it('finds a good share of above-level words in a B2 sentence for an A1 learner', () => {
        expect(aboveLevelShare('Notwithstanding the considerable ambiguity, the committee reached a unanimous verdict.', 'A1', index)).toBeGreaterThan(0.3);
    });
});
