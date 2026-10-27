import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import type { Unit, UnitProgress } from '../lib/db';
import type { UnitProgressRow } from '../lib/database.types';
import { getUnitsByLevel } from '../data/curriculum/units';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useTier } from '../hooks/useTier';
import LevelBadge from '../components/ui/LevelBadge';
import PageLoader from '../components/PageLoader';
import SkillBreakdown from '../components/SkillBreakdown';
import Garden from '../components/garden/Garden';
import Plant from '../components/garden/Plant';
import StemProgress from '../components/ui/StemProgress';
import { useGardenPlant } from '../hooks/useGardenPlant';
import {
    Lock,
    CheckCircle2,
    BookOpen,
    Play,
    Trophy,
    Crown,
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
            {/* Level header */}
            <motion.header
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 flex-wrap"
            >
                <h1 className="text-3xl font-extrabold tracking-tight">{t('path.title')}</h1>
                <LevelBadge level={currentLevel} withStage />
                {levelGated && (
                    <Link to="/pricing" className="btn-primary inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5">
                        <Crown className="w-3.5 h-3.5" aria-hidden="true" /> Plan Pro
                    </Link>
                )}
            </motion.header>

            {/* The level as a garden: one plant per unit */}
            <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="card p-6 space-y-4 text-left"
                aria-labelledby="path-garden-title"
            >
                <div className="space-y-1">
                    <h2 id="path-garden-title" className="text-lg font-extrabold leading-tight">{bannerTitle}</h2>
                    <p className="text-sm text-[var(--color-on-surface-muted)]">{bannerSubtitle}</p>
                </div>
                {totalCount > 0 && (
                    <>
                        <Garden
                            total={totalCount}
                            completed={completedCount}
                            label={t('garden.unitsLabel', { done: completedCount, total: totalCount })}
                        />
                        <StemProgress value={levelPercent} label={t('garden.unitsLabel', { done: completedCount, total: totalCount })} />
                        <p className="text-xs font-mono text-[var(--color-on-surface-variant)]">
                            {t('garden.unitsLabel', { done: completedCount, total: totalCount })} · {levelPercent}%
                        </p>
                    </>
                )}
            </motion.section>

            {/* Units Road Map */}
            {unitsWithState.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative pl-8 md:pl-12"
                >
                    {/* Connector line */}
                    <div className="timeline-connector" />

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

    // Node dot — solid fills, no borders
    const { species } = useGardenPlant();
    const dotClass = isCompleted
        ? 'bg-[var(--color-primary)]'
        : isCurrent
            ? isAssessment
                ? 'bg-[var(--color-level-a1)]'
                : 'bg-[var(--color-a2-deep)]'
            : 'bg-[var(--color-surface-container-high)]';

    // Card shadow styles — no borders
    const cardShadow = isCurrent
        ? isAssessment
            ? 'shadow-[var(--shadow-elevated)]'
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
            <div className="timeline-node-container">
                <div
                    className={`
                        w-5 h-5 md:w-6 md:h-6 rounded-full shrink-0 relative
                        ${dotClass}
                        ${isCurrent ? 'ring-4 ring-[var(--color-primary-container)]' : ''}
                    `}
                >
                    {isCompleted && (
                        <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-[var(--color-on-primary)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                </div>
            </div>

            {/* Card */}
            <div
                onClick={effectivelyLocked ? undefined : onClick}
                className={`
                    ${cardBg} rounded-2xl p-6 md:p-8
                    transition-all duration-300 relative overflow-hidden
                    ${cardShadow}
                    ${!effectivelyLocked ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed'}
                `}
            >
                {/* Active Indicator Bar */}
                {isCurrent && (
                    <div className={`card-active-indicator ${isAssessment ? 'assessment' : 'primary'}`} />
                )}
                {/* Tier gate overlay */}
                {tierGated && (
                    <Link to="/pricing" className="absolute inset-0 z-10 bg-[color-mix(in_oklch,var(--color-level-ink)_45%,transparent)] flex flex-col items-center justify-center gap-3 rounded-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center shadow-lg">
                            <Lock className="w-5 h-5 text-[var(--color-on-primary)]" />
                        </div>
                        <span className="rounded-full bg-[var(--color-card)] px-3 py-1 text-xs font-black text-[var(--color-on-surface)] tracking-wide">Plan Pro</span>
                    </Link>
                )}
                <div className="flex items-start justify-between gap-4">
                    {/* Left: content */}
                    <div className="flex-1 min-w-0 space-y-4">
                        {/* Unit number + assessment badge */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className={`
                                text-xs font-black uppercase tracking-widest
                                ${isAssessment ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-muted)]'}
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
                                        ? 'text-[var(--color-on-surface)] bg-[var(--color-tertiary-container)]'
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
                                <Trophy className="w-5 h-5 inline mr-2 text-[var(--color-tertiary)] -mt-0.5" aria-hidden="true" />
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
                        ) : (
                            <div className="w-11 h-14 rounded-xl bg-[var(--color-surface-container)] overflow-hidden shadow-[inset_0_-6px_0_var(--color-soil)] px-1">
                                <Plant species={species} stage={isCompleted ? 'grown' : 'sprout'} height={42} />
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
                            text-[var(--color-primary)]
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
