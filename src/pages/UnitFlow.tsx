import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { ReadStoryRow } from '../lib/database.types';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RefreshCw, PenLine, Mic, Trophy, CheckCircle2, ChevronRight, Sparkles, RotateCcw, Check } from 'lucide-react';
import type { GrammarExercise, Story, Vocabulary } from '../lib/db';
import { getUnit, getStoriesByUnit, getExercisesByUnit, getSkillsByUnit } from '../data';
import { allVocabulary, getVocabMap, savedIdsOf, vocabularyAliases } from '../data/vocabulary';
import { unitKeyWords } from '../data/vocabulary/keyWords';
import { useCards } from '../hooks/useCards';
import { shuffle } from '../lib/shuffle';
import { useUnitProgress, type UnitStep } from '../hooks/useUnitProgress';
import { useSkillCards } from '../hooks/useSkillCards';
import PlantCircle from '../components/garden/PlantCircle';
import { useGardenPlant } from '../hooks/useGardenPlant';
import { toast } from '../lib/toast';
import GrammarCard from '../components/GrammarCard';
import ExerciseRunner from '../components/exercises/ExerciseRunner';
import OutputStep from '../components/OutputStep';
import LevelAssessment from './LevelAssessment';
import BackButton from '../components/ui/BackButton';

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
        transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
    exit: (dir: number) => ({
        x: dir > 0 ? -80 : 80,
        opacity: 0,
        transition: { duration: 0.2 },
    }),
};

/* ===== Celebration ===== */

