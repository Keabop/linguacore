import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import {
    Users, Crown, Activity, Search, Shield, BookOpen,
    Flame, RefreshCw, X, ChevronUp, ChevronDown,
    BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdmin } from '../hooks/useAdmin';
import { toast } from '../lib/toast';
import LevelBadge from '../components/ui/LevelBadge';
import { CountUp } from '../components/reactbits';
import type { Profile } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser extends Profile {
    email: string | null;
    full_name: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null): string {
    if (!iso) return 'Nunca';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Ayer';
    if (days < 30) return `hace ${days}d`;
    const months = Math.floor(days / 30);
    return `hace ${months} mes${months > 1 ? 'es' : ''}`;
}

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

// All avatars use the Voxie primary purple to keep things consistent
const AVATAR_GRADIENT = 'from-[var(--color-primary)] to-[var(--color-primary-container)]';

function getInitials(name: string | null, email: string | null): string {
    if (name) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return '??';
}

function getDisplayName(name: string | null, email: string | null): string {
    if (name && name.trim()) return name.trim();
    if (email) return email.split('@')[0];
    return 'Usuario';
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────

function StatTile({
    label, value, icon: Icon, delay = 0,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: 'easeOut' }}
            className="rounded-[1.5rem] p-5 bg-[var(--color-card)] border border-white/[0.06] shadow-[var(--shadow-card)] flex items-center gap-4"
        >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center shadow-md shrink-0">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-[var(--color-on-surface-muted)] uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-[var(--color-on-surface)] mt-0.5">
                    <CountUp from={0} to={value} duration={1} />
                </p>
            </div>
        </motion.div>
    );
}

// ─── User Card ────────────────────────────────────────────────────────────────

