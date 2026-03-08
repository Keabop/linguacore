import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { PenLine, Mic, Sparkles, Loader2 } from 'lucide-react';
import AIErrorCard from '../components/AIErrorCard';
import { db } from '../lib/db';
import type { CEFRLevel } from '../lib/db';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { evaluateWriting } from '../lib/ai';
import type { WritingEvaluationResponse } from '../lib/ai';
import WritingFeedback from '../components/writing/WritingFeedback';
import { useSpeech } from '../hooks/useSpeech';

type Tab = 'writing' | 'speaking';

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

const WRITING_TOPICS: Record<string, string[]> = {
    A1: [
        'Describe your family in 3-4 sentences.',
        'Write about your daily routine.',
        'Describe your favorite food.',
        'Write about your best friend.',
        'Describe your house or apartment.',
    ],
    A2: [
        'Write about your last vacation.',
        'Describe what you did last weekend.',
        'Write about your favorite hobby.',
        'Describe a typical day at your school or work.',
        'Write about a special celebration you attended.',
    ],
    B1: [
        'Write a short opinion about social media.',
        'Describe a challenge you overcame.',
        'Write about a book or movie you enjoyed.',
        'Describe the city or town where you live.',
        'Write about a skill you would like to learn and why.',
    ],
    B2: [
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
    const [level, setLevel] = useState<CEFRLevel>(user?.currentLevel ?? 'A1');

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-extrabold">Práctica libre</h1>
                <p className="text-text-secondary text-sm mt-1">Practica tu escritura y habla cuando quieras.</p>
            </motion.div>

            {/* Level selector */}
            <div className="flex gap-2">
                {LEVELS.map(l => (
                    <button key={l} onClick={() => setLevel(l)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${level === l ? 'bg-primary text-bg-app' : 'bg-bg-card border border-border text-text-secondary hover:text-white'}`}>
                        {l}
                    </button>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button onClick={() => setTab('writing')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'writing' ? 'bg-primary text-bg-app' : 'bg-bg-card border border-border text-text-secondary hover:text-white'}`}>
                    <PenLine className="w-4 h-4" /> Escritura
                </button>
                <button onClick={() => setTab('speaking')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${tab === 'speaking' ? 'bg-primary text-bg-app' : 'bg-bg-card border border-border text-text-secondary hover:text-white'}`}>
                    <Mic className="w-4 h-4" /> Habla
                </button>
            </div>

            {/* Content */}
            <motion.div key={`${tab}-${level}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {tab === 'writing' ? (
                    <WritingPractice level={level} />
                ) : (
                    <SpeakingPractice level={level} />
                )}
            </motion.div>
        </div>
    );
}

/* ===== Writing Practice Sub-component ===== */

function WritingPractice({ level }: { level: CEFRLevel }) {
    const topics = WRITING_TOPICS[level] || WRITING_TOPICS['A1'];
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [text, setText] = useState('');
    const [phase, setPhase] = useState<'select' | 'writing' | 'evaluating' | 'feedback'>('select');
    const [feedback, setFeedback] = useState<WritingEvaluationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    const handleSelectTopic = (topic: string) => {
        setSelectedTopic(topic);
        setText('');
        setPhase('writing');
        setFeedback(null);
        setError(null);
    };

    const handleSubmit = async () => {
        if (!text.trim() || !selectedTopic) return;
        setPhase('evaluating');
        setError(null);
        try {
            const result = await evaluateWriting(text, selectedTopic, level, 'free-writing', []);
            setFeedback(result);
            setPhase('feedback');
        } catch (err: any) {
            setError(err.message || 'Error al evaluar.');
            setPhase('writing');
        }
    };

    const handleReset = () => {
        setSelectedTopic(null);
        setText('');
        setPhase('select');
        setFeedback(null);
    };

    if (phase === 'select') {
        return (
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Elige un tema</h3>
                {topics.map((topic, i) => (
                    <motion.button key={i} onClick={() => handleSelectTopic(topic)}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="w-full text-left bg-bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:bg-bg-card-hover transition-all">
                        <p className="text-sm text-white">{topic}</p>
                    </motion.button>
                ))}
            </div>
        );
    }

    if (phase === 'evaluating') {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-text-secondary">Evaluando tu escritura...</p>
            </div>
        );
    }

    if (phase === 'feedback' && feedback) {
        return (
            <div className="space-y-5">
                <WritingFeedback data={feedback} onNext={handleReset} nextLabel="Otro tema" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="bg-bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">Tema</p>
                <p className="text-sm text-white">{selectedTopic}</p>
            </div>

            {error && (
                <AIErrorCard error={error} onRetry={() => setError(null)} />
            )}

            <div className="space-y-2">
                <textarea value={text} onChange={e => setText(e.target.value)}
                    placeholder="Escribe en inglés..." rows={8}
                    className="w-full bg-bg-card border border-border rounded-xl p-5 text-white text-sm leading-relaxed placeholder:text-text-muted resize-none focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all min-h-[200px]" />
                <p className="text-xs text-text-muted text-right">{wordCount} palabras</p>
            </div>

            <div className="flex gap-3">
                <button onClick={handleReset}
                    className="bg-bg-card border border-border hover:bg-bg-card-hover text-white px-6 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">
                    Cambiar tema
                </button>
                <button onClick={handleSubmit} disabled={wordCount < 5}
                    className="flex-1 bg-primary hover:bg-primary-dark text-bg-app py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2">
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
            <div className="bg-bg-card border border-border rounded-xl p-6 text-center space-y-3">
                <Mic className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-sm text-text-secondary">Tu navegador no soporta reconocimiento de voz. Usa Chrome para esta función.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="bg-bg-card-hover border border-border-light rounded-xl p-5 space-y-3">
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Lee en voz alta</p>
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
                    className="bg-bg-card border border-primary/20 rounded-xl p-4">
                    <p className="text-xs text-text-muted mb-1">Tu voz:</p>
                    <p className="text-sm text-white">
                        {transcript}
                        {interimTranscript && <span className="text-text-muted italic"> {interimTranscript}</span>}
                        {isListening && !transcript && !interimTranscript && <span className="text-text-muted italic">Escuchando...</span>}
                    </p>
                </motion.div>
            )}

            {result && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-2">
                    <p className={`text-4xl font-extrabold ${result.score >= 80 ? 'text-green-400' : result.score >= 60 ? 'text-accent-orange' : 'text-accent-red'}`}>
                        {result.score}%
                    </p>
                    <p className="text-sm text-text-secondary">
                        {result.score >= 80 ? '¡Excelente!' : result.score >= 60 ? '¡Buen intento!' : '¡Sigue practicando!'}
                    </p>
                </motion.div>
            )}

            <div className="flex gap-3">
                {!submitted ? (
                    <>
                        <button onClick={handleToggleRecord}
                            className={`flex-1 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isListening ? 'bg-accent-red text-white animate-pulse' : 'bg-primary text-bg-app hover:bg-primary-dark'}`}>
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
                            className="flex-1 bg-bg-card border border-border hover:bg-bg-card-hover text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">
                            Reintentar
                        </button>
                        <button onClick={handleNext}
                            className="flex-1 bg-primary hover:bg-primary-dark text-bg-app py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">
                            Siguiente
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
