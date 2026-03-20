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
            <div className="min-h-screen bg-bg-app flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 z-0"><Aurora colorStops={["#4F46E5", "#6366F1", "#A78BFA"]} speed={0.3} blend={0.5} amplitude={0.6} /></div>
                <div className="relative z-10 w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (registered) {
        return (
            <div className="min-h-screen bg-bg-app flex items-center justify-center px-4 relative overflow-hidden">
                <div className="absolute inset-0 z-0"><Aurora colorStops={["#4F46E5", "#6366F1", "#A78BFA"]} speed={0.3} blend={0.5} amplitude={0.6} /></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 bg-bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center space-y-4"
                >
                    <Mail className="w-10 h-10 text-primary mx-auto" />
                    <h2 className="text-lg font-bold text-text">Revisa tu correo</h2>
                    <p className="text-sm text-text-muted">
                        Te enviamos un enlace de confirmación a <span className="text-text font-medium">{email}</span>. Haz clic en el enlace para activar tu cuenta.
                    </p>
                    <button
                        onClick={() => { setRegistered(false); setMode('login'); }}
                        className="text-sm text-primary font-semibold hover:text-primary-light transition-colors"
                    >
                        Volver al login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-app flex items-center justify-center px-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0"><Aurora colorStops={["#4F46E5", "#6366F1", "#A78BFA"]} speed={0.3} blend={0.5} amplitude={0.6} /></div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-[420px]"
            >
                {/* Logo + Branding */}
                <div className="flex flex-col items-center mb-12">
                    <img
                        src="/logo.png"
                        alt="Voxie"
                        className="w-20 h-20 rounded-2xl object-cover mb-6"
                    />
                    <h1 className="text-3xl font-extrabold text-text tracking-tight mb-2">Voxie</h1>
                    <p className="text-sm text-text-muted">
                        {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta para empezar'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">Correo electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            required
                            className="w-full bg-bg-card border border-border rounded-xl px-5 py-4 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            className="w-full bg-bg-card border border-border rounded-xl px-5 py-4 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-4 py-2.5">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
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
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-text-muted uppercase tracking-wider">o</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Google OAuth */}
                <button
                    onClick={signInWithGoogle}
                    className="w-full bg-bg-card border border-border hover:border-primary/30 text-text font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm mb-8"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar con Google
                </button>

                {/* Toggle mode */}
                <p className="text-center text-sm text-text-muted">
                    {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                    {' '}
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                        className="text-primary font-semibold hover:text-primary-light transition-colors"
                    >
                        {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
