# Skill Mastery System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add FSRS-4.5 spaced repetition to grammar/unit content so users retain what they learn long-term, with adaptive review depth (mini-quiz vs deep review).

**Architecture:** Each completed unit spawns 3-5 grammar skill cards tracked via FSRS in a new `skill_cards` Supabase table. The existing `fsrs.ts` algorithm is reused unchanged. Skills are defined as static data in the curriculum. Review is integrated into the existing Review Session page with a tab selector.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Supabase, FSRS-4.5, TanStack Query, Framer Motion

---

## Task 1: Add SkillCard type to database types

**Files:**
- Modify: `src/lib/database.types.ts`
- Modify: `src/lib/db.ts`

**Step 1: Add SkillCardRow type to `src/lib/database.types.ts`**

Add after the `UnitProgressRow` type (after line 70):

```typescript
export type SkillCardRow = {
    id: number;
    user_id: string;
    skill_id: string;
    unit_id: string;
    state: number;
    due: string;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    scheduled_days: number;
    reps: number;
    lapses: number;
    last_review: string | null;
    created_at: string;
};
```

**Step 2: Add `skill_cards` to the Database type**

Add after the `unit_progress` table entry (after line 144) in the `Database` type:

```typescript
skill_cards: {
    Row: SkillCardRow;
    Insert: Omit<SkillCardRow, 'id' | 'created_at'>;
    Update: Partial<Omit<SkillCardRow, 'id' | 'created_at'>>;
    Relationships: [];
};
```

**Step 3: Add SkillCard interface to `src/lib/db.ts`**

Add after the `Card` interface (after line 45):

```typescript
export interface SkillCard {
    id: string;
    skillId: string;
    unitId: string;
    state: CardState;
    due: Date;
    stability: number;
    difficulty: number;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    lastReview: Date | undefined;
}
```

**Step 4: Commit**

```bash
git add src/lib/database.types.ts src/lib/db.ts
git commit -m "feat(skill-mastery): add SkillCard types to database and domain models"
```

---

## Task 2: Add GrammarSkill type and static data structure

**Files:**
- Modify: `src/lib/db.ts`
- Create: `src/data/curriculum/skills.ts`
- Modify: `src/data/curriculum/index.ts`
- Modify: `src/data/index.ts`

**Step 1: Add GrammarSkill and SkillExercise types to `src/lib/db.ts`**

Add after the `SkillCard` interface:

```typescript
export interface SkillExercise {
    type: ExerciseType;
    prompt: string;
    answer: string;
    options?: string[];
    explanation: string;
}

export interface GrammarSkill {
    id: string;
    unitId: string;
    name: string;
    description: string;
    difficulty: number;
    grammarTip: string;
    exercises: SkillExercise[];
}
```

**Step 2: Create `src/data/curriculum/skills.ts`**

Create the file with the A1 unit 1 skills as the first entry (remaining units will be added in a dedicated data task). This file will hold ALL skill definitions for ALL levels.

Start with a scaffold showing the pattern — populate A1 unit 1 fully as an example:

