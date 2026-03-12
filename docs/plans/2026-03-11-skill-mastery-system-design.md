# Skill Mastery System — Design Document

**Date:** 2026-03-11
**Status:** Approved
**Problem:** Once a user completes a unit, they cannot revisit it. Grammar knowledge has no spaced repetition — only vocabulary does. This means long-term retention of grammar concepts is not guaranteed.

---

## Overview

Apply the same FSRS-4.5 spaced repetition model used for vocabulary to grammar/unit content. Each unit is decomposed into 3-5 **grammar skills** (sub-abilities), each tracked independently with its own FSRS card. Reviews are adaptive: stable skills get quick quizzes, weak skills get deeper review with grammar tips.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Approach | Skill Mastery (per sub-skill FSRS) | Maximum granularity — pinpoints exactly what the user knows/doesn't |
| Activation | Automatic via FSRS + manual option | Ensures consistent review without relying on user motivation |
| UI location | Integrated into existing Review Session | Single place for all review; adds Grammar tab alongside Vocabulary |
| Evaluation | User self-assessment (Again/Hard/Good/Easy) | Matches existing vocab flow; FSRS designed for this input |
| Skill definitions | Manual in curriculum static data | Full quality control, no AI dependency for definitions |
| Exercise generation | Static pools (8-12 per skill) | 100% offline, no API dependency, predictable quality |
| Review format | Adaptive mix | Stable = mini-quiz (3-5 exercises), Weak = grammarTip + 5-8 exercises |

---

## Data Model

### Static Data: `grammar_skills` (in curriculum files)

```typescript
interface GrammarSkill {
  id: string;                  // "a1-u1-affirmative"
  unitId: string;              // "a1-unit-1"
  name: string;                // "Affirmative Form"
  description: string;         // "I play, She plays — conjugation rules"
  difficulty: number;          // 1-5, ordering within unit
  grammarTip: string;          // Short reminder shown during deep review
  exercises: SkillExercise[];  // 8-12 exercises per skill
}

interface SkillExercise {
  type: "fill_blank" | "multiple_choice" | "word_order";
  prompt: string;
  answer: string;
  options?: string[];          // for multiple_choice or fill_blank hints
  explanation: string;         // shown after answering
}
```

Each unit has 3-5 skills defined. Skills are stored in `src/data/curriculum/skills.ts`.

### Dynamic Data: `skill_cards` (Supabase table)

```sql
CREATE TABLE skill_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  skill_id TEXT NOT NULL,          -- "a1-u1-affirmative"
  unit_id TEXT NOT NULL,           -- "a1-unit-1"
  state SMALLINT NOT NULL DEFAULT 0,  -- CardState enum (0=New,1=Learning,2=Review,3=Relearning)
  due TIMESTAMPTZ NOT NULL DEFAULT now(),
  stability FLOAT NOT NULL DEFAULT 0,
  difficulty FLOAT NOT NULL DEFAULT 0,
  elapsed_days INT NOT NULL DEFAULT 0,
  scheduled_days INT NOT NULL DEFAULT 0,
  reps INT NOT NULL DEFAULT 0,
  lapses INT NOT NULL DEFAULT 0,
  last_review TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_skill_cards_due ON skill_cards(user_id, due);
CREATE INDEX idx_skill_cards_unit ON skill_cards(user_id, unit_id);
```

Same FSRS fields as the existing `cards` table — the `fsrs.ts` algorithm works identically on both.

---

## User Flows

### Flow 1: Skill Card Creation (on unit completion)

```
User passes checkpoint (score >= 80%)
  → unit_progress.completed_at = now()
  → System reads grammar_skills for this unitId
  → For each skill:
      INSERT INTO skill_cards {
        user_id, skill_id, unit_id,
        state: 0 (New),
        due: now() + 1 day,
        stability: 0, difficulty: 0
      }
  → Toast: "Unit complete! 4 grammar skills added to your review deck"
```

