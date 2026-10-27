/* Hallmark · genre: playful · macrostructure: Narrative Workflow · design-system: cerebro/diseno/design.md · designed-as-app
 * hero: try-it exercise (no account) · nav: N9 edge-aligned · footer: Ft5 statement · enrichment: Tier B hand-built SVG plants
 */
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Check, GraduationCap, MessageCircle, RotateCcw, Upload, Briefcase, Activity } from 'lucide-react';
import Wordmark from '../components/ui/Wordmark';
import LevelBadge from '../components/ui/LevelBadge';
import Garden from '../components/garden/Garden';
import Plant from '../components/garden/Plant';
import PlayOnMount from '../components/icons/PlayOnMount';
import { CheckIcon } from '../components/icons';
import { celebrateCorrect, nudgeWrong } from '../lib/celebrate';
import type { CEFRLevel } from '../lib/db';

/* ------------------------------------------------------------------ */
/*  Content (counts come from src/data: units.ts and stories.ts)       */
/* ------------------------------------------------------------------ */

const STAGES: {
    level: CEFRLevel; name: string; units: number; stories: number; canDo: string; sample: string[];
    plant: { stage: 'seed' | 'sprout' | 'grown'; height: number; noBloom?: boolean };
}[] = [
    {
        level: 'A1', name: 'Semilla', units: 8, stories: 10,
        canDo: 'Te presentas, hablas de tu día y de lo que te gusta.',
        sample: ['Introducing Yourself', 'My Daily Life', 'At the Market'],
        plant: { stage: 'seed', height: 30 },
    },
    {
        level: 'A2', name: 'Brote', units: 10, stories: 10,
        canDo: 'Cuentas lo que hiciste, haces planes y comparas.',
        sample: ['What Did You Do Yesterday?', 'Travel Stories', 'My Plans for the Future'],
        plant: { stage: 'sprout', height: 38 },
    },
    {
        level: 'B1', name: 'Hoja', units: 12, stories: 11,
        canDo: 'Hablas de experiencias y cuentas lo que otros dijeron.',
        sample: ['Life Experiences', 'Back in the Day', 'What Did They Say?'],
        plant: { stage: 'grown', height: 42, noBloom: true },
    },
    {
        level: 'B2', name: 'Flor', units: 14, stories: 13,
        canDo: 'Imaginas escenarios, matizas y escribes con detalle.',
        sample: ['What If Things Had Been Different?', 'I Wish I Could...', 'Painting with Words'],
        plant: { stage: 'grown', height: 48 },
    },
];

const SESSION = [
    { icon: BookOpen, title: 'Lees', desc: '44 historias de tu nivel. Toca cualquier palabra para ver su traducción y guardarla en tu mazo.' },
    { icon: MessageCircle, title: 'Practicas', desc: 'Gramática, escritura y speaking en cada unidad, y un tutor con IA para conversar de lo que quieras.' },
    { icon: Brain, title: 'Repasas', desc: 'Tus tarjetas vuelven con repetición espaciada (FSRS), justo antes de que las olvides.' },
    { icon: Activity, title: 'Corriges', desc: 'Los errores que detecta el tutor se vuelven minijuegos en tu laboratorio de errores.' },
];

const FREE_ITEMS = [
    'Nivel A1 completo, para siempre',
    'Test de nivelación',
    'Laboratorio de errores',
    'Importar y exportar tu vocabulario',
];

const PRO_ITEMS = [
    'Niveles A1 a B2 con ruta guiada',
    'Tutor conversacional y repasos ilimitados',
    'Simulacros TOEFL, IELTS y Cambridge',
    'Evaluación de escritura y speaking con IA',
    'Plantas extra para tu jardín',
];

const TRY_QUESTIONS = [
    { sentence: ['She', 'to work by bus.'], options: ['go', 'goes', 'going'], answer: 'goes', why: 'Con he, she e it el verbo lleva -s: she goes.' },
    { sentence: ['I', 'from Mexico.'], options: ['am', 'is', 'are'], answer: 'am', why: 'Con I siempre va am: I am from Mexico.' },
    { sentence: ['There', 'two cats in the garden.'], options: ['is', 'are', 'be'], answer: 'are', why: 'Con plural (two cats) se usa there are.' },
];

const reveal = {
    initial: { opacity: 0, y: 8 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const },
};

/* ------------------------------------------------------------------ */
/*  Hero exercise: three A1 questions, each right answer plants one    */
/* ------------------------------------------------------------------ */

