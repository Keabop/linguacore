// End-of-level exam: one review item per lesson unit (from the unit's own exercises), then the
// level's new transfer items, a reading and a listening (src/data/assessments/level-final).
import type { GrammarExercise, Unit } from '../db';
import type { AssessmentQuestion, ExamLevel, ExamResponse } from './types';
import type { LevelFinalBank } from '../../data/assessments/level-final';
import { grade, marksOf, normalizeAnswer } from './grading';
import { validateQuestion } from './validate';
import { isMultipleChoice } from './types';

/** Score needed to pass the level and unlock the next one, in %. */
export const LEVEL_FINAL_PASS = 80;

const levelOfUnit = (unitId: string) => unitId.slice(0, 2).toUpperCase() as ExamLevel;

/** A unit exercise as an exam question. Word-order pieces keep their punctuation: a "?" tells a question. */
export function exerciseToQuestion(ex: GrammarExercise): AssessmentQuestion {
    const base = { id: ex.id, section: 'use-of-english' as const, task: 'Grammar', level: levelOfUnit(ex.unitId), unitId: ex.unitId };
    switch (ex.type) {
        case 'multiple-choice': {
            const options = ex.options ?? [];
            return { ...base, text: ex.question, options, correctIndex: options.findIndex(o => normalizeAnswer(o) === normalizeAnswer(ex.correctAnswer)) };
        }
        case 'fill-blank':
            return { ...base, kind: 'gap', text: ex.question, answers: [ex.correctAnswer] };
        case 'word-order':
            return { ...base, kind: 'build-sentence', text: ex.question, answer: ex.correctAnswer, pieces: ex.scrambledWords ?? [] };
    }
}

const pick = <T,>(items: T[], random: () => number): T => items[Math.floor(random() * items.length)];

function shuffled<T>(items: readonly T[], random: () => number): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/** Options in a new order, the right index moved with them. */
function withShuffledOptions(q: AssessmentQuestion, random: () => number): AssessmentQuestion {
    if (!isMultipleChoice(q) || q.fixedOrder) return q;
    const order = shuffled(q.options.map((_, i) => i), random);
    return { ...q, options: order.map(i => q.options[i]), correctIndex: order.indexOf(q.correctIndex) };
}

export interface LevelFinalSource {
    /** The level's lesson units (not the assessment unit). */
    units: Unit[];
    exercises: GrammarExercise[];
    bank: LevelFinalBank;
}

/**
 * The exam, in order: grammar (one review item per unit and the transfer items, mixed), then the
 * reading and the listening. Options are shuffled.
 */
export function buildLevelFinal({ units, exercises, bank }: LevelFinalSource, random: () => number = Math.random): AssessmentQuestion[] {
    const review = units.flatMap(u => {
        const usable = exercises.filter(e => e.unitId === u.id).map(exerciseToQuestion).filter(q => validateQuestion(q).length === 0);
        return usable.length ? [pick(usable, random)] : [];
    });
    return [...shuffled([...review, ...bank.transfer], random), ...bank.reading, ...bank.listening].map(q => withShuffledOptions(q, random));
}

export interface LevelFinalResult {
    /** 0–100. */
    score: number;
    passed: boolean;
    /** Units with at least one wrong item, the most missed first. */
    weakUnits: string[];
}

export function levelFinalResult(questions: AssessmentQuestion[], responses: Record<string, ExamResponse>): LevelFinalResult {
    const total = questions.reduce((n, q) => n + marksOf(q), 0);
    const earned = questions.reduce((n, q) => n + grade(q, responses[q.id]), 0);
    const score = total ? Math.round((earned / total) * 100) : 0;
    const missed = new Map<string, number>();
    for (const q of questions) {
        if (q.unitId && grade(q, responses[q.id]) < marksOf(q)) missed.set(q.unitId, (missed.get(q.unitId) ?? 0) + 1);
    }
    return {
        score,
        passed: score >= LEVEL_FINAL_PASS,
        weakUnits: [...missed.entries()].sort((a, b) => b[1] - a[1]).map(([u]) => u),
    };
}
