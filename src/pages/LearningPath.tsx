import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import type { Unit, UnitProgress } from '../lib/db';
import type { UnitProgressRow } from '../lib/database.types';
import { getUnitsByLevel } from '../data';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useTier } from '../hooks/useTier';
import LevelBadge from '../components/ui/LevelBadge';
import PageLoader from '../components/PageLoader';
import SkillBreakdown from '../components/SkillBreakdown';
import {
    Map,
    Lock,
    CheckCircle2,
    BookOpen,
    Play,
    Trophy,
    ChevronRight,
    Crown,
    Sparkles,
} from 'lucide-react';

type UnitState = 'locked' | 'current' | 'completed';

interface UnitWithState {
    unit: Unit;
    state: UnitState;
    progress: any;
}

function getUnitsWithState(units: Unit[], progressMap: Map<string, any>): UnitWithState[] {
    const result: UnitWithState[] = [];
    let foundCurrent = false;

    for (const unit of units) {
        const progress = progressMap.get(unit.id) ?? null;
        const isCompleted = progress?.completed_at != null;

        if (isCompleted) {
            result.push({ unit, state: 'completed', progress });
        } else if (!foundCurrent) {
            // First non-completed unit is "current"
            result.push({ unit, state: 'current', progress });
            foundCurrent = true;
        } else {
            result.push({ unit, state: 'locked', progress });
        }
    }

    return result;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function LearningPath() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { progressInfo } = useLevelProgression();
    const { isPro, isFree } = useTier();

    const { user: authUser } = useAuth();
    const currentLevel = progressInfo?.currentLevel ?? 'A1';

    const userName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'estudiante';
    const bannerTitle = t('path.bannerTitle', { name: userName }) !== 'path.bannerTitle'
        ? t('path.bannerTitle', { name: userName })
        : `¡Sigue así, ${userName}!`;
    const bannerSubtitle = t('path.bannerSubtitle') !== 'path.bannerSubtitle'
        ? t('path.bannerSubtitle')
        : 'Completa el Checkpoint final esta semana para seguir avanzando en tu ruta de aprendizaje.';

    const isLevelAccessible = (level: string) => isPro || level === 'A1';

    const units = getUnitsByLevel(currentLevel);

    const { data: unitProgress } = useQuery({
        queryKey: ['unitProgress', currentLevel, authUser?.id],
        queryFn: async () => {
            if (!units || units.length === 0) return [];
            const ids = units.map(u => u.id);
            const { data } = await supabase.from('unit_progress').select('*').in('unit_id', ids);
            return (data ?? []) as UnitProgressRow[];
        },
        enabled: !!authUser?.id && units.length > 0,
    });

    if (!progressInfo) return <PageLoader />;

    const progressMap: globalThis.Map<string, any> = new globalThis.Map();
    if (unitProgress) {
        for (const p of unitProgress) {
            progressMap.set(p.unit_id, p);
        }
    }

    const unitsWithState = units ? getUnitsWithState(units, progressMap) : [];

    const completedCount = unitsWithState.filter(u => u.state === 'completed').length;
    const totalCount = unitsWithState.length;
    const levelPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleUnitClick = (item: UnitWithState) => {
        if (item.state === 'locked') return;
        if (!isLevelAccessible(item.unit.level)) return;
        navigate(`/path/${item.unit.id}`);
    };

    const levelGated = isFree && !isLevelAccessible(currentLevel);

    return (
        <div className="space-y-14">
            {/* 1. Motivational Banner */}
            <motion.div
                id="path-gradient-banner"
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' }}
            >
                <div className="absolute inset-0 bg-black/5 mix-blend-overlay pointer-events-none" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0">
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Sparkles className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                        </motion.div>
                    </div>
                    <div>
                        <h3 className="font-extrabold text-base md:text-lg font-display leading-tight">
                            {bannerTitle}
                        </h3>
                        <p className="text-white/90 text-xs md:text-sm mt-1">
                            {bannerSubtitle}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Level Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-5"
            >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center shadow-md">
                    <Map className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-3xl font-black tracking-tight">{t('path.title')}</h1>
                    <LevelBadge level={currentLevel} />
                    {levelGated && (
                        <Link to="/pricing" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] px-3.5 py-1.5 rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <Crown className="w-3.5 h-3.5" /> Plan Pro
                        </Link>
                    )}
                </div>
            </motion.div>

            {/* Units Road Map */}
            {unitsWithState.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative pl-8 md:pl-12"
                >
                    {/* Connector line — gradient instead of border */}
                    <div className="absolute left-[13px] md:left-[21px] top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-[var(--color-primary)]/30 via-[var(--color-surface-container-high)] to-[var(--color-surface-container)]" />

                    {unitsWithState.map((item, index) => (
                        <UnitCard
                            key={item.unit.id}
                            item={item}
                            index={index}
                            total={totalCount}
                            onClick={() => handleUnitClick(item)}
                            t={t}
                            tierGated={levelGated}
                        />
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="widget text-center py-16"
                >
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-container)] flex items-center justify-center mx-auto mb-5">
                        <BookOpen className="w-7 h-7 text-[var(--color-on-surface-muted)]" />
                    </div>
                    <p className="text-[var(--color-on-surface-muted)] text-sm">
                        No hay unidades disponibles para el nivel {currentLevel} todav&iacute;a.
                    </p>
                </motion.div>
            )}

            {/* Level Progress Bar */}
            {totalCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="widget"
                >
                    <div className="flex justify-between text-xs mb-5">
                        <span className="text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider">
                            Progreso del nivel {currentLevel}
                        </span>
                        <span className="font-black text-sm text-[var(--color-on-surface)]">
                            {completedCount}/{totalCount} &mdash; {levelPercent}%
                        </span>
                    </div>
                    <div className="progress-bloom overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${levelPercent}%` }}
                            className={`progress-bloom-fill ${
                                { A1: 'bg-[#60A5FA]', A2: 'bg-[#4ADE80]', B1: 'bg-[#FBBF24]', B2: 'bg-[#F87171]' }[currentLevel] || 'bg-[var(--color-primary)]'
                            }`}
                            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                </motion.div>
            )}
        </div>
    );
}

