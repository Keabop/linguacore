import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Trophy } from 'lucide-react';
import type { CEFRLevel, Unit } from '../../lib/db';
import type { UnitProgressRow } from '../../lib/database.types';
import type { GardenUnitState } from '../garden3d/states';
import type { SpeciesId } from '../garden/species';
import Plant from '../garden/Plant';
import Garden from '../garden/Garden';
import UnitDetails, { unitAction, unitSteps } from './UnitDetails';
import { unitTitle, unitTopic } from '../../data/curriculum/unitTitles';

interface Props {
    level: CEFRLevel;
    units: Unit[];
    states: GardenUnitState[];
    progress: UnitProgressRow[] | undefined;
    species: SpeciesId;
    /** The unit opened at first: the one in progress, or the one just completed. */
    openAt: number;
    /** After a unit was completed: the next one, opened once the finished one has grown and closed. */
    thenOpen?: number;
    onOpen: (index: number) => void;
}

// A plot unfolds like a page: the height opens at an even pace (an expo curve did it all in the
// first frames and read as a jump), then its steps slide in; closing folds them away first
const EASE_UNFOLD = [0.33, 1, 0.68, 1] as const;
const PLOT_DETAILS = {
    closed: { height: 0, transition: { duration: 0.3, ease: EASE_UNFOLD, when: 'afterChildren' as const } },
    open: { height: 'auto', transition: { duration: 0.45, ease: EASE_UNFOLD, delayChildren: 0.12 } },
};
const PLOT_CONTENT = {
    closed: { opacity: 0, y: -8, transition: { duration: 0.14 } },
    open: { opacity: 1, y: 0, transition: { duration: 0.26, ease: EASE_UNFOLD } },
};

/** The plant a plot shows, by its state: the same stages as the 3D garden. */
function plotPlant(state: GardenUnitState): { stage: 'seed' | 'sprout' | 'grown'; height: number } {
    if (state === 'done' || state === 'pending' || state === 'exam-done') return { stage: 'grown', height: 44 };
    if (state === 'current' || state === 'exam-open') return { stage: 'sprout', height: 30 };
    return { stage: 'seed', height: 12 };
}

/**
 * The level as a trail of plots, one per unit, read top to bottom. A plot opens in place to
 * show its steps and its one action; the unit in progress starts open.
 */
export default function PathList({ level, units, states, progress, species, openAt, thenOpen, onOpen }: Props) {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();
    const [open, setOpen] = useState<number | null>(openAt >= 0 ? openAt : null);
    const grewAt = thenOpen !== undefined ? openAt : -1;
    const plots = useRef<(HTMLLIElement | null)[]>([]);

    // The finished unit is seen open while its plant grows, then it closes and the next one opens
    useEffect(() => {
        if (thenOpen === undefined) return;
        const timer = setTimeout(() => {
            setOpen(thenOpen);
            setTimeout(() => plots.current[thenOpen]?.scrollIntoView?.({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }), 320);
        }, reduceMotion ? 600 : 1400);
        return () => clearTimeout(timer);
    }, [thenOpen]); // eslint-disable-line react-hooks/exhaustive-deps
    const byId = new Map((progress ?? []).map(p => [p.unit_id, p]));
    const lessons = units.filter(u => !u.isAssessment).length;
    const grown = states.filter(s => s === 'done' || s === 'pending').length;

    if (units.length === 0) return <p className="card p-8 text-center text-[var(--color-on-surface-muted)]">{t('pathView.empty')}</p>;

    return (
        <div className="path-list">
            <div className="path-list-garden" aria-hidden="true">
                <Garden total={lessons} completed={grown} species={species} label={t('pathView.grown', { grown, total: lessons })} />
            </div>

            <ol className="path-trail">
                {units.map((u, i) => {
                    const s = states[i];
                    const p = byId.get(u.id);
                    const plant = plotPlant(s);
                    const steps = unitSteps(p);
                    const isOpen = open === i;
                    const panelId = `plot-${u.id}`;
                    return (
                        <li key={u.id} ref={el => { plots.current[i] = el; }} className={`path-plot is-${s} ${isOpen ? 'is-open' : ''}`} style={{ ['--level' as string]: `var(--color-level-${level.toLowerCase()})` }}>
                            <div className="path-plot-bed" aria-hidden="true">
                                {u.isAssessment
                                    ? <Trophy className="w-6 h-6" />
                                    : <Plant species={species} stage={plant.stage} height={plant.height} noBloom={plant.stage !== 'grown'} grow={i === grewAt} delay={250} />}
                            </div>
                            <div className="path-plot-body">
                                <button type="button" className="path-plot-head" aria-expanded={isOpen} aria-controls={isOpen ? panelId : undefined} onClick={() => setOpen(isOpen ? null : i)}>
                                    <span className="min-w-0">
                                        <span className="block text-xs font-semibold text-[var(--color-on-surface-variant)]">
                                            {u.isAssessment ? t('garden3d.final') : t('garden3d.unit', { n: u.unitNumber })} · <span className="path-plot-status">{t(`pathView.status.${s}`)}</span>
                                        </span>
                                        <span className="block font-display text-lg font-extrabold leading-snug tracking-[-0.02em]">
                                            {u.isAssessment ? t('garden3d.examTitle') : unitTitle(u)}
                                        </span>
                                        {!u.isAssessment && <span className="block text-sm text-[var(--color-on-surface-muted)]">{unitTopic(u)}</span>}
                                    </span>
                                    {!u.isAssessment && (
                                        <span className="path-pips" role="img" aria-label={t('pathView.stepsDone', { done: steps.filter(x => x.done).length, total: steps.length })}>
                                            {steps.map(x => <i key={x.key} className={x.done ? 'is-done' : x.pending ? 'is-pending' : ''} />)}
                                        </span>
                                    )}
                                    <ChevronDown className="path-plot-chevron w-4 h-4 shrink-0" aria-hidden="true" />
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            id={panelId}
                                            key="details"
                                            variants={reduceMotion ? undefined : PLOT_DETAILS}
                                            initial="closed"
                                            animate="open"
                                            exit="closed"
                                            className="overflow-hidden"
                                        >
                                            <motion.div variants={reduceMotion ? undefined : PLOT_CONTENT} className="pt-4">
                                                <UnitDetails unit={u} state={s} progress={p} action={unitAction(i, units, states, p, t)} onAction={onOpen} />
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
