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
} from 'lucide-react';

import Aurora from '../components/reactbits/Aurora';
import SplitText from '../components/reactbits/SplitText';
import BlurText from '../components/reactbits/BlurText';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import Magnet from '../components/reactbits/Magnet';
import CountUp from '../components/reactbits/CountUp';

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
        color: 'text-[var(--color-level-a1)]',
        bg: 'bg-[var(--color-level-a1)]/10',
    },
    {
        icon: MessageCircle,
        title: 'Tutor conversacional',
        desc: 'Practica conversaciones reales con un tutor IA que corrige tus errores y se adapta a tus temas favoritos.',
        color: 'text-[var(--color-success)]',
        bg: 'bg-[var(--color-success)]/10',
    },
    {
        icon: Brain,
        title: 'Repetición espaciada (FSRS)',
        desc: 'Algoritmo científico que programa repasos en el momento óptimo para maximizar tu retención a largo plazo.',
        color: 'text-[var(--color-primary-light)]',
        bg: 'bg-[var(--color-primary-light)]/10',
    },
    {
        icon: Route,
        title: 'Ruta de aprendizaje',
        desc: 'Curriculum estructurado del A1 al B2 con gramática, vocabulario, ejercicios y evaluaciones por unidad.',
        color: 'text-[var(--color-level-b1)]',
        bg: 'bg-[var(--color-level-b1)]/10',
    },
    {
        icon: PenTool,
        title: 'Evaluación de escritura',
        desc: 'Escribe textos y recibe correcciones detalladas con explicaciones de cada error gramatical y de estilo.',
        color: 'text-[var(--color-level-b2)]',
        bg: 'bg-[var(--color-level-b2)]/10',
    },
    {
        icon: Sparkles,
        title: 'Errores personalizados',
        desc: 'Tus errores más frecuentes se convierten en tarjetas de práctica para que no los repitas.',
        color: 'text-[var(--color-primary-light)]',
        bg: 'bg-[var(--color-primary)]/10',
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

const HOW_STEPS = [
    {
        step: '01',
        title: 'Crea tu cuenta',
        desc: 'Registrate gratis en 30 segundos con email o Google. El nivel A1 es tuyo para siempre.',
    },
    {
        step: '02',
        title: 'Estudia a tu ritmo',
        desc: 'Lee historias, practica con el tutor, y repasa vocabulario. La IA se adapta a tus errores.',
    },
    {
        step: '03',
        title: 'Avanza de nivel',
        desc: 'Completa unidades, pasa evaluaciones y desbloquea niveles del A1 al B2.',
    },
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function FeatureCard({ icon: Icon, title, desc, color, bg, i }: typeof FEATURES[0] & { i: number }) {
    return (
        <motion.div custom={i} variants={fadeUp}>
            <SpotlightCard
                className="h-full bg-[var(--color-card)]/60 backdrop-blur-sm border border-[var(--color-outline-subtle)] rounded-2xl p-6 hover:border-[var(--color-primary)]/30 transition-all duration-300"
                spotlightColor="rgba(112, 42, 225, 0.12)"
            >
                <div className={`w-10 h-10 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-base font-bold text-[var(--color-on-surface)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{desc}</p>
            </SpotlightCard>
        </motion.div>
    );
}

function MockupSignup() {
    return (
        <div className="bg-[var(--color-card)]/80 backdrop-blur-sm border border-[var(--color-outline-subtle)] rounded-2xl p-6 space-y-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-[var(--color-primary)]/30 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]/60" />
                </div>
                <span className="text-sm font-bold text-[var(--color-on-surface)]">Voxie</span>
            </div>
            <p className="text-xs font-semibold text-[var(--color-on-surface-muted)]">Crea tu cuenta gratis</p>
            <div className="space-y-2">
                <div className="h-9 bg-[var(--color-background)] border border-[var(--color-outline-subtle)] rounded-2xl px-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--color-on-surface)]/10" />
                    <div className="h-2 w-28 bg-[var(--color-on-surface)]/10 rounded" />
                </div>
                <div className="h-9 bg-[var(--color-background)] border border-[var(--color-outline-subtle)] rounded-2xl px-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--color-on-surface)]/10" />
                    <div className="h-2 w-20 bg-[var(--color-on-surface)]/10 rounded" />
                </div>
            </div>
            <div className="h-9 bg-[var(--color-primary)] rounded-full flex items-center justify-center gap-2">
                <div className="h-2 w-24 bg-white/40 rounded" />
            </div>
            <div className="flex items-center gap-2 justify-center">
                <div className="h-px flex-1 bg-[var(--color-outline-subtle)]" />
                <span className="text-[10px] text-[var(--color-on-surface-muted)]">o continúa con</span>
                <div className="h-px flex-1 bg-[var(--color-outline-subtle)]" />
            </div>
            <div className="h-8 border border-[var(--color-outline-subtle)] rounded-2xl flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[var(--color-on-surface)]/10" />
                <div className="h-2 w-16 bg-[var(--color-on-surface)]/10 rounded" />
            </div>
        </div>
    );
}

function MockupStory() {
    return (
        <div className="bg-[var(--color-card)]/80 backdrop-blur-sm border border-[var(--color-outline-subtle)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
            {/* Story header */}
            <div className="border-b border-[var(--color-outline-subtle)] px-4 py-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[var(--color-level-a1)]/20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[var(--color-level-a1)]/60" />
                </div>
                <div className="h-2 w-32 bg-[var(--color-on-surface)]/10 rounded" />
                <div className="ml-auto h-5 w-10 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                    <div className="h-1.5 w-6 bg-[var(--color-primary)]/50 rounded" />
                </div>
            </div>
            {/* Story text */}
            <div className="px-4 py-4 space-y-2">
                <div className="h-2 w-full bg-[var(--color-on-surface)]/8 rounded" />
                <div className="h-2 w-5/6 bg-[var(--color-on-surface)]/8 rounded" />
                <div className="flex items-center gap-1 flex-wrap mt-3">
                    <div className="h-2 w-10 bg-[var(--color-on-surface)]/8 rounded" />
                    <div className="h-2 w-14 bg-[var(--color-on-surface)]/8 rounded" />
                    <span className="text-[10px] text-[var(--color-primary)] font-bold underline decoration-dotted cursor-pointer">morning</span>
                    <div className="h-2 w-12 bg-[var(--color-on-surface)]/8 rounded" />
                    <div className="h-2 w-8 bg-[var(--color-on-surface)]/8 rounded" />
                </div>
                <div className="h-2 w-4/5 bg-[var(--color-on-surface)]/8 rounded" />
                {/* Tooltip popup */}
                <div className="bg-[var(--color-surface-high)] border border-[var(--color-primary)]/30 rounded-2xl p-2.5 mt-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[var(--color-primary)]">morning</span>
                        <div className="h-3 w-8 bg-[var(--color-success)]/20 rounded-full" />
                    </div>
                    <div className="h-1.5 w-16 bg-[var(--color-on-surface)]/10 rounded" />
                    <div className="h-5 w-full bg-[var(--color-primary)]/15 rounded-lg flex items-center justify-center">
                        <div className="h-1.5 w-20 bg-[var(--color-primary)]/40 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MockupPath() {
    const units = [
        { label: 'Introducing Yourself', done: true },
        { label: 'Daily Routines', done: true },
        { label: 'Present Tense', active: true },
        { label: 'My Family', locked: true },
    ];
    return (
        <div className="bg-[var(--color-card)]/80 backdrop-blur-sm border border-[var(--color-outline-subtle)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
            <div className="border-b border-[var(--color-outline-subtle)] px-4 py-3">
                <div className="h-2 w-24 bg-[var(--color-on-surface)]/10 rounded mb-1" />
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 bg-[var(--color-background)] rounded-full flex-1 overflow-hidden">
                        <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: '40%' }} />
                    </div>
                    <span className="text-[9px] text-[var(--color-on-surface-muted)]">2/5 A1</span>
                </div>
            </div>
            <div className="px-3 py-3 space-y-2">
                {units.map((u, i) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border ${
                        u.active ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/8' :
                        u.done ? 'border-[var(--color-success)]/20 bg-[var(--color-success)]/5' :
                        'border-[var(--color-outline-subtle)] bg-[var(--color-background)]/30 opacity-50'
                    }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            u.done ? 'bg-[var(--color-success)]/20' : u.active ? 'bg-[var(--color-primary)]/20' : 'bg-[var(--color-on-surface)]/5'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${
                                u.done ? 'bg-[var(--color-success)]' : u.active ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-on-surface)]/20'
                            }`} />
                        </div>
                        <div className="flex-1">
                            <div className={`text-[10px] font-semibold ${u.active ? 'text-[var(--color-primary)]' : u.done ? 'text-[var(--color-on-surface-muted)]' : 'text-[var(--color-on-surface-muted)]'}`}>
                                {u.label}
                            </div>
                        </div>
                        {u.active && (
                            <div className="h-5 w-14 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                                <div className="h-1.5 w-8 bg-white/40 rounded" />
                            </div>
                        )}
                        {u.done && <Check className="w-3 h-3 text-[var(--color-success)] shrink-0" />}
                    </div>
                ))}
            </div>
        </div>
    );
}

