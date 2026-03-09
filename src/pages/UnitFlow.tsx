import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    RefreshCw,
    PenLine,
    Mic,
    Trophy,
    CheckCircle2,
    ChevronRight,
    Sparkles,
    RotateCcw,
} from 'lucide-react';
import type { GrammarExercise } from '../lib/db';
import { getUnit, getStoryByUnit, getExercisesByUnit } from '../data';
import { useUnitProgress, type UnitStep } from '../hooks/useUnitProgress';
import GrammarCard from '../components/GrammarCard';
import ExerciseRunner from '../components/exercises/ExerciseRunner';
import OutputStep from '../components/OutputStep';
import LevelAssessment from './LevelAssessment';

/* ===== Step metadata ===== */

const STEPS: { key: UnitStep; icon: typeof BookOpen }[] = [
    { key: 'grammar', icon: BookOpen },
    { key: 'story', icon: BookOpen },
    { key: 'vocab', icon: RefreshCw },
    { key: 'exercises', icon: PenLine },
    { key: 'output', icon: Mic },
    { key: 'checkpoint', icon: Trophy },
];

const STEP_LABELS: Record<string, string> = {
    grammar: 'Gramatica',
    story: 'Historia',
    vocab: 'Vocabulario',
    exercises: 'Ejercicios',
    output: 'Output',
    checkpoint: 'Checkpoint',
};

function stepIndex(step: UnitStep): number {
    const idx = STEPS.findIndex(s => s.key === step);
    return idx >= 0 ? idx : 0;
}

/* ===== Slide animation variants ===== */

const slideVariants = {
    enter: (dir: number) => ({
        x: dir > 0 ? 80 : -80,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (dir: number) => ({
        x: dir > 0 ? -80 : 80,
        opacity: 0,
    }),
};

/* ===== Celebration particles ===== */

function CelebrationCard({ onBack }: { onBack: () => void }) {
    const particles = useMemo(
        () =>
            Array.from({ length: 24 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                delay: Math.random() * 0.8,
                duration: 1.5 + Math.random() * 1.5,
                size: 4 + Math.random() * 6,
                color: ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'][i % 5],
            })),
        [],
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative flex flex-col items-center justify-center py-16 overflow-hidden"
        >
            {/* Confetti particles */}
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ y: -20, x: `${p.x}%`, opacity: 1 }}
                    animate={{ y: 400, opacity: 0 }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'easeIn',
                    }}
                    className="absolute top-0 rounded-full"
                    style={{
                        left: `${p.x}%`,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                    }}
                />
            ))}

            <div className="relative z-10 bg-bg-card border border-green-500/30 rounded-2xl p-8 w-full max-w-sm text-center space-y-6 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    <Trophy className="w-16 h-16 text-amber-400 mx-auto" />
                </motion.div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-white">
                        Unidad completada
                    </h2>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        Has completado todos los pasos de esta unidad. Sigue avanzando en tu ruta de aprendizaje.
                    </p>
                </div>

                <button
                    onClick={onBack}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]"
                >
                    Volver a la ruta
                </button>
            </div>
        </motion.div>
    );
}

/* ===== Main Component ===== */

