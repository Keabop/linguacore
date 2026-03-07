# Learning Path System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform LinguaCore into a structured English learning system with a guided Learning Path, grammar cards, exercises, and level assessments — starting with full A1 curriculum.

**Architecture:** Add new Dexie tables for curriculum data (units, grammar cards, exercises, progress). Build a LearningPath page as the new primary navigation hub. Each unit follows: grammar card → story → vocab review → grammar exercises → checkpoint. Level assessment gates progression.

**Tech Stack:** React 19, TypeScript, Dexie (IndexedDB), Tailwind CSS v4, Framer Motion, Vite

**Design doc:** `docs/plans/2026-03-03-learning-path-system-design.md`

---

## Task 1: Data Model — New Types and Dexie Tables

**Files:**
- Modify: `src/lib/db.ts`

**Goal:** Add interfaces and Dexie tables for the Learning Path system.

**Step 1:** Add new interfaces after the existing `KnownWord` interface in `src/lib/db.ts`:

```typescript
// ===== Learning Path Types =====

export type ExerciseType = 'fill-blank' | 'multiple-choice' | 'word-order';

export interface Unit {
  id: string;           // e.g., "a1-u1", "b2-u14"
  level: CEFRLevel;
  unitNumber: number;
  title: string;        // e.g., "Introducing Yourself"
  grammarTopic: string; // e.g., "Verb 'to be' + pronouns"
  theme: string;        // e.g., "Greetings, introductions"
  isAssessment: boolean;
}

export interface GrammarCard {
  id: string;           // e.g., "gc-a1-u1"
  unitId: string;
  title: string;
  explanation: string;  // In Spanish, HTML allowed
  examples: string[];   // English examples with translations
  rules: string[];      // Key grammar rules
}

export interface GrammarExercise {
  id: string;
  unitId: string;
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  options?: string[];       // For multiple-choice
  scrambledWords?: string[];// For word-order
  explanation: string;      // In Spanish
}

export interface UnitProgress {
  id?: number;
  unitId: string;
  grammarCardRead: boolean;
  storyCompleted: boolean;
  vocabReviewed: boolean;
  exercisesScore: number;   // 0-100
  checkpointPassed: boolean;
  completedAt?: Date;
}

export interface LevelAssessment {
  id?: number;
  level: CEFRLevel;
  score: number;        // 0-100
  passed: boolean;      // score >= 80
  attemptedAt: Date;
}
```

**Step 2:** Add table declarations to the `LinguaCoreDB` class:

```typescript
units!: Table<Unit>;
grammarCards!: Table<GrammarCard>;
grammarExercises!: Table<GrammarExercise>;
unitProgress!: Table<UnitProgress>;
levelAssessments!: Table<LevelAssessment>;
```

**Step 3:** Bump DB version to 3 and add new stores. Keep version 2 stores, add version 3 with new tables:

```typescript
this.version(3).stores({
  users: '++id',
  stories: 'id, level',
  vocabulary: 'id, cefrLevel',
  cards: 'id, wordId, due, state',
  studySessions: '++id, date',
  readStories: '++id, storyId, completedAt',
  knownWords: 'wordId',
  units: 'id, level, unitNumber',
  grammarCards: 'id, unitId',
  grammarExercises: 'id, unitId',
  unitProgress: '++id, unitId',
  levelAssessments: '++id, level, attemptedAt',
});
```

**Step 4:** Add `unitId` field to the existing `Story` interface as an optional field:

```typescript
export interface Story {
  id: string;
  level: CEFRLevel;
  title: string;
  content: string;
  wordCount: number;
  estimatedMinutes: number;
  unitId?: string;  // Links story to a learning path unit
}
```

**Verification:** Run `npm run dev` — app should start without errors. Open browser console, verify no Dexie errors.

**Commit:** `feat(db): add learning path tables (units, grammarCards, exercises, progress)`

---

## Task 2: A1 Curriculum Data

**Files:**
- Create: `src/data/curriculum/a1.ts`
- Create: `src/data/curriculum/index.ts`

**Goal:** Define all A1 units with their grammar cards and exercises. This is content-heavy but essential.

