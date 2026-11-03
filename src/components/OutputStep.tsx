import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenLine, Mic, CheckCircle2, Clock, MicOff, WifiOff, BookOpen } from 'lucide-react';
import type { CEFRLevel, SpeakingPrompt, WritingPrompt } from '../lib/db';
import PageLoader from './PageLoader';
import { levelOfId, useLevelContent } from '../data/levels';
import WritingRunner from './writing/WritingRunner';
import SpeakingRunner from './speaking/SpeakingRunner';

import { useUsageLimits } from '../hooks/useUsageLimits';

const WRITING_DONE_KEY = 'output-writing-done';

interface Props {
    unitId: string;
    level: CEFRLevel;
    onComplete: () => void;
    /** The unit already has its speaking left for later. */
    speakingPending?: boolean;
    /** "No puedo hablar ahora": the unit goes on, partially done, and the level exam waits for it. False if not saved. */
    onSpeakingPending?: () => Promise<boolean>;
    /** The pending speaking was done. */
    onSpeakingDone?: () => unknown;
    /** Coming back to a finished unit only to do its pending speaking. */
    speakingOnly?: boolean;
}

type Tab = 'writing' | 'speaking';

/** Waits for the level's prompts: without them the step would look like it had nothing to do. */
export default function OutputStep(props: Props) {
    const content = useLevelContent(levelOfId(props.unitId));
    if (!content) return <PageLoader />;
    return (
        <OutputStepBody
            {...props}
            writingPrompts={content.writingPrompts.filter(p => p.unitId === props.unitId)}
            speakingPrompts={content.speakingPrompts.filter(p => p.unitId === props.unitId)}
        />
    );
}