export default function UnitFlow() {
    const { unitId } = useParams<{ unitId: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { progress, currentStep, isLoading, updateProgress, markStepComplete } =
        useUnitProgress(unitId ?? '');

    const unit = unitId ? getUnit(unitId) ?? null : null;
    const unitStory = unitId ? getStoryByUnit(unitId) ?? null : null;
    const unitExercises = unitId ? getExercisesByUnit(unitId) : ([] as GrammarExercise[]);

    // Track animation direction
    const [direction, setDirection] = useState(1);
    const [checkpointKey, setCheckpointKey] = useState(0);

    // Checkpoint exercise subset — must be above early returns to satisfy Rules of Hooks
    const checkpointExercises = useMemo(() => {
        if (!unitExercises || unitExercises.length === 0) return [];
        const shuffled = [...unitExercises].sort(() => Math.random() - 0.5);
        const count = Math.min(Math.max(3, Math.min(5, shuffled.length)), shuffled.length);
        return shuffled.slice(0, count);
    }, [unitExercises, checkpointKey]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-text-muted text-sm">{t('common.loading')}</div>
            </div>
        );
    }

    // Unit not found
    if (!unit) {
        return (
            <div className="space-y-6">
                <BackButton onClick={() => navigate('/path')} label={t('common.back')} />
                <p className="text-text-muted">Unidad no encontrada.</p>
            </div>
        );
    }

    // Assessment unit — render LevelAssessment
    if (unit.isAssessment) {
        return (
            <div className="space-y-6">
                <BackButton onClick={() => navigate('/path')} label={t('common.back')} />
                <LevelAssessment
                    level={unit.level}
                    unitId={unit.id}
                    onComplete={() => navigate('/path')}
                />
            </div>
        );
    }

    const activeStepIdx = stepIndex(currentStep);

    const handleStepAdvance = () => {
        setDirection(1);
    };

    /* -- Exercise completion handlers -- */

    const handleExercisesComplete = async (score: number) => {
        await updateProgress({ exercises_score: score });
        await markStepComplete('exercises');
        handleStepAdvance();
    };

    const handleOutputComplete = async () => {
        await markStepComplete('output');
        handleStepAdvance();
    };

    const handleCheckpointComplete = async (score: number) => {
        if (score >= 80) {
            await updateProgress({
                checkpoint_passed: true,
                completed_at: new Date().toISOString(),
            });
            handleStepAdvance();
        }
        // If failed, user gets retry button — no automatic progress
    };

    /* -- Render current step content -- */

    const renderStepContent = () => {
        if (currentStep === 'completed') {
            return <CelebrationCard onBack={() => navigate('/path')} />;
        }

        return (
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                    {currentStep === 'grammar' && (
                        <GrammarCard
                            unitId={unitId!}
                            onComplete={() => {
                                markStepComplete('grammar');
                                handleStepAdvance();
                            }}
                        />
                    )}

                    {currentStep === 'story' && (
                        <StoryStep
                            unitStory={unitStory ?? null}
                            onComplete={() => {
                                markStepComplete('story');
                                handleStepAdvance();
                            }}
                            onNavigateStories={() => navigate('/learn')}
                        />
                    )}

                    {currentStep === 'vocab' && (
                        <VocabStep
                            onComplete={() => {
                                markStepComplete('vocab');
                                handleStepAdvance();
                            }}
                            onNavigateReview={() => navigate('/review')}
                        />
                    )}

                    {currentStep === 'exercises' && unitExercises && unitExercises.length > 0 && (
                        <div className="space-y-4">
                            <StepHeader
                                icon={PenLine}
                                label={t('exercises.title')}
                                description="Pon a prueba lo que aprendiste en esta unidad."
                            />
                            <ExerciseRunner
                                exercises={unitExercises}
                                onComplete={handleExercisesComplete}
                            />
                        </div>
                    )}

                    {currentStep === 'exercises' && (!unitExercises || unitExercises.length === 0) && (
                        <EmptyStepCard
                            icon={PenLine}
                            title={t('exercises.title')}
                            description="No hay ejercicios disponibles para esta unidad todavia."
                            actionLabel="Saltar"
                            onAction={async () => {
                                await updateProgress({ exercises_score: 100 });
                                await markStepComplete('exercises');
                                handleStepAdvance();
                            }}
                        />
                    )}

                    {currentStep === 'output' && (
                        <OutputStep
                            unitId={unitId!}
                            level={unit.level}
                            onComplete={handleOutputComplete}
                        />
                    )}

                    {currentStep === 'checkpoint' && checkpointExercises.length > 0 && (
                        <CheckpointStep
                            exercises={checkpointExercises}
                            onComplete={handleCheckpointComplete}
                            onRetry={() => setCheckpointKey(k => k + 1)}
                        />
                    )}

                    {currentStep === 'checkpoint' && checkpointExercises.length === 0 && (
                        <EmptyStepCard
                            icon={Trophy}
                            title="Checkpoint"
                            description="No hay ejercicios disponibles para el checkpoint."
                            actionLabel="Completar unidad"
                            onAction={async () => {
                                await updateProgress({
                                    checkpoint_passed: true,
                                    completed_at: new Date().toISOString(),
                                });
                                handleStepAdvance();
                            }}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <div className="space-y-8">
            {/* Back button */}
            <BackButton onClick={() => navigate('/path')} label={t('common.back')} />

            {/* Unit title */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
            >
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    {t('path.unit')} {unit.unitNumber}
                </p>
                <h1 className="text-2xl font-extrabold leading-tight">{unit.title}</h1>
            </motion.div>

            {/* Step indicator (horizontal stepper) */}
            {currentStep !== 'completed' && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-1.5"
                >
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const isCompleted = i < activeStepIdx;
                        const isCurrent = i === activeStepIdx;
                        const isUpcoming = i > activeStepIdx;

                        return (
                            <div key={step.key} className="flex items-center gap-1.5">
                                {/* Step dot/icon */}
                                <div
                                    className={`
                                        flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300
                                        ${isCompleted
                                            ? 'bg-green-500/20 text-green-400'
                                            : isCurrent
                                                ? 'bg-primary/20 text-primary ring-2 ring-primary/30'
                                                : 'bg-bg-card text-text-muted border border-border'
                                        }
                                    `}
                                    title={STEP_LABELS[step.key]}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                </div>

                                {/* Connector line */}
                                {i < STEPS.length - 1 && (
                                    <div
                                        className={`
                                            h-[2px] w-4 sm:w-6 md:w-8 rounded-full transition-colors duration-300
                                            ${isCompleted ? 'bg-green-500/40' : 'bg-border'}
                                        `}
                                    />
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            )}

            {/* Step labels (visible on wider screens) */}
            {currentStep !== 'completed' && (
                <div className="hidden sm:flex items-center gap-1.5 -mt-5">
                    {STEPS.map((step, i) => {
                        const isCompleted = i < activeStepIdx;
                        const isCurrent = i === activeStepIdx;

                        return (
                            <div key={step.key} className="flex items-center gap-1.5">
                                <span
                                    className={`
                                        text-[10px] font-semibold w-9 text-center leading-tight
                                        ${isCompleted
                                            ? 'text-green-400'
                                            : isCurrent
                                                ? 'text-primary'
                                                : 'text-text-muted'
                                        }
                                    `}
                                >
                                    {STEP_LABELS[step.key]}
                                </span>
                                {i < STEPS.length - 1 && (
                                    <div className="w-4 sm:w-6 md:w-8" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Step content */}
            <div className="min-h-[300px]">
                {renderStepContent()}
            </div>
        </div>
    );
}

/* ===== Sub-components ===== */

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onClick}
            className="flex items-center gap-2 text-text-muted hover:text-text-secondary transition-colors"
        >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
        </motion.button>
    );
}

function StepHeader({
    icon: Icon,
    label,
    description,
}: {
    icon: typeof BookOpen;
    label: string;
    description: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    {label}
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

/* -- Story Step -- */

function StoryStep({
    unitStory,
    onComplete,
    onNavigateStories,
}: {
    unitStory: { id: string; title: string } | null;
    onComplete: () => void;
    onNavigateStories: () => void;
}) {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            <StepHeader
                icon={BookOpen}
                label="Historia"
                description="Lee una historia para practicar la gramatica de esta unidad."
            />

            <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-5">
                {unitStory ? (
                    <>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            Tienes una historia asignada para esta unidad:
                        </p>
                        <button
                            onClick={() => navigate(`/learn/${unitStory.id}`)}
                            className="w-full bg-bg-app border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/40 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-primary" />
                                <span className="font-bold text-sm group-hover:text-primary transition-colors">
                                    {unitStory.title}
                                </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            No hay una historia asignada a esta unidad. Puedes explorar las historias disponibles o saltar este paso.
                        </p>
                        <button
                            onClick={onNavigateStories}
                            className="w-full bg-bg-app border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/40 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <span className="font-bold text-sm group-hover:text-primary transition-colors">
                                    Explorar historias
                                </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </button>
                    </>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        onClick={onComplete}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                    >
                        {unitStory ? 'Marcar como completado' : 'Saltar por ahora'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* -- Vocab Step -- */

function VocabStep({
    onComplete,
    onNavigateReview,
}: {
    onComplete: () => void;
    onNavigateReview: () => void;
}) {
    return (
        <div className="space-y-4">
            <StepHeader
                icon={RefreshCw}
                label="Vocabulario"
                description="Repasa el vocabulario que aprendiste."
            />

            <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-5">
                <p className="text-text-secondary text-sm leading-relaxed">
                    Practica las tarjetas de vocabulario que has acumulado. Este paso es flexible y puedes continuar cuando quieras.
                </p>

                <button
                    onClick={onNavigateReview}
                    className="w-full bg-bg-app border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/40 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-accent-blue" />
                        <span className="font-bold text-sm group-hover:text-primary transition-colors">
                            Ir a repasar tarjetas
                        </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                    onClick={onComplete}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}

/* -- Checkpoint Step -- */

function CheckpointStep({
    exercises,
    onComplete,
    onRetry,
}: {
    exercises: GrammarExercise[];
    onComplete: (score: number) => void;
    onRetry: () => void;
}) {
    const [lastScore, setLastScore] = useState<number | null>(null);
    const [showRunner, setShowRunner] = useState(true);

    const handleComplete = (score: number) => {
        setLastScore(score);
        if (score >= 80) {
            onComplete(score);
        } else {
            setShowRunner(false);
        }
    };

    const handleRetry = () => {
        setLastScore(null);
        setShowRunner(true);
        onRetry();
    };

    return (
        <div className="space-y-4">
            <StepHeader
                icon={Trophy}
                label="Checkpoint"
                description="Demuestra tu dominio. Necesitas al menos 80% para aprobar."
            />

            {showRunner ? (
                <ExerciseRunner exercises={exercises} onComplete={handleComplete} />
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-10"
                >
                    <div className="bg-bg-card border border-red-500/30 rounded-2xl p-8 w-full max-w-sm text-center space-y-5">
                        <div className="space-y-2">
                            <p className="text-5xl font-extrabold text-red-400">
                                {lastScore}%
                            </p>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                Necesitas al menos 80% para aprobar. Repasa el material y vuelve a intentarlo.
                            </p>
                        </div>

                        <button
                            onClick={handleRetry}
                            className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Intentalo de nuevo
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

/* -- Empty Step fallback -- */

function EmptyStepCard({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
}: {
    icon: typeof BookOpen;
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
}) {
    return (
        <div className="space-y-4">
            <StepHeader icon={Icon} label={title} description={description} />
            <div className="bg-bg-card border border-border rounded-2xl p-7 text-center space-y-5">
                <Icon className="w-10 h-10 text-text-muted mx-auto" />
                <p className="text-text-muted text-sm">{description}</p>
                <button
                    onClick={onAction}
                    className="bg-primary hover:bg-primary-dark text-white py-3 px-8 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                >
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}
