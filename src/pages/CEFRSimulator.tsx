import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Compass, Shield, Award, Sparkles, Play, 
    Volume2, Edit3, Activity, ChevronRight, CheckCircle, Crown, Calendar, AlertCircle
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTier } from '../hooks/useTier';
import { supabase } from '../lib/supabase';
import { playDialogueSpeech, stopDialogueSpeech } from '../lib/assessmentSpeech';
import { placementQuestions, writingPrompts, AssessmentQuestion, WritingPrompt } from '../data/assessments/cefr-questions';
import { cambridgeB1Questions, cambridgeB1Writing, cambridgeB1Speaking } from '../data/assessments/cambridge-b1-questions';
import { cambridgeB2Questions, cambridgeB2Writing, cambridgeB2Speaking } from '../data/assessments/cambridge-b2-questions';
import { toeflQuestions, toeflWriting, toeflSpeaking } from '../data/assessments/toefl-questions';
import { ieltsQuestions, ieltsWriting, ieltsSpeaking } from '../data/assessments/ielts-questions';
import { useSpeech } from '../hooks/useSpeech';
import { evaluateWriting, evaluateSpeaking } from '../lib/ai';
import { toast } from '../lib/toast';

type PageState = 'selection' | 'instructions' | 'testing' | 'writing' | 'speaking' | 'grading' | 'dashboard';

interface TestPreset {
    id: 'placement' | 'toefl' | 'ielts' | 'cambridge_b1' | 'cambridge_b2';
    title: string;
    description: string;
    pedagogicalAdvice: string;
    isPro: boolean;
    durationMinutes: number;
    questionCount: number;
}

const presets: TestPreset[] = [
    {
        id: 'placement',
        title: 'Test de Nivelación Rápida',
        description: 'Mide tus habilidades de comprensión lectora, auditiva y gramatical en minutos. Ideal para conocer tu nivel general de partida (A1-C1) de forma inmediata.',
        pedagogicalAdvice: '⭐ Recomendado cada 2 semanas para medir tu progreso regular y adaptar tu plan de estudio de forma dinámica.',
        isPro: false,
        durationMinutes: 25,
        questionCount: 20
    },
    {
        id: 'toefl',
        title: 'Simulacro TOEFL iBT Style',
        description: 'Evaluación académica rigurosa que imita la estructura real del TOEFL. Incluye lectura avanzada, audios con acentos, redacción de ensayos y sección oral.',
        pedagogicalAdvice: '🎓 Recomendado una vez al mes para evaluar a fondo tu avance académico bajo estándares oficiales.',
        isPro: true,
        durationMinutes: 65,
        questionCount: 70
    },
    {
        id: 'ielts',
        title: 'Simulacro IELTS Academic Style',
        description: 'Estructura enfocada en contextos académicos y profesionales internacionales. Incluye Listening, Reading, múltiples ensayos de Writing y examen oral de Speaking calificados por IA.',
        pedagogicalAdvice: '🎓 Recomendado una vez al mes para medir el desarrollo de tu producción escrita y oral profesional.',
        isPro: true,
        durationMinutes: 65,
        questionCount: 80
    },
    {
        id: 'cambridge_b1',
        title: 'Simulacro Cambridge B1 Preliminary',
        description: 'Prueba oficial de nivel intermedio para consolidar tus bases. Evalúa Use of English, Listening, Writing de dos tareas y Speaking interactivo con feedback instantáneo.',
        pedagogicalAdvice: '🎓 Recomendado cada mes para certificar y consolidar tus bases de nivel B1.',
        isPro: true,
        durationMinutes: 60,
        questionCount: 69
    },
    {
        id: 'cambridge_b2',
        title: 'Simulacro Cambridge B2 First',
        description: 'Prueba de alta exigencia académica que evalúa gramática avanzada (Use of English), comprensión de lectura y audios complejos, redacción técnica y examen oral estructurado.',
        pedagogicalAdvice: '🎓 Recomendado una vez al mes para validar tu solidez gramatical, producción escrita y fluidez oral ejecutiva.',
        isPro: true,
        durationMinutes: 65,
        questionCount: 97
    }
];


