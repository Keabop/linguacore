import { generateWithFallback } from '../lib/gemini.js';
import { EXAM_CRITERIA, criteriaInstructions, isCriteriaExam, type CriterionScore } from '../lib/examCriteria.js';
import { descriptorRubric, toCefrLevel } from '../lib/cefrDescriptors.js';

interface WritingEvaluationRequest {
    text: string;          // User's writing
    prompt: string;        // Original prompt/instruction
    level: string;         // CEFR level
    type: 'sentence-construction' | 'paragraph-completion' | 'free-writing' | 'error-correction';
    targetGrammar: string[];
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
- Target grammar patterns: ${params.targetGrammar.join(', ')}
- Original instruction: ${params.prompt}
${params.referenceAnswer ? `- Reference answer: ${params.referenceAnswer}` : ''}

STUDENT'S TEXT:
"${params.text}"

EVALUATION RULES:
${descriptorRubric(level, 'writing')}
${typeInstructions[params.type] || ''}

ALL feedback text (corrections explanations, notes, encouragement) MUST be in SPANISH.

${exam
    ? exam.rules
    : `Score breakdown:
- Grammar: 40% weight — accuracy of grammar, especially target patterns
- Vocabulary: 30% weight — range, appropriateness, spelling
- Coherence: 30% weight — logical flow, organization, clarity`}

You MUST respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "score": 75,
  "corrections": [
    {
      "original": "what the student wrote",
      "corrected": "the corrected version",
      "explanation": "Explicación en español de por qué es incorrecto",
      "type": "grammar",
      "example_variants": ["Correct example using the same pattern", "Another correct example"]
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

For each correction, include 2 "example_variants": additional correct sentences that demonstrate proper usage of the same pattern.
If the student's text is perfect or near-perfect, return an empty corrections array and high scores.
The "improvedVersion" should always be the best version of what the student was trying to say.`;

    const text = await generateWithFallback(prompt);

    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    let parsed: any;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        console.error('[writing-evaluator] Failed to parse JSON. Raw response:', text.substring(0, 500));
        throw new SyntaxError('Invalid JSON');
    }

    return {
        score: Math.max(0, Math.min(100, parsed.score || 0)),
        corrections: parsed.corrections || [],
        feedback: parsed.feedback || {
            grammar: { score: 0, note: '' },
            vocabulary: { score: 0, note: '' },
            coherence: { score: 0, note: '' },
        },
        improvedVersion: parsed.improvedVersion || params.text,
        encouragement: parsed.encouragement || '¡Sigue practicando!',
        ...(exam && Array.isArray(parsed.criteria) ? { criteria: parsed.criteria } : {}),
    };
}
