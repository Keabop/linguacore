import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { db } from '../lib/db';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useCards } from '../hooks/useCards';
import LevelUpModal from '../components/ui/LevelUpModal';
import { ArrowRight, Flame, Layers, BookOpen, Check, RefreshCw, Clock, Map, PartyPopper } from 'lucide-react';
import type { CEFRLevel, UnitProgress } from '../lib/db';
import { getStoryMesh, StoryIcon } from '../lib/storyVisuals';
import LevelBadge from '../components/ui/LevelBadge';

export default function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, progressInfo } = useLevelProgression();
    const { dueCards, totalCards } = useCards();
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevel, setNewLevel] = useState<CEFRLevel>('A2');

    const stories = useLiveQuery(() => db.stories.toArray());
    const readStories = useLiveQuery(() => db.readStories.toArray());

    const recommended = stories?.filter(s => {
        const isUnlocked = user?.unlockedLevels.includes(s.level);
        const isRead = readStories?.some(r => r.storyId === s.id);
        return isUnlocked && !isRead;
    }).slice(0, 4);

    // Continue Learning: fetch units for current level
    const currentLevel = progressInfo?.currentLevel ?? 'A1';
    const levelUnits = useLiveQuery(
        () => db.units.where('level').equals(currentLevel).sortBy('unitNumber'),
        [currentLevel],
    );
    const levelUnitProgress = useLiveQuery(
        async () => {
            if (!levelUnits || levelUnits.length === 0) return [];
            const ids = levelUnits.map(u => u.id);
            return db.unitProgress.where('unitId').anyOf(ids).toArray();
        },
        [levelUnits],
    );

    // Compute first incomplete unit and progress counts
    const unitProgressMap = new globalThis.Map<string, UnitProgress>();
    if (levelUnitProgress) {
        for (const p of levelUnitProgress) {
            unitProgressMap.set(p.unitId, p);
        }
    }

    const unitsCompleted = levelUnits?.filter(u => unitProgressMap.get(u.id)?.completedAt != null).length ?? 0;
    const unitsTotal = levelUnits?.length ?? 0;
    const firstIncompleteUnit = levelUnits?.find(u => unitProgressMap.get(u.id)?.completedAt == null) ?? null;
    const allUnitsCompleted = unitsTotal > 0 && unitsCompleted === unitsTotal;

    // Level-up is now handled exclusively through the Level Assessment page.
    // The LevelUpModal is kept for when the assessment page triggers it.

    if (!user) return null;



    return (
        <div className="space-y-12">
            {/* Greeting */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <h1 className="text-3xl font-extrabold leading-tight">{t('dashboard.greeting')}</h1>
                <p className="text-text-secondary leading-relaxed">{t('dashboard.motivation')}</p>
            </motion.div>

            {/* Continue Learning Widget */}
            {levelUnits && levelUnits.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-bg-card border border-primary/20 rounded-2xl p-7 space-y-5"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Map className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-extrabold">{t('dashboard.continueLearning')}</h2>
                    </div>

                    {allUnitsCompleted ? (
                        /* All completed state */
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-green-400">
                                <PartyPopper className="w-5 h-5" />
                                <p className="text-sm font-medium">{t('dashboard.allCompleted')}</p>
                            </div>
                            <button
                                onClick={() => navigate('/path')}
                                className="text-sm text-primary font-semibold hover:text-primary-light transition-colors flex items-center gap-1.5"
                            >
                                {t('dashboard.goToPath')} <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : firstIncompleteUnit ? (
                        /* Current unit info */
                        <div className="space-y-4">
                            {/* Unit title + grammar */}
                            <div className="space-y-1">
                                <h3 className="font-bold text-base">{firstIncompleteUnit.title}</h3>
                                <p className="text-sm text-text-muted">{firstIncompleteUnit.grammarTopic}</p>
                            </div>

                            {/* Mini progress text */}
                            <p className="text-xs text-text-secondary font-semibold">
                                {t('dashboard.unitProgress', {
                                    current: unitsCompleted + 1,
                                    total: unitsTotal,
                                    level: currentLevel,
                                })}
                            </p>

                            {/* Progress bar */}
                            <div className="h-2 bg-bg-app rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${unitsTotal > 0 ? Math.round((unitsCompleted / unitsTotal) * 100) : 0}%` }}
                                    className="h-full rounded-full bg-primary"
                                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                                />
                            </div>

                            {/* Continue button */}
                            <button
                                onClick={() => navigate(`/path/${firstIncompleteUnit.id}`)}
                                className="w-full sm:w-auto bg-primary text-bg-app font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                {t('dashboard.continue')}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ) : null}
                </motion.div>
            )}

            {/* Hero Card — Review */}
            {dueCards.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => navigate('/review')}
                    className="story-card cursor-pointer group"
                >
                    <div className="story-card-banner" style={{ height: '130px', background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0%, transparent 55%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.05) 0%, transparent 55%), linear-gradient(135deg, #1a1a1a, #2a2a2a)' }}>
                        <div className="space-y-1.5">
                            <p className="text-sm text-white/70 font-medium">{t('dashboard.dueToday')}</p>
                            <p className="text-2xl font-extrabold text-white">{dueCards.length} {t('dashboard.cards')} {t('dashboard.pendingReview')}</p>
                        </div>
                    </div>
                    <div className="story-card-body flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <RefreshCw className="w-5 h-5 text-text-muted" />
                            <span className="font-bold text-white group-hover:text-primary transition-colors">{t('dashboard.startReview')}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                    </div>
                </motion.div>
            )}

            {/* Quick Stats (mobile only) */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-3 gap-6 lg:hidden"
            >
                <QuickStat icon={<Flame className="w-5 h-5" />} value={user.streak} label={t('dashboard.streak')} color="text-accent-orange" />
                <QuickStat icon={<Layers className="w-5 h-5" />} value={totalCards} label={t('dashboard.totalCards')} color="text-accent-blue" />
                <QuickStat icon={<BookOpen className="w-5 h-5" />} value={readStories?.length ?? 0} label={t('dashboard.storiesRead')} color="text-accent-purple" />
            </motion.div>

            {/* Recommended Stories */}
            {recommended && recommended.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-5"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">{t('dashboard.recommended')}</h2>
                        <button
                            onClick={() => navigate('/learn')}
                            className="text-sm text-primary font-semibold hover:text-primary-light transition-colors flex items-center gap-1.5"
                        >
                            {t('dashboard.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {recommended.map((story, i) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 + i * 0.05 }}
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
                                    <div className="flex items-center gap-2.5 text-xs text-text-muted">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {story.estimatedMinutes} min</span>
                                        <span>·</span>
                                        <span>{story.wordCount} {t('reader.words')}</span>
                                    </div>
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
                                <span className="text-text-muted">{t('progress.currentLevel')}</span>
                                <span className="text-text-secondary font-bold">{progressInfo.overallPercent}%</span>
                            </div>
                            <div className="h-2 bg-bg-app rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressInfo.overallPercent}%` }}
                                    className="h-full bg-white/30 rounded-full"
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                />
                            </div>
                        </div>
                        {progressInfo.currentUnitId && (
                            <div className="text-xs text-text-muted">
                                {t('progress.nextUnit')}: <span className="text-text-secondary font-semibold">{progressInfo.currentUnitId}</span>
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
            <p className={`text-2xl font-extrabold mt-4 ${color}`}>{value}</p>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">{label}</p>
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
                <span className="text-text-secondary">{label}</span>
                <span className={`font-bold ${met ? 'text-text-secondary' : 'text-text-muted'}`}>
                    {met && <Check className="w-3 h-3 inline mr-1" />}{current}/{target}
                </span>
            </div>
            <div className="h-1.5 bg-bg-app rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${met ? 'bg-white/30' : 'bg-white/20'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