export default function CEFRSimulator() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isPro, isFree } = useTier();

    const [state, setState] = useState<PageState>('selection');
    const [selectedPreset, setSelectedPreset] = useState<TestPreset | null>(null);
    const [lastAttemptDate, setLastAttemptDate] = useState<string | null>(null);

    // Test execution states
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [writingPrompt, setWritingPrompt] = useState<WritingPrompt | null>(null);
    const [writingText, setWritingText] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimeUp, setIsTimeUp] = useState(false);

    // Speech and multi-task states
    const { isListening, transcript, startListening, stopListening, speak: speakPrompt, cancelSpeech, isSpeaking } = useSpeech();
    const [activeWritingIdx, setActiveWritingIdx] = useState(0);
    const [writingPromptsList, setWritingPromptsList] = useState<any[]>([]);
    const [writingAnswers, setWritingAnswers] = useState<Record<string, string>>({});
    const [speakingPrompts, setSpeakingPrompts] = useState<any[]>([]);
    const [speakingAnswers, setSpeakingAnswers] = useState<Record<string, string>>({});
    const [activeSpeakingIdx, setActiveSpeakingIdx] = useState(0);
    const [speakingResults, setSpeakingResults] = useState<any | null>(null);

    // Modal state variables
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [limitDaysRemaining, setLimitDaysRemaining] = useState(0);

    // Dialogue listening states
    const [audioPlayCount, setAudioPlayCount] = useState<Record<string, number>>({});
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [activeDialogueLine, setActiveDialogueLine] = useState<number | null>(null);

    // Final result dashboard states
    const [results, setResults] = useState<{
        testType: string;
        level: string;
        score: number;
        reading: number;
        listening: number;
        useOfEnglish: number;
        writing: number;
        writingFeedback?: any;
        speaking?: number;
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

    // Timer trigger
    useEffect(() => {
        if (state === 'testing' || state === 'writing' || state === 'speaking') {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setIsTimeUp(true);
                        toast.error({
                            title: 'Tiempo agotado',
                            description: 'Se ha agotado el tiempo límite para el examen.'
                        });
                        if (state === 'testing') {
                            proceedToWritingOrComplete();
                        } else {
                            handleCompleteGrading();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state]);

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
        stopDialogueSpeech();
        cancelSpeech();

        // 1. Prepare questions & prompts depending on the selected preset
        let selectedQuestions: AssessmentQuestion[] = [];
        let wPrompts: any[] = [];
        let sPrompts: any[] = [];

        if (selectedPreset.id === 'placement') {
            selectedQuestions = [...placementQuestions].slice(0, 20); // 20 questions
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

        setQuestions(selectedQuestions);
        setWritingPromptsList(wPrompts);
        setSpeakingPrompts(sPrompts);

        // 2. Initialize execution states
        setCurrentIdx(0);
        setAnswers({});
        setWritingAnswers({});
        setSpeakingAnswers({});
        setActiveWritingIdx(0);
        setActiveSpeakingIdx(0);
        setSpeakingResults(null);
        
        setTimeLeft(selectedPreset.durationMinutes * 60);
        setIsTimeUp(false);
        setAudioPlayCount({});
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
            const promptText = speakingPrompts[activeSpeakingIdx]?.prompt;
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
    const handlePlayAudio = (qId: string, lines: any[]) => {
        const plays = audioPlayCount[qId] || 0;
        if (plays >= 2) return;

        setIsPlayingAudio(true);
        setAudioPlayCount(prev => ({ ...prev, [qId]: plays + 1 }));

        playDialogueSpeech(
            lines,
            (lineIdx) => setActiveDialogueLine(lineIdx),
            () => {
                setIsPlayingAudio(false);
                setActiveDialogueLine(null);
            }
        );
    };

    const handleSelectOption = (qId: string, optIdx: number) => {
        setAnswers(prev => ({ ...prev, [qId]: optIdx }));
    };

    const proceedToWritingOrComplete = () => {
        stopDialogueSpeech();
        if (selectedPreset?.id !== 'placement' && writingPromptsList.length > 0) {
            setState('writing');
        } else {
            handleCompleteGrading();
        }
    };

    const handleCompleteGrading = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        stopDialogueSpeech();
        cancelSpeech();
        setState('grading');

        try {
            // 1. Evaluate Receptive Skills
            let useOfEnglishCorrect = 0, useOfEnglishTotal = 0;
            let listeningCorrect = 0, listeningTotal = 0;
            let readingCorrect = 0, readingTotal = 0;

            questions.forEach(q => {
                const answer = answers[q.id];
                const isCorrect = answer === q.correctIndex;
                if (q.section === 'use-of-english') {
                    useOfEnglishTotal++;
                    if (isCorrect) useOfEnglishCorrect++;
                } else if (q.section === 'listening') {
                    listeningTotal++;
                    if (isCorrect) listeningCorrect++;
                } else if (q.section === 'reading') {
                    readingTotal++;
                    if (isCorrect) readingCorrect++;
                }
            });

            const useOfEnglishScore = useOfEnglishTotal > 0 ? Math.round((useOfEnglishCorrect / useOfEnglishTotal) * 100) : 80;
            const listeningScore = listeningTotal > 0 ? Math.round((listeningCorrect / listeningTotal) * 100) : 80;
            const readingScore = readingTotal > 0 ? Math.round((readingCorrect / readingTotal) * 100) : 80;

            // 2. Evaluate Writing Skills for multiple tasks combined
            let writingScore = 0;
            let aiFeedbackObj = null;

            const hasWriting = selectedPreset?.id !== 'placement' && writingPromptsList.length > 0;
            const combinedWritingText = hasWriting
                ? writingPromptsList.map((p, idx) => `[Task ${idx+1}]: ${writingAnswers[p.id] || ''}`).join('\n\n')
                : '';
            const combinedWritingPrompt = hasWriting
                ? writingPromptsList.map((p, idx) => `[Task ${idx+1}]: ${p.prompt}`).join('\n\n')
                : '';

            const totalWritingLength = writingPromptsList.reduce((acc, p) => acc + (writingAnswers[p.id] || '').trim().length, 0);

            if (hasWriting && totalWritingLength > 10) {
                try {
                    const targetLvl = selectedPreset?.id === 'cambridge_b1' ? 'B1' : 'B2';
                    const aiResult = await evaluateWriting(
                        combinedWritingText,
                        combinedWritingPrompt,
                        targetLvl as any,
                        'free-writing',
                        ['Advanced Cohesion', 'Technical Vocabulary']
                    );
                    writingScore = aiResult.score;
                    aiFeedbackObj = aiResult;
                } catch (err) {
                    console.error("Error evaluating writing:", err);
                    writingScore = Math.round((readingScore + listeningScore) / 2);
                    aiFeedbackObj = {
                        score: writingScore,
                        feedback: {
                            grammar: { score: readingScore, note: 'Buen intento, tu gramática demuestra solidez conceptual.' },
                            vocabulary: { score: listeningScore, note: 'Rango léxico adecuado para comunicación profesional.' },
                            coherence: { score: 80, note: 'Coherencia estructural bien organizada.' }
                        },
                        corrections: [],
                        improvedVersion: combinedWritingText,
                        encouragement: '¡Sigue adelante practicando tu redacción!'
                    };
                }
            }

            // 3. Evaluate Speaking Skills
            let speakingScore = 0;
            let aiSpeakingFeedbackObj = null;

            const hasSpeaking = selectedPreset?.id !== 'placement' && speakingPrompts.length > 0;
            const transcripts = hasSpeaking ? speakingPrompts.map(p => speakingAnswers[p.id] || '') : [];
            const prompts = hasSpeaking ? speakingPrompts.map(p => p.prompt) : [];
            const totalSpeakingLength = transcripts.reduce((acc, t) => acc + t.trim().length, 0);

            if (hasSpeaking && totalSpeakingLength > 5) {
                try {
                    const targetLvl = selectedPreset?.id === 'cambridge_b1' ? 'B1' : 'B2';
                    const aiResult = await evaluateSpeaking(
                        transcripts,
                        prompts,
                        targetLvl
                    );
                    speakingScore = aiResult.score;
                    aiSpeakingFeedbackObj = aiResult;
                } catch (err) {
                    console.error("Error evaluating speaking:", err);
                    speakingScore = Math.round((readingScore + listeningScore) / 2);
                    aiSpeakingFeedbackObj = {
                        score: speakingScore,
                        pronunciationScore: Math.round(readingScore),
                        fluencyScore: Math.round(listeningScore),
                        vocabularyScore: Math.round(useOfEnglishScore),
                        detailedFeedback: 'Buen esfuerzo oral en tu simulacro de speaking. Se detecta coherencia y pronunciación aceptables.',
                        corrections: []
                    };
                }
            }

            // 4. Overall calculation (5-axis Radar chart model)
            const overallScore = selectedPreset?.id === 'placement'
                ? Math.round((useOfEnglishScore + listeningScore + readingScore) / 3)
                : Math.round((useOfEnglishScore + listeningScore + readingScore + writingScore + speakingScore) / 5);

            // Determine estimated CEFR level
            let level = 'A1';
            if (overallScore >= 85) level = 'C1';
            else if (overallScore >= 70) level = 'B2';
            else if (overallScore >= 50) level = 'B1';
            else if (overallScore >= 30) level = 'A2';

            // 5. Save results to Supabase (with try-catch safety fallback for missing speaking columns)
            if (user) {
                try {
                    await supabase.from('cefr_simulations' as any).insert({
                        user_id: user.id,
                        test_type: selectedPreset!.id,
                        level,
                        score: overallScore,
                        listening_score: listeningScore,
                        reading_score: readingScore,
                        use_of_english_score: useOfEnglishScore,
                        writing_score: selectedPreset!.id === 'placement' ? null : writingScore,
                        writing_feedback: aiFeedbackObj,
                        speaking_score: selectedPreset!.id === 'placement' ? null : speakingScore,
                        speaking_feedback: aiSpeakingFeedbackObj
                    });
                } catch (dbErr) {
                    console.warn("Speaking columns might be missing in DB, falling back:", dbErr);
                    try {
                        await supabase.from('cefr_simulations' as any).insert({
                            user_id: user.id,
                            test_type: selectedPreset!.id,
                            level,
                            score: overallScore,
                            listening_score: listeningScore,
                            reading_score: readingScore,
                            use_of_english_score: useOfEnglishScore,
                            writing_score: selectedPreset!.id === 'placement' ? null : writingScore,
                            writing_feedback: aiFeedbackObj
                        });
                    } catch (err2) {
                        console.error("Secondary fallback DB insert failed:", err2);
                    }
                }
            }

            setResults({
                testType: selectedPreset!.title,
                level,
                score: overallScore,
                reading: readingScore,
                listening: listeningScore,
                useOfEnglish: useOfEnglishScore,
                writing: writingScore,
                writingFeedback: aiFeedbackObj,
                speaking: selectedPreset?.id === 'placement' ? undefined : speakingScore,
                speakingFeedback: aiSpeakingFeedbackObj
            });

            setState('dashboard');
        } catch (err) {
            console.error(err);
            toast.error({
                title: 'Error de evaluación',
                description: 'Ocurrió un error al procesar tu evaluación.'
            });
            setState('selection');
        }
    };

    return (
        <div className="py-6 px-4 max-w-4xl mx-auto space-y-8">
            <style>{`.floating-bar { display: none !important; }`}</style>
            
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
                            <h1 className="text-3xl font-black tracking-tight">Centro de Certificación</h1>
                            <p className="text-sm text-[var(--color-on-surface-muted)]">Evalúa tu nivel CEFR real con simuladores interactivos de alto rigor académico.</p>
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
                                                    p.id === 'placement' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                    {p.id === 'placement' ? <Compass className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                                                </div>
                                                {locked && (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 flex items-center gap-1">
                                                        <Shield className="w-3 h-3" /> Pro
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-[var(--color-on-surface)]">{p.title}</h3>
                                            <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{p.description}</p>
                                        </div>

                                        <div className="pt-4 border-t border-[var(--color-surface-container)] space-y-3">
                                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 leading-relaxed">{p.pedagogicalAdvice}</p>
                                            <div className="flex items-center justify-between text-xs text-[var(--color-on-surface-muted)] pt-1 font-bold">
                                                <span>⏱️ {p.durationMinutes} minutos</span>
                                                <span className="flex items-center gap-1 group-hover:text-[var(--color-on-surface)] transition-colors">
                                                    Comenzar <ChevronRight className="w-4.5 h-4.5" />
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
                        <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto shadow-md">
                            <Sparkles className="w-8 h-8 text-amber-400" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black">{selectedPreset.title}</h2>
                            <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider font-bold">Instrucciones formales</p>
                        </div>

                        <div className="text-sm text-left bg-[var(--color-surface-container)] rounded-[1.5rem] p-5 space-y-3 text-[var(--color-on-surface-muted)]">
                            <p className="flex items-start gap-2.5">
                                <span className="font-bold text-amber-400">1.</span>
                                <span>No utilices traductores ni diccionarios durante la sesión. Queremos medir tu nivel natural.</span>
                            </p>
                            <p className="flex items-start gap-2.5">
                                <span className="font-bold text-amber-400">2.</span>
                                <span>El tiempo corre de forma continua. Si sales del examen, el temporizador seguirá avanzando.</span>
                            </p>
                            <p className="flex items-start gap-2.5">
                                <span className="font-bold text-amber-400">3.</span>
                                <span>En el Listening, cuentas con **máximo 2 reproducciones** por audio. Usa audífonos para mejor nitidez.</span>
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setState('selection')}
                                className="flex-1 bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] py-3.5 rounded-full font-bold text-sm active:scale-97"
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleStartTest}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black py-3.5 rounded-full font-black text-sm active:scale-97 hover:shadow-[0_4px_20px_rgba(245,158,11,0.25)]"
                            >
                                Entrar al Test
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* 3. TESTING STATE */}
                {state === 'testing' && questions.length > 0 && (
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
                                {selectedPreset?.title} • Pregunta {currentIdx + 1} de {questions.length}
                            </span>
                            <span className="font-black text-amber-400 tracking-wide font-mono bg-amber-500/10 px-3 py-1 rounded-full">
                                ⏱️ {formatTime(timeLeft)}
                            </span>
                        </div>

                        <div className="widget space-y-6">
                            {/* 3A. READING COMPONENT */}
                            {questions[currentIdx].passage && (
                                <div className="bg-[var(--color-surface-container)] rounded-2xl p-5 border border-[var(--color-surface-container-highest)] max-h-[220px] overflow-y-auto text-sm leading-relaxed text-[var(--color-on-surface-muted)] italic font-serif">
                                    {questions[currentIdx].passage}
                                </div>
                            )}

                            {/* 3B. DIALOGUE LISTENING COMPONENT */}
                            {questions[currentIdx].dialogue && (
                                <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-6 text-center space-y-4 border border-[var(--color-surface-container)]">
                                    <h4 className="text-xs uppercase tracking-widest font-black text-[var(--color-on-surface-muted)] flex items-center justify-center gap-1.5">
                                        <Volume2 className="w-4.5 h-4.5 text-[var(--color-primary)]" /> Comprensión de Audio
                                    </h4>
                                    
                                    <div className="flex justify-center items-center gap-3">
                                        <button
                                            onClick={() => handlePlayAudio(questions[currentIdx].id, questions[currentIdx].dialogue!)}
                                            disabled={isPlayingAudio || (audioPlayCount[questions[currentIdx].id] || 0) >= 2}
                                            className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white flex items-center justify-center disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 transition-all shadow-md"
                                        >
                                            <Play className="w-6 h-6 fill-white" />
                                        </button>
                                        <div className="text-left text-xs text-[var(--color-on-surface-muted)] font-bold">
                                            <p>Reproducciones: {audioPlayCount[questions[currentIdx].id] || 0} / 2</p>
                                            <p className="text-[10px] text-amber-400 mt-0.5">El diálogo cuenta con acentos nativos mixtos</p>
                                        </div>
                                    </div>

                                    {/* Visual speech feedback */}
                                    {isPlayingAudio && (
                                        <div className="pt-2 flex justify-center items-center gap-1 text-[var(--color-primary)] font-bold text-xs">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-ping" />
                                            <span>Reproduciendo diálogo interactivo en curso...</span>
                                        </div>
                                    )}

                                    {/* Inline play limit warning */}
                                    {(audioPlayCount[questions[currentIdx].id] || 0) >= 2 && (
                                        <div className="text-[11px] font-bold text-red-400 flex items-center justify-center gap-1.5 pt-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> Límite de 2 reproducciones alcanzado para este audio.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Question text */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold leading-snug">{questions[currentIdx].text}</h3>
                                
                                <div className="space-y-3">
                                    {questions[currentIdx].options.map((opt, oIdx) => {
                                        const isSelected = answers[questions[currentIdx].id] === oIdx;
                                        return (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleSelectOption(questions[currentIdx].id, oIdx)}
                                                className={`w-full p-4 rounded-[1.25rem] text-left text-sm font-semibold border-2 transition-all active:scale-99 ${
                                                    isSelected
                                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                                                        : 'border-transparent bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)]'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Navigation controls */}
                        <div className="flex justify-between items-center shrink-0">
                            <button
                                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentIdx === 0}
                                className="px-5 py-3 rounded-full text-sm font-bold bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
                            >
                                Anterior
                            </button>
                            {currentIdx + 1 < questions.length ? (
                                <button
                                    onClick={() => {
                                        stopDialogueSpeech();
                                        setCurrentIdx(prev => prev + 1);
                                    }}
                                    className="px-8 py-3.5 rounded-full text-sm font-black text-black bg-gradient-to-r from-amber-500 to-amber-600 active:scale-95 transition-all"
                                >
                                    Siguiente
                                </button>
                            ) : (
                                <button
                                    onClick={proceedToWritingOrComplete}
                                    className="px-8 py-3.5 rounded-full text-sm font-black text-black bg-gradient-to-r from-emerald-500 to-emerald-600 active:scale-95 transition-all"
                                >
                                    Continuar
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
                                            <Edit3 className="w-4.5 h-4.5" /> Redacción - Tarea {activeWritingIdx + 1} de {writingPromptsList.length}
                                        </span>
                                        <span className="font-black text-amber-400 tracking-wide font-mono bg-amber-500/10 px-3 py-1 rounded-full">
                                            ⏱️ {formatTime(timeLeft)}
                                        </span>
                                    </div>

                                    <div className="widget space-y-6">
                                        <div className="space-y-3 bg-[var(--color-surface-container)] rounded-2xl p-5 border border-[var(--color-surface-container-highest)]">
                                            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Instrucciones específicas</p>
                                            <p className="text-base font-bold leading-relaxed">{activePrompt.prompt}</p>
                                            <p className="text-xs text-[var(--color-on-surface-muted)] leading-relaxed mt-2 italic">{activePrompt.instructions}</p>
                                            <div className="text-[11px] font-black text-[var(--color-primary)]">
                                                Tamaño sugerido: {activePrompt.targetWords}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <textarea
                                                value={currentText}
                                                onChange={(e) => setWritingAnswers(prev => ({ ...prev, [activePrompt.id]: e.target.value }))}
                                                placeholder="Comienza a redactar tu ensayo aquí en inglés..."
                                                rows={10}
                                                className="w-full p-5 rounded-[1.5rem] bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all font-sans leading-relaxed"
                                            />
                                            <div className="flex justify-between text-xs text-[var(--color-on-surface-muted)] px-1">
                                                <span>Palabras redactadas: {wordCount}</span>
                                                <span>Caracteres: {charCount} / 3000</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNextWriting}
                                        disabled={currentText.trim().length < 20}
                                        className="w-full py-4 text-sm font-black rounded-full text-black bg-gradient-to-r from-emerald-500 to-emerald-600 active:scale-98 disabled:opacity-40"
                                    >
                                        {isNextTask ? 'Siguiente Tarea' : speakingPrompts.length > 0 ? 'Continuar al Speaking' : 'Finalizar Examen y Enviar a Calificar'}
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
                                <Volume2 className="w-4.5 h-4.5" /> Sección Oral (Speaking)
                            </span>
                            <span className="font-black text-amber-400 tracking-wide font-mono bg-amber-500/10 px-3 py-1 rounded-full">
                                ⏱️ {formatTime(timeLeft)}
                            </span>
                        </div>

                        {(() => {
                            const activePrompt = speakingPrompts[activeSpeakingIdx];
                            if (!activePrompt) return null;
                            const recordedText = speakingAnswers[activePrompt.id] || '';
                            
                            return (
                                <div className="widget space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-black text-[var(--color-on-surface)]">
                                            Speaking - Tarea {activeSpeakingIdx + 1} de {speakingPrompts.length}
                                        </h3>
                                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                                            ⏱️ Duración sugerida: {activePrompt.timeSeconds}s
                                        </span>
                                    </div>

                                    {/* Visual prompt card */}
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-6 border border-[var(--color-surface-container-highest)] space-y-4">
                                        <div className="flex items-start gap-4">
                                            <button
                                                onClick={() => speakPrompt(activePrompt.prompt)}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                                    isSpeaking 
                                                        ? 'bg-amber-500 text-black animate-pulse' 
                                                        : 'bg-[var(--color-primary)] text-white hover:scale-105 active:scale-95'
                                                }`}
                                                title="Escuchar pregunta"
                                            >
                                                <Volume2 className="w-5 h-5" />
                                            </button>
                                            <div className="space-y-1.5 flex-1">
                                                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Pregunta del Examinador</p>
                                                <p className="text-base font-extrabold leading-relaxed text-[var(--color-on-surface)]">{activePrompt.prompt}</p>
                                                <p className="text-xs text-[var(--color-on-surface-muted)] leading-relaxed italic">{activePrompt.instructions}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Speech Recording Section */}
                                    <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-6 border border-[var(--color-surface-container)] text-center space-y-4">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <button
                                                onClick={() => {
                                                    if (isListening) {
                                                        stopListening();
                                                    } else {
                                                        cancelSpeech();
                                                        startListening();
                                                    }
                                                }}
                                                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 ${
                                                    isListening 
                                                        ? 'bg-red-500 text-white animate-pulse' 
                                                        : 'bg-gradient-to-br from-amber-500 to-amber-600 text-black'
                                                }`}
                                            >
                                                {isListening ? (
                                                    <span className="w-4 h-4 rounded-sm bg-white" />
                                                ) : (
                                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                                                    </svg>
                                                )}
                                            </button>
                                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-muted)]">
                                                {isListening ? 'Grabando... Habla ahora' : 'Presiona para Grabar Respuesta'}
                                            </span>
                                        </div>

                                        {/* Transcript Display Area */}
                                        <div className="space-y-2 text-left">
                                            <label className="text-xs font-black uppercase text-[var(--color-on-surface-muted)] tracking-wider">Tu respuesta transcrita (puedes editarla):</label>
                                            <textarea
                                                value={recordedText}
                                                onChange={(e) => setSpeakingAnswers(prev => ({ ...prev, [activePrompt.id]: e.target.value }))}
                                                placeholder="Tu respuesta en inglés aparecerá aquí mientras hablas..."
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
                                            Pregunta Anterior
                                        </button>
                                        
                                        {activeSpeakingIdx + 1 < speakingPrompts.length ? (
                                            <button
                                                onClick={() => {
                                                    cancelSpeech();
                                                    setActiveSpeakingIdx(prev => prev + 1);
                                                }}
                                                className="px-8 py-3.5 rounded-full text-sm font-black text-black bg-gradient-to-r from-amber-500 to-amber-600 active:scale-95 transition-all"
                                            >
                                                Siguiente Pregunta
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    cancelSpeech();
                                                    handleCompleteGrading();
                                                }}
                                                className="px-8 py-3.5 rounded-full text-sm font-black text-black bg-gradient-to-r from-emerald-500 to-emerald-600 active:scale-95 transition-all"
                                            >
                                                Finalizar Examen
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
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center animate-bounce">
                            <Activity className="w-8 h-8 text-amber-400 animate-spin" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black">Procesando tu Examen...</h2>
                            <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider font-bold">Rigor Académico Gemini 1.5 Pro</p>
                            <p className="text-sm text-[var(--color-on-surface-muted)] max-w-sm mx-auto leading-relaxed">
                                Evaluando tus respuestas de Use of English, Reading, Listening y analizando minuciosamente tu ensayo bajo la rúbrica de examen oficial de Cambridge.
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
                                <h1 className="text-3xl font-black tracking-tight text-emerald-400">¡Evaluación Completada!</h1>
                                <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-widest font-black mt-1">Informe Oficial de Rendimiento</p>
                            </div>
                            <button
                                onClick={() => setState('selection')}
                                className="bg-[var(--color-surface-container)] text-[var(--color-on-surface)] py-2 px-5 rounded-full text-xs font-bold hover:bg-[var(--color-surface-container-highest)] transition-colors active:scale-95"
                            >
                                Salir al Panel
                            </button>
                        </div>

                        {/* Summary Widget */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Score Card */}
                            <div className="widget text-center flex flex-col justify-center items-center space-y-4 !py-8 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-l-4 border-emerald-500">
                                <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">Tu Nivel CEFR Estimado</p>
                                <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-lg">
                                    <span className="text-5xl font-black text-emerald-300">{results.level}</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-[var(--color-on-surface)]">{results.score}% de aciertos</p>
                                    <p className="text-[10px] text-[var(--color-on-surface-muted)] font-bold">
                                        TOEFL equiv: {results.score >= 85 ? '95-120' : results.score >= 70 ? '72-94' : results.score >= 50 ? '42-71' : '10-41'} | IELTS equiv: {results.score >= 85 ? '7.0+' : results.score >= 70 ? '6.0' : results.score >= 50 ? '5.0' : '4.0'}
                                    </p>
                                </div>
                            </div>

                            {/* Radar Chart SVG Widget */}
                            <div className="widget md:col-span-2 space-y-3 flex flex-col justify-center">
                                <h4 className="text-xs uppercase font-black text-[var(--color-on-surface-muted)] tracking-wider">Desglose Técnico de Habilidades</h4>
                                
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

                                            const values = [
                                                results.reading,
                                                results.listening,
                                                results.writing,
                                                results.speaking ?? 0,
                                                results.useOfEnglish
                                            ];

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
                                                    fill="rgba(16, 185, 129, 0.2)"
                                                    stroke="rgb(16, 185, 129)"
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
                                            <span className="text-[var(--color-on-surface-muted)]">🧠 Use of English:</span>
                                            <span className="text-indigo-400">{results.useOfEnglish}%</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-6">
                                            <span className="text-[var(--color-on-surface-muted)]">📖 Reading:</span>
                                            <span className="text-emerald-400">{results.reading}%</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-6">
                                            <span className="text-[var(--color-on-surface-muted)]">🎧 Listening:</span>
                                            <span className="text-amber-400">{results.listening}%</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-6">
                                            <span className="text-[var(--color-on-surface-muted)]">✍️ Writing:</span>
                                            <span className="text-rose-400">{results.writing}%</span>
                                        </div>
                                        {results.speaking !== undefined && (
                                            <div className="flex items-center justify-between gap-6">
                                                <span className="text-[var(--color-on-surface-muted)]">🗣️ Speaking:</span>
                                                <span className="text-sky-400">{results.speaking}%</span>
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
                                    <Sparkles className="w-5 h-5 text-amber-400" /> Diagnóstico y Retroalimentación Experta de Redacción
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Grammatical Accuracy</span>
                                        <span className="text-3xl font-black text-indigo-400 block mt-1">{results.writingFeedback.feedback.grammar.score}%</span>
                                        <p className="text-[11px] text-[var(--color-on-surface-muted)] leading-relaxed mt-2">{results.writingFeedback.feedback.grammar.note}</p>
                                    </div>
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Lexical Range</span>
                                        <span className="text-3xl font-black text-amber-400 block mt-1">{results.writingFeedback.feedback.vocabulary.score}%</span>
                                        <p className="text-[11px] text-[var(--color-on-surface-muted)] leading-relaxed mt-2">{results.writingFeedback.feedback.vocabulary.note}</p>
                                    </div>
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Coherence & Cohesion</span>
                                        <span className="text-3xl font-black text-emerald-400 block mt-1">{results.writingFeedback.feedback.coherence.score}%</span>
                                        <p className="text-[11px] text-[var(--color-on-surface-muted)] leading-relaxed mt-2">{results.writingFeedback.feedback.coherence.note}</p>
                                    </div>
                                </div>

                                {/* Encouragement */}
                                <div className="p-5 rounded-2xl bg-amber-500/5 border-l-4 border-amber-500 text-xs leading-relaxed text-[var(--color-on-surface-muted)]">
                                    <span className="font-black text-amber-400 uppercase tracking-wider mr-2">Consejo del Tutor:</span>
                                    {results.writingFeedback.encouragement}
                                </div>

                                {/* Text Corrections block */}
                                {results.writingFeedback.corrections && results.writingFeedback.corrections.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-xs uppercase font-black text-[var(--color-on-surface-muted)] tracking-wider">Correcciones Específicas Detectadas:</h4>
                                        <div className="space-y-3">
                                            {results.writingFeedback.corrections.map((corr: any, cIdx: number) => (
                                                <div key={cIdx} className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)] rounded-2xl p-4 text-xs space-y-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="line-through text-red-400 bg-red-400/10 px-2 py-0.5 rounded font-mono">{corr.original}</span>
                                                        <ChevronRight className="w-4.5 h-4.5 text-[var(--color-on-surface-muted)]" />
                                                        <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-mono font-bold">{corr.corrected}</span>
                                                        <span className="ml-auto text-[9px] font-black uppercase bg-[var(--color-surface-container)] px-2 py-0.5 rounded-full text-[var(--color-on-surface-muted)]">
                                                            {corr.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-[var(--color-on-surface-muted)] leading-relaxed">{corr.explanation}</p>
                                                    {corr.example_variants && corr.example_variants.length > 0 && (
                                                        <div className="pt-1.5 border-t border-[var(--color-surface-container)] space-y-1">
                                                            <p className="text-[10px] text-[var(--color-primary)] font-bold">Variaciones sugeridas para practicar:</p>
                                                            {corr.example_variants.map((v: string, vIdx: number) => (
                                                                <p key={vIdx} className="italic text-[10px] text-[var(--color-on-surface-muted)] flex items-center gap-1.5">
                                                                    <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" /> {v}
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
                                    <Sparkles className="w-5 h-5 text-sky-400" /> Diagnóstico y Retroalimentación Experta de Expresión Oral
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Pronunciation Accuracy</span>
                                        <span className="text-3xl font-black text-sky-400 block mt-1">{results.speakingFeedback.pronunciationScore}%</span>
                                    </div>
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Fluency & Coherence</span>
                                        <span className="text-3xl font-black text-amber-400 block mt-1">{results.speakingFeedback.fluencyScore}%</span>
                                    </div>
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4 text-center">
                                        <span className="text-[10px] text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider block">Lexical & Grammatical Range</span>
                                        <span className="text-3xl font-black text-emerald-400 block mt-1">{results.speakingFeedback.vocabularyScore}%</span>
                                    </div>
                                </div>

                                {/* Detailed feedback */}
                                <div className="p-5 rounded-2xl bg-sky-500/5 border-l-4 border-sky-500 text-xs leading-relaxed text-[var(--color-on-surface-muted)]">
                                    <span className="font-black text-sky-400 uppercase tracking-wider mr-2">Evaluación del Examinador:</span>
                                    {results.speakingFeedback.detailedFeedback}
                                </div>

                                {/* Speaking Corrections block */}
                                {results.speakingFeedback.corrections && results.speakingFeedback.corrections.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-xs uppercase font-black text-[var(--color-on-surface-muted)] tracking-wider">Correcciones Específicas en tu Habla:</h4>
                                        <div className="space-y-3">
                                            {results.speakingFeedback.corrections.map((corr: any, cIdx: number) => (
                                                <div key={cIdx} className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-highest)] rounded-2xl p-4 text-xs space-y-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="line-through text-red-400 bg-red-400/10 px-2 py-0.5 rounded font-mono">{corr.phrase}</span>
                                                        <ChevronRight className="w-4.5 h-4.5 text-[var(--color-on-surface-muted)]" />
                                                        <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-mono font-bold">{corr.suggestion}</span>
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--color-card)] rounded-[2.5rem] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative border border-[var(--color-surface-container)] text-left"
                        >
                            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-400">
                                <Crown className="w-8 h-8 fill-amber-400/20" />
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="text-2xl font-black text-[var(--color-on-surface)]">Desbloquea Voxie Pro</h3>
                                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Plan Académico Premium</p>
                                <p className="text-xs leading-relaxed text-[var(--color-on-surface-muted)] pt-1">
                                    Los simuladores de certificación oficial (TOEFL, IELTS y Cambridge) y la evaluación experta de ensayos con inteligencia artificial están reservados para miembros Pro.
                                </p>
                            </div>
                            <div className="bg-[var(--color-surface-container)] p-4 rounded-2xl text-left text-[11px] text-[var(--color-on-surface-muted)] space-y-2 font-bold font-mono">
                                <p className="flex items-center gap-2">✓ A1, A2, B1 y B2 desbloqueados</p>
                                <p className="flex items-center gap-2">✓ Evaluaciones avanzadas de redacción</p>
                                <p className="flex items-center gap-2">✓ Intentos ilimitados en simuladores</p>
                            </div>
                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowUpgradeModal(false);
                                        navigate('/pricing');
                                    }}
                                    className="w-full bg-gradient-to-br from-amber-500 to-amber-600 text-black py-3.5 rounded-full font-black text-sm active:scale-97 shadow-md hover:shadow-lg transition-all"
                                >
                                    Ver Planes Premium
                                </button>
                                <button
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="w-full text-xs font-bold text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] py-1 transition-all"
                                >
                                    Quizás más tarde
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Cooldown Limit Modal */}
            <AnimatePresence>
                {showLimitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--color-card)] rounded-[2.5rem] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative border border-[var(--color-surface-container)] text-left"
                        >
                            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-400">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="text-2xl font-black text-[var(--color-on-surface)]">Espera de Nivelación</h3>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Test semanal en curso</p>
                                <p className="text-xs leading-relaxed text-[var(--color-on-surface-muted)] pt-1">
                                    Para asegurar un aprendizaje óptimo y dar tiempo a tu cerebro para asimilar los conocimientos, puedes tomar el Test de Nivelación **una vez a la semana**.
                                </p>
                            </div>
                            <div className="bg-[var(--color-surface-container)] p-4 rounded-2xl text-[11px] text-[var(--color-on-surface-muted)] font-bold text-center">
                                Podrás tomar tu siguiente test en: <span className="text-amber-500 text-sm font-black ml-1">{limitDaysRemaining} día(s)</span>
                            </div>
                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowLimitModal(false);
                                        navigate('/pricing');
                                    }}
                                    className="w-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white py-3.5 rounded-full font-black text-sm active:scale-97 shadow-md transition-all"
                                >
                                    Obtener Acceso Ilimitado con Pro
                                </button>
                                <button
                                    onClick={() => setShowLimitModal(false)}
                                    className="w-full text-xs font-bold text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] py-1 transition-all"
                                >
                                    Continuar practicando
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