**Step 1:** Create `src/data/curriculum/a1.ts` with all 8 A1 units. Each unit includes:
- Unit metadata (id, level, unitNumber, title, grammarTopic, theme)
- Grammar card (explanation in Spanish, examples, rules)
- 5-8 grammar exercises per unit (mix of fill-blank, multiple-choice, word-order)

Structure pattern:
```typescript
import type { Unit, GrammarCard, GrammarExercise } from '../../lib/db';

export const a1Units: Unit[] = [
  {
    id: 'a1-u1',
    level: 'A1',
    unitNumber: 1,
    title: 'Introducing Yourself',
    grammarTopic: "Verb 'to be' + pronouns",
    theme: 'Greetings, introductions',
    isAssessment: false,
  },
  // ... units 2-7
  {
    id: 'a1-u8',
    level: 'A1',
    unitNumber: 8,
    title: 'A1 Level Assessment',
    grammarTopic: 'All A1 grammar',
    theme: 'Comprehensive review',
    isAssessment: true,
  },
];

export const a1GrammarCards: GrammarCard[] = [
  {
    id: 'gc-a1-u1',
    unitId: 'a1-u1',
    title: "El verbo 'to be' y los pronombres personales",
    explanation: `
      <h3>Pronombres personales</h3>
      <p><strong>I</strong> (yo), <strong>you</strong> (tú/usted), <strong>he</strong> (él),
      <strong>she</strong> (ella), <strong>it</strong> (ello), <strong>we</strong> (nosotros),
      <strong>they</strong> (ellos/ellas)</p>

      <h3>Verbo "to be" en presente</h3>
      <table>
        <tr><td>I</td><td><strong>am</strong></td></tr>
        <tr><td>You / We / They</td><td><strong>are</strong></td></tr>
        <tr><td>He / She / It</td><td><strong>is</strong></td></tr>
      </table>

      <h3>Contracciones</h3>
      <p>I'm, you're, he's, she's, it's, we're, they're</p>
    `,
    examples: [
      'I am a student. → Yo soy estudiante.',
      'She is from Mexico. → Ella es de México.',
      'They are happy. → Ellos están felices.',
      'It is a book. → Es un libro.',
    ],
    rules: [
      'Usa "am" solo con "I"',
      'Usa "is" con he, she, it (tercera persona singular)',
      'Usa "are" con you, we, they',
      'En inglés siempre se necesita el sujeto: "It is cold" (no solo "Is cold")',
    ],
  },
  // ... cards for units 2-7 (unit 8 is assessment, no grammar card)
];

export const a1Exercises: GrammarExercise[] = [
  // Unit 1 exercises
  {
    id: 'ex-a1-u1-1',
    unitId: 'a1-u1',
    type: 'fill-blank',
    question: 'I ___ a student.',
    correctAnswer: 'am',
    explanation: 'Con el pronombre "I" siempre se usa "am".',
  },
  {
    id: 'ex-a1-u1-2',
    unitId: 'a1-u1',
    type: 'multiple-choice',
    question: 'She ___ from Spain.',
    correctAnswer: 'is',
    options: ['am', 'is', 'are'],
    explanation: 'Con "she" (tercera persona singular) se usa "is".',
  },
  {
    id: 'ex-a1-u1-3',
    unitId: 'a1-u1',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'They are my friends.',
    scrambledWords: ['friends.', 'are', 'They', 'my'],
    explanation: 'Estructura: Sujeto + verbo to be + complemento.',
  },
  // ... 5-8 exercises per unit, covering all 7 non-assessment units
  // Unit 8 (assessment) uses exercises from all previous units — handled by assessment logic
];
```

**Important:** Write ALL content for units 1-7 grammar cards and exercises. Unit 8 is an assessment and reuses exercise patterns from units 1-7. Each non-assessment unit should have exactly 6 exercises (2 fill-blank, 2 multiple-choice, 2 word-order).

Total: 7 grammar cards + 42 exercises for A1.

**Step 2:** Create `src/data/curriculum/index.ts`:

```typescript
export { a1Units, a1GrammarCards, a1Exercises } from './a1';
// Future: export { a2Units, ... } from './a2';
```

**Verification:** Import in browser console or a scratch file — no TypeScript errors.

**Commit:** `feat(curriculum): add complete A1 curriculum data (8 units, grammar cards, 42 exercises)`

---

## Task 3: Seed Curriculum Data

