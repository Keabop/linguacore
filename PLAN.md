# LinguaCore Output System — Implementation Plan

## Overview

Add a comprehensive **Output** (Writing + Speaking) system to LinguaCore. This extends the Input-focused learning (reading, vocabulary, grammar) with active production skills: writing exercises with AI feedback and speaking exercises with browser speech recognition.

### Integration Points
1. **UnitFlow Step**: New "Output" step between Exercises and Checkpoint (Grammar → Story → Vocab → Exercises → **Output** → Checkpoint)
2. **Dedicated Page**: `/practice` page for free-form writing & speaking practice independent of the Learning Path

---

## Phase 1: Database & Backend Foundation

### 1.1 — Database Schema Updates (`src/lib/db.ts`)

**New types:**

```typescript
type WritingType = 'sentence-construction' | 'paragraph-completion' | 'free-writing' | 'error-correction';
type SpeakingType = 'read-aloud' | 'oral-response';

interface WritingPrompt {
  id: string;              // e.g., "wp-a1-u1-1"
  unitId: string;
  type: WritingType;
  level: CEFRLevel;
  instruction: string;     // Spanish instruction for the student
  sourceText?: string;     // For sentence-construction: Spanish sentence to translate
  errorText?: string;      // For error-correction: English text with deliberate errors
  referenceAnswer?: string;// Model answer for comparison
  targetGrammar: string[]; // Grammar patterns that should appear (e.g., ["present simple", "to be"])
  wordLimit?: { min: number; max: number };
}

interface SpeakingPrompt {
  id: string;              // e.g., "sp-a1-u1-1"
  unitId: string;
  type: SpeakingType;
  level: CEFRLevel;
  instruction: string;     // Spanish instruction
  targetText?: string;     // For read-aloud: exact text to pronounce
  targetGrammar?: string[];// Expected grammar in oral response
}

interface WritingSubmission {
  id?: number;
  promptId: string;
  unitId: string;
  userText: string;
  score: number;           // 0-100
  corrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
    type: 'grammar' | 'vocabulary' | 'spelling' | 'style';
  }>;
  feedbackSummary: {
    grammar: { score: number; note: string };
    vocabulary: { score: number; note: string };
    coherence: { score: number; note: string };
  };
  improvedVersion: string;
  submittedAt: Date;
}

interface SpeakingSubmission {
  id?: number;
  promptId: string;
  unitId: string;
  transcript: string;      // What SpeechRecognition heard
  accuracyScore: number;   // 0-100 (word match for read-aloud)
  aiFeedback?: string;     // AI feedback for oral-response
  submittedAt: Date;
}
```

**New tables:**
- `writingPrompts`: id, unitId, type, level
- `speakingPrompts`: id, unitId, type, level
- `writingSubmissions`: ++id, promptId, unitId, submittedAt
- `speakingSubmissions`: ++id, promptId, unitId, submittedAt

**Updated type:**
- `UnitProgress.outputCompleted: boolean` (new field, default false)
- `UnitStep` union: add `'output'`

**Migration:** Dexie v5 schema with new tables + updated unitProgress index.

### 1.2 — New Gemini Agent: Writing Evaluator (`api/agents/writing-evaluator.ts`)

**Purpose:** Evaluate user's written English and provide detailed feedback in Spanish.

**Request:**
```typescript
{
  text: string;          // User's writing
  prompt: string;        // Original prompt/instruction
  level: CEFRLevel;
  type: WritingType;
  targetGrammar: string[];
  referenceAnswer?: string;
}
```

**Response:**
```typescript
{
  score: number;         // 0-100
  corrections: [{
    original: string;
    corrected: string;
    explanation: string; // In Spanish
    type: 'grammar' | 'vocabulary' | 'spelling' | 'style';
  }];
  feedback: {
    grammar: { score: number; note: string };    // Spanish
    vocabulary: { score: number; note: string };  // Spanish
    coherence: { score: number; note: string };   // Spanish
  },
  improvedVersion: string;  // Corrected full text
  encouragement: string;    // Motivational message in Spanish
}
```

