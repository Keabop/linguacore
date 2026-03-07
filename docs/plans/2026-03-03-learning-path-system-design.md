# Learning Path System — Design Document

## Goal

Transform LinguaCore from a vocabulary-focused reading app into a complete, structured English learning system (A1-B2) using a guided Learning Path with milestones.

## Core Decisions

- **Grammar approach:** Mixed — short reference cards + practice through stories and exercises
- **Learning path:** Guided (forced order) — the system tells the user what to learn next
- **Level progression:** Quantitative metrics + objective grammar exercises (not AI judgment)
- **Scope (Phase 1):** Consolidate input (reading + vocabulary + grammar). Output (writing/speaking) deferred to Phase 2
- **Notes feature:** Deferred — idea for future consideration

## Architecture: Learning Path with Milestones

Each CEFR level (A1, A2, B1, B2) is divided into **thematic units**. Each unit has a central grammar topic and vocabulary theme. Users advance in strict order.

### Unit Structure

Each unit follows this pattern:

```
Unit N: "[Theme]"
├── Grammar Card    — short reference explaining the grammar point (in Spanish)
├── Story           — narrative using that grammar in context
├── Vocab Review    — spaced repetition review of words from the story
├── Grammar Exercises — fill-in-blank, multiple choice, word ordering (objective, right/wrong)
└── Checkpoint      — 3-5 objective exercises confirming comprehension
```

### Level Assessment

The final unit of each level is a **Level Assessment**:
- 15-20 objective exercises covering all grammar + vocabulary from that level
- Passing threshold: >= 80%
- On pass: next level is unlocked
- On fail: user can review and retake

## Curriculum (44 Units Total)

### A1 — Beginner (8 units)

| Unit | Grammar | Theme |
|------|---------|-------|
| 1 | Verb "to be" + pronouns | Introducing yourself, greetings |
| 2 | Articles (a/an/the) + demonstratives (this/that) | Objects, classroom, colors |
| 3 | Present Simple (affirmative) | Daily routines, time, days |
| 4 | Present Simple (negative/questions) + frequency adverbs | Hobbies, likes/dislikes |
| 5 | There is/are + prepositions of place | Home, rooms, furniture |
| 6 | Can/can't (ability) + imperatives | Abilities, giving directions |
| 7 | Countable/uncountable + some/any | Food, shopping, numbers |
| 8 | **A1 Level Assessment** | All of the above |

### A2 — Elementary (10 units)

| Unit | Grammar | Theme |
|------|---------|-------|
| 1 | Past Simple — regular verbs | Describing yesterday, weekend |
| 2 | Past Simple — irregular verbs + negatives/questions | Travel stories, experiences |
| 3 | Present Continuous (now vs. habits) | Describing actions, plans |
| 4 | Going to (future plans) | Making plans, vacations |
| 5 | Comparatives + superlatives | Describing people, places |
| 6 | Must/have to/should (obligation + advice) | Health, rules, advice |
| 7 | Object pronouns + possessive pronouns | Relationships, giving/receiving |
| 8 | First conditional (if + present -> will) | Consequences, possibilities |
| 9 | Adverbs of manner + past continuous (intro) | Telling stories, describing scenes |
| 10 | **A2 Level Assessment** | All of the above |

### B1 — Intermediate (12 units)

| Unit | Grammar | Theme |
|------|---------|-------|
| 1 | Present Perfect Simple (experience + unfinished time) | Life experiences, achievements |
| 2 | Present Perfect vs Past Simple | News, recent events |
| 3 | Present Perfect Continuous | Duration, work |
| 4 | Past Perfect | Storytelling, sequences |
| 5 | Used to + would (past habits) | Childhood, changes over time |
| 6 | Passive voice (present + past) | Processes, news, descriptions |
| 7 | Second conditional (if + past -> would) | Hypotheticals, dreams |
| 8 | Reported speech (basic: said/told) | Retelling, gossip, news |
| 9 | Relative clauses (who/which/that/where) | Defining, describing |
| 10 | Gerunds vs infinitives | Opinions, preferences |
| 11 | Modal verbs (might/could/would) + too/enough | Speculation, evaluating |
| 12 | **B1 Level Assessment** | All of the above |

### B2 — Upper-Intermediate (14 units)

| Unit | Grammar | Theme |
|------|---------|-------|
| 1 | Third conditional (if + past perfect -> would have) | Regrets, alternate outcomes |
| 2 | Mixed conditionals | Complex hypotheticals |
| 3 | Wish / if only (present + past) | Desires, regrets |
| 4 | Reported speech (advanced: questions, requests, time shifts) | Interviews, summarizing |
| 5 | Passive voice (complex: modals + perfect) | Academic writing, formal |
| 6 | Causative (have/get something done) | Services, delegation |
| 7 | Relative clauses (non-defining, reduced) | Formal writing, detail |
| 8 | Participle clauses (-ing/-ed as modifiers) | Narrative, descriptions |
| 9 | Future Perfect + Future Continuous | Plans, predictions |
| 10 | Phrasal verbs (advanced patterns) | Natural speech, idioms |
| 11 | Inversion + cleft sentences (emphasis) | Formal, persuasive |
| 12 | Narrative tenses (all tenses in storytelling) | Complex stories |
| 13 | Connectors + discourse markers (cohesion) | Essays, argumentation |
| 14 | **B2 Level Assessment** | All of the above |

## Data Model Changes

New Dexie tables needed:

- **units** — id, level, unitNumber, title, grammarTopic, theme, isAssessment
- **grammarCards** — id, unitId, title, explanation (Spanish), examples, rules
- **grammarExercises** — id, unitId, type (fill-blank/multiple-choice/word-order), question, correctAnswer, options?, explanation
- **unitProgress** — id, unitId, userId, grammarCardRead, storyRead, vocabReviewed, exercisesCompleted, checkpointPassed, completedAt
- **levelAssessments** — id, level, score, passed, attemptedAt

Existing tables remain (stories, vocabulary, cards, etc.) — stories now link to units via unitId.

## Component Changes

### New Pages/Components

- **LearningPath page** — visual road/map showing all units, current position, locked/unlocked state
- **GrammarCard component** — displays grammar reference with examples
- **GrammarExercise component** — renders fill-blank, multiple-choice, word-order exercises
- **UnitCheckpoint component** — mini-assessment at end of each unit
- **LevelAssessment page** — full level evaluation

### Modified Pages

- **Dashboard** — show current unit in learning path, next milestone
- **StoryReader** — stories now linked to units (context-aware)
- **ReviewSession** — unchanged (FSRS still manages vocab cards)

## AI Agent Changes

### Modified: Story Generator

Stories must now target specific grammar points + vocabulary themes per unit. Prompt needs unit context (grammar topic, theme, target vocabulary).

### New: Grammar Exercise Generator (or extend Exercise Creator)

Generate grammar exercises (fill-blank, multiple-choice, word-order) for specific grammar points. Must produce objective, right/wrong exercises — not subjective AI evaluation.

### New: Level Assessment Generator

Generate 15-20 mixed exercises covering all grammar points and vocabulary from a complete level. Must have deterministic correct answers.

## Estimated Timeline (1 hour/day)

- A1: ~3 weeks
- A2: ~4-5 weeks
- B1: ~6-7 weeks
- B2: ~8-10 weeks
- Total: ~5-6 months to complete all content

## Future Phases (Deferred)

- **Phase 2: Output** — sentence construction, translation exercises, guided writing
- **Phase 2: Notes** — personal annotations per unit/grammar card
- **Phase 3: Audio** — listening comprehension
- **Phase 3: Speaking** — pronunciation practice
