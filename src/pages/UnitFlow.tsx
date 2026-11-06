import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { ReadStoryRow } from '../lib/database.types';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RefreshCw, PenLine, Mic, Trophy, ChevronRight, Sparkles, Check } from 'lucide-react';
import type { GrammarExercise, GrammarSkill, Story, Vocabulary } from '../lib/db';
import { allUnits } from '../data/curriculum/units';
import { levelOfId, useLevelContent } from '../data/levels';
import { savedIdsOf, vocabularyAliases } from '../data/vocabulary/aliases';
import { prefetchVocabulary, useVocabulary } from '../data/vocabulary/load';
import { unitKeyWords } from '../data/vocabulary/keyWords';
import { useCards } from '../hooks/useCards';
import { shuffle } from '../lib/shuffle';
import { useUnitProgress, type UnitStep } from '../hooks/useUnitProgress';
import { useSkillCards } from '../hooks/useSkillCards';
import { useLevelUnitProgress } from '../hooks/useLevelUnitProgress';
import PlantCircle from '../components/garden/PlantCircle';
import { useGardenPlant } from '../hooks/useGardenPlant';
import { notice } from '../lib/notice';
import GrammarCard from '../components/GrammarCard';
import ExerciseRunner from '../components/exercises/ExerciseRunner';
import OutputStep from '../components/OutputStep';
import LevelAssessment from './LevelAssessment';
import BackButton from '../components/ui/BackButton';
import PageHead from '../components/ui/PageHead';
import LevelBadge from '../components/ui/LevelBadge';
import { useNoteContext } from '../components/notebook/NotebookContext';
import RetryReview from '../components/RetryReview';
import { useSessionState } from '../hooks/useSessionState';
import { comprehensionExercises, examplePairs } from '../lib/comprehension';
import SpeakButton from '../components/ui/SpeakButton';
import { speakEnglish } from '../lib/speakEnglish';
import { soundsLike } from '../lib/soundsLike';
import { PASS_SCORE, fromExercises, retryVerdict, shortReview, type ReviewItem } from '../lib/retryPolicy';

/* ===== Step metadata ===== */

const STEPS: { key: UnitStep; icon: typeof BookOpen }[] = [
    { key: 'grammar', icon: BookOpen },
    { key: 'story', icon: BookOpen },
    { key: 'vocab', icon: RefreshCw },
    { key: 'exercises', icon: PenLine },
    { key: 'output', icon: Mic },
    { key: 'checkpoint', icon: Trophy },
];

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

