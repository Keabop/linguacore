import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, RotateCcw } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';

interface Props {
    instruction: string;
    targetText: string;
    onComplete: (score: number) => void;
}

function compareTexts(target: string, spoken: string): { matches: boolean[]; score: number; targetWords: string[] } {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const targetWords = normalize(target).split(/\s+/);
    const spokenWords = normalize(spoken).split(/\s+/);

    const matches = targetWords.map((tw, i) => {
        if (i < spokenWords.length && spokenWords[i] === tw) return true;
        if (i < spokenWords.length) {
            const sw = spokenWords[i];
            if (tw.length > 2 && Math.abs(tw.length - sw.length) <= 1) {
                let diffs = 0;
                const longer = tw.length >= sw.length ? tw : sw;
                const shorter = tw.length < sw.length ? tw : sw;
                for (let j = 0; j < longer.length; j++) {
                    if (shorter[j] !== longer[j]) diffs++;
                }
                if (diffs <= 1) return true;
            }
        }
        return false;
    });

    const correctCount = matches.filter(Boolean).length;
    const score = targetWords.length > 0 ? Math.round((correctCount / targetWords.length) * 100) : 0;
    return { matches, score, targetWords };
}

export default function ReadAloud({ instruction, targetText, onComplete }: Props) {
    const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, recognitionSupported, speak, isSpeaking } = useSpeech();
    const [submitted, setSubmitted] = useState(false);

    const result = useMemo(() => {
        if (!submitted || !transcript) return null;
        return compareTexts(targetText, transcript);
    }, [submitted, transcript, targetText]);

    const handleListen = () => { speak(targetText, 0.85); };

    const handleToggleRecord = () => {
        if (isListening) { stopListening(); }
        else { resetTranscript(); setSubmitted(false); startListening(); }
    };

    const handleSubmit = () => { stopListening(); setSubmitted(true); };
    const handleRetry = () => { resetTranscript(); setSubmitted(false); };

    if (!recognitionSupported) {
        return (
            <div className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-6 text-center space-y-3">
                <MicOff className="w-8 h-8 text-[var(--color-on-surface-muted)] mx-auto" />
                <p className="text-sm text-[var(--color-on-surface-muted)]">Tu navegador no soporta reconocimiento de voz.</p>
                <button onClick={() => onComplete(100)} className="text-sm text-[var(--color-primary)] underline">Saltar ejercicio</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-accent-blue text-sm font-semibold">
                    <Volume2 className="w-4 h-4" />
                    Lectura en voz alta
                </div>
                <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{instruction}</p>
            </div>

            <div className="bg-[var(--color-card-hover)] border border-[var(--color-outline-subtle)] rounded-xl p-5 space-y-3">
                <p className="text-xs text-[var(--color-on-surface-muted)] font-semibold uppercase tracking-wider">Lee este texto</p>
                {!result ? (
                    <p className="text-white text-lg leading-relaxed font-medium">{targetText}</p>
                ) : (
                    <p className="text-lg leading-relaxed font-medium">
                        {result.targetWords.map((w, i) => (
                            <span key={i} className={`${result.matches[i] ? 'text-green-400' : 'text-accent-red underline decoration-wavy'} mr-1`}>
                                {w}
                            </span>
                        ))}
                    </p>
                )}
                <button onClick={handleListen} disabled={isSpeaking || isListening}
                    className="flex items-center gap-2 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors disabled:opacity-40">
                    <Volume2 className="w-3.5 h-3.5" />
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
                        {result.score >= 80 ? '¡Excelente pronunciación!' : result.score >= 60 ? 'Buen intento, ¡sigue practicando!' : 'Necesitas más práctica. ¡Intenta de nuevo!'}
                    </p>
                </motion.div>
            )}

            <div className="flex gap-4">
                {!submitted ? (
                    <>
                        <button onClick={handleToggleRecord}
                            className={`flex-1 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isListening ? 'bg-accent-red text-white animate-pulse' : 'bg-[var(--color-primary)] text-white hover:brightness-90'}`}>
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            {isListening ? 'Detener' : 'Grabar'}
                        </button>
                        {transcript && !isListening && (
                            <button onClick={handleSubmit}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">
                                Evaluar
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <button onClick={handleRetry}
                            className="flex-1 bg-[var(--color-card)] border border-[var(--color-outline-subtle)] hover:bg-[var(--color-card-hover)] text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                            <RotateCcw className="w-4 h-4" /> Reintentar
                        </button>
                        <button onClick={() => onComplete(result?.score ?? 0)}
                            className="flex-1 bg-[var(--color-primary)] hover:brightness-90 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">
                            Continuar
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
