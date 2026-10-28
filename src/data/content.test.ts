// Integrity of the teaching content: every item must be answerable as written.
import { describe, expect, it } from 'vitest';
import { allExercises, allGrammarSkills, allStories, allUnits, allVocabulary } from './index';
import { placementBlocks, placementQuestions } from './assessments/placement';
import { cambridgeB1Questions, cambridgeB1Speaking, cambridgeB1Writing } from './assessments/cambridge/b1';
import { cambridgeB2Questions, cambridgeB2Speaking, cambridgeB2Writing } from './assessments/cambridge/b2';
import { ieltsQuestions, ieltsSpeaking, ieltsWriting } from './assessments/ielts-questions';
import { toeflQuestions, toeflSpeaking, toeflWriting } from './assessments/toefl-questions';
import { marksOf, parseCompleteWords } from '../lib/exam/grading';
import { validateExamStructure, validateQuestion } from '../lib/exam/validate';
import reference from '../../content/reference/cefrj-vocabulary.json';
import {
    ENFORCED_EXAMS, ENFORCED_LEVELS, TARGETS, buildLevelIndex, checkVocabularyLevels, isTemplated, levelRank, questionKey, storyCoverage,
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
    it('every question is answerable as written', () => {
        for (const q of [...placementQuestions, ...cambridgeB1Questions, ...cambridgeB2Questions, ...ieltsQuestions, ...toeflQuestions]) {
            expect(validateQuestion(q), q.id).toEqual([]);
        }
    });

    it('lays out adaptive sections as router, then lower and upper stages', () => {
        for (const bank of [placementQuestions, cambridgeB1Questions, cambridgeB2Questions, ieltsQuestions, toeflQuestions]) {
            expect(validateExamStructure(bank)).toEqual([]);
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
        const banks = { placement: placementQuestions, cambridgeB1: cambridgeB1Questions, cambridgeB2: cambridgeB2Questions, ielts: ieltsQuestions, toefl: toeflQuestions };
        for (const name of ENFORCED_EXAMS) {
            const qs = banks[name];
            expect(qs.filter(q => isTemplated(q.text)).map(q => q.id), name).toEqual([]);
            expect(new Set(qs.map(questionKey)).size, name).toBe(qs.length);
        }
    });
});

describe('placement test', () => {
    type PQ = (typeof placementQuestions)[number];
    const mc = placementQuestions.filter((q): q is Extract<PQ, { correctIndex: number }> => 'correctIndex' in q);

    it('has 15 items per level from A1 to C1, in three blocks of five', () => {
        for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
            const blocks = placementBlocks.filter(b => b.level === level);
            expect(blocks.map(b => b.questions.length), level).toEqual([5, 5, 5]);
            expect(blocks.flatMap(b => b.questions).every(q => q.level === level), level).toBe(true);
        }
    });

    it('mixes grammar, vocabulary, reading and listening in every block', () => {
        for (const b of placementBlocks) {
            expect(b.questions.map(q => q.task), b.id).toEqual(['Grammar', 'Grammar', 'Vocabulary', 'Reading', 'Listening']);
        }
    });

    it('quotes the evidence of every reading and listening answer', () => {
        for (const q of placementQuestions) {
            if (q.section !== 'use-of-english') expect(q.evidence, q.id).toBeTruthy();
        }
    });

    it('does not give the answer away as the longest option', () => {
        // The simulator shuffles the options, so only their length could give the answer away
        const longest = mc.filter(q => q.options.every((o, i) => i === q.correctIndex || o.length < q.options[q.correctIndex].length));
        expect(longest.map(q => q.id).length / mc.length).toBeLessThanOrEqual(0.25);
        const comprehension = mc.filter(q => q.section !== 'use-of-english');
        expect(comprehension.filter(q => longest.includes(q)).map(q => q.id).length / comprehension.length).toBeLessThanOrEqual(0.33);
    });
});

