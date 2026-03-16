import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenLine, Mic, CheckCircle2, Clock, MicOff, WifiOff, BookOpen } from 'lucide-react';
import type { CEFRLevel } from '../lib/db';
import { getWritingPromptsByUnit, getSpeakingPromptsByUnit } from '../data';
import WritingRunner from './writing/WritingRunner';
import SpeakingRunner from './speaking/SpeakingRunner';

const DEFER_MINUTES = 15;
const DEFER_KEY = 'speaking-deferred-until';
const WRITING_DONE_KEY = 'output-writing-done';

function getDeferredUntil(unitId: string): Date | null {
    try {
        const raw = localStorage.getItem(`${DEFER_KEY}:${unitId}`);
        if (!raw) return null;
        const d = new Date(raw);
        return d > new Date() ? d : null;
    } catch { return null; }
}

function setDeferredUntil(unitId: string): Date {
    const until = new Date(Date.now() + DEFER_MINUTES * 60 * 1000);
    localStorage.setItem(`${DEFER_KEY}:${unitId}`, until.toISOString());
    return until;
}

function clearDeferred(unitId: string) {
    localStorage.removeItem(`${DEFER_KEY}:${unitId}`);
}

interface Props {
    unitId: string;
    level: CEFRLevel;
    onComplete: () => void;
}

type Tab = 'writing' | 'speaking';

