import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useCards } from '../hooks/useCards';
import { useSkillCards } from '../hooks/useSkillCards';
import { useErrorCards } from '../hooks/useErrorCards';
import LevelUpModal from '../components/ui/LevelUpModal';
import { ArrowRight, Flame, Layers, BookOpen, Check, RefreshCw, Clock, Map, PartyPopper, AlertTriangle } from 'lucide-react';
import type { CEFRLevel } from '../lib/db';
import type { ReadStoryRow, UnitProgressRow } from '../lib/database.types';
import { allStories, getUnitsByLevel } from '../data';
import { getStoryMesh, StoryIcon } from '../lib/storyVisuals';
import LevelBadge from '../components/ui/LevelBadge';
import PageLoader from '../components/PageLoader';
import DBErrorCard from '../components/DBErrorCard';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import { BlurText, CountUp, SpotlightCard } from '../components/reactbits';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getContextualGreeting(t: any, dueCards: number, streak: number): string {
    if (dueCards > 5) return t('dashboard.greetingDueCards', { count: dueCards });
    if (streak > 1) return t('dashboard.greetingStreak', { count: streak });
    if (dueCards === 0) return t('dashboard.greetingAllDone');
    return t('dashboard.greetingDueCards', { count: dueCards });
}

const levelSpotlightColor: Record<string, string> = {
    A1: 'rgba(96, 165, 250, 0.15)',
    A2: 'rgba(74, 222, 128, 0.15)',
    B1: 'rgba(251, 191, 36, 0.15)',
    B2: 'rgba(248, 113, 113, 0.15)',
};

