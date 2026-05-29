# Design: Error Cards System + Practice Fixes + OutputStep UX

**Date:** 2026-03-13
**Status:** Approved

---

## Feature 1: Error Cards (Personalized Error Review with FSRS)

### Concept
Every AI correction (from tutor, writing practice, or unit exercises) creates an "error card" with FSRS spaced repetition. When due, the user reviews via adaptive exercises: multiple choice (new/weak cards) or free-form correction (stable cards).

### Data Model — `error_cards` table (Supabase)
```sql
id BIGSERIAL PRIMARY KEY
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
error_pattern TEXT NOT NULL          -- e.g. "persons vs people"
original_sentence TEXT NOT NULL       -- "There are 5 persons in my family"
corrected_sentence TEXT NOT NULL      -- "There are 5 people in my family"
explanation TEXT NOT NULL              -- Spanish explanation
error_type TEXT NOT NULL              -- grammar | vocabulary | spelling | style
source TEXT NOT NULL                  -- tutor | writing | unit
example_variants JSONB DEFAULT '[]'  -- 2-3 additional example sentences with same error
-- FSRS fields (same as skill_cards)
difficulty REAL NOT NULL DEFAULT 0.3
stability REAL NOT NULL DEFAULT 0
due TIMESTAMPTZ NOT NULL DEFAULT now()
last_review TIMESTAMPTZ
reps INTEGER NOT NULL DEFAULT 0
lapses INTEGER NOT NULL DEFAULT 0
state INTEGER NOT NULL DEFAULT 0     -- 0=new, 1=learning, 2=review, 3=relearning
```

RLS: `user_id = auth.uid()`

### Extraction Flow
1. **ConversationTutor**: After receiving `corrections[]` from API, for each correction → create error_card (deduplicate first)
2. **Practice (WritingFeedback)**: After receiving evaluation → each correction → error_card
3. **OutputStep (WritingRunner)**: Same pattern on writing evaluation

### Deduplication
Before creating a card, query existing cards for same user where `error_pattern` is similar. If found, reinforce (lower stability so it appears sooner) instead of duplicating.

### Example Variants
When the AI generates corrections, the prompt is enhanced to also return 2-3 additional example sentences with the same error pattern. Stored in `example_variants` JSONB. This prevents repetitive exercises over time.

### Review in ReviewSession
- Third type in selector: Vocabulario | Gramática | Mis Errores
- **New/weak card** → Multiple choice exercise from stored data
- **Stable card** → Free-form correction exercise
- After answer → feedback + explanation + FSRS self-assessment (Again/Hard/Good/Easy)
- Exercise generation is local (from stored data), no extra API calls

### Hook: `useErrorCards`
Same pattern as `useSkillCards`: `dueErrorCards`, `addErrorCard(correction, source)`, `reviewErrorCard(card, rating)`, deduplication logic.

---

## Feature 2: Practice Page Fixes

### 2a. Responsive History
Fix visual bugs in writing history drawer on mobile. Ensure proper layout and click handling.

### 2b. Hide Level Icons on Selection
When user selects a level (e.g. A1):
- The 4 level buttons (A1/A2/B1/B2) animate out
- Show selected level as header + back button
- Topic list appears below

### 2c. Free Topic Option
Add "Tema libre" option available at all levels. User writes about anything they want. AI evaluates at selected CEFR level without forced topic.

---

## Feature 3: "Ya puedo hablar" Button in OutputStep

When speaking is deferred (15min timer):
- Keep existing timer display + "Volver al camino" button
- Add **"Ya puedo hablar"** button that:
  - Clears deferred state from localStorage
  - Resets `speakingDeferred` state to false
  - Reactivates SpeakingRunner immediately (no page navigation needed)

---

## Implementation Order
1. Feature 3 (OutputStep button) — smallest, standalone
2. Feature 2 (Practice fixes) — UI fixes, standalone
3. Feature 1 (Error cards) — largest, needs migration + hooks + AI prompt changes + review integration