```typescript
import type { GrammarSkill } from '../../lib/db';

// ===== A1 SKILLS =====

export const a1Skills: GrammarSkill[] = [
    // Unit 1: Introducing Yourself — Verb 'to be' + pronouns
    {
        id: 'a1-u1-s1',
        unitId: 'a1-u1',
        name: 'Verb "to be" — Affirmative',
        description: 'I am, you are, he/she/it is, we are, they are',
        difficulty: 1,
        grammarTip: 'Remember: I AM, you/we/they ARE, he/she/it IS. Contractions: I\'m, you\'re, he\'s.',
        exercises: [
            {
                type: 'fill-blank',
                prompt: 'She ___ a teacher.',
                answer: 'is',
                options: ['am', 'is', 'are'],
                explanation: 'She → is (third person singular)',
            },
            {
                type: 'fill-blank',
                prompt: 'We ___ from Colombia.',
                answer: 'are',
                options: ['am', 'is', 'are'],
                explanation: 'We → are (first person plural)',
            },
            {
                type: 'multiple-choice',
                prompt: 'Which is correct?',
                answer: 'I am a student.',
                options: ['I is a student.', 'I am a student.', 'I are a student.'],
                explanation: 'I always uses "am"',
            },
            {
                type: 'fill-blank',
                prompt: 'They ___ happy today.',
                answer: 'are',
                options: ['am', 'is', 'are'],
                explanation: 'They → are',
            },
            {
                type: 'fill-blank',
                prompt: 'He ___ my friend.',
                answer: 'is',
                options: ['am', 'is', 'are'],
                explanation: 'He → is',
            },
            {
                type: 'word-order',
                prompt: 'Arrange: a / am / I / student',
                answer: 'I am a student',
                explanation: 'Subject + verb to be + complement',
            },
            {
                type: 'fill-blank',
                prompt: 'It ___ a beautiful day.',
                answer: 'is',
                options: ['am', 'is', 'are'],
                explanation: 'It → is',
            },
            {
                type: 'multiple-choice',
                prompt: 'Select the correct contraction for "they are"',
                answer: "they're",
                options: ["their", "they're", "there"],
                explanation: 'they are → they\'re',
            },
        ],
    },
    {
        id: 'a1-u1-s2',
        unitId: 'a1-u1',
        name: 'Verb "to be" — Negative',
        description: "I'm not, you aren't, he/she/it isn't",
        difficulty: 2,
        grammarTip: "Negative: am not (I'm not), is not (isn't), are not (aren't). Never say 'I amn't'.",
        exercises: [
            {
                type: 'fill-blank',
                prompt: "She ___ (not) a doctor.",
                answer: "isn't",
                options: ["isn't", "aren't", "am not"],
                explanation: "She → isn't (is not)",
            },
            {
                type: 'fill-blank',
                prompt: "We ___ (not) tired.",
                answer: "aren't",
                options: ["isn't", "aren't", "am not"],
                explanation: "We → aren't (are not)",
            },
            {
                type: 'fill-blank',
                prompt: "I ___ (not) from Spain.",
                answer: "'m not",
                options: ["'m not", "amn't", "isn't"],
                explanation: "I → 'm not (am not). 'amn't' does not exist.",
            },
            {
                type: 'multiple-choice',
                prompt: 'Which sentence is correct?',
                answer: "They aren't at home.",
                options: ["They isn't at home.", "They aren't at home.", "They amn't at home."],
                explanation: "They → aren't",
            },
            {
                type: 'fill-blank',
                prompt: "He ___ (not) a student.",
                answer: "isn't",
                options: ["isn't", "aren't", "am not"],
                explanation: "He → isn't",
            },
            {
                type: 'fill-blank',
                prompt: "It ___ (not) cold today.",
                answer: "isn't",
                options: ["isn't", "aren't", "'m not"],
                explanation: "It → isn't",
            },
            {
                type: 'word-order',
                prompt: 'Arrange: not / they / students / are',
                answer: 'They are not students',
                explanation: 'Subject + verb to be + not + complement',
            },
            {
                type: 'multiple-choice',
                prompt: "What is the full form of \"isn't\"?",
                answer: 'is not',
                options: ['is not', 'are not', 'am not'],
                explanation: "isn't = is not",
            },
        ],
    },
    {
        id: 'a1-u1-s3',
        unitId: 'a1-u1',
        name: 'Verb "to be" — Questions',
        description: 'Am I? Are you? Is he/she/it?',
        difficulty: 3,
        grammarTip: 'For questions, invert the order: "She is happy" → "Is she happy?" Yes/No answers: "Yes, she is." / "No, she isn\'t."',
        exercises: [
            {
                type: 'word-order',
                prompt: 'Arrange: you / are / a teacher / ?',
                answer: 'Are you a teacher?',
                explanation: 'Verb to be + subject + complement + ?',
            },
            {
                type: 'fill-blank',
                prompt: '___ he from Mexico?',
                answer: 'Is',
                options: ['Am', 'Is', 'Are'],
                explanation: 'He → Is',
            },
            {
                type: 'fill-blank',
                prompt: '___ they happy?',
                answer: 'Are',
                options: ['Am', 'Is', 'Are'],
                explanation: 'They → Are',
            },
            {
                type: 'multiple-choice',
                prompt: 'How do you answer: "Is she a student?"',
                answer: 'Yes, she is.',
                options: ['Yes, she is.', 'Yes, she are.', 'Yes, she am.'],
                explanation: 'Short answer matches the subject: she → is',
            },
            {
                type: 'word-order',
                prompt: 'Arrange: it / is / a cat / ?',
                answer: 'Is it a cat?',
                explanation: 'Is + it + complement + ?',
            },
            {
                type: 'fill-blank',
                prompt: '___ I late?',
                answer: 'Am',
                options: ['Am', 'Is', 'Are'],
                explanation: 'I → Am',
            },
            {
                type: 'fill-blank',
                prompt: '___ we ready?',
                answer: 'Are',
                options: ['Am', 'Is', 'Are'],
                explanation: 'We → Are',
            },
            {
                type: 'multiple-choice',
                prompt: 'Which is a correct question?',
                answer: 'Are they friends?',
                options: ['They are friends?', 'Are they friends?', 'Is they friends?'],
                explanation: 'Invert: Are + they + complement?',
            },
        ],
    },
    // TODO: Add skills for units a1-u2 through a1-u7 (skip a1-u8 assessment)
];

// ===== A2 SKILLS =====
export const a2Skills: GrammarSkill[] = [
    // TODO: Define 3-5 skills per unit (a2-u1 through a2-u9, skip assessment)
];

// ===== B1 SKILLS =====
export const b1Skills: GrammarSkill[] = [
    // TODO: Define 3-5 skills per unit (b1-u1 through b1-u11, skip assessment)
];

// ===== B2 SKILLS =====
export const b2Skills: GrammarSkill[] = [
    // TODO: Define 3-5 skills per unit (b2-u1 through b2-u13, skip assessment)
];
```

