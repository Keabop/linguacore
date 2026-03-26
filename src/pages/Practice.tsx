import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PenLine, Mic, Sparkles, Loader2, History, Save, Eye, CheckCircle2, ArrowLeft } from 'lucide-react';
import AIErrorCard from '../components/AIErrorCard';
import { useErrorCards } from '../hooks/useErrorCards';
import type { CEFRLevel } from '../lib/db';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { evaluateWriting } from '../lib/ai';
import type { WritingEvaluationResponse } from '../lib/ai';
import WritingFeedback from '../components/writing/WritingFeedback';
import { useSpeech } from '../hooks/useSpeech';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type Tab = 'writing' | 'speaking';

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
const FREE_TOPIC = '__FREE_TOPIC__';

const WRITING_TOPICS: Record<string, string[]> = {
    A1: [
        FREE_TOPIC,
        'Describe your family in 3-4 sentences.',
        'Write about your daily routine.',
        'Describe your favorite food.',
        'Write about your best friend.',
        'Describe your house or apartment.',
    ],
    A2: [
        FREE_TOPIC,
        'Write about your last vacation.',
        'Describe what you did last weekend.',
        'Write about your favorite hobby.',
        'Describe a typical day at your school or work.',
        'Write about a special celebration you attended.',
    ],
    B1: [
        FREE_TOPIC,
        'Write a short opinion about social media.',
        'Describe a challenge you overcame.',
        'Write about a book or movie you enjoyed.',
        'Describe the city or town where you live.',
        'Write about a skill you would like to learn and why.',
    ],
    B2: [
        FREE_TOPIC,
        'Discuss the pros and cons of remote work.',
        'Write about how technology has changed education.',
        'Describe a cultural difference you find interesting.',
        'Write about an environmental issue that concerns you.',
        'Discuss whether artificial intelligence will replace human jobs.',
    ],
};

const SPEAKING_PROMPTS: Record<string, string[]> = {
    A1: [
        'My name is... I am from... I like...',
        'Today is a beautiful day. I am happy.',
        'I have a dog. His name is Max. He is very friendly.',
    ],
    A2: [
        'Yesterday I went to the park with my friends. We played football and had a picnic.',
        'I usually wake up at seven. I have breakfast and then go to school.',
        'My favorite season is summer because I can go to the beach.',
    ],
    B1: [
        'If I could travel anywhere, I would go to Japan because I find the culture fascinating.',
        'I believe that learning a second language opens many doors for personal and professional growth.',
        'The most memorable experience of my life was when I graduated from university.',
    ],
    B2: [
        'While technology has undoubtedly improved our lives, it has also created new challenges that we must address.',
        'The relationship between economic development and environmental sustainability remains one of the most pressing issues of our time.',
        'Had I known then what I know now, I would have approached the situation completely differently.',
    ],
};

