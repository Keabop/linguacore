import { useTranslation } from 'react-i18next';
import { Check, Lock, Mic } from 'lucide-react';
import type { Unit } from '../../lib/db';
import type { UnitProgressRow } from '../../lib/database.types';
import type { GardenUnitState } from '../garden3d/states';
import SkillBreakdown from '../SkillBreakdown';

/** The steps of a unit, in the order UnitFlow walks them. */
export function unitSteps(p: UnitProgressRow | undefined) {
    return [
        { key: 'grammar', done: !!p?.grammar_card_read },
        { key: 'story', done: !!p?.story_completed },
        { key: 'vocab', done: !!p?.vocab_reviewed },
        { key: 'exercises', done: (p?.exercises_score ?? 0) >= 70 },
        { key: 'output', done: !!p?.output_completed, pending: !!p?.speaking_pending },
        { key: 'checkpoint', done: !!p?.checkpoint_passed },
    ];
}

export interface UnitAction {
    label: string;
    /** Unit to open; null when the unit can't be opened yet. */
    target: number | null;
}

/** What the unit's button does, from its state. */
export function unitAction(index: number, units: Unit[], states: GardenUnitState[], progress: UnitProgressRow | undefined, t: (k: string, o?: Record<string, unknown>) => string): UnitAction {
    const s = states[index];
    const pendingUnit = states.indexOf('pending');
    switch (s) {
        case 'current': return { label: progress ? t('pathView.continue') : t('pathView.start'), target: index };
        case 'done': return { label: t('pathView.review'), target: index };
        case 'pending': return { label: t('pathView.finishSpeaking'), target: index };
        case 'exam-open': return { label: t('pathView.takeExam'), target: index };
        case 'exam-done': return { label: t('pathView.seeExam'), target: index };
        case 'exam-locked': return pendingUnit >= 0
            ? { label: t('pathView.goToUnit', { n: units[pendingUnit].unitNumber }), target: pendingUnit }
            : { label: t('pathView.lockedExam'), target: null };
        default: return { label: t('pathView.lockedUnit', { n: units[index - 1]?.unitNumber ?? 1 }), target: null };
    }
}

interface Props {
    unit: Unit;
    state: GardenUnitState;
    progress: UnitProgressRow | undefined;
    action: UnitAction;
    onAction: (target: number) => void;
}

/** A unit's steps, its skills once finished, and the one action it allows now. */
export default function UnitDetails({ unit, state, progress, action, onAction }: Props) {
    const { t } = useTranslation();
    const steps = unitSteps(progress);
    const finished = state === 'done' || state === 'pending';

    return (
        <div className="space-y-5">
            {!unit.isAssessment && (
                <ol className="unit-steps" aria-label={t('pathView.stepsDone', { done: steps.filter(s => s.done).length, total: steps.length })}>
                    {steps.map(step => (
                        <li key={step.key} className={step.done ? 'is-done' : step.pending ? 'is-pending' : ''}>
                            <span className="unit-step-mark" aria-hidden="true">
                                {step.done ? <Check className="w-3 h-3" /> : step.pending ? <Mic className="w-3 h-3" /> : null}
                            </span>
                            <span>{t(`pathView.steps.${step.key}`)}</span>
                            {step.pending && <span className="ml-auto text-xs font-semibold text-[var(--color-tertiary-ink)]">{t('pathView.status.pending')}</span>}
                        </li>
                    ))}
                </ol>
            )}

            {finished && !unit.isAssessment && <SkillBreakdown unitId={unit.id} />}

            {action.target === null ? (
                <p className="flex items-center gap-2 text-sm text-[var(--color-on-surface-muted)]">
                    <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />{action.label}
                </p>
            ) : (
                <button
                    type="button"
                    onClick={() => onAction(action.target!)}
                    className={`${state === 'current' || state === 'exam-open' || state === 'pending' ? 'btn-primary' : 'btn-secondary'} w-full py-3 text-sm`}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