function CelebrationCard({ onBack, note }: { onBack: () => void; note?: string }) {
    const { species } = useGardenPlant();

    // Unit complete is one of the three achievement moments: the unit's plant grows
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-16"
        >
            <div role="status" className="app-specimen">
                <PlantCircle species={species} size="lg" height={44} delay={200} />

                <div className="space-y-2">
                    <h2 className="app-h2">
                        ¡Unidad completada!
                    </h2>
                    <p className="text-[var(--color-on-surface-muted)] text-sm leading-relaxed">
                        Tu planta creció. Sigue avanzando en tu ruta para llenar el jardín de este nivel.
                    </p>
                    {note && <p className="text-xs font-semibold text-[var(--color-tertiary-ink)]">{note}</p>}
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

    const unit = allUnits.find(u => u.id === unitId) ?? null;
    // Notes written here belong to the unit
    useNoteContext(unit && {
        key: `unit:${unit.id}`,
        label: `${t('path.unit')} ${unit.unitNumber} · ${unit.title}`,
        path: `/path/${unit.id}`,
    });
    // Only this unit's level is downloaded (src/data/levels), with its deck from the start
    const content = useLevelContent(levelOfId(unitId));
    useEffect(() => prefetchVocabulary(levelOfId(unitId)), [unitId]);
    // The end-of-level exam waits for the speaking parts left for later in this level
    const level = useLevelUnitProgress(unit?.level ?? levelOfId(unitId) ?? 'A1');
    const { pendingSpeaking } = level;
    // Just finished here: the celebration comes before the speaking left for later
    const [justFinished, setJustFinished] = useState(false);
    const unitStories = useMemo(() => content?.stories.filter(s => s.unitId === unitId) ?? [], [content, unitId]);
    const unitStory = unitStories[0] ?? null;
    // One array per unit: a new one on every render would reshuffle the checkpoint below
    const unitExercises = useMemo(() => content?.exercises.filter(e => e.unitId === unitId) ?? ([] as GrammarExercise[]), [content, unitId]);
    // What the grammar card's examples mean and how they sound: questions answered by understanding,
    // not by copying the pattern of the card
    const unitPairs = useMemo(() => examplePairs(content?.grammarCards.find(c => c.unitId === unitId)), [content, unitId]);
    const practiceExercises = useMemo(
        () => [...unitExercises, ...comprehensionExercises(unitPairs, `${unitId}-practice`, { meaning: 1, listen: 1 })],
        [unitExercises, unitPairs, unitId],
    );

    // Track animation direction
    const [direction, setDirection] = useState(1);
    const [checkpointKey, setCheckpointKey] = useState(0);

    // Checkpoint exercise subset — must be above early returns to satisfy Rules of Hooks
    // The checkpoint checks the unit with items the learner has not just answered: the unit's
    // review-skill exercises. Units without skills fall back to their own exercises.
    const checkpointExercises = useMemo(() => {
        const fresh = unitId && content ? skillCheckpointExercises(unitId, content.skills) : [];
        const pool = fresh.length >= 5 ? fresh : unitExercises ?? [];
        const understanding = comprehensionExercises(unitPairs, `${unitId}-checkpoint`, { meaning: 1, listen: 1 });
        return shuffle([...shuffle(pool).slice(0, Math.min(5, pool.length)), ...understanding]);
    }, [unitId, unitExercises, unitPairs, content, checkpointKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Loading state: the progress, or the content of a lesson unit's level
    if (isLoading || (unit && !unit.isAssessment && !content)) {
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

    // The exam waits until the level's progress is known: a failed read never opens it
    if (unit.isAssessment && (level.isLoading || level.isError)) {
        return (
            <div className="space-y-6">
                <BackButton onClick={() => navigate('/path')} label={t('common.back')} />
                {level.isError
                    ? <p className="text-sm text-[var(--color-on-surface-muted)]">{t('unitFlow.progressError')}</p>
                    : <div className="text-[var(--color-on-surface-muted)] text-sm">{t('common.loading')}</div>}
            </div>
        );
    }

    // Assessment unit with speaking still pending in the level: those units first
    if (unit.isAssessment && pendingSpeaking.length > 0) {
        return (
            <div className="space-y-6">
                <BackButton onClick={() => navigate('/path')} label={t('common.back')} />
                <div className="app-sheet p-6 md:p-8 space-y-5">
                    <div className="space-y-2">
                        <h2 className="text-xl font-black tracking-tight">{t('unitFlow.pendingTitle', { count: pendingSpeaking.length })}</h2>
                        <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{t('unitFlow.pendingBody')}</p>
                    </div>
                    <ul className="space-y-3">
                        {pendingSpeaking.map(u => (
                            <li key={u.id}>
                                <button
                                    onClick={() => navigate(`/path/${u.id}`)}
                                    className="w-full flex items-center justify-between gap-3 rounded-xl bg-[var(--color-surface-container-low)] px-4 py-3 text-left hover:bg-[var(--color-surface-container)] transition-colors"
                                >
                                    <span className="min-w-0">
                                        <span className="block text-xs font-bold text-[var(--color-on-surface-muted)]">{t('path.unit')} {u.unitNumber}</span>
                                        <span className="block text-sm font-bold truncate">{u.title}</span>
                                    </span>
                                    <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-tertiary-ink)]">
                                        <Mic className="w-4 h-4" aria-hidden="true" />{t('path.speakingPending')}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
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

    // Reached once the exercises pass, or after the second try when the learner goes on anyway
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
            setJustFinished(true);
            await updateProgress({
                checkpoint_passed: true,
                completed_at: new Date().toISOString(),
            });

            // Create grammar skill cards for spaced repetition
            await addSkillCards(unitId!);

            handleStepAdvance();
        }
        // If failed, user gets retry button — no automatic progress
    };

    /* -- Render current step content -- */

    const renderStepContent = () => {
        // A finished unit with its speaking left for later opens on that speaking
        if (currentStep === 'completed' && progress?.speaking_pending && !justFinished) {
            return (
                <OutputStep
                    unitId={unitId!}
                    level={unit.level}
                    speakingOnly
                    speakingPending
                    onSpeakingDone={() => updateProgress({ speaking_pending: false })}
                    onComplete={() => navigate('/path')}
                />
            );
        }
        if (currentStep === 'completed' && progress?.speaking_pending) {
            return <CelebrationCard onBack={() => navigate('/path', { state: { grew: unitId } })} note={t('unitFlow.speakingStillPending')} />;
        }
        if (currentStep === 'completed') {
            return <CelebrationCard onBack={() => navigate('/path', { state: { grew: unitId } })} />;
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
                            <ExercisesStep
                                unitId={unitId!}
                                exercises={practiceExercises}
                                onComplete={handleExercisesComplete}
                            />
                        </div>
                    )}

                    {currentStep === 'exercises' && (!unitExercises || unitExercises.length === 0) && (
                        <EmptyStepCard
                            icon={PenLine}
                            title={t('exercises.title')}
                            description="No hay ejercicios disponibles para esta unidad todavía."
                            actionLabel="Saltar"
                            onAction={async () => {
                                setJustFinished(true);
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
                            speakingPending={!!progress?.speaking_pending}
                            onSpeakingPending={() => updateProgress({ speaking_pending: true })}
                            onSpeakingDone={() => updateProgress({ speaking_pending: false })}
                            onComplete={handleOutputComplete}
                        />
                    )}

                    {currentStep === 'checkpoint' && checkpointExercises.length > 0 && (
                        <CheckpointStep
                            unitId={unitId!}
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
            <BackButton onClick={() => navigate('/path')} label={t('common.back')} />

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
            >
                <PageHead
                    title={unit.title}
                    meta={[
                        `${t('path.unit')} ${unit.unitNumber}`,
                        unit.grammarTopic,
                        <LevelBadge key="level" level={unit.level} size="compact" withStage />,
                    ]}
                />

                {/* The unit's stem: one leaf per step, the current one named */}
                {currentStep !== 'completed' && (
                    <ol className="unit-stem" aria-label={t('unitFlow.stepsLabel')}>
                        {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const state = i < activeStepIdx ? 'is-done' : i === activeStepIdx ? 'is-current' : '';
                            return (
                                <li key={step.key} className={state} aria-current={i === activeStepIdx ? 'step' : undefined}>
                                    <span className="unit-stem-mark" aria-hidden="true">
                                        {i < activeStepIdx ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                                    </span>
                                    <span className="unit-stem-label">{t(`pathView.steps.${step.key}`)}</span>
                                </li>
                            );
                        })}
                    </ol>
                )}
                {currentStep !== 'completed' && (
                    <p className="unit-stem-caption" aria-hidden="true">
                        {t('unitFlow.stepOf', { n: activeStepIdx + 1, total: STEPS.length })} · {t(`pathView.steps.${STEPS[activeStepIdx]?.key}`)}
                    </p>
                )}
            </motion.div>

            {/* Step content */}
            <div className="min-h-[300px]">
                {renderStepContent()}
            </div>
        </div>
    );
}

/* ===== Checkpoint items ===== */

/** The unit's review-skill exercises in the shape the exercise runner expects. */
function skillCheckpointExercises(unitId: string, skills: GrammarSkill[]): GrammarExercise[] {
    return skills.filter(s => s.unitId === unitId).flatMap(skill => skill.exercises.map((e, i): GrammarExercise => {
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
        <div className="unit-step-head">
            <span className="unit-step-icon" aria-hidden="true">
                <Icon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
                <h2 className="app-h3">{label}</h2>
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
                description="Lee una historia para practicar la gramática de esta unidad."
            />

            <div className="app-sheet p-8 space-y-7">
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
                        className="btn-primary flex-1 py-4 text-sm disabled:opacity-60 disabled:pointer-events-none"
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
    // The unit's deck, and the decks of its story's words for a unit without a deck of its own
    const storyKeywords = useMemo(() => (unitStory ? extractKeywords(unitStory.content) : []), [unitStory]);
    const unitLevel = levelOfId(unitId);
    const vocabulary = useVocabulary(storyKeywords, unitLevel ? [unitLevel] : []);
    const vocabItems = useMemo(() => {
        if (!vocabulary) return [];
        const deck = vocabulary.unitDeck(unitId);
        if (deck.length) return [...deck.filter(v => keyWords.has(v.id)), ...deck.filter(v => !keyWords.has(v.id))];
        // One card per word, even when the story links it by an old id too
        return [...new Map([...vocabulary.map(storyKeywords).values()].map(v => [v.id, v])).values()];
    }, [unitId, storyKeywords, keyWords, vocabulary]);
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
        } catch {
            notice.error({ title: t('unitFlow.wordsAddFailed') });
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

    if (!vocabulary) {
        return <div className="flex items-center justify-center py-20 text-sm text-[var(--color-on-surface-muted)]">{t('common.loading')}</div>;
    }

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

            <div className="app-sheet p-7 space-y-6">
                {vocabItems.length > 0 ? (
                    <>
                        <p className="text-[var(--color-on-surface-muted)] text-sm leading-relaxed">
                            {isDeck ? t(keyOnly ? 'unitFlow.deckKeyHint' : 'unitFlow.deckAllHint', { count: visible.length }) : t('unitFlow.tapCardHint')}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {visible.map(v => (
                                <div key={v.id} className="relative">
                                    <button
                                        onClick={() => { if (!flipped.has(v.id)) speakEnglish(v.id); toggleFlip(v.id); }}
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
                                                <span className="font-bold text-sm text-[var(--color-on-surface)] pr-8">{v.id}</span>
                                                {v.phonetic && (
                                                    <span className="text-[10px] text-[var(--color-on-surface-muted)]">{v.phonetic}</span>
                                                )}
                                                {v.cefrLevel === 'A1' && v.phonetic && (
                                                    <span className="sounds-like">≈ <b>{soundsLike(v.phonetic)}</b></span>
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
                                    <SpeakButton text={v.id} className="absolute top-2 right-2 !w-8 !h-8" />
                                </div>
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
                    className="btn-primary w-full py-4 text-sm"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}

/* -- Exercises Step -- */

interface Review { score: number; items: ReviewItem[]; canContinue: boolean }

/**
 * The unit's exercises. Under the pass mark a short review of what failed comes first, then the set
 * again in another order; after the second try the learner may go on with their best score.
 */
function ExercisesStep({
    unitId,
    exercises,
    onComplete,
}: {
    unitId: string;
    exercises: GrammarExercise[];
    onComplete: (score: number) => void;
}) {
    // The tries survive a reload: reloading neither resets the count nor the best score
    const [tries, setTries, forgetTries] = useSessionState(`voxie-tries:${unitId}:exercises`, { attempt: 1, best: 0 });
    const { attempt } = tries;
    const [review, setReview] = useState<Review | null>(null);
    const round = useMemo(() => (attempt === 1 ? exercises : shuffle(exercises)), [attempt, exercises]);

    const finish = (score: number) => {
        forgetTries();
        onComplete(score);
    };

    const handleComplete = (score: number, missed: GrammarExercise[] = []) => {
        setTries(t => ({ ...t, best: Math.max(t.best, score) }));
        const verdict = retryVerdict('exercises', score, attempt);
        if (verdict === 'pass') {
            finish(score);
            return;
        }
        setReview({ score, items: shortReview(fromExercises(missed)), canContinue: verdict === 'may-continue' });
    };

    if (review) {
        return (
            <RetryReview
                part="exercises"
                unitId={unitId}
                score={review.score}
                items={review.items}
                canContinue={review.canContinue}
                onRetry={() => { setReview(null); setTries(t => ({ ...t, attempt: t.attempt + 1 })); }}
                onContinue={() => finish(Math.max(tries.best, review.score))}
            />
        );
    }
    return <ExerciseRunner key={attempt} exercises={round} passScore={PASS_SCORE.exercises} onComplete={handleComplete} />;
}

/* -- Checkpoint Step -- */

function CheckpointStep({
    unitId,
    exercises,
    onComplete,
    onRetry,
}: {
    unitId: string;
    exercises: GrammarExercise[];
    onComplete: (score: number) => void;
    onRetry: () => void;
}) {
    const { t } = useTranslation();
    const [review, setReview] = useState<Review | null>(null);

    // The checkpoint is the unit's exam: under its mark it always asks again, after the review
    const handleComplete = (score: number, missed: GrammarExercise[] = []) => {
        if (retryVerdict('checkpoint', score, 1) === 'pass') {
            onComplete(score);
            return;
        }
        setReview({ score, items: shortReview(fromExercises(missed)), canContinue: false });
    };

    const handleRetry = () => {
        setReview(null);
        onRetry();
    };

    return (
        <div className="space-y-6">
            <StepHeader
                icon={Trophy}
                label={t('unitFlow.checkpointTitle')}
                description={t('unitFlow.checkpointLead', { pass: PASS_SCORE.checkpoint })}
            />

            {review ? (
                <RetryReview
                    part="checkpoint"
                    unitId={unitId}
                    score={review.score}
                    items={review.items}
                    canContinue={false}
                    onRetry={handleRetry}
                />
            ) : (
                <ExerciseRunner exercises={exercises} passScore={PASS_SCORE.checkpoint} onComplete={handleComplete} />
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
            <div className="app-sheet p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-container)] flex items-center justify-center mx-auto">
                    <Icon className="w-8 h-8 text-[var(--color-on-surface-muted)]" />
                </div>
                <p className="text-[var(--color-on-surface-muted)] text-sm">{description}</p>
                <button
                    onClick={onAction}
                    className="btn-primary py-3.5 px-8 text-sm"
                >
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}
