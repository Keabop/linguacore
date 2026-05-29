import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, PartyPopper } from 'lucide-react';
import { useTier } from '../hooks/useTier';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
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
    const [verifying, setVerifying] = useState(false);
    const [justUpgraded, setJustUpgraded] = useState(false);
    const qc = useQueryClient();

    // When user returns from Mercado Pago checkout (?status=success),
    // immediately verify subscription with MP API and update profile
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('status') !== 'success') return;

        // Clean URL
        window.history.replaceState({}, '', '/pricing');

        async function verifySubscription() {
            setVerifying(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.access_token) return;

                const res = await fetch('/api/payments/create-subscription', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ action: 'verify' }),
                });

                const data = await res.json();
                if (res.ok && data.tier === 'pro') {
                    setJustUpgraded(true);
                }

                // Refetch tier data so UI updates immediately
                qc.invalidateQueries({ queryKey: ['profile-tier'] });
            } catch {
                // Verification failed silently — webhook will handle it later
                console.warn('[Pricing] Verify failed, relying on webhook');
            } finally {
                setVerifying(false);
            }
        }

        verifySubscription();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            {/* Verifying banner */}
            {verifying && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-6 py-3 text-sm text-[var(--color-primary)] shadow-[var(--shadow-card)]"
                >
                    <Loader2 className="size-4 animate-spin" /> Verificando tu suscripción...
                </motion.div>
            )}

            {/* Just upgraded banner */}
            {justUpgraded && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 flex items-center justify-center gap-2 rounded-full bg-[var(--color-success)]/10 px-6 py-3 text-sm font-semibold text-[var(--color-success)] shadow-[var(--shadow-card)]"
                >
                    <PartyPopper className="size-5" /> ¡Bienvenido a Pro! Tu plan ya está activo.
                </motion.div>
            )}

            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black tracking-tight text-[var(--color-on-surface)]">Precios</h1>
                <p className="mt-3 text-[var(--color-on-surface-muted)] text-base">
                    Sin trucos, sin precios falsos, sin compromisos
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Free Plan */}
                <div className="rounded-[2rem] bg-[var(--color-card)] p-7 shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
                    <h2 className="text-xl font-black tracking-tight text-[var(--color-on-surface)]">Gratis</h2>
                    <p className="mt-2 text-2xl font-black tracking-tight">
                        $<CountUp from={0} to={0} duration={1} className="inline" /> <span className="text-base font-normal text-[var(--color-on-surface-muted)]">— Para siempre</span>
                    </p>

                    <ul className="mt-6 space-y-3">
                        {FREE_FEATURES.map((f, i) => (
                            <motion.li
                                key={f}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="flex items-start gap-2.5 text-sm text-[var(--color-on-surface-muted)]"
                            >
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center shrink-0">
                                    <Check className="size-3 text-[var(--color-on-surface-muted)]" />
                                </div>
                                {f}
                            </motion.li>
                        ))}
                    </ul>
                </div>

                {/* Pro Plan */}
                <div className="rounded-[2rem] bg-[var(--color-card)] p-7 shadow-[var(--shadow-float)] relative overflow-hidden hover:-translate-y-1 transition-all duration-300">
                    {/* Subtle gradient glow at top */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] rounded-t-[2rem]" />

                    <h2 className="text-xl font-black tracking-tight text-[var(--color-on-surface)]">Plan Pro</h2>
                    <p className="mt-2 text-2xl font-black tracking-tight">
                        $<CountUp from={0} to={129} duration={1.5} className="inline" /> <span className="text-base font-normal text-[var(--color-on-surface-muted)]">MXN/mes</span>
                    </p>
                    <p className="text-sm text-[var(--color-on-surface-muted)]">o $<CountUp from={0} to={1200} duration={2} separator="," className="inline" /> MXN/año</p>

                    <ul className="mt-6 space-y-3">
                        {PRO_FEATURES.map((f, i) => (
                            <motion.li
                                key={f}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="flex items-start gap-2.5 text-sm text-[var(--color-on-surface-muted)]"
                            >
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                                    <Check className="size-3 text-[var(--color-primary)]" />
                                </div>
                                {f}
                            </motion.li>
                        ))}
                    </ul>

                    <div className="mt-6">
                        {isPro && (
                            <span className="inline-block rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] px-5 py-2 text-sm font-bold shadow-[var(--shadow-card)]">
                                Tu plan actual
                            </span>
                        )}

                        {isFree && (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleSubscribe('monthly')}
                                    disabled={loading !== null}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading === 'monthly' && <Loader2 className="size-4 animate-spin" />}
                                    Mensual — $129/mes
                                </button>
                                <button
                                    onClick={() => handleSubscribe('annual')}
                                    disabled={loading !== null}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold bg-[var(--color-surface-container)] text-[var(--color-on-surface)] shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
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
