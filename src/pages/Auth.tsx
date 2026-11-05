import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import PageLoader from '../components/PageLoader';
import { loadGuest } from '../lib/guestTrial';
import AuthBackdrop from '../components/ui/AuthBackdrop';
import Wordmark from '../components/ui/Wordmark';
import { LegalCheckbox } from '../components/LegalConsent';
import PillTabs, { panelId, tabId } from '../components/ui/PillTabs';

type Mode = 'login' | 'register';

const legalLink = 'font-semibold text-[var(--color-primary)] underline underline-offset-2';

/**
 * The door to the garden: on the leaf-green desk, the notebook's cover (the garden landscape) and
 * its first page, where you sign in or start your own. On a phone the cover shrinks to a band.
 */
function AuthShell({ children }: { children: ReactNode }) {
    const { t } = useTranslation();
    return (
        <div className="nb-ground min-h-screen px-3 py-4 sm:px-6 sm:py-8 flex flex-col">
            <header className="mx-auto w-full max-w-[64rem] pb-4 sm:pb-6">
                <Link to="/landing" aria-label="Voxie"><Wordmark className="text-2xl !text-[var(--color-on-primary)]" markClassName="w-7 h-7 !text-[var(--color-on-primary)]" /></Link>
            </header>
            <div className="auth-book mx-auto w-full max-w-[64rem] flex-1">
                <aside className="auth-cover">
                    <AuthBackdrop className="absolute inset-0 h-full w-full" />
                    <p className="auth-cover-line">{t('auth.tagline')}</p>
                </aside>
                <main className="nb-page auth-page">{children}</main>
            </div>
        </div>
    );
}

export default function Auth() {
    const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
    const { t } = useTranslation();
    // A visitor coming from the trial (/probar) is most likely here to sign up
    const [fromTrial] = useState(() => loadGuest() !== null);
    const [mode, setMode] = useState<Mode>(fromTrial ? 'register' : 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [accepted, setAccepted] = useState(false);
    // Signing up waits for the terms and the age; a Google account accepts them on its first visit
    const blocked = mode === 'register' && !accepted;

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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="auth-form text-center space-y-5"
                >
                    <div className="w-16 h-16 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center mx-auto">
                        <Mail className="w-8 h-8 text-[var(--color-primary)]" />
                    </div>
                    <h2 className="auth-title">Revisa tu correo</h2>
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="auth-form"
            >
                <PillTabs
                    className="auth-tabs"
                    label="Acceso"
                    idBase="auth"
                    value={mode}
                    onChange={m => { setMode(m); setError(null); }}
                    tabs={[{ value: 'login', label: 'Entrar' }, { value: 'register', label: 'Crear cuenta' }]}
                />

                <div role="tabpanel" id={panelId('auth', mode)} aria-labelledby={tabId('auth', mode)}>
                <div className="mb-7 space-y-2">
                    <h1 className="auth-title">{mode === 'login' ? 'Vuelve a tu jardín' : 'Empieza tu jardín'}</h1>
                    <p className="text-sm text-[var(--color-on-surface-muted)]">
                        {mode === 'login' ? 'Tus plantas siguen donde las dejaste.' : 'Gratis, de A1 a B2. Tu primera semilla te espera.'}
                    </p>
                    {fromTrial && <p className="text-xs font-semibold text-[var(--color-primary)]">{t('trial.pending')}</p>}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="auth-email" className="auth-label">Correo electrónico</label>
                        <input
                            id="auth-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            required
                            className="auth-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="auth-password" className="auth-label">Contraseña</label>
                        <input
                            id="auth-password"
                            type="password"
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="auth-input"
                        />
                    </div>

                    {mode === 'register' && <LegalCheckbox checked={accepted} onChange={setAccepted} />}

                    {error && (
                        <p role="alert" className="text-sm text-[var(--color-error)] bg-[var(--color-error-light)] rounded-[var(--radius-sm)] px-4 py-3">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || blocked}
                        className="btn-primary w-full py-3.5 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
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
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-7">
                    <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
                    <span className="text-xs text-[var(--color-on-surface-variant)]">o</span>
                    <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
                </div>

                {/* Google OAuth */}
                <button
                    onClick={signInWithGoogle}
                    disabled={blocked}
                    className="btn-secondary w-full py-3.5 text-sm flex items-center justify-center gap-3 auth-google disabled:opacity-50 disabled:pointer-events-none"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar con Google
                </button>

                {/* Simplified privacy notice: the law asks for it where the data is collected */}
                <p className="mt-6 text-[11px] leading-relaxed text-[var(--color-on-surface-muted)] font-body">
                    {t('legal.shortNotice')}{' '}
                    <Link to="/privacidad" target="_blank" rel="noreferrer" className={legalLink}>{t('legal.fullNotice')}</Link>
                </p>
            </motion.div>
        </AuthShell>
    );
}
