# Account & Settings System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `/stats` with a unified `/account` page (profile + stats + level progress), add a settings modal (theme, plan, logout), redesign sidebar bottom as clickable user area, and add a cancel-subscription API endpoint.

**Architecture:** The `/stats` page becomes `/account`. Sidebar bottom section becomes a clickable user card (avatar + name + level). A `SettingsModal` handles theme toggle, plan management, and logout. Plan management includes cancel/reactivate via a new Vercel serverless function that calls Mercado Pago PreApproval API. Pro users see extra stats (activity heatmap, vocabulary breakdown); free users see basic stats + upsell.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase, Mercado Pago PreApproval API, Vercel serverless functions, react-i18next, Lucide icons.

---

### Task 1: Add i18n keys for account/settings/plan

**Files:**
- Modify: `src/i18n/es.json`

**Step 1: Add translation keys**

Add these keys to `src/i18n/es.json`:

```json
"account": {
    "title": "Mi cuenta",
    "plan": "Plan",
    "planFree": "Gratuito",
    "planPro": "Pro",
    "planMonthly": "Mensual",
    "planAnnual": "Anual",
    "memberSince": "Miembro desde",
    "nextBilling": "Próximo cobro",
    "cancelSubscription": "Cancelar suscripción",
    "reactivateSubscription": "Reactivar suscripción",
    "upgradeToPro": "Mejorar a Pro",
    "cancelConfirmTitle": "¿Seguro que deseas cancelar?",
    "cancelConfirmLose": "Perderás acceso a:",
    "cancelLoseLevel": "Niveles A2, B1 y B2",
    "cancelLoseTutor": "Tutor IA ilimitado",
    "cancelLoseWriting": "Práctica de escritura ilimitada",
    "cancelLoseStories": "Generación de historias",
    "cancelAccessUntil": "Tu acceso Pro continúa hasta el {{date}}",
    "cancelKeep": "Mantener Pro",
    "cancelConfirm": "Sí, cancelar",
    "cancelSuccess": "Suscripción cancelada. Tu acceso Pro continúa hasta el final del período.",
    "cancelError": "Error al cancelar. Intenta de nuevo.",
    "reactivateSuccess": "¡Suscripción reactivada!",
    "reactivateError": "Error al reactivar. Intenta de nuevo.",
    "proStats": "Estadísticas avanzadas disponibles con Plan Pro"
},
"settings": {
    "title": "Configuración",
    "theme": "Tema",
    "themeLight": "Claro",
    "themeDark": "Oscuro",
    "language": "Idioma",
    "planAndSubscription": "Plan y suscripción",
    "logout": "Cerrar sesión"
}
```

Place these after the `"assessment"` block at the end of the file, before the closing `}`.

**Step 2: Remove old stats nav key**

Change `"nav.stats"` key from `"Estadísticas"` to `"Cuenta"` — actually, we won't need this key anymore since stats is removed from nav. Leave it for now (other places might reference it) and we'll clean up later.

**Step 3: Commit**

```bash
git add src/i18n/es.json
git commit -m "feat(i18n): add account, settings, and plan translation keys"
```

---

### Task 2: Create cancel-subscription API endpoint

**Files:**
- Create: `api/payments/cancel-subscription.ts`

**Step 1: Create the endpoint**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const ALLOWED_ORIGINS = [
    'https://linguacore-zeta.vercel.app',
    'https://voxie.lat',
    'https://www.voxie.lat',
    'http://localhost:5173',
    'http://localhost:4173',
];

