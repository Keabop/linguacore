import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import type { Unit, UnitProgress } from '../lib/db';
import { useLevelProgression } from '../hooks/useLevelProgression';
import LevelBadge from '../components/ui/LevelBadge';
import PageLoader from '../components/PageLoader';
import {
    Map,
    Lock,
    CheckCircle2,
    BookOpen,
    Play,
    Trophy,
    ChevronRight,
} from 'lucide-react';

type UnitState = 'locked' | 'current' | 'completed';

interface UnitWithState {
    unit: Unit;
    state: UnitState;
    progress: UnitProgress | null;
}

function getUnitsWithState(units: Unit[], progressMap: Map<string, UnitProgress>): UnitWithState[] {
    const result: UnitWithState[] = [];
    let foundCurrent = false;

    for (const unit of units) {
        const progress = progressMap.get(unit.id) ?? null;
        const isCompleted = progress?.completedAt != null;

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

    const currentLevel = progressInfo?.currentLevel ?? 'A1';

    const units = useLiveQuery(
        () => db.units.where('level').equals(currentLevel).sortBy('unitNumber'),
        [currentLevel],
    );

    const unitProgress = useLiveQuery(
        async () => {
            if (!units || units.length === 0) return [];
            const ids = units.map(u => u.id);
            return db.unitProgress.where('unitId').anyOf(ids).toArray();
        },
        [units],
    );

    if (!progressInfo) return <PageLoader />;

    const progressMap: globalThis.Map<string, UnitProgress> = new globalThis.Map();
    if (unitProgress) {
        for (const p of unitProgress) {
            progressMap.set(p.unitId, p);
        }
    }

    const unitsWithState = units ? getUnitsWithState(units, progressMap) : [];

    const completedCount = unitsWithState.filter(u => u.state === 'completed').length;
    const totalCount = unitsWithState.length;
    const levelPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleUnitClick = (item: UnitWithState) => {
        if (item.state === 'locked') return;
        navigate(`/path/${item.unit.id}`);
    };

    return (
        <div className="space-y-10">
            {/* Level Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <Map className="w-6 h-6 text-primary" />
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-extrabold">{t('path.title')}</h1>
                    <LevelBadge level={currentLevel} />
                </div>
            </motion.div>

            {/* Units Road Map */}
            {unitsWithState.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative pl-8 md:pl-10"
                >
                    {/* Connector line */}
                    <div className="absolute left-[15px] md:left-[19px] top-4 bottom-4 w-[2px] bg-border" />

                    {unitsWithState.map((item, index) => (
                        <UnitCard
                            key={item.unit.id}
                            item={item}
                            index={index}
                            total={totalCount}
                            onClick={() => handleUnitClick(item)}
                            t={t}
                        />
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="widget text-center py-12"
                >
                    <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-4" />
                    <p className="text-text-muted">
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
                    <div className="flex justify-between text-xs mb-3">
                        <span className="text-text-muted font-medium uppercase tracking-wide">
                            Progreso del nivel {currentLevel}
                        </span>
                        <span className="text-text-secondary font-bold">
                            {completedCount}/{totalCount} &mdash; {levelPercent}%
                        </span>
                    </div>
                    <div className="h-2.5 bg-bg-app rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${levelPercent}%` }}
                            className="h-full rounded-full bg-primary"
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
}

function UnitCard({ item, index, total, onClick, t }: UnitCardProps) {
    const { unit, state, progress } = item;
    const isAssessment = unit.isAssessment;
    const isLocked = state === 'locked';
    const isCompleted = state === 'completed';
    const isCurrent = state === 'current';

    // Node dot colors
    const dotClass = isCompleted
        ? 'bg-green-500 border-green-500/30'
        : isCurrent
            ? isAssessment
                ? 'bg-amber-500 border-amber-500/30'
                : 'bg-primary border-primary/30'
            : 'bg-bg-card border-border';

    // Card border styles
    const cardBorder = isCurrent
        ? isAssessment
            ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
            : 'border-primary/40 shadow-[0_0_20px_rgba(var(--color-primary-rgb,99,102,241),0.08)]'
        : isCompleted
            ? 'border-green-500/20'
            : 'border-border';

    return (
        <motion.div
            variants={itemVariants}
            className={`relative mb-6 last:mb-0 ${isLocked ? 'opacity-50' : ''}`}
        >
            {/* Timeline node */}
            <div
                className={`
                    absolute -left-8 md:-left-10 top-6
                    w-4 h-4 md:w-5 md:h-5 rounded-full
                    border-[3px] z-10
                    ${dotClass}
                    ${isCurrent && !isAssessment ? 'ring-4 ring-primary/20 animate-pulse' : ''}
                    ${isCurrent && isAssessment ? 'ring-4 ring-amber-500/20 animate-pulse' : ''}
                `}
            >
                {isCompleted && (
                    <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
            </div>

            {/* Card */}
            <div
                onClick={onClick}
                className={`
                    bg-bg-card border rounded-2xl p-6
                    transition-all duration-200
                    ${cardBorder}
                    ${!isLocked ? 'cursor-pointer hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5' : 'cursor-not-allowed'}
                `}
            >
                <div className="flex items-start justify-between gap-3">
                    {/* Left: content */}
                    <div className="flex-1 min-w-0 space-y-3">
                        {/* Unit number + assessment badge */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className={`
                                text-xs font-bold uppercase tracking-wider
                                ${isAssessment ? 'text-amber-400' : 'text-text-muted'}
                            `}>
                                {isAssessment
                                    ? t('path.assessment')
                                    : `${t('path.unit')} ${unit.unitNumber}`
                                }
                            </span>

                            {/* State pill */}
                            {isCompleted && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {t('path.completed')}
                                </span>
                            )}
                            {isCurrent && (
                                <span className={`
                                    inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full
                                    ${isAssessment
                                        ? 'text-amber-400 bg-amber-500/10'
                                        : 'text-primary bg-primary/10'
                                    }
                                `}>
                                    <Play className="w-3 h-3" />
                                    {t('path.current')}
                                </span>
                            )}
                            {isLocked && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                                    <Lock className="w-3 h-3" />
                                    {t('path.locked')}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold leading-snug">
                            {isAssessment && (
                                <Trophy className="w-4 h-4 inline mr-1.5 text-amber-400 -mt-0.5" />
                            )}
                            {unit.title}
                        </h3>

                        {/* Grammar topic */}
                        <p className="text-sm text-text-muted leading-relaxed">
                            {unit.grammarTopic}
                        </p>

                        {/* Progress checkmarks */}
                        {!isAssessment && (isCurrent || isCompleted) && progress && (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                                <ProgressCheck label="Grammar" done={progress.grammarCardRead} />
                                <ProgressCheck label="Story" done={progress.storyCompleted} />
                                <ProgressCheck label="Exercises" done={progress.exercisesScore >= 70} />
                                <ProgressCheck label="Checkpoint" done={progress.checkpointPassed} />
                            </div>
                        )}
                    </div>

                    {/* Right: action icon */}
                    <div className="flex-shrink-0 mt-1">
                        {isLocked ? (
                            <Lock className="w-5 h-5 text-text-muted" />
                        ) : isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                            <ChevronRight className={`w-5 h-5 ${isAssessment ? 'text-amber-400' : 'text-primary'}`} />
                        )}
                    </div>
                </div>

                {/* CTA for current unit */}
                {isCurrent && (
                    <div className={`
                        mt-4 pt-3 border-t
                        ${isAssessment ? 'border-amber-500/20' : 'border-border'}
                    `}>
                        <span className={`
                            text-sm font-semibold flex items-center gap-2
                            ${isAssessment ? 'text-amber-400' : 'text-primary'}
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
            inline-flex items-center gap-1 text-xs font-medium
            ${done ? 'text-green-400' : 'text-text-muted'}
        `}>
            {done ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-current opacity-40" />
            )}
            {label}
        </span>
    );
}