function UserCard({
    user, onToggleTier, isPending,
}: {
    user: AdminUser;
    onToggleTier: (userId: string, newTier: 'free' | 'pro') => void;
    isPending: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const newTier = user.tier === 'pro' ? 'free' : 'pro';
    const initials = getInitials(user.full_name, user.email);
    const displayName = getDisplayName(user.full_name, user.email);

    const isActive = user.last_study_date
        ? Date.now() - new Date(user.last_study_date).getTime() < 7 * 24 * 60 * 60 * 1000
        : false;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group rounded-[1.5rem] bg-[var(--color-card)] border border-white/[0.06] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 overflow-hidden"
        >
            {/* Main Row */}
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENT} flex items-center justify-center text-white font-black text-sm sm:text-base shadow-md`}>
                        {initials}
                    </div>
                    {/* Online dot */}
                    {isActive && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[var(--color-card)] shadow-sm" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-black text-[var(--color-on-surface)] truncate">{displayName}</h3>
                        {user.tier === 'pro' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider shrink-0">
                                <Crown className="w-2.5 h-2.5" /> Pro
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-[var(--color-on-surface-muted)] truncate mt-0.5">
                        {user.email || 'Sin correo'}
                    </p>
                </div>

                {/* Quick Stats (desktop) */}
                <div className="hidden sm:flex items-center gap-4">
                    <div className="text-center">
                        <LevelBadge level={user.current_level} size="compact" />
                    </div>
                    <div className="flex items-center gap-1 text-[var(--color-on-surface)]">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-xs font-bold">{user.streak}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--color-on-surface)]">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        <span className="text-xs font-bold">{user.total_words_learned.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-[var(--color-on-surface-muted)] w-16 text-right">{timeAgo(user.last_study_date)}</span>
                </div>

                {/* Tier Toggle Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleTier(user.id, newTier); }}
                    disabled={isPending}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-black transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm active:scale-95 ${
                        user.tier === 'free'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    }`}
                >
                    {isPending ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : user.tier === 'free' ? (
                        <><Crown className="w-3 h-3" /> Dar Pro</>
                    ) : (
                        <><X className="w-3 h-3" /> Quitar</>
                    )}
                </button>

                {/* Expand toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] hover:bg-white/5 transition-all cursor-pointer"
                >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Mobile quick stats (always visible on mobile) */}
            <div className="flex sm:hidden items-center gap-3 px-5 pb-3 -mt-1">
                <LevelBadge level={user.current_level} size="compact" />
                <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-[11px] font-bold text-[var(--color-on-surface)]">{user.streak}</span>
                </div>
                <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[var(--color-primary)]" />
                    <span className="text-[11px] font-bold text-[var(--color-on-surface)]">{user.total_words_learned}</span>
                </div>
                <span className="text-[10px] text-[var(--color-on-surface-muted)] ml-auto">{timeAgo(user.last_study_date)}</span>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-2 border-t border-white/[0.05]">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <DetailCell label="Estado suscripción" value={user.subscription_status} />
                                <DetailCell label="Registrado" value={fmtDate(user.created_at)} />
                                <DetailCell label="Niveles desbloqueados" value={user.unlocked_levels.join(', ')} />
                                <DetailCell label="Última sesión" value={timeAgo(user.last_study_date)} />
                            </div>
                            {/* Level progress mini-bars */}
                            <div className="mt-4">
                                <p className="text-[10px] font-black text-[var(--color-on-surface-muted)] uppercase tracking-wider mb-2">Progreso por nivel</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['A1', 'A2', 'B1', 'B2'] as const).map(lvl => {
                                        const p = user.level_progress?.[lvl];
                                        const words = p?.words ?? 0;
                                        const maxWords = 100; // estimated max for visual proportion
                                        const pct = Math.min(100, Math.round((words / maxWords) * 100));
                                        const barColors: Record<string, string> = {
                                            A1: 'from-purple-300 to-purple-400',
                                            A2: 'from-purple-400 to-purple-500',
                                            B1: 'from-purple-500 to-purple-600',
                                            B2: 'from-purple-600 to-purple-700',
                                        };
                                        return (
                                            <div key={lvl} className="space-y-1">
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="font-bold text-[var(--color-on-surface)]">{lvl}</span>
                                                    <span className="text-[var(--color-on-surface-muted)]">{words}w</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ delay: 0.1, duration: 0.4 }}
                                                        className={`h-full bg-gradient-to-r ${barColors[lvl]} rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function DetailCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-[var(--color-on-surface-muted)] uppercase tracking-wider">{label}</p>
            <p className="text-xs font-semibold text-[var(--color-on-surface)] capitalize">{value || '—'}</p>
        </div>
    );
}

// ─── Level Distribution Bar ──────────────────────────────────────────────────

function LevelDistribution({ profiles }: { profiles: AdminUser[] }) {
    if (!profiles.length) return null;

    const levels = ['A1', 'A2', 'B1', 'B2'] as const;
    const counts = levels.map(lvl => profiles.filter(p => p.current_level === lvl).length);
    const total = profiles.length;
    const colors = [
        'bg-purple-300',
        'bg-purple-400',
        'bg-purple-500',
        'bg-purple-700',
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
        >
            <div className="rounded-[1.5rem] bg-[var(--color-card)] p-5 sm:p-6 shadow-[var(--shadow-card)] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-[var(--color-primary)]" />
                    <h3 className="text-sm font-black text-[var(--color-on-surface)]">Distribución por Nivel</h3>
                </div>
                {/* Segmented bar */}
                <div className="flex rounded-full overflow-hidden h-3 bg-white/5 mb-4">
                    {levels.map((lvl, i) => {
                        const pct = (counts[i] / total) * 100;
                        if (pct === 0) return null;
                        return (
                            <motion.div
                                key={lvl}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className={`${colors[i]} first:rounded-l-full last:rounded-r-full`}
                            />
                        );
                    })}
                </div>
                {/* Legends */}
                <div className="grid grid-cols-4 gap-2">
                    {levels.map((lvl, i) => {
                        const pct = total ? Math.round((counts[i] / total) * 100) : 0;
                        return (
                            <div key={lvl} className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${colors[i]} shrink-0`} />
                                <div>
                                    <span className="text-xs font-black text-[var(--color-on-surface)]">{lvl}</span>
                                    <span className="text-[10px] text-[var(--color-on-surface-muted)] ml-1">{counts[i]} ({pct}%)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const { isAdmin } = useAdmin();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filterTier, setFilterTier] = useState<'all' | 'free' | 'pro'>('all');
    const [filterLevel, setFilterLevel] = useState<'all' | 'A1' | 'A2' | 'B1' | 'B2'>('all');
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

    if (!isAdmin) return <Navigate to="/dashboard" replace />;

    // ── Fetch users via RPC (joins profiles + auth for email/name) ──────────
    // Falls back to raw profiles if the RPC function doesn't exist yet.
    const { data: users = [], isLoading, error, refetch } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            // Try the RPC approach first (provides email + name)
            const { data: rpcData, error: rpcError } = await supabase.rpc('admin_get_users');

            if (!rpcError && rpcData) {
                return (rpcData as AdminUser[]);
            }

            // Fallback: just profiles without emails
            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profileError) throw profileError;
            return ((data ?? []) as Profile[]).map((p) => ({
                ...p,
                email: null,
                full_name: null,
            })) as AdminUser[];
        },
        enabled: isAdmin,
        staleTime: 60_000,
    });

    // ── Tier toggle mutation ───────────────────────────────────────────────────
    const { mutateAsync: toggleTier } = useMutation({
        mutationFn: async ({ userId, newTier }: { userId: string; newTier: 'free' | 'pro' }) => {
            const { error } = await supabase
                .from('profiles')
                .update({
                    tier: newTier,
                    subscription_status: newTier === 'pro' ? 'active' : 'inactive',
                    ...(newTier === 'pro' ? {
                        trial_started_at: null,
                        trial_ends_at: null,
                    } : {}),
                })
                .eq('id', userId);
            if (error) throw error;
        },
        onSuccess: (_, { newTier }) => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success({
                title: newTier === 'pro' ? '🎉 ¡Usuario actualizado a Pro!' : 'Usuario cambiado a Free',
            });
        },
        onError: (err: Error) => {
            toast.error({ title: 'Error al actualizar', description: err.message });
        },
    });

    async function handleToggleTier(userId: string, newTier: 'free' | 'pro') {
        setPendingIds(prev => new Set(prev).add(userId));
        try {
            await toggleTier({ userId, newTier });
        } finally {
            setPendingIds(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    }

    // ── Computed Stats ─────────────────────────────────────────────────────────
    const totalUsers = users.length;
    const proUsers = users.filter(p => p.tier === 'pro').length;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const activeUsers = users.filter(p => p.last_study_date && p.last_study_date > sevenDaysAgo).length;
    const avgStreak = users.length
        ? Math.round(users.reduce((acc, p) => acc + p.streak, 0) / users.length)
        : 0;

    // ── Filtered list ──────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return users.filter(p => {
            const matchesTier = filterTier === 'all' || p.tier === filterTier;
            const matchesLevel = filterLevel === 'all' || p.current_level === filterLevel;
            const searchLower = search.toLowerCase();
            const matchesSearch = !search
                || p.email?.toLowerCase().includes(searchLower)
                || p.full_name?.toLowerCase().includes(searchLower)
                || p.id.toLowerCase().includes(searchLower);
            return matchesTier && matchesLevel && matchesSearch;
        });
    }, [users, filterTier, filterLevel, search]);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="py-6 px-2 sm:px-4 md:px-6 max-w-6xl mx-auto space-y-8">

            {/* ── Premium Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-on-surface)] tracking-tight">
                            Panel de Control
                        </h1>
                        <p className="text-xs text-[var(--color-on-surface-muted)] font-medium mt-0.5">
                            {totalUsers} usuario{totalUsers !== 1 ? 's' : ''} registrado{totalUsers !== 1 ? 's' : ''} · Voxie Admin
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-primary)] text-xs font-bold transition-all hover:shadow-md cursor-pointer active:scale-95"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Actualizar</span>
                </button>
            </motion.div>

            {/* ── Stat Tiles Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatTile label="Total Usuarios" value={totalUsers} icon={Users} delay={0.05} />
                <StatTile label="Usuarios Pro" value={proUsers} icon={Crown} delay={0.1} />
                <StatTile label="Activos (7d)" value={activeUsers} icon={Activity} delay={0.15} />
                <StatTile label="Racha Promedio" value={avgStreak} icon={Flame} delay={0.2} />
            </div>

            {/* ── Level Distribution ── */}
            <LevelDistribution profiles={users} />

            {/* ── Search & Filters ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
            >
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-on-surface-muted)]" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-card)] border border-white/[0.06] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-muted)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all shadow-[var(--shadow-card)]"
                    />
                </div>

                {/* Tier filter */}
                <select
                    value={filterTier}
                    onChange={e => setFilterTier(e.target.value as typeof filterTier)}
                    className="px-4 py-3 rounded-xl bg-[var(--color-card)] border border-white/[0.06] text-xs font-bold text-[var(--color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 cursor-pointer shadow-[var(--shadow-card)]"
                >
                    <option value="all">Todos los tiers</option>
                    <option value="pro">Solo Pro ✨</option>
                    <option value="free">Solo Free</option>
                </select>

                {/* Level filter */}
                <select
                    value={filterLevel}
                    onChange={e => setFilterLevel(e.target.value as typeof filterLevel)}
                    className="px-4 py-3 rounded-xl bg-[var(--color-card)] border border-white/[0.06] text-xs font-bold text-[var(--color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 cursor-pointer shadow-[var(--shadow-card)]"
                >
                    <option value="all">Todos los niveles</option>
                    <option value="A1">A1 · Principiante</option>
                    <option value="A2">A2 · Básico</option>
                    <option value="B1">B1 · Intermedio</option>
                    <option value="B2">B2 · Avanzado</option>
                </select>
            </motion.div>

            {/* ── Results Count (inline with search) ── */}
            {!isLoading && !error && (
                <p className="text-[11px] font-semibold text-[var(--color-on-surface-muted)]">
                    {filtered.length} de {totalUsers} usuario{totalUsers !== 1 ? 's' : ''}
                    {filterTier !== 'all' || filterLevel !== 'all' || search ? ' · filtrado' : ''}
                </p>
            )}

            {/* ── Loading ── */}
            {isLoading && (
                <div className="flex items-center justify-center py-20 gap-3 text-[var(--color-on-surface-muted)]">
                    <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
                    <span className="text-sm font-medium">Cargando usuarios…</span>
                </div>
            )}

            {/* ── Error ── */}
            {error && (
                <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    <p className="font-bold">No se pudieron cargar los usuarios</p>
                    <p className="text-xs mt-1 opacity-80">Verifica las políticas RLS en Supabase.</p>
                </div>
            )}

            {/* ── User Cards List ── */}
            {!isLoading && !error && (
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filtered.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16 text-sm text-[var(--color-on-surface-muted)]"
                            >
                                {users.length === 0
                                    ? 'No hay usuarios registrados aún'
                                    : 'Ningún usuario coincide con los filtros'}
                            </motion.div>
                        ) : (
                            filtered.map((user, i) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    onToggleTier={handleToggleTier}
                                    isPending={pendingIds.has(user.id)}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
