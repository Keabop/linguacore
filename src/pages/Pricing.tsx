import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTier } from '../hooks/useTier';

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

function handleSubscribe(plan: 'monthly' | 'annual') {
    // Placeholder — will be connected to Mercado Pago later
    console.log(`Subscribe: ${plan}`);
}

export default function Pricing() {
    const { isPro, isFree } = useTier();

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
                        $0 <span className="text-base font-normal text-text-muted">— Para siempre</span>
                    </p>

                    <ul className="mt-6 space-y-3">
                        {FREE_FEATURES.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                                <Check className="mt-0.5 size-4 shrink-0 text-text-muted" />
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pro Plan */}
                <div className="rounded-2xl border-2 border-primary bg-bg-card p-6">
                    <h2 className="text-xl font-semibold text-text-primary">Plan Pro</h2>
                    <p className="mt-2 text-2xl font-bold text-text-primary">
                        $129 <span className="text-base font-normal text-text-muted">MXN/mes</span>
                    </p>
                    <p className="text-sm text-text-muted">o $1,200 MXN/año</p>

                    <ul className="mt-6 space-y-3">
                        {PRO_FEATURES.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                {f}
                            </li>
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
                                    className="w-full cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                >
                                    Mensual — $129/mes
                                </button>
                                <button
                                    onClick={() => handleSubscribe('annual')}
                                    className="w-full cursor-pointer rounded-xl border border-primary bg-transparent px-4 py-2.5 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
                                >
                                    Anual — $1,200/año ($100/mes)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
