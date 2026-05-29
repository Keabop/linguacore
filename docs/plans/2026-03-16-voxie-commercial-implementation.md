# Voxie Commercial Launch — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform LinguaCore into Voxie — a commercially viable English learning app with tier system, AI caching, rate limiting, Mercado Pago payments, landing page, and rebranding.

**Architecture:** Add `tier` field to Supabase `profiles` table. Gate features in both frontend (React hooks) and backend (API middleware). Add `ai_cache` table for Gemini response caching. Integrate Mercado Pago subscriptions via webhooks. Create landing page at voxie.lat. Rebrand all references from LinguaCore to Voxie.

**Tech Stack:** Supabase (PostgreSQL + Auth), Vercel Serverless, Gemini API, React 19 + React Router 7 + Tailwind v4, Mercado Pago SDK, VitePWA

**Commercial Plan Reference:** `docs/plans/2026-03-16-voxie-commercial-plan.md`

---

## Phase 1: Infrastructure (Semana 1)

### Task 1: Add `tier` field to Supabase profiles

**Files:**
- Modify: `src/lib/database.types.ts` (add tier type)
- Modify: `src/lib/AuthContext.tsx` (expose tier in context)
- Create: `src/hooks/useTier.ts` (convenience hook)
- SQL: Migration in Supabase Dashboard

**Step 1: Run SQL migration in Supabase Dashboard**

```sql
-- Add tier column to profiles
ALTER TABLE profiles
ADD COLUMN tier TEXT NOT NULL DEFAULT 'free'
CHECK (tier IN ('free', 'pro'));

-- Add trial tracking columns
ALTER TABLE profiles
ADD COLUMN trial_started_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN trial_ends_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN subscription_id TEXT DEFAULT NULL,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive'
CHECK (subscription_status IN ('inactive', 'active', 'cancelled', 'past_due'));

-- Index for quick tier lookups
CREATE INDEX idx_profiles_tier ON profiles(tier);
```

**Step 2: Update database types**

In `src/lib/database.types.ts`, find the `profiles` Row type and add:

```typescript
tier: 'free' | 'pro'
trial_started_at: string | null
trial_ends_at: string | null
subscription_id: string | null
subscription_status: 'inactive' | 'active' | 'cancelled' | 'past_due'
```

Add the same fields to `Insert` and `Update` types (as optional).

**Step 3: Create useTier hook**

Create `src/hooks/useTier.ts`:

```typescript
import { useAuth } from '../lib/AuthContext';
import { useMemo } from 'react';

export type Tier = 'free' | 'pro';

interface TierInfo {
  tier: Tier;
  isPro: boolean;
  isFree: boolean;
  isTrial: boolean;
  trialEndsAt: Date | null;
}

export function useTier(): TierInfo {
  const { profile } = useAuth();

  return useMemo(() => {
    const tier = profile?.tier ?? 'free';
    const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
    const isTrial = trialEndsAt !== null && trialEndsAt > new Date() && tier === 'pro';

    return {
      tier,
      isPro: tier === 'pro',
      isFree: tier === 'free',
      isTrial,
      trialEndsAt,
    };
  }, [profile?.tier, profile?.trial_ends_at]);
}
```

**Step 4: Expose tier in AuthContext**

In `src/lib/AuthContext.tsx`, ensure the profile query fetches the new `tier` field. The profile is already fetched — verify that `select('*')` is used so the new columns are included automatically.

**Step 5: Run app locally to verify no regressions**

Run: `npm run dev`
Expected: App loads, all existing features work. All users default to `tier: 'free'`.

**Step 6: Commit**

```bash
git add src/lib/database.types.ts src/hooks/useTier.ts src/lib/AuthContext.tsx
git commit -m "feat(tier): add tier system to profiles with useTier hook"
```

---

### Task 2: Create AI Cache table and caching layer

**Files:**
- Create: `src/lib/aiCache.ts` (cache utility)
- Modify: `api/orchestrator.ts` (add cache check)
- Modify: `api/lib/gemini.ts` (optional, if cache integrated at this level)
- SQL: Migration in Supabase Dashboard

**Step 1: Run SQL migration in Supabase Dashboard**

```sql
-- AI response cache
CREATE TABLE ai_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  agent TEXT NOT NULL,
  params_hash TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX idx_ai_cache_agent ON ai_cache(agent);

-- Auto-cleanup old cache entries (older than 30 days)
-- Run this as a Supabase cron job or periodic cleanup
```