describe('IELTS Academic simulator', () => {
    const listening = ieltsQuestions.filter(q => q.section === 'listening');
    const reading = ieltsQuestions.filter(q => q.section === 'reading');
    const sizes = (qs: typeof ieltsQuestions) => [...new Set(qs.map(q => q.group))].map(g => qs.filter(q => q.group === g).length);

    it('has the real structure: 4 listening parts of 10 and 3 passages, 40 questions each', () => {
        expect(sizes(listening)).toEqual([10, 10, 10, 10]);
        expect(sizes(reading)).toEqual([13, 13, 14]);
        expect(ieltsQuestions.slice(0, 40).every(q => q.section === 'listening')).toBe(true);
    });

    it('uses passages of exam length', () => {
        for (const passage of new Set(reading.map(q => q.passage))) {
            expect(passage!.split(/\s+/).length).toBeGreaterThanOrEqual(700);
        }
    });

    it('quotes the evidence of every answer (not-given items have none to quote)', () => {
        for (const q of ieltsQuestions) {
            const notGiven = q.kind === 'tfng' && q.answer === 'not-given';
            expect(Boolean(q.evidence), q.id).toBe(!notGiven);
        }
    });

    it('asks in the order of the recording, and of the text within each block of a type', () => {
        const flat = (t: string) => t.toLowerCase().replace(/\s+/g, ' ');
        const position = (q: (typeof ieltsQuestions)[number]) => {
            const source = flat(q.passage ?? q.dialogue!.map(l => l.text).join(' '));
            return source.indexOf(flat(q.evidence!));
        };
        for (const group of new Set(ieltsQuestions.map(q => q.group))) {
            const qs = ieltsQuestions.filter(q => q.group === group && q.evidence);
            // Listening follows the recording throughout; reading restarts with each block of a type
            const blocks = qs[0].section === 'listening' ? [qs] : qs.reduce<(typeof qs)[]>((acc, q, i) => {
                if (i === 0 || (q.kind ?? 'mc') !== (qs[i - 1].kind ?? 'mc')) acc.push([]);
                acc.at(-1)!.push(q);
                return acc;
            }, []);
            for (const block of blocks) {
                const positions = block.map(position);
                expect(positions, `${group}: ${block.map(q => q.id).join(', ')}`).toEqual([...positions].sort((a, b) => a - b));
            }
        }
    });

    it('mixes the question types of the real exam', () => {
        const kinds = new Set(ieltsQuestions.map(q => q.kind ?? 'mc'));
        expect([...kinds].sort()).toEqual(['gap', 'mc', 'tfng']);
    });

    it('gives Task 1 a chart to describe and Part 2 a cue card', () => {
        expect(ieltsWriting[0].chart?.series.length).toBeGreaterThan(1);
        expect(ieltsWriting[0].chart?.series.every(s => s.values.length === ieltsWriting[0].chart!.categories.length)).toBe(true);
        expect(ieltsSpeaking.map(s => s.title.slice(0, 6))).toEqual(['Part 1', 'Part 2', 'Part 3']);
        expect(ieltsSpeaking[1].cueCard?.length).toBeGreaterThanOrEqual(3);
    });
});

