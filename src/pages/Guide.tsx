import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    BookA, BookOpen, Check, ChevronRight, Droplet, Flame, FlaskConical, GraduationCap, MapPin, MessageCircle,
    Mic, NotebookPen, PenLine, Pencil, RefreshCw, Snowflake, Trophy, type LucideProps,
} from 'lucide-react';
import PageHead from '../components/ui/PageHead';
import LevelBadge from '../components/ui/LevelBadge';
import PillTabs, { panelId, tabId } from '../components/ui/PillTabs';
import { NoteBody } from '../components/notebook/NotebookPanel';
import { useNotebook } from '../components/notebook/NotebookContext';
import { useGuide } from '../hooks/useGuide';
import { useDailyGoal } from '../hooks/useDailyGoal';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { a1Units, a2Units, b1Units, b2Units } from '../data/curriculum/units';
import { FORCED_ATTEMPTS, PASS_SCORE } from '../lib/retryPolicy';
import { LEVEL_FINAL_PASS } from '../lib/exam/levelFinal';
import {
    CHAPTERS, PLAN_GOAL, PLAN_MINUTES, STEP_ORDER, TOOL_ORDER, TOOL_PATHS, guideLanguage, guideText,
    type ChapterId, type ExampleNote, type GuideText, type PlanMinutes, type StepKey, type ToolKey,
} from '../data/guide';
import type { CEFRLevel } from '../lib/database.types';

type Icon = ComponentType<LucideProps>;

const LEVELS: { level: CEFRLevel; units: number }[] = [
    { level: 'A1', units: a1Units.filter(u => !u.isAssessment).length },
    { level: 'A2', units: a2Units.filter(u => !u.isAssessment).length },
    { level: 'B1', units: b1Units.filter(u => !u.isAssessment).length },
    { level: 'B2', units: b2Units.filter(u => !u.isAssessment).length },
];

/** The same icons as the unit's stem (UnitFlow) and the menu */
const STEP_ICONS: Record<StepKey, Icon> = {
    grammar: BookOpen, story: BookOpen, vocab: RefreshCw, exercises: PenLine, output: Mic, checkpoint: Trophy,
};
const TOOL_ICONS: Record<ToolKey, Icon> = {
    review: RefreshCw, stories: BookOpen, lab: FlaskConical, tutor: MessageCircle, practice: Pencil,
    simulator: GraduationCap, notebook: NotebookPen, glossary: BookA,
};

const chapterId = (id: ChapterId) => `guia-${id}`;

/**
 * «Cómo aprender con Voxie»: everything a newcomer needs, from what Voxie is to what goes in the
 * notebook, with a week plan by the time they have that can set their daily goal.
 */