function TryIt() {
    const [index, setIndex] = useState(0);
    const [picked, setPicked] = useState<string | null>(null);
    const [correct, setCorrect] = useState(0);
    const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const done = index >= TRY_QUESTIONS.length;
    const q = TRY_QUESTIONS[Math.min(index, TRY_QUESTIONS.length - 1)];
    const isRight = picked === q.answer;

    const choose = (option: string) => {
        if (picked) return;
        setPicked(option);
        if (option === q.answer) {
            setCorrect(c => c + 1);
            celebrateCorrect(optionRefs.current[option]);
        } else {
            nudgeWrong(optionRefs.current[option]);
        }
    };

    const next = () => {
        setPicked(null);
        setIndex(i => i + 1);
    };

    const restart = () => {
        setIndex(0);
        setPicked(null);
        setCorrect(0);
    };

    return (
        <div className="card p-5 sm:p-6 space-y-5 text-left" aria-labelledby="try-title">
            <div className="flex items-baseline justify-between gap-3">
                <h2 id="try-title" className="text-xl font-extrabold">Pruébalo ahora</h2>
                <span className="text-xs font-mono text-[var(--color-on-surface-variant)]">
                    {done ? '3 / 3' : `${index + 1} / 3`}
                </span>
            </div>

            <Garden
                total={3}
                completed={correct}
                species="girasol"
                grow={false}
                label={`${correct} de 3 respuestas correctas`}
                className="!h-24"
            />

            {done ? (
                <div className="space-y-4" role="status">
                    <p className="text-lg font-bold">
                        {correct === 3 ? 'Tres de tres. Tu jardín ya floreció.' : `Plantaste ${correct} de 3.`}
                    </p>
                    <p className="text-sm text-[var(--color-on-surface-muted)]">
                        Crea tu cuenta para guardar tu jardín y seguir con la unidad 1 del nivel A1.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/auth" className="btn-primary px-5 py-3 text-sm inline-flex items-center gap-2">
                            Guardar mi jardín <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                        <button onClick={restart} className="btn-secondary px-5 py-3 text-sm inline-flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Otra vez
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="font-display text-2xl font-bold tracking-tight">
                        {q.sentence[0]}{' '}
                        <span className="inline-block min-w-16 border-b-[3px] border-[var(--color-tertiary)] text-center px-2">
                            {picked ?? '?'}
                        </span>{' '}
                        {q.sentence[1]}
                    </p>

                    <div className="grid gap-2" role="group" aria-label="Opciones">
                        {q.options.map((option) => {
                            const state = !picked ? '' : option === q.answer ? 'right' : option === picked ? 'wrong' : 'dim';
                            return (
                                <button
                                    key={option}
                                    ref={(el) => { optionRefs.current[option] = el; }}
                                    onClick={() => choose(option)}
                                    disabled={!!picked}
                                    className={`flex items-center justify-between rounded-[var(--radius-sm)] border-[1.5px] px-4 py-3 text-left font-medium transition-colors duration-[var(--dur-short)] ${
                                        state === 'right'
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-container)]'
                                            : state === 'wrong'
                                                ? 'border-[var(--color-error)] bg-[var(--color-error-light)]'
                                                : state === 'dim'
                                                    ? 'border-[var(--color-outline-variant)] opacity-60'
                                                    : 'border-[var(--color-outline-variant)] bg-[var(--color-card)] hover:border-[var(--color-on-surface-muted)]'
                                    }`}
                                >
                                    {option}
                                    {state === 'right' && <PlayOnMount icon={CheckIcon} size={20} className="text-[var(--color-primary)]" />}
                                </button>
                            );
                        })}
                    </div>

                    <div aria-live="polite" className="min-h-[1.5rem]">
                        {picked && (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-[var(--color-on-surface-muted)]">
                                    <strong className={isRight ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}>
                                        {isRight ? 'Correcto.' : 'Casi.'}
                                    </strong>{' '}
                                    {q.why}
                                </p>
                                <button onClick={next} className="btn-primary px-5 py-2.5 text-sm" autoFocus>
                                    {index === TRY_QUESTIONS.length - 1 ? 'Ver mi jardín' : 'Siguiente'}
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Landing() {
    return (
        <MotionConfig reducedMotion="user">
            <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)]">
                <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn-primary px-4 py-2 text-sm">
                    Saltar al contenido
                </a>

                {/* Nav: wordmark left, actions right */}
                <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 py-5">
                    <Link to="/" aria-label="Voxie, inicio"><Wordmark className="text-2xl" /></Link>
                    <nav className="flex items-center gap-1 sm:gap-3" aria-label="Principal">
                        <a href="#precios" className="hidden sm:inline-block text-sm font-semibold text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] px-3 py-2 whitespace-nowrap">
                            Precios
                        </a>
                        <Link to="/auth" className="text-sm font-semibold text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] px-3 py-2 whitespace-nowrap">
                            Entrar
                        </Link>
                        <Link to="/auth" className="btn-primary px-4 sm:px-5 py-2.5 text-sm whitespace-nowrap">
                            Empezar gratis
                        </Link>
                    </nav>
                </header>

                <main id="main">
                    {/* Hero */}
                    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 pt-6 pb-20 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-14 md:pt-12">
                        <div className="space-y-6 text-left min-w-0">
                            <h1 className="text-[clamp(2.6rem,7vw,4.75rem)] font-extrabold leading-[0.98] tracking-[-0.035em] [overflow-wrap:anywhere]">
                                Tu inglés <span className="text-[var(--color-primary)]">crece</span> un poco cada día.
                            </h1>
                            <p className="max-w-xl text-lg text-[var(--color-on-surface-muted)]">
                                Voxie te lleva de A1 a B2 con historias de tu nivel, un tutor con IA y repasos que llegan justo cuando los necesitas.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <Link to="/auth" className="btn-primary px-6 py-3.5 text-base inline-flex items-center gap-2">
                                    Empezar gratis <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </Link>
                                <a href="#como-crece" className="btn-secondary px-6 py-3.5 text-base">Ver cómo funciona</a>
                            </div>
                            <p className="text-sm text-[var(--color-on-surface-variant)]">El nivel A1 es gratis para siempre. Sin tarjeta.</p>
                        </div>
                        <TryIt />
                    </section>

                    {/* How your English grows: the four stages */}
                    <section id="como-crece" className="bg-[var(--color-surface-container-low)] py-20" aria-labelledby="stages-title">
                        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
                            <motion.div {...reveal} className="max-w-2xl space-y-3 text-left">
                                <h2 id="stages-title" className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
                                    Cuatro etapas, de semilla a flor.
                                </h2>
                                <p className="text-[var(--color-on-surface-muted)]">
                                    Cada nivel CEFR es una etapa. Cada unidad que completas es una planta nueva en tu jardín.
                                </p>
                            </motion.div>

                            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {STAGES.map((s, i) => (
                                    <motion.li
                                        key={s.level}
                                        {...reveal}
                                        transition={{ ...reveal.transition, delay: i * 0.06 }}
                                        className="card flex flex-col gap-4 p-5 text-left"
                                    >
                                        <div className="garden !h-28" style={{ gridTemplateColumns: '1fr' }}>
                                            <Plant species="girasol" stage={s.plant.stage} height={s.plant.height} noBloom={s.plant.noBloom} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <LevelBadge level={s.level} />
                                            <h3 className="text-xl font-extrabold">{s.name}</h3>
                                        </div>
                                        <p className="text-sm text-[var(--color-on-surface-muted)]">{s.canDo}</p>
                                        <ul className="space-y-1 text-sm">
                                            {s.sample.map(title => (
                                                <li key={title} className="flex gap-2">
                                                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                                                    <span lang="en">{title}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-auto text-xs font-mono text-[var(--color-on-surface-variant)]">
                                            {s.units} unidades · {s.stories} historias
                                        </p>
                                    </motion.li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    {/* A study session, in order */}
                    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20" aria-labelledby="session-title">
                        <div className="grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                            <motion.div {...reveal} className="space-y-3 text-left md:sticky md:top-10 md:self-start">
                                <h2 id="session-title" className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
                                    Así se riega, cada día.
                                </h2>
                                <p className="text-[var(--color-on-surface-muted)]">
                                    Una sesión en Voxie tiene cuatro pasos. Puedes hacerlos en diez minutos o en una hora.
                                </p>
                            </motion.div>

                            <ol className="space-y-3">
                                {SESSION.map(({ icon: Icon, title, desc }, i) => (
                                    <motion.li key={title} {...reveal} className="card flex gap-4 p-5 text-left">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-container)] text-[var(--color-primary)]">
                                            <Icon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-extrabold">
                                                <span className="font-mono text-sm text-[var(--color-on-surface-variant)] mr-2">{i + 1}</span>
                                                {title}
                                            </h3>
                                            <p className="text-sm text-[var(--color-on-surface-muted)]">{desc}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    {/* Exams and work */}
                    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20" aria-label="Exámenes y trabajo">
                        <div className="grid gap-4 md:grid-cols-2">
                            <motion.article {...reveal} className="card p-6 sm:p-8 space-y-3 text-left">
                                <GraduationCap className="h-7 w-7 text-[var(--color-primary)]" aria-hidden="true" />
                                <h2 className="text-2xl font-extrabold">Para tu examen</h2>
                                <p className="text-[var(--color-on-surface-muted)]">
                                    Simulacros de TOEFL, IELTS y Cambridge B1/B2 con reading, listening, writing y speaking evaluado por IA.
                                </p>
                            </motion.article>
                            <motion.article {...reveal} className="card p-6 sm:p-8 space-y-3 text-left">
                                <div className="flex gap-2 text-[var(--color-primary)]">
                                    <Briefcase className="h-7 w-7" aria-hidden="true" />
                                    <Upload className="h-7 w-7" aria-hidden="true" />
                                </div>
                                <h2 className="text-2xl font-extrabold">Para tu trabajo</h2>
                                <p className="text-[var(--color-on-surface-muted)]">
                                    Genera un mazo de 15 palabras para tu profesión. Importa tarjetas de Anki o Quizlet y exporta tu progreso en CSV cuando quieras.
                                </p>
                            </motion.article>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section id="precios" className="bg-[var(--color-surface-container-low)] py-20" aria-labelledby="pricing-title">
                        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-10">
                            <motion.div {...reveal} className="space-y-3 text-left md:text-center">
                                <h2 id="pricing-title" className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
                                    Empieza gratis. Crece con Pro.
                                </h2>
                                <p className="text-[var(--color-on-surface-muted)]">Precios en pesos mexicanos. Cancelas cuando quieras.</p>
                            </motion.div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <motion.div {...reveal} className="card p-7 flex flex-col gap-5 text-left">
                                    <div>
                                        <h3 className="text-lg font-extrabold">Gratis</h3>
                                        <p className="mt-1"><span className="font-display text-4xl font-extrabold">$0</span> <span className="text-sm text-[var(--color-on-surface-muted)]">para siempre</span></p>
                                    </div>
                                    <ul className="space-y-2.5 text-sm">
                                        {FREE_ITEMS.map(item => (
                                            <li key={item} className="flex gap-2.5"><Check className="h-4 w-4 shrink-0 mt-0.5 text-[var(--color-primary)]" aria-hidden="true" />{item}</li>
                                        ))}
                                    </ul>
                                    <Link to="/auth" className="btn-secondary mt-auto py-3 text-center text-sm">Crear cuenta gratis</Link>
                                </motion.div>

                                <motion.div {...reveal} className="card p-7 flex flex-col gap-5 text-left border-2 border-[var(--color-primary)]">
                                    <div>
                                        <h3 className="text-lg font-extrabold">Pro</h3>
                                        <p className="mt-1"><span className="font-display text-4xl font-extrabold">$129</span> <span className="text-sm text-[var(--color-on-surface-muted)]">al mes</span></p>
                                        <p className="text-xs text-[var(--color-on-surface-variant)]">o $1,299 al año (unos $108 al mes)</p>
                                    </div>
                                    <ul className="space-y-2.5 text-sm">
                                        {PRO_ITEMS.map(item => (
                                            <li key={item} className="flex gap-2.5"><Check className="h-4 w-4 shrink-0 mt-0.5 text-[var(--color-primary)]" aria-hidden="true" />{item}</li>
                                        ))}
                                    </ul>
                                    <Link to="/auth" className="btn-primary mt-auto py-3 text-center text-sm">Empezar con Pro</Link>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer as a statement */}
                <footer className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-10 space-y-10">
                    <div className="space-y-6 text-left">
                        <p className="font-display text-[clamp(2.4rem,7vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">
                            Riega tu inglés <span className="text-[var(--color-primary)]">hoy</span>.
                        </p>
                        <Link to="/auth" className="btn-primary px-6 py-3.5 text-base inline-flex items-center gap-2">
                            Crear cuenta gratis <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-[var(--color-outline-variant)] pt-6 text-sm text-[var(--color-on-surface-variant)] sm:flex-row sm:items-center sm:justify-between">
                        <Wordmark className="text-lg" markClassName="w-5 h-5" />
                        <p>© {new Date().getFullYear()} Voxie</p>
                    </div>
                </footer>
            </div>
        </MotionConfig>
    );
}