function getCorsOrigin(req: VercelRequest): string {
    const origin = req.headers.origin ?? '';
    return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

async function authenticate(req: VercelRequest) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const corsOrigin = getCorsOrigin(req);
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const user = await authenticate(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            return res.status(500).json({ error: 'Payment provider not configured' });
        }

        // Get user's subscription_id from profile
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_id, subscription_status')
            .eq('id', user.id)
            .single();

        if (!profile?.subscription_id) {
            return res.status(400).json({ error: 'No active subscription found' });
        }

        const { action } = req.body as { action: 'cancel' | 'reactivate' };

        const client = new MercadoPagoConfig({ accessToken });
        const preApproval = new PreApproval(client);

        if (action === 'cancel') {
            await preApproval.update({
                id: profile.subscription_id,
                body: { status: 'cancelled' },
            });

            // Update profile — keep tier as 'pro' until webhook confirms end of cycle
            // The webhook will set tier to 'free' when MP sends the cancelled event
            await supabase
                .from('profiles')
                .update({ subscription_status: 'cancelled' })
                .eq('id', user.id);

            return res.status(200).json({ success: true, action: 'cancelled' });
        }

        if (action === 'reactivate') {
            await preApproval.update({
                id: profile.subscription_id,
                body: { status: 'authorized' },
            });

            await supabase
                .from('profiles')
                .update({ subscription_status: 'active' })
                .eq('id', user.id);

            return res.status(200).json({ success: true, action: 'reactivated' });
        }

        return res.status(400).json({ error: 'Invalid action. Must be "cancel" or "reactivate".' });
    } catch (error: any) {
        console.error('[Payments] Error managing subscription:', error);
        return res.status(500).json({ error: 'Failed to update subscription' });
    }
}
```

**Step 2: Commit**

```bash
git add api/payments/cancel-subscription.ts
git commit -m "feat(api): add cancel/reactivate subscription endpoint"
```

---

### Task 3: Create useSubscription hook

**Files:**
- Create: `src/hooks/useSubscription.ts`

**Step 1: Create the hook**

This hook fetches the user's subscription info from the profile and provides cancel/reactivate functions.

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

interface SubscriptionInfo {
    tier: 'free' | 'pro';
    subscriptionId: string | null;
    subscriptionStatus: 'inactive' | 'active' | 'cancelled' | 'past_due';
    createdAt: string;
}

export function useSubscription() {
    const { user, session } = useAuth();
    const qc = useQueryClient();

    const { data: subscription, isLoading } = useQuery({
        queryKey: ['subscription', user?.id],
        queryFn: async () => {
            const { data } = await supabase
                .from('profiles')
                .select('tier, subscription_id, subscription_status, created_at')
                .eq('id', user!.id)
                .single();
            if (!data) return null;
            return {
                tier: data.tier,
                subscriptionId: data.subscription_id,
                subscriptionStatus: data.subscription_status,
                createdAt: data.created_at,
            } as SubscriptionInfo;
        },
        enabled: !!user?.id,
        staleTime: 30_000,
    });

    const manageSubscription = async (action: 'cancel' | 'reactivate') => {
        if (!session?.access_token) throw new Error('No session');

        const res = await fetch('/api/payments/cancel-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ action }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to update subscription');
        }

        // Invalidate queries to refetch fresh data
        qc.invalidateQueries({ queryKey: ['subscription'] });
        qc.invalidateQueries({ queryKey: ['profile-tier'] });
        qc.invalidateQueries({ queryKey: ['profile'] });
    };

    return {
        subscription,
        loading: isLoading,
        cancelSubscription: () => manageSubscription('cancel'),
        reactivateSubscription: () => manageSubscription('reactivate'),
    };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useSubscription.ts
git commit -m "feat: add useSubscription hook for plan management"
```

---

### Task 4: Create SettingsModal component

**Files:**
- Create: `src/components/SettingsModal.tsx`

**Step 1: Create the modal**

