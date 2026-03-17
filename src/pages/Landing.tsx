import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    MessageCircle,
    Brain,
    Route,
    PenTool,
    Sparkles,
    ArrowRight,
    Check,
    Zap,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const FEATURES = [
    {
        icon: BookOpen,
        title: 'Historias interactivas',
        desc: 'Lee historias generadas por IA adaptadas a tu nivel. Cada palabra nueva se convierte en una tarjeta de repaso.',
        color: 'text-accent-blue',
        bg: 'bg-accent-blue/10',
    },
    {
        icon: MessageCircle,
        title: 'Tutor conversacional',
        desc: 'Practica conversaciones reales con un tutor IA que corrige tus errores y se adapta a tus temas favoritos.',
        color: 'text-success',
        bg: 'bg-success/10',
    },
    {
        icon: Brain,
        title: 'Repetición espaciada (FSRS)',
        desc: 'Algoritmo científico que programa repasos en el momento óptimo para maximizar tu retención a largo plazo.',
        color: 'text-accent-purple',
        bg: 'bg-accent-purple/10',
    },
    {
        icon: Route,
        title: 'Ruta de aprendizaje',
        desc: 'Curriculum estructurado del A1 al B2 con gramática, vocabulario, ejercicios y evaluaciones por unidad.',
        color: 'text-accent-orange',
        bg: 'bg-accent-orange/10',
    },
    {
        icon: PenTool,
        title: 'Evaluación de escritura',
        desc: 'Escribe textos y recibe correcciones detalladas con explicaciones de cada error gramatical y de estilo.',
        color: 'text-accent-red',
        bg: 'bg-accent-red/10',
    },
    {
        icon: Sparkles,
        title: 'Errores personalizados',
        desc: 'Tus errores más frecuentes se convierten en tarjetas de práctica para que no los repitas.',
        color: 'text-primary-light',
        bg: 'bg-primary/10',
    },
];

const FREE_ITEMS = [
    'Nivel A1 completo para siempre',
    '5 mensajes diarios con el tutor',
    '10 repasos FSRS por dia',
    '1 historia semanal generada por IA',
];

