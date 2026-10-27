import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useCards } from '../hooks/useCards';
import { useSkillCards } from '../hooks/useSkillCards';
import { useErrorCards } from '../hooks/useErrorCards';
import { ArrowRight, RefreshCw, Activity } from 'lucide-react';
import type { CEFRLevel } from '../lib/db';
import type { ReadStoryRow, UnitProgressRow } from '../lib/database.types';
import { storiesData as allStories } from '../data/stories';
import { getUnitsByLevel } from '../data/curriculum/units';
import { StoryIcon } from '../lib/storyVisuals';
import LevelBadge from '../components/ui/LevelBadge';
import PageLoader from '../components/PageLoader';
import { storyDetails } from './StoryList';
import DBErrorCard from '../components/DBErrorCard';
import Garden from '../components/garden/Garden';
import StreakChip from '../components/ui/StreakChip';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

// Loaded only the first time a level-up happens
const LevelUpModal = lazy(() => import('../components/ui/LevelUpModal'));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getContextualGreeting(t: any, dueCards: number, streak: number): string {
    if (dueCards > 5) return t('dashboard.greetingDueCards', { count: dueCards });
    if (streak > 1) return t('dashboard.greetingStreak', { count: streak });
    if (dueCards === 0) return t('dashboard.greetingAllDone');
    return t('dashboard.greetingDueCards', { count: dueCards });
}


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
    // Stays mounted after the first open so the modal can play its exit animation
    const [levelUpMounted, setLevelUpMounted] = useState(false);
    if (showLevelUp && !levelUpMounted) setLevelUpMounted(true);

    const profileLevel = user?.currentLevel;
    useEffect(() => {
        if (!profileLevel || !authUser?.id) return;
        const key = `voxie:seen-level:${authUser.id}`;
        let seen: string | null = null;
        try {
            seen = localStorage.getItem(key);
            localStorage.setItem(key, profileLevel);
        } catch {
            return;
        }
        if (seen && LEVEL_ORDER.indexOf(profileLevel) > LEVEL_ORDER.indexOf(seen as CEFRLevel)) {
            setNewLevel(profileLevel);
            setShowLevelUp(true);
        }
    }, [profileLevel, authUser?.id]);

    const { data: readStories } = useQuery({
        queryKey: ['readStories', authUser?.id],
        queryFn: async () => {
            const { data } = await supabase.from('read_stories').select('*');
            return (data ?? []) as ReadStoryRow[];
        },
        enabled: !!authUser?.id,
    });

    const recommended = allStories.filter(s => {
        const isUnlocked = user?.unlockedLevels?.includes(s.level) ?? false;
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
    if (!user || !progressInfo) return <PageLoader />;
    // Data missing (DB cleared/corrupt)
    if (user === null) return <DBErrorCard onReset={() => window.location.reload()} />;

    const userName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Estudiante';
    const reviewCount = dueCards.length + dueSkillCards.length;
    const fadeIn = (i: number) => ({
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.42, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const },
    });

    return (
        <div className="space-y-8">
            <PWAInstallPrompt />

            <motion.header {...fadeIn(0)} className="space-y-1.5 text-left">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-[var(--color-on-surface)]">
                    {t('dashboard.hello', { name: userName })}
                </h1>
                <p className="text-sm md:text-base text-[var(--color-on-surface-muted)]">
                    {getContextualGreeting(t, dueCards.length, user?.streak ?? 0)}
                </p>
            </motion.header>

            {/* Bento: «Hoy» is the big block; streak, review and error lab sit beside it */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {/* Hoy */}
                <motion.section
                    {...fadeIn(1)}
                    aria-labelledby="today-title"
                    className="card md:col-span-2 md:row-span-2 p-6 sm:p-7 flex flex-col gap-5 text-left"
                >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-sm font-semibold text-[var(--color-on-surface-muted)]">{t('dashboard.today')}</span>
                        <LevelBadge level={currentLevel} withStage />
                    </div>

                    {allUnitsCompleted ? (
                        <div className="space-y-2">
                            <h2 id="today-title" className="text-2xl font-extrabold tracking-tight">{t('dashboard.waterGarden')}</h2>
                            <p className="text-sm text-[var(--color-on-surface-muted)]">{t('dashboard.allCompleted')}</p>
                        </div>
                    ) : firstIncompleteUnit ? (
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-[var(--color-on-surface-variant)]">
                                {t('dashboard.nextUnit')} · {unitsCompleted + 1}/{unitsTotal}
                            </p>
                            <h2 id="today-title" className="text-2xl font-extrabold tracking-tight leading-tight">
                                {firstIncompleteUnit.title}
                            </h2>
                            <p className="text-sm text-[var(--color-on-surface-muted)]">{firstIncompleteUnit.grammarTopic}</p>
                        </div>
                    ) : (
                        <h2 id="today-title" className="text-2xl font-extrabold tracking-tight">{t('dashboard.waterGarden')}</h2>
                    )}

                    {unitsTotal > 0 && (
                        <div className="space-y-2 mt-auto">
                            <Garden
                                total={unitsTotal}
                                completed={unitsCompleted}
                                label={t('garden.unitsLabel', { done: unitsCompleted, total: unitsTotal })}
                            />
                            <p className="text-xs font-mono text-[var(--color-on-surface-variant)]">
                                {t('garden.unitsLabel', { done: unitsCompleted, total: unitsTotal })}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        {allUnitsCompleted ? (
                            <button onClick={() => navigate('/path')} className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
                                {t('dashboard.goToPath')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </button>
                        ) : firstIncompleteUnit ? (
                            <button
                                onClick={() => navigate(`/path/${firstIncompleteUnit.id}`)}
                                className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2"
                            >
                                {t('dashboard.continue')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </button>
                        ) : null}
                        {reviewCount > 0 && (
                            <button onClick={() => navigate('/review')} className="btn-secondary px-6 py-3 text-sm">
                                {t('dashboard.review')} · {reviewCount}
                            </button>
                        )}
                    </div>
                </motion.section>

                {/* Streak */}
                <motion.section {...fadeIn(2)} className="card p-6 flex flex-col gap-3 text-left" aria-label={t('dashboard.streak')}>
                    <span className="text-sm font-semibold text-[var(--color-on-surface-muted)]">{t('dashboard.streak')}</span>
                    <div className="flex items-center gap-3">
                        <StreakChip count={user.streak} className="text-xl" />
                        <span className="text-sm text-[var(--color-on-surface-muted)]">{t('dashboard.streakDays')}</span>
                    </div>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                        {user.streak > 0 ? t('dashboard.deckSize', { count: totalCards }) : t('dashboard.streakStart')}
                    </p>
                </motion.section>

                {/* Review */}
                <motion.section {...fadeIn(3)} className="card p-6 flex flex-col gap-3 text-left" aria-labelledby="review-title">
                    <div className="flex items-center gap-2 text-[var(--color-on-surface-muted)]">
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                        <span className="text-sm font-semibold">{t('dashboard.dueToday')}</span>
                    </div>
                    {reviewCount > 0 ? (
                        <>
                            <h2 id="review-title" className="text-lg font-extrabold leading-tight">
                                {t('dashboard.reviewDue', { count: dueCards.length })}
                            </h2>
                            {dueSkillCards.length > 0 && (
                                <p className="text-xs text-[var(--color-on-surface-muted)]">
                                    + {t('dashboard.skillsDue', { count: dueSkillCards.length })}
                                </p>
                            )}
                            <button onClick={() => navigate('/review')} className="btn-primary mt-auto px-5 py-2.5 text-sm self-start">
                                {t('dashboard.startReview')}
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 id="review-title" className="text-lg font-extrabold leading-tight">{t('dashboard.allCaughtUp')}</h2>
                            <p className="text-xs text-[var(--color-on-surface-muted)]">{t('dashboard.allCaughtUpDesc')}</p>
                        </>
                    )}
                </motion.section>

                {/* Error lab */}
                <motion.section
                    {...fadeIn(4)}
                    className="card md:col-span-3 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between text-left"
                    aria-labelledby="lab-title"
                >
                    <div className="flex items-start gap-3">
                        <span className="w-10 h-10 rounded-full bg-[var(--color-error-light)] text-[var(--color-error)] flex items-center justify-center shrink-0">
                            <Activity className="w-5 h-5" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-on-surface-muted)]">{t('dashboard.errorLab')}</p>
                            <h2 id="lab-title" className="text-lg font-extrabold leading-tight">
                                {dueErrorCards.length > 0
                                    ? t('dashboard.errorsPending', { count: dueErrorCards.length })
                                    : t('dashboard.errorsClear')}
                            </h2>
                            {dueErrorCards.length === 0 && totalErrorCards === 0 && (
                                <p className="text-xs text-[var(--color-on-surface-muted)] mt-1 max-w-prose">{t('dashboard.errorsClearDesc')}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={() => navigate('/review/lab')} className="btn-secondary px-5 py-2.5 text-sm shrink-0 self-start sm:self-auto">
                        {t('dashboard.enterLab')}
                    </button>
                </motion.section>
            </div>

            {/* Recommended stories */}
            {recommended.length > 0 && (
                <motion.section {...fadeIn(5)} className="space-y-4" aria-labelledby="stories-title">
                    <div className="flex items-center justify-between gap-3">
                        <h2 id="stories-title" className="text-lg font-extrabold">{t('dashboard.recommended')}</h2>
                        <button
                            onClick={() => navigate('/learn')}
                            className="text-sm text-[var(--color-primary)] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                            {t('dashboard.viewAll')} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recommended.map((story) => {
                            const details = storyDetails[story.id] || { spanishTitle: '', description: '' };
                            return (
                                <button
                                    key={story.id}
                                    onClick={() => navigate(`/learn/${story.id}`)}
                                    className="card p-5 flex flex-col gap-3 text-left transition-transform duration-[var(--dur-short)] ease-[var(--ease-out)] hover:-translate-y-0.5"
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <LevelBadge level={story.level} size="compact" />
                                        <span className="text-xs font-mono text-[var(--color-on-surface-variant)]">
                                            {story.wordCount} palabras
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="h-10 w-10 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center shrink-0">
                                            <StoryIcon storyId={story.id} className="h-5 w-5 text-[var(--color-primary)]" />
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="font-extrabold text-base leading-tight line-clamp-1">{story.title}</h3>
                                            {details.spanishTitle && (
                                                <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5 truncate">{details.spanishTitle}</p>
                                            )}
                                        </div>
                                    </div>
                                    {details.description && (
                                        <p className="text-[13px] line-clamp-2 leading-relaxed text-[var(--color-on-surface-muted)]">{details.description}</p>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.section>
            )}

            {levelUpMounted && (
                <Suspense fallback={null}>
                    <LevelUpModal level={newLevel} isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} />
                </Suspense>
            )}
        </div>
    );
}