The modal contains: theme toggle, language (static for now), plan/subscription section, and logout. The plan section shows different content for free vs pro users, including cancel confirmation dialog.

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Globe, CreditCard, LogOut, Loader2, AlertTriangle, Crown } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { useAuth } from '../lib/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useTier } from '../hooks/useTier';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const { signOut } = useAuth();
    const { subscription, cancelSubscription, reactivateSubscription } = useSubscription();
    const { isPro } = useTier();
    const navigate = useNavigate();

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const handleCancel = async () => {
        setActionLoading(true);
        setActionError(null);
        try {
            await cancelSubscription();
            setShowCancelConfirm(false);
            onClose();
        } catch {
            setActionError(t('account.cancelError'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReactivate = async () => {
        setActionLoading(true);
        setActionError(null);
        try {
            await reactivateSubscription();
            onClose();
        } catch {
            setActionError(t('account.reactivateError'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <div
                            className="w-full max-w-md bg-bg-card border border-border rounded-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                                <h2 className="text-lg font-bold text-text">{t('settings.title')}</h2>
                                <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-app transition-colors">
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Theme */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {theme === 'dark' ? <Moon className="w-5 h-5 text-text-muted" /> : <Sun className="w-5 h-5 text-text-muted" />}
                                        <span className="text-sm font-medium text-text">{t('settings.theme')}</span>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-app border border-border text-text-secondary hover:text-text transition-colors"
                                    >
                                        {theme === 'dark' ? t('settings.themeLight') : t('settings.themeDark')}
                                    </button>
                                </div>

                                {/* Language */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-text-muted" />
                                        <span className="text-sm font-medium text-text">{t('settings.language')}</span>
                                    </div>
                                    <span className="text-xs text-text-muted px-3 py-1.5 rounded-lg bg-bg-app border border-border">
                                        Español
                                    </span>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-border" />

                                {/* Plan & Subscription */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-text-muted" />
                                        <span className="text-sm font-medium text-text">{t('settings.planAndSubscription')}</span>
                                    </div>

                                    {isPro && subscription?.subscriptionStatus === 'active' && (
                                        <div className="bg-bg-app border border-border rounded-xl p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Crown className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-bold text-text">Plan Pro</span>
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                                    {t('account.planPro')}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setShowCancelConfirm(true)}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                {t('account.cancelSubscription')}
                                            </button>
                                        </div>
                                    )}

                                    {isPro && subscription?.subscriptionStatus === 'cancelled' && (
                                        <div className="bg-bg-app border border-border rounded-xl p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Crown className="w-4 h-4 text-accent-amber" />
                                                <span className="text-sm font-bold text-text">Plan Pro</span>
                                                <span className="text-xs bg-accent-amber/10 text-accent-amber px-2 py-0.5 rounded-full font-medium">
                                                    Cancela pronto
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleReactivate}
                                                disabled={actionLoading}
                                                className="text-xs text-primary hover:text-primary-light transition-colors flex items-center gap-1"
                                            >
                                                {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                                {t('account.reactivateSubscription')}
                                            </button>
                                        </div>
                                    )}

                                    {!isPro && (
                                        <div className="bg-bg-app border border-border rounded-xl p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-text-muted">{t('account.planFree')}</span>
                                            </div>
                                            <button
                                                onClick={() => { navigate('/pricing'); onClose(); }}
                                                className="text-xs bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                                            >
                                                {t('account.upgradeToPro')}
                                            </button>
                                        </div>
                                    )}

                                    {actionError && (
                                        <p className="text-xs text-red-400">{actionError}</p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-border" />

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
                                >
                                    <LogOut className="w-5 h-5" />
                                    {t('settings.logout')}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Cancel Confirmation Dialog */}
                    <AnimatePresence>
                        {showCancelConfirm && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[60] bg-black/40"
                                    onClick={() => setShowCancelConfirm(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                                    onClick={() => setShowCancelConfirm(false)}
                                >
                                    <div
                                        className="w-full max-w-sm bg-bg-card border border-border rounded-2xl p-6 space-y-4"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                            </div>
                                            <h3 className="text-base font-bold text-text">{t('account.cancelConfirmTitle')}</h3>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">{t('account.cancelConfirmLose')}</p>
                                            <ul className="space-y-1.5">
                                                {[
                                                    t('account.cancelLoseLevel'),
                                                    t('account.cancelLoseTutor'),
                                                    t('account.cancelLoseWriting'),
                                                    t('account.cancelLoseStories'),
                                                ].map(item => (
                                                    <li key={item} className="flex items-center gap-2 text-sm text-red-400">
                                                        <X className="w-3.5 h-3.5 shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <p className="text-xs text-text-muted bg-bg-app rounded-lg p-3">
                                            {t('account.cancelAccessUntil', { date: 'el final de tu período de facturación' })}
                                        </p>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowCancelConfirm(false)}
                                                className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors"
                                            >
                                                {t('account.cancelKeep')}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={actionLoading}
                                                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1"
                                            >
                                                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                {t('account.cancelConfirm')}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}
```

**Step 2: Commit**

```bash
git add src/components/SettingsModal.tsx
git commit -m "feat: add SettingsModal with theme, plan management, and logout"
```

---

### Task 5: Create Account page (replaces Stats)

**Files:**
- Create: `src/pages/Account.tsx`
- Delete: `src/pages/Stats.tsx`

**Step 1: Create Account.tsx**

This page combines: user profile header (avatar + name + email + plan badge), basic stats (visible to all users), level progress (using `useLevelProgression`), and pro-only stats (activity heatmap, vocabulary breakdown) gated behind `useTier().isPro`.

The page reuses the same data queries from the old `Stats.tsx` (readStories, cards, knownCount) and the existing `useLevelProgression` hook. The gear icon in the header opens the SettingsModal.

```typescript
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings, Flame, Layers, RotateCcw, Target, BookOpen, Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useCards } from '../hooks/useCards';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useTier } from '../hooks/useTier';
import LevelBadge from '../components/ui/LevelBadge';
import SettingsModal from '../components/SettingsModal';
import type { ReadStoryRow, CardRow } from '../lib/database.types';

export default function Account() {
    const { t } = useTranslation();
    const { user: authUser } = useAuth();
    const { totalCards } = useCards();
    const { user, progressInfo } = useLevelProgression();
    const { isPro, isFree } = useTier();
    const [settingsOpen, setSettingsOpen] = useState(false);

    const { data: readStories } = useQuery({
        queryKey: ['readStories', authUser?.id],
        queryFn: async () => {
            const { data } = await supabase.from('read_stories').select('*');
            return (data ?? []) as ReadStoryRow[];
        },
        enabled: !!authUser?.id,
    });

    const { data: cards } = useQuery({
        queryKey: ['cards', authUser?.id],
        queryFn: async () => {
            const { data } = await supabase.from('cards').select('*');
            return (data ?? []) as CardRow[];
        },
        enabled: !!authUser?.id,
    });

    const { data: knownCount } = useQuery({
        queryKey: ['knownWordsCount', authUser?.id],
        queryFn: async () => {
            const { count } = await supabase.from('known_words').select('*', { count: 'exact', head: true });
            return count ?? 0;
        },
        enabled: !!authUser?.id,
    });

    const totalReviews = cards?.reduce((sum, c) => sum + c.reps, 0) ?? 0;
    const avgRetention = (() => {
        if (!cards || cards.length === 0) return 0;
        const reviewed = cards.filter(c => c.reps > 0);
        if (reviewed.length === 0) return 0;
        const correct = reviewed.reduce((s, c) => s + (c.reps - c.lapses), 0);
        const total = reviewed.reduce((s, c) => s + c.reps, 0);
        return total > 0 ? Math.round((correct / total) * 100) : 0;
    })();

    // Activity heatmap data (last 35 days) — Pro only
    const activityData = (() => {
        if (!readStories && !cards) return [];
        const days: { date: string; count: number }[] = [];
        for (let i = 34; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000);
            const ds = d.toISOString().split('T')[0];
            let count = 0;
            readStories?.forEach(r => {
                if (r.completed_at?.split('T')[0] === ds) count++;
            });
            cards?.forEach(c => {
                if (c.last_review && c.last_review.split('T')[0] === ds) count++;
            });
            days.push({ date: ds, count });
        }
        return days;
    })();

    const maxActivity = Math.max(...activityData.map(d => d.count), 1);

    if (!user) return null;

    const initial = authUser?.email?.charAt(0).toUpperCase() ?? '?';

    return (
        <>
            <div className="space-y-8">
                {/* ===== Profile Header ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
                            {initial}
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-text">{authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0]}</h1>
                            <p className="text-sm text-text-muted">{authUser?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <LevelBadge level={progressInfo?.currentLevel ?? 'A1'} size="compact" />
                                {isPro && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                        <Crown className="w-3 h-3" /> Pro
                                    </span>
                                )}
                                {isFree && (
                                    <span className="text-xs bg-bg-app text-text-muted px-2 py-0.5 rounded-full font-medium border border-border">
                                        {t('account.planFree')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-2.5 rounded-xl bg-bg-card border border-border hover:border-primary/30 transition-colors"
                        aria-label={t('settings.title')}
                    >
                        <Settings className="w-5 h-5 text-text-muted" />
                    </button>
                </motion.div>

                {/* ===== Basic Stats (all users) ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                    <StatCard icon={<Flame className="w-5 h-5" />} value={user.streak} label={t('dashboard.streak')} color="text-accent-orange" />
                    <StatCard icon={<Layers className="w-5 h-5" />} value={(totalCards ?? 0) + (knownCount ?? 0)} label={t('dashboard.wordsLearned')} color="text-accent-blue" />
                    <StatCard icon={<BookOpen className="w-5 h-5" />} value={readStories?.length ?? 0} label={t('dashboard.storiesRead')} color="text-primary" />
                    <StatCard icon={<RotateCcw className="w-5 h-5" />} value={totalReviews} label={t('stats.totalReviews')} color="text-accent-purple" />
                </motion.div>

                {/* ===== Level Progress ===== */}
                {progressInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="widget"
                    >
                        <div className="widget-title">{t('progress.currentLevel')}</div>
                        <div className="flex items-center gap-4">
                            <LevelBadge level={progressInfo.currentLevel} size="default" />
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-text-secondary font-medium">{progressInfo.unitsCompleted}/{progressInfo.unitsTotal} {t('progress.unitsCompleted').toLowerCase()}</span>
                                    <span className="text-text-secondary font-bold">{progressInfo.overallPercent}%</span>
                                </div>
                                <div className="h-2 bg-bg-app rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${progressInfo.overallPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ===== Pro Stats: Activity Heatmap ===== */}
                {isPro ? (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="widget"
                    >
                        <div className="widget-title">{t('stats.activity')}</div>
                        <div className="grid grid-cols-7 gap-2">
                            {activityData.map((day) => {
                                const intensity = day.count > 0 ? Math.max(0.2, day.count / maxActivity) : 0;
                                return (
                                    <div
                                        key={day.date}
                                        className="aspect-square rounded-sm transition-colors"
                                        style={{
                                            backgroundColor: day.count > 0
                                                ? `rgba(34, 197, 94, ${0.15 + intensity * 0.65})`
                                                : 'rgba(255, 255, 255, 0.03)',
                                        }}
                                        title={`${day.date}: ${day.count} ${t('stats.activities')}`}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-text-muted">
                            <span>{t('stats.lessActive')}</span>
                            <div className="flex gap-1">
                                {[0, 0.2, 0.4, 0.7, 1].map((op, i) => (
                                    <div
                                        key={i}
                                        className="w-2.5 h-2.5 rounded-sm"
                                        style={{ backgroundColor: op > 0 ? `rgba(34, 197, 94, ${0.15 + op * 0.65})` : 'rgba(255,255,255,0.03)' }}
                                    />
                                ))}
                            </div>
                            <span>{t('stats.moreActive')}</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="widget border-dashed"
                    >
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-sm text-text-muted">{t('account.proStats')}</p>
                            <Link
                                to="/pricing"
                                className="text-xs bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                            >
                                {t('account.upgradeToPro')}
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* ===== Pro Stats: Vocabulary Breakdown ===== */}
                {isPro && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="widget"
                    >
                        <div className="widget-title">{t('stats.vocabulary')}</div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary">{t('stats.inDeck')}</span>
                                <span className="text-sm font-bold text-accent-blue">{totalCards}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary">{t('stats.knownWords')}</span>
                                <span className="text-sm font-bold text-primary">{knownCount ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary">{t('stats.avgRetention')}</span>
                                <span className="text-sm font-bold text-accent-purple">{avgRetention}%</span>
                            </div>
                            <div className="border-t border-border pt-3 flex items-center justify-between">
                                <span className="text-sm font-semibold">{t('stats.total')}</span>
                                <span className="text-sm font-bold text-text">{(totalCards ?? 0) + (knownCount ?? 0)}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
    );
}

function StatCard({ icon, value, label, color }: {
    icon: React.ReactNode; value: number | string; label: string; color: string;
}) {
    return (
        <div className="widget text-center">
            <div className={`flex justify-center ${color}`}>{icon}</div>
            <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{label}</p>
        </div>
    );
}
```

**Step 2: Delete Stats.tsx**

Delete `src/pages/Stats.tsx` — its functionality is fully absorbed into `Account.tsx`.

**Step 3: Commit**

```bash
git add src/pages/Account.tsx
git rm src/pages/Stats.tsx
git commit -m "feat: create Account page replacing Stats with profile, plan, and pro-gated stats"
```

---

### Task 6: Update Layout sidebar bottom

**Files:**
- Modify: `src/components/Layout.tsx`

**Step 1: Replace sidebar bottom section**

Remove the current bottom section (level badge + theme toggle + logout) and replace with a clickable user card. Also remove `"stats"` from `navItems` and remove unused imports (`LogOut`, `Sun`, `Moon`, `useTheme`, `useAuth` for signOut).

In `navItems` array, remove the stats entry:
```typescript
// REMOVE this line:
{ path: '/stats', icon: BarChart3, labelKey: 'nav.stats' },
```

Remove imports that are no longer needed in sidebar: `LogOut`, `Sun`, `Moon`. Remove `useTheme` import and `useAuth` import (only if signOut was the only thing used from it — check if `useAuth` is used elsewhere in Layout). Actually `useAuth` is only used for `signOut`, so remove it. `useTheme` is only used for the theme toggle, so remove it.

Replace the sidebar bottom section (`{/* Level badge at bottom */}`) with:

```tsx
{/* User area at bottom */}
{progressInfo && authUser && (
    <NavLink
        to="/account"
        className={({ isActive }) =>
            `mt-auto pt-6 border-t border-border px-2 flex items-center gap-3 rounded-xl py-2 transition-colors hover:bg-bg-app/50 ${isActive ? 'bg-bg-app/50' : ''}`
        }
    >
        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {authUser.email?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text truncate">
                {authUser.user_metadata?.full_name || authUser.email?.split('@')[0]}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
                <LevelBadge level={progressInfo.currentLevel} size="compact" />
            </div>
        </div>
    </NavLink>
)}
```

Also need to add `useAuth` for `authUser` (the auth user object, not for signOut):

```typescript
const { user: authUser } = useAuth();
```

Remove the old mobile theme toggle button (fixed button at bottom of Layout that was `lg:hidden`).

**Step 2: Update imports**

Remove: `LogOut`, `Sun`, `Moon` from lucide imports. Remove `useTheme` import.
Keep: `useAuth` (but use it for `authUser` instead of `signOut`).

**Step 3: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "feat(layout): replace sidebar bottom with clickable user card, remove stats from nav"
```

---

### Task 7: Update App.tsx routing

**Files:**
- Modify: `src/App.tsx`

**Step 1: Replace Stats with Account**

Change the lazy import:
```typescript
// REMOVE:
const Stats = lazyRetry(() => import('./pages/Stats'));
// ADD:
const Account = lazyRetry(() => import('./pages/Account'));
```

Change the route:
```typescript
// REMOVE:
<Route path="/stats" element={<SafeRoute><Stats /></SafeRoute>} />
// ADD:
<Route path="/account" element={<SafeRoute><Account /></SafeRoute>} />
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat(routes): replace /stats with /account route"
```

---

### Task 8: Build verification and final cleanup

**Step 1: Run TypeScript check**

```bash
cd /e/UNIVERSIDAD/PERSONALES/AppIngles/linguacore && npx tsc --noEmit
```

Expected: 0 errors. If there are errors, fix them.

**Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds. Check the output for any warnings.

**Step 3: Verify no references to old /stats path remain**

Search for `/stats` in the codebase (excluding node_modules, dist). Any remaining references should be updated to `/account`.

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build errors and clean up /stats references"
```

---

## File Summary

**New files (3):**
| File | Purpose |
|------|---------|
| `api/payments/cancel-subscription.ts` | Cancel/reactivate Mercado Pago subscription |
| `src/hooks/useSubscription.ts` | Subscription data + cancel/reactivate functions |
| `src/components/SettingsModal.tsx` | Settings modal (theme, plan, logout) |

**Replaced files (1):**
| File | Replacement |
|------|-------------|
| `src/pages/Stats.tsx` → `src/pages/Account.tsx` | Profile + stats + level progress + settings |

**Modified files (3):**
| File | Changes |
|------|---------|
| `src/i18n/es.json` | Add account/settings translation keys |
| `src/components/Layout.tsx` | New user card in sidebar bottom, remove stats nav, remove theme/logout |
| `src/App.tsx` | Replace `/stats` route with `/account` |