const PRO_ITEMS = [
    'Todos los niveles (A1 - B2)',
    'Tutor y repasos ilimitados',
    'Historias ilimitadas',
    'Evaluacion de escritura completa',
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function GlowOrb({ className }: { className: string }) {
    return (
        <div
            className={`absolute rounded-full blur-[120px] opacity-20 pointer-events-none ${className}`}
        />
    );
}

function FeatureCard({ icon: Icon, title, desc, color, bg, i }: typeof FEATURES[0] & { i: number }) {
    return (
        <motion.div
            custom={i}
            variants={fadeUp}
            className="group relative bg-bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
        >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <h3 className="text-base font-bold text-text mb-2">{title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Landing() {
    return (
        <div className="min-h-screen bg-bg-app text-text overflow-x-hidden">
            {/* Background glows */}
            <GlowOrb className="w-[600px] h-[600px] bg-primary top-[-200px] left-1/2 -translate-x-1/2" />
            <GlowOrb className="w-[400px] h-[400px] bg-accent-blue top-[60vh] right-[-100px]" />
            <GlowOrb className="w-[350px] h-[350px] bg-accent-purple bottom-[20vh] left-[-80px]" />

            {/* ─── Navbar ─── */}
            <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="Voxie" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-lg font-extrabold tracking-tight">Voxie</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/auth"
                        className="text-sm font-semibold text-text-secondary hover:text-text transition-colors px-4 py-2"
                    >
                        Iniciar sesion
                    </Link>
                    <Link
                        to="/auth"
                        className="text-sm font-bold bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl transition-colors"
                    >
                        Empezar gratis
                    </Link>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className="relative z-10 mx-auto max-w-4xl px-6 pt-16 pb-24 text-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    <motion.div custom={0} variants={fadeUp} className="mb-6">
                        <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary-light text-xs font-bold px-3.5 py-1.5 rounded-full">
                            <Zap className="w-3 h-3" />
                            Potenciado por Inteligencia Artificial
                        </span>
                    </motion.div>

                    <motion.h1
                        custom={1}
                        variants={fadeUp}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6"
                    >
                        Aprende ingles{' '}
                        <span className="bg-gradient-to-r from-primary via-primary-light to-accent-purple bg-clip-text text-transparent">
                            de verdad
                        </span>
                    </motion.h1>

                    <motion.p
                        custom={2}
                        variants={fadeUp}
                        className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Historias adaptadas, tutor conversacional, y repeticion espaciada. Todo con IA que se adapta a tu nivel y corrige tus errores reales.
                    </motion.p>

                    <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/auth"
                            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-base px-8 py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Comenzar gratis
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="#features"
                            className="text-sm font-semibold text-text-secondary hover:text-text transition-colors px-6 py-4"
                        >
                            Ver caracteristicas
                        </a>
                    </motion.div>
                </motion.div>

                {/* Hero visual — app preview mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mt-16 relative"
                >
                    <div className="relative mx-auto max-w-3xl rounded-2xl border border-border bg-bg-card/50 backdrop-blur-sm p-2 shadow-2xl shadow-primary/5">
                        {/* Fake browser bar */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-accent-red/60" />
                                <div className="w-2.5 h-2.5 rounded-full bg-accent-orange/60" />
                                <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="bg-bg-app/80 rounded-lg px-4 py-1.5 text-xs text-text-muted text-center">
                                    voxie.lat
                                </div>
                            </div>
                        </div>
                        {/* App mockup content */}
                        <div className="grid grid-cols-12 gap-0 min-h-[280px]">
                            {/* Sidebar mock */}
                            <div className="col-span-3 border-r border-border p-4 space-y-3 hidden sm:block">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-5 h-5 rounded bg-primary/30" />
                                    <div className="h-3 w-14 bg-text/10 rounded" />
                                </div>
                                {['w-20', 'w-16', 'w-24', 'w-18', 'w-14'].map((w, i) => (
                                    <div key={i} className={`h-2.5 ${w} rounded ${i === 0 ? 'bg-primary/40' : 'bg-text/5'}`} />
                                ))}
                            </div>
                            {/* Main content mock */}
                            <div className="col-span-12 sm:col-span-9 p-5 space-y-4">
                                <div className="h-4 w-40 bg-text/10 rounded" />
                                <div className="h-3 w-56 bg-text/5 rounded" />
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    {[
                                        { label: 'Racha', value: '12 dias', color: 'bg-accent-orange/20 text-accent-orange' },
                                        { label: 'Palabras', value: '347', color: 'bg-accent-blue/20 text-accent-blue' },
                                        { label: 'Por repasar', value: '8', color: 'bg-accent-purple/20 text-accent-purple' },
                                        { label: 'Nivel', value: 'A2', color: 'bg-success/20 text-success' },
                                    ].map((stat) => (
                                        <div key={stat.label} className="bg-bg-app/60 rounded-xl p-3 space-y-1">
                                            <div className="text-[10px] text-text-muted">{stat.label}</div>
                                            <div className={`text-sm font-bold ${stat.color} bg-transparent!`}>{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Glow under the card */}
                    <div className="absolute inset-x-0 -bottom-8 h-32 bg-gradient-to-b from-primary/10 to-transparent blur-2xl pointer-events-none" />
                </motion.div>
            </section>

            {/* ─── Features ─── */}
            <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.h2 custom={0} variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold mb-4">
                        Todo lo que necesitas para{' '}
                        <span className="text-primary-light">aprender ingles</span>
                    </motion.h2>
                    <motion.p custom={1} variants={fadeUp} className="text-text-secondary text-lg max-w-xl mx-auto">
                        Seis herramientas con IA que trabajan juntas para darte la experiencia de aprendizaje mas completa.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={stagger}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {FEATURES.map((f, i) => (
                        <FeatureCard key={f.title} {...f} i={i} />
                    ))}
                </motion.div>
            </section>

            {/* ─── How it works ─── */}
            <section className="relative z-10 mx-auto max-w-4xl px-6 py-24">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.h2 custom={0} variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold mb-4">
                        Asi funciona
                    </motion.h2>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={stagger}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {[
                        { step: '01', title: 'Crea tu cuenta', desc: 'Registrate gratis en 30 segundos con email o Google. El nivel A1 es tuyo para siempre.' },
                        { step: '02', title: 'Estudia a tu ritmo', desc: 'Lee historias, practica con el tutor, y repasa vocabulario. La IA se adapta a tus errores.' },
                        { step: '03', title: 'Avanza de nivel', desc: 'Completa unidades, pasa evaluaciones y desbloquea niveles del A1 al B2.' },
                    ].map((item, i) => (
                        <motion.div key={item.step} custom={i} variants={fadeUp} className="text-center">
                            <div className="text-4xl font-extrabold text-primary/20 mb-3">{item.step}</div>
                            <h3 className="text-lg font-bold text-text mb-2">{item.title}</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ─── Pricing preview ─── */}
            <section className="relative z-10 mx-auto max-w-5xl px-6 py-24">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.h2 custom={0} variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold mb-4">
                        Precios transparentes
                    </motion.h2>
                    <motion.p custom={1} variants={fadeUp} className="text-text-secondary text-lg max-w-xl mx-auto">
                        Sin trucos, sin descuentos falsos. El nivel A1 es gratis para siempre.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={stagger}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
                >
                    {/* Free */}
                    <motion.div custom={0} variants={fadeUp} className="bg-bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-7">
                        <div className="text-sm font-bold text-text-secondary mb-1">Gratis</div>
                        <div className="text-3xl font-extrabold text-text mb-1">$0</div>
                        <div className="text-xs text-text-muted mb-6">Para siempre</div>
                        <ul className="space-y-3">
                            {FREE_ITEMS.map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link
                            to="/auth"
                            className="mt-6 block w-full text-center bg-bg-elevated hover:bg-surface-hover text-text font-semibold text-sm py-3 rounded-xl transition-colors"
                        >
                            Crear cuenta gratis
                        </Link>
                    </motion.div>

                    {/* Pro */}
                    <motion.div custom={1} variants={fadeUp} className="relative bg-bg-card/60 backdrop-blur-sm border border-primary/30 rounded-2xl p-7">
                        <div className="absolute -top-3 right-6 bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-full">
                            Recomendado
                        </div>
                        <div className="text-sm font-bold text-primary-light mb-1">Plan Pro</div>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-3xl font-extrabold text-text">$129</span>
                            <span className="text-sm text-text-muted">/mes</span>
                        </div>
                        <div className="text-xs text-text-muted mb-6">o $1,200/ano ($100/mes)</div>
                        <ul className="space-y-3">
                            {PRO_ITEMS.map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                                    <Check className="w-4 h-4 text-primary-light shrink-0 mt-0.5" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link
                            to="/auth"
                            className="mt-6 block w-full text-center bg-primary hover:bg-primary-dark text-white font-bold text-sm py-3 rounded-xl transition-colors"
                        >
                            Empezar con Pro
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* ─── Final CTA ─── */}
            <section className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={stagger}
                >
                    <motion.h2 custom={0} variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold mb-4">
                        Empieza hoy, gratis
                    </motion.h2>
                    <motion.p custom={1} variants={fadeUp} className="text-text-secondary text-lg max-w-lg mx-auto mb-8">
                        El nivel A1 es tuyo para siempre. Sin tarjeta de credito, sin compromisos.
                    </motion.p>
                    <motion.div custom={2} variants={fadeUp}>
                        <Link
                            to="/auth"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-base px-10 py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Crear cuenta gratis
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="relative z-10 border-t border-border py-8 px-6">
                <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Voxie" className="w-5 h-5 rounded object-cover" />
                        <span className="text-sm font-bold text-text-muted">Voxie</span>
                    </div>
                    <p className="text-xs text-text-muted">
                        Hecho en Mexico con IA
                    </p>
                </div>
            </footer>
        </div>
    );
}
