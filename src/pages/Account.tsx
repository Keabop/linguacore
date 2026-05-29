import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings, Flame, Layers, RotateCcw, BookOpen, Crown, Lock, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
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
    const { proTheme, setProTheme } = useTheme();

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
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center text-2xl font-black text-white shadow-[var(--shadow-elevated)]">
                            {initial}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-[var(--color-on-surface)]">{authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0]}</h1>
                            <p className="text-sm text-[var(--color-on-surface-muted)]">{authUser?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <LevelBadge level={progressInfo?.currentLevel ?? 'A1'} size="compact" />
                                {isPro && (
                                    <span className="text-xs bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white px-3 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-[var(--shadow-card)]">
                                        <Crown className="w-3 h-3" /> Pro
                                    </span>
                                )}
                                {isFree && (
                                    <span className="text-xs bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] px-3 py-0.5 rounded-full font-medium">
                                        {t('account.planFree')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-2.5 rounded-full bg-[var(--color-card)] shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
                        aria-label={t('settings.title')}
                    >
                        <Settings className="w-5 h-5 text-[var(--color-on-surface-muted)]" />
                    </button>
                </motion.div>

                {/* ===== Basic Stats (all users) ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                    <StatCard icon={<Flame className="w-5 h-5" />} value={user.streak} label={t('dashboard.streak')} color="text-[var(--color-warning)]" />
                    <StatCard icon={<Layers className="w-5 h-5" />} value={(totalCards ?? 0) + (knownCount ?? 0)} label={t('dashboard.wordsLearned')} color="text-[var(--color-level-a1)]" />
                    <StatCard icon={<BookOpen className="w-5 h-5" />} value={readStories?.length ?? 0} label={t('dashboard.storiesRead')} color="text-[var(--color-primary)]" />
                    <StatCard icon={<RotateCcw className="w-5 h-5" />} value={totalReviews} label={t('stats.totalReviews')} color="text-[var(--color-primary)]" />
                </motion.div>

                {/* ===== Level Progress ===== */}
                {progressInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-[var(--color-card)] rounded-[2rem] p-6 shadow-[var(--shadow-card)]"
                    >
                        <div className="text-sm font-bold text-[var(--color-on-surface-muted)] mb-4">{t('progress.currentLevel')}</div>
                        <div className="flex items-center gap-4">
                            <LevelBadge level={progressInfo.currentLevel} size="default" />
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-[var(--color-on-surface-muted)] font-medium">{progressInfo.unitsCompleted}/{progressInfo.unitsTotal} {t('progress.unitsCompleted').toLowerCase()}</span>
                                    <span className="text-[var(--color-on-surface-muted)] font-bold">{progressInfo.overallPercent}%</span>
                                </div>
                                <div className="h-2.5 bg-[var(--color-surface-container-highest)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] rounded-full transition-all duration-500"
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
                        className="bg-[var(--color-card)] rounded-[2rem] p-6 shadow-[var(--shadow-card)]"
                    >
                        <div className="text-sm font-bold text-[var(--color-on-surface-muted)] mb-4">{t('stats.activity')}</div>
                        <div className="grid grid-cols-7 gap-2">
                            {activityData.map((day) => {
                                const intensity = day.count > 0 ? Math.max(0.2, day.count / maxActivity) : 0;
                                return (
                                    <div
                                        key={day.date}
                                        className="aspect-square rounded-lg transition-colors"
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
                        <div className="flex justify-between mt-3 text-[10px] text-[var(--color-on-surface-muted)]">
                            <span>{t('stats.lessActive')}</span>
                            <div className="flex gap-1">
                                {[0, 0.2, 0.4, 0.7, 1].map((op, i) => (
                                    <div
                                        key={i}
                                        className="w-2.5 h-2.5 rounded-md"
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
                        className="bg-[var(--color-surface-container)] rounded-[2rem] p-6 shadow-[var(--shadow-card)]"
                    >
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shadow-[var(--shadow-card)]">
                                <Lock className="w-5 h-5 text-[var(--color-primary)]" />
                            </div>
                            <p className="text-sm text-[var(--color-on-surface-muted)]">{t('account.proStats')}</p>
                            <Link
                                to="/pricing"
                                className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
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
                        className="bg-[var(--color-card)] rounded-[2rem] p-6 shadow-[var(--shadow-card)]"
                    >
                        <div className="text-sm font-bold text-[var(--color-on-surface-muted)] mb-4">{t('stats.vocabulary')}</div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--color-on-surface-muted)]">{t('stats.inDeck')}</span>
                                <span className="text-sm font-bold text-accent-blue">{totalCards}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--color-on-surface-muted)]">{t('stats.knownWords')}</span>
                                <span className="text-sm font-bold text-[var(--color-primary)]">{knownCount ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--color-on-surface-muted)]">{t('stats.avgRetention')}</span>
                                <span className="text-sm font-bold text-accent-purple">{avgRetention}%</span>
                            </div>
                            <div className="bg-[var(--color-surface-container)] rounded-2xl px-4 py-3 flex items-center justify-between mt-2">
                                <span className="text-sm font-semibold">{t('stats.total')}</span>
                                <span className="text-sm font-bold text-[var(--color-on-surface)]">{(totalCards ?? 0) + (knownCount ?? 0)}</span>
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
        <div className="bg-[var(--color-card)] rounded-[2rem] p-5 text-center shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
            <div className={`flex justify-center ${color}`}>{icon}</div>
            <p className={`text-2xl font-black tracking-tight mt-1 ${color}`}>{value}</p>
            <p className="text-[10px] text-[var(--color-on-surface-muted)] mt-0.5">{label}</p>
        </div>
    );
}
