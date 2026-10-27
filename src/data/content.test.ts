// Integrity of the teaching content: every item must be answerable as written.
import { describe, expect, it } from 'vitest';
import { allExercises, allGrammarSkills, allStories, allUnits, allVocabulary } from './index';
import { placementQuestions } from './assessments/cefr-questions';
import { cambridgeB1Questions } from './assessments/cambridge-b1-questions';
import { cambridgeB2Questions } from './assessments/cambridge-b2-questions';
import reference from '../../content/reference/cefrj-vocabulary.json';
import {
    ENFORCED_EXAMS, ENFORCED_LEVELS, TARGETS, buildLevelIndex, checkVocabularyLevels, isTemplated, levelRank, storyCoverage,
    storyEncounters, type ReferenceEntry,
} from './contentMetrics';

const norm = (s: string) => s.trim().toLowerCase();
const words = (s: string) => s.split(/\s+/).map(norm).sort();

describe('unit exercises', () => {
    it('each multiple choice lists its answer among distinct options', () => {
        for (const e of allExercises.filter(e => e.type === 'multiple-choice')) {
            expect(e.options?.map(norm), e.id).toContain(norm(e.correctAnswer));
            expect(new Set(e.options?.map(norm)).size, e.id).toBe(e.options?.length);
        }
    });

    it('each word-order uses exactly the words of its answer', () => {
        for (const e of allExercises.filter(e => e.type === 'word-order')) {
            expect(words((e.scrambledWords ?? []).join(' ')), e.id).toEqual(words(e.correctAnswer));
        }
    });

    it('every exercise belongs to an existing unit and explains itself', () => {
        const ids = new Set(allUnits.map(u => u.id));
        for (const e of allExercises) {
            expect(ids.has(e.unitId), e.id).toBe(true);
            expect(e.explanation, e.id).toBeTruthy();
        }
    });
});

describe('review skills', () => {
    it('each option-based exercise lists its answer', () => {
        for (const s of allGrammarSkills) {
            s.exercises.forEach((e, i) => {
                if (e.options) expect(e.options.map(norm), `${s.id}#${i}`).toContain(norm(e.answer));
            });
        }
    });

    it('every lesson unit has at least five review items for its checkpoint', () => {
        for (const u of allUnits.filter(u => !u.isAssessment)) {
            const items = allGrammarSkills.filter(s => s.unitId === u.id).flatMap(s => s.exercises);
            expect(items.length, u.id).toBeGreaterThanOrEqual(5);
        }
    });
});

describe('stories', () => {
    const vocab = new Set(allVocabulary.map(v => v.id));

    it('every tappable word has a vocabulary entry', () => {
        for (const s of allStories) {
            for (const [, word] of s.content.matchAll(/data-word="([^"]+)"/g)) {
                expect(vocab.has(word), `${s.id}: ${word}`).toBe(true);
            }
        }
    });

    it('word count matches the text', () => {
        for (const s of allStories) {
            const real = s.content.replace(/<[^>]+>/g, ' ').match(/[A-Za-z']+/g)?.length ?? 0;
            expect(s.wordCount, s.id).toBe(real);
        }
    });
});

describe('assessments', () => {
    it('every question has a valid answer and distinct options', () => {
        for (const q of [...placementQuestions, ...cambridgeB1Questions, ...cambridgeB2Questions]) {
            expect(q.correctIndex, q.id).toBeGreaterThanOrEqual(0);
            expect(q.correctIndex, q.id).toBeLessThan(q.options.length);
            expect(new Set(q.options).size, q.id).toBe(q.options.length);
        }
    });
});

// ---------- Plan targets (cerebro/contenido/plan-ensenanza.md), enforced per rebuilt level/exam

describe('plan targets for rebuilt levels', () => {
    const index = buildLevelIndex(reference as ReferenceEntry[]);

    for (const level of ENFORCED_LEVELS) {
        describe(level, () => {
            const units = allUnits.filter(u => u.level === level && !u.isAssessment);
            const stories = allStories.filter(s => s.level === level);
            const deck = allVocabulary.filter(v => v.cefrLevel === level);
            const known = new Set(allVocabulary.filter(v => levelRank(v.cefrLevel) <= levelRank(level)).map(v => v.id));

            it(`has ${TARGETS.storiesPerUnit} stories per unit of about ${TARGETS.storyWords[level]} words`, () => {
                for (const u of units) {
                    expect(stories.filter(s => s.unitId === u.id).length, u.id).toBeGreaterThanOrEqual(TARGETS.storiesPerUnit);
                }
                for (const s of stories) expect(s.wordCount, s.id).toBeGreaterThanOrEqual(TARGETS.storyWords[level] * 0.8);
            });

            it(`keeps every story at ${TARGETS.minCoverage * 100}% known words or more`, () => {
                for (const s of stories) {
                    const report = storyCoverage(s.content, level, index, known);
                    expect(report.coverage, `${s.id} above level: ${report.aboveLevel.join(', ')}; unknown: ${report.unknown.join(', ')}`).toBeGreaterThanOrEqual(TARGETS.minCoverage);
                }
            });

            it(`teaches ${TARGETS.deckSize[level]} words, each seen in ${TARGETS.minEncounters}+ stories`, () => {
                expect(deck.length).toBeGreaterThanOrEqual(TARGETS.deckSize[level]);
                const pool = allStories.filter(s => levelRank(s.level) <= levelRank(level) + 1);
                for (const [id, n] of storyEncounters(pool, deck.map(v => v.id), index)) {
                    expect(n, id).toBeGreaterThanOrEqual(TARGETS.minEncounters);
                }
            });

            it('labels words with the CEFR-J level, by their dictionary form', () => {
                expect(checkVocabularyLevels(deck, index)).toEqual({ mismatched: [], notLemma: [], missing: [] });
            });
        });
    }

    it('has no templated or repeated questions in the rebuilt exam banks', () => {
        const banks = { placement: placementQuestions, cambridgeB1: cambridgeB1Questions, cambridgeB2: cambridgeB2Questions };
        for (const name of ENFORCED_EXAMS) {
            const qs = banks[name];
            expect(qs.filter(q => isTemplated(q.text)).map(q => q.id), name).toEqual([]);
            expect(new Set(qs.map(q => q.text)).size, name).toBe(qs.length);
        }
    });
});