**Step 2: Create cache utility for the API**

Create `api/lib/aiCache.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role key for server-side cache operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export function generateCacheKey(agent: string, params: Record<string, any>): string {
  // Remove user-specific data that shouldn't affect cache
  const cacheableParams = { ...params };
  delete cacheableParams.messages; // Chat messages are always unique

  const hash = createHash('sha256')
    .update(JSON.stringify({ agent, params: cacheableParams }))
    .digest('hex');

  return `${agent}:${hash}`;
}

// Agents whose responses can be cached (not user-specific)
const CACHEABLE_AGENTS = ['story-generator', 'vocab-enricher', 'exercise-creator'];

export function isCacheable(agent: string): boolean {
  return CACHEABLE_AGENTS.includes(agent);
}

export async function getCachedResponse(cacheKey: string): Promise<any | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ai_cache')
      .select('response')
      .eq('cache_key', cacheKey)
      .single();

    if (error || !data) return null;

    // Update hit count (fire and forget)
    supabaseAdmin
      .from('ai_cache')
      .update({ hit_count: data.hit_count + 1, last_hit_at: new Date().toISOString() })
      .eq('cache_key', cacheKey)
      .then(() => {});

    return data.response;
  } catch {
    return null;
  }
}

export async function setCachedResponse(
  cacheKey: string,
  agent: string,
  paramsHash: string,
  response: any
): Promise<void> {
  try {
    await supabaseAdmin
      .from('ai_cache')
      .upsert({
        cache_key: cacheKey,
        agent,
        params_hash: paramsHash,
        response,
      }, { onConflict: 'cache_key' });
  } catch {
    // Cache write failure is non-critical
  }
}
```

**Step 3: Integrate cache into orchestrator**

In `api/orchestrator.ts`, add cache check before calling the agent:

```typescript
import { generateCacheKey, isCacheable, getCachedResponse, setCachedResponse } from './lib/aiCache';

// Inside the handler, after auth validation and before agent dispatch:
const { agent, params } = req.body;

// Check cache for cacheable agents
if (isCacheable(agent)) {
  const cacheKey = generateCacheKey(agent, params);
  const cached = await getCachedResponse(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }
}

// ... existing agent dispatch logic ...

// After getting the result from the agent:
if (isCacheable(agent)) {
  const cacheKey = generateCacheKey(agent, params);
  await setCachedResponse(cacheKey, agent, cacheKey, result);
}
```

**Step 4: Add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars**

The service role key is needed for server-side cache writes that bypass RLS. Add it in Vercel Dashboard → Settings → Environment Variables.

**Step 5: Test locally**

Run: `npm run dev`
- Generate a story → should call Gemini and cache result
- Generate same story parameters again → should return cached result (faster response)
- Chat with tutor → should NOT be cached (messages are unique)

**Step 6: Commit**

```bash
git add api/lib/aiCache.ts api/orchestrator.ts
git commit -m "feat(cache): add AI response caching for story/vocab/exercise agents"
```

---

### Task 3: Per-user rate limiting and usage tracking

**Files:**
- Create: `api/lib/usageLimits.ts` (usage checking/tracking)
- Modify: `api/orchestrator.ts` (check limits before dispatch)
- SQL: Migration in Supabase Dashboard

**Step 1: Run SQL migration**

```sql
-- Daily usage tracking per user per feature
CREATE TABLE usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, feature, usage_date)
);

CREATE INDEX idx_usage_tracking_lookup ON usage_tracking(user_id, feature, usage_date);
```

**Step 2: Create usage limits module**

Create `api/lib/usageLimits.ts`:

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

// Daily limits for free tier (pro has no limits)
const FREE_LIMITS: Record<string, number> = {
  'conversation-tutor': 5,    // 5 messages/day
  'story-generator': 1,       // 1 per week (handled differently)
  'fsrs-reviews': 10,         // 10 cards/day
};

// Weekly limits
const FREE_WEEKLY_LIMITS: Record<string, number> = {
  'story-generator': 1,       // 1 story/week
};

export async function checkUsageLimit(
  supabase: SupabaseClient,
  userId: string,
  feature: string,
  tier: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  // Pro users have no limits
  if (tier === 'pro') {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  const limit = FREE_LIMITS[feature];
  if (!limit) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('usage_tracking')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', feature)
    .eq('usage_date', today)
    .single();

  const currentCount = data?.count ?? 0;
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed: currentCount < limit,
    remaining,
    limit,
  };
}

