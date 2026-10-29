import { generateWithFallback } from '../lib/gemini.js';
import { EXAM_CRITERIA, criteriaInstructions, isCriteriaExam, type CriterionScore } from '../lib/examCriteria.js';
import { descriptorRubric, toCefrLevel } from '../lib/cefrDescriptors.js';

interface SpeakingEvaluationRequest {
    transcripts: string[];
    prompts: string[];
    level: string;
    /** The simulator's exam: the score uses its official speaking criteria. */
    exam?: string;
}

interface SpeakingEvaluation {
    score: number;
    corrections: Array<{ phrase: string; suggestion: string; explanation: string }>;
    pronunciationScore: number;
    fluencyScore: number;
    vocabularyScore: number;
    detailedFeedback: string;
    /** One entry per official criterion, when an exam was given. */
    criteria?: CriterionScore[];
}

export async function evaluateSpeaking(params: SpeakingEvaluationRequest): Promise<SpeakingEvaluation> {
    const exam = isCriteriaExam(params.exam) ? criteriaInstructions(EXAM_CRITERIA[params.exam].speaking) : null;
    const level = toCefrLevel(params.level);
    const prompt = `Eres un examinador de inglés oficial (Cambridge/TOEFL). Evalúa las siguientes respuestas habladas (transcritas) para el nivel CEFR: "${level}".

${descriptorRubric(level, 'speaking')}
Son transcripciones automáticas: no penalices la puntuación ni las mayúsculas.

Prompts del examinador:
${params.prompts.map((p, i) => `[Pregunta ${i + 1}]: ${p}`).join('\n')}

Respuestas transcritas del candidato:
${params.transcripts.map((t, i) => `[Respuesta ${i + 1}]: ${t}`).join('\n')}
${exam ? `\n${exam.rules} Las notas van en español.\n` : ''}
Genera un informe analítico riguroso. Responde SOLO con JSON válido (sin markdown ni bloques de código) con este formato exacto:
{
  "score": 85,
  "pronunciationScore": 80,
  "fluencyScore": 85,
  "vocabularyScore": 90,
  "detailedFeedback": "retroalimentación general en español",
  "corrections": [
    {
      "phrase": "frase con error",
      "suggestion": "sugerencia corregida",
      "explanation": "explicación del error"
    }
  ]${exam ? `,
  ${exam.field}` : ''}
}`;

    const text = await generateWithFallback(prompt);

    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        console.error('[speaking-evaluator] Failed to parse JSON. Raw response:', text.substring(0, 500));
        throw new SyntaxError('Invalid JSON');
    }
}