export default function OutputStep({ unitId, level, onComplete }: Props) {
    const navigate = useNavigate();
    const writingPrompts = getWritingPromptsByUnit(unitId);
    const speakingPrompts = getSpeakingPromptsByUnit(unitId);
    const hasWriting = writingPrompts && writingPrompts.length > 0;
    const hasSpeaking = speakingPrompts && speakingPrompts.length > 0;

    // Restore persisted writing completion
    const savedWriting = (() => {
        try {
            const raw = localStorage.getItem(`${WRITING_DONE_KEY}:${unitId}`);
            if (!raw) return null;
            return JSON.parse(raw) as { score: number };
        } catch { return null; }
    })();

    const [activeTab, setActiveTab] = useState<Tab>(savedWriting && hasSpeaking ? 'speaking' : 'writing');
    const [writingDone, setWritingDone] = useState(!!savedWriting);
    const [speakingDone, setSpeakingDone] = useState(false);
    const [writingScore, setWritingScore] = useState(savedWriting?.score ?? 0);
    const [speakingScore, setSpeakingScore] = useState(0);
    const [speakingDeferred, setSpeakingDeferred] = useState<Date | null>(null);
    const [minutesLeft, setMinutesLeft] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [speakingAttempted, setSpeakingAttempted] = useState(false);

    const bothDone = (writingDone || !hasWriting) && (speakingDone || !hasSpeaking);

    // Track online/offline status
    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    // Check if speaking is currently deferred
    useEffect(() => {
        const deferred = getDeferredUntil(unitId);
        setSpeakingDeferred(deferred);
        if (deferred) {
            const updateTimer = () => {
                const diff = Math.max(0, Math.ceil((deferred.getTime() - Date.now()) / 60000));
                setMinutesLeft(diff);
                if (diff <= 0) {
                    setSpeakingDeferred(null);
                    clearDeferred(unitId);
                }
            };
            updateTimer();
            const interval = setInterval(updateTimer, 30000);
            return () => clearInterval(interval);
        }
    }, [unitId]);

    const handleDeferSpeaking = useCallback(() => {
        const until = setDeferredUntil(unitId);
        setSpeakingDeferred(until);
        setMinutesLeft(DEFER_MINUTES);
        navigate('/path');
    }, [unitId, navigate]);

    const handleWritingComplete = (score: number) => {
        setWritingScore(score);
        setWritingDone(true);
        localStorage.setItem(`${WRITING_DONE_KEY}:${unitId}`, JSON.stringify({ score }));
        if (hasSpeaking && !speakingDone) {
            setActiveTab('speaking');
        }
    };

    const handleSpeakingComplete = (score: number) => {
        setSpeakingScore(score);
        setSpeakingDone(true);
        clearDeferred(unitId);
        // Clean up persisted writing state since output step is completing
        localStorage.removeItem(`${WRITING_DONE_KEY}:${unitId}`);
        if (hasWriting && !writingDone) {
            setActiveTab('writing');
        }
    };

    // No output prompts for this unit — skip
    if (!hasWriting && !hasSpeaking) {
        return (
            <div className="bg-bg-card border border-border rounded-xl p-6 text-center space-y-4">
                <PenLine className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-sm text-text-secondary">
                    No hay ejercicios de producción para esta unidad todavía.
                </p>
                <button
                    onClick={onComplete}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-[0.98]"
                >
                    Saltar
                </button>
            </div>
        );
    }

    // Static data is always available, no loading state needed

    return (
        <div className="space-y-7">
            {/* Section header */}
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Producción</h3>
                <p className="text-sm text-text-secondary">Practica tu escritura y habla en inglés.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-3">
                {hasWriting && (
                    <button
                        onClick={() => setActiveTab('writing')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'writing'
                                ? 'bg-primary text-white'
                                : 'bg-bg-card border border-border text-text-secondary hover:text-white'
                        }`}
                    >
                        {writingDone ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <PenLine className="w-4 h-4" />}
                        Escritura
                        {writingDone && <span className="text-xs opacity-70">({writingScore}%)</span>}
                    </button>
                )}
                {hasSpeaking && (
                    <button
                        onClick={() => setActiveTab('speaking')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'speaking'
                                ? 'bg-primary text-white'
                                : 'bg-bg-card border border-border text-text-secondary hover:text-white'
                        }`}
                    >
                        {speakingDone ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Mic className="w-4 h-4" />}
                        Habla
                        {speakingDone && <span className="text-xs opacity-70">({speakingScore}%)</span>}
                    </button>
                )}
            </div>

            {/* Offline banner */}
            {!isOnline && !bothDone && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <WifiOff className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-white">Sin conexión a internet</p>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Los ejercicios de producción necesitan IA. Mientras tanto, puedes aprender vocabulario con los cuentos.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/learn')}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <BookOpen className="w-4 h-4" /> Ir a leer cuentos
                    </button>
                </motion.div>
            )}

            {/* Content */}
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {activeTab === 'writing' && hasWriting && !writingDone && (
                    <WritingRunner prompts={writingPrompts} level={level} onComplete={handleWritingComplete} />
                )}
                {activeTab === 'writing' && writingDone && (
                    <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-6 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto" />
                        <p className="text-sm text-white font-semibold">Escritura completada — {writingScore}%</p>
                    </div>
                )}
                {activeTab === 'speaking' && hasSpeaking && !speakingDone && !speakingDeferred && (
                    <div className="space-y-6">
                        <SpeakingRunner prompts={speakingPrompts} level={level} onComplete={handleSpeakingComplete} onFirstAttempt={() => setSpeakingAttempted(true)} />
                        {!speakingAttempted && (
                            <button
                                onClick={handleDeferSpeaking}
                                className="w-full flex items-center justify-center gap-2 bg-bg-card border border-border text-text-muted hover:text-text-secondary py-3 rounded-xl text-sm transition-all"
                            >
                                <MicOff className="w-4 h-4" />
                                No puedo hablar ahora
                            </button>
                        )}
                    </div>
                )}
                {activeTab === 'speaking' && hasSpeaking && !speakingDone && speakingDeferred && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-bg-card border border-amber-500/20 rounded-xl p-6 text-center space-y-4"
                    >
                        <Clock className="w-10 h-10 text-amber-400 mx-auto" />
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-white">Ejercicios de habla pospuestos</p>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Estarán disponibles en <span className="text-amber-400 font-bold">{minutesLeft} minutos</span>.
                                Hablar es parte esencial del aprendizaje — ¡vuelve cuando puedas!
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    clearDeferred(unitId);
                                    setSpeakingDeferred(null);
                                }}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Mic className="w-4 h-4" /> Ya puedo hablar
                            </button>
                            <button
                                onClick={() => navigate('/path')}
                                className="w-full bg-bg-card border border-border hover:bg-bg-card-hover text-text-secondary py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                            >
                                Volver a la ruta
                            </button>
                        </div>
                    </motion.div>
                )}
                {activeTab === 'speaking' && speakingDone && (
                    <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-6 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto" />
                        <p className="text-sm text-white font-semibold">Habla completada — {speakingScore}%</p>
                    </div>
                )}
            </motion.div>

            {/* Continue button (when both done) */}
            {bothDone && (
                <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={onComplete}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]"
                >
                    Continuar al checkpoint
                </motion.button>
            )}
        </div>
    );
}
