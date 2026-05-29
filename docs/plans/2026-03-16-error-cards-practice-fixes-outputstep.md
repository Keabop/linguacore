# Error Cards + Practice Fixes + OutputStep UX — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add personalized error review with FSRS spaced repetition, fix Practice page UX (responsive history, level selection flow, free topic), and add "Ya puedo hablar" button in OutputStep.

**Architecture:** Error cards are extracted from AI corrections (tutor + writing evaluator), stored in Supabase with FSRS fields, and reviewed as a third type in ReviewSession. Practice page gets a 2-step level→topic flow with AnimatePresence. OutputStep gets a simple state reset button.

**Tech Stack:** React 19, TypeScript, Supabase (RLS), React Query, FSRS-4.5, Framer Motion, Tailwind CSS v4, i18next

---

## Task 1: "Ya puedo hablar" Button in OutputStep

**Files:**
- Modify: `src/components/OutputStep.tsx:234-254`
- Modify: `src/i18n/es.json` (add key)

**Step 1: Add i18n key**

In `src/i18n/es.json`, inside the `"unitFlow"` section, add:

```json
"canSpeakNow": "Ya puedo hablar"
```

**Step 2: Add the "Ya puedo hablar" button to the deferred speaking UI**

In `src/components/OutputStep.tsx`, find the deferred speaking block (lines 234-254). Currently it shows the Clock icon, timer text, and a "Volver a la ruta" button. Add a second button BEFORE the "Volver a la ruta" button:

Replace lines 248-253 (the single button) with TWO buttons:

```tsx
<div className="flex flex-col gap-3">
    <button
        onClick={() => {
            clearDeferred(unitId);
            setSpeakingDeferred(null);
        }}
        className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
    >
        <Mic className="w-4 h-4" /> {t('unitFlow.canSpeakNow', 'Ya puedo hablar')}
    </button>
    <button
        onClick={() => navigate('/path')}
        className="w-full bg-bg-card border border-border hover:bg-bg-card-hover text-text-secondary py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
    >
        Volver a la ruta
    </button>
</div>
```

Note: `Mic` is NOT currently imported. Add it to the existing import on line 4:
```tsx
import { PenLine, Mic, CheckCircle2, Clock, MicOff, WifiOff, BookOpen } from 'lucide-react';
```

Also need `useTranslation` — add import:
```tsx
import { useTranslation } from 'react-i18next';
```
And add `const { t } = useTranslation();` at the top of the component (line 42, after `const navigate = useNavigate();`).

