import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import Aurora from '../components/reactbits/Aurora';

type Mode = 'login' | 'register';

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 z-0"><Aurora colorStops={["#702AE1", "#B28CFF", "#FEF3FF"]} speed={0.3} blend={0.5} amplitude={0.6} /></div>
                <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] animate-spin shadow-[var(--shadow-elevated)]" style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 50%, 90% 50%, 90% 10%, 50% 10%)' }} />
            </div>
        );
    }

    if (registered) {
        return (
            <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4 relative overflow-hidden">
                <div className="absolute inset-0 z-0"><Aurora colorStops={["#702AE1", "#B28CFF", "#FEF3FF"]} speed={0.3} blend={0.5} amplitude={0.6} /></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 bg-[var(--color-card)] rounded-[2rem] p-10 max-w-sm w-full text-center space-y-5 shadow-[var(--shadow-float)]"
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
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0"><Aurora colorStops={["#702AE1", "#B28CFF", "#FEF3FF"]} speed={0.3} blend={0.5} amplitude={0.6} /></div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-[420px]"
            >
                {/* Logo + Branding */}
                <div className="flex flex-col items-center mb-12">
                    <div className="relative mb-6">
                        <img
                            src="/logo.png"
                            alt="Voxie"
                            className="w-20 h-20 rounded-2xl object-cover shadow-[var(--shadow-elevated)]"
                        />
                        <div className="absolute -inset-2 rounded-3xl bg-[var(--color-primary)]/10 blur-xl -z-10" />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight mb-2 font-display">Voxie</h1>
                    <p className="text-sm text-[var(--color-on-surface-muted)] font-body">
                        {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta para empezar'}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-[var(--color-card)] rounded-[2rem] p-8 shadow-[var(--shadow-float)]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider mb-2.5 font-body">Correo electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                                className="w-full text-sm bg-[var(--color-surface-container-low)] rounded-full px-5 py-3.5 text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:bg-[var(--color-surface-container)] transition-all duration-300 font-body"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-[var(--color-on-surface-muted)] font-bold uppercase tracking-wider mb-2.5 font-body">Contraseña</label>
                            <input
                                type="password"
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
                            className="w-full py-4 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white rounded-full font-bold shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
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
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-[var(--color-surface-container-high)]" />
                        <span className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider font-body">o</span>
                        <div className="flex-1 h-px bg-[var(--color-surface-container-high)]" />
                    </div>

                    {/* Google OAuth */}
                    <button
                        onClick={signInWithGoogle}
                        className="w-full py-4 text-sm flex items-center justify-center gap-3 bg-[var(--color-surface-container-low)] rounded-full font-semibold text-[var(--color-on-surface)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300 shadow-[var(--shadow-card)]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar con Google
                    </button>
                </div>

                {/* Toggle mode */}
                <p className="text-center text-sm text-[var(--color-on-surface-muted)] mt-8 font-body">
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
        </div>
    );
}