function OutputStepBody({ unitId, level, onComplete, speakingPending = false, onSpeakingPending, onSpeakingDone, speakingOnly = false, writingPrompts, speakingPrompts }: Props & { writingPrompts: WritingPrompt[]; speakingPrompts: SpeakingPrompt[] }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { data: usage } = useUsageLimits();
    const evaluationsLeft = usage?.limits.evaluations;
    const hasWriting = !speakingOnly && writingPrompts && writingPrompts.length > 0;
    const hasSpeaking = speakingPrompts && speakingPrompts.length > 0;

    // Restore persisted writing completion
    const savedWriting = (() => {
        try {
            const raw = localStorage.getItem(`${WRITING_DONE_KEY}:${unitId}`);
            if (!raw) return null;
            return JSON.parse(raw) as { score: number | null };
        } catch { return null; }
    })();

    // Speaking first when there is no writing left to do (none in the unit, already done, or only the pending speaking)
    const [activeTab, setActiveTab] = useState<Tab>(hasSpeaking && (!hasWriting || savedWriting) ? 'speaking' : 'writing');
    const [writingDone, setWritingDone] = useState(!!savedWriting);
    const [speakingDone, setSpeakingDone] = useState(false);
    // null: done without an AI evaluation (free plan limit), so no score is shown
    const [writingScore, setWritingScore] = useState<number | null>(savedWriting?.score ?? null);
    const [speakingScore, setSpeakingScore] = useState<number | null>(null);
    // Left for later: shown as pending until the learner says they can speak again
    const [pending, setPending] = useState(speakingPending && !speakingOnly);
    const [deferError, setDeferError] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [speakingAttempted, setSpeakingAttempted] = useState(false);

    const bothDone = speakingOnly
        ? speakingDone
        : (writingDone || !hasWriting) && (speakingDone || pending || !hasSpeaking);

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

    // Pending only once saved: otherwise the unit would finish without asking for the speaking later
    const handleDeferSpeaking = async () => {
        setDeferError(false);
        if (onSpeakingPending && !(await onSpeakingPending())) {
            setDeferError(true);
            return;
        }
        setPending(true);
        if (hasWriting && !writingDone) setActiveTab('writing');
    };

    const handleWritingComplete = (score: number | null) => {
        setWritingScore(score);
        setWritingDone(true);
        localStorage.setItem(`${WRITING_DONE_KEY}:${unitId}`, JSON.stringify({ score }));
        if (hasSpeaking && !speakingDone) {
            setActiveTab('speaking');
        }
    };

    const handleSpeakingComplete = (score: number | null) => {
        setSpeakingScore(score);
        setSpeakingDone(true);
        setPending(false);
        if (speakingPending) onSpeakingDone?.();
        // Clean up persisted writing state since output step is completing
        localStorage.removeItem(`${WRITING_DONE_KEY}:${unitId}`);
        if (hasWriting && !writingDone) {
            setActiveTab('writing');
        }
    };

    // No output prompts for this unit — skip
    if (!hasWriting && !hasSpeaking) {
        return (
            <div className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-6 text-center space-y-4">
                <PenLine className="w-8 h-8 text-[var(--color-on-surface-muted)] mx-auto" />
                <p className="text-sm text-[var(--color-on-surface-muted)]">
                    No hay ejercicios de producción para esta unidad todavía.
                </p>
                <button
                    // Nothing left to speak: a speaking left pending here is done too
                    onClick={() => { if (speakingPending) onSpeakingDone?.(); onComplete(); }}
                    className="bg-[var(--color-primary)] hover:brightness-90 text-[var(--color-on-primary)] px-6 py-3 rounded-xl font-bold transition-all active:scale-[0.98]"
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
                <h3 className="text-lg font-bold text-[var(--color-on-surface)]">{speakingOnly ? t('output.pendingTitle') : 'Producción'}</h3>
                <p className="text-sm text-[var(--color-on-surface-muted)]">
                    {speakingOnly ? t('output.pendingIntro') : 'Practica tu escritura y habla en inglés.'}
                </p>
                {evaluationsLeft && !bothDone && (
                    <p className="text-xs text-[var(--color-on-surface-muted)]">
                        {evaluationsLeft.remaining > 0
                            ? t('output.evaluationsLeft', { remaining: evaluationsLeft.remaining, limit: evaluationsLeft.limit })
                            : t('output.evaluationsUsed')}
                    </p>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-3">
                {hasWriting && (
                    <button
                        onClick={() => setActiveTab('writing')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'writing'
                                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                                : 'bg-[var(--color-card)] border border-[var(--color-outline-subtle)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-primary)]'
                        }`}
                    >
                        {writingDone ? <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" /> : <PenLine className="w-4 h-4" />}
                        Escritura
                        {writingDone && writingScore !== null && <span className="text-xs opacity-70">({writingScore}%)</span>}
                    </button>
                )}
                {hasSpeaking && (
                    <button
                        onClick={() => setActiveTab('speaking')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'speaking'
                                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                                : 'bg-[var(--color-card)] border border-[var(--color-outline-subtle)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-primary)]'
                        }`}
                    >
                        {speakingDone ? <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" /> : pending ? <Clock className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        Habla
                        {pending && !speakingDone && <span className="text-xs opacity-70">({t('output.pendingTag')})</span>}
                        {speakingDone && speakingScore !== null && <span className="text-xs opacity-70">({speakingScore}%)</span>}
                    </button>
                )}
            </div>

            {/* Offline banner */}
            {!isOnline && !bothDone && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--color-tertiary)]/10 border border-[var(--color-tertiary)]/20 rounded-xl p-5 space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <WifiOff className="w-5 h-5 text-[var(--color-tertiary-ink)] flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-[var(--color-on-surface)]">Sin conexión a internet</p>
                            <p className="text-xs text-[var(--color-on-surface-muted)] leading-relaxed">
                                Los ejercicios de producción necesitan IA. Mientras tanto, puedes aprender vocabulario con los cuentos.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/learn')}
                        className="w-full bg-[var(--color-primary)] hover:brightness-90 text-[var(--color-on-primary)] py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
                    <div className="bg-[var(--color-success)]/8 border border-[var(--color-success)]/20 rounded-xl p-6 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[var(--color-success)] mx-auto" />
                        <p className="text-sm text-[var(--color-on-surface)] font-semibold">Escritura completada{writingScore !== null && ` — ${writingScore}%`}</p>
                    </div>
                )}
                {activeTab === 'speaking' && hasSpeaking && !speakingDone && !pending && (
                    <div className="space-y-6">
                        <SpeakingRunner prompts={speakingPrompts} level={level} onComplete={handleSpeakingComplete} onFirstAttempt={() => setSpeakingAttempted(true)} />
                        {deferError && <p className="text-xs text-center text-[var(--color-error)]">{t('output.deferError')}</p>}
                        {speakingOnly && !speakingAttempted && (
                            <button
                                onClick={onComplete}
                                className="w-full bg-[var(--color-card)] border border-[var(--color-outline-subtle)] text-[var(--color-on-surface-muted)] py-3 rounded-xl text-sm transition-all"
                            >
                                {t('output.notNow')}
                            </button>
                        )}
                        {!speakingAttempted && !speakingOnly && (
                            <button
                                onClick={handleDeferSpeaking}
                                className="w-full flex items-center justify-center gap-2 bg-[var(--color-card)] border border-[var(--color-outline-subtle)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface-muted)] py-3 rounded-xl text-sm transition-all"
                            >
                                <MicOff className="w-4 h-4" />
                                No puedo hablar ahora
                            </button>
                        )}
                    </div>
                )}
                {activeTab === 'speaking' && hasSpeaking && !speakingDone && pending && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--color-card)] border border-[var(--color-tertiary)]/20 rounded-xl p-6 text-center space-y-4"
                    >
                        <Clock className="w-10 h-10 text-[var(--color-tertiary-ink)] mx-auto" />
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-[var(--color-on-surface)]">{t('output.pendingTitle')}</p>
                            <p className="text-xs text-[var(--color-on-surface-muted)] leading-relaxed">{t('output.pendingBody')}</p>
                        </div>
                        <button
                            onClick={() => setPending(false)}
                            className="w-full bg-[var(--color-primary)] hover:brightness-90 text-[var(--color-on-primary)] py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Mic className="w-4 h-4" /> Ya puedo hablar
                        </button>
                    </motion.div>
                )}
                {activeTab === 'speaking' && speakingDone && (
                    <div className="bg-[var(--color-success)]/8 border border-[var(--color-success)]/20 rounded-xl p-6 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[var(--color-success)] mx-auto" />
                        <p className="text-sm text-[var(--color-on-surface)] font-semibold">Habla completada{speakingScore !== null && ` — ${speakingScore}%`}</p>
                    </div>
                )}
            </motion.div>

            {/* Continue button (when both done) */}
            {bothDone && (
                <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={onComplete}
                    className="w-full bg-[var(--color-primary)] hover:brightness-90 text-[var(--color-on-primary)] py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]"
                >
                    {speakingOnly ? t('output.backToPath') : pending ? t('output.continuePending') : 'Continuar al checkpoint'}
                </motion.button>
            )}
        </div>
    );
}