describe('TOEFL iBT simulator (2026 format)', () => {
    type TQ = (typeof toeflQuestions)[number];
    const of = (section: string, stage: string) => toeflQuestions.filter(q => q.section === section && q.stage === stage);
    const STAGES = ['router', 'lower', 'upper'];

    it('runs Reading and Listening in two modules, then Build a Sentence', () => {
        const order = [...new Set(toeflQuestions.map(q => q.section))];
        expect(order).toEqual(['reading', 'listening', 'use-of-english']);
        for (const section of ['reading', 'listening']) {
            for (const stage of STAGES) expect(of(section, stage).length, `${section} ${stage}`).toBeGreaterThanOrEqual(11);
        }
        expect(toeflQuestions.filter(q => q.kind === 'build-sentence')).toHaveLength(10);
    });

    it('gives every Reading module the three tasks: Complete the Words, two daily texts and an academic passage', () => {
        for (const stage of STAGES) {
            const qs = of('reading', stage);
            expect(qs.filter(q => q.kind === 'complete-words'), stage).toHaveLength(1);
            expect(new Set(qs.filter(q => q.task === 'Read in Daily Life').map(q => q.group)).size, stage).toBe(2);
            const academic = [...new Set(qs.filter(q => q.task === 'Read an Academic Passage').map(q => q.passage!))];
            expect(academic, stage).toHaveLength(1);
            const words = academic[0].split(/\s+/).length;
            expect(words, stage).toBeGreaterThanOrEqual(150);
            expect(words, stage).toBeLessThanOrEqual(250);
        }
    });

    it('cuts the second half of ten words after an intact first sentence', () => {
        for (const q of toeflQuestions.filter(q => q.kind === 'complete-words')) {
            const parts = parseCompleteWords(q.text);
            const gaps = parts.filter(p => typeof p !== 'string');
            expect(gaps, q.id).toHaveLength(10);
            for (const g of gaps) expect(g.shown.length, `${q.id}: ${g.shown}[${g.missing}]`).toBe(Math.floor((g.shown + g.missing).length / 2));
            expect(typeof parts[0] === 'string' && /^[^[]+?[.!?]\s/.test(parts[0]), q.id).toBe(true);
        }
    });

    it('gives every Listening module the four tasks', () => {
        for (const stage of STAGES) {
            const tasks = of('listening', stage).map(q => q.task);
            expect(tasks.filter(t => t === 'Listen and Choose a Response'), stage).toHaveLength(5);
            for (const task of ['Listen to a Conversation', 'Listen to an Announcement', 'Listen to an Academic Talk']) {
                expect(tasks.filter(t => t === task).length, `${stage} ${task}`).toBeGreaterThanOrEqual(2);
            }
        }
    });

    it('quotes the evidence of every answer, in the order of the text or recording', () => {
        const flat = (t: string) => t.toLowerCase().replace(/\s+/g, ' ');
        const position = (q: TQ) => flat(q.passage ?? q.dialogue!.map(l => l.text).join(' ')).indexOf(flat(q.evidence!));
        const answered = toeflQuestions.filter(q => q.kind !== 'complete-words' && q.kind !== 'build-sentence');
        for (const q of answered) expect(q.evidence, q.id).toBeTruthy();
        for (const group of new Set(answered.map(q => q.group).filter(Boolean))) {
            const positions = answered.filter(q => q.group === group).map(position);
            expect(positions, group).toEqual([...positions].sort((a, b) => a - b));
        }
    });

    it('spreads the right answer across the four positions', () => {
        const mc = toeflQuestions.filter((q): q is Extract<TQ, { correctIndex: number }> => 'correctIndex' in q);
        for (const i of [0, 1, 2, 3]) expect(mc.filter(q => q.correctIndex === i).length, `position ${i}`).toBeGreaterThanOrEqual(mc.length / 6);
    });

    it('does not give the answer away as the longest option', () => {
        const mc = toeflQuestions.filter((q): q is Extract<TQ, { correctIndex: number }> => 'correctIndex' in q);
        const longest = (qs: typeof mc) => qs.filter(q => q.options.every((o, i) => i === q.correctIndex || o.length < q.options[q.correctIndex].length)).length / qs.length;
        // Chance is 25%: well above it, picking the longest option scores without reading
        expect(longest(mc)).toBeLessThanOrEqual(0.33);
        expect(longest(mc.filter(q => q.section === 'listening'))).toBeLessThanOrEqual(0.33);
    });

    it('lists the Build a Sentence chunks out of order', () => {
        for (const q of toeflQuestions) {
            if (q.kind !== 'build-sentence') continue;
            expect(q.pieces.join(' ').toLowerCase(), q.id).not.toBe(q.answer.replace(/[.?!]$/, '').toLowerCase());
        }
    });

    it('has the email with its points, the discussion with its posts, and both Speaking tasks', () => {
        expect(toeflWriting.map(w => w.id)).toEqual(['w_toefl_email', 'w_toefl_discussion']);
        expect(toeflWriting[0].points).toHaveLength(3);
        expect(toeflWriting[1].discussion?.map(p => p.role)).toEqual(['professor', 'student', 'student']);
        expect(toeflSpeaking.filter(s => s.listenOnly)).toHaveLength(7);
        expect(toeflSpeaking.filter(s => !s.listenOnly).map(s => s.timeSeconds)).toEqual([45, 45, 45, 45]);
        // Listen and Repeat sentences grow longer, as in the exam
        const lengths = toeflSpeaking.filter(s => s.listenOnly).map(s => s.prompt.split(' ').length);
        expect(lengths).toEqual([...lengths].sort((a, b) => a - b));
    });
});

describe('Cambridge simulators', () => {
    type CQ = (typeof cambridgeB1Questions)[number];
    const EXAMS = [
        {
            name: 'B1 Preliminary', qs: cambridgeB1Questions, writing: cambridgeB1Writing, speaking: cambridgeB1Speaking,
            parts: { 'Reading Part 1': 5, 'Reading Part 2': 5, 'Reading Part 3': 5, 'Reading Part 4': 5, 'Reading Part 5': 6, 'Reading Part 6': 6, 'Listening Part 1': 7, 'Listening Part 2': 6, 'Listening Part 3': 6, 'Listening Part 4': 6 },
            cloze: ['Reading Part 5', 'Reading Part 6'],
            unordered: ['Reading Part 2'],
        },
        {
            name: 'B2 First', qs: cambridgeB2Questions, writing: cambridgeB2Writing, speaking: cambridgeB2Speaking,
            parts: { 'Reading and Use of English Part 1': 8, 'Reading and Use of English Part 2': 8, 'Reading and Use of English Part 3': 8, 'Reading and Use of English Part 4': 6, 'Reading and Use of English Part 5': 6, 'Reading and Use of English Part 6': 6, 'Reading and Use of English Part 7': 10, 'Listening Part 1': 8, 'Listening Part 2': 10, 'Listening Part 3': 5, 'Listening Part 4': 7 },
            cloze: ['Reading and Use of English Part 1', 'Reading and Use of English Part 2', 'Reading and Use of English Part 3', 'Reading and Use of English Part 4'],
            unordered: ['Reading and Use of English Part 7'],
        },
    ];
    const partOf = (q: CQ) => q.task!.split(':')[0];

    for (const exam of EXAMS) {
        describe(exam.name, () => {
            it('has the parts of the real exam, in order and with their number of questions', () => {
                const counts: Record<string, number> = {};
                for (const q of exam.qs) counts[partOf(q)] = (counts[partOf(q)] ?? 0) + 1;
                expect(counts).toEqual(exam.parts);
                expect(Object.keys(counts)).toEqual(Object.keys(exam.parts));
            });

            it('puts every cloze gap in its text exactly once', () => {
                for (const q of exam.qs.filter(q => exam.cloze.includes(partOf(q)) && q.passage)) {
                    const n = q.id.match(/\d+$/)![0];
                    expect(q.passage!.split(`(${n}) ________`).length - 1, q.id).toBe(1);
                }
            });

            it('quotes the evidence of every comprehension answer, in the order of the text or recording', () => {
                const flat = (t: string) => t.toLowerCase().replace(/\s+/g, ' ');
                const comprehension = exam.qs.filter(q => !exam.cloze.includes(partOf(q)));
                for (const q of comprehension) expect(q.evidence, q.id).toBeTruthy();
                for (const group of new Set(comprehension.filter(q => !exam.unordered.includes(partOf(q))).map(q => q.group))) {
                    const qs = comprehension.filter(q => q.group === group);
                    const positions = qs.map(q => flat(q.passage ?? q.dialogue!.map(l => l.text).join(' ')).indexOf(flat(q.evidence!)));
                    expect(positions, group).toEqual([...positions].sort((a, b) => a - b));
                }
            });

            it('does not give answers away by position or length', () => {
                // Single-word cloze options say nothing by their length; sentences can
                const mc = exam.qs.filter((q): q is Extract<CQ, { correctIndex: number }> => 'correctIndex' in q && !q.fixedOrder && !exam.cloze.includes(partOf(q)));
                for (const i of [0, 1, 2]) expect(mc.filter(q => q.correctIndex === i).length, `position ${i}`).toBeGreaterThanOrEqual(mc.length / 6);
                const longest = mc.filter(q => q.options.every((o, i) => i === q.correctIndex || o.length < q.options[q.correctIndex].length)).length;
                expect(longest / mc.length).toBeLessThanOrEqual(0.35);
            });

            it('weighs the papers as Cambridge reports them', () => {
                const marks = (section: string) => exam.qs.filter(q => q.section === section).reduce((n, q) => n + marksOf(q), 0);
                if (exam.name === 'B2 First') {
                    // Reading: Parts 1 and 5 to 7 (8 + 12 + 12 + 10); Use of English: Parts 2 to 4 (8 + 8 + 12)
                    expect([marks('reading'), marks('use-of-english')]).toEqual([42, 28]);
                } else {
                    expect([marks('reading'), marks('listening')]).toEqual([32, 25]);
                }
            });

            it('has Writing with notes and a choice of tasks, and the four Speaking parts', () => {
                expect(exam.writing[0].points?.length).toBeGreaterThanOrEqual(3);
                expect(exam.writing[1].choices?.length).toBeGreaterThanOrEqual(2);
                expect(exam.speaking.map(t => t.title.slice(0, 15))).toEqual(['Speaking Part 1', 'Speaking Part 2', 'Speaking Part 3', 'Speaking Part 4']);
            });
        });
    }
});