const HOW_MOCKUPS = [MockupSignup, MockupStory, MockupPath];

function HowItWorksBlock({
    step,
    title,
    desc,
    reverse,
    mockupIndex,
}: {
    step: string;
    title: string;
    desc: string;
    reverse: boolean;
    mockupIndex: number;
}) {
    const Mockup = HOW_MOCKUPS[mockupIndex];
    return (
        <motion.div
            initial={{ opacity: 0, x: reverse ? 60 : -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}
        >
            {/* Text side */}
            <div className="flex-1 text-center md:text-left">
                <div className="text-5xl font-extrabold text-[var(--color-primary)]/20 mb-3">{step}</div>
                <h3 className="text-xl font-bold text-[var(--color-on-surface)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed max-w-md">{desc}</p>
            </div>

            {/* Mockup side */}
            <div className="flex-1 w-full max-w-sm">
                <Mockup />
            </div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Landing() {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)] overflow-x-hidden">
            {/* Aurora background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <Aurora
                    colorStops={["#702AE1", "#B28CFF", "#FEF3FF"]}
                    speed={0.3}
                    blend={0.6}
                    amplitude={0.8}
                    className="w-full h-full"
                />
            </div>

            {/* ─── Navbar ─── */}
            <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="Voxie" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-lg font-extrabold tracking-tight">Voxie</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/auth"
                        className="text-sm font-semibold text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-colors px-4 py-2"
                    >
                        Iniciar sesion
                    </Link>
                    <Link
                        to="/auth"
                        className="btn-primary px-5 py-2.5 text-sm"
                    >
                        Empezar gratis
                    </Link>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className="relative z-10 mx-auto max-w-4xl px-6 pt-16 pb-24 text-center">
                <div className="mb-6">
                    <SplitText
                        text="Historias, práctica y AI. Todo lo que necesitas."
                        splitType="words"
                        delay={30}
                        tag="h1"
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight"
                    />
                </div>

                <div className="mb-10">
                    <BlurText
                        text="Historias adaptadas, tutor conversacional, y repeticion espaciada. Todo con IA que se adapta a tu nivel y corrige tus errores reales."
                        delay={80}
                        className="text-lg sm:text-xl text-[var(--color-on-surface-muted)] max-w-2xl mx-auto leading-relaxed"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex justify-center"
                >
                    <Magnet padding={50}>
                        <Link
                            to="/auth"
                            className="btn-primary px-8 py-4 text-base inline-flex items-center gap-2"
                        >
                            Comenzar gratis
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Magnet>
                </motion.div>

                {/* Hero visual — app preview mockup with 3D perspective tilt */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mt-16 relative"
                    style={{ perspective: 1200 }}
                >
                    <motion.div
                        style={{ rotateX: 4 }}
                        className="relative mx-auto max-w-3xl rounded-2xl border border-[var(--color-outline-subtle)] bg-[var(--color-card)]/50 backdrop-blur-sm p-2 shadow-[var(--shadow-float)]"
                    >
                        {/* Fake browser bar */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-outline-subtle)]">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-level-b2)]/60" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-level-b1)]/60" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]/60" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="bg-[var(--color-background)]/80 rounded-lg px-4 py-1.5 text-xs text-[var(--color-on-surface-muted)] text-center">
                                    voxie.lat
                                </div>
                            </div>
                        </div>
                        {/* App mockup content */}
                        <div className="grid grid-cols-12 gap-0 min-h-[280px]">
                            {/* Sidebar mock */}
                            <div className="col-span-3 border-r border-[var(--color-outline-subtle)] p-4 space-y-3 hidden sm:block">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-5 h-5 rounded bg-[var(--color-primary)]/30" />
                                    <div className="h-3 w-14 bg-[var(--color-on-surface)]/10 rounded" />
                                </div>
                                {['w-20', 'w-16', 'w-24', 'w-18', 'w-14'].map((w, i) => (
                                    <div key={i} className={`h-2.5 ${w} rounded ${i === 0 ? 'bg-[var(--color-primary)]/40' : 'bg-[var(--color-on-surface)]/5'}`} />
                                ))}
                            </div>
                            {/* Main content mock */}
                            <div className="col-span-12 sm:col-span-9 p-5 space-y-4">
                                <div className="h-4 w-40 bg-[var(--color-on-surface)]/10 rounded" />
                                <div className="h-3 w-56 bg-[var(--color-on-surface)]/5 rounded" />
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    {[
                                        { label: 'Racha', value: '12 dias', color: 'bg-[var(--color-level-b1)]/20 text-[var(--color-level-b1)]' },
                                        { label: 'Palabras', value: '347', color: 'bg-[var(--color-level-a1)]/20 text-[var(--color-level-a1)]' },
                                        { label: 'Por repasar', value: '8', color: 'bg-[var(--color-primary-light)]/20 text-[var(--color-primary-light)]' },
                                        { label: 'Nivel', value: 'A2', color: 'bg-[var(--color-success)]/20 text-[var(--color-success)]' },
                                    ].map((stat) => (
                                        <div key={stat.label} className="bg-[var(--color-background)]/60 rounded-2xl p-3 space-y-1">
                                            <div className="text-[10px] text-[var(--color-on-surface-muted)]">{stat.label}</div>
                                            <div className={`text-sm font-bold ${stat.color} bg-transparent!`}>{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    {/* Glow under the card */}
                    <div className="absolute inset-x-0 -bottom-8 h-32 bg-gradient-to-b from-[var(--color-primary)]/10 to-transparent blur-2xl pointer-events-none" />
                </motion.div>
            </section>

            {/* ─── Features ─── */}
            <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
                <div className="text-center mb-16">
                    <BlurText
                        text="Todo lo que necesitas para aprender ingles"
                        delay={60}
                        className="text-3xl sm:text-4xl font-extrabold mb-4"
                    />
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-[var(--color-on-surface-muted)] text-lg max-w-xl mx-auto"
                    >
                        Seis herramientas con IA que trabajan juntas para darte la experiencia de aprendizaje mas completa.
                    </motion.p>
                </div>

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

            {/* ─── How it works — Notion style ─── */}
            <section className="relative z-10 mx-auto max-w-5xl px-6 py-24">
                <div className="text-center mb-16">
                    <BlurText
                        text="Asi funciona"
                        delay={60}
                        className="text-3xl sm:text-4xl font-extrabold mb-4"
                    />
                </div>

                <div className="space-y-16 md:space-y-24">
                    {HOW_STEPS.map((item, i) => (
                        <HowItWorksBlock
                            key={item.step}
                            step={item.step}
                            title={item.title}
                            desc={item.desc}
                            reverse={i % 2 !== 0}
                            mockupIndex={i}
                        />
                    ))}
                </div>
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
                    <motion.p custom={1} variants={fadeUp} className="text-[var(--color-on-surface-muted)] text-lg max-w-xl mx-auto">
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
                    <motion.div custom={0} variants={fadeUp} className="bg-[var(--color-card)]/60 backdrop-blur-sm border border-[var(--color-outline-subtle)] rounded-2xl p-7">
                        <div className="text-sm font-bold text-[var(--color-on-surface-muted)] mb-1">Gratis</div>
                        <div className="text-3xl font-extrabold text-[var(--color-on-surface)] mb-1">
                            $<CountUp to={0} from={0} duration={1} className="inline" />
                        </div>
                        <div className="text-xs text-[var(--color-on-surface-muted)] mb-6">Para siempre</div>
                        <ul className="space-y-3">
                            {FREE_ITEMS.map((item, idx) => (
                                <motion.li
                                    key={item}
                                    initial={{ opacity: 0, x: -12 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx, duration: 0.3 }}
                                    className="flex items-start gap-2.5 text-sm text-[var(--color-on-surface-muted)]"
                                >
                                    <Check className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                        <Link
                            to="/auth"
                            className="mt-6 block w-full text-center bg-[var(--color-surface-high)] hover:opacity-90 text-[var(--color-on-surface)] font-semibold text-sm py-3 rounded-full transition-colors"
                        >
                            Crear cuenta gratis
                        </Link>
                    </motion.div>

                    {/* Pro */}
                    <motion.div custom={1} variants={fadeUp} className="relative bg-[var(--color-card)]/60 backdrop-blur-sm border border-[var(--color-primary)]/30 rounded-2xl p-7 pro-glow-border">
                        <div className="absolute -top-3 right-6 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[11px] font-bold px-3 py-1 rounded-full">
                            Recomendado
                        </div>
                        <div className="text-sm font-bold text-[var(--color-primary-light)] mb-1">Plan Pro</div>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-3xl font-extrabold text-[var(--color-on-surface)]">
                                $<CountUp to={129} from={0} duration={2} className="inline" />
                            </span>
                            <span className="text-sm text-[var(--color-on-surface-muted)]">/mes</span>
                        </div>
                        <div className="text-xs text-[var(--color-on-surface-muted)] mb-6">
                            o $<CountUp to={1200} from={0} duration={2.5} separator="," className="inline" />/año ($100/mes)
                        </div>
                        <ul className="space-y-3">
                            {PRO_ITEMS.map((item, idx) => (
                                <motion.li
                                    key={item}
                                    initial={{ opacity: 0, x: -12 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx, duration: 0.3 }}
                                    className="flex items-start gap-2.5 text-sm text-[var(--color-on-surface-muted)]"
                                >
                                    <Check className="w-4 h-4 text-[var(--color-primary-light)] shrink-0 mt-0.5" />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                        <Link
                            to="/auth"
                            className="btn-primary mt-6 block w-full text-center text-sm py-3"
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
                    <motion.p custom={1} variants={fadeUp} className="text-[var(--color-on-surface-muted)] text-lg max-w-lg mx-auto mb-8">
                        El nivel A1 es tuyo para siempre. Sin tarjeta de credito, sin compromisos.
                    </motion.p>
                    <motion.div custom={2} variants={fadeUp}>
                        <Link
                            to="/auth"
                            className="btn-primary px-10 py-4 text-base inline-flex items-center gap-2"
                        >
                            Crear cuenta gratis
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="relative z-10 border-t border-[var(--color-outline-subtle)] py-8 px-6">
                <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Voxie" className="w-5 h-5 rounded object-cover" />
                        <span className="text-sm font-bold text-[var(--color-on-surface-muted)]">Voxie</span>
                    </div>
                    <p className="text-xs text-[var(--color-on-surface-muted)]">
                        © {new Date().getFullYear()} Voxie. Todos los derechos reservados.
                    </p>
                </div>
            </footer>

            {/* Pro card glow animation */}
            <style>{`
                .pro-glow-border {
                    animation: proGlow 3s ease-in-out infinite alternate;
                }
                @keyframes proGlow {
                    0% {
                        box-shadow: 0 0 8px rgba(112, 42, 225, 0.15), 0 0 20px rgba(112, 42, 225, 0.05);
                    }
                    100% {
                        box-shadow: 0 0 16px rgba(112, 42, 225, 0.3), 0 0 40px rgba(112, 42, 225, 0.1);
                    }
                }
            `}</style>
        </div>
    );
}