### Flow 2: Review Session (grammar tab)

```
User opens Review Session
  → Tab selector: [Vocabulary] [Grammar] [All]
  → Grammar tab:
      Query: SELECT * FROM skill_cards WHERE user_id = X AND due <= now()
      For each due skill_card:
        1. Determine review depth:
           - Stable (state=Review AND stability > threshold) → Mini-quiz
           - Weak (state=Learning/Relearning OR stability low) → Deep review
        2. Mini-quiz path:
           - Show skill name + 3-5 random exercises from pool
           - User answers exercises
           - Show self-assessment: Again / Hard / Good / Easy
        3. Deep review path:
           - Show grammarTip (reminder of the rule)
           - Show 5-8 exercises (varied types)
           - Show self-assessment: Again / Hard / Good / Easy
        4. FSRS recalculates: calculateNextReview(skill_card, rating)
        5. Update skill_card in Supabase
        6. Next skill or session complete
```

### Flow 3: Dashboard Integration

```
Dashboard cards:
  Existing: "X words to review"
  New:      "Y grammar skills to review"
  Both query due <= now() from their respective tables
```

### Flow 4: Learning Path — Completed Units

```
Completed unit card shows:
  ✅ Present Simple
     Skills: ████░ 4/5 mastered
     [Review due] badge if any skill_card.due <= now()

Tapping completed unit → shows skill breakdown:
  ✔ Affirmative Form — mastered (next review: 45 days)
  ✔ Negative Form — mastered (next review: 12 days)
  ⚠ Questions — needs review (due today)
  ✔ Time Expressions — mastered (next review: 30 days)
  ✔ Irregular Verbs — stable (next review: 7 days)
```

---

## Algorithm

**FSRS-4.5** — reuse existing `src/lib/fsrs.ts` without modifications.

- Same 17 weight parameters
- Same 90% target retention
- Same card state machine (New → Learning → Review, with Relearning on lapse)
- Same rating system (Again=1, Hard=2, Good=3, Easy=4)
- `stability` threshold for mini-quiz vs deep review: TBD during implementation (likely stability > 10 days)

---

## Review Depth Heuristic

```
if (skillCard.state === Review && skillCard.stability > STABLE_THRESHOLD) {
  // User knows this well → quick refresher
  return "mini_quiz";  // 3-5 exercises
} else {
  // User is still learning or forgot → deeper review
  return "deep_review";  // grammarTip + 5-8 exercises
}
```

`STABLE_THRESHOLD` = configurable, start at 10 (meaning stability of 10+ days = considered stable).

---

## Files to Create/Modify

### New Files
- `src/data/curriculum/skills.ts` — Grammar skill definitions for all units
- `src/hooks/useSkillCards.ts` — Hook for skill_card CRUD + due queries
- `src/components/GrammarReview.tsx` — Grammar review component (mini-quiz + deep review)
- `src/components/SkillBreakdown.tsx` — Skill mastery display for completed units

### Modified Files
- `src/pages/UnitFlow.tsx` — Create skill_cards on checkpoint completion
- `src/pages/ReviewSession.tsx` — Add Grammar tab, integrate GrammarReview
- `src/pages/Dashboard.tsx` — Add grammar skills due count
- `src/pages/LearningPath.tsx` — Show skill mastery on completed units
- `src/lib/database.types.ts` — Add SkillCard type
- Supabase migration — Create `skill_cards` table

---

## Scope

### In Scope
- Grammar skill definitions for all existing units (A1-B2)
- skill_cards table + FSRS integration
- Review Session grammar tab with adaptive depth
- Dashboard grammar review counter
- Learning Path skill mastery display
- Offline support (static exercises + local FSRS state)

### Out of Scope
- AI-generated exercises (using static pools only)
- Sub-skill auto-detection from user performance
- Detailed analytics/retention curves per skill
- Skill-level leaderboards or gamification
