/**
 * Official marking criteria of each exam the simulator gives. The client sends only the exam's
 * id; the criteria are chosen here, so nothing the client writes reaches the evaluators' prompt.
 */
export const EXAM_CRITERIA = {
    ielts: {
        writing: ['Task Achievement / Task Response', 'Coherence and Cohesion', 'Lexical Resource', 'Grammatical Range and Accuracy'],
        speaking: ['Fluency and Coherence', 'Lexical Resource', 'Grammatical Range and Accuracy', 'Pronunciation'],
    },
    toefl: {
        writing: ['Task completion and relevance', 'Organization and development', 'Language use'],
        speaking: ['Delivery', 'Language use', 'Topic development'],
    },
    cambridge_b1: {
        writing: ['Content', 'Communicative Achievement', 'Organisation', 'Language'],
        speaking: ['Grammar and Vocabulary', 'Discourse Management', 'Pronunciation', 'Interactive Communication'],
    },
    cambridge_b2: {
        writing: ['Content', 'Communicative Achievement', 'Organisation', 'Language'],
        speaking: ['Grammar and Vocabulary', 'Discourse Management', 'Pronunciation', 'Interactive Communication'],
    },
} as const;

export type CriteriaExam = keyof typeof EXAM_CRITERIA;

export const isCriteriaExam = (value: unknown): value is CriteriaExam =>
    typeof value === 'string' && Object.prototype.hasOwnProperty.call(EXAM_CRITERIA, value);

/** One criterion as the evaluators report it: its band from 0 to 5 and a note in Spanish. */
export interface CriterionScore {
    name: string;
    band: number;
    note: string;
}

/** Prompt lines asking for the exam's criteria, and the JSON field that reports them. */
export function criteriaInstructions(criteria: readonly string[]): { rules: string; field: string } {
    return {
        rules: `Score with the official criteria of this exam, each from 0 to 5 and with equal weight: ${criteria.join('; ')}. The overall "score" is their average as a percentage (average × 20).`,
        field: `"criteria": [${criteria.map(name => `{ "name": "${name}", "band": 3, "note": "Nota en español sobre este criterio" }`).join(', ')}]`,
    };
}
