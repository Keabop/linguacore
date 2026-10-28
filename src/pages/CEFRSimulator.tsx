import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Compass, Shield, Award, Sparkles, Play, Volume2, Edit3, Activity, ChevronRight, CheckCircle, Crown, Calendar, AlertCircle, Timer, Check } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTier } from '../hooks/useTier';
import { supabase } from '../lib/supabase';
import { playAudioFile, playDialogueSpeech, stopDialogueSpeech } from '../lib/assessmentSpeech';
import { chooseStage, endsRouter, pageEnd, pageStart, visibleQuestions, type StageChoice } from '../lib/exam/adaptive';
import { buildReport, type ExamReport } from '../lib/exam/report';
import { PLACEMENT, answeredWhenTimeIsUp, nextPlacementBlock } from '../lib/exam/placement';
import { isMultipleChoice, type DiscussionPost, type ExamResponse, type ExamWritingTask } from '../lib/exam/types';
import QuestionView from '../components/exam/QuestionView';
import TaskChoice from '../components/exam/TaskChoice';
import TaskChart from '../components/exam/TaskChart';
import PassageView from '../components/exam/PassageView';
import { shuffleQuestion } from '../lib/shuffle';
import { placementBlocks } from '../data/assessments/placement';
import type { AssessmentQuestion } from '../lib/exam/types';
import { cambridgeB1Questions, cambridgeB1Writing, cambridgeB1Speaking } from '../data/assessments/cambridge/b1';
import { cambridgeB2Questions, cambridgeB2Writing, cambridgeB2Speaking } from '../data/assessments/cambridge/b2';
import { toeflQuestions, toeflWriting, toeflSpeaking } from '../data/assessments/toefl-questions';
import { ieltsQuestions, ieltsWriting, ieltsSpeaking } from '../data/assessments/ielts-questions';
import { useSpeech } from '../hooks/useSpeech';
import { evaluateWriting, evaluateSpeaking, type CriterionScore } from '../lib/ai';
import { toast } from '../lib/toast';

type PageState = 'selection' | 'instructions' | 'testing' | 'writing' | 'speaking' | 'grading' | 'dashboard';

interface TestPreset {
    id: 'placement' | 'toefl' | 'ielts' | 'cambridge_b1' | 'cambridge_b2';
    isPro: boolean;
    durationMinutes: number;
    /** Times each recording can be played, as in the real exam (IELTS and TOEFL: once). */
    audioPlays: number;
    /** TOEFL: a recording's questions appear once it has been heard, as in the exam. */
    questionsAfterAudio?: boolean;
}

const presets: TestPreset[] = [
    {
        id: 'placement',
        isPro: false,
        // 30 to 40 adaptive items, listening included
        durationMinutes: 40,
        audioPlays: 2
    },
    {
        id: 'toefl',
        isPro: true,
        // About the real test's 85 minutes with fewer items: Reading 22, Listening 27, Writing 12, Speaking 11
        durationMinutes: 75,
        audioPlays: 1,
        questionsAfterAudio: true
    },
    {
        id: 'ielts',
        isPro: true,
        // Listening 30 + Reading 60 + Writing 60 + Speaking ~12
        durationMinutes: 162,
        audioPlays: 1
    },
    {
        id: 'cambridge_b1',
        isPro: true,
        // Reading 45 + Writing 45 + Listening ~30 + Speaking ~12
        durationMinutes: 132,
        audioPlays: 2
    },
    {
        id: 'cambridge_b2',
        isPro: true,
        // Reading and Use of English 75 + Writing 80 + Listening ~40 + Speaking ~14
        durationMinutes: 209,
        audioPlays: 2
    }
];

/**
 * Everything a writing task shows, as text for the AI evaluator: the email's points and the
 * discussion posts are part of the task, so relevance can only be judged with them.
 */
function writingBrief(task: ExamWritingTask, choiceId?: string): string {
    const points = task.points?.map(point => `- ${point}`).join('\n');
    const posts = task.discussion?.map(post => `${post.author} (${post.role}): ${post.text}`).join('\n');
    const choice = task.choices?.find(c => c.id === choiceId);
    // No choice made (the time ran out): the AI sees every task offered and judges against the one written
    const offered = !choice && task.choices?.map(c => `- ${c.label}: ${c.prompt}`).join('\n');
    return [task.prompt, points, posts && `Discussion so far:\n${posts}`, choice && `Chosen task (${choice.label}): ${choice.prompt}`, offered && `Tasks offered:\n${offered}`]
        .filter(Boolean).join('\n');
}


/** The exam's official criteria as the AI banded them (0 to 5), each with its note. */
function CriteriaGrid({ criteria }: { criteria: CriterionScore[] }) {
    return (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {criteria.map(c => (
                <div key={c.name} className="rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] p-4">
                    <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-xs font-bold text-[var(--color-on-surface-muted)]">{c.name}</dt>
                        <dd className="font-mono text-lg font-bold text-[var(--color-on-surface)]">{c.band}/5</dd>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-on-surface-muted)]">{c.note}</p>
                </div>
            ))}
        </dl>
    );
}

/** Options in a new order for each attempt, except where the exam lists them in a fixed order. */
const withShuffledOptions = (q: AssessmentQuestion) => (isMultipleChoice(q) && !q.fixedOrder ? shuffleQuestion(q) : q);

// Leaf colour of each result level: the garden's growth stages, and C1–C2 in full flower
const LEVEL_COLOR: Record<ExamReport['level'], string> = {
    A1: 'var(--color-level-a1)',
    A2: 'var(--color-level-a2)',
    B1: 'var(--color-level-b1)',
    B2: 'var(--color-level-b2)',
    C1: 'var(--color-level-b2)',
    C2: 'var(--color-level-b2)',
};


