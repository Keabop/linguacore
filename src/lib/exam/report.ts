import type { StageChoice } from './adaptive';
import {
    cambridgeScale, cefrFromCambridge, cefrFromIelts, cefrFromToefl, ieltsBand, ieltsOverall, placementLevel,
    toeflBand, toeflOverall, type CefrResult,
} from './bands';
import { ratioByLevel, scoreSections } from './grading';
import type { AssessmentQuestion, ExamResponse } from './types';

export type ExamId = 'placement' | 'toefl' | 'ielts' | 'cambridge_b1' | 'cambridge_b2';

export interface ExamReport {
    level: CefrResult;
    /** The exam's own score ("6.5", "4.5", "152"), labelled as an estimate in the UI. */
    headline: { label: string; value: string };
    /** One line per skill in the exam's own units. */
    breakdown: { skill: string; value: string }[];
    /** 0–100 per skill for the chart; null when the skill wasn't assessed. */
    percent: { reading: number | null; listening: number | null; useOfEnglish: number | null; writing: number | null; speaking: number | null };
    /** Mean of the assessed skills, 0–100. */
    overallPercent: number;
}

const pct = (r: number | null) => (r === null ? null : Math.round(r * 100));
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const fmt = (n: number) => (Number.isInteger(n) ? `${n}.0` : `${n}`);

/** IELTS-style band (1–9, halves) for an AI-graded skill scored 0–100. */
const ieltsFromPercent = (p: number) => Math.max(1, Math.min(9, Math.round((1 + (8 * p) / 100) * 2) / 2));

/**
 * Scores of a finished simulator. Writing and speaking come from the AI evaluation as 0–100,
 * or null when they weren't evaluated: they are then left out, never estimated from the rest.
 */
export function buildReport(
    exam: ExamId,
    questions: AssessmentQuestion[],
    responses: Record<string, ExamResponse>,
    stages: StageChoice,
    writing: number | null,
    speaking: number | null,
): ExamReport {
    const s = scoreSections(questions, responses);
    const percent = {
        reading: pct(s.reading.ratio),
        listening: pct(s.listening.ratio),
        useOfEnglish: pct(s['use-of-english'].ratio),
        writing,
        speaking,
    };
    const assessed = Object.values(percent).filter((v): v is number => v !== null);
    const overallPercent = assessed.length ? Math.round(mean(assessed)) : 0;
    const shown = (v: number | null, f: (n: number) => string) => (v === null ? 'sin evaluar' : f(v));

    if (exam === 'placement') {
        const byLevel = ratioByLevel(questions, responses);
        return {
            level: placementLevel(byLevel),
            headline: { label: 'Aciertos', value: `${overallPercent}%` },
            breakdown: Object.entries(byLevel).map(([lvl, r]) => ({ skill: `Preguntas ${lvl}`, value: `${Math.round(r * 100)}%` })),
            percent,
            overallPercent,
        };
    }

    if (exam === 'ielts') {
        const bands = {
            Listening: s.listening.total ? ieltsBand(s.listening.earned, s.listening.total, 'listening') : null,
            Reading: s.reading.total ? ieltsBand(s.reading.earned, s.reading.total, 'reading') : null,
            Writing: writing === null ? null : ieltsFromPercent(writing),
            Speaking: speaking === null ? null : ieltsFromPercent(speaking),
        };
        const overall = ieltsOverall(Object.values(bands).filter((b): b is number => b !== null));
        return {
            level: cefrFromIelts(overall),
            headline: { label: 'Banda IELTS estimada', value: fmt(overall) },
            breakdown: Object.entries(bands).map(([skill, b]) => ({ skill, value: shown(b, fmt) })),
            percent,
            overallPercent,
        };
    }

    if (exam === 'toefl') {
        // Build a Sentence items are part of TOEFL Writing
        const writingParts = [
            ...(s['use-of-english'].ratio !== null ? [toeflBand(s['use-of-english'].ratio)] : []),
            ...(writing !== null ? [toeflBand(writing / 100)] : []),
        ];
        const bands = {
            Reading: s.reading.ratio === null ? null : toeflBand(s.reading.ratio, stages.reading),
            Listening: s.listening.ratio === null ? null : toeflBand(s.listening.ratio, stages.listening),
            Writing: writingParts.length ? Math.round(mean(writingParts) * 2) / 2 : null,
            Speaking: speaking === null ? null : toeflBand(speaking / 100),
        };
        const overall = toeflOverall(Object.values(bands).filter((b): b is number => b !== null));
        return {
            level: cefrFromToefl(overall),
            headline: { label: 'Banda TOEFL estimada (1–6)', value: fmt(overall) },
            breakdown: Object.entries(bands).map(([skill, b]) => ({ skill, value: shown(b, fmt) })),
            percent,
            overallPercent,
        };
    }

    // Cambridge: every skill weighs the same; reading and use of English go together
    const variant = exam === 'cambridge_b1' ? 'b1' : 'b2';
    const readingAndUse = scoreSections(questions.filter(q => q.section !== 'listening'), responses);
    const readingRatio = (() => {
        const earned = readingAndUse.reading.earned + readingAndUse['use-of-english'].earned;
        const total = readingAndUse.reading.total + readingAndUse['use-of-english'].total;
        return total ? earned / total : null;
    })();
    const skills = {
        'Reading y Use of English': readingRatio,
        Listening: s.listening.ratio,
        Writing: writing === null ? null : writing / 100,
        Speaking: speaking === null ? null : speaking / 100,
    };
    const scales = Object.fromEntries(Object.entries(skills).map(([k, r]) => [k, r === null ? null : cambridgeScale(r, variant)]));
    const scored = Object.values(scales).filter((v): v is number => v !== null);
    const overall = Math.round(mean(scored));
    return {
        level: cefrFromCambridge(overall),
        headline: { label: 'Cambridge English Scale estimada', value: String(overall) },
        breakdown: Object.entries(scales).map(([skill, v]) => ({ skill, value: shown(v, String) })),
        percent,
        overallPercent,
    };
}