**Files:**
- Modify: `src/lib/seed.ts`

**Goal:** Seed A1 curriculum data into Dexie on first load.

**Step 1:** Read existing `src/lib/seed.ts` to understand current seeding pattern.

**Step 2:** Add curriculum seeding. After existing seed logic, add:

```typescript
import { a1Units, a1GrammarCards, a1Exercises } from '../data/curriculum';

// Inside seedDatabase function, after existing seeding:
const unitCount = await db.units.count();
if (unitCount === 0) {
  await db.units.bulkAdd(a1Units);
  await db.grammarCards.bulkAdd(a1GrammarCards);
  await db.grammarExercises.bulkAdd(a1Exercises);
}
```

**Verification:** Run `npm run dev`. Open DevTools → Application → IndexedDB → LinguaCoreDB. Verify `units` table has 8 entries, `grammarCards` has 7 entries, `grammarExercises` has 42 entries.

**Commit:** `feat(seed): seed A1 curriculum data on first load`

---

## Task 4: LearningPath Page

**Files:**
- Create: `src/pages/LearningPath.tsx`

**Goal:** Visual road map showing all units in current level. Each unit shows its state (locked/current/completed). Clicking a unit opens its flow.

**Key behaviors:**
- Query `db.units` for current level's units (ordered by unitNumber)
- Query `db.unitProgress` for completion status of each unit
- A unit is unlocked if all previous units in the level are completed
- Unit 1 of a level is always unlocked
- Show visual path (vertical list with connecting line)
- Each unit card shows: number, title, grammar topic, state icon, completion checkmarks
- Use Framer Motion for entrance animations
- Click unlocked unit → navigate to `/path/:unitId`
- Assessment unit has distinct visual treatment

**Component structure:**
```
LearningPath
├── Level header (current level badge + title)
├── Unit cards (map over units)
│   ├── Unit number + connector line
│   ├── Title + grammar topic
│   ├── Progress indicators (grammar ✓, story ✓, exercises ✓, checkpoint ✓)
│   └── Lock/current/completed state
└── Level progress bar
```

**Verification:** Navigate to `/path`. See A1 units listed. Unit 1 should be unlocked (clickable), units 2+ locked.

**Commit:** `feat(ui): add LearningPath page with unit roadmap`

---

## Task 5: GrammarCard Component

**Files:**
- Create: `src/components/GrammarCard.tsx`

**Goal:** Display grammar reference card for a unit. Shows explanation (Spanish), examples, and rules. Has a "Entendido" button that marks it as read and advances to next step.

