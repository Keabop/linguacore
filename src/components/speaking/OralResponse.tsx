import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2, RotateCcw, MessageCircle } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';
import { evaluateWriting } from '../../lib/ai';
import type { CEFRLevel } from '../../lib/db';

interface Props {
    instruction: string;
    targetGrammar: string[];
    level: CEFRLevel;
    onComplete: (score: number) => void;
}

export default function OralResponse({ instruction, targetGrammar, level, onComplete }: Props) {
    const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, recognitionSupported } = useSpeech();
    const [phase, setPhase] = useState<'recording' | 'evaluating' | 'result'>('recording');
    const [score, setScore] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleToggleRecord = () => {
        if (isListening) { stopListening(); }
        else { resetTranscript(); setPhase('recording'); setError(null); startListening(); }
    };

    const handleEvaluate = async () => {
        stopListening();
        if (!transcript.trim()) return;
        setPhase('evaluating');
        setError(null);
        try {
            const result = await evaluateWriting(transcript, instruction, level, 'free-writing', targetGrammar);
            setScore(result.score);
            setFeedbackText(result.encouragement);
            setPhase('result');
        } catch (err: any) {
            setError(err.message || 'Error al evaluar.');
            setPhase('recording');
        }
    };

    const handleRetry = () => { resetTranscript(); setPhase('recording'); setScore(0); setFeedbackText(''); };

    if (!recognitionSupported) {
        return (
            <div className="bg-bg-card border border-border rounded-xl p-6 text-center space-y-3">
                <MicOff className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-sm text-text-secondary">Tu navegador no soporta reconocimiento de voz.</p>
                <button onClick={() => onComplete(100)} className="text-sm text-primary underline">Saltar ejercicio</button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="bg-bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold">
                    <MessageCircle className="w-4 h-4" />
                    Respuesta oral
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{instruction}</p>
            </div>

            {targetGrammar.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {targetGrammar.map((g, i) => (
                        <span key={i} className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full">{g}</span>
                    ))}
                </div>
            )}

            {(isListening || transcript) && phase === 'recording' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-bg-card border border-primary/20 rounded-xl p-4 min-h-[80px]">
                    <p className="text-xs text-text-muted mb-1">Tu respuesta:</p>
                    <p className="text-sm text-white leading-relaxed">
                        {transcript}
                        {interimTranscript && <span className="text-text-muted italic"> {interimTranscript}</span>}
                        {isListening && !transcript && !interimTranscript && <span className="text-text-muted italic">Escuchando...</span>}
                    </p>
                </motion.div>
            )}

            {phase === 'evaluating' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-text-secondary">Evaluando tu respuesta...</p>
                </motion.div>
            )}

            {phase === 'result' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3">
                    <p className={`text-4xl font-extrabold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-accent-orange' : 'text-accent-red'}`}>{score}%</p>
                    <p className="text-sm text-text-secondary">{feedbackText}</p>
                    <div className="bg-bg-card border border-border rounded-xl p-4 text-left">
                        <p className="text-xs text-text-muted mb-1">Tu respuesta transcrita:</p>
                        <p className="text-sm text-white italic">{'"'}{transcript}{'"'}</p>
                    </div>
                </motion.div>
            )}

            {error && (
                <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-4 text-sm text-accent-red">{error}</div>
            )}

            <div className="flex gap-3">
                {phase === 'recording' && (
                    <>
                        <button onClick={handleToggleRecord}
                            className={`flex-1 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isListening ? 'bg-accent-red text-white animate-pulse' : 'bg-primary text-white hover:bg-primary-dark'}`}>
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            {isListening ? 'Detener' : 'Grabar'}
                        </button>
                        {transcript && !isListening && (
                            <button onClick={handleEvaluate}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">
                                Evaluar
                            </button>
                        )}
                    </>
                )}
                {phase === 'result' && (
                    <>
                        <button onClick={handleRetry}
                            className="flex-1 bg-bg-card border border-border hover:bg-bg-card-hover text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                            <RotateCcw className="w-4 h-4" /> Reintentar
                        </button>
                        <button onClick={() => onComplete(score)}
                            className="flex-1 bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">
                            Continuar
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
