import { generateWithFallback } from '../lib/gemini.js';
import { EXAM_CRITERIA, criteriaInstructions, isCriteriaExam, type CriterionScore } from '../lib/examCriteria.js';
import { STUDENT_DATA_RULE, TASK_DATA_RULE, descriptorRubric, studentData, toCefrLevel } from '../lib/cefrDescriptors.js';

export const WRITING_TYPES = ['sentence-construction', 'paragraph-completion', 'free-writing', 'error-correction'] as const;

interface WritingEvaluationRequest {
    text: string;          // User's writing
    prompt: string;        // Original prompt/instruction
    level: string;         // CEFR level
    type: typeof WRITING_TYPES[number];
    targetGrammar?: string[];
    referenceAnswer?: string;
    /** The simulator's exam: its official criteria replace the default weighting. */
    exam?: string;
}

interface WritingCorrection {
    original: string;
    corrected: string;
    explanation: string;
    type: 'grammar' | 'vocabulary' | 'spelling' | 'style';
}

interface WritingEvaluationResponse {
    score: number;
    corrections: WritingCorrection[];
    feedback: {
        grammar: { score: number; note: string };
        vocabulary: { score: number; note: string };
        coherence: { score: number; note: string };
    };
    improvedVersion: string;
    encouragement: string;
    /** One entry per official criterion, when an exam was given. */
    criteria?: CriterionScore[];
}

/** A correction that only changes capitals, punctuation or spacing is not one. */
export function onlyMechanics(original: string, corrected: string): boolean {
    const bare = (text: string) => text.toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').trim();
    return bare(original) === bare(corrected);
}

const clampScore = (value: unknown) => Math.round(Math.max(0, Math.min(100, Number(value) || 0)));

export async function evaluateWriting(params: WritingEvaluationRequest): Promise<WritingEvaluationResponse> {
    const level = toCefrLevel(params.level);
    const exam = isCriteriaExam(params.exam) ? criteriaInstructions(EXAM_CRITERIA[params.exam].writing) : null;

    const typeInstructions: Record<string, string> = {
        'sentence-construction': `The student was asked to construct a sentence/translation. Compare their answer to the reference answer (if provided) and evaluate grammatical accuracy. Focus on whether they used the target grammar patterns correctly.`,
        'paragraph-completion': `The student completed a paragraph. Evaluate logical flow, grammar, and how well the completion fits the context. Check if target grammar patterns were used.`,
        'free-writing': `The student wrote freely on a topic. Evaluate grammar accuracy, vocabulary range and appropriateness, coherence/organization, and whether they attempted the target grammar patterns.`,
        'error-correction': `The student was given text with deliberate errors and asked to correct them. Evaluate how many errors they found and fixed correctly. Note any errors they missed or incorrectly "fixed."`,
    };

    const prompt = `You are an expert English writing evaluator for Spanish-speaking students learning English at CEFR level ${level}.

EVALUATION CONTEXT:
- Exercise type: ${params.type}
- Target grammar patterns: ${(params.targetGrammar ?? []).join(', ')}
- Original instruction (${TASK_DATA_RULE}):
${studentData('task', params.prompt)}
${params.referenceAnswer ? `- Reference answer (${TASK_DATA_RULE}):\n${studentData('reference_answer', params.referenceAnswer)}` : ''}

STUDENT'S TEXT (${STUDENT_DATA_RULE}):
${studentData('student_text', params.text)}

EVALUATION RULES:
${descriptorRubric(level, 'writing', { withScale: !exam })}
${typeInstructions[params.type] || ''}

ALL feedback text (corrections explanations, notes, encouragement) MUST be in SPANISH.

NOT ERRORS: capital letters, punctuation (commas, periods, a missing final period, question or
exclamation marks) and spacing. A missing apostrophe in a contraction ("dont") is spelling, so it counts. Never list them as corrections and never lower a score
for them. Only grammar, word choice and spelling of the words themselves count.

${exam
    ? exam.rules
    : `Score breakdown (each sub-score uses the bands above; an answer that does the task with no real
errors is "above" in grammar and vocabulary, so it scores 100 there):
- Grammar: 40% weight — accuracy of grammar, especially target patterns
- Vocabulary: 30% weight — range, appropriateness, spelling
- Coherence: 30% weight — logical flow, organization, clarity`}

You MUST respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "score": 70,
  "corrections": [
    {
      "original": "what the student wrote",
      "corrected": "the corrected version",
      "explanation": "Explicación en español de por qué es incorrecto",
      "type": "grammar",
      "example_variants": ["Another correct sentence using the same pattern"]
    }
  ],
  "feedback": {
    "grammar": { "score": 80, "note": "Nota en español sobre la gramática" },
    "vocabulary": { "score": 70, "note": "Nota en español sobre el vocabulario" },
    "coherence": { "score": 75, "note": "Nota en español sobre la coherencia" }
  },
  "improvedVersion": "The full text rewritten correctly with improvements",
  "encouragement": "Mensaje motivacional en español para el estudiante"${exam ? `,
  ${exam.field}` : ''}
}

For each correction, include 1 "example_variants" entry: another correct sentence with the same pattern.
If the student's text is perfect or near-perfect, return an empty corrections array and high scores.
The "improvedVersion" should always be the best version of what the student was trying to say, changing only what the corrections change.`;

    const text = await generateWithFallback(prompt, { temperature: 0 });

    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    let parsed: any;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        console.error('[writing-evaluator] Failed to parse JSON. Raw response:', text.substring(0, 500));
        throw new SyntaxError('Invalid JSON');
    }

    // The model's sub-scores end up whole numbers from 0 to 100, like the speaking ones
    const feedback = Object.fromEntries((['grammar', 'vocabulary', 'coherence'] as const).map(k => [k, {
        score: clampScore(parsed.feedback?.[k]?.score),
        note: typeof parsed.feedback?.[k]?.note === 'string' ? parsed.feedback[k].note : '',
    }])) as WritingEvaluationResponse['feedback'];
    // A reply without any sub-score falls back to the model's own number instead of a 0
    const hasSubScores = (['grammar', 'vocabulary', 'coherence'] as const).some(k => typeof parsed.feedback?.[k]?.score === 'number');
    const corrections: WritingCorrection[] = (Array.isArray(parsed.corrections) ? parsed.corrections : [])
        .filter((c: any) => typeof c?.original === 'string' && typeof c?.corrected === 'string' && !onlyMechanics(c.original, c.corrected));

    return {
        // Without an exam the score is the weighted sub-scores the learner sees (it used to be the
        // model's own number, which could say 79 under three 100s); an exam's comes from its criteria
        score: exam || !hasSubScores
            ? clampScore(parsed.score)
            : Math.round(feedback.grammar.score * 0.4 + feedback.vocabulary.score * 0.3 + feedback.coherence.score * 0.3),
        corrections,
        feedback,
        improvedVersion: parsed.improvedVersion || params.text,
        encouragement: parsed.encouragement || '¡Sigue practicando!',
        ...(exam && Array.isArray(parsed.criteria) ? { criteria: parsed.criteria } : {}),
    };
}
