import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenLine, Mic, CheckCircle2 } from 'lucide-react';
import type { CEFRLevel } from '../lib/db';
import { getWritingPromptsByUnit, getSpeakingPromptsByUnit } from '../data';
import WritingRunner from './writing/WritingRunner';
import SpeakingRunner from './speaking/SpeakingRunner';

interface Props {
    unitId: string;
    level: CEFRLevel;
    onComplete: () => void;
}

type Tab = 'writing' | 'speaking';

export default function OutputStep({ unitId, level, onComplete }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('writing');
    const [writingDone, setWritingDone] = useState(false);
    const [speakingDone, setSpeakingDone] = useState(false);
    const [writingScore, setWritingScore] = useState(0);
    const [speakingScore, setSpeakingScore] = useState(0);

    const writingPrompts = getWritingPromptsByUnit(unitId);
    const speakingPrompts = getSpeakingPromptsByUnit(unitId);

    const hasWriting = writingPrompts && writingPrompts.length > 0;
    const hasSpeaking = speakingPrompts && speakingPrompts.length > 0;
    const bothDone = (writingDone || !hasWriting) && (speakingDone || !hasSpeaking);

    const handleWritingComplete = (score: number) => {
        setWritingScore(score);
        setWritingDone(true);
        // Auto-switch to speaking if available
        if (hasSpeaking && !speakingDone) {
            setActiveTab('speaking');
        }
    };

    const handleSpeakingComplete = (score: number) => {
        setSpeakingScore(score);
        setSpeakingDone(true);
        // Auto-switch to writing if not done yet
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
                {activeTab === 'speaking' && hasSpeaking && !speakingDone && (
                    <SpeakingRunner prompts={speakingPrompts} level={level} onComplete={handleSpeakingComplete} />
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