export default function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, progressInfo } = useLevelProgression();
    const { dueCards, totalCards } = useCards();
    const { dueSkillCards } = useSkillCards();
    const { dueErrorCards, totalErrorCards } = useErrorCards();
    const { user: authUser } = useAuth();
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevel, setNewLevel] = useState<CEFRLevel>('A2');

    const stories = allStories;
    const { data: readStories } = useQuery({
        queryKey: ['readStories', authUser?.id],
        queryFn: async () => {
            const { data } = await supabase.from('read_stories').select('*');
            return (data ?? []) as ReadStoryRow[];
        },
        enabled: !!authUser?.id,
    });

    const recommended = allStories.filter(s => {
        const isUnlocked = user?.unlockedLevels.includes(s.level);
        const isRead = readStories?.some(r => r.story_id === s.id);
        return isUnlocked && !isRead;
    }).slice(0, 4);

    // Continue Learning: fetch units for current level
    const currentLevel = progressInfo?.currentLevel ?? 'A1';
    const levelUnits = getUnitsByLevel(currentLevel);
    const { data: levelUnitProgress } = useQuery({
        queryKey: ['unitProgress', currentLevel, authUser?.id],
        queryFn: async () => {
            if (!levelUnits || levelUnits.length === 0) return [];
            const ids = levelUnits.map(u => u.id);
            const { data } = await supabase.from('unit_progress').select('*').in('unit_id', ids);
            return (data ?? []) as UnitProgressRow[];
        },
        enabled: !!authUser?.id && levelUnits.length > 0,
    });

    // Compute first incomplete unit and progress counts
    const unitProgressMap = new globalThis.Map<string, any>();
    if (levelUnitProgress) {
        for (const p of levelUnitProgress) {
            unitProgressMap.set(p.unit_id, p);
        }
    }

    const unitsCompleted = levelUnits?.filter(u => unitProgressMap.get(u.id)?.completed_at != null).length ?? 0;
    const unitsTotal = levelUnits?.length ?? 0;
    const firstIncompleteUnit = levelUnits?.find(u => unitProgressMap.get(u.id)?.completed_at == null) ?? null;
    const allUnitsCompleted = unitsTotal > 0 && unitsCompleted === unitsTotal;

    // Loading state: user query hasn't resolved yet
    if (!user && !progressInfo) return <PageLoader />;
    // Data missing (DB cleared/corrupt)
    if (user === null) return <DBErrorCard onReset={() => window.location.reload()} />;



    return (
        <div className="space-y-14">
            <PWAInstallPrompt />

            {/* Greeting */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <BlurText
                    text={getContextualGreeting(t, dueCards.length, user?.streak ?? 0)}
                    delay={80}
                    className="text-3xl font-extrabold leading-tight"
                />
            </motion.div>

            {/* Continue Learning Widget */}
            {levelUnits && levelUnits.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="relative"
                >
                    <SpotlightCard
                        className={`bg-[var(--color-card)] border rounded-2xl p-5 md:p-8 space-y-5 md:space-y-6 ${{
                            A1: 'border-[#60A5FA]/20', A2: 'border-[#4ADE80]/20', B1: 'border-[#FBBF24]/20', B2: 'border-[#F87171]/20'
                        }[currentLevel] || 'border-[var(--color-primary)]/20'}`}
                        spotlightColor={levelSpotlightColor[currentLevel] ?? 'rgba(112, 42, 225, 0.15)'}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                                <Map className="w-5 h-5 text-[var(--color-primary)]" />
                            </div>
                            <h2 className="text-lg font-bold">{t('dashboard.continueLearning')}</h2>
                        </div>

                        {allUnitsCompleted ? (
                            /* All completed state */
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-[var(--color-success)]">
                                    <PartyPopper className="w-5 h-5" />
                                    <p className="text-sm font-medium">{t('dashboard.allCompleted')}</p>
                                </div>
                                <button
                                    onClick={() => navigate('/path')}
                                    className="text-sm text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-light)] transition-colors flex items-center gap-1.5"
                                >
                                    {t('dashboard.goToPath')} <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : firstIncompleteUnit ? (
                            /* Current unit info */
                            <div className="space-y-3">
                                {/* Unit title + grammar */}
                                <div className="space-y-1">
                                    <h3 className="font-bold text-base">{firstIncompleteUnit.title}</h3>
                                    <p className="text-sm text-[var(--color-on-surface-muted)]">{firstIncompleteUnit.grammarTopic}</p>
                                </div>

                                {/* Mini progress text */}
                                <p className="text-xs text-[var(--color-on-surface-muted)] font-semibold">
                                    {t('dashboard.unitProgress', {
                                        current: unitsCompleted + 1,
                                        total: unitsTotal,
                                        level: currentLevel,
                                    })}
                                </p>

                                {/* Progress bar */}
                                <div className="progress-bloom">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${unitsTotal > 0 ? Math.round((unitsCompleted / unitsTotal) * 100) : 0}%` }}
                                        className="progress-bloom-fill"
                                        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                                    />
                                </div>

                                {/* Continue button */}
                                <button
                                    onClick={() => navigate(`/path/${firstIncompleteUnit.id}`)}
                                    className="btn-primary w-full sm:w-auto px-6 py-3 text-sm flex items-center justify-center gap-2 mt-3"
                                >
                                    {t('dashboard.continue')}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : null}
                    </SpotlightCard>
                </motion.div>
            )}

            {/* Hero Card — Review */}
            {dueCards.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => navigate('/review')}
                    className="cursor-pointer group"
                >
                    <SpotlightCard className="story-card" spotlightColor="rgba(112, 42, 225, 0.15)">
                        <div className="story-card-banner" style={{ height: '130px', background: 'radial-gradient(circle at 30% 30%, rgba(112,42,225,0.12) 0%, transparent 55%), radial-gradient(circle at 70% 70%, rgba(112,42,225,0.08) 0%, transparent 55%), linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' }}>
                            <div className="space-y-1.5">
                                <p className="text-sm text-[var(--color-on-primary)]/70 font-medium">{t('dashboard.dueToday')}</p>
                                <p className="text-2xl font-extrabold text-[var(--color-on-primary)]">
                                    <CountUp from={0} to={dueCards.length} duration={1.5} className="text-2xl font-extrabold text-[var(--color-on-primary)] inline" /> {t('dashboard.cards')} {t('dashboard.pendingReview')}
                                </p>
                            </div>
                        </div>
                        <div className="story-card-body flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <RefreshCw className="w-5 h-5 text-[var(--color-on-surface-muted)]" />
                                <span className="font-bold group-hover:text-[var(--color-primary)] transition-colors">{t('dashboard.startReview')}</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-[var(--color-on-surface-muted)] group-hover:translate-x-1 transition-transform" />
                        </div>
                    </SpotlightCard>
                </motion.div>
            )}

            {/* Grammar Skills Review */}
            {dueSkillCards.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    onClick={() => navigate('/review')}
                    className="widget cursor-pointer group hover:border-[var(--color-primary)]/50 transition-all"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <BookOpen className="w-5 h-5 text-[var(--color-primary-light)]" />
                            <div>
                                <p className="font-bold group-hover:text-[var(--color-primary)] transition-colors">
                                    {dueSkillCards.length} {t('dashboard.grammarSkills', 'grammar skills')} {t('dashboard.pendingReview')}
                                </p>
                                <p className="text-xs text-[var(--color-on-surface-muted)] mt-1">{t('dashboard.grammarReviewDesc', 'Review your grammar knowledge')}</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[var(--color-on-surface-muted)] group-hover:translate-x-1 transition-transform" />
                    </div>
                </motion.div>
            )}

            {/* Error Cards Widget */}
            {totalErrorCards > 0 && (
                <div className="widget flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-[var(--color-level-b1)]" />
                    <div>
                        <p className="text-sm font-bold">{totalErrorCards} {t('dashboard.myErrors', 'Mis errores')}</p>
                        {dueErrorCards.length > 0 && (
                            <p className="text-xs text-[var(--color-on-surface-muted)]">{dueErrorCards.length} {t('dashboard.errorsDue', 'errores pendientes')}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Stats (mobile only) */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-3 gap-7"
            >
                <QuickStat icon={<Flame className="w-5 h-5" />} value={user!.streak} label={t('dashboard.streak')} color="text-[var(--color-tertiary)]" />
                <QuickStat icon={<Layers className="w-5 h-5" />} value={totalCards} label={t('dashboard.totalCards')} color="text-[var(--color-level-a1)]" />
                <QuickStat icon={<BookOpen className="w-5 h-5" />} value={readStories?.length ?? 0} label={t('dashboard.storiesRead')} color="text-[var(--color-primary-light)]" />
            </motion.div>

            {/* Recommended Stories */}
            {recommended && recommended.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-7"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">{t('dashboard.recommended')}</h2>
                        <button
                            onClick={() => navigate('/learn')}
                            className="text-sm text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-light)] transition-colors flex items-center gap-1.5"
                        >
                            {t('dashboard.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {recommended.map((story, i) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 + i * 0.05 }}
                            >
                                <div style={{ perspective: '800px' }}>
                                    <motion.div
                                        whileHover={{ rotateX: -3, rotateY: 5, scale: 1.02 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        onClick={() => navigate(`/learn/${story.id}`)}
                                        className="story-card"
                                    >
                                        <div
                                            className="story-card-banner relative flex items-center justify-center overflow-hidden"
                                            style={{ background: getStoryMesh(story.id) }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <StoryIcon storyId={story.id} />
                                            </div>
                                            <span className="absolute top-3 left-3 z-10">
                                                <LevelBadge level={story.level} size="compact" />
                                            </span>
                                        </div>
                                        <div className="story-card-body space-y-2.5">
                                            <h3 className="font-bold text-sm leading-snug line-clamp-2">{story.title}</h3>
                                            <div className="flex items-center gap-2.5 text-xs text-[var(--color-on-surface-muted)]">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {story.estimatedMinutes} min</span>
                                                <span>·</span>
                                                <span>{story.wordCount} {t('reader.words')}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Progress (mobile only) -- unit-based */}
            {progressInfo && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:hidden widget"
                >
                    <div className="widget-title">{t('progress.title')}</div>
                    <div className="space-y-5">
                        <ProgressItem label={t('progress.unitsCompleted')} current={progressInfo.unitsCompleted} target={progressInfo.unitsTotal} />
                        <div className="pt-3">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-[var(--color-on-surface-muted)]">{t('progress.currentLevel')}</span>
                                <span className="text-[var(--color-on-surface-muted)] font-bold">{progressInfo.overallPercent}%</span>
                            </div>
                            <div className="progress-bloom">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressInfo.overallPercent}%` }}
                                    className="progress-bloom-fill"
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                />
                            </div>
                        </div>
                        {progressInfo.currentUnitId && (
                            <div className="text-xs text-[var(--color-on-surface-muted)]">
                                {t('progress.nextUnit')}: <span className="text-[var(--color-on-surface-muted)] font-semibold">{progressInfo.currentUnitId}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            <LevelUpModal level={newLevel} isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} />
        </div>
    );
}

function QuickStat({ icon, value, label, color }: {
    icon: React.ReactNode; value: number; label: string; color: string;
}) {
    return (
        <div className="widget text-center">
            <div className={`flex justify-center ${color}`}>{icon}</div>
            <CountUp from={0} to={value} duration={1.2} className={`text-2xl font-extrabold mt-4 ${color}`} />
            <p className="text-xs text-[var(--color-on-surface-muted)] mt-2 leading-relaxed">{label}</p>
        </div>
    );
}

function ProgressItem({ label, current, target }: {
    label: string; current: number; target: number;
}) {
    const met = current >= target;
    const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    return (
        <div>
            <div className="flex justify-between text-xs mb-2">
                <span className="text-[var(--color-on-surface-muted)]">{label}</span>
                <span className={`font-bold ${met ? 'text-[var(--color-on-surface-muted)]' : 'text-[var(--color-on-surface-muted)]'}`}>
                    {met && <Check className="w-3 h-3 inline mr-1" />}{current}/{target}
                </span>
            </div>
            <div className="progress-bloom">
                <div
                    className={`progress-bloom-fill transition-all duration-500 ${met ? '' : 'opacity-60'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