export async function checkWeeklyLimit(
  supabase: SupabaseClient,
  userId: string,
  feature: string,
  tier: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  if (tier === 'pro') {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  const limit = FREE_WEEKLY_LIMITS[feature];
  if (!limit) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  // Get start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekStart = monday.toISOString().split('T')[0];

  const { data } = await supabase
    .from('usage_tracking')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('usage_date', weekStart);

  const totalCount = data?.reduce((sum, row) => sum + (row.count ?? 0), 0) ?? 0;

  return {
    allowed: totalCount < limit,
    remaining: Math.max(0, limit - totalCount),
    limit,
  };
}

export async function incrementUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_feature: feature,
    p_date: today,
  });
}
```

**Step 3: Create the RPC function in Supabase**

```sql
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_feature TEXT,
  p_date DATE
) RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_tracking (user_id, feature, usage_date, count)
  VALUES (p_user_id, p_feature, p_date, 1)
  ON CONFLICT (user_id, feature, usage_date)
  DO UPDATE SET count = usage_tracking.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 4: Integrate into orchestrator**

In `api/orchestrator.ts`, after auth validation:

```typescript
import { checkUsageLimit, checkWeeklyLimit, incrementUsage } from './lib/usageLimits';

// After extracting user from JWT:
const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select('tier')
  .eq('id', user.id)
  .single();

const tier = profile?.tier ?? 'free';

// Check limits
if (agent === 'story-generator') {
  const { allowed, remaining } = await checkWeeklyLimit(supabaseAdmin, user.id, agent, tier);
  if (!allowed) {
    return res.status(429).json({
      error: 'weekly_limit_reached',
      message: 'Has alcanzado tu límite semanal de historias. Actualiza a Pro para historias ilimitadas.',
      remaining: 0,
    });
  }
} else if (agent === 'conversation-tutor') {
  const { allowed, remaining } = await checkUsageLimit(supabaseAdmin, user.id, agent, tier);
  if (!allowed) {
    return res.status(429).json({
      error: 'daily_limit_reached',
      message: 'Has alcanzado tu límite diario de mensajes. Actualiza a Pro para chat ilimitado.',
      remaining: 0,
    });
  }
}

// ... agent dispatch ...

// After successful response, increment usage
await incrementUsage(supabaseAdmin, user.id, agent);
```

**Step 5: Create endpoint to check remaining usage (for frontend)**

Create `api/usage.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { checkUsageLimit, checkWeeklyLimit } from './lib/usageLimits';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  // Validate JWT (same pattern as orchestrator)
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  const tier = profile?.tier ?? 'free';

  const [tutor, stories, fsrs] = await Promise.all([
    checkUsageLimit(supabaseAdmin, user.id, 'conversation-tutor', tier),
    checkWeeklyLimit(supabaseAdmin, user.id, 'story-generator', tier),
    checkUsageLimit(supabaseAdmin, user.id, 'fsrs-reviews', tier),
  ]);

  return res.status(200).json({
    tier,
    limits: {
      'conversation-tutor': tutor,
      'story-generator': stories,
      'fsrs-reviews': fsrs,
    },
  });
}
```

**Step 6: Commit**

```bash
git add api/lib/usageLimits.ts api/orchestrator.ts api/usage.ts
git commit -m "feat(limits): add per-user usage tracking and rate limiting by tier"
```

---

## Phase 2: Feature Gating (Semana 2)

### Task 4: Frontend usage hook and gate components

**Files:**
- Create: `src/hooks/useUsageLimits.ts` (fetch remaining usage)
- Create: `src/components/ProGate.tsx` (gate component)
- Create: `src/components/UpgradePrompt.tsx` (informative upgrade UI)

**Step 1: Create useUsageLimits hook**

Create `src/hooks/useUsageLimits.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface UsageLimit {
  allowed: boolean;
  remaining: number;
  limit: number;
}

interface UsageLimits {
  tier: 'free' | 'pro';
  limits: {
    'conversation-tutor': UsageLimit;
    'story-generator': UsageLimit;
    'fsrs-reviews': UsageLimit;
  };
}

export function useUsageLimits() {
  return useQuery({
    queryKey: ['usage-limits'],
    queryFn: async (): Promise<UsageLimits> => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/usage', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch usage');
      return res.json();
    },
    staleTime: 30_000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
  });
}
```

