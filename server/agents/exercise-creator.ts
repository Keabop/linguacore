import { generateWithFallback } from '../lib/gemini.js';

interface ExerciseRequest {
  words: string[];
  level: string;
  type?: 'multiple-choice' | 'sentence-order' | 'context-match' | 'mixed';
}

interface MultipleChoiceExercise {
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface SentenceOrderExercise {
  type: 'sentence-order';
  scrambled: string[];
  correct: string;
  hint: string;
}

interface ContextMatchExercise {
  type: 'context-match';
  sentences: Array<{ sentence: string; blank: string }>;
  words: string[];
}

type Exercise = MultipleChoiceExercise | SentenceOrderExercise | ContextMatchExercise;

interface ExerciseSet {
  exercises: Exercise[];
  level: string;
}

export async function createExercise(params: ExerciseRequest): Promise<ExerciseSet> {
  const exerciseType = params.type || 'mixed';
  const wordList = params.words.slice(0, 8).join(', ');

  const prompt = `You are an English language exercise creator for Spanish-speaking learners at CEFR level ${params.level}.

Create ${exerciseType === 'mixed' ? '3 varied' : '3'} exercises using these vocabulary words: ${wordList}

Exercise types to use:
${exerciseType === 'mixed' ? '- Include one of each type: multiple-choice, sentence-order, context-match' : `- All exercises should be: ${exerciseType}`}

You MUST respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "exercises": [
    {
      "type": "multiple-choice",
      "question": "What does 'word' mean?",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation in Spanish why this is correct."
    },
    {
      "type": "sentence-order",
      "scrambled": ["goes", "she", "school", "to", "every", "day"],
      "correct": "She goes to school every day.",
      "hint": "Start with the subject (ella)"
    },
    {
      "type": "context-match",
      "sentences": [
        { "sentence": "I ___ to school every morning.", "blank": "walk" },
        { "sentence": "She ___ a book before bed.", "blank": "reads" }
      ],
      "words": ["walk", "reads", "plays"]
    }
  ],
  "level": "${params.level}"
}

Make exercises appropriate for ${params.level} level. Instructions and explanations should be in Spanish.`;

  const text = await generateWithFallback(prompt);

  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    console.error('[exercise-creator] Failed to parse JSON. Raw response:', text.substring(0, 500));
    throw new SyntaxError('Invalid JSON');
  }
}