**Step 3: Export from `src/data/curriculum/index.ts`**

Add to the existing exports:

```typescript
export { a1Skills, a2Skills, b1Skills, b2Skills } from './skills';
```

**Step 4: Add lookup helpers to `src/data/index.ts`**

Import and aggregate:

```typescript
import { a1Skills, a2Skills, b1Skills, b2Skills } from './curriculum';

export const allGrammarSkills = [...a1Skills, ...a2Skills, ...b1Skills, ...b2Skills];
export const getSkillsByUnit = (unitId: string) =>
    allGrammarSkills.filter(s => s.unitId === unitId);
export const getSkill = (skillId: string) =>
    allGrammarSkills.find(s => s.id === skillId);
```

**Step 5: Commit**

```bash
git add src/lib/db.ts src/data/curriculum/skills.ts src/data/curriculum/index.ts src/data/index.ts
git commit -m "feat(skill-mastery): add GrammarSkill types and A1-U1 skill definitions scaffold"
```

---

## Task 3: Create Supabase migration for `skill_cards` table

**Files:**
- Create: `supabase/migrations/20260311_create_skill_cards.sql` (or run via Supabase dashboard)

**Step 1: Write the SQL migration**

```sql
CREATE TABLE skill_cards (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    state SMALLINT NOT NULL DEFAULT 0,
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

-- Enable RLS
ALTER TABLE skill_cards ENABLE ROW LEVEL SECURITY;

-- RLS: users can only access their own skill cards
CREATE POLICY "Users can read own skill cards"
    ON skill_cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill cards"
    ON skill_cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill cards"
    ON skill_cards FOR UPDATE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_skill_cards_due ON skill_cards(user_id, due);
CREATE INDEX idx_skill_cards_unit ON skill_cards(user_id, unit_id);
```

**Step 2: Apply migration to Supabase**

Run via Supabase Dashboard SQL editor or CLI:
```bash
npx supabase db push
```

**Step 3: Commit**

```bash
git add supabase/
git commit -m "feat(skill-mastery): add skill_cards table migration with RLS"
```

---

## Task 4: Create `useSkillCards` hook

**Files:**
- Create: `src/hooks/useSkillCards.ts`

**Step 1: Create the hook**

This hook mirrors `useCards.ts` exactly but for `skill_cards`. Key functions: `dueSkillCards` query, `addSkillCards(unitId)`, `reviewSkillCard(card, rating)`.

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { calculateNextReview, Rating } from '../lib/fsrs';
import { CardState } from '../lib/db';
import type { SkillCard } from '../lib/db';
import type { SkillCardRow } from '../lib/database.types';
import { offlineInsert, offlineUpdate } from '../lib/offlineMutation';
import { getSkillsByUnit } from '../data';

const STABLE_THRESHOLD = 10; // stability > 10 days = stable skill

function rowToSkillCard(row: SkillCardRow): SkillCard {
    return {
        id: String(row.id),
        skillId: row.skill_id,
        unitId: row.unit_id,
        state: row.state as CardState,
        due: new Date(row.due),
        stability: row.stability,
        difficulty: row.difficulty,
        elapsedDays: row.elapsed_days,
        scheduledDays: row.scheduled_days,
        reps: row.reps,
        lapses: row.lapses,
        lastReview: row.last_review ? new Date(row.last_review) : undefined,
    };
}

export type ReviewDepth = 'mini_quiz' | 'deep_review';

export function getReviewDepth(card: SkillCard): ReviewDepth {
    if (card.state === CardState.Review && card.stability > STABLE_THRESHOLD) {
        return 'mini_quiz';
    }
    return 'deep_review';
}