/* ===== Unit Card ===== */

interface UnitCardProps {
    item: UnitWithState;
    index: number;
    total: number;
    onClick: () => void;
    t: (key: string) => string;
    tierGated?: boolean;
}

function UnitCard({ item, index, total, onClick, t, tierGated }: UnitCardProps) {
    const { unit, state, progress } = item;
    const isAssessment = unit.isAssessment;
    const isLocked = state === 'locked';
    const isCompleted = state === 'completed';
    const isCurrent = state === 'current';

    // Node dot — gradient fills, no borders
    const dotClass = isCompleted
        ? 'bg-gradient-to-br from-[var(--color-success)] to-[var(--color-success-light)] shadow-md shadow-[var(--color-success)]/30'
        : isCurrent
            ? isAssessment
                ? 'bg-gradient-to-br from-[var(--color-level-b1)] to-[var(--color-warning-light)] shadow-md shadow-[var(--color-level-b1)]/30'
                : 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] shadow-md shadow-[var(--color-primary)]/30'
            : 'bg-[var(--color-surface-container-high)]';

    // Card shadow styles — no borders
    const cardShadow = isCurrent
        ? isAssessment
            ? 'shadow-[0_4px_24px_rgba(251,191,36,0.12)] hover:shadow-[0_8px_32px_rgba(251,191,36,0.18)]'
            : 'shadow-[var(--shadow-elevated)] hover:shadow-[var(--shadow-float)]'
        : isCompleted
            ? 'shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)]'
            : 'shadow-[var(--shadow-card)]';

    const effectivelyLocked = isLocked || tierGated;
    const cardBg = effectivelyLocked ? 'bg-[var(--color-surface-container)]' : 'bg-[var(--color-card)]';

    return (
        <motion.div
            variants={itemVariants}
            className={`relative mx-2 mt-2 mb-10 last:mb-0 transition-opacity duration-300 ${effectivelyLocked ? 'opacity-60' : ''}`}
        >
            {/* Timeline node */}
            <div
                className={`
                    absolute -left-8 md:-left-12 top-7
                    w-5 h-5 md:w-6 md:h-6 rounded-full
                    z-10
                    ${dotClass}
                    ${isCurrent && !isAssessment ? 'ring-4 ring-[var(--color-primary)]/20 animate-pulse' : ''}
                    ${isCurrent && isAssessment ? 'ring-4 ring-[var(--color-level-b1)]/20 animate-pulse' : ''}
                `}
            >
                {isCompleted && (
                    <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
            </div>

            {/* Card */}
            <div
                onClick={effectivelyLocked ? undefined : onClick}
                className={`
                    ${cardBg} rounded-2xl p-6 md:p-8
                    transition-all duration-300 relative overflow-hidden
                    ${cardShadow}
                    ${isCurrent ? (isAssessment ? 'border-l-4 border-[var(--color-level-b1)]' : 'border-l-4 border-[var(--color-primary)]') : ''}
                    ${!effectivelyLocked ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed'}
                `}
            >
                {/* Tier gate overlay */}
                {tierGated && (
                    <Link to="/pricing" className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 rounded-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center shadow-lg">
                            <Lock className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-black text-white tracking-wide">Plan Pro</span>
                    </Link>
                )}
                <div className="flex items-start justify-between gap-4">
                    {/* Left: content */}
                    <div className="flex-1 min-w-0 space-y-4">
                        {/* Unit number + assessment badge */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className={`
                                text-xs font-black uppercase tracking-widest
                                ${isAssessment ? 'text-[var(--color-level-b1)]' : 'text-[var(--color-on-surface-muted)]'}
                            `}>
                                {isAssessment
                                    ? t('path.assessment')
                                    : `${t('path.unit')} ${unit.unitNumber}`
                                }
                            </span>

                            {/* State pill */}
                            {isCompleted && (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-success)] bg-[var(--color-success)]/10 px-3 py-1 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {t('path.completed')}
                                </span>
                            )}
                            {isCurrent && (
                                <span className={`
                                    inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full
                                    ${isAssessment
                                        ? 'text-[var(--color-level-b1)] bg-[var(--color-level-b1)]/10'
                                        : 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                                    }
                                `}>
                                    <Play className="w-3 h-3" />
                                    {t('path.current')}
                                </span>
                            )}
                            {isLocked && (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-on-surface-muted)] bg-[var(--color-surface-container)] px-3 py-1 rounded-full">
                                    <Lock className="w-3 h-3" />
                                    {t('path.locked')}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-black leading-snug tracking-tight">
                            {isAssessment && (
                                <Trophy className="w-5 h-5 inline mr-2 text-[var(--color-level-b1)] -mt-0.5" />
                            )}
                            {unit.title}
                        </h3>

                        {/* Grammar topic */}
                        <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">
                            {unit.grammarTopic}
                        </p>

                        {/* Progress checkmarks */}
                        {!isAssessment && (isCurrent || isCompleted) && progress && (
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-1">
                                <ProgressCheck label="Grammar" done={progress.grammar_card_read} />
                                <ProgressCheck label="Story" done={progress.story_completed} />
                                <ProgressCheck label="Exercises" done={progress.exercises_score >= 70} />
                                <ProgressCheck label="Checkpoint" done={progress.checkpoint_passed} />
                            </div>
                        )}

                        {/* Skill mastery breakdown for completed units */}
                        {isCompleted && !isAssessment && (
                            <SkillBreakdown unitId={unit.id} />
                        )}
                    </div>

                    {/* Right: action icon */}
                    <div className="flex-shrink-0 mt-2">
                        {isLocked ? (
                            <div className="w-10 h-10 rounded-2xl bg-[var(--color-surface-container)] flex items-center justify-center">
                                <Lock className="w-4 h-4 text-[var(--color-on-surface-muted)]" />
                            </div>
                        ) : isCompleted ? (
                            <div className="w-10 h-10 rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                            </div>
                        ) : (
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isAssessment ? 'bg-[var(--color-level-b1)]/10' : 'bg-[var(--color-primary)]/10'}`}>
                                <ChevronRight className={`w-5 h-5 ${isAssessment ? 'text-[var(--color-level-b1)]' : 'text-[var(--color-primary)]'}`} />
                            </div>
                        )}
                    </div>
                </div>

                {/* CTA for current unit — no border-t, use surface shift */}
                {isCurrent && (
                    <div className={`
                        mt-5 pt-4 rounded-2xl
                        bg-[var(--color-surface-container-low)]/50
                        -mx-2 px-4 py-3
                    `}>
                        <span className={`
                            text-sm font-bold flex items-center gap-2.5
                            ${isAssessment ? 'text-[var(--color-level-b1)]' : 'text-[var(--color-primary)]'}
                        `}>
                            <Play className="w-4 h-4" />
                            {progress
                                ? t('path.continueUnit')
                                : t('path.startUnit')
                            }
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/* ===== Progress Check Item ===== */

function ProgressCheck({ label, done }: { label: string; done: boolean }) {
    return (
        <span className={`
            inline-flex items-center gap-1.5 text-xs font-semibold
            ${done ? 'text-[var(--color-success)]' : 'text-[var(--color-on-surface-muted)]'}
        `}>
            {done ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
                <span className="w-3.5 h-3.5 rounded-full bg-[var(--color-surface-container-high)] opacity-60" />
            )}
            {label}
        </span>
    );
}
