import { isMultipleChoice, type AssessmentQuestion, type ExamResponse, type ExamSection } from './types';

/** Lower-case, single spaces, straight apostrophes, no punctuation at the edges. */
export function normalizeAnswer(text: string): string {
    return text
        .toLowerCase()
        .replace(/[’‘]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^[\s.,;:!?"'()-]+|[\s.,;:!?"'()-]+$/g, '');
}

/** Words of an answer; with `allowNumber`, figures ("14", "07946 381 205") don't count. */
export function countWords(answer: string, allowNumber = false): number {
    return normalizeAnswer(answer).split(' ').filter(w => w && !(allowNumber && /^\d[\d.,:]*(st|nd|rd|th)?$/.test(w))).length;
}

export interface WordGap {
    /** Letters shown to the learner. */
    shown: string;
    /** Letters the learner must write. */
    missing: string;
}

/** Splits a Complete-the-Words text into plain parts and gaps (`stu[dent]`). */
export function parseCompleteWords(text: string): (string | WordGap)[] {
    const parts: (string | WordGap)[] = [];
    let last = 0;
    for (const m of text.matchAll(/(\p{L}*)\[(\p{L}+)\]/gu)) {
        if (m.index! > last) parts.push(text.slice(last, m.index));
        parts.push({ shown: m[1], missing: m[2] });
        last = m.index! + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
}

const gapsOf = (text: string) => parseCompleteWords(text).filter((p): p is WordGap => typeof p !== 'string');

/** Marks a question is worth: one per missing word in Complete the Words, otherwise one. */
export function marksOf(q: AssessmentQuestion): number {
    return q.kind === 'complete-words' ? gapsOf(q.text).length : 1;
}

/** Marks earned by a response (0 when unanswered or of the wrong shape). */
export function grade(q: AssessmentQuestion, response: ExamResponse | undefined): number {
    if (response === undefined) return 0;
    if (isMultipleChoice(q)) return response === q.correctIndex ? 1 : 0;
    switch (q.kind) {
        case 'tfng':
            return response === q.answer ? 1 : 0;
        case 'gap': {
            if (typeof response !== 'string') return 0;
            const given = normalizeAnswer(response);
            if (q.maxWords && countWords(given, q.allowNumber) > q.maxWords) return 0;
            return q.answers.some(a => normalizeAnswer(a) === given) ? 1 : 0;
        }
        case 'complete-words': {
            if (!Array.isArray(response)) return 0;
            return gapsOf(q.text).filter((g, i) => normalizeAnswer(String(response[i] ?? '')) === g.missing.toLowerCase()).length;
        }
        case 'build-sentence': {
            if (!Array.isArray(response) || response.length !== q.pieces.length) return 0;
            const built = (response as number[]).map(i => q.pieces[i]).join(' ');
            return normalizeAnswer(built) === normalizeAnswer(q.answer) ? 1 : 0;
        }
    }
}

export interface SectionScore {
    earned: number;
    total: number;
    /** 0–1; null when the section had no questions. */
    ratio: number | null;
}

/** Marks per section. */
export function scoreSections(questions: AssessmentQuestion[], responses: Record<string, ExamResponse>): Record<ExamSection, SectionScore> {
    const out = {} as Record<ExamSection, SectionScore>;
    for (const section of ['use-of-english', 'reading', 'listening'] as ExamSection[]) {
        const qs = questions.filter(q => q.section === section);
        const total = qs.reduce((n, q) => n + marksOf(q), 0);
        const earned = qs.reduce((n, q) => n + grade(q, responses[q.id]), 0);
        out[section] = { earned, total, ratio: total ? earned / total : null };
    }
    return out;
}

/** Share of marks earned on each CEFR level's questions (placement). */
export function ratioByLevel(questions: AssessmentQuestion[], responses: Record<string, ExamResponse>): Record<string, number> {
    const out: Record<string, number> = {};
    for (const level of [...new Set(questions.map(q => q.level))]) {
        const qs = questions.filter(q => q.level === level);
        const total = qs.reduce((n, q) => n + marksOf(q), 0);
        out[level] = total ? qs.reduce((n, q) => n + grade(q, responses[q.id]), 0) / total : 0;
    }
    return out;
}
