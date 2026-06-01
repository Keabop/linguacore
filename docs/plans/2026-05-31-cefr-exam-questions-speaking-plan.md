# CEFR Exam Questions and Interactive Speaking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Correct and expand the CEFR exam simulator to support B1 and B2 Cambridge, TOEFL, and IELTS presets with authentic, massive question banks, support sequential multi-task writing, and implement an interactive simulated speaking section using browser-native speech synthesis and speech recognition.

**Architecture:**
1. **Dynamic Datasets:** Separate TypeScript files store all 300+ questions, reading passages, dialogue scripts, writing tasks, and speaking prompts per preset.
2. **Interactive Examiner & Speech Capture:** Use browser `speechSynthesis` to vocalize examiner prompts, and `speechRecognition` (Web Speech API) to record and transcribe oral answers in real-time.
3. **AI Speaking & Writing Evaluator:** Re-route essays and speech transcripts to a unified evaluation call utilizing Gemini 1.5 Pro to return academic feedback.
4. **Enhanced Visual Radar:** SVG dashboard displaying Reading, Listening, Use of English, Writing, and Speaking skills dynamically.

**Tech Stack:** React 19, TypeScript, Lucide Icons, Tailwind CSS v4, Web Speech API (Synthesis + Recognition), Supabase.

---

### Task 1: Database Migration for Speaking Metrics

**Files:**
- Create: `supabase-migrations/add-speaking-columns.sql`

**Step 1: Write minimal implementation**
Create the migration script to add speaking score and feedback columns.

Create `supabase-migrations/add-speaking-columns.sql`:
```sql
-- Migration: Add speaking metrics columns to cefr_simulations table
-- Run in: Supabase Dashboard -> SQL Editor

ALTER TABLE cefr_simulations 
  ADD COLUMN IF NOT EXISTS speaking_score INTEGER,
  ADD COLUMN IF NOT EXISTS speaking_feedback JSONB;
```

**Step 2: Commit**
```bash
git add supabase-migrations/add-speaking-columns.sql
git commit -m "db: add speaking columns migration script"
```

---

### Task 2: Question Banks Generation Script and Data Exports

**Files:**
- Create: `scratch/generate-question-banks.py`
- Create: `src/data/assessments/cambridge-b1-questions.ts`
- Create: `src/data/assessments/cambridge-b2-questions.ts`
- Create: `src/data/assessments/toefl-questions.ts`
- Create: `src/data/assessments/ielts-questions.ts`

**Step 1: Write and execute the script**
Write a Python script that programmatically generates 300+ authentic, grammatically correct and diverse multiple choice questions, reading passages, listening conversations with speakers, writing tasks, and speaking tasks. Run the script to export the TypeScript files.

Create `scratch/generate-question-banks.py`:
```python
import json
import os

def generate_questions():
    # Helper to generate structural templates for Use of English, Reading, and Listening
    # to guarantee exact quantities requested:
    # - Cambridge B1: 32 Reading, 25 Listening, 2 Writing, 4 Speaking
    # - Cambridge B2: 52 Reading/Use of English, 30 Listening, 2 Writing, 4 Speaking
    # - TOEFL: 30 Reading, 28 Listening, 2 Writing, 4 Speaking
    # - IELTS: 40 Reading, 40 Listening, 2 Writing, 3 Speaking

    # Let's ensure directories exist
    os.makedirs("src/data/assessments", exist_ok=True)

    # Cambridge B1 Question generation
    # ...
    # We will write the full python generator here
```

*(Detailed script structure is detailed inside the implementation script. We will run this script to ensure rich, premium academic content is written directly to the target TypeScript files).*

**Step 2: Run the script**
Run: `python scratch/generate-question-banks.py`
Expected: Files `src/data/assessments/cambridge-b1-questions.ts`, `src/data/assessments/cambridge-b2-questions.ts`, `src/data/assessments/toefl-questions.ts`, and `src/data/assessments/ielts-questions.ts` are successfully created with correct typescript exports.