**Step 2: Create ProGate component**

Create `src/components/ProGate.tsx`:

```typescript
import { useTier } from '../hooks/useTier';
import { Lock } from 'lucide-react';
import { Link } from 'react-router';

interface ProGateProps {
  children: React.ReactNode;
  feature: string; // Human-readable description of what's locked
  fallback?: React.ReactNode; // Optional custom fallback
}

/**
 * Wraps content that requires Pro tier.
 * Shows children if user is Pro, shows upgrade prompt if Free.
 */
export function ProGate({ children, feature, fallback }: ProGateProps) {
  const { isPro } = useTier();

  if (isPro) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 bg-bg-card border border-border rounded-2xl text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          Disponible en Plan Pro
        </h3>
        <p className="text-sm text-text-muted max-w-xs">
          {feature}
        </p>
      </div>
      <Link
        to="/pricing"
        className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-all text-sm"
      >
        Ver Plan Pro — $129/mes
      </Link>
    </div>
  );
}
```

**Step 3: Create UsageBadge component for showing remaining uses**

Create `src/components/UsageBadge.tsx`:

```typescript
interface UsageBadgeProps {
  remaining: number;
  limit: number;
  label: string; // e.g. "mensajes", "historias", "tarjetas"
}

export function UsageBadge({ remaining, limit, label }: UsageBadgeProps) {
  if (limit === Infinity) return null; // Pro users don't see this

  const isLow = remaining <= Math.ceil(limit * 0.2);
  const isExhausted = remaining === 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
        isExhausted
          ? 'bg-red-500/10 text-red-400'
          : isLow
            ? 'bg-amber-500/10 text-amber-400'
            : 'bg-text-muted/10 text-text-muted'
      }`}
    >
      {remaining}/{limit} {label}
    </span>
  );
}
```

**Step 4: Commit**

```bash
git add src/hooks/useUsageLimits.ts src/components/ProGate.tsx src/components/UsageBadge.tsx
git commit -m "feat(gate): add ProGate component and usage limits hook"
```

---

### Task 5: Gate levels A2-B2 in Learning Path

**Files:**
- Modify: `src/pages/LearningPath.tsx` (add locks on A2+ units for free users)

**Step 1: Read current LearningPath.tsx**

Read the file to understand how units are rendered per level.

**Step 2: Add tier check to unit rendering**

Import `useTier` and wrap A2+ level sections with the ProGate:

```typescript
import { useTier } from '../hooks/useTier';

// Inside the component:
const { isPro, isFree } = useTier();

// When rendering units for a level, check if the level is accessible:
const isLevelAccessible = (level: string): boolean => {
  if (isPro) return true;
  return level === 'A1'; // Free users only get A1
};
```

For units in A2/B1/B2, show them visually but with a lock overlay and muted styling. Do NOT hide them — let the user see what's ahead:

```typescript
{!isLevelAccessible(unit.level) && (
  <div className="absolute inset-0 bg-bg-base/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
    <div className="flex items-center gap-2 text-text-muted text-sm">
      <Lock className="w-4 h-4" />
      <span>Plan Pro</span>
    </div>
  </div>
)}
```

**Step 3: Test**

- Free user: A1 units clickable, A2+ units visible with lock overlay
- Pro user (set manually in DB): All units clickable

**Step 4: Commit**

```bash
git add src/pages/LearningPath.tsx
git commit -m "feat(gate): lock A2-B2 levels for free users in LearningPath"
```

---

### Task 6: Gate conversation tutor messages

**Files:**
- Modify: `src/pages/ConversationTutor.tsx` (add message counter and limit)

**Step 1: Read ConversationTutor.tsx**

Understand where messages are sent and displayed.

**Step 2: Add message limit for free users**

- Import `useTier` and `useUsageLimits`
- Track message count in the current session
- When free user hits 5 messages, disable input and show upgrade prompt
- Limit conversation history view to 2 sessions for free users

```typescript
const { isFree } = useTier();
const { data: usage } = useUsageLimits();
const tutorUsage = usage?.limits['conversation-tutor'];

// Before send:
if (isFree && tutorUsage && !tutorUsage.allowed) {
  // Show upgrade prompt instead of sending
  return;
}

