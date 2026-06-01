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
    Upload,
    GraduationCap,
    Briefcase,
    Activity,
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
        desc: 'Lee historias generadas por IA adaptadas a tu nivel. Cada palabra nueva se convierte en una tarjeta de repaso FSRS.',
        color: 'text-[var(--color-level-a1)]',
        bg: 'bg-[var(--color-level-a1)]/10',
    },
    {
        icon: MessageCircle,
        title: 'Tutor conversacional',
        desc: 'Practica conversaciones reales con un tutor IA que corrige tus errores en tiempo real y se adapta a tus temas favoritos.',
        color: 'text-[var(--color-success)]',
        bg: 'bg-[var(--color-success)]/10',
    },
    {
        icon: Brain,
        title: 'Repetición espaciada (FSRS)',
        desc: 'Algoritmo científico que programa repeticiones en el momento óptimo para maximizar tu retención a largo plazo.',
        color: 'text-[var(--color-primary-light)]',
        bg: 'bg-[var(--color-primary-light)]/10',
    },
    {
        icon: Activity,
        title: 'Laboratorio de errores',
        desc: 'Tus fallas de redacción se transforman en un minijuego de 3 pasos (Análisis, Reconstrucción y Quiz) para dominarlas.',
        color: 'text-[var(--color-primary-light)]',
        bg: 'bg-[var(--color-primary)]/10',
    },
    {
        icon: GraduationCap,
        title: 'Simulacros oficiales',
        desc: 'Evaluaciones reales para Cambridge B1/B2 (69-97 reactivos), TOEFL (70 reactivos) e IELTS (80 reactivos) con Speaking oral por IA.',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
    },
    {
        icon: Briefcase,
        title: 'Mazos profesionales IA',
        desc: 'Genera al instante mazos especializados de 15 palabras esenciales adaptados a cualquier industria o profesión.',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
    },
    {
        icon: Upload,
        title: 'Importación flexible',
        desc: 'Sube archivos CSV de Anki o Quizlet, o pega listas simples de texto plano para importar vocabulario sin reiniciar.',
        color: 'text-[var(--color-level-b1)]',
        bg: 'bg-[var(--color-level-b1)]/10',
    },
    {
        icon: PenTool,
        title: 'Portabilidad y exportación',
        desc: 'Exporta tu progreso FSRS y tarjetas completas a formato CSV en un solo clic, manteniendo control total de tus datos.',
        color: 'text-[var(--color-level-b2)]',
        bg: 'bg-[var(--color-level-b2)]/10',
    },
];

const FREE_ITEMS = [
    'Nivel A1 completo para siempre',
    'Test de Nivelación rápida semanal',
    'Laboratorio interactivo de errores',
    'Importación y exportación de vocabulario',
];