function CelebrationCard({ onBack }: { onBack: () => void }) {
    const { species } = useGardenPlant();

    // Unit complete is one of the three achievement moments: the unit's plant grows
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-16"
        >
            <div role="status" className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-10 w-full max-w-sm text-center space-y-6 shadow-[var(--shadow-float)]">
                <PlantCircle species={species} size="lg" height={44} delay={200} />

                <div className="space-y-2">
                    <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">
                        ¡Unidad completada!
                    </h2>
                    <p className="text-[var(--color-on-surface-muted)] text-sm leading-relaxed">
                        Tu planta creció. Sigue avanzando en tu ruta para llenar el jardín de este nivel.
                    </p>
                </div>

                <button onClick={onBack} className="btn-primary w-full py-4 text-base">
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
    const { addSkillCards } = useSkillCards();

    const unit = unitId ? getUnit(unitId) ?? null : null;
    const unitStories = unitId ? getStoriesByUnit(unitId) : [];
    const unitStory = unitStories[0] ?? null;
    const unitExercises = unitId ? getExercisesByUnit(unitId) : ([] as GrammarExercise[]);

    // Track animation direction
    const [direction, setDirection] = useState(1);
    const [checkpointKey, setCheckpointKey] = useState(0);
    const [exerciseAttempt, setExerciseAttempt] = useState(0);

    // Checkpoint exercise subset — must be above early returns to satisfy Rules of Hooks
    // The checkpoint checks the unit with items the learner has not just answered: the unit's
    // review-skill exercises. Units without skills fall back to their own exercises.
    const checkpointExercises = useMemo(() => {
        const fresh = unitId ? skillCheckpointExercises(unitId) : [];
        const pool = fresh.length >= 5 ? fresh : unitExercises ?? [];
        return shuffle(pool).slice(0, Math.min(5, pool.length));
    }, [unitId, unitExercises, checkpointKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-[var(--color-on-surface-muted)] text-sm">{t('common.loading')}</div>
            </div>
        );
    }

    // Unit not found
    if (!unit) {
        return (
            <div className="space-y-6">
                <BackButton onClick={() => navigate('/path')} label={t('common.back')} />
                <p className="text-[var(--color-on-surface-muted)]">Unidad no encontrada.</p>
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
        // A score of 0 keeps the unit on this step: the exercises start over instead of
        // leaving the learner on the score screen
        if (score === 0) setExerciseAttempt(n => n + 1);
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

            // Create grammar skill cards for spaced repetition
            const skillCount = await addSkillCards(unitId!);
            if (skillCount > 0) {
                toast.success({
                    title: t('unitFlow.skillsAdded', '¡Habilidades de gramática añadidas!'),
                    description: t('unitFlow.skillsAddedDesc', {
                        count: skillCount,
                        defaultValue: `${skillCount} habilidades añadidas a tu repaso`,
                    }),
                });
            }

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
                            unitStories={unitStories}
                            onComplete={() => {
                                markStepComplete('story');
                                handleStepAdvance();
                            }}
                            onNavigateStories={() => navigate('/learn')}
                        />
                    )}

                    {currentStep === 'vocab' && (
                        <VocabStep
                            unitId={unitId!}
                            unitStory={unitStory}
                            onComplete={() => {
                                markStepComplete('vocab');
                                handleStepAdvance();
                            }}
                            onNavigateReview={() => navigate('/review')}
                        />
                    )}

                    {currentStep === 'exercises' && unitExercises && unitExercises.length > 0 && (
                        <div className="space-y-6">
                            <StepHeader
                                icon={PenLine}
                                label={t('exercises.title')}
                                description="Pon a prueba lo que aprendiste en esta unidad."
                            />
                            <ExerciseRunner
                                key={exerciseAttempt}
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
        <div className="space-y-12">
            {/* Back button */}
            <BackButton onClick={() => navigate('/path')} label={t('common.back')} />

            {/* Unit title */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
            >
                <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider font-semibold">
                    {t('path.unit')} {unit.unitNumber}
                </p>
                <h1 className="text-3xl font-black tracking-tight leading-tight">{unit.title}</h1>
            </motion.div>

            {/* Step indicator (horizontal stepper) */}
            {currentStep !== 'completed' && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2"
                >
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const isCompleted = i < activeStepIdx;
                        const isCurrent = i === activeStepIdx;
                        const isUpcoming = i > activeStepIdx;

                        return (
                            <div key={step.key} className="flex items-center gap-2">
                                {/* Step dot/icon */}
                                <div
                                    className={`
                                        flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300
                                        ${isCompleted
                                            ? 'bg-[var(--color-success)]/20 text-[var(--color-success)] shadow-[0_2px_8px_color-mix(in_oklch,var(--color-success)_15%,transparent)]'
                                            : isCurrent
                                                ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-[var(--shadow-card)]'
                                                : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)]'
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
                                            h-[2px] w-5 sm:w-7 md:w-9 rounded-full transition-colors duration-300
                                            ${isCompleted ? 'bg-[var(--color-success)]/40' : 'bg-[var(--color-surface-container-highest)]'}
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
                <div className="hidden sm:flex items-center gap-2 -mt-4">
                    {STEPS.map((step, i) => {
                        const isCompleted = i < activeStepIdx;
                        const isCurrent = i === activeStepIdx;

                        return (
                            <div key={step.key} className="flex items-center gap-2">
                                <span
                                    className={`
                                        text-[10px] font-semibold w-9 text-center leading-tight
                                        ${isCompleted
                                            ? 'text-[var(--color-success)]'
                                            : isCurrent
                                                ? 'text-[var(--color-primary)]'
                                                : 'text-[var(--color-on-surface-muted)]'
                                        }
                                    `}
                                >
                                    {STEP_LABELS[step.key]}
                                </span>
                                {i < STEPS.length - 1 && (
                                    <div className="w-5 sm:w-7 md:w-9" />
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

/* ===== Checkpoint items ===== */

/** The unit's review-skill exercises in the shape the exercise runner expects. */
function skillCheckpointExercises(unitId: string): GrammarExercise[] {
    return getSkillsByUnit(unitId).flatMap(skill => skill.exercises.map((e, i): GrammarExercise => {
        const id = `${skill.id}-cp-${i}`;
        if (e.type === 'word-order') {
            return { id, unitId, type: 'word-order', question: 'Ordena para formar una oración:', correctAnswer: e.answer, scrambledWords: shuffle(e.answer.split(' ')), explanation: e.explanation };
        }
        // Skill fill-blanks come with options, so they are answered by choosing
        return { id, unitId, type: e.options ? 'multiple-choice' : 'fill-blank', question: e.prompt, correctAnswer: e.answer, options: e.options, explanation: e.explanation };
    }));
}

/* ===== Sub-components ===== */

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
        <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--color-primary)]/10 shadow-[var(--shadow-card)]">
                <Icon className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
                <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider font-semibold">
                    {label}
                </p>
                <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

/* -- Story Step -- */

function StoryStep({
    unitStories,
    onComplete,
    onNavigateStories,
}: {
    unitStories: Story[];
    onComplete: () => void;
    onNavigateStories: () => void;
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    // Same query as the story list, so the lesson and Learn agree on what was read
    const { data: readStories } = useQuery({
        queryKey: ['readStories', user?.id],
        queryFn: async () => {
            const { data } = await supabase.from('read_stories').select('*');
            return (data ?? []) as ReadStoryRow[];
        },
        enabled: !!user?.id,
    });
    const isRead = (id: string) => !!readStories?.some(r => r.story_id === id);
    const nextUnread = unitStories.find(s => !isRead(s.id));
    // Until the read stories load, the button can't know which story comes next
    const loadingRead = !!user?.id && readStories === undefined;
    // The story sends the learner back to this step once it is completed
    const readStory = (story: Story) => navigate(`/learn/${story.id}`, { state: { returnTo: location.pathname } });

    return (
        <div className="space-y-6">
            <StepHeader
                icon={BookOpen}
                label="Historia"
                description="Lee una historia para practicar la gramatica de esta unidad."
            />

            <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-8 space-y-7 shadow-[var(--shadow-card)]">
                {unitStories.length > 0 ? (
                    <>
                        <p className="text-[var(--color-on-surface-muted)] text-sm leading-relaxed">
                            {t('unitFlow.storiesIntro', { count: unitStories.length })}
                        </p>
                        <div className="space-y-3">
                            {unitStories.map(story => (
                                <button
                                    key={story.id}
                                    onClick={() => readStory(story)}
                                    className="w-full bg-[var(--color-surface-container)] rounded-2xl p-5 flex items-center justify-between hover:bg-[var(--color-surface-container-highest)] hover:shadow-[var(--shadow-card)] transition-all duration-300 group"
                                >
                                    <div className="flex flex-wrap items-center gap-3 text-left">
                                        <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
                                        <span className="font-bold text-sm group-hover:text-[var(--color-primary)] transition-colors">
                                            {story.title}
                                        </span>
                                        {isRead(story.id) && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-container)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-primary)]">
                                                <Check className="h-3 w-3" aria-hidden="true" /> {t('unitFlow.storyRead')}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronRight className="w-4 h-4 shrink-0 text-[var(--color-on-surface-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 transition-all" />
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-[var(--color-on-surface-muted)] text-sm leading-relaxed">
                            No hay una historia asignada a esta unidad. Puedes explorar las historias disponibles o saltar este paso.
                        </p>
                        <button
                            onClick={onNavigateStories}
                            className="w-full bg-[var(--color-surface-container)] rounded-2xl p-5 flex items-center justify-between hover:bg-[var(--color-surface-container-highest)] hover:shadow-[var(--shadow-card)] transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
                                <span className="font-bold text-sm group-hover:text-[var(--color-primary)] transition-colors">
                                    Explorar historias
                                </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[var(--color-on-surface-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 transition-all" />
                        </button>
                    </>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {/* With stories, the step is done once all of them are read (and their words marked) */}
                    <button
                        onClick={nextUnread ? () => readStory(nextUnread) : onComplete}
                        disabled={loadingRead && unitStories.length > 0}
                        className="flex-1 bg-[var(--color-primary)] text-[var(--color-on-primary)] py-4 rounded-full font-black text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none"
                    >
                        {!unitStories.length ? t('unitFlow.skipForNow') : nextUnread ? t('unitFlow.readNextStory', { title: nextUnread.title }) : t('unitFlow.continue')}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* -- Vocab Step -- */

function extractKeywords(html: string): string[] {
    const regex = /data-word="([^"]+)"/g;
    const seen = new Set<string>();
    let match;
    while ((match = regex.exec(html)) !== null) {
        seen.add(match[1]);
    }
    return Array.from(seen);
}

/**
 * The unit's deck: its key words first (the ones its stories keep using), then the rest.
 * A unit without key words shows its whole deck.
 */
function VocabStep({
    unitId,
    unitStory,
    onComplete,
    onNavigateReview,
}: {
    unitId: string;
    unitStory: Story | null;
    onComplete: () => void;
    onNavigateReview: () => void;
}) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { saveStoryWords } = useCards();
    const keyWords = useMemo(() => new Set(unitKeyWords[unitId] ?? []), [unitId]);
    const vocabItems = useMemo(() => {
        const deck = allVocabulary.filter(v => v.unitId === unitId);
        if (deck.length) return [...deck.filter(v => keyWords.has(v.id)), ...deck.filter(v => !keyWords.has(v.id))];
        if (!unitStory) return [];
        const keywords = extractKeywords(unitStory.content);
        // One card per word, even when the story links it by an old id too
        return [...new Map([...getVocabMap(keywords).values()].map(v => [v.id, v])).values()];
    }, [unitId, unitStory, keyWords]);
    const isDeck = vocabItems.some(v => v.unitId === unitId);

    // Which of these words the learner already has in the review deck (or marked as known)
    const ids = useMemo(() => vocabItems.flatMap(v => savedIdsOf(v.id)), [vocabItems]);
    const qc = useQueryClient();
    const { data: saved } = useQuery({
        queryKey: ['unitWordsSaved', unitId, user?.id],
        queryFn: async () => {
            const [cards, known] = await Promise.all([
                supabase.from('cards').select('word_id').in('word_id', ids),
                supabase.from('known_words').select('word_id').in('word_id', ids),
            ]);
            // Offline or failing, the query errs and keeps its cached answer instead of "nothing saved"
            if (cards.error) throw cards.error;
            if (known.error) throw known.error;
            const current = (rows: { word_id: string }[]) => new Set(rows.map(r => vocabularyAliases[r.word_id] ?? r.word_id));
            return { inDeck: current(cards.data ?? []), known: current(known.data ?? []) };
        },
        enabled: !!user?.id && isDeck,
    });
    const isSaved = (id: string) => !!saved && (saved.inDeck.has(id) || saved.known.has(id));
    const unsaved = saved ? vocabItems.filter(v => !isSaved(v.id)) : [];
    const [adding, setAdding] = useState(false);
    const addToReview = async () => {
        setAdding(true);
        try {
            const ids = unsaved.map(v => v.id);
            await saveStoryWords(unitId, ids, [], { countLearned: false });
            // Shown as added at once: offline the refetch fails and would keep offering them again
            qc.setQueryData<typeof saved>(['unitWordsSaved', unitId, user?.id], prev => prev && { ...prev, inDeck: new Set([...prev.inDeck, ...ids]) });
            toast.success({ title: t('unitFlow.wordsAdded', { count: unsaved.length }) });
        } catch {
            toast.error({ title: t('unitFlow.wordsAddFailed') });
        } finally {
            setAdding(false);
        }
    };

    const [showAll, setShowAll] = useState(false);
    // Key words first; a unit whose stories don't set key words yet shows its whole deck
    const keyOnly = isDeck && !showAll && keyWords.size > 0;
    const visible = keyOnly ? vocabItems.filter(v => keyWords.has(v.id)) : vocabItems;
    const [flipped, setFlipped] = useState<Set<string>>(new Set());

    const toggleFlip = (id: string) => {
        setFlipped(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className="space-y-6">
            <StepHeader
                icon={RefreshCw}
                label="Vocabulario"
                description={isDeck
                    ? t('unitFlow.deckDescription', { count: vocabItems.length })
                    : unitStory
                        ? t('unitFlow.storyWordsDescription', { title: unitStory.title })
                        : t('unitFlow.reviewWordsDescription')
                }
            />

            <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-7 space-y-6 shadow-[var(--shadow-card)]">
                {vocabItems.length > 0 ? (
                    <>
                        <p className="text-[var(--color-on-surface-muted)] text-sm leading-relaxed">
                            {isDeck ? t(keyOnly ? 'unitFlow.deckKeyHint' : 'unitFlow.deckAllHint', { count: visible.length }) : t('unitFlow.tapCardHint')}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {visible.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => toggleFlip(v.id)}
                                    aria-pressed={flipped.has(v.id)}
                                    className={`
                                        relative rounded-2xl p-4 text-left transition-all duration-300 min-h-[72px]
                                        ${flipped.has(v.id)
                                            ? 'bg-[var(--color-primary)]/10 shadow-[var(--shadow-card)]'
                                            : 'bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)] hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5'
                                        }
                                    `}
                                >
                                    {!flipped.has(v.id) ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-sm text-[var(--color-on-surface)]">{v.id}</span>
                                            {v.phonetic && (
                                                <span className="text-[10px] text-[var(--color-on-surface-muted)]">{v.phonetic}</span>
                                            )}
                                            {(saved?.inDeck.has(v.id) || saved?.known.has(v.id)) && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)]">
                                                    <Check className="h-3 w-3" aria-hidden="true" /> {t(saved.inDeck.has(v.id) ? 'unitFlow.inReview' : 'unitFlow.alreadyKnown')}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-xs text-[var(--color-primary)]">{v.translations.join(', ')}</span>
                                            <span lang="en" className="text-[10px] text-[var(--color-on-surface-muted)] italic leading-tight">
                                                {v.examples[0]}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        {isDeck && vocabItems.length > visible.length && (
                            <button
                                onClick={() => setShowAll(true)}
                                className="w-full rounded-full py-3 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-container)] transition-colors"
                            >
                                {t('unitFlow.deckShowAll', { count: vocabItems.length })}
                            </button>
                        )}
                        {isDeck && saved && (
                            <button
                                onClick={addToReview}
                                disabled={!unsaved.length || adding}
                                className="w-full bg-[var(--color-surface-container)] rounded-2xl p-5 flex items-center justify-center gap-2 font-bold text-sm hover:bg-[var(--color-surface-container-highest)] transition-colors disabled:opacity-60 disabled:pointer-events-none"
                            >
                                <Check className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
                                {unsaved.length ? t('unitFlow.addWords', { count: unsaved.length }) : t('unitFlow.allWordsInReview')}
                            </button>
                        )}
                    </>
                ) : (
                    <p className="text-[var(--color-on-surface-muted)] text-sm leading-relaxed">
                        Practica las tarjetas de vocabulario que has acumulado. Este paso es flexible y puedes continuar cuando quieras.
                    </p>
                )}

                <button
                    onClick={onNavigateReview}
                    className="w-full bg-[var(--color-surface-container)] rounded-2xl p-5 flex items-center justify-between hover:bg-[var(--color-surface-container-highest)] hover:shadow-[var(--shadow-card)] transition-all duration-300 group"
                >
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-accent-blue" />
                        <span className="font-bold text-sm group-hover:text-[var(--color-primary)] transition-colors">
                            Ir a repasar tarjetas
                        </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-on-surface-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                    onClick={onComplete}
                    className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)] py-4 rounded-full font-black text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97]"
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
        <div className="space-y-6">
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
                    <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-10 w-full max-w-sm text-center space-y-6 shadow-[var(--shadow-float)]">
                        <div className="space-y-3">
                            <p className="text-5xl font-black tracking-tight text-[var(--color-error)]">
                                {lastScore}%
                            </p>
                            <p className="text-[var(--color-on-surface-muted)] text-sm leading-relaxed">
                                Necesitas al menos 80% para aprobar. Repasa el material y vuelve a intentarlo.
                            </p>
                        </div>

                        <button
                            onClick={handleRetry}
                            className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)] py-4 rounded-full font-black transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97] flex items-center justify-center gap-2"
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
        <div className="space-y-6">
            <StepHeader icon={Icon} label={title} description={description} />
            <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-8 text-center space-y-6 shadow-[var(--shadow-card)]">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-container)] flex items-center justify-center mx-auto">
                    <Icon className="w-8 h-8 text-[var(--color-on-surface-muted)]" />
                </div>
                <p className="text-[var(--color-on-surface-muted)] text-sm">{description}</p>
                <button
                    onClick={onAction}
                    className="bg-[var(--color-primary)] text-[var(--color-on-primary)] py-3.5 px-8 rounded-full font-black text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97]"
                >
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}