**Step 3: Commit**
```bash
git add src/data/assessments/
git commit -m "feat: export massive official exam question banks"
```

---

### Task 3: AI Evaluator Extension for Writing and Speaking

**Files:**
- Modify: `src/lib/ai.ts`

**Step 1: Write minimal implementation**
Enhance the AI helpers to evaluate the transcripts from the Speaking section and the multi-task essays using Gemini 1.5 Pro.

Modify `src/lib/ai.ts` (appending at the end):
```typescript
export interface SpeakingCorrection {
    phrase: string;
    suggestion: string;
    explanation: string;
}

export interface SpeakingEvaluationResponse {
    score: number;
    corrections: SpeakingCorrection[];
    pronunciationScore: number;
    fluencyScore: number;
    vocabularyScore: number;
    detailedFeedback: string;
}

export async function evaluateSpeaking(
    transcripts: string[],
    prompts: string[],
    level: string
): Promise<SpeakingEvaluationResponse> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) throw new Error('API key missing');

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
    Eres un examinador de inglés oficial de Cambridge y TOEFL. Evalúa las siguientes respuestas habladas (transcritas a texto) para el nivel CEFR: "${level}".

    Preguntas/Prompts del examinador:
    ${prompts.map((p, i) => `[Pregunta ${i+1}]: ${p}`).join('\n')}

    Respuestas transcritas del candidato:
    ${transcripts.map((t, i) => `[Respuesta ${i+1}]: ${t}`).join('\n')}

    Genera un informe analítico riguroso. Debes retornar un JSON con este formato exacto:
    {
      "score": 85, // puntuación general (0-100)
      "pronunciationScore": 80, // (0-100)
      "fluencyScore": 85, // (0-100)
      "vocabularyScore": 90, // (0-100)
      "detailedFeedback": "retroalimentación general en español",
      "corrections": [
        {
          "phrase": "frase con error o mejorable",
          "suggestion": "sugerencia corregida",
          "explanation": "explicación en español del error"
        }
      ]
    }
    `;

    const response = await model.generateContent(prompt);
    return JSON.parse(response.response.text()) as SpeakingEvaluationResponse;
}
```

**Step 2: Commit**
```bash
git add src/lib/ai.ts
git commit -m "feat: add AI speaking evaluation helper using Gemini"
```

---

### Task 4: Interactive Speaking Section and Multi-Task Writing UI

**Files:**
- Modify: `src/pages/CEFRSimulator.tsx`

**Step 1: Write minimal implementation**
1. Import the new datasets (`cambridgeB1Questions`, `cambridgeB2Questions`, `toeflQuestions`, `ieltsQuestions`).
2. Add `speaking` into the `PageState` types.
3. Update `presets` to include both Cambridge B1 and B2, and configure correct question/time properties.
4. Implement a multi-step writing UI where the user completes Task 1 and Task 2 sequentially.
5. Implement the interactive simulated Speaking panel using browser `speechSynthesis` to read prompts, and `useSpeech` hook to record and display candidate voice transcripts.

**Step 2: Commit**
```bash
git add src/pages/CEFRSimulator.tsx
git commit -m "feat: build interactive speaking examiner and multi-task writing panels"
```

---

### Task 5: Upgrade Results Dashboard

**Files:**
- Modify: `src/pages/CEFRSimulator.tsx`

**Step 1: Write minimal implementation**
1. Display both Writing feedback and Speaking feedback metrics inside the Dashboard panel.
2. Upgrade the SVG Radar Chart to render 5 axes representing: Reading, Listening, Use of English, Writing, and Speaking skills.
3. Save Speaking scores and feedback along with Writing scores into Supabase `cefr_simulations` table, falling back gracefully if the database columns are not yet present.

**Step 2: Commit**
```bash
git add src/pages/CEFRSimulator.tsx
git commit -m "feat: upgrade CEFR dashboard to render 5-axis skills radar"
```

---

### Task 6: Compilation and Verification

**Step 1: Run build**
Run: `npm run build`
Expected: Zero TypeScript or compilation errors. The application compiles clean.