const PRO_ITEMS = [
    'Niveles del A1 al C1 con ruta guiada',
    'Tutor conversacional y repasos ilimitados',
    'Simulacros oficiales (TOEFL, IELTS, Cambridge)',
    'Evaluación experta de ensayos y Speaking por IA',
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
                className="h-full bg-[var(--color-card)] backdrop-blur-sm rounded-[2rem] p-7 shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
                spotlightColor="rgba(112, 42, 225, 0.12)"
            >
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-5`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-base font-black tracking-tight text-[var(--color-on-surface)] mb-2 font-display">{title}</h3>
                <p className="text-sm text-[var(--color-on-surface)]/80 leading-relaxed font-body font-medium">{desc}</p>
            </SpotlightCard>
        </motion.div>
    );
}

function MockupSignup() {
    return (
        <div className="bg-[var(--color-card)]/80 backdrop-blur-sm rounded-[2rem] p-6 space-y-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-xl bg-[var(--color-primary)]/30 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-lg bg-[var(--color-primary)]/60" />
                </div>
                <span className="text-sm font-black text-[var(--color-on-surface)]">Voxie</span>
            </div>
            <p className="text-xs font-bold text-[var(--color-on-surface-muted)]">Crea tu cuenta gratis</p>
            <div className="space-y-2">
                <div className="h-9 bg-[var(--color-surface-container-low)] rounded-full px-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--color-on-surface)]/10" />
                    <div className="h-2 w-28 bg-[var(--color-on-surface)]/10 rounded-full" />
                </div>
                <div className="h-9 bg-[var(--color-surface-container-low)] rounded-full px-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--color-on-surface)]/10" />
                    <div className="h-2 w-20 bg-[var(--color-on-surface)]/10 rounded-full" />
                </div>
            </div>
            <div className="h-9 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] rounded-full flex items-center justify-center gap-2 shadow-[var(--shadow-card)]">
                <div className="h-2 w-24 bg-white/40 rounded-full" />
            </div>
            <div className="flex items-center gap-2 justify-center">
                <div className="h-px flex-1 bg-[var(--color-surface-container-high)]" />
                <span className="text-[10px] text-[var(--color-on-surface-muted)]">o continúa con</span>
                <div className="h-px flex-1 bg-[var(--color-surface-container-high)]" />
            </div>
            <div className="h-8 bg-[var(--color-surface-container-low)] rounded-full flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[var(--color-on-surface)]/10" />
                <div className="h-2 w-16 bg-[var(--color-on-surface)]/10 rounded-full" />
            </div>
        </div>
    );
}

function MockupStory() {
    return (
        <div className="bg-[var(--color-card)]/80 backdrop-blur-sm rounded-[2rem] overflow-hidden shadow-[var(--shadow-card)]">
            {/* Story header */}
            <div className="bg-[var(--color-surface-container-low)] px-5 py-3.5 flex items-center gap-2">
                <div className="w-5 h-5 rounded-xl bg-[var(--color-level-a1)]/20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-lg bg-[var(--color-level-a1)]/60" />
                </div>
                <div className="h-2 w-32 bg-[var(--color-on-surface)]/10 rounded-full" />
                <div className="ml-auto h-5 w-10 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                    <div className="h-1.5 w-6 bg-[var(--color-primary)]/50 rounded-full" />
                </div>
            </div>
            {/* Story text */}
            <div className="px-5 py-5 space-y-2">
                <div className="h-2 w-full bg-[var(--color-on-surface)]/8 rounded-full" />
                <div className="h-2 w-5/6 bg-[var(--color-on-surface)]/8 rounded-full" />
                <div className="flex items-center gap-1 flex-wrap mt-3">
                    <div className="h-2 w-10 bg-[var(--color-on-surface)]/8 rounded-full" />
                    <div className="h-2 w-14 bg-[var(--color-on-surface)]/8 rounded-full" />
                    <span className="text-[10px] text-[var(--color-primary)] font-bold underline decoration-dotted cursor-pointer">morning</span>
                    <div className="h-2 w-12 bg-[var(--color-on-surface)]/8 rounded-full" />
                    <div className="h-2 w-8 bg-[var(--color-on-surface)]/8 rounded-full" />
                </div>
                <div className="h-2 w-4/5 bg-[var(--color-on-surface)]/8 rounded-full" />
                {/* Tooltip popup */}
                <div className="bg-[var(--color-surface-container)] rounded-2xl p-3 mt-2 space-y-1.5 shadow-[var(--shadow-card)]">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[var(--color-primary)]">morning</span>
                        <div className="h-3 w-8 bg-[var(--color-success)]/20 rounded-full" />
                    </div>
                    <div className="h-1.5 w-16 bg-[var(--color-on-surface)]/10 rounded-full" />
                    <div className="h-5 w-full bg-[var(--color-primary)]/15 rounded-xl flex items-center justify-center">
                        <div className="h-1.5 w-20 bg-[var(--color-primary)]/40 rounded-full" />
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
        <div className="bg-[var(--color-card)]/80 backdrop-blur-sm rounded-[2rem] overflow-hidden shadow-[var(--shadow-card)]">
            <div className="bg-[var(--color-surface-container-low)] px-5 py-3.5">
                <div className="h-2 w-24 bg-[var(--color-on-surface)]/10 rounded-full mb-1" />
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 bg-[var(--color-surface-container)] rounded-full flex-1 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] rounded-full" style={{ width: '40%' }} />
                    </div>
                    <span className="text-[9px] text-[var(--color-on-surface-muted)]">2/5 A1</span>
                </div>
            </div>
            <div className="px-4 py-4 space-y-2">
                {units.map((u, i) => (
                    <div key={i} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl ${
                        u.active ? 'bg-[var(--color-primary)]/8 shadow-[var(--shadow-card)]' :
                        u.done ? 'bg-[var(--color-success)]/5' :
                        'bg-[var(--color-surface-container-low)] opacity-50'
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
                            <div className="h-5 w-14 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] rounded-full flex items-center justify-center">
                                <div className="h-1.5 w-8 bg-white/40 rounded-full" />
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
                <div className="text-5xl font-black text-[var(--color-primary)]/20 mb-3 tracking-tight font-display">{step}</div>
                <h3 className="text-xl font-black tracking-tight text-[var(--color-on-surface)] mb-2 font-display">{title}</h3>
                <p className="text-sm text-[var(--color-on-surface)]/80 leading-relaxed max-w-md font-body font-medium">{desc}</p>
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
                    <img src="/logo.png" alt="Voxie" className="w-8 h-8 rounded-xl object-cover shadow-[var(--shadow-card)]" />
                    <span className="text-lg font-black tracking-tight font-display">Voxie</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/auth"
                        className="text-sm font-semibold text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-all duration-300 px-4 py-2"
                    >
                        Iniciar sesion
                    </Link>
                    <Link
                        to="/auth"
                        className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white rounded-full px-5 py-2.5 text-sm font-bold shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
                    >
                        Empezar gratis
                    </Link>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className="relative z-10 mx-auto max-w-4xl px-6 pt-12 pb-24 text-center flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] text-xs font-black tracking-wider uppercase mb-8 backdrop-blur-md border border-[var(--color-primary)]/20 shadow-[var(--shadow-card)]"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    El Futuro del Inglés con IA
                </motion.div>

                <div className="mb-6 flex flex-col items-center">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tight font-display text-[var(--color-on-surface)] flex flex-wrap justify-center gap-x-3 gap-y-1">
                        <span>Historias,</span>
                        <span>práctica y</span>
                        <span className="bg-gradient-to-r from-[var(--color-primary-light)] to-[#FF8CEF] bg-clip-text text-transparent">IA.</span>
                        <span className="w-full text-3xl sm:text-4xl md:text-5xl mt-2 bg-gradient-to-r from-[var(--color-on-surface)] via-[var(--color-on-surface)]/90 to-[var(--color-on-surface-muted)] bg-clip-text text-transparent">Todo para tu inglés.</span>
                    </h1>
                </div>

                <div className="mb-10 text-center flex justify-center w-full">
                    <BlurText
                        text="Historias interactivas, tutor conversacional con IA, simulacros de certificación oficial (TOEFL, IELTS, Cambridge), laboratorio de errores FSRS y portabilidad de mazos."
                        delay={30}
                        className="text-base sm:text-lg text-[var(--color-on-surface)] font-medium max-w-2xl mx-auto leading-relaxed font-body justify-center"
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
                            className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white rounded-full px-8 py-4 text-base font-bold inline-flex items-center gap-2 shadow-[var(--shadow-elevated)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)] transition-all duration-300"
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
                        className="relative mx-auto max-w-3xl rounded-[2rem] bg-[var(--color-card)]/50 backdrop-blur-sm p-2 shadow-[var(--shadow-float)]"
                    >
                        {/* Fake browser bar */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-surface-container-low)] rounded-t-[1.75rem]">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-level-b2)]/60" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-level-b1)]/60" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]/60" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="bg-[var(--color-surface-container)]/80 rounded-full px-4 py-1.5 text-xs text-[var(--color-on-surface-muted)] text-center">
                                    voxie.lat
                                </div>
                            </div>
                        </div>
                        {/* App mockup content */}
                        <div className="grid grid-cols-12 gap-0 min-h-[280px]">
                            {/* Sidebar mock */}
                            <div className="col-span-3 bg-[var(--color-surface-container-low)]/50 p-4 space-y-3 hidden sm:block">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-5 h-5 rounded-xl bg-[var(--color-primary)]/30" />
                                    <div className="h-3 w-14 bg-[var(--color-on-surface)]/10 rounded-full" />
                                </div>
                                {['w-20', 'w-16', 'w-24', 'w-18', 'w-14'].map((w, i) => (
                                    <div key={i} className={`h-2.5 ${w} rounded-full ${i === 0 ? 'bg-[var(--color-primary)]/40' : 'bg-[var(--color-on-surface)]/5'}`} />
                                ))}
                            </div>
                            {/* Main content mock */}
                            <div className="col-span-12 sm:col-span-9 p-5 space-y-4">
                                <div className="h-4 w-40 bg-[var(--color-on-surface)]/10 rounded-full" />
                                <div className="h-3 w-56 bg-[var(--color-on-surface)]/5 rounded-full" />
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    {[
                                        { label: 'Racha', value: '12 dias', color: 'bg-[var(--color-level-b1)]/20 text-[var(--color-level-b1)]' },
                                        { label: 'Palabras', value: '347', color: 'bg-[var(--color-level-a1)]/20 text-[var(--color-level-a1)]' },
                                        { label: 'Por repasar', value: '8', color: 'bg-[var(--color-primary-light)]/20 text-[var(--color-primary-light)]' },
                                        { label: 'Nivel', value: 'A2', color: 'bg-[var(--color-success)]/20 text-[var(--color-success)]' },
                                    ].map((stat) => (
                                        <div key={stat.label} className="bg-[var(--color-surface-container-low)] rounded-2xl p-3 space-y-1">
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
                <div className="text-center mb-16 flex flex-col items-center">
                    <BlurText
                        text="Todo lo que necesitas para aprender ingles"
                        delay={60}
                        className="text-3xl sm:text-4xl font-black tracking-tight mb-4 font-display justify-center"
                    />
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-[var(--color-on-surface)]/80 text-base sm:text-lg max-w-xl mx-auto font-body font-medium mt-2"
                    >
                        Seis herramientas con IA que trabajan juntas para darte la experiencia de aprendizaje mas completa.
                    </motion.p>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={stagger}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {FEATURES.map((f, i) => (
                        <FeatureCard key={f.title} {...f} i={i} />
                    ))}
                </motion.div>
            </section>

            {/* ─── How it works — Notion style ─── */}
            <section className="relative z-10 mx-auto max-w-5xl px-6 py-24">
                <div className="text-center mb-16 flex flex-col items-center">
                    <BlurText
                        text="Asi funciona"
                        delay={60}
                        className="text-3xl sm:text-4xl font-black tracking-tight mb-4 font-display justify-center"
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
                    <motion.h2 custom={0} variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight mb-4 font-display">
                        Precios transparentes
                    </motion.h2>
                    <motion.p custom={1} variants={fadeUp} className="text-[var(--color-on-surface)]/80 text-base sm:text-lg max-w-xl mx-auto font-body font-medium">
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
                    <motion.div custom={0} variants={fadeUp} className="bg-[var(--color-card)] backdrop-blur-sm rounded-[2rem] p-8 shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
                        <div className="text-sm font-bold text-[var(--color-on-surface)]/70 mb-1 font-body">Gratis</div>
                        <div className="text-3xl font-black tracking-tight text-[var(--color-on-surface)] mb-1 font-display">
                            $<CountUp to={0} from={0} duration={1} className="inline" />
                        </div>
                        <div className="text-xs text-[var(--color-on-surface)]/60 mb-6 font-body">Para siempre</div>
                        <ul className="space-y-3">
                            {FREE_ITEMS.map((item, idx) => (
                                <motion.li
                                    key={item}
                                    initial={{ opacity: 0, x: -12 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx, duration: 0.3 }}
                                    className="flex items-start gap-2.5 text-sm text-[var(--color-on-surface)]/80 font-body font-medium"
                                >
                                    <Check className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                        <Link
                            to="/auth"
                            className="mt-6 block w-full text-center bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] font-bold text-sm py-3.5 rounded-full transition-all duration-300 shadow-[var(--shadow-card)]"
                        >
                            Crear cuenta gratis
                        </Link>
                    </motion.div>

                    {/* Pro */}
                    <motion.div custom={1} variants={fadeUp} className="relative bg-[var(--color-card)] backdrop-blur-sm rounded-[2rem] p-8 shadow-[var(--shadow-elevated)] pro-glow-border hover:-translate-y-1 hover:shadow-[var(--shadow-float)] transition-all duration-300">
                        <div className="absolute -top-3 right-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-[var(--shadow-card)]">
                            Recomendado
                        </div>
                        <div className="text-sm font-bold text-[var(--color-primary-light)] mb-1 font-body">Plan Pro</div>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-3xl font-black tracking-tight text-[var(--color-on-surface)] font-display">
                                $<CountUp to={129} from={0} duration={2} className="inline" />
                            </span>
                            <span className="text-sm text-[var(--color-on-surface)]/70 font-body">/mes</span>
                        </div>
                        <div className="text-xs text-[var(--color-on-surface)]/60 mb-6 font-body">
                            o $<CountUp to={1299} from={0} duration={2.5} separator="," className="inline" />/año (~$108/mes)
                        </div>
                        <ul className="space-y-3">
                            {PRO_ITEMS.map((item, idx) => (
                                <motion.li
                                    key={item}
                                    initial={{ opacity: 0, x: -12 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx, duration: 0.3 }}
                                    className="flex items-start gap-2.5 text-sm text-[var(--color-on-surface)]/80 font-body font-medium"
                                >
                                    <Check className="w-4 h-4 text-[var(--color-primary-light)] shrink-0 mt-0.5" />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                        <Link
                            to="/auth"
                            className="mt-6 block w-full text-center text-sm py-3.5 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white rounded-full font-bold shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
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
                    <motion.h2 custom={0} variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight mb-4 font-display">
                        Empieza hoy, gratis
                    </motion.h2>
                    <motion.p custom={1} variants={fadeUp} className="text-[var(--color-on-surface)]/80 text-base sm:text-lg max-w-lg mx-auto mb-8 font-body font-medium">
                        El nivel A1 es tuyo para siempre. Sin tarjeta de crédito, sin compromisos.
                    </motion.p>
                    <motion.div custom={2} variants={fadeUp}>
                        <Link
                            to="/auth"
                            className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white rounded-full px-10 py-4 text-base font-bold inline-flex items-center gap-2 shadow-[var(--shadow-elevated)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)] transition-all duration-300"
                        >
                            Crear cuenta gratis
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="relative z-10 bg-[var(--color-surface-container-low)] py-8 px-6">
                <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Voxie" className="w-5 h-5 rounded-lg object-cover" />
                        <span className="text-sm font-bold text-[var(--color-on-surface-muted)] font-display">Voxie</span>
                    </div>
                    <p className="text-xs text-[var(--color-on-surface-muted)] font-body">
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
