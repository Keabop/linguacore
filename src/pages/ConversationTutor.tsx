import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useConversationHistory, type ConversationSession } from '../hooks/useConversationHistory';
import { chatWithTutor, type ConversationMessage, type ConversationResponse } from '../lib/ai';
import { Send, Sparkles, ArrowLeft, MessageCircle, AlertCircle, History, Plus, Lock } from 'lucide-react';
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
            <div className="space-y-8">
                <style>{`.floating-bar { display: none !important; }`}</style>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between pb-6 border-b border-[var(--color-outline-subtle)]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-level-a1)] to-[var(--color-primary)] flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-[var(--color-on-primary)]" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-bold text-base leading-tight">{t('chat.title')}</h2>
                                <p className="text-xs text-[var(--color-on-surface-muted)]">{t('chat.level', { level })}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* New conversation button */}
                <button onClick={startNewConversation}
                    className="btn-primary w-full py-4 font-bold flex items-center justify-center gap-3">
                    <Plus className="w-5 h-5" /> {t('chat.startConversation')}
                </button>

                {/* Past sessions list */}
                {sessions.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[var(--color-on-surface-muted)] flex items-center gap-2">
                            <History className="w-4 h-4" /> {t('chat.history')}
                        </h3>
                        {(isFree ? sessions.slice(0, 2) : sessions).map(session => {
                            const msgCount = session.messages.filter(m => m.role === 'user').length;
                            const dateStr = session.startedAt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                            const preview = session.messages.find(m => m.role === 'user')?.content || '';
                            return (
                                <button key={session.id}
                                    onClick={() => { setReadonlySession(session); setView('readonly'); }}
                                    className="w-full text-left bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-xl p-5 hover:border-[var(--color-primary)]/30 transition-all space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-[var(--color-on-surface-muted)]">{dateStr}</span>
                                        <span className="text-xs bg-[var(--color-background)] px-2 py-0.5 rounded-full text-[var(--color-on-surface-muted)]">{session.level}</span>
                                    </div>
                                    <p className="text-sm text-[var(--color-on-surface)] truncate">{preview}</p>
                                    <p className="text-xs text-[var(--color-on-surface-muted)]">{msgCount} {msgCount === 1 ? 'mensaje' : 'mensajes'}</p>
                                </button>
                            );
                        })}
                        {isFree && sessions.length > 2 && (
                            <div className="text-center py-4 space-y-2">
                                <p className="text-sm text-[var(--color-on-surface-muted)]">
                                    <Lock className="w-3.5 h-3.5 inline mr-1" />
                                    {sessions.length - 2} conversaciones mas disponibles en Plan Pro
                                </p>
                                <Link to="/pricing" className="text-xs text-[var(--color-primary)] font-semibold hover:underline">
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
                    className="flex items-center justify-between pb-6 border-b border-[var(--color-outline-subtle)] mb-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setView('history'); setReadonlySession(null); }} className="text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="space-y-1">
                            <h2 className="font-bold text-base leading-tight">{t('chat.title')}</h2>
                            <p className="text-xs text-[var(--color-on-surface-muted)]">
                                {readonlySession.startedAt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <span className="text-xs bg-[var(--color-level-b1)]/10 text-[var(--color-level-b1)] px-3 py-1 rounded-full font-semibold">
                        {t('chat.readOnly')}
                    </span>
                </motion.div>

                {/* Read-only messages */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4">
                    {readonlySession.messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[85%] space-y-2.5">
                                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-[var(--color-primary)]/60 text-[var(--color-on-primary)] rounded-br-md'
                                        : 'bg-[var(--color-card)] text-[var(--color-on-surface)] border border-[var(--color-outline-subtle)] rounded-bl-md'
                                }`}>
                                    {msg.content}
                                </div>
                                {msg.corrections && msg.corrections.length > 0 && (
                                    <div className="bg-[var(--color-level-b1)]/10 border border-[var(--color-level-b1)]/20 rounded-xl px-4 py-3 space-y-2">
                                        <p className="text-xs font-bold text-[var(--color-level-b1)] flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" /> {t('chat.corrections')}
                                        </p>
                                        {msg.corrections.map((c, ci) => (
                                            <div key={ci} className="text-xs space-y-1">
                                                <p>
                                                    <span className="line-through text-[var(--color-error)]/70">{c.original}</span>
                                                    {' → '}
                                                    <span className="text-[var(--color-primary)] font-bold">{c.corrected}</span>
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
                        className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-2xl p-6 max-w-sm w-full space-y-5">
                        <h3 className="font-bold text-base">{t('chat.endSessionConfirm')}</h3>
                        <div className="flex gap-3">
                            <button onClick={() => setShowEndConfirm(false)}
                                className="flex-1 bg-[var(--color-background)] border border-[var(--color-outline-subtle)] text-[var(--color-on-surface)] py-3 rounded-xl font-semibold transition-all">
                                {t('common.cancel')}
                            </button>
                            <button onClick={handleEndSession}
                                className="btn-primary flex-1 py-3 font-semibold">
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
                className="flex items-center justify-between pb-6 border-b border-[var(--color-outline-subtle)] mb-6 shrink-0"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-level-a1)] to-[var(--color-primary)] flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-[var(--color-on-primary)]" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="font-bold text-base leading-tight">{t('chat.title')}</h2>
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
                    className="text-xs bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 px-3 py-1.5 rounded-lg hover:bg-[var(--color-error)]/20 transition-all"
                    disabled={messages.length === 0}>
                    {t('chat.endSession')}
                </button>
            </motion.div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4">
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
                                    className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-br-md'
                                        : 'bg-[var(--color-card)] text-[var(--color-on-surface)] border border-[var(--color-outline-subtle)] rounded-bl-md'
                                        }`}
                                >
                                    {msg.content}
                                </div>

                                {/* Corrections */}
                                {msg.corrections && msg.corrections.length > 0 && (
                                    <div className="bg-[var(--color-level-b1)]/10 border border-[var(--color-level-b1)]/20 rounded-xl px-4 py-3 space-y-2">
                                        <p className="text-xs font-bold text-[var(--color-level-b1)] flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" /> {t('chat.corrections')}
                                        </p>
                                        {msg.corrections.map((c, ci) => (
                                            <div key={ci} className="text-xs space-y-1">
                                                <p>
                                                    <span className="line-through text-[var(--color-error)]/70">{c.original}</span>
                                                    {' → '}
                                                    <span className="text-[var(--color-primary)] font-bold">{c.corrected}</span>
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
                        <div className="bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-2xl rounded-bl-md px-5 py-3.5">
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
                <div className="flex gap-3 overflow-x-auto py-4 shrink-0">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => handleSuggestion(s)}
                            className="text-xs bg-[var(--color-card)] hover:bg-[var(--color-surface)] border border-[var(--color-outline-subtle)] text-[var(--color-on-surface-muted)] px-4 py-2 rounded-full whitespace-nowrap transition-all hover:border-[var(--color-primary)]/40"
                        >
                            <Sparkles className="w-3 h-3 inline mr-1.5" />{s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input area */}
            {isFree && tutorUsage && !tutorUsage.allowed ? (
                <div className="pt-5 border-t border-[var(--color-outline-subtle)] shrink-0 text-center space-y-2 py-4">
                    <p className="text-sm text-[var(--color-on-surface-muted)] font-medium">
                        <Lock className="w-4 h-4 inline mr-1.5" />
                        Has usado tus {tutorUsage.limit} mensajes de hoy
                    </p>
                    <Link to="/pricing" className="text-sm text-[var(--color-primary)] font-semibold hover:underline">
                        Desbloquea chat ilimitado con Plan Pro
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex gap-3 pt-5 border-t border-[var(--color-outline-subtle)] shrink-0">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={t('chat.placeholder')}
                        disabled={isLoading}
                        className="input-soft flex-1"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="btn-primary disabled:opacity-40 px-5 active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            )}
        </div>
    );
}
