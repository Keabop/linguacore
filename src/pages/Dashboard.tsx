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
import { ArrowRight, Flame, Layers, BookOpen, Check, RefreshCw, Clock, Map, PartyPopper, AlertTriangle, Sparkles, Activity, GraduationCap } from 'lucide-react';
import type { CEFRLevel } from '../lib/db';
import type { ReadStoryRow, UnitProgressRow } from '../lib/database.types';
import { allStories, getUnitsByLevel } from '../data';
import { getStoryMesh, StoryIcon } from '../lib/storyVisuals';
import LevelBadge from '../components/ui/LevelBadge';
import PageLoader from '../components/PageLoader';
import { storyDetails, CEFR_COLORS } from './StoryList';
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

    return (
        <div className="space-y-10">
            <PWAInstallPrompt />

            {/* Premium Localized Greeting */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5 text-left font-body">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-[var(--color-on-surface)]">
                    ¡Hola, {userName}! 👋
                </h1>
                <p className="text-sm md:text-base text-[var(--color-on-surface-muted)] font-medium leading-relaxed">
                    {getContextualGreeting(t, dueCards.length, user?.streak ?? 0)} {dueErrorCards.length > 0 ? `Además, tienes ${dueErrorCards.length} errores pendientes en el lab.` : ''}
                </p>
            </motion.div>

            {/* Bento Grid Stats - Matching Landing Page Mockup */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="grid grid-cols-3 gap-2.5 sm:gap-4"
            >
                <QuickStat 
                    icon={<Flame className="w-5 h-5" />} 
                    value={user!.streak} 
                    label={t('dashboard.streak')} 
                    accent="from-orange-400 to-rose-400" 
                    borderAccent="var(--color-tertiary)"
                />
                <QuickStat 
                    icon={<Layers className="w-5 h-5" />} 
                    value={totalCards} 
                    label={t('dashboard.totalCards')} 
                    accent="from-blue-400 to-indigo-400" 
                    borderAccent="var(--color-primary)"
                />
                <QuickStat 
                    icon={<GraduationCap className="w-5 h-5" />} 
                    value={currentLevel + ' Activo'} 
                    label={t('progress.currentLevel')} 
                    accent="from-purple-400 to-fuchsia-400" 
                    borderAccent="var(--color-success)"
                />
            </motion.div>

            {/* Active Widgets Grid - Guided Route & Error Lab Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guided Route / Continue Learning Card */}
                {levelUnits && levelUnits.length > 0 && (
                    <SpotlightCard
                        className="bg-[var(--color-card)] rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-[var(--shadow-elevated)] flex flex-col justify-between"
                        spotlightColor={levelSpotlightColor[currentLevel] ?? 'rgba(112, 42, 225, 0.15)'}
                    >
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center shadow-md shrink-0">
                                    <Map className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-extrabold text-[var(--color-primary-light)] uppercase tracking-wider">Ruta de Aprendizaje</span>
                                    <h2 className="text-lg font-black tracking-tight text-[var(--color-on-surface)] mt-0.5">{t('dashboard.continueLearning')}</h2>
                                </div>
                            </div>

                            {allUnitsCompleted ? (
                                /* All completed state */
                                <div className="space-y-4 pt-2">
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
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-1">
                                        <h3 className="font-extrabold text-base text-[var(--color-on-surface)] leading-tight">{firstIncompleteUnit.title}</h3>
                                        <p className="text-xs text-[var(--color-on-surface-muted)]">{firstIncompleteUnit.grammarTopic}</p>
                                    </div>

                                    {/* Progress bar — Bloom style */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-[var(--color-on-surface-muted)] font-medium">
                                                Progreso de la Unidad
                                            </span>
                                            <span className="font-bold text-[var(--color-primary)]">
                                                {unitsTotal > 0 ? Math.round((unitsCompleted / unitsTotal) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="progress-bloom">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${unitsTotal > 0 ? Math.round((unitsCompleted / unitsTotal) * 100) : 0}%` }}
                                                className="progress-bloom-fill"
                                                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {!allUnitsCompleted && firstIncompleteUnit && (
                            <div className="pt-4 border-t border-[var(--color-surface-container)] flex items-center justify-between">
                                <span className="text-[10px] text-[var(--color-on-surface-muted)] font-medium">Próximo hito: {currentLevel} · {unitsCompleted + 1}/{unitsTotal}</span>
                                <button
                                    onClick={() => navigate(`/path/${firstIncompleteUnit.id}`)}
                                    className="btn-primary px-6 py-2.5 text-xs flex items-center gap-2 hover:translate-y-[-1px] transition-transform shadow-md"
                                >
                                    {t('dashboard.continue')}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </SpotlightCard>
                )}

                {/* Laboratorio de Errores Card */}
                <SpotlightCard
                    className="bg-[var(--color-card)] rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-[var(--shadow-elevated)] flex flex-col justify-between"
                    spotlightColor="rgba(248, 113, 113, 0.15)"
                >
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/20 flex items-center justify-center border border-red-500/10 shadow-md shrink-0">
                                <Activity className={`w-5 h-5 text-red-500 ${dueErrorCards.length > 0 ? 'animate-pulse' : ''}`} />
                            </div>
                            <div>
                                <span className="text-[9px] font-extrabold text-red-400 uppercase tracking-wider">Laboratorio de Errores</span>
                                <h2 className="text-lg font-black tracking-tight text-[var(--color-on-surface)] mt-0.5">Foco Semanal</h2>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            {dueErrorCards.length > 0 ? (
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-base text-[var(--color-on-surface)] leading-tight">¡Tienes {dueErrorCards.length} errores pendientes!</h3>
                                    <p className="text-xs text-[var(--color-on-surface-muted)]">Reconstruye tus oraciones con FSRS y conviértelas en aprendizaje permanente.</p>
                                </div>
                            ) : totalErrorCards > 0 ? (
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-base text-[var(--color-success)]">¡Laboratorio Despejado! 🎉</h3>
                                    <p className="text-xs text-[var(--color-on-surface-muted)]">Has resuelto todos tus errores acumulados. Sigue practicando para recopilar nuevos retos.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-base text-[var(--color-on-surface-muted)]">Sin errores acumulados</h3>
                                    <p className="text-xs text-[var(--color-on-surface-muted)]">Tu Tutor IA registrará aquí tus fallas gramaticales y de redacción para repasarlas como minijuegos.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--color-surface-container)] flex items-center justify-between">
                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-medium">Total acumulado: {totalErrorCards}</span>
                        <button
                            onClick={() => navigate('/review/lab')}
                            className="px-6 py-2.5 bg-[var(--color-surface-container)] text-[var(--color-primary-light)] text-xs font-bold rounded-full border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/5 transition-all shadow-sm active:scale-98 cursor-pointer"
                        >
                            Entrar al Lab
                        </button>
                    </div>
                </SpotlightCard>
            </div>

            {/* Vocabulary Review Wide Card */}
            {dueCards.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                    onClick={() => navigate('/review')}
                    className="cursor-pointer group"
                >
                    <div className="bg-[var(--color-card)] rounded-[2rem] overflow-hidden shadow-[var(--shadow-elevated)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]">
                        <div className="p-6 md:p-8" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-container))' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm text-white/70 font-medium">{t('dashboard.dueToday')}</p>
                            </div>
                            <p className="text-3xl font-black text-white tracking-tight leading-tight">
                                Tienes <CountUp from={0} to={dueCards.length} duration={1.5} className="text-3xl font-black text-white inline" /> palabras pendientes de repasar hoy
                            </p>
                        </div>
                        <div className="p-5 md:px-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <RefreshCw className="w-5 h-5 text-[var(--color-on-surface-muted)]" />
                                <span className="font-bold group-hover:text-[var(--color-primary)] transition-colors">{t('dashboard.startReview')}</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-[var(--color-on-surface-muted)] group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Grammar Skills Review */}
            {dueSkillCards.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    onClick={() => navigate('/review')}
                    className="bg-[var(--color-card)] rounded-[2rem] p-6 shadow-[var(--shadow-card)] cursor-pointer group hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-[var(--color-surface-container)] flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
                            </div>
                            <div>
                                <p className="font-bold group-hover:text-[var(--color-primary)] transition-colors">
                                    {dueSkillCards.length} {t('dashboard.grammarSkills', 'grammar skills')} {t('dashboard.pendingReview')}
                                </p>
                                <p className="text-xs text-[var(--color-on-surface-muted)] mt-0.5">{t('dashboard.grammarReviewDesc', 'Review your grammar knowledge')}</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[var(--color-on-surface-muted)] group-hover:translate-x-1 transition-transform" />
                    </div>
                </motion.div>
            )}

            {/* Recommended Stories — Horizontal scroll on mobile, grid on desktop */}
            {recommended && recommended.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                    className="space-y-5"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {recommended.map((story, i) => {
                            const levelColor = CEFR_COLORS[story.level] || 'var(--color-primary)';
                            const details = storyDetails[story.id] || { spanishTitle: '', description: '' };

                            return (
                                <motion.div
                                    key={story.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.28 + i * 0.05 }}
                                    className="h-full"
                                >
                                    <div
                                        onClick={() => navigate(`/learn/${story.id}`)}
                                        className="bg-[var(--color-card)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)] cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[var(--shadow-float)] group flex flex-col h-full"
                                    >
                                        {/* 1. CEFR thin colored top band */}
                                        <div style={{ backgroundColor: levelColor }} className="h-1 w-full shrink-0" />
                                        
                                        <div className="p-6 flex flex-col flex-1 gap-4.5 text-left">
                                            {/* 2. Top row: CEFR badge + Word count */}
                                            <div className="flex justify-between items-center text-xs font-mono text-[var(--color-on-surface-muted)]">
                                                <span
                                                    style={{ color: levelColor, backgroundColor: `${levelColor}20` }}
                                                    className="px-3 py-1 text-xs font-extrabold rounded-full"
                                                >
                                                    Nivel {story.level}
                                                </span>
                                                <span className="font-mono">
                                                    {story.wordCount} palabras
                                                </span>
                                            </div>

                                            {/* 3. Icon + Title + Spanish Title */}
                                            <div className="flex items-start gap-3.5">
                                                <div className="h-11 w-11 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center shrink-0">
                                                    <StoryIcon storyId={story.id} className="h-5.5 w-5.5 text-[var(--color-primary)]" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-extrabold text-base leading-tight line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                                                        {story.title}
                                                    </h3>
                                                    {details.spanishTitle && (
                                                        <p className="text-xs italic text-[var(--color-on-surface-muted)]/70 mt-0.5 truncate">
                                                            {details.spanishTitle}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 4. Description */}
                                            {details.description && (
                                                <p className="text-[13px] line-clamp-2 leading-relaxed text-[var(--color-on-surface-muted)] flex-1">
                                                    {details.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Progress (mobile only) — unit-based */}
            {progressInfo && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className="lg:hidden bg-[var(--color-card)] rounded-[2rem] p-6 shadow-[var(--shadow-card)]"
                >
                    <div className="text-sm font-bold text-[var(--color-on-surface-muted)] uppercase tracking-wider mb-5">{t('progress.title')}</div>
                    <div className="space-y-5">
                        <ProgressItem label={t('progress.unitsCompleted')} current={progressInfo.unitsCompleted} target={progressInfo.unitsTotal} />
                        <div className="pt-3">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-[var(--color-on-surface-muted)]">{t('progress.currentLevel')}</span>
                                <span className="font-bold text-[var(--color-primary)]">{progressInfo.overallPercent}%</span>
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
                                {t('progress.nextUnit')}: <span className="font-semibold">{progressInfo.currentUnitId}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            <LevelUpModal level={newLevel} isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} />
        </div>
    );
}

function QuickStat({ icon, value, label, accent, borderAccent }: {
    icon: React.ReactNode; value: string | number; label: string; accent: string; borderAccent: string;
}) {
    return (
        <div 
            style={{ borderLeftColor: borderAccent }}
            className="bg-[var(--color-card)] rounded-2xl p-3 sm:p-5 md:p-6 shadow-[var(--shadow-card)] text-left hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] border-l-4 transition-all duration-300"
        >
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 font-body font-medium">
                <span className="text-[9.5px] sm:text-xs font-bold text-[var(--color-on-surface-muted)] truncate">{label}</span>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-md shrink-0`}>
                    {icon}
                </div>
            </div>
            {typeof value === 'number' ? (
                <CountUp from={0} to={value} duration={1.2} className="text-xl sm:text-2xl font-black mt-1.5 sm:mt-2 block font-display" />
            ) : (
                <span className="text-xl sm:text-2xl font-black mt-1.5 sm:mt-2 block font-display text-[var(--color-on-surface)]">{value}</span>
            )}
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
                <span className={`font-bold ${met ? 'text-[var(--color-success)]' : 'text-[var(--color-on-surface-muted)]'}`}>
                    {met && <Check className="w-3 h-3 inline mr-1" />}{current}/{target}
                </span>
            </div>
            <div className="progress-bloom">
                <div
                    className={`progress-bloom-fill transition-all duration-500 ${met ? '' : 'opacity-70'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