export function useSkillCards() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const userId = user?.id;

    // Due skill cards
    const { data: dueSkillCardsRaw } = useQuery({
        queryKey: ['skill-cards', 'due', userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('skill_cards')
                .select('*')
                .lte('due', new Date().toISOString());
            return ((data ?? []) as SkillCardRow[]).map(rowToSkillCard);
        },
        enabled: !!userId,
    });

    // Total skill cards
    const { data: totalSkillCards } = useQuery({
        queryKey: ['skill-cards', 'count', userId],
        queryFn: async () => {
            const { count } = await supabase
                .from('skill_cards')
                .select('*', { count: 'exact', head: true });
            return count ?? 0;
        },
        enabled: !!userId,
    });

    // All skill cards for a specific unit (for LearningPath display)
    const getSkillCardsByUnit = useCallback(async (unitId: string): Promise<SkillCard[]> => {
        if (!userId) return [];
        const { data } = await supabase
            .from('skill_cards')
            .select('*')
            .eq('unit_id', unitId);
        return ((data ?? []) as SkillCardRow[]).map(rowToSkillCard);
    }, [userId]);

    // Create skill cards when a unit is completed
    const addSkillCards = useCallback(async (unitId: string) => {
        if (!userId) return 0;

        const skills = getSkillsByUnit(unitId);
        if (skills.length === 0) return 0;

        const tomorrow = new Date(Date.now() + 86400000).toISOString();
        let created = 0;

        for (const skill of skills) {
            try {
                await offlineInsert('skill_cards', {
                    user_id: userId,
                    skill_id: skill.id,
                    unit_id: unitId,
                    state: CardState.New,
                    due: tomorrow,
                    stability: 0,
                    difficulty: 0,
                    elapsed_days: 0,
                    scheduled_days: 1,
                    reps: 0,
                    lapses: 0,
                    last_review: null,
                });
                created++;
            } catch {
                // Likely duplicate (UNIQUE constraint) — skip silently
            }
        }

        qc.invalidateQueries({ queryKey: ['skill-cards'] });
        return created;
    }, [userId, qc]);

    // Review a skill card (same pattern as reviewCard in useCards)
    const reviewSkillCard = useCallback(async (card: SkillCard, rating: Rating) => {
        if (!userId) return null;

        // Adapt SkillCard to Card shape for FSRS (it expects wordId/storyId but doesn't use them in calculation)
        const cardForFSRS = {
            ...card,
            wordId: card.skillId,
            storyId: card.unitId,
        };
        const updates = calculateNextReview(cardForFSRS as any, rating);

        // Optimistic update
        qc.setQueryData(
            ['skill-cards', 'due', userId],
            (old: SkillCard[] | undefined) => {
                if (!old) return old;
                const now = new Date();
                return old
                    .map(c => c.id === card.id ? { ...c, ...updates } : c)
                    .filter(c => c.due <= now);
            },
        );

        try {
            await offlineUpdate('skill_cards', {
                state: updates.state,
                due: updates.due?.toISOString(),
                stability: updates.stability,
                difficulty: updates.difficulty,
                elapsed_days: updates.elapsedDays,
                scheduled_days: updates.scheduledDays,
                reps: updates.reps,
                lapses: updates.lapses,
                last_review: updates.lastReview?.toISOString(),
            }, { id: Number(card.id) });
        } catch {
            qc.invalidateQueries({ queryKey: ['skill-cards'] });
        }

        return updates;
    }, [userId, qc]);

    return {
        dueSkillCards: dueSkillCardsRaw ?? [],
        totalSkillCards: totalSkillCards ?? 0,
        addSkillCards,
        reviewSkillCard,
        getSkillCardsByUnit,
        getReviewDepth,
    };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useSkillCards.ts
