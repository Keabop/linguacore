import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useCards } from '../hooks/useCards';
import { useLevelProgression, LEVEL_REQUIREMENTS } from '../hooks/useLevelProgression';
import type { CEFRLevel } from '../lib/db';
import type { ReadStoryRow, CardRow } from '../lib/database.types';
import { Layers, RotateCcw, Target, Flame, Check, AlertTriangle } from 'lucide-react';
import LevelBadge from '../components/ui/LevelBadge';

export default function Stats() {
    const { t } = useTranslation();
    const { totalCards } = useCards();
    const { user, progressInfo } = useLevelProgression();
    const { user: authUser } = useAuth();

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

    // Activity heatmap data (last 35 days)
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

    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

    if (!user) return null;

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-extrabold">{t('nav.stats')}</h1>
                <p className="text-text-secondary mt-1">{t('stats.subtitle')}</p>
            </motion.div>

            {/* ===== Overview stats ===== */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
                <StatCard icon={<Layers className="w-5 h-5" />} value={totalCards} label={t('stats.totalCards')} color="text-accent-blue" />
                <StatCard icon={<RotateCcw className="w-5 h-5" />} value={totalReviews} label={t('stats.totalReviews')} color="text-accent-purple" />
                <StatCard icon={<Target className="w-5 h-5" />} value={`${avgRetention}%`} label={t('stats.avgRetention')} color="text-primary" />
                <StatCard icon={<Flame className="w-5 h-5" />} value={user.streak} label={t('dashboard.streak')} color="text-accent-orange" />
            </motion.div>

            {/* ===== Activity heatmap ===== */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="widget"
            >
                <div className="widget-title">{t('stats.activity')}</div>
                <div className="grid grid-cols-7 gap-1.5">
                    {activityData.map((day) => {
                        const intensity = day.count > 0 ? Math.max(0.2, day.count / maxActivity) : 0;
                        return (
                            <div
                                key={day.date}
                                className="aspect-square rounded-sm transition-colors"
                                style={{
                                    backgroundColor: day.count > 0
                                        ? `rgba(255, 255, 255, ${intensity * 0.4})`
                                        : 'rgba(255, 255, 255, 0.04)',
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
                                style={{ backgroundColor: op > 0 ? `rgba(255, 255, 255, ${op * 0.4})` : 'rgba(255,255,255,0.04)' }}
                            />
                        ))}
                    </div>
                    <span>{t('stats.moreActive')}</span>
                </div>
            </motion.div>

            {/* ===== Vocabulary breakdown ===== */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="widget"
            >
                <div className="widget-title">{t('stats.vocabulary')}</div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">{t('stats.inDeck')}</span>
                        <span className="text-sm font-bold text-accent-blue">{totalCards}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">{t('stats.knownWords')}</span>
                        <span className="text-sm font-bold text-primary">{knownCount ?? 0}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold">{t('stats.total')}</span>
                        <span className="text-sm font-extrabold text-white">{(totalCards ?? 0) + (knownCount ?? 0)}</span>
                    </div>
                </div>
            </motion.div>

            {/* ===== Level progression ===== */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="widget"
            >
                <div className="widget-title">{t('stats.levelProgress')}</div>
                <div className="space-y-4">
                    {levels.slice(1).map((level) => {
                        const req = LEVEL_REQUIREMENTS[level];
                        const isUnlocked = user.unlockedLevels.includes(level);
                        return (
                            <div key={level} className={`space-y-2 ${!isUnlocked ? '' : ''}`}>
                                <div className="flex items-center gap-2">
                                    <LevelBadge level={level} size="compact" />
                                    {isUnlocked ? (
                                        <span className="text-xs text-primary font-bold flex items-center gap-0.5"><Check className="w-3 h-3" /> {t('stats.unlocked')}</span>
                                    ) : (
                                        <span className="text-xs text-text-muted">{t('stats.locked')}</span>
                                    )}
                                </div>
                                <ProgressRow
                                    label={t('stats.wordsRequired')}
                                    current={progressInfo?.wordsProgress ?? 0}
                                    target={req.minWords}
                                    suffix=""
                                    met={(progressInfo?.wordsProgress ?? 0) >= req.minWords}
                                />
                                <ProgressRow
                                    label={t('stats.storiesRequired')}
                                    current={progressInfo?.storiesProgress ?? 0}
                                    target={req.storiesRead}
                                    suffix=""
                                    met={(progressInfo?.storiesProgress ?? 0) >= req.storiesRead}
                                />
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
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

function ProgressRow({ label, current, target, suffix, met }: {
    label: string; current: number; target: number; suffix?: string; met: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className={`text-xs ${met ? 'text-primary' : 'text-accent-orange'}`}>
                {met ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            </span>
            <span className="text-xs flex-1 text-text-secondary">{label}</span>
            <span className={`text-xs font-bold ${met ? 'text-primary' : 'text-text-muted'}`}>
                {current}{suffix}/{target}{suffix}
            </span>
        </div >
    );
}
