import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useTier } from '../hooks/useTier';
import { supabase } from '../lib/supabase';
import { CountUp } from '../components/reactbits';

const FREE_FEATURES = [
    'Nivel A1 completo (gramática, vocabulario, ejercicios)',
    '1 historia interactiva por semana',
    '10 repasos FSRS por día',
    '5 mensajes con el tutor IA por día',
    'Práctica de pronunciación',
    'Streak informativo',
];

const PRO_FEATURES = [
    'Todo lo de la versión gratuita',
    'Niveles A2, B1 y B2 desbloqueados',
    'Historias ilimitadas',
    'Repasos FSRS ilimitados',
    'Chat con tutor IA ilimitado',
    'Historial completo de conversaciones',
    'Tarjetas de error personalizadas',
    'Análisis de errores y patrones',
    'Estadísticas detalladas de progreso',
    'Evaluaciones de escritura completas',
];

export default function Pricing() {
    const { isPro, isFree } = useTier();
    const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubscribe(plan: 'monthly' | 'annual') {
        setError(null);
        setLoading(plan);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                setError('Debes iniciar sesión para suscribirte.');
                return;
            }

            const res = await fetch('/api/payments/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ plan }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al crear la suscripción.');
                return;
            }

            if (data.init_point) {
                window.location.href = data.init_point;
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setLoading(null);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mx-auto max-w-4xl px-4 py-10"
        >
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-text-primary">Precios</h1>
                <p className="mt-2 text-text-muted">
                    Sin trucos, sin precios falsos, sin compromisos
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Free Plan */}
                <div className="rounded-2xl border border-border bg-bg-card p-6">
                    <h2 className="text-xl font-semibold text-text-primary">Gratis</h2>
                    <p className="mt-2 text-2xl font-bold text-text-primary">
                        $<CountUp from={0} to={0} duration={1} className="inline" /> <span className="text-base font-normal text-text-muted">— Para siempre</span>
                    </p>

                    <ul className="mt-6 space-y-3">
                        {FREE_FEATURES.map((f, i) => (
                            <motion.li
                                key={f}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="flex items-start gap-2 text-sm text-text-muted"
                            >
                                <Check className="mt-0.5 size-4 shrink-0 text-text-muted" />
                                {f}
                            </motion.li>
                        ))}
                    </ul>
                </div>

                {/* Pro Plan */}
                <div
                    className="rounded-2xl border-2 border-primary bg-bg-card p-6"
                    style={{
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.15), 0 0 40px rgba(99, 102, 241, 0.05)',
                    }}
                >
                    <h2 className="text-xl font-semibold text-text-primary">Plan Pro</h2>
                    <p className="mt-2 text-2xl font-bold text-text-primary">
                        $<CountUp from={0} to={129} duration={1.5} className="inline" /> <span className="text-base font-normal text-text-muted">MXN/mes</span>
                    </p>
                    <p className="text-sm text-text-muted">o $<CountUp from={0} to={1200} duration={2} separator="," className="inline" /> MXN/año</p>

                    <ul className="mt-6 space-y-3">
                        {PRO_FEATURES.map((f, i) => (
                            <motion.li
                                key={f}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="flex items-start gap-2 text-sm text-text-muted"
                            >
                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                {f}
                            </motion.li>
                        ))}
                    </ul>

                    <div className="mt-6">
                        {isPro && (
                            <span className="inline-block rounded-full bg-green-600/20 px-4 py-1.5 text-sm font-medium text-green-400">
                                Tu plan actual
                            </span>
                        )}

                        {isFree && (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleSubscribe('monthly')}
                                    disabled={loading !== null}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading === 'monthly' && <Loader2 className="size-4 animate-spin" />}
                                    Mensual — $129/mes
                                </button>
                                <button
                                    onClick={() => handleSubscribe('annual')}
                                    disabled={loading !== null}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary bg-transparent px-4 py-2.5 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading === 'annual' && <Loader2 className="size-4 animate-spin" />}
                                    Anual — $1,200/año ($100/mes)
                                </button>

                                {error && (
                                    <p className="mt-1 text-center text-sm text-red-400">{error}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
