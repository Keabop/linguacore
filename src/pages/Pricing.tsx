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
                    className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-4 py-3 text-sm text-[var(--color-primary)]"
                >
                    <Loader2 className="size-4 animate-spin" /> Verificando tu suscripción...
                </motion.div>
            )}

            {/* Just upgraded banner */}
            {justUpgraded && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-success)]/10 px-4 py-3 text-sm font-semibold text-[var(--color-success)]"
                >
                    <PartyPopper className="size-5" /> ¡Bienvenido a Pro! Tu plan ya está activo.
                </motion.div>
            )}

            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold">Precios</h1>
                <p className="mt-2 text-[var(--color-on-surface-muted)]">
                    Sin trucos, sin precios falsos, sin compromisos
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Free Plan */}
                <div className="rounded-2xl border border-[var(--color-outline-subtle)] bg-[var(--color-card)] p-6">
                    <h2 className="text-xl font-semibold">Gratis</h2>
                    <p className="mt-2 text-2xl font-bold">
                        $<CountUp from={0} to={0} duration={1} className="inline" /> <span className="text-base font-normal text-[var(--color-on-surface-muted)]">— Para siempre</span>
                    </p>

                    <ul className="mt-6 space-y-3">
                        {FREE_FEATURES.map((f, i) => (
                            <motion.li
                                key={f}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="flex items-start gap-2 text-sm text-[var(--color-on-surface-muted)]"
                            >
                                <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-on-surface-muted)]" />
                                {f}
                            </motion.li>
                        ))}
                    </ul>
                </div>

                {/* Pro Plan */}
                <div
                    className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-card)] p-6"
                    style={{
                        boxShadow: '0 0 20px rgba(112, 42, 225, 0.15), 0 0 40px rgba(112, 42, 225, 0.05)',
                    }}
                >
                    <h2 className="text-xl font-semibold">Plan Pro</h2>
                    <p className="mt-2 text-2xl font-bold">
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
                                className="flex items-start gap-2 text-sm text-[var(--color-on-surface-muted)]"
                            >
                                <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" />
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
                                    className="btn-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading === 'monthly' && <Loader2 className="size-4 animate-spin" />}
                                    Mensual — $129/mes
                                </button>
                                <button
                                    onClick={() => handleSubscribe('annual')}
                                    disabled={loading !== null}
                                    className="btn-secondary flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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