export default function Guide() {
    const { i18n } = useTranslation();
    const text = guideText[guideLanguage(i18n.language)];
    const { markOpened } = useGuide();
    const current = useCurrentChapter();

    // Opening the guide is what retires its card on the home screen
    useEffect(() => { markOpened(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="space-y-8">
            <PageHead title={text.title} lead={text.lead} />

            <div className="guide-layout">
                <nav className="guide-toc" aria-labelledby="guide-contents">
                    <p id="guide-contents" className="app-section-label">{text.contents}</p>
                    <ol>
                        {CHAPTERS.map(id => (
                            <li key={id}>
                                <a href={`#${chapterId(id)}`} aria-current={current === id ? 'location' : undefined}>
                                    {text.chapters[id]}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className="guide-body">
                    <WhatChapter text={text} />
                    <StartChapter text={text} />
                    <PathChapter text={text} />
                    <DayChapter text={text} />
                    <ToolsChapter text={text} />
                    <MethodChapter text={text} />
                    <NotebookChapter text={text} />

                    <section className="app-specimen guide-end" aria-labelledby="guide-end">
                        <h2 id="guide-end" className="app-h2">{text.end.title}</h2>
                        <p>{text.end.body}</p>
                        <Link to="/path" className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm">
                            {text.end.action} <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                    </section>
                </div>
            </div>
        </div>
    );
}

/** The chapter being read, for the contents: the last one whose top is above the top third of the screen. */
function useCurrentChapter(): ChapterId {
    const [current, setCurrent] = useState<ChapterId>(CHAPTERS[0]);
    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            const line = window.innerHeight / 3;
            // At the very bottom the last chapter is the one being read, however short it is
            const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
            const reached = CHAPTERS.filter(id => (document.getElementById(chapterId(id))?.getBoundingClientRect().top ?? Infinity) <= line);
            setCurrent(atEnd ? CHAPTERS[CHAPTERS.length - 1] : reached[reached.length - 1] ?? CHAPTERS[0]);
        };
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);
    return current;
}

function Chapter({ id, title, children }: { id: ChapterId; title: string; children: ReactNode }) {
    return (
        <section id={chapterId(id)} className="guide-chapter" aria-labelledby={`${chapterId(id)}-title`}>
            <h2 id={`${chapterId(id)}-title`} className="app-h2">{title}</h2>
            {children}
        </section>
    );
}

function WhatChapter({ text }: { text: GuideText }) {
    return (
        <Chapter id="what" title={text.chapters.what}>
            {text.what.body.map(p => <p key={p} className="guide-prose">{p}</p>)}
            <ul className="guide-stages">
                {LEVELS.map(({ level }) => (
                    <li key={level}>
                        <LevelBadge level={level} withStage size="compact" />
                        <span>{text.what.stages[level]}</span>
                    </li>
                ))}
            </ul>
        </Chapter>
    );
}

function StartChapter({ text }: { text: GuideText }) {
    return (
        <Chapter id="start" title={text.chapters.start}>
            <p className="guide-prose">{text.start.body}</p>
            <ul className="space-y-3">
                {text.start.options.map(option => (
                    <li key={option.to}>
                        <Link to={option.to} className="guide-option">
                            <span className="flex-1 min-w-0 space-y-1">
                                <span className="block app-h3">{option.title}</span>
                                <span className="block text-[0.9375rem] text-[var(--color-on-surface-muted)]">{option.body}</span>
                                <span className="inline-flex items-center gap-1 pt-1 text-sm font-bold text-[var(--color-primary)]">
                                    {option.action} <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                </span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </Chapter>
    );
}

function PathChapter({ text }: { text: GuideText }) {
    const marks = { ...PASS_SCORE, exam: LEVEL_FINAL_PASS, tries: FORCED_ATTEMPTS };
    return (
        <Chapter id="path" title={text.chapters.path}>
            <p className="guide-prose">{text.path.body}</p>
            <ul className="guide-levels">
                {LEVELS.map(({ level, units }) => (
                    <li key={level}>
                        <LevelBadge level={level} withStage size="compact" />
                        <span className="guide-levels-count">{text.path.level(units)}</span>
                    </li>
                ))}
            </ul>

            <h3 className="app-h3">{text.path.stepsTitle}</h3>
            <ol className="guide-steps">
                {STEP_ORDER.map(key => {
                    const Icon = STEP_ICONS[key];
                    const step = text.path.steps[key];
                    return (
                        <li key={key}>
                            <span className="guide-step-mark" aria-hidden="true"><Icon className="w-4 h-4" /></span>
                            <div className="min-w-0">
                                <p className="font-semibold text-[var(--color-on-surface)]">{step.name}</p>
                                <p className="text-[0.9375rem] text-[var(--color-on-surface-muted)]">{step.body}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>

            <div className="app-sheet p-5 sm:p-6 space-y-4">
                <h3 className="app-h3">{text.path.rulesTitle}</h3>
                <ol className="app-rules">
                    {text.path.rules(marks).map(rule => <li key={rule}><span>{rule}</span></li>)}
                </ol>
            </div>
        </Chapter>
    );
}

function DayChapter({ text }: { text: GuideText }) {
    return (
        <Chapter id="day" title={text.chapters.day}>
            <p className="guide-prose">{text.day.body}</p>
            <div className="guide-pair">
                <div className="space-y-3">
                    <h3 className="app-h3">{text.day.countsTitle}</h3>
                    <ul className="guide-icon-list">
                        {text.day.counts.map(item => (
                            <li key={item}><Droplet className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" /> {item}</li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-3">
                    <h3 className="app-h3">{text.day.streakTitle}</h3>
                    <ul className="guide-icon-list">
                        {text.day.streak.map((item, i) => {
                            const Icon = [Flame, Snowflake, Droplet][i] ?? Droplet;
                            return <li key={item}><Icon className={`w-4 h-4 ${i === 0 ? 'text-[var(--color-tertiary-ink)]' : 'text-[var(--color-on-surface-muted)]'}`} aria-hidden="true" /> {item}</li>;
                        })}
                    </ul>
                </div>
            </div>
        </Chapter>
    );
}

function ToolsChapter({ text }: { text: GuideText }) {
    const notebook = useNotebook();
    return (
        <Chapter id="tools" title={text.chapters.tools}>
            <p className="guide-prose">{text.tools.body}</p>
            <ul className="guide-tools">
                {TOOL_ORDER.map(key => {
                    const Icon = TOOL_ICONS[key];
                    const tool = text.tools.items[key];
                    const to = TOOL_PATHS[key];
                    return (
                        <li key={key}>
                            <span className="guide-tool-icon" aria-hidden="true"><Icon className="w-5 h-5" /></span>
                            <div className="min-w-0 flex-1 space-y-1">
                                <h3 className="font-semibold text-[var(--color-on-surface)]">{tool.name}</h3>
                                <p className="text-[0.9375rem] text-[var(--color-on-surface-muted)]">{tool.body}</p>
                                <p className="text-sm text-[var(--color-on-surface)]"><b>{text.tools.when}:</b> {tool.when}</p>
                            </div>
                            {to && (
                                <Link to={to} className="guide-tool-open" aria-label={`${text.tools.open}: ${tool.name}`}>
                                    {text.tools.open} <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                </Link>
                            )}
                            {key === 'notebook' && notebook && (
                                <button type="button" onClick={notebook.open} className="guide-tool-open">
                                    {text.tools.openNotebook}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </Chapter>
    );
}

function MethodChapter({ text }: { text: GuideText }) {
    const m = text.method;
    return (
        <Chapter id="method" title={text.chapters.method}>
            <p className="guide-prose">{m.body}</p>
            <ul className="guide-principles">
                {m.principles.map(p => (
                    <li key={p.title}>
                        <p className="font-semibold text-[var(--color-on-surface)]">{p.title}</p>
                        <p className="text-[0.9375rem] text-[var(--color-on-surface-muted)]">{p.body}</p>
                    </li>
                ))}
            </ul>
            <StudyPlan text={text} />
        </Chapter>
    );
}

/** The focal moment: a week by the time one has, and the daily goal that goes with it. */
function StudyPlan({ text }: { text: GuideText }) {
    const m = text.method;
    const { user } = useLevelProgression();
    const saveGoal = useDailyGoal();
    const currentGoal = user?.dailyGoal ?? 1;
    const [minutes, setMinutes] = useState<PlanMinutes>(() => PLAN_MINUTES.find(n => PLAN_GOAL[n] === currentGoal) ?? 10);
    const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const plan = m.plans[minutes];
    const goal = PLAN_GOAL[minutes];
    const stepNames = useMemo(() => new Set(STEP_ORDER.map(k => text.path.steps[k].name)), [text]);

    const choose = (n: PlanMinutes) => { setMinutes(n); setState('idle'); };
    const adopt = async () => {
        setState('saving');
        setState(await saveGoal(goal) ? 'saved' : 'error');
    };

    return (
        <div className="app-sheet guide-plan">
            <div className="space-y-1">
                <h3 className="app-h3">{m.planTitle}</h3>
                <p className="text-[0.9375rem] text-[var(--color-on-surface-muted)]">{m.planLead}</p>
            </div>
            <PillTabs
                className="app-tabs self-start"
                label={m.planLabel}
                idBase="guide-plan"
                value={String(minutes) as `${PlanMinutes}`}
                onChange={v => choose(Number(v) as PlanMinutes)}
                tabs={PLAN_MINUTES.map(n => ({ value: String(n) as `${PlanMinutes}`, label: m.minutes(n) }))}
            />
            <div role="tabpanel" id={panelId('guide-plan', String(minutes))} aria-labelledby={tabId('guide-plan', String(minutes))} className="space-y-4">
                <p className="text-[var(--color-on-surface)]">{plan.summary}</p>
                <ol className="guide-week">
                    {plan.days.map(day => (
                        <li key={day.day}>
                            <span className="guide-week-day">{day.day}</span>
                            <ul className="guide-week-items">
                                {day.items.map((item, i) => (
                                    <li key={i} className={stepNames.has(item) ? 'is-step' : undefined}>{item}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ol>
                {user && (
                    <div className="space-y-2">
                        {goal === currentGoal ? (
                            <p className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary)]">
                                <Check className="w-5 h-5" aria-hidden="true" /> {m.isGoal(goal)}
                            </p>
                        ) : (
                            <button type="button" onClick={adopt} disabled={state === 'saving'} className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
                                <Droplet className="w-4 h-4" aria-hidden="true" /> {m.useGoal(goal)}
                            </button>
                        )}
                        <p role="status" className={`text-sm ${state === 'error' ? 'text-[var(--color-error)]' : 'text-[var(--color-on-surface-muted)]'}`}>
                            {state === 'saved' ? m.goalSaved : state === 'error' ? m.goalError : ''}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function NotebookChapter({ text }: { text: GuideText }) {
    const n = text.notebook;
    return (
        <Chapter id="notebook" title={text.chapters.notebook}>
            <p className="guide-prose">{n.body}</p>
            <h3 className="app-h3">{n.whatTitle}</h3>
            <ul className="guide-notes">
                {n.items.map(item => (
                    <li key={item.title}>
                        <div className="space-y-1">
                            <p className="font-semibold text-[var(--color-on-surface)]">{item.title}</p>
                            <p className="text-[0.9375rem] text-[var(--color-on-surface-muted)]">{item.body}</p>
                        </div>
                        <ExampleNoteCard note={item.example} label={n.exampleLabel} />
                    </li>
                ))}
            </ul>
            <div className="space-y-3">
                <h3 className="app-h3">{n.howTitle}</h3>
                <ul className="notebook-bullets text-[0.9375rem] text-[var(--color-on-surface)]">
                    {n.how.map(tip => <li key={tip}>{tip}</li>)}
                </ul>
            </div>
        </Chapter>
    );
}

/** A note drawn as the notebook draws it: its place, the quote on sun tape and the text. */
function ExampleNoteCard({ note, label }: { note: ExampleNote; label: string }) {
    return (
        <figure className="guide-note" aria-label={label}>
            <p className="notebook-place">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{note.place}</span>
            </p>
            {note.quote && <blockquote className="notebook-quote" lang="en">{note.quote}</blockquote>}
            <NoteBody body={note.lines.join('\n')} />
        </figure>
    );
}
