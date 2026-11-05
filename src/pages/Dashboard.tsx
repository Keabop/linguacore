import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useCards } from '../hooks/useCards';
import { useSkillCards } from '../hooks/useSkillCards';
import { useErrorCards } from '../hooks/useErrorCards';
import { ArrowRight, RefreshCw, Activity } from 'lucide-react';
import type { CEFRLevel } from '../lib/db';
import type { ReadStoryRow, UnitProgressRow } from '../lib/database.types';
import { storyIndex as allStories } from '../data/storyIndex';
import { getUnitsByLevel } from '../data/curriculum/units';
import { StoryIcon } from '../lib/storyVisuals';
import LevelBadge from '../components/ui/LevelBadge';
import PageHead from '../components/ui/PageHead';
import PageLoader from '../components/PageLoader';
import { storyDetails } from '../data/storyDetails';
import DBErrorCard from '../components/DBErrorCard';
import Garden from '../components/garden/Garden';
import StreakChip from '../components/ui/StreakChip';
import GoalDrops from '../components/ui/GoalDrops';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import { useLevelUpNotice } from '../hooks/useLevelUpNotice';

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
    const levelUp = useLevelUpNotice(user?.currentLevel);

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

            <motion.div {...fadeIn(0)}>
                <PageHead
                    title={t('dashboard.hello', { name: userName })}
                    lead={getContextualGreeting(t, dueCards.length, user?.streak ?? 0)}
                    dated
                    meta={[<LevelBadge key="level" level={currentLevel} withStage size="compact" />]}
                />
            </motion.div>

            {/* Today's spread: the unit on the left page, the daily chores on the right one */}
            <motion.section {...fadeIn(1)} className="nb-spread app-spread" aria-labelledby="today-title">
                <div className="nb-page nb-page-left app-today">
                    <p className="app-section-label">{t('dashboard.today')}</p>

                    {allUnitsCompleted ? (
                        <div className="space-y-2">
                            <h2 id="today-title" className="app-h2">{t('dashboard.waterGarden')}</h2>
                            <p className="text-[var(--color-on-surface-muted)]">{t('dashboard.allCompleted')}</p>
                        </div>
                    ) : firstIncompleteUnit ? (
                        <div className="space-y-1.5">
                            <h2 id="today-title" className="app-h2">{firstIncompleteUnit.title}</h2>
                            <p className="text-[var(--color-on-surface-muted)]">{firstIncompleteUnit.grammarTopic}</p>
                            <p className="font-mono text-sm text-[var(--color-on-surface-variant)]">
                                {t('dashboard.nextUnit')} {unitsCompleted + 1}/{unitsTotal}
                            </p>
                        </div>
                    ) : (
                        <h2 id="today-title" className="app-h2">{t('dashboard.waterGarden')}</h2>
                    )}

                    {unitsTotal > 0 && (
                        <figure className="app-today-garden">
                            <Garden
                                total={unitsTotal}
                                completed={unitsCompleted}
                                label={t('garden.unitsLabel', { done: unitsCompleted, total: unitsTotal })}
                            />
                            <figcaption>{t('garden.unitsLabel', { done: unitsCompleted, total: unitsTotal })}</figcaption>
                        </figure>
                    )}

                    {allUnitsCompleted ? (
                        <button onClick={() => navigate('/path')} className="btn-primary self-start px-6 py-3 text-sm inline-flex items-center gap-2">
                            {t('dashboard.goToPath')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                    ) : firstIncompleteUnit ? (
                        <button
                            onClick={() => navigate(`/path/${firstIncompleteUnit.id}`)}
                            className="btn-primary self-start px-6 py-3 text-sm inline-flex items-center gap-2"
                        >
                            {t('dashboard.continue')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                    ) : null}
                </div>

                <ul className="nb-page nb-page-right app-ledger">
                    <li>
                        <p className="app-section-label">{t('dashboard.streak')}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <StreakChip count={user.streak} className="text-xl" />
                            <span className="text-sm text-[var(--color-on-surface-muted)]">{t('dashboard.streakDays')}</span>
                            <GoalDrops done={user.goalProgress} goal={user.dailyGoal} freezes={user.streakFreezes} />
                        </div>
                        <p className="app-ledger-note">
                            {user.streak > 0 ? t('dashboard.deckSize', { count: totalCards }) : t('dashboard.streakStart')}
                        </p>
                    </li>

                    <li>
                        <p className="app-section-label">
                            <RefreshCw className="w-4 h-4" aria-hidden="true" /> {t('dashboard.dueToday')}
                        </p>
                        <div className="app-ledger-row">
                            <div className="min-w-0">
                                <h3 className="app-h3">
                                    {reviewCount > 0 ? t('dashboard.reviewDue', { count: dueCards.length }) : t('dashboard.allCaughtUp')}
                                </h3>
                                {reviewCount === 0 && <p className="app-ledger-note">{t('dashboard.allCaughtUpDesc')}</p>}
                                {reviewCount > 0 && dueSkillCards.length > 0 && (
                                    <p className="app-ledger-note">+ {t('dashboard.skillsDue', { count: dueSkillCards.length })}</p>
                                )}
                            </div>
                            {reviewCount > 0 && (
                                <button onClick={() => navigate('/review')} className="btn-secondary px-5 py-2.5 text-sm shrink-0">
                                    {t('dashboard.review')}
                                </button>
                            )}
                        </div>
                    </li>

                    <li>
                        <p className="app-section-label">
                            <Activity className="w-4 h-4" aria-hidden="true" /> {t('dashboard.errorLab')}
                        </p>
                        <div className="app-ledger-row">
                            <div className="min-w-0">
                                <h3 className="app-h3">
                                    {dueErrorCards.length > 0
                                        ? t('dashboard.errorsPending', { count: dueErrorCards.length })
                                        : t('dashboard.errorsClear')}
                                </h3>
                                {dueErrorCards.length === 0 && totalErrorCards === 0 && (
                                    <p className="app-ledger-note">{t('dashboard.errorsClearDesc')}</p>
                                )}
                            </div>
                            <button onClick={() => navigate('/review/lab')} className="btn-secondary px-5 py-2.5 text-sm shrink-0">
                                {t('dashboard.enterLab')}
                            </button>
                        </div>
                    </li>
                </ul>
            </motion.section>

            {/* Recommended stories: index cards pinned under the spread */}
            {recommended.length > 0 && (
                <motion.section {...fadeIn(2)} className="space-y-4" aria-labelledby="stories-title">
                    <div className="flex items-center justify-between gap-3">
                        <h2 id="stories-title" className="app-h3">{t('dashboard.recommended')}</h2>
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
                                <button key={story.id} onClick={() => navigate(`/learn/${story.id}`)} className="app-index">
                                    <span className="flex justify-between items-center gap-2">
                                        <LevelBadge level={story.level} size="compact" />
                                        <span className="text-xs font-mono text-[var(--color-on-surface-variant)]">
                                            {story.wordCount} {t('dashboard.words')}
                                        </span>
                                    </span>
                                    <span className="flex items-start gap-3">
                                        <span className="h-10 w-10 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center shrink-0">
                                            <StoryIcon storyId={story.id} className="h-5 w-5 text-[var(--color-primary)]" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block font-display font-extrabold text-base leading-tight line-clamp-1">{story.title}</span>
                                            {details.spanishTitle && (
                                                <span className="block text-xs text-[var(--color-on-surface-variant)] mt-0.5 truncate">{details.spanishTitle}</span>
                                            )}
                                        </span>
                                    </span>
                                    {details.description && (
                                        <span className="block text-[13px] line-clamp-2 leading-relaxed text-[var(--color-on-surface-muted)]">{details.description}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.section>
            )}

            {levelUp.mounted && (
                <Suspense fallback={null}>
                    <LevelUpModal level={levelUp.newLevel} isOpen={levelUp.open} onClose={levelUp.close} />
                </Suspense>
            )}
        </div>
    );
}