export default function CEFRSimulator() {
    const { t } = useTranslation();
    const presetTitle = (preset: TestPreset) => t(`simulator.presets.${preset.id}.title`);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isPro, isFree } = useTier();

    const [state, setState] = useState<PageState>('selection');
    const [selectedPreset, setSelectedPreset] = useState<TestPreset | null>(null);
    const [lastAttemptDate, setLastAttemptDate] = useState<string | null>(null);

    // Test execution states
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, ExamResponse>>({});
    // Adaptive sections: which second stage each one got after its router questions
    const [stageChoice, setStageChoice] = useState<StageChoice>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimeUp, setIsTimeUp] = useState(false);

    // Speech and multi-task states
    const { isListening, transcript, startListening, stopListening, speak: speakPrompt, cancelSpeech, isSpeaking, synthesisSupported } = useSpeech();
    const [activeWritingIdx, setActiveWritingIdx] = useState(0);
    const [writingPromptsList, setWritingPromptsList] = useState<any[]>([]);
    const [writingAnswers, setWritingAnswers] = useState<Record<string, string>>({});
    // Cambridge Part 2: the task the learner chose, per writing task
    const [writingChoices, setWritingChoices] = useState<Record<string, string>>({});
    const [speakingPrompts, setSpeakingPrompts] = useState<any[]>([]);
    const [speakingAnswers, setSpeakingAnswers] = useState<Record<string, string>>({});
    const [activeSpeakingIdx, setActiveSpeakingIdx] = useState(0);
    const [speakingResults, setSpeakingResults] = useState<any | null>(null);
    // Listen and Repeat sentences already played (each is heard once)
    const [heardPrompts, setHeardPrompts] = useState<Record<string, boolean>>({});
    // The sentence asked to play; it only counts as heard once the voice actually starts
    const [pendingRepeat, setPendingRepeat] = useState<string | null>(null);
    const recordButtonRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (!isSpeaking || !pendingRepeat) return;
        setHeardPrompts(prev => ({ ...prev, [pendingRepeat]: true }));
        setPendingRepeat(null);
        // The speaker button turns disabled: keyboard focus goes on to recording
        recordButtonRef.current?.focus();
    }, [isSpeaking, pendingRepeat]);

    // Modal state variables
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [limitDaysRemaining, setLimitDaysRemaining] = useState(0);

    // Dialogue listening states
    const [audioPlayCount, setAudioPlayCount] = useState<Record<string, number>>({});
    // Recordings the browser couldn't play at all
    const [audioFailed, setAudioFailed] = useState<Record<string, boolean>>({});
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [activeDialogueLine, setActiveDialogueLine] = useState<number | null>(null);

    // Final result dashboard states
    const [results, setResults] = useState<{
        testType: string;
        report: ExamReport;
        writingFeedback?: any;
        speakingFeedback?: any;
    } | null>(null);

    const timerRef = useRef<any>(null);

    // Check weekly limit for free users
    useEffect(() => {
        if (!user) return;
        const fetchLimits = async () => {
            const { data } = await supabase
                .from('cefr_simulations' as any)
                .select('attempted_at')
                .eq('user_id', user.id)
                .order('attempted_at', { ascending: false })
                .limit(1) as any;
            if (data && data.length > 0) {
                setLastAttemptDate(data[0].attempted_at);
            }
        };
        fetchLimits();
    }, [user, state]);

    // Timer: the interval only counts down. Running out is handled below with the latest
    // state (answers, stages, writing), not the values captured when the interval started.
    useEffect(() => {
        if (state === 'testing' || state === 'writing' || state === 'speaking') {
            timerRef.current = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state]);

    const finishRef = useRef<() => void>(() => {});
    useEffect(() => {
        const active = state === 'testing' || state === 'writing' || state === 'speaking';
        if (!active || timeLeft > 0 || isTimeUp) return;
        setIsTimeUp(true);
        toast.error({
            title: t('simulator.timeUpTitle'),
            description: t('simulator.timeUpBody')
        });
        finishRef.current();
    }, [timeLeft, state, isTimeUp]);

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleSelectPreset = (preset: TestPreset) => {
        if (preset.isPro && isFree) {
            setShowUpgradeModal(true);
            return;
        }

        // Free tier weekly placement check
        if (isFree && preset.id === 'placement' && lastAttemptDate) {
            const lastDate = new Date(lastAttemptDate);
            const oneWeekLater = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (new Date() < oneWeekLater) {
                const diffTime = Math.abs(oneWeekLater.getTime() - new Date().getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setLimitDaysRemaining(diffDays);
                setShowLimitModal(true);
                return;
            }
        }

        setSelectedPreset(preset);
        setState('instructions');
    };

    const handleStartTest = () => {
        if (!selectedPreset) return;
        stopAudio();
        cancelSpeech();

        // 1. Prepare questions & prompts depending on the selected preset
        let selectedQuestions: AssessmentQuestion[] = [];
        let wPrompts: any[] = [];
        let sPrompts: any[] = [];

        if (selectedPreset.id === 'placement') {
            // Adaptive: the first block now, the next ones as each block is finished
            selectedQuestions = nextPlacementBlock(placementBlocks, [], {})!.questions;
        } else if (selectedPreset.id === 'toefl') {
            selectedQuestions = [...toeflQuestions];
            wPrompts = [...toeflWriting];
            sPrompts = [...toeflSpeaking];
        } else if (selectedPreset.id === 'ielts') {
            selectedQuestions = [...ieltsQuestions];
            wPrompts = [...ieltsWriting];
            sPrompts = [...ieltsSpeaking];
        } else if (selectedPreset.id === 'cambridge_b1') {
            selectedQuestions = [...cambridgeB1Questions];
            wPrompts = [...cambridgeB1Writing];
            sPrompts = [...cambridgeB1Speaking];
        } else if (selectedPreset.id === 'cambridge_b2') {
            selectedQuestions = [...cambridgeB2Questions];
            wPrompts = [...cambridgeB2Writing];
            sPrompts = [...cambridgeB2Speaking];
        }

        setQuestions(selectedQuestions.map(withShuffledOptions));
        setStageChoice({});
        setWritingPromptsList(wPrompts);
        setSpeakingPrompts(sPrompts);

        // 2. Initialize execution states
        setCurrentIdx(0);
        setAnswers({});
        setWritingAnswers({});
        setWritingChoices({});
        setSpeakingAnswers({});
        setActiveWritingIdx(0);
        setActiveSpeakingIdx(0);
        setSpeakingResults(null);
        setHeardPrompts({});
        setPendingRepeat(null);

        setTimeLeft(selectedPreset.durationMinutes * 60);
        setIsTimeUp(false);
        setAudioPlayCount({});
        setAudioFailed({});
        setState('testing');
    };

    const handleNextWriting = () => {
        if (activeWritingIdx + 1 < writingPromptsList.length) {
            setActiveWritingIdx(prev => prev + 1);
        } else {
            if (speakingPrompts.length > 0) {
                setState('speaking');
            } else {
                handleCompleteGrading();
            }
        }
    };

    // Autoplay speaking prompt when activeSpeakingIdx changes
    useEffect(() => {
        if (state === 'speaking' && speakingPrompts.length > 0) {
            const task = speakingPrompts[activeSpeakingIdx];
            const promptText = task?.listenOnly ? null : task?.prompt;
            if (promptText) {
                const timer = setTimeout(() => {
                    speakPrompt(promptText);
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [state, activeSpeakingIdx, speakingPrompts]);

    // Continuously update speaking answers with transcription while listening
    useEffect(() => {
        if (state === 'speaking' && isListening && transcript) {
            const activePrompt = speakingPrompts[activeSpeakingIdx];
            if (activePrompt) {
                setSpeakingAnswers(prev => ({
                    ...prev,
                    [activePrompt.id]: transcript
                }));
            }
        }
    }, [transcript, isListening, state, activeSpeakingIdx, speakingPrompts]);

    // Play Dialogue Listening
    const handlePlayAudio = (key: string, lines: any[], audioSrc?: string) => {
        const plays = audioPlayCount[key] || 0;
        if (plays >= maxPlays) return;

        setIsPlayingAudio(true);
        setAudioPlayCount(prev => ({ ...prev, [key]: plays + 1 }));

        const done = () => {
            setIsPlayingAudio(false);
            setActiveDialogueLine(null);
        };
        // Nothing could be played: the play isn't spent, and the questions aren't held back
        const failed = () => {
            done();
            setAudioPlayCount(prev => ({ ...prev, [key]: plays }));
            setAudioFailed(prev => ({ ...prev, [key]: true }));
            toast.error({ title: t('simulator.audioFailedTitle'), description: t('simulator.audioFailedBody') });
        };
        if (audioSrc) playAudioFile(audioSrc, done, failed);
        else playDialogueSpeech(lines, (lineIdx) => setActiveDialogueLine(lineIdx), done, failed);
    };

    // Stopping playback never calls its completion, so the play state is released here
    const stopAudio = () => {
        stopDialogueSpeech();
        setIsPlayingAudio(false);
        setActiveDialogueLine(null);
    };

    const setAnswer = (qId: string, response: ExamResponse) => {
        setAnswers(prev => ({ ...prev, [qId]: response }));
    };

    // The questions shown so far: adaptive sections reveal their second stage after the router
    const visible = visibleQuestions(questions, stageChoice);
    const current = visible[currentIdx];
    // A recording is shared by its group (an IELTS Listening part) and limited per exam
    const audioKey = current?.group ?? current?.id ?? '';
    const maxPlays = selectedPreset?.audioPlays ?? 2;
    // currentIdx is the first question of the page on screen; a listening part is one page
    const lastOnPage = current ? pageEnd(visible, currentIdx) : currentIdx;
    const pageQuestions = visible.slice(currentIdx, lastOnPage + 1);
    const closesRouter = endsRouter(questions, visible, lastOnPage, stageChoice);
    // The recording of a part plays once: the page can't be left while it is playing
    const lockedByAudio = isPlayingAudio && current?.section === 'listening';
    // TOEFL shows a recording's questions only once it has been heard
    const questionsHidden = Boolean(selectedPreset?.questionsAfterAudio && current?.dialogue && !audioFailed[audioKey] && (!audioPlayCount[audioKey] || isPlayingAudio));
    // The Play button turns disabled when they appear: keyboard focus moves on to the questions
    const questionsRef = useRef<HTMLDivElement>(null);
    const wereHidden = useRef(false);
    useEffect(() => {
        if (wereHidden.current && !questionsHidden) questionsRef.current?.focus();
        wereHidden.current = questionsHidden;
    }, [questionsHidden]);

    const isPlacement = selectedPreset?.id === 'placement';
    // Placement: the end of the questions served is the end of a block; the next one (or the
    // end of the test) depends on the answers, so it is only decided when the learner moves on
    const endsPlacementBlock = isPlacement && lastOnPage + 1 >= visible.length;

    const goNext = () => {
        stopAudio();
        if (endsPlacementBlock) {
            const block = nextPlacementBlock(placementBlocks, questions, answers);
            if (!block) {
                proceedToWritingOrComplete();
                return;
            }
            setQuestions(prev => [...prev, ...block.questions.map(withShuffledOptions)]);
            setCurrentIdx(lastOnPage + 1);
            return;
        }
        if (closesRouter && current) {
            const chosen = { ...stageChoice, [current.section]: chooseStage(questions, current.section, answers) };
            setStageChoice(chosen);
            // Never step past the questions that will actually be shown
            const nextCount = visibleQuestions(questions, chosen).length;
            setCurrentIdx(Math.min(lastOnPage + 1, nextCount - 1));
            return;
        }
        setCurrentIdx(Math.min(lastOnPage + 1, visible.length - 1));
    };

    const goBack = () => {
        stopAudio();
        setCurrentIdx(pageStart(visible, currentIdx - 1));
    };

    // A second stage can't go back into its router, nor a placement block into the one before (as in adaptive exams)
    const startsPlacementBlock = isPlacement && placementBlocks.some(b => b.questions[0].id === current?.id);
    const canGoBack = currentIdx > 0 && !lockedByAudio && !startsPlacementBlock && !(current?.stage && current.stage !== 'router' && visible[currentIdx - 1]?.stage === 'router');
    // Placement: how many items the test can take, as it is not known in advance
    const totalLabel = isPlacement ? t('simulator.atMost', { max: PLACEMENT.maxItems }) : `${visible.length}${closesRouter ? '+' : ''}`;

    const proceedToWritingOrComplete = () => {
        stopAudio();
        if (selectedPreset?.id !== 'placement' && writingPromptsList.length > 0) {
            setState('writing');
        } else {
            handleCompleteGrading();
        }
    };

    /** `timeUp`: the timer ended the exam, not the learner. */
    const handleCompleteGrading = async (timeUp = false) => {
        if (timerRef.current) clearInterval(timerRef.current);
        stopDialogueSpeech();
        cancelSpeech();
        setState('grading');

        try {
            // 1. Writing (AI). When it can't be evaluated it stays out of the result: never estimated
            let writingScore: number | null = null;
            let aiFeedbackObj = null;

            const hasWriting = selectedPreset?.id !== 'placement' && writingPromptsList.length > 0;
            const combinedWritingText = hasWriting
                ? writingPromptsList.map((p, idx) => `[Task ${idx+1}]: ${writingAnswers[p.id] || ''}`).join('\n\n')
                : '';
            const combinedWritingPrompt = hasWriting
                ? writingPromptsList.map((p, idx) => `[Task ${idx+1}]: ${writingBrief(p, writingChoices[p.id])}`).join('\n\n')
                : '';
            const totalWritingLength = writingPromptsList.reduce((acc, p) => acc + (writingAnswers[p.id] || '').trim().length, 0);
            const targetLvl = selectedPreset?.id === 'cambridge_b1' ? 'B1' : 'B2';

            // A task left (almost) empty scores 0; it is not left out of the result
            if (hasWriting && totalWritingLength <= 10) writingScore = 0;
            if (hasWriting && totalWritingLength > 10) {
                try {
                    const aiResult = await evaluateWriting(
                        combinedWritingText,
                        combinedWritingPrompt,
                        targetLvl as any,
                        'free-writing',
                        [],
                        undefined,
                        selectedPreset!.id,
                    );
                    writingScore = aiResult.score;
                    aiFeedbackObj = aiResult;
                } catch (err) {
                    console.error("Error evaluating writing:", err);
                    toast.error({ title: t('simulator.writingFailedTitle'), description: t('simulator.aiFailedBody') });
                }
            }

            // 2. Speaking (AI), same rule
            let speakingScore: number | null = null;
            let aiSpeakingFeedbackObj = null;

            const hasSpeaking = selectedPreset?.id !== 'placement' && speakingPrompts.length > 0;
            const transcripts = hasSpeaking ? speakingPrompts.map(p => speakingAnswers[p.id] || '') : [];
            const prompts = hasSpeaking ? speakingPrompts.map(p => (p.listenOnly ? `Repeat this sentence exactly: "${p.prompt}"` : p.prompt)) : [];
            const totalSpeakingLength = transcripts.reduce((acc, t) => acc + t.trim().length, 0);

            if (hasSpeaking && totalSpeakingLength <= 5) speakingScore = 0;
            if (hasSpeaking && totalSpeakingLength > 5) {
                try {
                    const aiResult = await evaluateSpeaking(transcripts, prompts, targetLvl, selectedPreset!.id);
                    speakingScore = aiResult.score;
                    aiSpeakingFeedbackObj = aiResult;
                } catch (err) {
                    console.error("Error evaluating speaking:", err);
                    toast.error({ title: t('simulator.speakingFailedTitle'), description: t('simulator.aiFailedBody') });
                }
            }

            // 3. The exam's own score (band, scale or placement level) from the questions seen
            const scored = timeUp && selectedPreset!.id === 'placement' ? answeredWhenTimeIsUp(placementBlocks, visible, answers) : visible;
            const report = buildReport(selectedPreset!.id, scored, answers, stageChoice, writingScore, speakingScore);

            // 4. Save
            if (user) {
                const { error: dbErr } = await supabase.from('cefr_simulations' as any).insert({
                    user_id: user.id,
                    test_type: selectedPreset!.id,
                    level: report.level,
                    score: report.overallPercent,
                    listening_score: report.percent.listening,
                    reading_score: report.percent.reading,
                    use_of_english_score: report.percent.useOfEnglish,
                    writing_score: report.percent.writing,
                    writing_feedback: aiFeedbackObj,
                    speaking_score: report.percent.speaking,
                    speaking_feedback: aiSpeakingFeedbackObj,
                    report: { headline: report.headline, breakdown: report.breakdown, stages: stageChoice, confidence: report.confidence }
                });
                if (dbErr) console.error('Saving the simulation failed:', dbErr);
            }

            setResults({
                testType: presetTitle(selectedPreset!),
                report,
                writingFeedback: aiFeedbackObj,
                speakingFeedback: aiSpeakingFeedbackObj
            });

            setState('dashboard');
        } catch (err) {
            console.error(err);
            toast.error({
                title: t('simulator.gradingErrorTitle'),
                description: t('simulator.gradingErrorBody')
            });
            setState('selection');
        }
    };

    finishRef.current = () => handleCompleteGrading(true);

    return (
        <div className="py-6 px-4 max-w-4xl mx-auto space-y-8">
            {state !== 'selection' && state !== 'dashboard' && (
                <style>{`.floating-bar { display: none !important; }`}</style>
            )}
            
            <AnimatePresence mode="wait">
                
                {/* 1. SELECTION STATE */}
                {state === 'selection' && (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="space-y-8"
                    >
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">{t('simulator.centerTitle')}</h1>
                            <p className="text-sm text-[var(--color-on-surface-muted)]">{t('simulator.centerSubtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {presets.map(p => {
                                const locked = p.isPro && isFree;
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => handleSelectPreset(p)}
                                        className={`widget hover:scale-101 transition-all duration-300 flex flex-col justify-between h-full space-y-6 cursor-pointer relative overflow-hidden group ${
                                            locked ? 'opacity-70 border-dashed border-[var(--color-surface-container-highest)]' : ''
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                                    p.id === 'placement' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary-ink)]'
                                                }`}>
                                                    {p.id === 'placement' ? <Compass className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                                                </div>
                                                {locked && (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary-ink)] flex items-center gap-1">
                                                        <Shield className="w-3 h-3" /> Pro
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-[var(--color-on-surface)]">{presetTitle(p)}</h3>
                                            <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{t(`simulator.presets.${p.id}.description`)}</p>
                                        </div>

                                        <div className="pt-4 border-t border-[var(--color-surface-container)] space-y-3">
                                            <p className="text-xs font-semibold text-[var(--color-success)] dark:text-[var(--color-success)] leading-relaxed">{t(`simulator.presets.${p.id}.advice`)}</p>
                                            <div className="flex items-center justify-between text-xs text-[var(--color-on-surface-muted)] pt-1 font-bold">
                                                <span className="inline-flex items-center gap-1.5"><Timer className="w-3.5 h-3.5" aria-hidden="true" />{t('simulator.minutes', { count: p.durationMinutes })}</span>
                                                <span className="flex items-center gap-1 group-hover:text-[var(--color-on-surface)] transition-colors">
                                                    {t('simulator.start')} <ChevronRight className="w-4.5 h-4.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* 2. INSTRUCTIONS STATE */}
                {state === 'instructions' && selectedPreset && (
                    <motion.div
                        key="instructions"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-md mx-auto widget space-y-6 !py-8 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-[var(--color-tertiary)]/15 flex items-center justify-center mx-auto shadow-md">
                            <Sparkles className="w-8 h-8 text-[var(--color-tertiary-ink)]" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black">{presetTitle(selectedPreset)}</h2>
                            <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider font-bold">{t('simulator.formalInstructions')}</p>
                        </div>

                        <div className="text-sm text-left bg-[var(--color-surface-container)] rounded-[1.5rem] p-5 space-y-3 text-[var(--color-on-surface-muted)]">
                            <p className="flex items-start gap-2.5">
                                <span className="font-bold text-[var(--color-tertiary-ink)]">1.</span>
                                <span>{t('simulator.ruleNoTranslators')}</span>
                            </p>
                            <p className="flex items-start gap-2.5">
                                <span className="font-bold text-[var(--color-tertiary-ink)]">2.</span>
                                <span>{t('simulator.ruleTimer')}</span>
                            </p>
                            <p className="flex items-start gap-2.5">
                                <span className="font-bold text-[var(--color-tertiary-ink)]">3.</span>
                                <span><Trans i18nKey="simulator.listeningPlays" count={selectedPreset.audioPlays} components={{ strong: <strong /> }} /></span>
                            </p>
                            {selectedPreset.id === 'placement' && (
                                <p className="flex items-start gap-2.5">
                                    <span className="font-bold text-[var(--color-tertiary-ink)]">4.</span>
                                    <span>{t('simulator.ruleAdaptive', { min: PLACEMENT.minItems, max: PLACEMENT.maxItems })}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setState('selection')}
                                className="flex-1 bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] py-3.5 rounded-full font-bold text-sm active:scale-97"
                            >
                                {t('simulator.back')}
                            </button>
                            <button
                                onClick={handleStartTest}
                                className="flex-1 bg-[var(--color-tertiary)] text-[var(--color-on-tertiary)] py-3.5 rounded-full font-black text-sm active:scale-97 hover:shadow-[0_4px_20px_color-mix(in_oklch,var(--color-tertiary)_25%,transparent)]"
                            >
                                {t('simulator.enterTest')}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* 3. TESTING STATE */}
                {state === 'testing' && current && (
                    <motion.div
                        key="testing"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Status bar */}
                        <div className="flex justify-between items-center bg-[var(--color-card)] rounded-2xl px-5 py-3 shadow-[var(--shadow-card)] shrink-0 text-sm">
                            <span className="font-bold text-[var(--color-primary)]">
                                {selectedPreset && presetTitle(selectedPreset)} • {pageQuestions.length > 1
                                    ? t('simulator.questionsOf', { from: currentIdx + 1, to: lastOnPage + 1, total: totalLabel })
                                    : t('simulator.questionOf', { n: currentIdx + 1, total: totalLabel })}
                            </span>
                            <span className="font-black text-[var(--color-tertiary-ink)] tracking-wide font-mono bg-[var(--color-tertiary)]/10 px-3 py-1 rounded-full">
                                <Timer className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />{formatTime(timeLeft)}
                            </span>
                        </div>

                        <div className="widget space-y-6">
                            {current.task && (
                                <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-tertiary-ink)]">{current.task}</p>
                            )}
                            {/* 3A. READING COMPONENT */}
                            {current.passage && <PassageView text={current.passage} />}

                            {/* 3B. DIALOGUE LISTENING COMPONENT */}
                            {current.dialogue && (
                                <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-6 text-center space-y-4 border border-[var(--color-surface-container)]">
                                    <h4 className="text-xs uppercase tracking-widest font-black text-[var(--color-on-surface-muted)] flex items-center justify-center gap-1.5">
                                        <Volume2 className="w-4.5 h-4.5 text-[var(--color-primary)]" /> {t('simulator.listeningComprehension')}
                                    </h4>
                                    
                                    <div className="flex justify-center items-center gap-3">
                                        <button
                                            onClick={() => handlePlayAudio(audioKey, current.dialogue!, current.audioSrc)}
                                            disabled={isPlayingAudio || (audioPlayCount[audioKey] || 0) >= maxPlays}
                                            aria-label={t('simulator.playAudio')}
                                            className="w-14 h-14 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 transition-all shadow-md"
                                        >
                                            <Play className="w-6 h-6 fill-current" />
                                        </button>
                                        <div className="text-left text-xs text-[var(--color-on-surface-muted)] font-bold">
                                            <p>{t('simulator.plays', { used: audioPlayCount[audioKey] || 0, max: maxPlays })}</p>
                                            {new Set(current.dialogue.map(l => l.accent)).size > 1 && (
                                                <p className="text-[10px] text-[var(--color-tertiary-ink)] mt-0.5">{t('simulator.mixedAccents')}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Visual speech feedback */}
                                    {isPlayingAudio && (
                                        <div className="pt-2 flex justify-center items-center gap-1 text-[var(--color-primary)] font-bold text-xs">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-ping" />
                                            <span>{t('simulator.playing')}</span>
                                        </div>
                                    )}

                                    {/* Inline play limit warning */}
                                    {(audioPlayCount[audioKey] || 0) >= maxPlays && (
                                        <div className="text-[11px] font-bold text-[var(--color-error)] flex items-center justify-center gap-1.5 pt-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> {t('simulator.limitReached')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {pageQuestions.length > 1 && current.dialogue && !selectedPreset?.questionsAfterAudio && (
                                <p className="text-xs font-semibold text-[var(--color-on-surface-muted)]">
                                    {t('simulator.readQuestionsFirst')}
                                </p>
                            )}
                            {selectedPreset?.questionsAfterAudio && current.dialogue && (
                                <p className="sr-only" aria-live="polite">{questionsHidden ? '' : t('simulator.questionsReady')}</p>
                            )}
                            {questionsHidden ? (
                                <p className="text-sm font-semibold text-center text-[var(--color-on-surface-muted)]">
                                    {isPlayingAudio ? t('simulator.listenCarefully') : t('simulator.questionsAfterAudio')}
                                </p>
                            ) : (
                            <div ref={questionsRef} tabIndex={-1} className="space-y-8 focus:outline-none">
                                {pageQuestions.map((q, i) => (
                                    <section key={q.id} aria-label={t('simulator.question', { n: currentIdx + i + 1 })} className="space-y-2">
                                        {pageQuestions.length > 1 && (
                                            <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-primary)]">{t('simulator.question', { n: currentIdx + i + 1 })}</p>
                                        )}
                                        <QuestionView question={q} response={answers[q.id]} onChange={(r) => setAnswer(q.id, r)} />
                                    </section>
                                ))}
                            </div>
                            )}
                        </div>

                        {/* Navigation controls */}
                        <div className="flex justify-between items-center shrink-0">
                            <button
                                onClick={goBack}
                                disabled={!canGoBack}
                                className="px-5 py-3 rounded-full text-sm font-bold bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
                            >
                                {t('simulator.previous')}
                            </button>
                            {lastOnPage + 1 < visible.length || closesRouter || endsPlacementBlock ? (
                                <button
                                    onClick={goNext}
                                    disabled={lockedByAudio}
                                    className="px-8 py-3.5 rounded-full text-sm font-black text-[var(--color-on-tertiary)] bg-[var(--color-tertiary)] active:scale-95 transition-all"
                                >
                                    {/* The end of a placement block may be the end of the test: the label promises neither */}
                                    {endsPlacementBlock ? t('simulator.continue') : t('simulator.next')}
                                </button>
                            ) : (
                                <button
                                    onClick={proceedToWritingOrComplete}
                                    className="px-8 py-3.5 rounded-full text-sm font-black text-[var(--color-on-primary)] bg-[var(--color-success)] active:scale-95 transition-all"
                                >
                                    {t('simulator.continue')}
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* 4. WRITING STATE */}
                {state === 'writing' && writingPromptsList.length > 0 && (
                    <motion.div
                        key="writing"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="space-y-6"
                    >
                        {(() => {
                            const activePrompt = writingPromptsList[activeWritingIdx];
                            if (!activePrompt) return null;
                            const currentText = writingAnswers[activePrompt.id] || '';
                            const wordCount = currentText.trim().split(/\s+/).filter(Boolean).length;
                            const charCount = currentText.length;
                            const isNextTask = activeWritingIdx + 1 < writingPromptsList.length;

                            return (
                                <>
                                    <div className="flex justify-between items-center bg-[var(--color-card)] rounded-2xl px-5 py-3 shadow-[var(--shadow-card)] shrink-0 text-sm">
                                        <span className="font-bold text-[var(--color-primary)] flex items-center gap-1.5">
                                            <Edit3 className="w-4.5 h-4.5" /> {t('simulator.writingTaskOf', { n: activeWritingIdx + 1, total: writingPromptsList.length })}
                                        </span>
                                        <span className="font-black text-[var(--color-tertiary-ink)] tracking-wide font-mono bg-[var(--color-tertiary)]/10 px-3 py-1 rounded-full">
                                            <Timer className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />{formatTime(timeLeft)}
                                        </span>
                                    </div>

                                    <div className="widget space-y-6">
                                        <div className="space-y-3 bg-[var(--color-surface-container)] rounded-2xl p-5 border border-[var(--color-surface-container-highest)]">
                                            <p className="text-[10px] text-[var(--color-tertiary-ink)] font-bold uppercase tracking-wider">{t('simulator.specificInstructions')}</p>
                                            <p className="text-base font-bold leading-relaxed whitespace-pre-line">{activePrompt.prompt}</p>
                                            {activePrompt.choices && (
                                                <TaskChoice
                                                    choices={activePrompt.choices}
                                                    value={writingChoices[activePrompt.id]}
                                                    onChange={id => setWritingChoices(prev => ({ ...prev, [activePrompt.id]: id }))}
                                                    hintId="task-choice-hint"
                                                />
                                            )}
                                            {activePrompt.points && (
                                                <ul className="list-disc pl-5 text-sm font-semibold text-[var(--color-on-surface)] space-y-1">
                                                    {activePrompt.points.map((point: string) => <li key={point}>{point}</li>)}
                                                </ul>
                                            )}
                                            {activePrompt.discussion && (
                                                <div className="space-y-3">
                                                    {activePrompt.discussion.map((post: DiscussionPost) => (
                                                        <article key={post.author} className={`rounded-xl bg-[var(--color-card)] p-4 space-y-1 ${post.role === 'student' ? 'ml-4 sm:ml-8' : ''}`}>
                                                            <p className="text-xs font-black text-[var(--color-primary)]">
                                                                {post.author}{post.role === 'professor' ? ` · ${t('simulator.teacher')}` : ''}
                                                            </p>
                                                            <p className="text-sm leading-relaxed text-[var(--color-on-surface)]">{post.text}</p>
                                                        </article>
                                                    ))}
                                                </div>
                                            )}
                                            {activePrompt.chart && (
                                                <div className="rounded-xl bg-[var(--color-card)] p-4">
                                                    <TaskChart chart={activePrompt.chart} />
                                                </div>
                                            )}
                                            <p className="text-xs text-[var(--color-on-surface-muted)] leading-relaxed mt-2">{activePrompt.instructions}</p>
                                            <div className="text-[11px] font-black text-[var(--color-primary)]">
                                                {t('simulator.suggestedLength', { length: activePrompt.targetWords })}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <textarea
                                                value={currentText}
                                                onChange={(e) => setWritingAnswers(prev => ({ ...prev, [activePrompt.id]: e.target.value }))}
                                                placeholder={t('simulator.writingPlaceholder')}
                                                rows={10}
                                                className="w-full p-5 rounded-[1.5rem] bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all font-sans leading-relaxed"
                                            />
                                            <div className="flex justify-between text-xs text-[var(--color-on-surface-muted)] px-1">
                                                <span>{t('simulator.wordsWritten', { count: wordCount })}</span>
                                                <span>{t('simulator.characters', { count: charCount })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Why the button waits, when it is the choice that is missing */}
                                    {activePrompt.choices && !writingChoices[activePrompt.id] && (
                                        <p id="task-choice-hint" className="text-center text-xs font-semibold text-[var(--color-on-surface-muted)]">{t('simulator.chooseTaskFirst')}</p>
                                    )}
                                    <button
                                        onClick={handleNextWriting}
                                        disabled={currentText.trim().length < 20 || (!!activePrompt.choices && !writingChoices[activePrompt.id])}
                                        aria-describedby={activePrompt.choices && !writingChoices[activePrompt.id] ? 'task-choice-hint' : undefined}
                                        className="w-full py-4 text-sm font-black rounded-full text-[var(--color-on-primary)] bg-[var(--color-success)] active:scale-98 disabled:opacity-40"
                                    >
                                        {isNextTask ? t('simulator.nextTask') : speakingPrompts.length > 0 ? t('simulator.toSpeaking') : t('simulator.finishAndGrade')}
                                    </button>
                                </>
                            );
                        })()}
                    </motion.div>
                )}

                {/* 5. SPEAKING STATE */}
                {state === 'speaking' && speakingPrompts.length > 0 && (
                    <motion.div
                        key="speaking"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center bg-[var(--color-card)] rounded-2xl px-5 py-3 shadow-[var(--shadow-card)] shrink-0 text-sm">
                            <span className="font-bold text-[var(--color-primary)] flex items-center gap-1.5">
                                <Volume2 className="w-4.5 h-4.5" /> {t('simulator.speakingSection')}
                            </span>
                            <span className="font-black text-[var(--color-tertiary-ink)] tracking-wide font-mono bg-[var(--color-tertiary)]/10 px-3 py-1 rounded-full">
                                <Timer className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />{formatTime(timeLeft)}
                            </span>
                        </div>

                        {(() => {
                            const activePrompt = speakingPrompts[activeSpeakingIdx];
                            if (!activePrompt) return null;
                            const recordedText = speakingAnswers[activePrompt.id] || '';
                            
                            return (
                                <div className="widget space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-black text-[var(--color-on-surface)]">{activePrompt.title}</h3>
                                            <p className="text-xs font-bold text-[var(--color-on-surface-muted)]">{t('simulator.taskOf', { n: activeSpeakingIdx + 1, total: speakingPrompts.length })}</p>
                                        </div>
                                        <span className="text-xs font-bold text-[var(--color-tertiary-ink)] bg-[var(--color-tertiary)]/10 px-2.5 py-1 rounded-full">
                                            <Timer className="inline w-3.5 h-3.5 -mt-0.5 mr-1" aria-hidden="true" />{t('simulator.suggestedTime', { seconds: activePrompt.timeSeconds })}
                                        </span>
                                    </div>

                                    {/* Visual prompt card */}
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-6 border border-[var(--color-surface-container-highest)] space-y-4">
                                        <div className="flex items-start gap-4">
                                            <button
                                                onClick={() => {
                                                    if (activePrompt.listenOnly) setPendingRepeat(activePrompt.id);
                                                    speakPrompt(activePrompt.prompt);
                                                }}
                                                disabled={!synthesisSupported || (activePrompt.listenOnly && heardPrompts[activePrompt.id])}
                                                aria-label={activePrompt.listenOnly ? t('simulator.listenOnce') : t('simulator.listenQuestion')}
                                                className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none ${
                                                    isSpeaking 
                                                        ? 'bg-[var(--color-tertiary)] text-[var(--color-on-primary)] animate-pulse' 
                                                        : 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:scale-105 active:scale-95'
                                                }`}
                                            >
                                                <Volume2 className="w-5 h-5" />
                                            </button>
                                            <div className="space-y-1.5 flex-1">
                                                <p className="text-[10px] text-[var(--color-tertiary-ink)] font-bold uppercase tracking-wider">
                                                    {activePrompt.listenOnly ? t('simulator.sentenceToRepeat') : t('simulator.examinerQuestion')}
                                                </p>
                                                {activePrompt.listenOnly && !synthesisSupported ? (
                                                    // Without voices the sentence can't be heard: it is shown instead of losing the task
                                                    <p className="text-base font-extrabold leading-relaxed text-[var(--color-on-surface)]">
                                                        {activePrompt.prompt}
                                                        <span className="block text-xs font-semibold text-[var(--color-on-surface-muted)]">{t('simulator.noVoicesRepeat')}</span>
                                                    </p>
                                                ) : activePrompt.listenOnly ? (
                                                    <p className="text-base font-extrabold leading-relaxed text-[var(--color-on-surface)]" aria-live="polite">
                                                        {heardPrompts[activePrompt.id] ? t('simulator.nowRecord') : t('simulator.tapSpeaker')}
                                                    </p>
                                                ) : (
                                                    <p className="text-base font-extrabold leading-relaxed text-[var(--color-on-surface)]">{activePrompt.prompt}</p>
                                                )}
                                                {activePrompt.cueCard && (
                                                    <ul className="list-disc pl-5 text-sm text-[var(--color-on-surface)] space-y-0.5">
                                                        {activePrompt.cueCard.map((point: string) => <li key={point}>{point}</li>)}
                                                    </ul>
                                                )}
                                                <p className="text-xs text-[var(--color-on-surface-muted)] leading-relaxed italic">{activePrompt.instructions}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Speech Recording Section */}
                                    <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-6 border border-[var(--color-surface-container)] text-center space-y-4">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <button
                                                ref={recordButtonRef}
                                                onClick={() => {
                                                    if (isListening) {
                                                        stopListening();
                                                    } else {
                                                        cancelSpeech();
                                                        startListening();
                                                    }
                                                }}
                                                // Recording would cut the sentence off before it is heard in full
                                                disabled={activePrompt.listenOnly && isSpeaking}
                                                aria-label={isListening ? t('simulator.stopRecording') : t('simulator.recordAnswer')}
                                                className={`w-16 h-16 rounded-full disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 ${
                                                    isListening 
                                                        ? 'bg-[var(--color-error)] text-[var(--color-on-error)] animate-pulse' 
                                                        : 'bg-[var(--color-tertiary)] text-[var(--color-on-tertiary)]'
                                                }`}
                                            >
                                                {isListening ? (
                                                    <span className="w-4 h-4 rounded-sm bg-current" />
                                                ) : (
                                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                                                    </svg>
                                                )}
                                            </button>
                                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-muted)]">
                                                {isListening ? t('simulator.recordingNow') : t('simulator.pressToRecord')}
                                            </span>
                                        </div>

                                        {/* Transcript Display Area */}
                                        <div className="space-y-2 text-left">
                                            <label className="text-xs font-black uppercase text-[var(--color-on-surface-muted)] tracking-wider">{t('simulator.transcriptLabel')}</label>
                                            <textarea
                                                value={recordedText}
                                                onChange={(e) => setSpeakingAnswers(prev => ({ ...prev, [activePrompt.id]: e.target.value }))}
                                                placeholder={t('simulator.transcriptPlaceholder')}
                                                rows={4}
                                                className="w-full p-4 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-surface-container-highest)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all font-sans leading-relaxed"
                                            />
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex justify-between items-center pt-2">
                                        <button
                                            onClick={() => {
                                                cancelSpeech();
                                                setActiveSpeakingIdx(prev => Math.max(0, prev - 1));
                                            }}
                                            disabled={activeSpeakingIdx === 0}
                                            className="px-5 py-3 rounded-full text-sm font-bold bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
                                        >
                                            {t('simulator.previousQuestion')}
                                        </button>
                                        
                                        {activeSpeakingIdx + 1 < speakingPrompts.length ? (
                                            <button
                                                onClick={() => {
                                                    cancelSpeech();
                                                    setActiveSpeakingIdx(prev => prev + 1);
                                                }}
                                                className="px-8 py-3.5 rounded-full text-sm font-black text-[var(--color-on-tertiary)] bg-[var(--color-tertiary)] active:scale-95 transition-all"
                                            >
                                                {t('simulator.nextQuestion')}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    cancelSpeech();
                                                    handleCompleteGrading();
                                                }}
                                                className="px-8 py-3.5 rounded-full text-sm font-black text-[var(--color-on-primary)] bg-[var(--color-success)] active:scale-95 transition-all"
                                            >
                                                {t('simulator.finishExam')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}

                {/* 5. GRADING STATE (LOADING SCREEN) */}
                {state === 'grading' && (
                    <motion.div
                        key="grading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6"
                    >
                        <div className="w-16 h-16 rounded-full bg-[var(--color-tertiary)]/10 flex items-center justify-center">
                            <Activity className="w-8 h-8 text-[var(--color-tertiary-ink)] animate-spin" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black">{t('simulator.processing')}</h2>
                            <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider font-bold">{t('simulator.aiGrading')}</p>
                            <p className="text-sm text-[var(--color-on-surface-muted)] max-w-sm mx-auto leading-relaxed">
                                {t('simulator.processingDetail')}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* 6. RESULTS DASHBOARD STATE */}
                {state === 'dashboard' && results && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8 py-4"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center shrink-0">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-[var(--color-success)]">{t('simulator.completed')}</h1>
                                <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-widest font-black mt-1">{t('simulator.performanceReport')}</p>
                            </div>
                            <button
                                onClick={() => setState('selection')}
                                className="bg-[var(--color-surface-container)] text-[var(--color-on-surface)] py-2 px-5 rounded-full text-xs font-bold hover:bg-[var(--color-surface-container-highest)] transition-colors active:scale-95"
                            >
                                {t('simulator.exitToPanel')}
                            </button>
                        </div>

                        {/* Summary Widget */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Score Card */}
                            <div className="widget flex flex-col items-center gap-5 text-center !py-8">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-muted)]">{t('simulator.estimatedLevel')}</p>
                                    <span className="level-leaf px-5 py-2 text-3xl" style={{ background: LEVEL_COLOR[results.report.level] }}>
                                        {results.report.level}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-muted)]">{t(`simulator.report.${results.report.headline.label}`, { defaultValue: results.report.headline.label })}</p>
                                    {results.report.confidence ? (
                                        <>
                                            <p className="text-2xl font-black text-[var(--color-on-surface)]">{t(`simulator.confidence.${results.report.confidence}`)}</p>
                                            <p className="text-xs leading-snug text-[var(--color-on-surface-muted)]">{t(`simulator.confidenceWhy.${results.report.confidence}`)}</p>
                                        </>
                                    ) : (
                                        <p className="font-mono text-5xl font-bold text-[var(--color-on-surface)]">{results.report.headline.value}</p>
                                    )}
                                </div>
                                <dl className="grid w-full grid-cols-2 gap-2">
                                    {results.report.breakdown.map(b => (
                                        <div key={b.skill} className="rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] px-3 py-2">
                                            <dt className="text-xs font-semibold text-[var(--color-on-surface-muted)]">{t(`simulator.report.${b.skill}`, { defaultValue: b.skill })}</dt>
                                            <dd className="font-mono text-base font-bold text-[var(--color-on-surface)]">{b.value ?? t('simulator.notAssessed')}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <p className="text-xs leading-snug text-[var(--color-on-surface-muted)]">
                                    {t('simulator.estimateNote')}
                                </p>
                            </div>

                            {/* Radar Chart SVG Widget */}
                            <div className="widget md:col-span-2 space-y-3 flex flex-col justify-center">
                                <h4 className="text-xs uppercase font-black text-[var(--color-on-surface-muted)] tracking-wider">{t('simulator.skillsBreakdown')}</h4>
                                
                                <div className="flex flex-col sm:flex-row justify-around items-center gap-6">
                                    {/* SVG Radar Chart */}
                                    <svg width="170" height="170" viewBox="0 0 100 100" className="overflow-visible">
                                        {/* Background grids as nested pentagons */}
                                        {([40, 30, 20, 10]).map((r, rIdx) => {
                                            const pentagonPoints = Array.from({ length: 5 }).map((_, i) => {
                                                const angle = -Math.PI / 2 + (2 * Math.PI / 5) * i;
                                                const x = 50 + r * Math.cos(angle);
                                                const y = 50 + r * Math.sin(angle);
                                                return `${x},${y}`;
                                            }).join(' ');
                                            return (
                                                <polygon
                                                    key={rIdx}
                                                    points={pentagonPoints}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    className="text-[var(--color-surface-container)]"
                                                    strokeWidth="0.75"
                                                />
                                            );
                                        })}
                                        
                                        {/* Axes */}
                                        {Array.from({ length: 5 }).map((_, i) => {
                                            const angle = -Math.PI / 2 + (2 * Math.PI / 5) * i;
                                            const x = 50 + 40 * Math.cos(angle);
                                            const y = 50 + 40 * Math.sin(angle);
                                            return (
                                                <line
                                                    key={i}
                                                    x1="50"
                                                    y1="50"
                                                    x2={x}
                                                    y2={y}
                                                    stroke="currentColor"
                                                    className="text-[var(--color-surface-container)]"
                                                    strokeWidth="0.75"
                                                />
                                            );
                                        })}
                                        
                                        {/* Poly representing stats */}
                                        {(() => {
                                            const rScale = 40 / 100;
                                            const angles = [
                                                -Math.PI / 2, // Reading
                                                -Math.PI / 2 + (2 * Math.PI / 5) * 1, // Listening
                                                -Math.PI / 2 + (2 * Math.PI / 5) * 2, // Writing
                                                -Math.PI / 2 + (2 * Math.PI / 5) * 3, // Speaking
                                                -Math.PI / 2 + (2 * Math.PI / 5) * 4  // Use of English
                                            ];

                                            const p = results.report.percent;
                                            const values = [p.reading, p.listening, p.writing, p.speaking, p.useOfEnglish].map(v => v ?? 0);

                                            const points = angles.map((angle, idx) => {
                                                const val = values[idx];
                                                const r = val * rScale;
                                                const x = 50 + r * Math.cos(angle);
                                                const y = 50 + r * Math.sin(angle);
                                                return `${x},${y}`;
                                            }).join(' ');

                                            return (
                                                <polygon
                                                    points={points}
                                                    fill="color-mix(in oklch, var(--color-success) 20%, transparent)"
                                                    stroke="var(--color-success)"
                                                    strokeWidth="2"
                                                />
                                            );
                                        })()}
                                        
                                        {/* Node labels */}
                                        {(() => {
                                            const labels = ['Reading', 'Listening', 'Writing', 'Speaking', 'Use of English'];
                                            return Array.from({ length: 5 }).map((_, i) => {
                                                const angle = -Math.PI / 2 + (2 * Math.PI / 5) * i;
                                                const r = 46;
                                                const x = 50 + r * Math.cos(angle);
                                                const y = 50 + r * Math.sin(angle);
                                                
                                                let textAnchor: "start" | "end" | "middle" = 'middle';
                                                if (Math.cos(angle) > 0.1) textAnchor = 'start';
                                                else if (Math.cos(angle) < -0.1) textAnchor = 'end';

                                                return (
                                                    <text
                                                        key={i}
                                                        x={x}
                                                        y={y + 2}
                                                        textAnchor={textAnchor}
                                                        className="text-[7px] fill-[var(--color-on-surface-muted)] font-black"
                                                    >
                                                        {labels[i]}
                                                    </text>
                                                );
                                            });
                                        })()}
                                    </svg>
 
                                    {/* Legend breakdown lists */}
                                    <div className="space-y-2 text-xs w-full sm:w-auto font-bold font-mono">
                                        <div className="flex items-center justify-between gap-6">
                                            <span className="text-[var(--color-on-surface-muted)]">Use of English:</span>
                                            <span className="text-[var(--color-primary)]">{results.report.percent.useOfEnglish ?? '—'}{results.report.percent.useOfEnglish !== null && '%'}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-6">
                                            <span className="text-[var(--color-on-surface-muted)]">Reading:</span>
                                            <span className="text-[var(--color-success)]">{results.report.percent.reading ?? '—'}{results.report.percent.reading !== null && '%'}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-6">
                                            <span className="text-[var(--color-on-surface-muted)]">Listening:</span>
                                            <span className="text-[var(--color-tertiary-ink)]">{results.report.percent.listening ?? '—'}{results.report.percent.listening !== null && '%'}</span>
                                        </div>
                                        {selectedPreset?.id !== 'placement' && (
                                            <div className="flex items-center justify-between gap-6">
                                                <span className="text-[var(--color-on-surface-muted)]">Writing:</span>
                                                <span className="text-[var(--color-error)]">{results.report.percent.writing ?? t('simulator.notAssessed')}{results.report.percent.writing !== null && '%'}</span>
                                            </div>
                                        )}
                                        {selectedPreset?.id !== 'placement' && (
                                            <div className="flex items-center justify-between gap-6">
                                                <span className="text-[var(--color-on-surface-muted)]">Speaking:</span>
                                                <span className="text-[var(--color-accent-blue)]">{results.report.percent.speaking ?? t('simulator.notAssessed')}{results.report.percent.speaking !== null && '%'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Writing Feedback from AI */}
                        {results.writingFeedback && (
                            <div className="widget space-y-6">
                                <h3 className="text-lg font-black tracking-tight border-b border-[var(--color-surface-container)] pb-3 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[var(--color-tertiary-ink)]" /> {t('simulator.writingFeedbackTitle')}
                                </h3>

                                {results.writingFeedback.criteria?.length ? <CriteriaGrid criteria={results.writingFeedback.criteria} /> : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Grammatical Accuracy</span>
                                        <span className="text-3xl font-black text-[var(--color-primary)] block mt-1">{results.writingFeedback.feedback.grammar.score}%</span>
                                        <p className="text-[11px] text-[var(--color-on-surface-muted)] leading-relaxed mt-2">{results.writingFeedback.feedback.grammar.note}</p>
                                    </div>
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Lexical Range</span>
                                        <span className="text-3xl font-black text-[var(--color-tertiary-ink)] block mt-1">{results.writingFeedback.feedback.vocabulary.score}%</span>
                                        <p className="text-[11px] text-[var(--color-on-surface-muted)] leading-relaxed mt-2">{results.writingFeedback.feedback.vocabulary.note}</p>
                                    </div>
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Coherence & Cohesion</span>
                                        <span className="text-3xl font-black text-[var(--color-success)] block mt-1">{results.writingFeedback.feedback.coherence.score}%</span>
                                        <p className="text-[11px] text-[var(--color-on-surface-muted)] leading-relaxed mt-2">{results.writingFeedback.feedback.coherence.note}</p>
                                    </div>
                                </div>
                                )}

                                {/* Encouragement */}
                                <div className="p-5 rounded-2xl bg-[var(--color-tertiary)]/5 border-l-4 border-[var(--color-tertiary)] text-xs leading-relaxed text-[var(--color-on-surface-muted)]">
                                    <span className="font-black text-[var(--color-tertiary-ink)] uppercase tracking-wider mr-2">{t('simulator.tutorTip')}</span>
                                    {results.writingFeedback.encouragement}
                                </div>

                                {/* Text Corrections block */}
                                {results.writingFeedback.corrections && results.writingFeedback.corrections.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-xs uppercase font-black text-[var(--color-on-surface-muted)] tracking-wider">{t('simulator.writingCorrections')}</h4>
                                        <div className="space-y-3">
                                            {results.writingFeedback.corrections.map((corr: any, cIdx: number) => (
                                                <div key={cIdx} className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)] rounded-2xl p-4 text-xs space-y-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="line-through text-[var(--color-error)] bg-[var(--color-error)]/10 px-2 py-0.5 rounded font-mono">{corr.original}</span>
                                                        <ChevronRight className="w-4.5 h-4.5 text-[var(--color-on-surface-muted)]" />
                                                        <span className="text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-0.5 rounded font-mono font-bold">{corr.corrected}</span>
                                                        <span className="ml-auto text-[9px] font-black uppercase bg-[var(--color-surface-container)] px-2 py-0.5 rounded-full text-[var(--color-on-surface-muted)]">
                                                            {corr.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-[var(--color-on-surface-muted)] leading-relaxed">{corr.explanation}</p>
                                                    {corr.example_variants && corr.example_variants.length > 0 && (
                                                        <div className="pt-1.5 border-t border-[var(--color-surface-container)] space-y-1">
                                                            <p className="text-[10px] text-[var(--color-primary)] font-bold">{t('simulator.suggestedVariations')}</p>
                                                            {corr.example_variants.map((v: string, vIdx: number) => (
                                                                <p key={vIdx} className="italic text-[10px] text-[var(--color-on-surface-muted)] flex items-center gap-1.5">
                                                                    <CheckCircle className="w-3 h-3 text-[var(--color-success)] flex-shrink-0" /> {v}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Detailed Speaking Feedback from AI */}
                        {results.speakingFeedback && (
                            <div className="widget space-y-6">
                                <h3 className="text-lg font-black tracking-tight border-b border-[var(--color-surface-container)] pb-3 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[var(--color-accent-blue)]" /> {t('simulator.speakingFeedbackTitle')}
                                </h3>

                                {results.speakingFeedback.criteria?.length ? <CriteriaGrid criteria={results.speakingFeedback.criteria} /> : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Pronunciation Accuracy</span>
                                        <span className="text-3xl font-black text-[var(--color-accent-blue)] block mt-1">{results.speakingFeedback.pronunciationScore}%</span>
                                    </div>
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Fluency & Coherence</span>
                                        <span className="text-3xl font-black text-[var(--color-tertiary-ink)] block mt-1">{results.speakingFeedback.fluencyScore}%</span>
                                    </div>
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Lexical & Grammatical Range</span>
                                        <span className="text-3xl font-black text-[var(--color-success)] block mt-1">{results.speakingFeedback.vocabularyScore}%</span>
                                    </div>
                                </div>
                                )}

                                {/* Detailed feedback */}
                                <div className="p-5 rounded-2xl bg-[var(--color-accent-blue)]/5 border-l-4 border-[var(--color-accent-blue)] text-xs leading-relaxed text-[var(--color-on-surface-muted)]">
                                    <span className="font-black text-[var(--color-accent-blue)] uppercase tracking-wider mr-2">{t('simulator.examinerAssessment')}</span>
                                    {results.speakingFeedback.detailedFeedback}
                                </div>

                                {/* Speaking Corrections block */}
                                {results.speakingFeedback.corrections && results.speakingFeedback.corrections.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-xs uppercase font-black text-[var(--color-on-surface-muted)] tracking-wider">{t('simulator.speakingCorrections')}</h4>
                                        <div className="space-y-3">
                                            {results.speakingFeedback.corrections.map((corr: any, cIdx: number) => (
                                                <div key={cIdx} className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)] rounded-2xl p-4 text-xs space-y-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="line-through text-[var(--color-error)] bg-[var(--color-error)]/10 px-2 py-0.5 rounded font-mono">{corr.phrase}</span>
                                                        <ChevronRight className="w-4.5 h-4.5 text-[var(--color-on-surface-muted)]" />
                                                        <span className="text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-0.5 rounded font-mono font-bold">{corr.suggestion}</span>
                                                    </div>
                                                    <p className="text-[var(--color-on-surface-muted)] leading-relaxed">{corr.explanation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upgrade Pro Modal */}
            <AnimatePresence>
                {showUpgradeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_oklch,var(--color-level-ink)_60%,transparent)] ">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative border border-[var(--color-surface-container)] text-left"
                        >
                            <div className="w-16 h-16 rounded-full bg-[var(--color-tertiary)]/10 flex items-center justify-center mx-auto text-[var(--color-tertiary-ink)]">
                                <Crown className="w-8 h-8 fill-[var(--color-tertiary)]/20" />
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="text-2xl font-black text-[var(--color-on-surface)]">{t('simulator.unlockPro')}</h3>
                                <p className="text-[10px] text-[var(--color-tertiary-ink)] font-bold uppercase tracking-wider">{t('simulator.premiumPlan')}</p>
                                <p className="text-xs leading-relaxed text-[var(--color-on-surface-muted)] pt-1">
                                    {t('simulator.proOnly')}
                                </p>
                            </div>
                            <div className="bg-[var(--color-surface-container)] p-4 rounded-2xl text-left text-[11px] text-[var(--color-on-surface-muted)] space-y-2 font-bold font-mono">
                                <p className="flex items-center gap-2"><Check className="w-4 h-4 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />{t('simulator.proLevels')}</p>
                                <p className="flex items-center gap-2"><Check className="w-4 h-4 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />{t('simulator.proWriting')}</p>
                                <p className="flex items-center gap-2"><Check className="w-4 h-4 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />{t('simulator.proUnlimited')}</p>
                            </div>
                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowUpgradeModal(false);
                                        navigate('/pricing');
                                    }}
                                    className="w-full bg-[var(--color-tertiary)] text-[var(--color-on-tertiary)] py-3.5 rounded-full font-black text-sm active:scale-97 shadow-md hover:shadow-lg transition-all"
                                >
                                    {t('simulator.seePlans')}
                                </button>
                                <button
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="w-full text-xs font-bold text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] py-1 transition-all"
                                >
                                    {t('simulator.maybeLater')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Cooldown Limit Modal */}
            <AnimatePresence>
                {showLimitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_oklch,var(--color-level-ink)_60%,transparent)] ">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative border border-[var(--color-surface-container)] text-left"
                        >
                            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto text-[var(--color-primary)]">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="text-2xl font-black text-[var(--color-on-surface)]">{t('simulator.weeklyWait')}</h3>
                                <p className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-wider">{t('simulator.weeklyInProgress')}</p>
                                <p className="text-xs leading-relaxed text-[var(--color-on-surface-muted)] pt-1">
                                    {t('simulator.weeklyLimitBody')}
                                </p>
                            </div>
                            <div className="bg-[var(--color-surface-container)] p-4 rounded-2xl text-[11px] text-[var(--color-on-surface-muted)] font-bold text-center">
                                {t('simulator.nextTestIn', { count: limitDaysRemaining })}
                            </div>
                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowLimitModal(false);
                                        navigate('/pricing');
                                    }}
                                    className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)] py-3.5 rounded-full font-black text-sm active:scale-97 shadow-md transition-all"
                                >
                                    {t('simulator.getUnlimited')}
                                </button>
                                <button
                                    onClick={() => setShowLimitModal(false)}
                                    className="w-full text-xs font-bold text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] py-1 transition-all"
                                >
                                    {t('simulator.keepPracticing')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
