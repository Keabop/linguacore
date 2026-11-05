import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import Wordmark from '../components/ui/Wordmark';
import LevelBadge from '../components/ui/LevelBadge';
import Plant from '../components/garden/Plant';
import { celebrateCorrect, nudgeWrong } from '../lib/celebrate';
import type { CEFRLevel } from '../lib/db';
import { LEGAL_OWNER } from '../data/legalOwner';

/* ------------------------------------------------------------------ */
/*  Content (counts come from src/data: units.ts and stories.ts)       */
/* ------------------------------------------------------------------ */

const STAGES: {
    level: CEFRLevel; name: string; units: number; stories: number; canDo: string; sample: string[];
    plant: { stage: 'seed' | 'sprout' | 'grown'; height: number; noBloom?: boolean };
}[] = [
    { level: 'A1', name: 'Semilla', units: 8, stories: 14, canDo: 'Te presentas, hablas de tu día y de lo que te gusta.', sample: ['Introducing Yourself', 'My Daily Life', 'At the Market'], plant: { stage: 'seed', height: 30 } },
    { level: 'A2', name: 'Brote', units: 10, stories: 18, canDo: 'Cuentas lo que hiciste, haces planes y comparas.', sample: ['What Did You Do Yesterday?', 'Travel Stories', 'My Plans for the Future'], plant: { stage: 'sprout', height: 38 } },
    { level: 'B1', name: 'Hoja', units: 12, stories: 22, canDo: 'Hablas de experiencias y cuentas lo que otros dijeron.', sample: ['Life Experiences', 'Back in the Day', 'What Did They Say?'], plant: { stage: 'grown', height: 42, noBloom: true } },
    { level: 'B2', name: 'Flor', units: 14, stories: 26, canDo: 'Imaginas escenarios, matizas y escribes con detalle.', sample: ['What If Things Had Been Different?', 'I Wish I Could...', 'Painting with Words'], plant: { stage: 'grown', height: 48 } },
];

const SESSION = [
    { title: 'Lees', desc: '80 historias con audio, de A1 a B2. Tocas una palabra y ves su traducción, y se guarda en tu mazo.' },
    { title: 'Practicas', desc: 'Gramática, escritura y habla en cada unidad, y un tutor con IA para conversar de lo que quieras.' },
    { title: 'Repasas', desc: 'Tus tarjetas vuelven con repetición espaciada (FSRS), justo antes de que las olvides.' },
    { title: 'Corriges', desc: 'Los errores que detecta el tutor se vuelven minijuegos en tu laboratorio de errores.' },
];

const FREE_ITEMS = ['Niveles A1 a B2 con ruta guiada, para siempre', 'Historias con audio y repasos ilimitados', 'Test de nivelación', 'Laboratorio de errores', 'Importar y exportar tu vocabulario'];
const PRO_ITEMS = ['Tutor conversacional ilimitado', 'Evaluación de escritura y habla con IA sin límite', 'Simulacros TOEFL, IELTS y Cambridge', 'Plantas extra para tu jardín'];

/** The notebook's sample: a learner's A2 sentence with two real errors to fix. */
const SAMPLE: ({ text: string } | { wrong: string; options: string[]; answer: string })[] = [
    { text: 'Yesterday I ' },
    { wrong: 'go', options: ['go', 'went', 'goes'], answer: 'went' },
    { text: ' to the office and I ' },
    { wrong: 'have', options: ['have', 'has', 'had'], answer: 'had' },
    { text: ' a meeting with my boss.' },
];
const FIXES = SAMPLE.filter((p): p is { wrong: string; options: string[]; answer: string } => 'wrong' in p);

const reveal = {
    initial: { opacity: 0, y: 8 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const },
};

/* ------------------------------------------------------------------ */
/*  The open notebook: fix the sentence, the pressed plant grows       */
/* ------------------------------------------------------------------ */

