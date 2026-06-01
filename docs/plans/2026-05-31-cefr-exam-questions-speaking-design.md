# CEFR Exam Questions and Interactive Speaking Design

**Status:** APPROVED
**Date:** 2026-05-31
**Goal:** Expand and correct the simulated official exams (TOEFL, IELTS, Cambridge) to match realistic question counts (69 for Cambridge B1, 97 for Cambridge B2, 70 for TOEFL, 80 for IELTS), support multiple writing tasks, and implement a fully interactive simulated speaking section using Web Speech API synthesis and transcription.

---

## 1. Architectural Changes

### A. Database Support (Supabase)
To support storing the grades, feedback, and transcriptions of the new Speaking section, two new columns are registered in the `cefr_simulations` table:
*   `speaking_score` (INTEGER)
*   `speaking_feedback` (JSONB)

### B. High-Fidelity Static Question Pools
We partition the giant question pools into separate, specialized files to prevent bundling inflation and ensure modular code:
*   `src/data/assessments/toefl-questions.ts` (70 Questions, 2 Writing, 4 Speaking)
*   `src/data/assessments/ielts-questions.ts` (80 Questions, 2 Writing, 3 Speaking)
*   `src/data/assessments/cambridge-b1-questions.ts` (69 Questions, 2 Writing, 4 Speaking)
*   `src/data/assessments/cambridge-b2-questions.ts` (97 Questions, 2 Writing, 4 Speaking)

### C. Multi-Task Writing and Interactive Speech Synthesis/Transcription
*   **Multiple Writing Tasks:** The system supports `tasks` in `WritingPrompt` and renders a sequential stepper to complete Task 1, then Task 2, before moving to the oral section.
*   **Virtual Speaking Examiner:** The browser-native speech synthesis (`speak`) acts as a mock examiner reading the prompts. The browser speech recognition (`startListening` from `useSpeech.ts`) captures the candidate's oral answers in real-time, outputting clean transcripts to be scored by the Gemini 1.5 Pro evaluation service.

---

## 2. Technical Data Schemas

```typescript
export interface AssessmentQuestion {
    id: string;
    section: 'use-of-english' | 'reading' | 'listening';
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
    text: string;
    dialogue?: DialogueLine[];
    passage?: string;
    options: string[];
    correctIndex: number;
}

export interface WritingTask {
    id: string;
    title: string;
    prompt: string;
    targetWords: string;
    instructions: string;
}

export interface WritingPrompt {
    id: string;
    preset: 'toefl' | 'ielts' | 'cambridge_b1' | 'cambridge_b2';
    tasks: WritingTask[];
}

export interface SpeakingTask {
    id: string;
    title: string;
    prompt: string;
    instructions: string;
    timeSeconds: number;
}

export interface SpeakingPrompt {
    id: string;
    preset: 'toefl' | 'ielts' | 'cambridge_b1' | 'cambridge_b2';
    tasks: SpeakingTask[];
}
```

---

## 3. Web UI Flow

1.  **Selection state:** Shows selection between B1, B2, TOEFL, IELTS, and placement test.
2.  **Testing state:** Sequential multiple-choice questions for Use of English, Reading, and Listening.
3.  **Writing state:** Multi-task essay drafting panel.
4.  **Speaking state:** Active microphone recording + examiner voice reading out tasks sequentially.
5.  **Grading state:** Spinner showing AI analyzing all tasks (Multiple Choice + Essays + Transcripts).
6.  **Results Dashboard:** Render overall CEFR levels and a radar chart covering all 5 metrics (Reading, Listening, Use of English, Writing, Speaking).
