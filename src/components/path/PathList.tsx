import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Trophy } from 'lucide-react';
import type { CEFRLevel, Unit } from '../../lib/db';
import type { UnitProgressRow } from '../../lib/database.types';
import type { GardenUnitState } from '../garden3d/states';
import type { SpeciesId } from '../garden/species';
import Plant from '../garden/Plant';
import Garden from '../garden/Garden';
import UnitDetails, { unitAction, unitSteps } from './UnitDetails';

interface Props {
    level: CEFRLevel;
    units: Unit[];
    states: GardenUnitState[];
    progress: UnitProgressRow[] | undefined;
    species: SpeciesId;
    /** The unit opened at first: the one in progress. */
    openAt: number;
    onOpen: (index: number) => void;
}

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
export default function PathList({ level, units, states, progress, species, openAt, onOpen }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState<number | null>(openAt >= 0 ? openAt : null);
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
                        <li key={u.id} className={`path-plot is-${s} ${isOpen ? 'is-open' : ''}`} style={{ ['--level' as string]: `var(--color-level-${level.toLowerCase()})` }}>
                            <div className="path-plot-bed" aria-hidden="true">
                                {u.isAssessment
                                    ? <Trophy className="w-6 h-6" />
                                    : <Plant species={species} stage={plant.stage} height={plant.height} noBloom={plant.stage !== 'grown'} />}
                            </div>
                            <div className="path-plot-body">
                                <button type="button" className="path-plot-head" aria-expanded={isOpen} aria-controls={isOpen ? panelId : undefined} onClick={() => setOpen(isOpen ? null : i)}>
                                    <span className="min-w-0">
                                        <span className="block text-xs font-semibold text-[var(--color-on-surface-variant)]">
                                            {u.isAssessment ? t('garden3d.final') : t('garden3d.unit', { n: u.unitNumber })} · <span className="path-plot-status">{t(`pathView.status.${s}`)}</span>
                                        </span>
                                        <span className="block font-display text-lg font-extrabold leading-snug tracking-[-0.02em]">
                                            {u.isAssessment ? t('garden3d.examTitle') : u.title}
                                        </span>
                                        {!u.isAssessment && <span className="block text-sm text-[var(--color-on-surface-muted)]">{u.grammarTopic}</span>}
                                    </span>
                                    {!u.isAssessment && (
                                        <span className="path-pips" role="img" aria-label={t('pathView.stepsDone', { done: steps.filter(x => x.done).length, total: steps.length })}>
                                            {steps.map(x => <i key={x.key} className={x.done ? 'is-done' : x.pending ? 'is-pending' : ''} />)}
                                        </span>
                                    )}
                                    <ChevronDown className="path-plot-chevron w-4 h-4 shrink-0" aria-hidden="true" />
                                </button>
                                {isOpen && (
                                    <div id={panelId} className="pt-4">
                                        <UnitDetails unit={u} state={s} progress={p} action={unitAction(i, units, states, p, t)} onAction={onOpen} />
                                    </div>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