function Notebook() {
    const [fixed, setFixed] = useState<Record<string, string>>({});
    const [open, setOpen] = useState<string | null>(null);
    const [wrongTry, setWrongTry] = useState<string | null>(null);
    const [justFixed, setJustFixed] = useState<string | null>(null);
    const refs = useRef<Record<string, HTMLElement | null>>({});
    const done = FIXES.every(f => fixed[f.wrong] === f.answer);
    const count = FIXES.filter(f => fixed[f.wrong] === f.answer).length;

    const pick = (f: typeof FIXES[number], option: string) => {
        if (option === f.answer) {
            setFixed(prev => ({ ...prev, [f.wrong]: option }));
            setJustFixed(f.wrong);
            setOpen(null);
            setWrongTry(null);
        } else {
            setWrongTry(`${f.wrong}:${option}`);
        }
    };

    // After React applied the classes, so the animation class survives
    useEffect(() => {
        if (wrongTry) nudgeWrong(refs.current[wrongTry] ?? null);
    }, [wrongTry]);
    useEffect(() => {
        if (justFixed) celebrateCorrect(refs.current[`done:${justFixed}`] ?? null);
    }, [justFixed]);

    return (
        <div className="nb-spread">
            {/* Left page: the sentence and the margin notes */}
            <div className="nb-page nb-page-left">
                <h1 className="nb-title">
                    Escribe. Voxie te <span className="text-[var(--color-primary)]">corrige</span> a tu nivel.
                </h1>

                <p className="nb-hint">Esta frase de nivel A2 tiene dos errores. Tócalos y corrígelos.</p>

                <p className="nb-sentence" lang="en">
                    {SAMPLE.map((part, i) => {
                        if ('text' in part) return <span key={i}>{part.text}</span>;
                        const ok = fixed[part.wrong] === part.answer;
                        if (ok) {
                            return (
                                <span key={i} className="nb-fix" ref={el => { refs.current[`done:${part.wrong}`] = el; }}>
                                    <s>{part.wrong}</s> <span className="nb-fix-new">{part.answer}</span>
                                </span>
                            );
                        }
                        return (
                            <span key={i} className="relative inline-block">
                                <button
                                    type="button"
                                    className={`nb-wrong ${open === part.wrong ? 'is-open' : ''}`}
                                    aria-expanded={open === part.wrong}
                                    onClick={() => setOpen(open === part.wrong ? null : part.wrong)}
                                >
                                    {part.wrong}
                                </button>
                                {open === part.wrong && (
                                    <span className="nb-options" role="group" aria-label={`Opciones para ${part.wrong}`}>
                                        {part.options.map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                ref={el => { refs.current[`${part.wrong}:${option}`] = el; }}
                                                onClick={() => pick(part, option)}
                                                className={wrongTry === `${part.wrong}:${option}` ? 'is-wrong' : ''}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </span>
                                )}
                            </span>
                        );
                    })}
                </p>

                <div className="nb-note" aria-live="polite">
                    {done ? (
                        <p><b>Pasado simple.</b> «Yesterday» pide <span lang="en">went</span> y <span lang="en">had</span>. Así te corrige Voxie: tu frase, tus errores y por qué, a la medida de tu nivel. Comas y mayúsculas no cuentan como error.</p>
                    ) : (
                        <p><b>Pista:</b> la frase habla de ayer. Lleva {count} de {FIXES.length}.</p>
                    )}
                </div>

                <dl className="nb-scores" aria-label="Así se ve una calificación">
                    {[['Gramática', done ? 100 : 60], ['Vocabulario', 100], ['Coherencia', 100]].map(([k, v]) => (
                        <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                    ))}
                </dl>
            </div>

            {/* Right page: the pressed plant and the action */}
            <div className="nb-page nb-page-right">
                <figure className="nb-specimen">
                    <span className="nb-tape" aria-hidden="true" />
                    <Plant species="girasol" stage={done ? 'grown' : 'sprout'} height={done ? 48 : count ? 34 : 20} />
                    <figcaption>{done ? 'Tu frase quedó bien. La planta creció.' : 'Cada error que corriges la hace crecer.'}</figcaption>
                </figure>

                <div className="nb-cta">
                    <Link to="/auth" className="btn-primary px-6 py-3.5 text-base inline-flex items-center gap-2">
                        Escribe tu primera frase <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <p className="text-sm text-[var(--color-on-surface-muted)]">
                        Gratis, de A1 a B2. Sin tarjeta. O <Link to="/probar" className="font-semibold underline underline-offset-2 text-[var(--color-on-surface)]">lee una historia sin cuenta</Link>.
                    </p>
                    {done && (
                        <button type="button" onClick={() => { setFixed({}); setOpen(null); setJustFixed(null); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]">
                            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Otra vez
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Landing() {
    return (
        <MotionConfig reducedMotion="user">
            <div className="nb-ground min-h-screen">
                <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn-primary px-4 py-2 text-sm">
                    Saltar al contenido
                </a>

                <header className="mx-auto flex max-w-[84rem] items-center justify-between gap-4 px-4 sm:px-6 py-5">
                    <Link to="/" aria-label="Voxie, inicio"><Wordmark className="text-2xl !text-[var(--color-on-primary)]" markClassName="w-7 h-7 !text-[var(--color-on-primary)]" /></Link>
                    <nav className="flex items-center gap-1 sm:gap-3" aria-label="Principal">
                        <a href="#precios" className="nb-navlink hidden sm:inline-block">Precios</a>
                        <Link to="/auth" className="nb-navlink max-[400px]:hidden">Entrar</Link>
                        <Link to="/auth" className="nb-navbtn">Empezar gratis</Link>
                    </nav>
                </header>

                <main id="main" className="mx-auto max-w-[84rem] px-3 sm:px-6 space-y-6 sm:space-y-10">
                    <Notebook />

                    {/* Specimen sheet: the four stages */}
                    <section className="nb-page nb-sheet" aria-labelledby="stages-title">
                        <motion.div {...reveal} className="nb-sheet-head">
                            <h2 id="stages-title" className="nb-h2">Cuatro etapas, de semilla a flor.</h2>
                            <p>Cada nivel CEFR es una etapa. Cada unidad que terminas es una planta nueva en tu jardín.</p>
                        </motion.div>
                        <ol className="nb-specimens">
                            {STAGES.map((s, i) => (
                                <motion.li key={s.level} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="nb-mount">
                                    <span className="nb-tape" aria-hidden="true" />
                                    <div className="nb-mount-plant" aria-hidden="true">
                                        <Plant species="girasol" stage={s.plant.stage} height={s.plant.height} noBloom={s.plant.noBloom} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LevelBadge level={s.level} />
                                        <h3 className="font-display text-xl font-extrabold">{s.name}</h3>
                                    </div>
                                    <p className="text-sm text-[var(--color-on-surface-muted)]">{s.canDo}</p>
                                    <ul className="nb-samples">
                                        {s.sample.map(title => <li key={title} lang="en">{title}</li>)}
                                    </ul>
                                    <p className="nb-label">{s.units} unidades · {s.stories} historias</p>
                                </motion.li>
                            ))}
                        </ol>
                    </section>

                    {/* A day's watering, and what it is for */}
                    <section className="nb-spread nb-spread-plain" aria-labelledby="session-title">
                        <div className="nb-page nb-page-left">
                            <motion.h2 {...reveal} id="session-title" className="nb-h2">Así se riega, cada día.</motion.h2>
                            <p className="mt-3 text-[var(--color-on-surface-muted)]">Una sesión tiene cuatro pasos, en este orden. Caben en diez minutos o en una hora.</p>
                            <ol className="nb-steps">
                                {SESSION.map(({ title, desc }, i) => (
                                    <motion.li key={title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.05 }}>
                                        <span className="nb-step-n" aria-hidden="true">{i + 1}</span>
                                        <div><h3>{title}</h3><p>{desc}</p></div>
                                    </motion.li>
                                ))}
                            </ol>
                        </div>
                        <div className="nb-page nb-page-right nb-pockets">
                            <motion.article {...reveal} className="nb-card">
                                <span className="nb-tape" aria-hidden="true" />
                                <h3 className="nb-h3">Para tu examen</h3>
                                <p>Simulacros de TOEFL, IELTS y Cambridge B1/B2 con reading, listening, writing y speaking evaluado por IA.</p>
                            </motion.article>
                            <motion.article {...reveal} className="nb-card">
                                <span className="nb-tape" aria-hidden="true" />
                                <h3 className="nb-h3">Para tu trabajo</h3>
                                <p>Genera un mazo de 15 palabras de tu profesión. Importa tarjetas de Anki o Quizlet y exporta tu progreso en CSV cuando quieras.</p>
                            </motion.article>
                        </div>
                    </section>

                    {/* Prices, on the notebook's last page */}
                    <section id="precios" className="nb-page nb-sheet" aria-labelledby="pricing-title">
                        <motion.div {...reveal} className="nb-sheet-head">
                            <h2 id="pricing-title" className="nb-h2">Empieza gratis. Crece con Pro.</h2>
                            <p>Precios en pesos mexicanos. Cancelas cuando quieras.</p>
                        </motion.div>
                        <div className="nb-prices">
                            <motion.div {...reveal} className="nb-price">
                                <h3 className="nb-h3">Gratis</h3>
                                <p><span className="nb-amount">$0</span> para siempre</p>
                                <ul>{FREE_ITEMS.map(item => <li key={item}><Check className="w-4 h-4" aria-hidden="true" />{item}</li>)}</ul>
                                <Link to="/auth" className="btn-secondary py-3 text-center text-sm">Crear cuenta gratis</Link>
                            </motion.div>
                            <motion.div {...reveal} className="nb-price is-pro">
                                <h3 className="nb-h3">Pro</h3>
                                <p><span className="nb-amount">$115</span> al mes</p>
                                <p className="-mt-2 text-xs text-[var(--color-on-surface-variant)]">o $1,199 al año (unos $100 al mes)</p>
                                <ul>{PRO_ITEMS.map(item => <li key={item}><Check className="w-4 h-4" aria-hidden="true" />{item}</li>)}</ul>
                                <Link to="/auth" className="btn-primary py-3 text-center text-sm">Empezar con Pro</Link>
                            </motion.div>
                        </div>
                    </section>
                </main>

                <footer className="mx-auto max-w-[84rem] px-4 sm:px-6 pt-16 pb-10 space-y-10 text-[var(--color-on-primary)]">
                    <div className="space-y-6">
                        <p className="font-display text-[clamp(2.4rem,7vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">Riega tu inglés hoy.</p>
                        <Link to="/auth" className="nb-navbtn !px-6 !py-3.5 !text-base inline-flex items-center gap-2">
                            Crear cuenta gratis <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-[color-mix(in_oklch,var(--color-on-primary)_30%,transparent)] pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <Wordmark className="text-lg !text-[var(--color-on-primary)]" markClassName="w-5 h-5 !text-[var(--color-on-primary)]" />
                        <nav aria-label="Información legal" className="flex flex-wrap gap-x-4 gap-y-2">
                            <span>© {new Date().getFullYear()} Voxie</span>
                            {[['/privacidad', 'Privacidad'], ['/terminos', 'Términos'], ['/cookies', 'Cookies'], ['/credits', 'Créditos']].map(([to, label]) => (
                                <Link key={to} to={to} className="underline underline-offset-2">{label}</Link>
                            ))}
                            <a href={`mailto:${LEGAL_OWNER.email}`} className="underline underline-offset-2">Contacto</a>
                        </nav>
                    </div>
                </footer>
            </div>
        </MotionConfig>
    );
}