// In the input area, when limit reached:
{isFree && tutorUsage && !tutorUsage.allowed ? (
  <div className="p-4 text-center">
    <p className="text-sm text-text-muted mb-2">
      Has usado tus 5 mensajes de hoy
    </p>
    <Link to="/pricing" className="text-primary text-sm font-medium">
      Desbloquea chat ilimitado con Plan Pro
    </Link>
  </div>
) : (
  // Normal input area
)}
```

**Step 3: Limit history view for free users**

In the history view, only show the 2 most recent sessions for free:

```typescript
const visibleSessions = isFree ? sessions.slice(0, 2) : sessions;
```

If there are more than 2, show a subtle message:

```typescript
{isFree && sessions.length > 2 && (
  <p className="text-xs text-text-muted text-center py-2">
    {sessions.length - 2} conversaciones más disponibles en Plan Pro
  </p>
)}
```

**Step 4: Invalidate usage query after sending message**

After successfully sending a message, invalidate the usage-limits query so the counter updates:

```typescript
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();

// After successful message send:
queryClient.invalidateQueries({ queryKey: ['usage-limits'] });
```

**Step 5: Test**

- Free user: Can send 5 messages, then sees upgrade prompt
- Free user: Sees max 2 history sessions
- Pro user: No limits

**Step 6: Commit**

```bash
git add src/pages/ConversationTutor.tsx
git commit -m "feat(gate): limit free users to 5 tutor messages/day and 2 history sessions"
```

---

### Task 7: Gate FSRS daily reviews

**Files:**
- Modify: `src/pages/ReviewSession.tsx` or the component that renders the review queue
- Modify: The hook that fetches due cards (likely `useCards`, `useSkillCards`, `useErrorCards`)

**Step 1: Read the review flow**

Identify where cards are fetched and how the review queue is built.

**Step 2: Limit card queue for free users**

In the hook or component that builds the review queue:

```typescript
const { isFree } = useTier();

// After fetching all due cards:
const limitedCards = isFree ? allDueCards.slice(0, 10) : allDueCards;
```

Show a badge with remaining reviews:

```typescript
{isFree && allDueCards.length > 10 && (
  <UsageBadge remaining={10 - reviewedCount} limit={10} label="repasos hoy" />
)}
```

**Step 3: Track FSRS reviews in usage_tracking**

After each card review, call the increment endpoint or track locally and sync:

```typescript
// After reviewing a card:
if (isFree) {
  queryClient.invalidateQueries({ queryKey: ['usage-limits'] });
}
```

**Step 4: Test**

- Free user: Sees max 10 cards in review queue
- Pro user: Sees all due cards

**Step 5: Commit**

```bash
git add src/pages/ReviewSession.tsx
git commit -m "feat(gate): limit free users to 10 FSRS reviews per day"
```

---

### Task 8: Gate story generation

**Files:**
- Modify: The component/page where stories are generated (likely in `src/pages/StoryList.tsx` or within UnitFlow)

**Step 1: Add weekly limit check before story generation**

```typescript
const { isFree } = useTier();
const { data: usage } = useUsageLimits();
const storyUsage = usage?.limits['story-generator'];

// On generate button:
{isFree && storyUsage && !storyUsage.allowed ? (
  <div className="text-center p-4">
    <p className="text-sm text-text-muted">
      Ya generaste tu historia de esta semana
    </p>
    <p className="text-xs text-text-muted mt-1">
      Se reinicia el lunes. Plan Pro = historias ilimitadas.
    </p>
  </div>
) : (
  <button onClick={handleGenerate}>Generar historia</button>
)}
```

**Step 2: Commit**

```bash
git add [modified files]
git commit -m "feat(gate): limit free users to 1 story generation per week"
```

---

### Task 9: Create Pricing page

**Files:**
- Create: `src/pages/Pricing.tsx`
- Modify: `src/App.tsx` (add route)

**Step 1: Create Pricing page**

Create `src/pages/Pricing.tsx`:

```typescript
import { Check } from 'lucide-react';
import { useTier } from '../hooks/useTier';

const FREE_FEATURES = [
  'Nivel A1 completo (gramática, vocabulario, ejercicios)',
  '1 historia interactiva por semana',
  '10 repasos FSRS por día',
  '5 mensajes con el tutor IA por día',
  'Práctica de pronunciación',
  'Streak informativo',
];

