import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useConversationHistory, type ConversationSession } from '../hooks/useConversationHistory';
import { chatWithTutor, type ConversationMessage, type ConversationResponse } from '../lib/ai';
import { Send, Sparkles, ArrowLeft, MessageCircle, AlertCircle, History, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AIErrorCard from '../components/AIErrorCard';
import { useErrorCards } from '../hooks/useErrorCards';

interface ChatBubble {
    role: 'user' | 'assistant';
    content: string;
    corrections?: ConversationResponse['corrections'];
    suggestions?: string[];
}

export default function ConversationTutor() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useLevelProgression();
    const { sessions, saveSession } = useConversationHistory();
    const { addErrorCard } = useErrorCards();

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
                    className="flex items-center justify-between pb-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-text-muted hover:text-text transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-primary flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-bold text-base leading-tight">{t('chat.title')}</h2>
                                <p className="text-xs text-text-muted">{t('chat.level', { level })}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* New conversation button */}
                <button onClick={startNewConversation}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3">
                    <Plus className="w-5 h-5" /> {t('chat.startConversation')}
                </button>

                {/* Past sessions list */}
                {sessions.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                            <History className="w-4 h-4" /> {t('chat.history')}
                        </h3>
                        {sessions.map(session => {
                            const msgCount = session.messages.filter(m => m.role === 'user').length;
                            const dateStr = session.startedAt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                            const preview = session.messages.find(m => m.role === 'user')?.content || '';
                            return (
                                <button key={session.id}
                                    onClick={() => { setReadonlySession(session); setView('readonly'); }}
                                    className="w-full text-left bg-bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-text-muted">{dateStr}</span>
                                        <span className="text-xs bg-bg-app px-2 py-0.5 rounded-full text-text-muted">{session.level}</span>
                                    </div>
                                    <p className="text-sm text-white truncate">{preview}</p>
                                    <p className="text-xs text-text-muted">{msgCount} {msgCount === 1 ? 'mensaje' : 'mensajes'}</p>
                                </button>
                            );
                        })}
                    </div>
                )}

                {sessions.length === 0 && (
                    <p className="text-center text-text-muted text-sm py-8">{t('chat.noHistory')}</p>
                )}
            </div>
        );
    }

    // ── READONLY VIEW ──
    if (view === 'readonly' && readonlySession) {
        return (
            <div className="flex flex-col h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)]">
                <style>{`.floating-bar { display: none !important; }`}</style>

                {/* Header with back button */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between pb-6 border-b border-border mb-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setView('history'); setReadonlySession(null); }} className="text-text-muted hover:text-text transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="space-y-1">
                            <h2 className="font-bold text-base leading-tight">{t('chat.title')}</h2>
                            <p className="text-xs text-text-muted">
                                {readonlySession.startedAt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <span className="text-xs bg-accent-orange/10 text-accent-orange px-3 py-1 rounded-full font-semibold">
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
                                        ? 'bg-primary/60 text-white rounded-br-md'
                                        : 'bg-bg-card text-text border border-border rounded-bl-md'
                                }`}>
                                    {msg.content}
                                </div>
                                {msg.corrections && msg.corrections.length > 0 && (
                                    <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-xl px-4 py-3 space-y-2">
                                        <p className="text-xs font-bold text-accent-orange flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" /> {t('chat.corrections')}
                                        </p>
                                        {msg.corrections.map((c, ci) => (
                                            <div key={ci} className="text-xs space-y-1">
                                                <p>
                                                    <span className="line-through text-accent-red/70">{c.original}</span>
                                                    {' → '}
                                                    <span className="text-primary font-bold">{c.corrected}</span>
                                                </p>
                                                <p className="text-text-muted italic leading-relaxed">{c.explanation}</p>
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
        <div className="flex flex-col h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)]">
            {/* Hide floating bottom bar */}
            <style>{`.floating-bar { display: none !important; }`}</style>

            {/* End session confirmation modal */}
            {showEndConfirm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                        className="bg-bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-5">
                        <h3 className="font-bold text-base">{t('chat.endSessionConfirm')}</h3>
                        <div className="flex gap-3">
                            <button onClick={() => setShowEndConfirm(false)}
                                className="flex-1 bg-bg-app border border-border text-white py-3 rounded-xl font-semibold transition-all">
                                {t('common.cancel')}
                            </button>
                            <button onClick={handleEndSession}
                                className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold transition-all">
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
                className="flex items-center justify-between pb-6 border-b border-border mb-6 shrink-0"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-text-muted hover:text-text transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-primary flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="font-bold text-base leading-tight">{t('chat.title')}</h2>
                            <p className="text-xs text-text-muted leading-relaxed">{t('chat.level', { level })}</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowEndConfirm(true)}
                    className="text-xs bg-accent-red/10 text-accent-red border border-accent-red/20 px-3 py-1.5 rounded-lg hover:bg-accent-red/20 transition-all"
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
                                        ? 'bg-primary text-white rounded-br-md'
                                        : 'bg-bg-card text-text border border-border rounded-bl-md'
                                        }`}
                                >
                                    {msg.content}
                                </div>

                                {/* Corrections */}
                                {msg.corrections && msg.corrections.length > 0 && (
                                    <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-xl px-4 py-3 space-y-2">
                                        <p className="text-xs font-bold text-accent-orange flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" /> {t('chat.corrections')}
                                        </p>
                                        {msg.corrections.map((c, ci) => (
                                            <div key={ci} className="text-xs space-y-1">
                                                <p>
                                                    <span className="line-through text-accent-red/70">{c.original}</span>
                                                    {' → '}
                                                    <span className="text-primary font-bold">{c.corrected}</span>
                                                </p>
                                                <p className="text-text-muted italic leading-relaxed">{c.explanation}</p>
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
                        <div className="bg-bg-card border border-border rounded-2xl rounded-bl-md px-5 py-3.5">
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:300ms]" />
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
                            className="text-xs bg-bg-card hover:bg-bg-card-hover border border-border text-text-secondary px-4 py-2 rounded-full whitespace-nowrap transition-all hover:border-primary/40"
                        >
                            <Sparkles className="w-3 h-3 inline mr-1.5" />{s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input area */}
            <form onSubmit={handleSubmit} className="flex gap-3 pt-5 border-t border-border shrink-0">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={t('chat.placeholder')}
                    disabled={isLoading}
                    className="flex-1 bg-bg-card border border-border rounded-xl px-5 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                    autoComplete="off"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-primary hover:bg-primary-dark disabled:opacity-40 text-white px-5 rounded-xl transition-all active:scale-95"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
