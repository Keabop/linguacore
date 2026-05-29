import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useConversationHistory, type ConversationSession } from '../hooks/useConversationHistory';
import { chatWithTutor, type ConversationMessage, type ConversationResponse } from '../lib/ai';
import { Send, Sparkles, ArrowLeft, MessageCircle, AlertCircle, History, Plus, Lock, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import AIErrorCard from '../components/AIErrorCard';
import { useErrorCards } from '../hooks/useErrorCards';
import { useTier } from '../hooks/useTier';
import { useUsageLimits } from '../hooks/useUsageLimits';
import { UsageBadge } from '../components/UsageBadge';

interface ChatBubble {
    role: 'user' | 'assistant';
    content: string;
    corrections?: ConversationResponse['corrections'];
    suggestions?: string[];
}

export default function ConversationTutor() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useLevelProgression();
    const { sessions, saveSession } = useConversationHistory();
    const { addErrorCard } = useErrorCards();
    const { isFree } = useTier();
    const { data: usage } = useUsageLimits();
    const tutorUsage = usage?.limits['conversation-tutor'];

    const [messages, setMessages] = useState<ChatBubble[]>([]);
    const [apiMessages, setApiMessages] = useState<ConversationMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'history' | 'chat' | 'readonly'>('history');
    const [readonlySession, setReadonlySession] = useState<ConversationSession | null>(null);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasStarted = useRef(false);

    const level = user?.currentLevel || 'A1';

    // Scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-start conversation when entering chat view
    useEffect(() => {
        if (view === 'chat' && !hasStarted.current && user) {
            hasStarted.current = true;
            sendMessage('Hello!', true);
        }
    }, [user, view]);

    const sendMessage = useCallback(async (text: string, isInitial = false) => {
        if (!text.trim() || isLoading) return;

        setError(null);
        const userMsg: ConversationMessage = { role: 'user', content: text };
        const newApiMessages = [...apiMessages, userMsg];

        if (!isInitial) {
            setMessages(prev => [...prev, { role: 'user', content: text }]);
        }
        setApiMessages(newApiMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatWithTutor(newApiMessages, level);
            const assistantMsg: ConversationMessage = { role: 'assistant', content: response.reply };
            setApiMessages(prev => [...prev, assistantMsg]);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.reply,
                corrections: response.corrections,
                suggestions: response.suggestions,
            }]);
            // Extract corrections as error cards
            if (response.corrections && response.corrections.length > 0) {
                for (const c of response.corrections) {
                    addErrorCard({
                        original: c.original,
                        corrected: c.corrected,
                        explanation: c.explanation,
                    }, 'tutor', c.example_variants || []);
                }
            }
            // Invalidate usage limits so the badge updates
            queryClient.invalidateQueries({ queryKey: ['usage-limits'] });
        } catch (err: any) {
            setError(err.message || t('common.error'));
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [apiMessages, isLoading, level, t]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleSuggestion = (suggestion: string) => {
        sendMessage(suggestion);
    };

    const startNewConversation = useCallback(() => {
        setMessages([]);
        setApiMessages([]);
        setInput('');
        setError(null);
        hasStarted.current = false;
        setView('chat');
    }, []);

    const handleEndSession = useCallback(async () => {
        if (messages.length === 0) return;
        try {
            await saveSession(level, messages);
            setShowEndConfirm(false);
            setView('history');
            setMessages([]);
            setApiMessages([]);
            hasStarted.current = false;
        } catch {
            // silently fail, user can try again
        }
    }, [messages, level, saveSession]);

    // Get last suggestions
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    const suggestions = lastAssistantMsg?.suggestions || [];

    // ── HISTORY VIEW ──
    if (view === 'history') {
        return (
            <div className="space-y-8 w-full max-w-full overflow-hidden flex flex-col min-w-0">
                <style>{`.floating-bar { display: none !important; }`}</style>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between pb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 rounded-full bg-[var(--color-card)] shadow-[var(--shadow-card)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-level-a1)] to-[var(--color-primary)] flex items-center justify-center shadow-[var(--shadow-elevated)]">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="font-black text-lg tracking-tight leading-tight">{t('chat.title')}</h2>
                                <p className="text-xs text-[var(--color-on-surface-muted)]">{t('chat.level', { level })}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* New conversation button */}
                <button onClick={startNewConversation}
                    className="w-full py-4 font-bold flex items-center justify-center gap-3 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white rounded-full shadow-[var(--shadow-elevated)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)] transition-all duration-300 text-base">
                    <Plus className="w-5 h-5" /> {t('chat.startConversation')}
                </button>

                {/* Past sessions list */}
                {sessions.length > 0 && (
                    <div className="space-y-4 w-full max-w-full overflow-hidden flex flex-col min-w-0">
                        <h3 className="text-sm font-bold text-[var(--color-on-surface-muted)] flex items-center gap-2">
                            <History className="w-4 h-4" /> {t('chat.history')}
                        </h3>
                        {(isFree ? sessions.slice(0, 2) : sessions).map(session => {
                            const msgCount = session.messages.filter(m => m.role === 'user').length;
                            const dateStr = session.startedAt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                            const preview = session.messages.find(m => m.role === 'user')?.content || '';
                            return (
                                <button key={session.id}
                                    onClick={() => { setReadonlySession(session); setView('readonly'); }}
                                    className="w-full min-w-0 max-w-full overflow-hidden text-left bg-[var(--color-card)] rounded-[2rem] p-5 shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300 space-y-2 flex flex-col justify-between">
                                    <div className="flex justify-between items-center w-full min-w-0">
                                        <span className="text-xs text-[var(--color-on-surface-muted)] shrink-0">{dateStr}</span>
                                        <span className="text-xs bg-[var(--color-surface-container)] px-3 py-0.5 rounded-full text-[var(--color-on-surface-muted)] font-medium shrink-0">{session.level}</span>
                                    </div>
                                    <p className="text-sm text-[var(--color-on-surface)] truncate font-medium block w-full min-w-0">{preview}</p>
                                    <p className="text-xs text-[var(--color-on-surface-muted)] shrink-0">{msgCount} {msgCount === 1 ? 'mensaje' : 'mensajes'}</p>
                                </button>
                            );
                        })}
                        {isFree && sessions.length > 2 && (
                            <div className="text-center py-4 space-y-2">
                                <p className="text-sm text-[var(--color-on-surface-muted)]">
                                    <Lock className="w-3.5 h-3.5 inline mr-1" />
                                    {sessions.length - 2} conversaciones mas disponibles en Plan Pro
                                </p>
                                <Link to="/pricing" className="text-xs text-[var(--color-primary)] font-bold hover:underline">
                                    Desbloquear historial completo
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {sessions.length === 0 && (
                    <p className="text-center text-[var(--color-on-surface-muted)] text-sm py-8">{t('chat.noHistory')}</p>
                )}
            </div>
        );
    }

    // ── READONLY VIEW ──
    if (view === 'readonly' && readonlySession) {
        return (
            <div className="flex flex-col h-[calc(100dvh-6rem)] max-h-[calc(100dvh-6rem)] overflow-x-hidden">
                <style>{`.floating-bar { display: none !important; }`}</style>

                {/* Header with back button */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between pb-6 mb-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setView('history'); setReadonlySession(null); }} className="p-2 rounded-full bg-[var(--color-card)] shadow-[var(--shadow-card)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="space-y-0.5">
                            <h2 className="font-black text-lg tracking-tight leading-tight">{t('chat.title')}</h2>
                            <p className="text-xs text-[var(--color-on-surface-muted)]">
                                {readonlySession.startedAt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <span className="text-xs bg-[var(--color-level-b1)]/10 text-[var(--color-level-b1)] px-4 py-1.5 rounded-full font-bold shadow-[var(--shadow-card)]">
                        {t('chat.readOnly')}
                    </span>
                </motion.div>

                {/* Read-only messages */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4">
                    {readonlySession.messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[85%] space-y-2.5">
                                <div className={`text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-2xl rounded-br-sm p-4 shadow-[var(--shadow-elevated)]'
                                        : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] rounded-2xl rounded-bl-sm p-4 shadow-[var(--shadow-card)]'
                                }`}>
                                    {msg.content}
                                </div>
                                {msg.corrections && msg.corrections.length > 0 && (
                                    <div className="bg-[var(--color-card)] border-l-2 border-[var(--color-warning)] rounded-xl p-4 shadow-[var(--shadow-card)] mt-2 space-y-2 text-sm text-left">
                                        <p className="text-xs font-bold text-[var(--color-warning)] flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 text-[var(--color-warning)]" />
                                            <span>💡 {t('chat.corrections', 'Sugerencia del Tutor')}</span>
                                        </p>
                                        {msg.corrections.map((c, ci) => (
                                            <div key={ci} className="text-xs space-y-1">
                                                <p>
                                                    <span className="line-through text-[var(--color-error)]/70">{c.original}</span>
                                                    {' → '}
                                                    <span className="text-[var(--color-success)] font-bold">{c.corrected}</span>
                                                </p>
                                                <p className="text-[var(--color-on-surface-muted)] italic leading-relaxed">{c.explanation}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── CHAT VIEW (active conversation) ──
    return (
        <div className="flex flex-col h-[calc(100dvh-6rem)] max-h-[calc(100dvh-6rem)] overflow-x-hidden">
            {/* Hide floating bottom bar */}
            <style>{`.floating-bar { display: none !important; }`}</style>

            {/* End session confirmation modal */}
            {showEndConfirm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                        className="bg-[var(--color-card)] rounded-[2rem] p-7 max-w-sm w-full space-y-5 shadow-[var(--shadow-float)]">
                        <h3 className="font-black text-lg tracking-tight">{t('chat.endSessionConfirm')}</h3>
                        <div className="flex gap-3">
                            <button onClick={() => setShowEndConfirm(false)}
                                className="flex-1 bg-[var(--color-surface-container)] text-[var(--color-on-surface)] py-3 rounded-full font-bold shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
                                {t('common.cancel')}
                            </button>
                            <button onClick={handleEndSession}
                                className="flex-1 py-3 rounded-full font-bold bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
                                {t('chat.endSession')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between pb-6 mb-6 shrink-0"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-full bg-[var(--color-card)] shadow-[var(--shadow-card)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-level-a1)] to-[var(--color-primary)] flex items-center justify-center shadow-[var(--shadow-elevated)]">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="font-black text-lg tracking-tight leading-tight">{t('chat.title')}</h2>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-[var(--color-on-surface-muted)] leading-relaxed">{t('chat.level', { level })}</p>
                                {isFree && tutorUsage && (
                                    <UsageBadge remaining={tutorUsage.remaining} limit={tutorUsage.limit} label="mensajes" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowEndConfirm(true)}
                    className="text-xs bg-[var(--color-error)]/10 text-[var(--color-error)] px-3 py-2 sm:px-4 sm:py-2 rounded-full font-bold hover:bg-[var(--color-error)]/20 hover:-translate-y-0.5 transition-all duration-300 shadow-[var(--shadow-card)] flex items-center gap-1.5 shrink-0"
                    disabled={messages.length === 0}>
                    <X className="sm:hidden w-4 h-4" />
                    <span className="hidden sm:inline">{t('chat.endSession')}</span>
                </button>
            </motion.div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4 flex flex-col">
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center text-center py-10 px-4 space-y-6 my-auto max-w-md w-full mx-auto">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center shadow-lg animate-pulse">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-extrabold text-lg text-[var(--color-on-surface)]">¡Conéctate con tu Tutor de IA!</h3>
                            <p className="text-xs text-[var(--color-on-surface-muted)] leading-relaxed">
                                Practica tu inglés de forma interactiva. Di "Hello" o selecciona una de nuestras sugerencias temáticas para comenzar la conversación.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 w-full pt-2">
                            <button onClick={() => sendMessage('Hello! I want to practice casual conversation.')}
                                className="text-xs font-semibold text-left bg-[var(--color-card)] border border-[var(--color-outline-subtle)] hover:bg-[var(--color-surface-container)] hover:-translate-y-0.5 transition-all duration-300 p-3.5 rounded-2xl shadow-[var(--shadow-card)] flex items-center gap-3 w-full group">
                                <span className="text-2xl p-2 rounded-xl bg-purple-500/10 group-hover:scale-110 transition-transform duration-300">💬</span>
                                <div>
                                    <p className="text-[var(--color-on-surface)] font-bold text-sm">Charla casual</p>
                                    <p className="text-[10px] text-[var(--color-on-surface-muted)] font-normal mt-0.5">Plática espontánea sobre cualquier tema cotidiano.</p>
                                </div>
                            </button>
                            <button onClick={() => sendMessage('Hi! Let\'s practice a restaurant roleplay.')}
                                className="text-xs font-semibold text-left bg-[var(--color-card)] border border-[var(--color-outline-subtle)] hover:bg-[var(--color-surface-container)] hover:-translate-y-0.5 transition-all duration-300 p-3.5 rounded-2xl shadow-[var(--shadow-card)] flex items-center gap-3 w-full group">
                                <span className="text-2xl p-2 rounded-xl bg-purple-500/10 group-hover:scale-110 transition-transform duration-300">🍔</span>
                                <div>
                                    <p className="text-[var(--color-on-surface)] font-bold text-sm">Roleplay en un Restaurante</p>
                                    <p className="text-[10px] text-[var(--color-on-surface-muted)] font-normal mt-0.5">Simula ordenar comida y platicar en un café.</p>
                                </div>
                            </button>
                            <button onClick={() => sendMessage('Hello! I want to prepare for a job interview.')}
                                className="text-xs font-semibold text-left bg-[var(--color-card)] border border-[var(--color-outline-subtle)] hover:bg-[var(--color-surface-container)] hover:-translate-y-0.5 transition-all duration-300 p-3.5 rounded-2xl shadow-[var(--shadow-card)] flex items-center gap-3 w-full group">
                                <span className="text-2xl p-2 rounded-xl bg-purple-500/10 group-hover:scale-110 transition-transform duration-300">💼</span>
                                <div>
                                    <p className="text-[var(--color-on-surface)] font-bold text-sm">Práctica de Entrevista</p>
                                    <p className="text-[10px] text-[var(--color-on-surface-muted)] font-normal mt-0.5">Simulación de preguntas y respuestas profesionales.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] space-y-2.5`}>
                                {/* Message bubble */}
                                <div
                                    className={`leading-relaxed ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-2xl rounded-br-[0.25rem] p-3.5 md:p-4 text-xs md:text-sm shadow-[var(--shadow-elevated)]'
                                        : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] rounded-2xl rounded-bl-[0.25rem] p-3.5 md:p-4 text-xs md:text-sm shadow-[var(--shadow-card)]'
                                        }`}
                                >
                                    {msg.content}
                                </div>

                                {/* Corrections */}
                                {msg.corrections && msg.corrections.length > 0 && (
                                    <div className="bg-[var(--color-card)] border-l-2 border-[var(--color-warning)] rounded-xl p-4 shadow-[var(--shadow-card)] mt-2 space-y-2 text-sm text-left">
                                        <p className="text-xs font-bold text-[var(--color-warning)] flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 text-[var(--color-warning)]" />
                                            <span>💡 {t('chat.corrections', 'Sugerencia del Tutor')}</span>
                                        </p>
                                        {msg.corrections.map((c, ci) => (
                                            <div key={ci} className="text-xs space-y-1">
                                                <p>
                                                    <span className="line-through text-[var(--color-error)]/70">{c.original}</span>
                                                    {' → '}
                                                    <span className="text-[var(--color-success)] font-bold">{c.corrected}</span>
                                                </p>
                                                <p className="text-[var(--color-on-surface-muted)] italic leading-relaxed">{c.explanation}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-[var(--color-surface-container-low)] rounded-2xl rounded-bl-sm p-4 shadow-[var(--shadow-card)]">
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-[var(--color-on-surface-muted)] rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-2 h-2 bg-[var(--color-on-surface-muted)] rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-2 h-2 bg-[var(--color-on-surface-muted)] rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Error */}
                {error && (
                    <AIErrorCard
                        error={error}
                        onRetry={() => { setError(null); sendMessage(apiMessages.at(-1)?.content || 'Hello!'); }}
                        disabled={isLoading}
                    />
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !isLoading && (
                <div className="flex gap-2.5 overflow-x-auto py-3 shrink-0 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => handleSuggestion(s)}
                            className="text-xs bg-[var(--color-card)] hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] px-4 py-2.5 rounded-full whitespace-nowrap shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] transition-all duration-300 snap-start"
                        >
                            <Sparkles className="w-3 h-3 inline mr-1.5 text-[var(--color-primary)]" />{s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input area */}
            {isFree && tutorUsage && !tutorUsage.allowed ? (
                <div className="pt-5 shrink-0 text-center space-y-2 py-4">
                    <p className="text-sm text-[var(--color-on-surface-muted)] font-medium">
                        <Lock className="w-4 h-4 inline mr-1.5" />
                        Has usado tus {tutorUsage.limit} mensajes de hoy
                    </p>
                    <Link to="/pricing" className="text-sm text-[var(--color-primary)] font-bold hover:underline">
                        Desbloquea chat ilimitado con Plan Pro
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex gap-3 pt-5 shrink-0">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={t('chat.placeholder')}
                        disabled={isLoading}
                        className="flex-1 bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] placeholder:text-xs md:placeholder:text-sm rounded-full px-5 py-3 text-xs md:text-sm outline-none focus:shadow-[var(--shadow-elevated)] transition-all duration-300"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white rounded-full px-5 py-3 shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] transition-all duration-300 disabled:opacity-40 active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            )}
        </div>
    );
}