export default function Practice() {
    const { t } = useTranslation();
    const { user } = useLevelProgression();
    const [tab, setTab] = useState<Tab>('writing');
    const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | null>(null);

    const levelLabel = (l: CEFRLevel) =>
        l === 'A1' ? 'Principiante' : l === 'A2' ? 'Básico' : l === 'B1' ? 'Intermedio' : 'Avanzado';

    if (!selectedLevel) {
        return (
            <div className="space-y-12">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-extrabold">Práctica libre</h1>
                    <p className="text-[var(--color-on-surface-muted)] text-sm mt-1">Practica tu escritura y habla cuando quieras.</p>
                </motion.div>
                <div className="grid grid-cols-2 gap-4">
                    {LEVELS.map((l, i) => (
                        <motion.button
                            key={l}
                            onClick={() => setSelectedLevel(l)}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-2xl p-6 hover:border-[var(--color-primary)]/40 hover:brightness-95 transition-all text-center space-y-2"
                        >
                            <span className="text-3xl font-extrabold text-[var(--color-primary)]">{l}</span>
                            <p className="text-xs text-[var(--color-on-surface-muted)]">{levelLabel(l)}</p>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <button
                    onClick={() => setSelectedLevel(null)}
                    className="p-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-outline-subtle)] hover:brightness-95 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 text-[var(--color-on-surface-muted)]" />
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold">Práctica libre</h1>
                    <span className="text-xs font-bold text-[var(--color-primary)]">{selectedLevel} — {levelLabel(selectedLevel)}</span>
                </div>
            </motion.div>
            <div className="flex gap-4">
                <button onClick={() => setTab('writing')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'writing' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-card)] border border-[var(--color-outline-subtle)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]'}`}>
                    <PenLine className="w-4 h-4" /> Escritura
                </button>
                <button onClick={() => setTab('speaking')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'speaking' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-card)] border border-[var(--color-outline-subtle)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]'}`}>
                    <Mic className="w-4 h-4" /> Habla
                </button>
            </div>
            <motion.div key={`${tab}-${selectedLevel}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {tab === 'writing' ? (
                    <WritingPractice level={selectedLevel} />
                ) : (
                    <SpeakingPractice level={selectedLevel} />
                )}
            </motion.div>
        </div>
    );
}

/* ===== Writing Practice Sub-component ===== */

function WritingPractice({ level }: { level: CEFRLevel }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { addErrorCard } = useErrorCards();
    const qc = useQueryClient();
    const topics = WRITING_TOPICS[level] || WRITING_TOPICS['A1'];
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [text, setText] = useState('');
    const [phase, setPhase] = useState<'select' | 'writing' | 'evaluating' | 'feedback'>('select');
    const [feedback, setFeedback] = useState<WritingEvaluationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [viewingFeedback, setViewingFeedback] = useState<WritingEvaluationResponse | null>(null);

    // Fetch writing history
    const { data: writingHistory } = useQuery({
        queryKey: ['writing-submissions', user?.id],
        queryFn: async () => {
            const { data } = await supabase
                .from('writing_submissions')
                .select('*')
                .order('submitted_at', { ascending: false })
                .limit(20);
            return data ?? [];
        },
        enabled: !!user?.id,
    });

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    const handleSelectTopic = (topic: string) => {
        const actualTopic = topic === FREE_TOPIC
            ? `Free writing: write about any topic you choose. Evaluate at CEFR ${level} level.`
            : topic;
        setSelectedTopic(actualTopic);
        setText('');
        setPhase('writing');
        setFeedback(null);
        setError(null);
        setSaved(false);
    };

    const handleSubmit = async () => {
        if (!text.trim() || !selectedTopic) return;
        setPhase('evaluating');
        setError(null);
        try {
            const result = await evaluateWriting(text, selectedTopic, level, 'free-writing', []);
            setFeedback(result);
            // Extract corrections as error cards
            if (result.corrections && result.corrections.length > 0) {
                for (const c of result.corrections) {
                    addErrorCard({
                        original: c.original,
                        corrected: c.corrected,
                        explanation: c.explanation,
                        type: c.type,
                    }, 'writing', c.example_variants || []);
                }
            }
            setPhase('feedback');
        } catch (err: any) {
            setError(err.message || 'Error al evaluar.');
            setPhase('writing');
        }
    };

    const handleSave = async () => {
        if (!user?.id || !feedback || !selectedTopic) return;
        try {
            await supabase.from('writing_submissions').insert({
                user_id: user.id,
                prompt_id: selectedTopic.slice(0, 50),
                unit_id: 'practice',
                user_text: text,
                score: feedback.score,
                corrections: feedback.corrections as any,
                feedback_summary: feedback.feedback as any,
                improved_version: feedback.improvedVersion,
                submitted_at: new Date().toISOString(),
            });
            setSaved(true);
            qc.invalidateQueries({ queryKey: ['writing-submissions'] });
        } catch {
            // silently fail
        }
    };

    const handleReset = () => {
        setSelectedTopic(null);
        setText('');
        setPhase('select');
        setFeedback(null);
        setSaved(false);
    };

    // Viewing past feedback (read-only)
    if (viewingFeedback) {
        return (
            <div className="space-y-6">
                <WritingFeedback data={viewingFeedback} onNext={() => setViewingFeedback(null)} nextLabel="Volver" />
            </div>
        );
    }

    if (phase === 'select') {
        return (
            <div className="space-y-6">
                <h3 className="text-sm font-semibold text-[var(--color-on-surface-muted)] uppercase tracking-wider">Elige un tema</h3>
                {topics.map((topic, i) => (
                    <motion.button key={i} onClick={() => handleSelectTopic(topic)}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className={`w-full text-left bg-[var(--color-card)] border rounded-xl p-5 hover:border-[var(--color-primary)]/30 hover:brightness-95 transition-all ${topic === FREE_TOPIC ? 'border-dashed border-primary/20' : 'border-[var(--color-outline-subtle)]'}`}>
                        {topic === FREE_TOPIC ? (
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold">Tema libre</p>
                                    <p className="text-xs text-[var(--color-on-surface-muted)]">Escribe sobre lo que quieras</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm">{topic}</p>
                        )}
                    </motion.button>
                ))}

                {/* Writing History */}
                {writingHistory && writingHistory.length > 0 && (
                    <div className="space-y-4 mt-8 pt-8 border-t border-[var(--color-outline-subtle)]">
                        <button onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-2 text-sm font-semibold text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-colors">
                            <History className="w-4 h-4" /> {t('practice.writingHistory')} ({writingHistory.length})
                        </button>
                        {showHistory && (
                            <div className="space-y-3">
                                {writingHistory.map((entry: any) => (
                                    <button key={entry.id}
                                        onClick={() => {
                                            setViewingFeedback({
                                                score: entry.score,
                                                corrections: entry.corrections || [],
                                                feedback: entry.feedback_summary || {},
                                                improvedVersion: entry.improved_version || '',
                                                encouragement: '',
                                            });
                                        }}
                                        className="w-full text-left bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-4 hover:border-[var(--color-primary)]/30 transition-all space-y-2">
                                        <div className="flex flex-wrap justify-between items-center gap-2">
                                            <span className="text-xs text-[var(--color-on-surface-muted)]">
                                                {new Date(entry.submitted_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                entry.score >= 80 ? 'bg-green-500/10 text-green-400' :
                                                entry.score >= 60 ? 'bg-accent-orange/10 text-accent-orange' :
                                                'bg-accent-red/10 text-accent-red'
                                            }`}>{entry.score}%</span>
                                        </div>
                                        <p className="text-sm truncate break-all">{entry.user_text}</p>
                                        <p className="text-xs text-accent-blue flex items-center gap-1">
                                            <Eye className="w-3 h-3 flex-shrink-0" /> {t('practice.viewFeedback')}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (phase === 'evaluating') {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
                <p className="text-sm text-[var(--color-on-surface-muted)]">Evaluando tu escritura...</p>
            </div>
        );
    }

    if (phase === 'feedback' && feedback) {
        return (
            <div className="space-y-6">
                <WritingFeedback data={feedback} onNext={handleReset} nextLabel="Otro tema" />
                {!saved ? (
                    <button onClick={handleSave}
                        className="w-full bg-[var(--color-card)] border border-[var(--color-outline-subtle)] hover:border-[var(--color-primary)]/30 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" /> {t('practice.saveToHistory')}
                    </button>
                ) : (
                    <p className="text-center text-green-400 text-sm flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {t('practice.savedToHistory')}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-5">
                <p className="text-xs text-[var(--color-on-surface-muted)] font-semibold uppercase tracking-wider mb-2">Tema</p>
                <p className="text-sm text-white">{selectedTopic}</p>
            </div>

            {error && (
                <AIErrorCard error={error} onRetry={() => setError(null)} />
            )}

            <div className="space-y-2">
                <textarea value={text} onChange={e => setText(e.target.value)}
                    placeholder="Escribe en inglés..." rows={8}
                    className="w-full bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-6 text-white text-sm leading-relaxed placeholder:text-[var(--color-on-surface-muted)] resize-none focus:outline-none focus:border-[var(--color-primary)]/40 focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all min-h-[220px]" />
                <p className="text-xs text-[var(--color-on-surface-muted)] text-right">{wordCount} palabras</p>
            </div>

            <div className="flex gap-4">
                <button onClick={handleReset}
                    className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] hover:brightness-95 text-white px-6 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">
                    Cambiar tema
                </button>
                <button onClick={handleSubmit} disabled={wordCount < 5}
                    className="flex-1 bg-[var(--color-primary)] hover:brightness-90 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Evaluar con IA
                </button>
            </div>
        </div>
    );
}

/* ===== Speaking Practice Sub-component ===== */

function SpeakingPractice({ level }: { level: CEFRLevel }) {
    const prompts = SPEAKING_PROMPTS[level] || SPEAKING_PROMPTS['A1'];
    const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, recognitionSupported, speak, isSpeaking } = useSpeech();
    const [currentPrompt, setCurrentPrompt] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const targetText = prompts[currentPrompt];

    const compareWords = () => {
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const targetWords = normalize(targetText).split(/\s+/);
        const spokenWords = normalize(transcript).split(/\s+/);
        const matches = targetWords.map((tw, i) => i < spokenWords.length && spokenWords[i] === tw);
        const correct = matches.filter(Boolean).length;
        return { targetWords, matches, score: targetWords.length > 0 ? Math.round((correct / targetWords.length) * 100) : 0 };
    };

    const result = submitted && transcript ? compareWords() : null;

    const handleToggleRecord = () => {
        if (isListening) { stopListening(); }
        else { resetTranscript(); setSubmitted(false); startListening(); }
    };

    const handleNext = () => {
        setCurrentPrompt(prev => (prev + 1) % prompts.length);
        resetTranscript();
        setSubmitted(false);
    };

    if (!recognitionSupported) {
        return (
            <div className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-6 text-center space-y-3">
                <Mic className="w-8 h-8 text-[var(--color-on-surface-muted)] mx-auto" />
                <p className="text-sm text-[var(--color-on-surface-muted)]">Tu navegador no soporta reconocimiento de voz. Usa Chrome para esta función.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-[var(--color-card)]-hover border border-[var(--color-outline-subtle)]-light rounded-xl p-5 space-y-3">
                <p className="text-xs text-[var(--color-on-surface-muted)] font-semibold uppercase tracking-wider">Lee en voz alta</p>
                {!result ? (
                    <p className="text-white text-lg leading-relaxed font-medium">{targetText}</p>
                ) : (
                    <p className="text-lg leading-relaxed font-medium">
                        {result.targetWords.map((w, i) => (
                            <span key={i} className={`${result.matches[i] ? 'text-green-400' : 'text-accent-red underline decoration-wavy'} mr-1`}>{w}</span>
                        ))}
                    </p>
                )}
                <button onClick={() => speak(targetText, 0.85)} disabled={isSpeaking || isListening}
                    className="flex items-center gap-2 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors disabled:opacity-40">
                    {isSpeaking ? 'Reproduciendo...' : 'Escuchar pronunciación'}
                </button>
            </div>

            {(isListening || transcript) && !submitted && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--color-card)] border border-primary/20 rounded-xl p-4">
                    <p className="text-xs text-[var(--color-on-surface-muted)] mb-1">Tu voz:</p>
                    <p className="text-sm text-white">
                        {transcript}
                        {interimTranscript && <span className="text-[var(--color-on-surface-muted)] italic"> {interimTranscript}</span>}
                        {isListening && !transcript && !interimTranscript && <span className="text-[var(--color-on-surface-muted)] italic">Escuchando...</span>}
                    </p>
                </motion.div>
            )}

            {result && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-2">
                    <p className={`text-4xl font-extrabold ${result.score >= 80 ? 'text-green-400' : result.score >= 60 ? 'text-accent-orange' : 'text-accent-red'}`}>
                        {result.score}%
                    </p>
                    <p className="text-sm text-[var(--color-on-surface-muted)]">
                        {result.score >= 80 ? '¡Excelente!' : result.score >= 60 ? '¡Buen intento!' : '¡Sigue practicando!'}
                    </p>
                </motion.div>
            )}

            <div className="flex gap-4">
                {!submitted ? (
                    <>
                        <button onClick={handleToggleRecord}
                            className={`flex-1 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isListening ? 'bg-accent-red text-white animate-pulse' : 'bg-[var(--color-primary)] text-white hover:brightness-90'}`}>
                            {isListening ? 'Detener' : 'Grabar'}
                        </button>
                        {transcript && !isListening && (
                            <button onClick={() => { stopListening(); setSubmitted(true); }}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">
                                Evaluar
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <button onClick={() => { resetTranscript(); setSubmitted(false); }}
                            className="flex-1 bg-[var(--color-card)] border border-[var(--color-outline-subtle)] hover:brightness-95 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">
                            Reintentar
                        </button>
                        <button onClick={handleNext}
                            className="flex-1 bg-[var(--color-primary)] hover:brightness-90 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">
                            Siguiente
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