**Key behaviors:**
- Receives `unitId` prop
- Queries `db.grammarCards` for matching card
- Renders HTML explanation (use dangerouslySetInnerHTML with DOMPurify since it's already a dependency)
- Shows examples in a styled list (English + Spanish translation)
- Shows rules as bullet points
- "Entendido" button updates `unitProgress.grammarCardRead = true`
- Framer Motion fade-in animation

**Verification:** Access a unit flow, see grammar card rendered with formatted content. Click "Entendido" → progress saved in IndexedDB.

**Commit:** `feat(ui): add GrammarCard component with progress tracking`

---

## Task 6: GrammarExercise Component

**Files:**
- Create: `src/components/exercises/FillBlankExercise.tsx`
- Create: `src/components/exercises/MultipleChoiceExercise.tsx`
- Create: `src/components/exercises/WordOrderExercise.tsx`
- Create: `src/components/exercises/ExerciseRunner.tsx`

**Goal:** Three exercise type components + a runner that orchestrates them sequentially.

### FillBlankExercise
- Shows sentence with blank (underscore)
- Text input for answer
- On submit: compare (case-insensitive, trimmed) with `correctAnswer`
- Show correct/incorrect feedback with explanation (Spanish)
- Green border on correct, red + show correct answer on incorrect

### MultipleChoiceExercise
- Shows question
- Renders options as buttons
- On select: highlight correct/incorrect
- Show explanation after answer

### WordOrderExercise
- Shows scrambled words as draggable/clickable chips
- User clicks chips to build sentence in order
- Can click placed chips to remove them
- On submit: compare built sentence with `correctAnswer`
- Show feedback

### ExerciseRunner
- Receives `exercises: GrammarExercise[]`
- Shows one exercise at a time
- Progress indicator (e.g., "3/6")
- Tracks score (correct/total)
- On completion: saves score to `unitProgress.exercisesScore`
- Shows final score summary

**Verification:** Open unit flow at exercise step. Complete all 6 exercises. See score summary. Verify score saved in IndexedDB.

**Commit:** `feat(ui): add grammar exercise components (fill-blank, multiple-choice, word-order) + runner`

---

## Task 7: Unit Flow Page

**Files:**
- Create: `src/pages/UnitFlow.tsx`
- Create: `src/hooks/useUnitProgress.ts`

**Goal:** Orchestrate the unit experience: grammar card → story → vocab review → exercises → checkpoint. Show step indicator and handle navigation between steps.

### useUnitProgress hook
- Receives `unitId`
- Queries/creates `unitProgress` record for this unit
- Returns current progress + update functions
- Determines which step is active based on what's completed

### UnitFlow page
- Route: `/path/:unitId`
- Steps:
  1. **Grammar Card** — renders `GrammarCard` component
  2. **Story** — navigates to existing `StoryReader` with the unit's story (or shows "Generate story for this unit" button if no story exists yet)
  3. **Vocab Review** — shows link to review session for words from this unit's story
  4. **Grammar Exercises** — renders `ExerciseRunner` with unit's exercises
  5. **Checkpoint** — 3-5 exercises (subset), must score >= 80% to pass
- Step indicator at top (horizontal stepper)
- Back button returns to Learning Path
- On checkpoint pass → unit marked complete, return to Learning Path

**Assessment units (unit 8):** Skip steps 1-4, go directly to assessment (handled by Task 8).

**Verification:** Click Unit 1 from LearningPath. Complete grammar card → see story step → complete exercises → pass checkpoint. Return to LearningPath, unit 1 shows as completed, unit 2 unlocked.

**Commit:** `feat(ui): add UnitFlow page orchestrating grammar → story → exercises → checkpoint`

---

## Task 8: Level Assessment Page

**Files:**
- Create: `src/pages/LevelAssessment.tsx`

**Goal:** Comprehensive level test. Pulls exercises from all units in the level. 15-20 exercises, must score >= 80% to pass and unlock next level.

**Key behaviors:**
- Route: `/path/:unitId` (when unit `isAssessment === true`, UnitFlow renders this instead)
- Pulls 15-20 random exercises from all units in the level (3 per unit, mixed types)
- Uses same exercise components from Task 6
- Shows progress bar and score during assessment
- On completion:
  - Save `LevelAssessment` record (score, passed, date)
  - If passed (>= 80%):
    - Mark assessment unit as completed
    - Unlock next level (update `User.unlockedLevels` and `User.currentLevel`)
    - Show congratulatory animation (use existing LevelUpModal)
  - If failed:
    - Show score + which grammar topics need review
    - Allow retry

**Verification:** Complete all 7 A1 units. Click Unit 8 (assessment). Complete 15+ exercises. Score >= 80% → see level-up modal, A2 unlocked.

**Commit:** `feat(ui): add LevelAssessment page with level-up logic`

---

## Task 9: Replace Level Progression System

**Files:**
- Modify: `src/hooks/useLevelProgression.ts`

**Goal:** Replace the old metrics-based progression (30 words, 5 stories, 70% retention) with unit-based progression. A user can only level up by completing all units + passing the level assessment.

**Step 1:** Update `useLevelProgression` hook:
- Progress is now based on `unitProgress` completion
- `overallPercent` = (completed units / total units) * 100
- `canLevelUp` is removed (level-up happens via assessment, not auto-detect)
- Keep streak and retention calculations (still useful for stats)

**Step 2:** Update `LevelProgressInfo` interface:
```typescript
export interface LevelProgressInfo {
  currentLevel: CEFRLevel;
  nextLevel: CEFRLevel | null;
  unitsCompleted: number;
  unitsTotal: number;
  overallPercent: number;
  currentUnitId: string | null; // First incomplete unit
}
```

**Step 3:** Update Layout.tsx sidebar progress widget to reflect unit-based progress instead of words/stories metrics.

**Verification:** Sidebar shows "3/8 units" style progress. Completing units advances the progress bar.

**Commit:** `refactor(progression): replace metrics-based with unit-based level progression`

---

## Task 10: Routes, Navigation, and i18n

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`
- Modify: `src/i18n/es.json`

**Step 1:** Add lazy imports and routes in `App.tsx`:
```typescript
const LearningPath = lazy(() => import('./pages/LearningPath'));
const UnitFlow = lazy(() => import('./pages/UnitFlow'));

// Add routes inside <Route element={<Layout />}>:
<Route path="/path" element={...}><LearningPath /></Route>
<Route path="/path/:unitId" element={...}><UnitFlow /></Route>
```

**Step 2:** Update `Layout.tsx` nav items — add Learning Path entry:
```typescript
{ path: '/path', icon: Map, labelKey: 'nav.path' },
```
Import `Map` from `lucide-react`.

**Step 3:** Add i18n keys to `src/i18n/es.json`:
```json
{
  "nav.path": "Ruta de Aprendizaje",
  "path.title": "Ruta de Aprendizaje",
  "path.unit": "Unidad",
  "path.locked": "Bloqueada",
  "path.current": "En progreso",
  "path.completed": "Completada",
  "path.assessment": "Evaluación de Nivel",
  "path.startUnit": "Comenzar unidad",
  "path.continueUnit": "Continuar",
  "grammar.understood": "Entendido",
  "grammar.title": "Gramática",
  "exercises.title": "Ejercicios",
  "exercises.progress": "{{current}} de {{total}}",
  "exercises.correct": "¡Correcto!",
  "exercises.incorrect": "Incorrecto",
  "exercises.score": "Puntuación: {{score}}%",
  "exercises.checkAnswer": "Comprobar",
  "exercises.next": "Siguiente",
  "exercises.finish": "Finalizar",
  "assessment.title": "Evaluación {{level}}",
  "assessment.pass": "¡Felicidades! Has aprobado",
  "assessment.fail": "No has alcanzado el 80%. Repasa y vuelve a intentarlo.",
  "assessment.retry": "Reintentar",
  "assessment.score": "Tu puntuación: {{score}}%"
}
```

**Verification:** Navigate to `/path`. See Learning Path page. Nav sidebar shows new entry. All text in Spanish.

**Commit:** `feat(routes): add learning path routes, navigation entry, and i18n strings`

---

## Task 11: Dashboard Integration

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Goal:** Add a "Continue Learning" widget to Dashboard that shows current unit and links to the Learning Path.

**Key behaviors:**
- Show current unit (first incomplete unit in current level)
- Show unit title + grammar topic
- "Continuar" button → navigates to `/path/:unitId`
- Show mini progress (e.g., "Unidad 3 de 8 — A1")
- Place prominently near the top of the dashboard

**Verification:** Dashboard shows "Continue Learning" widget with correct current unit. Clicking navigates to the unit flow.

**Commit:** `feat(dashboard): add continue learning widget linking to current unit`

---

## Implementation Notes

### What This Plan Does NOT Cover (Future Tasks)

1. **A1 Stories** — Each unit needs a story generated by AI targeting that unit's grammar + vocabulary theme. Currently the story generator doesn't know about units. This requires modifying the story-generator agent prompt to accept grammar constraints. For now, existing stories can be manually linked to units, or users can generate stories from within the unit flow.

2. **A2-B2 Curriculum Data** — Same pattern as A1 but with different content. Create `src/data/curriculum/a2.ts`, `b1.ts`, `b2.ts` following the same structure.

3. **Modified Story Generator** — Update `api/agents/story-generator.ts` to accept `grammarTopic` and `theme` parameters so stories reinforce the unit's grammar.

4. **Output Phase** — Writing exercises, sentence construction (deferred per user request).

5. **Notes Feature** — Personal annotations per unit (deferred as idea).

### Key Technical Decisions

- **No test framework added** — Project has no existing test infrastructure. Verification is via dev server + browser console + IndexedDB inspection. If tests are desired, add Vitest as a prerequisite task.
- **Content is hardcoded** — A1 curriculum lives in TypeScript files, not generated by AI. This ensures quality and consistency. Future levels can follow the same pattern or use AI generation.
- **Dexie version bump** — Version 2 → 3. Dexie handles the migration automatically for additive changes.
- **Stories linked optionally** — `Story.unitId` is optional so existing stories remain unaffected. New stories can be linked to units.
