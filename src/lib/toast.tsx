import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration?: number;
}

type ToastListener = (message: ToastMessage) => void;
const listeners = new Set<ToastListener>();

export const toast = {
    success: (opts: { title: string; description?: string; duration?: number }) => {
        emit('success', opts);
    },
    error: (opts: { title: string; description?: string; duration?: number }) => {
        emit('error', opts);
    },
    warning: (opts: { title: string; description?: string; duration?: number }) => {
        emit('warning', opts);
    },
    info: (opts: { title: string; description?: string; duration?: number }) => {
        emit('info', opts);
    }
};

function emit(type: 'success' | 'error' | 'warning' | 'info', opts: { title: string; description?: string; duration?: number }) {
    const message: ToastMessage = {
        id: Math.random().toString(36).substring(2, 9),
        type,
        title: opts.title,
        description: opts.description,
        duration: opts.duration ?? (opts.description && opts.description.length > 30 ? 4000 : 3000)
    };
    listeners.forEach(listener => listener(message));
}

export function Toaster() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const handleNewToast = (msg: ToastMessage) => {
            setToasts(prev => [...prev, msg]);
            
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== msg.id));
            }, msg.duration);
        };

        listeners.add(handleNewToast);
        return () => {
            listeners.delete(handleNewToast);
        };
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none font-sans">
            {toasts.map((t) => {
                const styles = getToastStyles(t.type);
                const Icon = styles.icon;

                return (
                    <div
                        key={t.id}
                        className={`p-4 rounded-[1.25rem] voxie-toast toast-${t.type} pointer-events-auto flex items-start gap-3 w-full relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 animate-toast-enter`}
                    >
                        <div className={`p-1.5 rounded-xl ${styles.iconBg} ${styles.iconColor} shrink-0`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="space-y-1 pr-6 flex-1 text-left">
                            <h4 className="font-extrabold text-xs tracking-tight leading-tight">{t.title}</h4>
                            {t.description && (
                                <p className="text-[10px] font-semibold text-[var(--color-on-surface-muted)] leading-relaxed">{t.description}</p>
                            )}
                        </div>

                        <button
                            onClick={() => removeToast(t.id)}
                            className="absolute top-4 right-4 p-0.5 rounded-full text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] transition-all shrink-0 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

function getToastStyles(type: 'success' | 'error' | 'warning' | 'info') {
    switch (type) {
        case 'success':
            return {
                iconBg: 'bg-emerald-500/10',
                iconColor: 'text-emerald-500',
                icon: CheckCircle2
            };
        case 'error':
            return {
                iconBg: 'bg-rose-500/10',
                iconColor: 'text-rose-500',
                icon: XCircle
            };
        case 'warning':
            return {
                iconBg: 'bg-amber-500/10',
                iconColor: 'text-amber-500',
                icon: AlertTriangle
            };
        case 'info':
        default:
            return {
                iconBg: 'bg-[var(--color-primary)]/10',
                iconColor: 'text-[var(--color-primary)]',
                icon: Info
            };
    }
}