**System prompt behavior:**
- Adapts strictness to CEFR level (A1 = very lenient, B2 = strict)
- All feedback/explanations in Spanish
- Focuses on `targetGrammar` patterns — checks if user used them
- `score` weighted: grammar 40%, vocabulary 30%, coherence 30%
- For `sentence-construction`: compares against referenceAnswer closely
- For `error-correction`: checks if all errors were found and fixed
- For `free-writing`: evaluates creativity, range, and accuracy
- For `paragraph-completion`: checks logical flow and grammar

### 1.3 — Update API Orchestrator & Frontend AI lib

- Register `writing-evaluator` in `api/orchestrator.ts` agent switch
- Add `evaluateWriting()` function to `src/lib/ai.ts`
- Add `WritingEvaluationResponse` type

---

## Phase 2: Writing Exercise System

### 2.1 — Writing Exercise Components

**`src/components/writing/SentenceConstruction.tsx`**
- Shows Spanish sentence + target grammar hint
- Textarea for English translation
- Word counter
- Submit → AI evaluation → feedback display

**`src/components/writing/ParagraphCompletion.tsx`**
- Shows paragraph context with a gap section
- User fills in 1-3 sentences to complete it
- Submit → AI evaluation

**`src/components/writing/FreeWriting.tsx`**
- Shows topic prompt + word limit guidance
- Large textarea with live word counter
- Grammar hints sidebar (what patterns to practice)
- Submit → AI evaluation → detailed feedback panel

**`src/components/writing/ErrorCorrection.tsx`**
- Shows English text with errors (highlighted differently)
- User rewrites corrected version
- Submit → compare original errors vs user's corrections
- Show which errors found/missed

### 2.2 — Writing Feedback Component (`src/components/writing/WritingFeedback.tsx`)

Reusable feedback display after AI evaluation:
- **Score ring** (0-100, color-coded: green/amber/red)
- **Corrections list**: original → corrected with explanation (like ConversationTutor corrections)
- **Category scores**: Grammar / Vocabulary / Coherence (mini progress bars)
- **Improved version**: expandable section showing the AI-corrected text
- **Encouragement message**: motivational text at bottom

### 2.3 — Writing Exercise Runner (`src/components/writing/WritingRunner.tsx`)

Orchestrator component (like ExerciseRunner but for writing):
- Cycles through 2-3 writing prompts per unit
- Progress indicator
- Submit each → get feedback → next
- Final score summary

---

## Phase 3: Speaking Exercise System

### 3.1 — Speech API Hook (`src/hooks/useSpeech.ts`)

```typescript
interface UseSpeechReturn {
  // Speech Recognition (STT)
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;     // Browser support check

  // Speech Synthesis (TTS)
  speak: (text: string, rate?: number) => void;
  isSpeaking: boolean;
  cancelSpeech: () => void;
}
```

- Uses `webkitSpeechRecognition` / `SpeechRecognition` API
- Language: `en-US` for recognition
- Handles interim results for live feedback
- Fallback message if browser doesn't support Speech API
- `speak()` uses `SpeechSynthesis` with English voice, adjustable rate per level

### 3.2 — Speaking Exercise Components

**`src/components/speaking/ReadAloud.tsx`**
- Displays target text (sentence or short paragraph)
- "Listen" button → TTS reads the text first (model pronunciation)
- "Record" button → starts SpeechRecognition
- Live transcript display while speaking
- On stop: compare transcript vs target text word-by-word
- Score: % of words correctly recognized
- Highlight matched (green) / missed (red) words
- Retry button

**`src/components/speaking/OralResponse.tsx`**
- Shows question/prompt in Spanish
- "Record" button → SpeechRecognition captures response
- Live transcript display
- On stop: send transcript to writing-evaluator agent (reuse!) for grammar/content evaluation
- Display feedback (similar to WritingFeedback but lighter)
- Retry button

### 3.3 — Speaking Runner (`src/components/speaking/SpeakingRunner.tsx`)

Orchestrator for speaking exercises:
- Cycles through 2-3 speaking prompts per unit
- Mix of read-aloud + oral-response
- Progress indicator
- Final accuracy summary

---

## Phase 4: UnitFlow Integration

### 4.1 — Update UnitFlow Steps

**Current:** Grammar → Story → Vocab → Exercises → Checkpoint
**New:** Grammar → Story → Vocab → Exercises → **Output** → Checkpoint

Changes to `src/pages/UnitFlow.tsx`:
- Add `'output'` to STEPS array with `Mic` icon
- Add step label: `output: 'Output'`
- Render `OutputStep` component when `currentStep === 'output'`