git commit -m "feat(skill-mastery): add useSkillCards hook with FSRS integration"
```

---

## Task 5: Hook skill card creation into unit completion

**Files:**
- Modify: `src/pages/UnitFlow.tsx` (around line 219-228, the `handleCheckpointComplete` function)

**Step 1: Import useSkillCards in UnitFlow.tsx**

Add to imports:

```typescript
import { useSkillCards } from '../hooks/useSkillCards';
```

**Step 2: Use the hook and call addSkillCards on checkpoint completion**

Inside the component, add:

```typescript
const { addSkillCards } = useSkillCards();
```

Then modify `handleCheckpointComplete` (around line 219). Find the function that handles checkpoint success. After `updateProgress({ checkpoint_passed: true, completed_at: ... })`, add:

```typescript
// Create grammar skill cards for spaced repetition
const skillCount = await addSkillCards(unitId);
if (skillCount > 0) {
    toast.success({
        title: t('unitFlow.skillsAdded', '¡Habilidades de gramática añadidas!'),
        description: t('unitFlow.skillsAddedDesc', {
            count: skillCount,
            defaultValue: `${skillCount} habilidades añadidas a tu repaso`,
        }),
    });
}
```

**Step 3: Commit**

```bash
git add src/pages/UnitFlow.tsx
git commit -m "feat(skill-mastery): create skill cards on unit checkpoint completion"
```

---

## Task 6: Create GrammarReview component

**Files:**
- Create: `src/components/GrammarReview.tsx`

**Step 1: Create the component**

This component handles reviewing a single grammar skill. It shows exercises from the skill's static pool, then presents self-assessment buttons.

```typescript
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import type { SkillCard, GrammarSkill, SkillExercise } from '../lib/db';
import { Rating } from '../lib/fsrs';
import { type ReviewDepth } from '../hooks/useSkillCards';
import { BookOpen, CheckCircle2, XCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface Props {
    skillCard: SkillCard;
    skill: GrammarSkill;
    depth: ReviewDepth;
    onComplete: (rating: Rating) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function GrammarReview({ skillCard, skill, depth, onComplete }: Props) {
    const { t } = useTranslation();
    const exerciseCount = depth === 'mini_quiz' ? Math.min(4, skill.exercises.length) : Math.min(7, skill.exercises.length);
    const [exercises] = useState(() => shuffleArray(skill.exercises).slice(0, exerciseCount));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [showTip, setShowTip] = useState(depth === 'deep_review');
    const [showAssessment, setShowAssessment] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const currentExercise = exercises[currentIndex];
    const isLastExercise = currentIndex >= exercises.length - 1;

    const handleAnswer = useCallback((answer: string) => {
        if (answered) return;
        setAnswered(true);
        setSelectedAnswer(answer);
        const isCorrect = answer.trim().toLowerCase() === currentExercise.answer.trim().toLowerCase();
        if (isCorrect) setCorrectCount(c => c + 1);
    }, [answered, currentExercise]);

    const handleNext = useCallback(() => {
        if (isLastExercise) {
            setShowAssessment(true);
        } else {
            setCurrentIndex(i => i + 1);
            setAnswered(false);
            setSelectedAnswer(null);
        }
    }, [isLastExercise]);

    const dismissTip = () => setShowTip(false);

    // Self-assessment screen
    if (showAssessment) {
        const accuracy = exercises.length > 0 ? Math.round((correctCount / exercises.length) * 100) : 0;
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="text-center space-y-3">
                    <h3 className="text-xl font-bold">{skill.name}</h3>
                    <p className="text-text-secondary text-sm">
                        {correctCount}/{exercises.length} correct ({accuracy}%)
                    </p>
                </div>

                <p className="text-center text-text-muted text-sm">
                    {t('review.howWasIt', 'How well did you know this?')}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { rating: Rating.Again, label: t('review.again', 'Again'), desc: t('review.againDesc', "I forgot"), color: 'bg-red-500/10 border-red-500/30 text-red-400' },
                        { rating: Rating.Hard, label: t('review.hard', 'Hard'), desc: t('review.hardDesc', 'Difficult'), color: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
                        { rating: Rating.Good, label: t('review.good', 'Good'), desc: t('review.goodDesc', 'I knew it'), color: 'bg-green-500/10 border-green-500/30 text-green-400' },
                        { rating: Rating.Easy, label: t('review.easy', 'Easy'), desc: t('review.easyDesc', 'Very easy'), color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
                    ].map(({ rating, label, desc, color }) => (
                        <button
                            key={rating}
                            onClick={() => onComplete(rating)}
                            className={`border rounded-xl p-4 text-center transition-all hover:scale-[1.02] ${color}`}
                        >
                            <p className="font-bold text-sm">{label}</p>
                            <p className="text-xs opacity-70 mt-1">{desc}</p>
                        </button>
                    ))}
                </div>
            </motion.div>
        );
    }

    // Grammar tip screen (deep review only)
    if (showTip) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="space-y-2">
                    <h3 className="text-lg font-bold">{skill.name}</h3>
                    <p className="text-text-muted text-sm">{skill.description}</p>
                </div>

                <div className="widget border-l-4 border-primary space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                        <Lightbulb className="w-4 h-4" />
                        <span className="text-sm font-bold">{t('review.grammarTip', 'Grammar Tip')}</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{skill.grammarTip}</p>
                </div>

                <button
                    onClick={dismissTip}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    {t('review.startExercises', 'Start Exercises')}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </motion.div>
        );
    }

    // Exercise screen
    const isCorrect = selectedAnswer?.trim().toLowerCase() === currentExercise.answer.trim().toLowerCase();

    return (
        <div className="space-y-8">
            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-text-muted">
                    <span>{skill.name}</span>
                    <span>{currentIndex + 1}/{exercises.length}</span>
                </div>
                <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
                    <motion.div
                        animate={{ width: `${((currentIndex + (answered ? 1 : 0)) / exercises.length) * 100}%` }}
                        className="h-full bg-primary rounded-full"
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Exercise */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="space-y-6"
                >
                    <p className="text-base font-semibold leading-relaxed">{currentExercise.prompt}</p>

                    {/* Multiple choice / fill-blank with options */}
                    {currentExercise.options && currentExercise.options.length > 0 ? (
                        <div className="space-y-3">
                            {currentExercise.options.map((option) => {
                                const isSelected = selectedAnswer === option;
                                const isOptionCorrect = option.trim().toLowerCase() === currentExercise.answer.trim().toLowerCase();
                                let optionClass = 'border-border hover:border-primary/50';
                                if (answered) {
                                    if (isOptionCorrect) optionClass = 'border-green-500 bg-green-500/10';
                                    else if (isSelected && !isOptionCorrect) optionClass = 'border-red-500 bg-red-500/10';
                                    else optionClass = 'border-border opacity-50';
                                }
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswer(option)}
                                        disabled={answered}
                                        className={`w-full text-left border rounded-xl p-4 transition-all ${optionClass}`}
                                    >
                                        <span className="text-sm">{option}</span>
                                        {answered && isOptionCorrect && <CheckCircle2 className="w-4 h-4 text-green-400 inline ml-2" />}
                                        {answered && isSelected && !isOptionCorrect && <XCircle className="w-4 h-4 text-red-400 inline ml-2" />}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        /* Free-form input for word-order / no-options exercises */
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder={t('review.typeAnswer', 'Type your answer...')}
                                disabled={answered}
                                className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAnswer((e.target as HTMLInputElement).value);
                                    }
                                }}
                            />
                            {!answered && (
                                <p className="text-xs text-text-muted">{t('review.pressEnter', 'Press Enter to submit')}</p>
                            )}
                        </div>
                    )}

                    {/* Feedback */}
                    {answered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className={`rounded-xl p-4 text-sm ${isCorrect ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                                {isCorrect ? (
                                    <p className="font-semibold">{t('review.correct', 'Correct!')}</p>
                                ) : (
                                    <p><span className="font-semibold">{t('review.incorrect', 'Incorrect.')}</span> {t('review.correctAnswer', 'Answer')}: <span className="font-bold">{currentExercise.answer}</span></p>
                                )}
                                <p className="text-xs mt-2 opacity-80">{currentExercise.explanation}</p>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                            >
                                {isLastExercise ? t('review.finish', 'Finish') : t('review.next', 'Next')}
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add src/components/GrammarReview.tsx
git commit -m "feat(skill-mastery): add GrammarReview component with adaptive depth"
```

---

## Task 7: Integrate grammar review into ReviewSession

**Files:**
- Modify: `src/pages/ReviewSession.tsx`

**Step 1: Add grammar tab and integrate GrammarReview**

This is the biggest UI change. The ReviewSession page needs:
1. A top-level tab selector: Vocabulary | Grammar
2. When Grammar is selected, iterate through `dueSkillCards` showing `GrammarReview` for each
3. Self-assessment buttons feed into `reviewSkillCard(card, rating)`

Replace the entire `ReviewSession.tsx` content. The key changes:
- Import `useSkillCards` and `GrammarReview`
- Add a `reviewType` state: `'vocab' | 'grammar'`
- When `reviewType === 'grammar'`, show grammar review flow
- The vocab flow stays exactly as-is

Add imports at the top:

```typescript
import { useSkillCards, getReviewDepth } from '../hooks/useSkillCards';
import GrammarReview from '../components/GrammarReview';
import { getSkill } from '../data';
```

Add to the component body (after `useCards()`):

```typescript
const { dueSkillCards, reviewSkillCard } = useSkillCards();
const [reviewType, setReviewType] = useState<'vocab' | 'grammar' | null>(null);
```

Before the mode selector (line 105), add a type selector if both have due cards:

```typescript
if (!reviewType && (dueCards.length > 0 || dueSkillCards.length > 0)) {
    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-center">{t('review.chooseType', 'What do you want to review?')}</h2>
            <div className="space-y-4">
                {dueCards.length > 0 && (
                    <button
                        onClick={() => setReviewType('vocab')}
                        className="w-full widget hover:border-primary/50 transition-all text-left space-y-1"
                    >
                        <p className="font-bold">{t('review.vocabulary', 'Vocabulary')}</p>
                        <p className="text-sm text-text-muted">{dueCards.length} {t('review.wordsDue', 'words due')}</p>
                    </button>
                )}
                {dueSkillCards.length > 0 && (
                    <button
                        onClick={() => setReviewType('grammar')}
                        className="w-full widget hover:border-primary/50 transition-all text-left space-y-1"
                    >
                        <p className="font-bold">{t('review.grammar', 'Grammar')}</p>
                        <p className="text-sm text-text-muted">{dueSkillCards.length} {t('review.skillsDue', 'skills due')}</p>
                    </button>
                )}
            </div>
        </div>
    );
}
```

For the grammar review flow, add a parallel block to the vocab flow:

```typescript
// Grammar review flow
if (reviewType === 'grammar') {
    const currentSkillCard = dueSkillCards[0];
    const currentSkill = currentSkillCard ? getSkill(currentSkillCard.skillId) : undefined;

    if (!currentSkillCard || !currentSkill) {
        // No more due skill cards
        return (/* session done UI — same pattern as vocab */);
    }

    const depth = getReviewDepth(currentSkillCard);

    return (
        <div className="space-y-10">
            <style>{`.floating-bar { display: none !important; }`}</style>
            <GrammarReview
                key={currentSkillCard.id}
                skillCard={currentSkillCard}
                skill={currentSkill}
                depth={depth}
                onComplete={async (rating) => {
                    await reviewSkillCard(currentSkillCard, rating);
                    // Check if session done
                    if (dueSkillCards.length <= 1) {
                        setSessionDone(true);
                    }
                }}
            />
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add src/pages/ReviewSession.tsx
git commit -m "feat(skill-mastery): integrate grammar review tab into ReviewSession"
```

---

## Task 8: Add grammar skill count to Dashboard

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Step 1: Import and use skill cards**

Add import:

```typescript
import { useSkillCards } from '../hooks/useSkillCards';
```

Add to component body (after `useCards()` on line 24):

```typescript
const { dueSkillCards } = useSkillCards();
```

**Step 2: Add grammar review card**

After the existing "Hero Card — Review" section (after line 183), add:

```typescript
{/* Grammar Skills Review */}
{dueSkillCards.length > 0 && (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        onClick={() => navigate('/review')}
        className="widget cursor-pointer group hover:border-primary/50 transition-all"
    >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <BookOpen className="w-5 h-5 text-accent-purple" />
                <div>
                    <p className="font-bold group-hover:text-primary transition-colors">
                        {dueSkillCards.length} {t('dashboard.grammarSkills', 'grammar skills')} {t('dashboard.pendingReview')}
                    </p>
                    <p className="text-xs text-text-muted mt-1">{t('dashboard.grammarReviewDesc', 'Review your grammar knowledge')}</p>
                </div>
            </div>
            <ArrowRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
        </div>
    </motion.div>
)}
```

Note: Import `BookOpen` is already imported in Dashboard.

**Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(skill-mastery): show grammar skills due count on Dashboard"
```

---

## Task 9: Show skill mastery on LearningPath completed units

**Files:**
- Create: `src/components/SkillBreakdown.tsx`
- Modify: `src/pages/LearningPath.tsx`

**Step 1: Create SkillBreakdown component**

```typescript
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { SkillCard, GrammarSkill } from '../lib/db';
import { CardState } from '../lib/db';
import { getSkillsByUnit } from '../data';
import { useSkillCards } from '../hooks/useSkillCards';

interface Props {
    unitId: string;
}

export default function SkillBreakdown({ unitId }: Props) {
    const skills = getSkillsByUnit(unitId);
    const { getSkillCardsByUnit } = useSkillCards();
    const [cards, setCards] = useState<SkillCard[]>([]);

    useEffect(() => {
        getSkillCardsByUnit(unitId).then(setCards);
    }, [unitId, getSkillCardsByUnit]);

    if (skills.length === 0) return null;

    const cardMap = new Map(cards.map(c => [c.skillId, c]));
    const masteredCount = cards.filter(c => c.state === CardState.Review && c.stability > 10).length;

    return (
        <div className="space-y-3 mt-3">
            {/* Mastery bar */}
            <div className="flex items-center gap-2 text-xs">
                <span className="text-text-muted">Skills:</span>
                <div className="flex-1 h-1.5 bg-bg-app rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${skills.length > 0 ? (masteredCount / skills.length) * 100 : 0}%` }}
                    />
                </div>
                <span className="text-text-secondary font-bold">{masteredCount}/{skills.length}</span>
            </div>

            {/* Skill list */}
            <div className="space-y-1.5">
                {skills.map(skill => {
                    const card = cardMap.get(skill.id);
                    const isDue = card && new Date(card.due) <= new Date();
                    const isMastered = card && card.state === CardState.Review && card.stability > 10;

                    return (
                        <div key={skill.id} className="flex items-center gap-2 text-xs">
                            {isMastered ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                            ) : isDue ? (
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            ) : card ? (
                                <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                            ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0" />
                            )}
                            <span className={`${isDue ? 'text-amber-400' : isMastered ? 'text-green-400' : 'text-text-muted'}`}>
                                {skill.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
```

**Step 2: Add SkillBreakdown to LearningPath UnitCard**

In `src/pages/LearningPath.tsx`, import:

```typescript
import SkillBreakdown from '../components/SkillBreakdown';
```

In the `UnitCard` component, after the ProgressCheck section (after line 318), add:

```typescript
{/* Skill mastery breakdown for completed units */}
{isCompleted && !isAssessment && (
    <SkillBreakdown unitId={unit.id} />
)}
```

**Step 3: Commit**

```bash
git add src/components/SkillBreakdown.tsx src/pages/LearningPath.tsx
git commit -m "feat(skill-mastery): show skill mastery breakdown on completed units in LearningPath"
```

---

## Task 10: Populate grammar skills data for remaining units

**Files:**
- Modify: `src/data/curriculum/skills.ts`

**Step 1: Add skill definitions for all 40 regular units**

This is the largest content task. For each non-assessment unit, define 3-5 skills with 8-12 exercises each, following the exact pattern from Task 2's A1-U1 example.

**Structure per level:**
- A1: 7 regular units (u1–u7), skip u8 (assessment) = ~21-35 skills
- A2: 9 regular units, skip assessment = ~27-45 skills
- B1: 11 regular units, skip assessment = ~33-55 skills
- B2: 13 regular units, skip assessment = ~39-65 skills

**Total: ~120-200 skills, ~960-2400 exercises**

Each skill MUST have:
- `id`: pattern `{level}-u{n}-s{n}` (e.g., `a1-u3-s1`)
- `unitId`: matching the unit's `id` in the curriculum
- `name`: clear English name of the sub-skill
- `description`: one-line summary
- `difficulty`: 1-5, ordered within the unit
- `grammarTip`: concise rule reminder (1-3 sentences)
- `exercises`: 8-12 exercises of mixed types (`fill-blank`, `multiple-choice`, `word-order`)

Refer to each unit's `grammarTopic` from the curriculum files to determine appropriate skills:
- `a1.ts` → a1Units grammarTopic field
- `a2.ts` → a2Units grammarTopic field
- `b1.ts` → b1Units grammarTopic field
- `b2-units.ts` → b2Units grammarTopic field

**Step 2: Commit**

```bash
git add src/data/curriculum/skills.ts
git commit -m "feat(skill-mastery): populate grammar skills for all A1-B2 units"
```

---

## Task 11: Add i18n translation keys

**Files:**
- Modify: i18n translation files (check `src/i18n/` or `public/locales/`)

**Step 1: Find and update translation files**

Add keys used in the new components:

```json
{
    "review.chooseType": "¿Qué quieres repasar?",
    "review.vocabulary": "Vocabulario",
    "review.grammar": "Gramática",
    "review.wordsDue": "palabras pendientes",
    "review.skillsDue": "habilidades pendientes",
    "review.howWasIt": "¿Qué tan bien conocías esto?",
    "review.again": "Otra vez",
    "review.againDesc": "Lo olvidé",
    "review.hard": "Difícil",
    "review.hardDesc": "Me costó",
    "review.good": "Bien",
    "review.goodDesc": "Lo sabía",
    "review.easy": "Fácil",
    "review.easyDesc": "Muy fácil",
    "review.grammarTip": "Tip de gramática",
    "review.startExercises": "Comenzar ejercicios",
    "review.typeAnswer": "Escribe tu respuesta...",
    "review.pressEnter": "Presiona Enter para enviar",
    "review.correct": "¡Correcto!",
    "review.incorrect": "Incorrecto.",
    "review.correctAnswer": "Respuesta",
    "review.finish": "Terminar",
    "review.next": "Siguiente",
    "unitFlow.skillsAdded": "¡Habilidades de gramática añadidas!",
    "unitFlow.skillsAddedDesc": "{{count}} habilidades añadidas a tu repaso",
    "dashboard.grammarSkills": "habilidades gramaticales",
    "dashboard.grammarReviewDesc": "Repasa tu conocimiento de gramática"
}
```

**Step 2: Commit**

```bash
git add src/i18n/ public/locales/
git commit -m "feat(skill-mastery): add i18n translation keys for grammar review UI"
```

---

## Task 12: Final integration test and deploy

**Step 1: Run build to check for type errors**

```bash
npm run build
```

Expected: Clean build with no TypeScript errors.

**Step 2: Manual smoke test**

1. Open the app, complete a unit's checkpoint → verify skill cards toast appears
2. Next day (or manually set `due` to past in Supabase): open Review Session → verify Grammar tab appears
3. Complete a grammar review → verify self-assessment buttons work and card disappears from due list
4. Check Dashboard → verify grammar skills count shows
5. Check LearningPath → verify completed units show skill breakdown

**Step 3: Deploy**

```bash
npx vercel --prod
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(skill-mastery): complete Skill Mastery System integration"
git push origin master
```