**Step 3: Verify the build compiles**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/OutputStep.tsx src/i18n/es.json
git commit -m "feat: add 'Ya puedo hablar' button to resume speaking in OutputStep"
```

---

## Task 2: Practice Page — Hide Levels on Selection + Back Button

**Files:**
- Modify: `src/pages/Practice.tsx:74-120` (main component)
- Modify: `src/i18n/es.json` (add keys)

**Step 1: Add i18n keys**

In `src/i18n/es.json`, inside the `"practice"` section, add:

```json
"freeTopic": "Tema libre",
"freeTopicDesc": "Escribe sobre lo que quieras",
"backToLevels": "Cambiar nivel",
"allLevels": "Todos los niveles"
```

**Step 2: Refactor the main Practice component for 2-step flow**

Replace the Practice component (lines 74-120) with this logic:

- Add state: `const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | null>(null);`
- Remove the old `level` state (line 78)
- Derive `level` from `selectedLevel` (for passing to sub-components)

When `selectedLevel === null`: show the 4 level buttons (A1/A2/B1/B2) as large cards with AnimatePresence.

When `selectedLevel !== null`: show a compact header with the selected level badge + back button (ArrowLeft icon), then the tab selector and content below.

```tsx
export default function Practice() {
    const { t } = useTranslation();
    const { user } = useLevelProgression();
    const [tab, setTab] = useState<Tab>('writing');
    const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | null>(null);

    // Level selection screen
    if (!selectedLevel) {
        return (
            <div className="space-y-12">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-extrabold">Práctica libre</h1>
                    <p className="text-text-secondary text-sm mt-1">Practica tu escritura y habla cuando quieras.</p>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                    {LEVELS.map((l, i) => (
                        <motion.button
                            key={l}
                            onClick={() => setSelectedLevel(l)}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:bg-bg-card-hover transition-all text-center space-y-2"
                        >
                            <span className="text-3xl font-extrabold text-primary">{l}</span>
                            <p className="text-xs text-text-muted">
                                {l === 'A1' ? 'Principiante' : l === 'A2' ? 'Básico' : l === 'B1' ? 'Intermedio' : 'Avanzado'}
                            </p>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    // Active practice with selected level
    return (
        <div className="space-y-8">
            {/* Header with back + level badge */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <button
                    onClick={() => setSelectedLevel(null)}
                    className="p-2 rounded-lg bg-bg-card border border-border hover:bg-bg-card-hover transition-all"
                >
                    <ArrowLeft className="w-4 h-4 text-text-secondary" />
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold">Práctica libre</h1>
                    <span className="text-xs font-bold text-primary">{selectedLevel} — {selectedLevel === 'A1' ? 'Principiante' : selectedLevel === 'A2' ? 'Básico' : selectedLevel === 'B1' ? 'Intermedio' : 'Avanzado'}</span>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4">
                <button onClick={() => setTab('writing')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'writing' ? 'bg-primary text-white' : 'bg-bg-card border border-border text-text-secondary hover:text-white'}`}>
                    <PenLine className="w-4 h-4" /> Escritura
                </button>
                <button onClick={() => setTab('speaking')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'speaking' ? 'bg-primary text-white' : 'bg-bg-card border border-border text-text-secondary hover:text-white'}`}>
                    <Mic className="w-4 h-4" /> Habla
                </button>
            </div>

            {/* Content */}
            <motion.div key={`${tab}-${selectedLevel}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {tab === 'writing' ? (
                    <WritingPractice level={selectedLevel} />
                ) : (
                    <SpeakingPractice level={selectedLevel} />
                )}
            </motion.div>
        </div>
    );
}
```

Add `ArrowLeft` to the lucide-react import on line 4.

**Step 3: Verify the build compiles**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/pages/Practice.tsx src/i18n/es.json
git commit -m "feat(practice): 2-step level selection with back button and level badge"
```

---

## Task 3: Practice Page — Free Topic Option + Responsive History Fix

**Files:**
- Modify: `src/pages/Practice.tsx:20-49` (WRITING_TOPICS) and `WritingPractice` sub-component
- Modify: `src/i18n/es.json`

**Step 1: Add "Tema libre" to WRITING_TOPICS**

Add a special entry at the beginning of each level's topic array in `WRITING_TOPICS` (lines 20-49). Use a sentinel value:

```typescript
const FREE_TOPIC = '__FREE_TOPIC__';

const WRITING_TOPICS: Record<string, string[]> = {
    A1: [
        FREE_TOPIC,
        'Describe your family in 3-4 sentences.',
        // ... existing topics
    ],
    A2: [
        FREE_TOPIC,
        'Write about your last vacation.',
        // ... existing topics
    ],
    B1: [
        FREE_TOPIC,
        'Write a short opinion about social media.',
        // ... existing topics
    ],
    B2: [
        FREE_TOPIC,
        'Discuss the pros and cons of remote work.',
        // ... existing topics
    ],
};
```

**Step 2: Update WritingPractice to handle free topic**

In `WritingPractice`, modify `handleSelectTopic` to handle the free topic case:

When `topic === FREE_TOPIC`:
- Set `selectedTopic` to a generic prompt like `"Free writing: write about any topic you want at ${level} level."`
- This ensures the AI evaluator receives a prompt that tells it to evaluate freely

Modify the topic list rendering (lines 219-225) to render the free topic differently:

```tsx
{topics.map((topic, i) => (
    <motion.button key={i} onClick={() => handleSelectTopic(topic)}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
        className={`w-full text-left bg-bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:bg-bg-card-hover transition-all ${topic === FREE_TOPIC ? 'border-dashed border-primary/20' : ''}`}>
        {topic === FREE_TOPIC ? (
            <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                    <p className="text-sm text-white font-semibold">{t('practice.freeTopic', 'Tema libre')}</p>
                    <p className="text-xs text-text-muted">{t('practice.freeTopicDesc', 'Escribe sobre lo que quieras')}</p>
                </div>
            </div>
        ) : (
            <p className="text-sm text-white">{topic}</p>
        )}
    </motion.button>
))}
```

Update `handleSelectTopic`:

```tsx
const handleSelectTopic = (topic: string) => {
    const actualTopic = topic === FREE_TOPIC
        ? `Free writing: write about any topic you choose. Evaluate at CEFR ${level} level.`
        : topic;
    setSelectedTopic(actualTopic);
    setText('');
    setPhase('writing');
    setFeedback(null);
    setError(null);
    setSaved(false);
};
```

**Step 3: Fix responsive history layout**

The history items in the `select` phase (lines 227-266) need responsive fixes:

1. Ensure the history section uses `overflow-hidden` to prevent layout breaking
2. Add `break-words` to the text truncation
3. Make the date/score row wrap properly on mobile

Replace the history entry button content (lines 247-261):

```tsx
<div className="flex flex-wrap justify-between items-center gap-2">
    <span className="text-xs text-text-muted">
        {new Date(entry.submitted_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
    </span>
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
        entry.score >= 80 ? 'bg-green-500/10 text-green-400' :
        entry.score >= 60 ? 'bg-accent-orange/10 text-accent-orange' :
        'bg-accent-red/10 text-accent-red'
    }`}>{entry.score}%</span>
</div>
<p className="text-sm text-white truncate break-all">{entry.user_text}</p>
<p className="text-xs text-accent-blue flex items-center gap-1">
    <Eye className="w-3 h-3 flex-shrink-0" /> {t('practice.viewFeedback')}
</p>
```

**Step 4: Verify the build**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/pages/Practice.tsx src/i18n/es.json
git commit -m "feat(practice): add free topic option and fix responsive history layout"
```

---

## Task 4: Error Cards — Supabase Migration + Types

**Files:**
- Create: `supabase/migrations/20260316_create_error_cards.sql`
- Modify: `src/lib/database.types.ts` (add `ErrorCardRow`)
- Modify: `src/lib/db.ts` (add `ErrorCard` interface)

**Step 1: Create migration SQL**

```sql
-- Error cards: personalized error review with FSRS spaced repetition
CREATE TABLE error_cards (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    error_pattern TEXT NOT NULL,
    original_sentence TEXT NOT NULL,
    corrected_sentence TEXT NOT NULL,
    explanation TEXT NOT NULL,
    error_type TEXT NOT NULL CHECK (error_type IN ('grammar', 'vocabulary', 'spelling', 'style')),
    source TEXT NOT NULL CHECK (source IN ('tutor', 'writing', 'unit')),
    example_variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- FSRS fields
    state INTEGER NOT NULL DEFAULT 0,
    due TIMESTAMPTZ NOT NULL DEFAULT now(),
    stability REAL NOT NULL DEFAULT 0,
    difficulty REAL NOT NULL DEFAULT 0,
    elapsed_days INTEGER NOT NULL DEFAULT 0,
    scheduled_days INTEGER NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    last_review TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE error_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own error cards"
    ON error_cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own error cards"
    ON error_cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own error cards"
    ON error_cards FOR UPDATE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_error_cards_user_due ON error_cards (user_id, due);
CREATE INDEX idx_error_cards_user_pattern ON error_cards (user_id, error_pattern);
```

**Step 2: Add ErrorCardRow type to `src/lib/database.types.ts`**

After `ConversationSessionRow` (line 130), add:

```typescript
export type ErrorCardRow = {
    id: number;
    user_id: string;
    error_pattern: string;
    original_sentence: string;
    corrected_sentence: string;
    explanation: string;
    error_type: 'grammar' | 'vocabulary' | 'spelling' | 'style';
    source: 'tutor' | 'writing' | 'unit';
    example_variants: string[];
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

Also add the `error_cards` table entry to the `Database` type (after `conversation_sessions` block, around line 201):

```typescript
error_cards: {
    Row: ErrorCardRow;
    Insert: Omit<ErrorCardRow, 'id' | 'created_at'>;
    Update: Partial<Omit<ErrorCardRow, 'id' | 'created_at'>>;
    Relationships: [];
};
```

**Step 3: Add ErrorCard interface to `src/lib/db.ts`**

After the `SkillCard` interface (around line 60), add:

```typescript
export interface ErrorCard {
    id: string;
    errorPattern: string;
    originalSentence: string;
    correctedSentence: string;
    explanation: string;
    errorType: 'grammar' | 'vocabulary' | 'spelling' | 'style';
    source: 'tutor' | 'writing' | 'unit';
    exampleVariants: string[];
    state: CardState;
    due: Date;
    stability: number;
    difficulty: number;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    lastReview?: Date;
}
```

**Step 4: Verify the build**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add supabase/migrations/20260316_create_error_cards.sql src/lib/database.types.ts src/lib/db.ts
git commit -m "feat(error-cards): add migration, row type, and ErrorCard interface"
```

---

## Task 5: Error Cards — `useErrorCards` Hook

**Files:**
- Create: `src/hooks/useErrorCards.ts`

**Step 1: Create the hook**

Follow the exact same pattern as `src/hooks/useSkillCards.ts`. The hook provides:

- `dueErrorCards: ErrorCard[]` — cards where `due <= now()`
- `totalErrorCards: number` — total count
- `addErrorCard(correction, source)` — creates a card from an AI correction, with deduplication
- `reviewErrorCard(card, rating)` — FSRS review, same flow as `reviewSkillCard`

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { calculateNextReview, Rating } from '../lib/fsrs';
import { CardState } from '../lib/db';
import type { ErrorCard } from '../lib/db';
import type { ErrorCardRow } from '../lib/database.types';
import { offlineInsert, offlineUpdate } from '../lib/offlineMutation';

function rowToErrorCard(row: ErrorCardRow): ErrorCard {
    return {
        id: String(row.id),
        errorPattern: row.error_pattern,
        originalSentence: row.original_sentence,
        correctedSentence: row.corrected_sentence,
        explanation: row.explanation,
        errorType: row.error_type,
        source: row.source,
        exampleVariants: (row.example_variants || []) as string[],
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

export interface CorrectionInput {
    original: string;
    corrected: string;
    explanation: string;
    type?: 'grammar' | 'vocabulary' | 'spelling' | 'style';
}

export function useErrorCards() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const userId = user?.id;

    const { data: dueErrorCardsRaw } = useQuery({
        queryKey: ['error-cards', 'due', userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('error_cards')
                .select('*')
                .lte('due', new Date().toISOString());
            return ((data ?? []) as ErrorCardRow[]).map(rowToErrorCard);
        },
        enabled: !!userId,
    });

    const { data: totalErrorCards } = useQuery({
        queryKey: ['error-cards', 'count', userId],
        queryFn: async () => {
            const { count } = await supabase
                .from('error_cards')
                .select('*', { count: 'exact', head: true });
            return count ?? 0;
        },
        enabled: !!userId,
    });

    const addErrorCard = useCallback(async (
        correction: CorrectionInput,
        source: 'tutor' | 'writing' | 'unit',
        exampleVariants: string[] = [],
    ): Promise<boolean> => {
        if (!userId) return false;

        // Build a short error pattern from original → corrected
        const pattern = `${correction.original} → ${correction.corrected}`.slice(0, 200);

        // Deduplication: check if a similar pattern already exists
        const { data: existing } = await supabase
            .from('error_cards')
            .select('id, stability, reps')
            .eq('error_pattern', pattern)
            .limit(1);

        if (existing && existing.length > 0) {
            // Reinforce: lower stability so it appears sooner
            const card = existing[0];
            if (card.stability > 1) {
                await offlineUpdate('error_cards', {
                    stability: Math.max(0.5, card.stability * 0.5),
                    due: new Date().toISOString(),
                }, { id: card.id });
                qc.invalidateQueries({ queryKey: ['error-cards'] });
            }
            return false; // Not a new card
        }

        try {
            await offlineInsert('error_cards', {
                user_id: userId,
                error_pattern: pattern,
                original_sentence: correction.original,
                corrected_sentence: correction.corrected,
                explanation: correction.explanation,
                error_type: correction.type || 'grammar',
                source,
                example_variants: exampleVariants,
                state: CardState.New,
                due: new Date().toISOString(),
                stability: 0,
                difficulty: 0,
                elapsed_days: 0,
                scheduled_days: 0,
                reps: 0,
                lapses: 0,
                last_review: null,
            });
            qc.invalidateQueries({ queryKey: ['error-cards'] });
            return true;
        } catch {
            return false;
        }
    }, [userId, qc]);

    const reviewErrorCard = useCallback(async (card: ErrorCard, rating: Rating) => {
        if (!userId) return null;

        const cardForFSRS = {
            ...card,
            wordId: card.errorPattern,
            storyId: card.source,
        };
        const updates = calculateNextReview(cardForFSRS as any, rating);

        // Optimistic update
        qc.setQueryData(
            ['error-cards', 'due', userId],
            (old: ErrorCard[] | undefined) => {
                if (!old) return old;
                const now = new Date();
                return old
                    .map(c => c.id === card.id ? { ...c, ...updates } : c)
                    .filter(c => c.due <= now);
            },
        );

        try {
            await offlineUpdate('error_cards', {
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
            qc.invalidateQueries({ queryKey: ['error-cards'] });
        }

        return updates;
    }, [userId, qc]);

    return {
        dueErrorCards: dueErrorCardsRaw ?? [],
        totalErrorCards: totalErrorCards ?? 0,
        addErrorCard,
        reviewErrorCard,
    };
}
```

**Step 2: Verify the build**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/hooks/useErrorCards.ts
git commit -m "feat(error-cards): add useErrorCards hook with FSRS and deduplication"
```

---

## Task 6: Error Cards — Extract from ConversationTutor

**Files:**
- Modify: `src/pages/ConversationTutor.tsx`

**Step 1: Import and use `useErrorCards`**

Add import:
```typescript
import { useErrorCards } from '../hooks/useErrorCards';
```

Add hook call inside the component (after existing hooks):
```typescript
const { addErrorCard } = useErrorCards();
```

**Step 2: Extract corrections after receiving AI response**

In the `sendMessage` callback, after the assistant message is added to state (after the line that pushes to `setMessages`), add correction extraction:

```typescript
// Extract corrections as error cards
if (response.corrections && response.corrections.length > 0) {
    for (const c of response.corrections) {
        addErrorCard({
            original: c.original,
            corrected: c.corrected,
            explanation: c.explanation,
        }, 'tutor');
    }
}
```

This goes after line ~74 (after `setMessages(prev => [...prev, { role: 'assistant', ... }])`).

**Step 3: Verify the build**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/pages/ConversationTutor.tsx
git commit -m "feat(error-cards): extract corrections from conversation tutor"
```

---

## Task 7: Error Cards — Extract from Writing Practice

**Files:**
- Modify: `src/pages/Practice.tsx` (WritingPractice sub-component)

**Step 1: Import and use `useErrorCards`**

Add import at top of file:
```typescript
import { useErrorCards } from '../hooks/useErrorCards';
```

Inside `WritingPractice`, add hook:
```typescript
const { addErrorCard } = useErrorCards();
```

**Step 2: Extract corrections after receiving writing evaluation**

In `handleSubmit` (lines 163-175), after `setFeedback(result)` and before `setPhase('feedback')`, add:

```typescript
// Extract corrections as error cards
if (result.corrections && result.corrections.length > 0) {
    for (const c of result.corrections) {
        addErrorCard({
            original: c.original,
            corrected: c.corrected,
            explanation: c.explanation,
            type: c.type,
        }, 'writing');
    }
}
```

**Step 3: Verify the build**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/pages/Practice.tsx
git commit -m "feat(error-cards): extract corrections from writing evaluations"
```

---

## Task 8: Error Cards — ErrorReview Component

**Files:**
- Create: `src/components/ErrorReview.tsx`

**Step 1: Create the ErrorReview component**

This component displays one error card for review. Two modes based on card state:
- **New/weak cards** (state != Review or stability <= 10): Show the error sentence, ask user to identify/correct the error via multiple choice
- **Stable cards**: Show the original (incorrect) sentence, user types the correction

After answering, show feedback with explanation, then FSRS self-assessment buttons (Again/Hard/Good/Easy).

```typescript
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Rating } from '../lib/fsrs';
import { CardState } from '../lib/db';
import type { ErrorCard } from '../lib/db';

interface Props {
    card: ErrorCard;
    onComplete: (rating: Rating) => void;
}

type Phase = 'exercise' | 'feedback' | 'rating';

export default function ErrorReview({ card, onComplete }: Props) {
    const { t } = useTranslation();
    const isStable = card.state === CardState.Review && card.stability > 10;
    const [phase, setPhase] = useState<Phase>('exercise');
    const [userAnswer, setUserAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    // For multiple choice: generate options from card data
    const options = isStable ? [] : [
        card.correctedSentence,
        card.originalSentence,
        ...(card.exampleVariants.length > 0
            ? [card.exampleVariants[0]]
            : [`${card.correctedSentence.split(' ').reverse().join(' ')}`]
        ),
    ].sort(() => Math.random() - 0.5);

    const handleSubmitFreeForm = () => {
        if (!userAnswer.trim()) return;
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const correct = normalize(userAnswer) === normalize(card.correctedSentence);
        setIsCorrect(correct);
        setPhase('feedback');
    };

    const handleSelectOption = (option: string) => {
        const correct = option === card.correctedSentence;
        setIsCorrect(correct);
        setUserAnswer(option);
        setPhase('feedback');
    };

    if (phase === 'rating') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <p className="text-center text-sm font-semibold text-text-secondary">
                    {t('review.howWasIt', '¿Cómo te fue?')}
                </p>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { rating: Rating.Again, label: t('review.again', 'Otra vez'), color: 'bg-accent-red/10 border-accent-red/20 text-accent-red' },
                        { rating: Rating.Hard, label: t('review.hard', 'Difícil'), color: 'bg-accent-orange/10 border-accent-orange/20 text-accent-orange' },
                        { rating: Rating.Good, label: t('review.good', 'Bien'), color: 'bg-green-500/10 border-green-500/20 text-green-400' },
                        { rating: Rating.Easy, label: t('review.easy', 'Fácil'), color: 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue' },
                    ].map(({ rating, label, color }) => (
                        <button
                            key={rating}
                            onClick={() => onComplete(rating)}
                            className={`py-3 rounded-xl text-sm font-bold border transition-all active:scale-[0.96] ${color}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </motion.div>
        );
    }

    if (phase === 'feedback') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className={`rounded-xl p-5 border space-y-3 ${
                    isCorrect
                        ? 'bg-green-500/8 border-green-500/20'
                        : 'bg-accent-red/8 border-accent-red/20'
                }`}>
                    <div className="flex items-center gap-2">
                        {isCorrect
                            ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                            : <XCircle className="w-5 h-5 text-accent-red" />
                        }
                        <span className="font-bold text-sm">
                            {isCorrect ? t('review.correct', '¡Correcto!') : t('review.incorrect', 'Incorrecto')}
                        </span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p><span className="text-text-muted">Error:</span> <span className="line-through text-accent-red">{card.originalSentence}</span></p>
                        <p><span className="text-text-muted">Correcto:</span> <span className="text-green-400 font-semibold">{card.correctedSentence}</span></p>
                    </div>
                </div>

                <div className="bg-bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-accent-orange flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-text-secondary leading-relaxed">{card.explanation}</p>
                    </div>
                </div>

                <button
                    onClick={() => setPhase('rating')}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <ArrowRight className="w-4 h-4" /> {t('review.next', 'Siguiente')}
                </button>
            </motion.div>
        );
    }

    // Exercise phase
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-bg-card-hover border border-border-light rounded-xl p-5 space-y-2">
                <p className="text-xs text-accent-orange font-semibold uppercase tracking-wider">
                    {card.errorType === 'grammar' ? 'Gramática' :
                     card.errorType === 'vocabulary' ? 'Vocabulario' :
                     card.errorType === 'spelling' ? 'Ortografía' : 'Estilo'}
                </p>
                <p className="text-sm text-text-secondary">
                    {isStable
                        ? 'Corrige la siguiente oración:'
                        : 'Selecciona la oración correcta:'}
                </p>
            </div>

            <div className="bg-accent-red/8 border border-accent-red/20 rounded-xl p-5">
                <p className="text-white text-lg leading-relaxed">{card.originalSentence}</p>
            </div>

            {isStable ? (
                /* Free-form correction for stable cards */
                <div className="space-y-4">
                    <input
                        type="text"
                        value={userAnswer}
                        onChange={e => setUserAnswer(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmitFreeForm()}
                        placeholder={t('review.typeAnswer', 'Escribe la corrección...')}
                        className="w-full bg-bg-card border border-border rounded-xl px-5 py-4 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                        autoFocus
                    />
                    <button
                        onClick={handleSubmitFreeForm}
                        disabled={!userAnswer.trim()}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                    >
                        {t('review.check', 'Verificar')}
                    </button>
                </div>
            ) : (
                /* Multiple choice for new/weak cards */
                <div className="space-y-3">
                    {options.map((option, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelectOption(option)}
                            className="w-full text-left bg-bg-card border border-border rounded-xl p-4 text-sm text-white hover:border-primary/30 hover:bg-bg-card-hover transition-all"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
```

**Step 2: Verify the build**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/ErrorReview.tsx
git commit -m "feat(error-cards): add ErrorReview component with adaptive exercise modes"
```

---

## Task 9: Error Cards — Integrate into ReviewSession

**Files:**
- Modify: `src/pages/ReviewSession.tsx`
- Modify: `src/i18n/es.json`

**Step 1: Add i18n keys**

In `src/i18n/es.json`, inside the `"review"` section, add:

```json
"myErrors": "Mis errores",
"errorsDue": "errores pendientes"
```

**Step 2: Add imports in ReviewSession.tsx**

Add these imports:

```typescript
import { useErrorCards } from '../hooks/useErrorCards';
import ErrorReview from '../components/ErrorReview';
import { AlertTriangle } from 'lucide-react';
```

**Step 3: Add hook call**

After line 21 (`const { dueSkillCards, reviewSkillCard } = useSkillCards();`), add:

```typescript
const { dueErrorCards, reviewErrorCard } = useErrorCards();
```

**Step 4: Update reviewType state to include 'errors'**

Change line 22:
```typescript
const [reviewType, setReviewType] = useState<'vocab' | 'grammar' | 'errors' | null>(null);
```

**Step 5: Update the "no due cards" check (line 56)**

Add `dueErrorCards.length === 0` to the condition:

```typescript
if (dueCards.length === 0 && dueSkillCards.length === 0 && dueErrorCards.length === 0 && !sessionDone && !mode && !reviewType) {
```

**Step 6: Update type selector (lines 77-119)**

Update the auto-select logic — if only one type has due items, auto-select. Otherwise show buttons for all types that have due items:

```typescript
if (!reviewType && !mode && (dueCards.length > 0 || dueSkillCards.length > 0 || dueErrorCards.length > 0)) {
    const typesWithDue = [
        dueCards.length > 0 ? 'vocab' : null,
        dueSkillCards.length > 0 ? 'grammar' : null,
        dueErrorCards.length > 0 ? 'errors' : null,
    ].filter(Boolean) as ('vocab' | 'grammar' | 'errors')[];

    if (typesWithDue.length === 1) {
        setReviewType(typesWithDue[0]);
    } else {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 py-4">
                <h2 className="text-xl font-bold text-center">{t('review.chooseType', '¿Qué quieres repasar?')}</h2>
                <div className="space-y-4">
                    {dueCards.length > 0 && (
                        <button onClick={() => setReviewType('vocab')} className="w-full widget hover:border-primary/50 transition-all text-left space-y-1">
                            <div className="flex items-center gap-3">
                                <RefreshCw className="w-5 h-5 text-accent-blue" />
                                <div>
                                    <p className="font-bold">{t('review.vocabulary', 'Vocabulario')}</p>
                                    <p className="text-sm text-text-muted">{dueCards.length} {t('review.wordsDue', 'palabras pendientes')}</p>
                                </div>
                            </div>
                        </button>
                    )}
                    {dueSkillCards.length > 0 && (
                        <button onClick={() => setReviewType('grammar')} className="w-full widget hover:border-primary/50 transition-all text-left space-y-1">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-accent-purple" />
                                <div>
                                    <p className="font-bold">{t('review.grammar', 'Gramática')}</p>
                                    <p className="text-sm text-text-muted">{dueSkillCards.length} {t('review.skillsDue', 'habilidades pendientes')}</p>
                                </div>
                            </div>
                        </button>
                    )}
                    {dueErrorCards.length > 0 && (
                        <button onClick={() => setReviewType('errors')} className="w-full widget hover:border-primary/50 transition-all text-left space-y-1">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-accent-orange" />
                                <div>
                                    <p className="font-bold">{t('review.myErrors', 'Mis errores')}</p>
                                    <p className="text-sm text-text-muted">{dueErrorCards.length} {t('review.errorsDue', 'errores pendientes')}</p>
                                </div>
                            </div>
                        </button>
                    )}
                </div>
            </motion.div>
        );
    }
}
```

**Step 7: Add error cards review flow**

After the grammar review flow block (after line 198, before the `// Session complete` comment on line 200), add:

```typescript
// Error cards review flow
if (reviewType === 'errors') {
    if (sessionDone) {
        const accuracy = totalReviewed > 0 ? Math.round((correctCount / totalReviewed) * 100) : 0;
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-5">
                <style>{`.floating-bar { display: none !important; }`}</style>
                <Trophy className="w-12 h-12 text-accent-gold mx-auto" />
                <h2 className="text-2xl font-extrabold">{t('review.sessionDone')}</h2>
                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    <div className="widget text-center">
                        <p className="text-2xl font-extrabold text-accent-blue">{totalReviewed}</p>
                        <p className="text-[10px] text-text-muted">{t('review.reviewed')}</p>
                    </div>
                    <div className="widget text-center">
                        <p className={`text-2xl font-extrabold ${accuracy >= 70 ? 'text-success' : 'text-accent-orange'}`}>{accuracy}%</p>
                        <p className="text-[10px] text-text-muted">{t('review.accuracy')}</p>
                    </div>
                </div>
                <button onClick={() => navigate('/')} className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all">
                    {t('review.backHome')}
                </button>
            </motion.div>
        );
    }

    const currentErrorCard = dueErrorCards[0];
    if (!currentErrorCard) {
        setSessionDone(true);
        return null;
    }

    return (
        <div className="space-y-10">
            <style>{`.floating-bar { display: none !important; }`}</style>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <button
                        onClick={() => { setReviewType(null); setSessionDone(false); setCorrectCount(0); setTotalReviewed(0); }}
                        className="text-text-muted hover:text-text transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 inline" /> {t('review.changeMode', 'Cambiar modo')}
                    </button>
                    <span className="text-text-muted font-mono text-xs">
                        {t('review.myErrors', 'Mis errores')} · {dueErrorCards.length} {t('review.remaining', 'restantes')}
                    </span>
                </div>
            </div>
            <ErrorReview
                key={currentErrorCard.id}
                card={currentErrorCard}
                onComplete={async (rating) => {
                    await reviewErrorCard(currentErrorCard, rating);
                    setTotalReviewed(tr => tr + 1);
                    if (rating !== Rating.Again) setCorrectCount(c => c + 1);
                    if (dueErrorCards.length <= 1) {
                        setSessionDone(true);
                    }
                }}
            />
        </div>
    );
}
```

**Step 8: Verify the build**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 9: Commit**

```bash
git add src/pages/ReviewSession.tsx src/i18n/es.json
git commit -m "feat(error-cards): integrate error card review into ReviewSession with 3-type selector"
```

---

## Task 10: Error Cards — Dashboard Display + Final i18n

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/i18n/es.json`

**Step 1: Add i18n keys**

In `src/i18n/es.json`, inside the `"dashboard"` section, add:

```json
"myErrors": "Mis errores",
"errorsDue": "errores pendientes"
```

**Step 2: Import and use `useErrorCards` in Dashboard**

Add import:
```typescript
import { useErrorCards } from '../hooks/useErrorCards';
```

Add hook:
```typescript
const { dueErrorCards, totalErrorCards } = useErrorCards();
```

**Step 3: Add error cards display in the review section**

Find where `grammarSkills` / `grammarDue` is displayed in Dashboard (look for the grammar skill count section). Add a similar display for error cards right after it:

```tsx
{totalErrorCards > 0 && (
    <div className="widget flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-accent-orange" />
        <div>
            <p className="text-sm font-bold">{totalErrorCards} {t('dashboard.myErrors', 'Mis errores')}</p>
            {dueErrorCards.length > 0 && (
                <p className="text-xs text-text-muted">{dueErrorCards.length} {t('dashboard.errorsDue', 'errores pendientes')}</p>
            )}
        </div>
    </div>
)}
```

Import `AlertTriangle` from lucide-react.

**Step 4: Verify the build**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx src/i18n/es.json
git commit -m "feat(error-cards): show error card count and due count on Dashboard"
```

---

## Task 11: Enhance AI Prompts to Return Example Variants

**Files:**
- Modify: `api/agents/conversation-tutor.ts:46-60` (JSON format in system prompt)
- Modify: `api/agents/writing-evaluator.ts:70-88` (JSON format in system prompt)
- Modify: `src/lib/ai.ts` (update types to include example_variants)

**Step 1: Update conversation-tutor prompt**

In `api/agents/conversation-tutor.ts`, update the JSON format in the system prompt (lines 47-57) to add `example_variants`:

```
{
  "reply": "Your conversational reply in English",
  "corrections": [
    {
      "original": "what the student wrote wrong",
      "corrected": "the corrected version",
      "explanation": "Brief explanation in Spanish of the correction",
      "example_variants": ["Another example sentence with the same error pattern", "Yet another example"]
    }
  ],
  "suggestions": ["Suggested response option 1", "Suggested response option 2"]
}
```

Add to the rules: `For each correction, also provide 2 example_variants: additional example sentences where the student might make the same type of error (show the CORRECT version).`

**Step 2: Update writing-evaluator prompt**

In `api/agents/writing-evaluator.ts`, update the JSON format (lines 71-88) to add `example_variants`:

```
"corrections": [
    {
      "original": "what the student wrote",
      "corrected": "the corrected version",
      "explanation": "Explicación en español",
      "type": "grammar",
      "example_variants": ["Another correct example using the same pattern", "Yet another example"]
    }
  ],
```

Add to the evaluation rules: `For each correction, include 2 "example_variants": additional correct example sentences that demonstrate proper usage of the same pattern the student got wrong.`

**Step 3: Update frontend types**

In `src/lib/ai.ts`, update `ConversationResponse.corrections` (line 145-149):

```typescript
corrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
    example_variants?: string[];
}>;
```

Update `WritingCorrection` (lines 163-168):

```typescript
export interface WritingCorrection {
    original: string;
    corrected: string;
    explanation: string;
    type: 'grammar' | 'vocabulary' | 'spelling' | 'style';
    example_variants?: string[];
}
```

**Step 4: Pass example_variants to addErrorCard**

Update `src/pages/ConversationTutor.tsx` error extraction:

```typescript
if (response.corrections && response.corrections.length > 0) {
    for (const c of response.corrections) {
        addErrorCard({
            original: c.original,
            corrected: c.corrected,
            explanation: c.explanation,
        }, 'tutor', c.example_variants || []);
    }
}
```

Update `src/pages/Practice.tsx` error extraction:

```typescript
if (result.corrections && result.corrections.length > 0) {
    for (const c of result.corrections) {
        addErrorCard({
            original: c.original,
            corrected: c.corrected,
            explanation: c.explanation,
            type: c.type,
        }, 'writing', c.example_variants || []);
    }
}
```

**Step 5: Verify the build**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add api/agents/conversation-tutor.ts api/agents/writing-evaluator.ts src/lib/ai.ts src/pages/ConversationTutor.tsx src/pages/Practice.tsx
git commit -m "feat(error-cards): enhance AI prompts to return example variants for error cards"
```

---

## Task 12: Visual Verification + Final Build Check

**Step 1: Full TypeScript check**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npx tsc --noEmit`
Expected: No errors

**Step 2: Full Vite build**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npm run build`
Expected: Build succeeds

**Step 3: Start dev server and verify visually**

Run: `cd "E:\UNIVERSIDAD\Personales\AppIngles\linguacore" && npm run dev`

Verify:
1. Practice page → shows 4 level cards, clicking one hides them and shows level badge + back button + topics
2. Practice → "Tema libre" appears first in topic list with Sparkles icon
3. Practice → history items display correctly on mobile viewport
4. OutputStep (in a unit with speaking) → defer speaking → see "Ya puedo hablar" button + "Volver a la ruta"
5. ReviewSession → if error cards exist, shows 3-type selector (Vocabulario / Gramática / Mis errores)

**Step 4: Commit any final fixes if needed**

---

## Summary of User Actions Required

After implementation, the user must:
1. **Run the SQL migration** `supabase/migrations/20260316_create_error_cards.sql` in the Supabase SQL Editor
2. **Run the conversation_sessions migration** (still pending from previous features) if not done yet
