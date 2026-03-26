import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-prompt-dismissed';

function isStandalone(): boolean {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true
    );
}

function isIOS(): boolean {
    return /iP(hone|od|ad)/.test(navigator.userAgent) && !(window as any).MSStream;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === 'true');
    const [showIOSHint, setShowIOSHint] = useState(false);

    useEffect(() => {
        if (isStandalone() || dismissed) return;

        if (isIOS()) {
            setShowIOSHint(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [dismissed]);

    const dismiss = () => {
        setDismissed(true);
        localStorage.setItem(DISMISS_KEY, 'true');
        setDeferredPrompt(null);
        setShowIOSHint(false);
    };

    const install = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') dismiss();
        setDeferredPrompt(null);
    };

    // Already installed or dismissed
    if (isStandalone() || dismissed) return null;
    // Nothing to show (not iOS and no deferred prompt)
    if (!showIOSHint && !deferredPrompt) return null;

    return (
        <div className="bg-[var(--color-card)] border border-primary/30 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <Download className="w-5 h-5 text-[var(--color-primary)] mt-0.5 shrink-0" />

            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--color-on-surface)]">Instala Voxie en tu dispositivo</p>

                {showIOSHint ? (
                    <p className="text-xs text-[var(--color-on-surface-muted)] mt-1 leading-relaxed">
                        Toca <span className="font-semibold text-[var(--color-on-surface-muted)]">Compartir</span> y luego{' '}
                        <span className="font-semibold text-[var(--color-on-surface-muted)]">Agregar a inicio</span>.
                    </p>
                ) : deferredPrompt ? (
                    <button
                        onClick={install}
                        className="mt-2 bg-[var(--color-primary)] text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Instalar ahora
                    </button>
                ) : (
                    <p className="text-xs text-[var(--color-on-surface-muted)] mt-1 leading-relaxed">
                        Abre el menú del navegador y selecciona &quot;Instalar aplicación&quot;.
                    </p>
                )}
            </div>

            <button onClick={dismiss} className="text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface-muted)] transition-colors shrink-0">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
