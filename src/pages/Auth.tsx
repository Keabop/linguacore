import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import PageLoader from '../components/PageLoader';
import AuthBackdrop from '../components/ui/AuthBackdrop';
import Wordmark, { LeafMark } from '../components/ui/Wordmark';

type Mode = 'login' | 'register';

/**
 * The auth screens' frame. On a phone the landscape covers the whole screen behind the card;
 * on a wide screen it fills a panel on the left, next to the form.
 */
function AuthShell({ children }: { children: ReactNode }) {
    const { t } = useTranslation();
    return (
        <div className="relative min-h-screen bg-[var(--color-background)] lg:grid lg:grid-cols-2">
            <AuthBackdrop className="fixed inset-0 h-full w-full lg:hidden" />
            <aside className="relative m-4 hidden overflow-hidden rounded-[var(--radius-lg)] lg:block">
                <AuthBackdrop className="absolute inset-0 h-full w-full" />
                <div className="relative z-10 flex h-full flex-col p-10">
                    <Wordmark className="text-2xl" />
                    <p className="mt-16 max-w-sm font-display text-4xl font-extrabold leading-tight tracking-[-0.035em] text-[var(--color-on-surface)]">
                        {t('auth.tagline')}
                    </p>
                </div>
            </aside>
            <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
                {children}
            </main>
        </div>
    );
}

export default function Auth() {
    const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [registered, setRegistered] = useState(false);

    // Already logged in → go to dashboard
    if (!loading && user) return <Navigate to="/dashboard" replace />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (mode === 'register') {
                const { error } = await signUp(email, password);
                if (error) {
                    setError(error);
                } else {
                    setRegistered(true);
                }
            } else {
                const { error } = await signIn(email, password);
                if (error) setError(error);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <PageLoader />;

    if (registered) {
        return (
            <AuthShell>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-10 max-w-sm w-full text-center space-y-5 shadow-[var(--shadow-float)]"
                >
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto">
                        <Mail className="w-8 h-8 text-[var(--color-primary)]" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-[var(--color-on-surface)] font-display">Revisa tu correo</h2>
                    <p className="text-sm text-[var(--color-on-surface-muted)] font-body leading-relaxed">
                        Te enviamos un enlace de confirmación a <span className="text-[var(--color-on-surface)] font-semibold">{email}</span>. Haz clic en el enlace para activar tu cuenta.
                    </p>
                    <button
                        onClick={() => { setRegistered(false); setMode('login'); }}
                        className="text-sm text-[var(--color-primary)] font-bold hover:text-[var(--color-primary-light)] transition-all duration-300"
                    >
                        Volver al login
                    </button>
                </motion.div>
            </AuthShell>
        );
    }

    return (
        <AuthShell>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[420px] bg-[var(--color-card)] rounded-[var(--radius-lg)] p-7 sm:p-8 shadow-[var(--shadow-float)]"
            >
                {/* Logo + Branding */}
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-container)]">
                        <LeafMark className="h-9 w-9" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-[var(--color-on-surface)] tracking-[-0.04em] mb-1 font-display">voxie</h1>
                    <p className="text-sm text-[var(--color-on-surface-muted)] font-body">
                        {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta para empezar'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="auth-email" className="block text-xs text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider mb-2.5 font-body">Correo electrónico</label>
                        <input
                            id="auth-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            required
                            className="w-full text-sm bg-[var(--color-surface-container-low)] rounded-full px-5 py-3.5 text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:bg-[var(--color-surface-container)] transition-all duration-300 font-body"
                        />
                    </div>

                    <div>
                        <label htmlFor="auth-password" className="block text-xs text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider mb-2.5 font-body">Contraseña</label>
                        <input
                            id="auth-password"
                            type="password"
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="w-full text-sm bg-[var(--color-surface-container-low)] rounded-full px-5 py-3.5 text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:bg-[var(--color-surface-container)] transition-all duration-300 font-body"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-[var(--color-error)] bg-[var(--color-error)]/8 rounded-2xl px-5 py-3 font-body">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full font-bold shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
                    >
                        {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-7">
                    <div className="flex-1 h-px bg-[var(--color-surface-container-high)]" />
                    <span className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider font-body">o</span>
                    <div className="flex-1 h-px bg-[var(--color-surface-container-high)]" />
                </div>

                {/* Google OAuth */}
                <button
                    onClick={signInWithGoogle}
                    className="w-full py-4 text-sm flex items-center justify-center gap-3 bg-[var(--color-surface-container-low)] rounded-full font-semibold text-[var(--color-on-surface)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300 shadow-[var(--shadow-card)]"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar con Google
                </button>

                {/* Toggle mode: inside the card, so nothing behind it can cover it */}
                <p className="text-center text-sm text-[var(--color-on-surface-muted)] mt-7 font-body">
                    {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                    {' '}
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                        className="text-[var(--color-primary)] font-bold hover:text-[var(--color-primary-light)] transition-all duration-300"
                    >
                        {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                    </button>
                </p>
            </motion.div>
        </AuthShell>
    );
}