Changes to `src/hooks/useUnitProgress.ts`:
- Add `outputCompleted` to step determination logic
- After exercises → output step
- After output → checkpoint

### 4.2 — Output Step Component (`src/components/OutputStep.tsx`)

Tab-based UI within UnitFlow:
- **Tab 1: Writing** (PenLine icon) — WritingRunner with unit's writing prompts
- **Tab 2: Speaking** (Mic icon) — SpeakingRunner with unit's speaking prompts
- Both tabs must be completed to proceed
- Visual indicators showing which tab is done
- Combined score display
- "Continue" button enabled when both complete

### 4.3 — Update `markStepComplete` Flow

```
exercises complete → currentStep = 'output'
output complete (both writing + speaking) → currentStep = 'checkpoint'
```

---

## Phase 5: Dedicated Practice Page

### 5.1 — Practice Page (`src/pages/Practice.tsx`, route: `/practice`)

Free-form practice independent of Learning Path:

**Layout:**
- Toggle tabs: "Writing" / "Speaking"
- Level selector (A1-B2, defaults to user's current level)

**Writing Tab:**
- **Quick Practice** — AI generates a random prompt for the selected level
- **Topic Browser** — Choose from categories: Daily Life, Travel, Work, Opinion, Story
- Free writing area with word counter + grammar hints
- Submit → Full AI feedback panel
- History section: past submissions with scores (from writingSubmissions table)

**Speaking Tab:**
- **Read Aloud** — Random sentence/paragraph for the level, practice pronunciation
- **Speak About...** — Topic prompt, speak freely, get AI feedback on transcript
- Pronunciation score tracker
- History of attempts

### 5.2 — New Gemini Capability: Prompt Generation

Add to `writing-evaluator` agent (or a small addition to existing):
- Generate random writing prompts for a given level + topic category
- Returns: instruction, targetGrammar, wordLimit
- Used by the Practice page's "Quick Practice" feature

### 5.3 — Navigation Updates

- Add "Practice" to sidebar nav (6th item → 7th, or replace/reorganize)
- Icon: `PenLine` or `Mic` from lucide-react
- Mobile floating bar: add Practice icon
- Update `Layout.tsx` nav items

---

## Phase 6: Curriculum Data (Output Prompts)

### 6.1 — Writing Prompts Data

Create `src/data/output/` directory with writing prompts per level:
- `a1-writing.ts` — ~2-3 prompts per unit (22 units × 2 = ~44 prompts)
- `a2-writing.ts` — same structure
- `b1-writing.ts` — same structure
- `b2-writing.ts` — same structure

Each unit gets a mix:
- 1 sentence-construction (translate Spanish → English using unit grammar)
- 1 error-correction (fix errors related to unit grammar)
- 1 free-writing or paragraph-completion (topic related to unit theme)

**Total: ~132 writing prompts across 44 units (3 per unit)**

Distribution by type per level:
- A1: Heavy on sentence-construction (simpler), light on free-writing
- A2: Balanced sentence-construction + error-correction
- B1: More paragraph-completion + free-writing
- B2: Heavy on free-writing + complex error-correction

### 6.2 — Speaking Prompts Data

Create speaking prompts per level:
- `a1-speaking.ts` — ~2 prompts per unit
- `a2-speaking.ts` — same
- `b1-speaking.ts` — same
- `b2-speaking.ts` — same

Each unit gets:
- 1 read-aloud (sentence using unit vocabulary/grammar)
- 1 oral-response (answer a question using unit grammar/theme)

**Total: ~88 speaking prompts across 44 units (2 per unit)**

### 6.3 — Seed Updates (`src/lib/seed.ts`)

Seed writing + speaking prompts alongside existing curriculum data.

---

## Phase 7: Polish & i18n

### 7.1 — Translation Keys (`src/i18n/es.json`)

New namespace:
```json
{
  "output": {
    "title": "Producción",
    "writing": "Escritura",
    "speaking": "Habla",
    "submit": "Enviar",
    "record": "Grabar",
    "stopRecording": "Detener",
    "listen": "Escuchar",
    "retry": "Reintentar",
    "score": "Puntuación",
    "corrections": "Correcciones",
    "feedback": "Retroalimentación",
    "improved": "Versión mejorada",
    "wordCount": "Palabras",
    ...
  },
  "practice": {
    "title": "Práctica libre",
    "quickPractice": "Práctica rápida",
    "topicBrowser": "Explorar temas",
    "history": "Historial",
    ...
  }
}
```

### 7.2 — Dashboard Integration

- Add "Writing Practice" widget or CTA on Dashboard
- Show recent writing scores or streak
- "Continue Output" if user has incomplete output step in current unit

---

## Implementation Order (Execution Phases)

### Batch 1: Foundation (Backend + DB)
1. DB schema v5 migration (new tables + types)
2. Writing-evaluator Gemini agent
3. API orchestrator update + frontend AI lib update
4. `useSpeech` hook

### Batch 2: Components (Writing)
5. SentenceConstruction component
6. ErrorCorrection component
7. FreeWriting component
8. ParagraphCompletion component
9. WritingFeedback component
10. WritingRunner orchestrator

### Batch 3: Components (Speaking)
11. ReadAloud component
12. OralResponse component
13. SpeakingRunner orchestrator

### Batch 4: Integration
14. OutputStep component (tabs: writing + speaking)
15. UnitFlow update (new step + progress logic)
16. useUnitProgress hook update

### Batch 5: Practice Page + Data
17. Practice page (/practice)
18. Navigation/layout updates
19. Writing prompts data (A1-B2, ~132 prompts)
20. Speaking prompts data (A1-B2, ~88 prompts)
21. Seed updates

### Batch 6: Polish
22. i18n translations
23. Dashboard integration
24. Final visual polish + animations

---

## Technical Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Speech API | Web Speech API (native) | Free, no API key, works in Chrome/Edge/Safari. Graceful fallback for unsupported browsers. |
| Writing evaluation | New Gemini agent | Dedicated system prompt for nuanced writing feedback. Reusable for both UnitFlow and Practice page. |
| Speaking evaluation | Reuse writing-evaluator | Oral response transcripts can be evaluated as text. Read-aloud uses client-side word matching (no AI needed). |
| Prompt storage | Pre-seeded in Dexie | Consistent with grammar exercises pattern. Offline-first. |
| Free practice prompts | AI-generated on demand | Only for Practice page. Keeps pre-seeded data manageable. |
| UnitFlow output | Both writing + speaking | Tabs within single step. Both required for completion. |

---

## File Map (New & Modified)

### New Files (~25)
```
api/agents/writing-evaluator.ts
src/components/writing/SentenceConstruction.tsx
src/components/writing/ParagraphCompletion.tsx
src/components/writing/FreeWriting.tsx
src/components/writing/ErrorCorrection.tsx
src/components/writing/WritingFeedback.tsx
src/components/writing/WritingRunner.tsx
src/components/speaking/ReadAloud.tsx
src/components/speaking/OralResponse.tsx
src/components/speaking/SpeakingRunner.tsx
src/components/OutputStep.tsx
src/hooks/useSpeech.ts
src/pages/Practice.tsx
src/data/output/a1-writing.ts
src/data/output/a2-writing.ts
src/data/output/b1-writing.ts
src/data/output/b2-writing.ts
src/data/output/a1-speaking.ts
src/data/output/a2-speaking.ts
src/data/output/b1-speaking.ts
src/data/output/b2-speaking.ts
src/data/output/index.ts
```

### Modified Files (~10)
```
src/lib/db.ts              (new tables + types)
src/lib/ai.ts              (evaluateWriting function)
src/lib/seed.ts            (seed output prompts)
src/hooks/useUnitProgress.ts (output step logic)
src/pages/UnitFlow.tsx     (output step rendering)
src/pages/Dashboard.tsx    (output widget)
src/components/Layout.tsx  (nav update)
src/App.tsx                (new route)
src/i18n/es.json           (new translations)
api/orchestrator.ts        (register new agent)
```

---

## Risk Mitigation

- **Speech API not supported**: Show graceful message + allow skipping speaking exercises. Output step can be completed with writing only if speech unavailable.
- **Gemini rate limits**: Writing evaluation uses single calls (not chat), lighter load than conversation-tutor.
- **Token limits for curriculum data**: Split writing/speaking prompts into per-level files (same pattern as B2 curriculum fix).
- **Mobile UX**: Speech recording needs clear visual feedback. Textarea needs adequate height. All components mobile-responsive.