const PRO_FEATURES = [
  'Todo lo de la versión gratuita',
  'Niveles A2, B1 y B2 desbloqueados',
  'Historias ilimitadas',
  'Repasos FSRS ilimitados',
  'Chat con tutor IA ilimitado',
  'Historial completo de conversaciones',
  'Tarjetas de error personalizadas',
  'Análisis de errores y patrones',
  'Estadísticas detalladas de progreso',
  'Evaluaciones de escritura completas',
];

export default function Pricing() {
  const { isPro } = useTier();

  return (
    <div className="min-h-screen bg-bg-base p-4 pb-24">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
          Elige tu plan
        </h1>
        <p className="text-text-muted text-center text-sm mb-8">
          Sin trucos, sin precios falsos, sin compromisos
        </p>

        {/* Free Plan */}
        <div className="bg-bg-card border border-border rounded-2xl p-5 mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Gratis</h2>
          <p className="text-3xl font-bold text-text-primary mt-2">$0</p>
          <p className="text-sm text-text-muted">Para siempre</p>
          <ul className="mt-4 space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="bg-bg-card border-2 border-primary rounded-2xl p-5 relative">
          <h2 className="text-lg font-semibold text-text-primary">Plan Pro</h2>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-text-primary">$129</p>
            <p className="text-sm text-text-muted">MXN/mes</p>
          </div>
          <p className="text-sm text-text-muted">
            o $1,200 MXN/año
          </p>
          <ul className="mt-4 space-y-2.5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {isPro ? (
            <div className="mt-5 bg-emerald-500/10 text-emerald-400 text-center py-3 rounded-xl text-sm font-medium">
              Tu plan actual
            </div>
          ) : (
            <button
              onClick={() => {/* TODO: Mercado Pago checkout */}}
              className="mt-5 w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]"
            >
              Suscribirme al Plan Pro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add route in App.tsx**

```typescript
const Pricing = lazyRetry(() => import('./pages/Pricing'));

// Inside routes:
<Route path="/pricing" element={<RequireAuth><Pricing /></RequireAuth>} />
```

**Step 3: Test**

- Navigate to /pricing — should show both plans
- Free user: Shows subscribe button
- Pro user: Shows "Tu plan actual"

**Step 4: Commit**

```bash
git add src/pages/Pricing.tsx src/App.tsx
git commit -m "feat(pricing): add transparent pricing page with Free vs Pro"
```

---

## Phase 3: Payments + Landing (Semana 3)

### Task 10: Integrate Mercado Pago subscriptions

**Files:**
- Create: `api/payments/create-subscription.ts` (create MP subscription)
- Create: `api/payments/webhook.ts` (handle MP webhook events)
- Modify: `src/pages/Pricing.tsx` (connect to checkout)

**Step 1: Install Mercado Pago SDK on the API side**

```bash
npm install mercadopago
```

**Step 2: Create subscription endpoint**

Create `api/payments/create-subscription.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  const { plan } = req.body; // 'monthly' or 'annual'

  const preApproval = new PreApproval(mpClient);

  try {
    const result = await preApproval.create({
      body: {
        reason: plan === 'annual' ? 'Voxie Plan Pro - Anual' : 'Voxie Plan Pro - Mensual',
        auto_recurring: {
          frequency: plan === 'annual' ? 12 : 1,
          frequency_type: 'months',
          transaction_amount: plan === 'annual' ? 1200 : 129,
          currency_id: 'MXN',
        },
        back_url: `${process.env.VITE_APP_URL || 'https://voxie.lat'}/pricing?status=success`,
        payer_email: user.email!,
        external_reference: user.id,
      },
    });

    return res.status(200).json({ init_point: result.init_point });
  } catch (err: any) {
    console.error('MP subscription error:', err);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
}
```

**Step 3: Create webhook handler**

Create `api/payments/webhook.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type, data } = req.body;

  // Only handle subscription events
  if (type !== 'subscription_preapproval') {
    return res.status(200).json({ ok: true });
  }

  try {
    const preApproval = new PreApproval(mpClient);
    const subscription = await preApproval.get({ id: data.id });

    const userId = subscription.external_reference;
    if (!userId) return res.status(400).json({ error: 'No user reference' });

    const status = subscription.status;

    // Map MP status to our subscription status
    let tier: 'free' | 'pro' = 'free';
    let subscriptionStatus: string = 'inactive';

    switch (status) {
      case 'authorized':
        tier = 'pro';
        subscriptionStatus = 'active';
        break;
      case 'paused':
        tier = 'pro'; // Keep pro while paused (grace period)
        subscriptionStatus = 'past_due';
        break;
      case 'cancelled':
        tier = 'free';
        subscriptionStatus = 'cancelled';
        break;
      default:
        subscriptionStatus = 'inactive';
    }

    // Idempotent update
    await supabaseAdmin
      .from('profiles')
      .update({
        tier,
        subscription_id: data.id,
        subscription_status: subscriptionStatus,
      })
      .eq('id', userId);

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
```

**Step 4: Connect Pricing page to checkout**

In `src/pages/Pricing.tsx`, add the checkout function:

```typescript
const handleSubscribe = async (plan: 'monthly' | 'annual') => {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch('/api/payments/create-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ plan }),
  });
  const { init_point } = await res.json();
  if (init_point) window.location.href = init_point;
};
```

**Step 5: Add env vars to Vercel**

- `MERCADOPAGO_ACCESS_TOKEN` — from Mercado Pago developer dashboard
- Register webhook URL: `https://voxie.lat/api/payments/webhook`

**Step 6: Test with MP sandbox**

- Mercado Pago provides test credentials and test cards
- Verify: create subscription → webhook fires → user tier updates to 'pro'
- Verify: cancel subscription → webhook fires → user tier reverts to 'free'

**Step 7: Commit**

```bash
git add api/payments/ src/pages/Pricing.tsx package.json package-lock.json
git commit -m "feat(payments): integrate Mercado Pago subscriptions with webhook"
```

---

### Task 11: Create Landing Page

**Files:**
- Create: `src/pages/Landing.tsx`
- Modify: `src/App.tsx` (add public route)

**Step 1: Create Landing page**

This page is PUBLIC (no auth required). It should be the first thing visitors see.

Create `src/pages/Landing.tsx` — a single-page marketing site with:

1. **Hero section** — Tagline, CTA "Empieza gratis", app screenshot
2. **Problem section** — "Las apps de inglés te cobran por lo básico"
3. **Features section** — 4 key features with icons
4. **Pricing section** — Reuse pricing cards from Pricing page
5. **PWA install guide** — "Instálala como app" with platform-specific instructions
6. **Footer** — Links, contact

Use the `frontend-design` skill for the actual design implementation. The landing page should match the app's dark theme (bg-bg-base: #0f0f23, primary: #6366f1).

**Step 2: Update routing**

In `src/App.tsx`:

```typescript
const Landing = lazyRetry(() => import('./pages/Landing'));

// Landing is PUBLIC — shown when user is NOT logged in
<Route path="/" element={user ? <Dashboard /> : <Landing />} />
```

**Step 3: Commit**

```bash
git add src/pages/Landing.tsx src/App.tsx
git commit -m "feat(landing): add public landing page for voxie.lat"
```

---

### Task 12: PWA install prompt

**Files:**
- Create: `src/components/PWAInstallPrompt.tsx`
- Modify: `src/App.tsx` or Dashboard (show prompt after login)
- Modify: `src/pages/Landing.tsx` (show install section)

**Step 1: Create PWA install prompt component**

Create `src/components/PWAInstallPrompt.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa-prompt-dismissed') === 'true'
  );
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Check iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDismissed(true);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  return (
    <div className="mx-4 mb-4 p-4 bg-bg-card border border-border rounded-2xl flex items-start gap-3">
      <Download className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">
          Instala Voxie como app
        </p>
        {isIOS ? (
          <p className="text-xs text-text-muted mt-1">
            Toca el botón compartir <span className="inline-block">⬆️</span> y luego "Agregar a inicio"
          </p>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="text-xs text-primary font-medium mt-1"
          >
            Instalar ahora
          </button>
        ) : (
          <p className="text-xs text-text-muted mt-1">
            Abre el menú de tu navegador y selecciona "Instalar app" o "Agregar a inicio"
          </p>
        )}
      </div>
      <button onClick={handleDismiss} className="text-text-muted">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

**Step 2: Show in Dashboard after login**

Add `<PWAInstallPrompt />` at the top of the Dashboard page.

**Step 3: Commit**

```bash
git add src/components/PWAInstallPrompt.tsx src/pages/Dashboard.tsx
git commit -m "feat(pwa): add smart install prompt with iOS/Android detection"
```

---

## Phase 4: Rebranding + Launch (Semana 4)

### Task 13: Rebrand LinguaCore → Voxie

**Files:**
- Modify: `vite.config.ts` (PWA manifest name, short_name, description)
- Modify: `index.html` (title)
- Modify: `package.json` (name)
- Modify: `src/i18n/` (any hardcoded "LinguaCore" strings)
- Replace: PWA icons (icon-192.png, icon-512.png) with Voxie branding
- Modify: Any component that references "LinguaCore" by name

**Step 1: Search for all "LinguaCore" references**

```bash
grep -ri "linguacore" --include="*.ts" --include="*.tsx" --include="*.html" --include="*.json" -l
```

**Step 2: Replace all occurrences**

- `vite.config.ts`: name → "Voxie - Aprende Inglés", short_name → "Voxie"
- `index.html`: `<title>Voxie</title>`
- `package.json`: name → "voxie"
- Any i18n strings referencing the old name

**Step 3: Update PWA icons**

Replace `public/icon-192.png` and `public/icon-512.png` with Voxie-branded icons. Can be generated with a simple text-based icon for MVP.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(rebrand): rename LinguaCore to Voxie across all references"
```

---

### Task 14: Configure domain and deploy

**Step 1: Buy voxie.lat on Vercel** ($1.99 USD in Vercel Dashboard → Domains)

**Step 2: Add domain to project**

In Vercel Dashboard → Project Settings → Domains → Add `voxie.lat`

**Step 3: Update environment variables**

- Update `VITE_APP_URL` to `https://voxie.lat`
- Update Mercado Pago webhook URL to `https://voxie.lat/api/payments/webhook`
- Update Supabase Auth redirect URLs to include `https://voxie.lat`

**Step 4: Deploy**

```bash
npx vercel --prod
```

**Step 5: Verify**

- `https://voxie.lat` loads the landing page
- Login/register works
- PWA install works
- All features functional

**Step 6: Commit any config changes**

```bash
git commit -m "chore: configure voxie.lat domain and update env references"
```

---

### Task 15: Push notifications setup

**Files:**
- Create: `src/lib/pushNotifications.ts` (registration and permission)
- Create: `api/notifications/send.ts` (send push via web-push)
- Modify: `vite.config.ts` (add push handler to service worker)

**Note:** This is a Semana 5-8 task. Implementation details will be refined based on user feedback from beta launch. The core requirement is:
- Max 2 notifications/day
- 1 practice reminder (if user hasn't opened app today)
- 1 learning insight (weekly stats, error patterns)
- User can disable each type independently
- Library: `web-push` for server-side, Push API for client-side

---

### Task 16: Trial system (14-day activation)

**Files:**
- Create: `api/trial/activate.ts` (activate trial)
- Modify: `src/hooks/useTier.ts` (check trial status)
- Modify: Dashboard or a hook that tracks consecutive days

**Note:** This is a Semana 5-8 task. Logic:
- Track consecutive study days in `profiles` (streak field already exists)
- When streak reaches 14, call `/api/trial/activate`
- Endpoint sets `trial_started_at = now()`, `trial_ends_at = now() + 7 days`, `tier = 'pro'`
- `useTier` checks if `trial_ends_at > now()` — if expired and no active subscription, revert to free
- Show banner during trial: "Te quedan X días de prueba"

---

## Execution Order Summary

| Phase | Task | Description | Priority |
|-------|------|-------------|----------|
| 1 | 1 | Add tier field to profiles | Critical |
| 1 | 2 | AI cache table and layer | Critical |
| 1 | 3 | Per-user rate limiting | Critical |
| 2 | 4 | Frontend gate components | Critical |
| 2 | 5 | Gate levels A2-B2 | Critical |
| 2 | 6 | Gate tutor messages | Critical |
| 2 | 7 | Gate FSRS reviews | High |
| 2 | 8 | Gate story generation | High |
| 2 | 9 | Create Pricing page | Critical |
| 3 | 10 | Mercado Pago integration | Critical |
| 3 | 11 | Landing page | Critical |
| 3 | 12 | PWA install prompt | High |
| 4 | 13 | Rebrand to Voxie | Critical |
| 4 | 14 | Domain + deploy | Critical |
| 5+ | 15 | Push notifications | Medium |
| 5+ | 16 | Trial system | Medium |
