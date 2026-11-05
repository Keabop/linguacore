import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import type { CEFRLevel } from '../../lib/db';
import StemProgress from '../ui/StemProgress';
import StreakChip from '../ui/StreakChip';
import GoalDrops from '../ui/GoalDrops';

export const PATH_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

interface Props {
    level: CEFRLevel;
    unlocked: CEFRLevel[];
    onLevel: (level: CEFRLevel) => void;
    grown: number;
    total: number;
    streak: number;
    goal: { done: number; goal: number; freezes: number };
    /** The 3D/list switch, only where the garden can be drawn. */
    view?: { value: '3d' | 'list'; onChange: (view: '3d' | 'list') => void };
    /** The next step of the level in view, when there is one. */
    next?: { label: string; onClick: () => void };
    floating?: boolean;
}

/**
 * The path's one bar: which level is in view, how much of it grew, today's watering and the next
 * step. Slim on purpose, so the garden behind it stays the page.
 */
export default function PathBar({ level, unlocked, onLevel, grown, total, streak, goal, view, next, floating }: Props) {
    const { t } = useTranslation();
    return (
        <section className={`path-bar ${floating ? 'is-floating' : ''}`} aria-label={t('nav.path')}>
            <div className="path-bar-levels" role="group" aria-label={t('pathView.levels')}>
                {PATH_LEVELS.map((l, i) => {
                    const open = unlocked.includes(l);
                    return (
                        <button
                            key={l}
                            type="button"
                            aria-pressed={l === level}
                            data-level={l}
                            disabled={!open}
                            title={open ? t(`garden.stage.${l}`) : t('pathView.levelLocked', { prev: PATH_LEVELS[i - 1] ?? 'A1' })}
                            onClick={() => onLevel(l)}
                            className="path-level"
                            style={{ ['--level' as string]: `var(--color-level-${l.toLowerCase()})` }}
                        >
                            {open ? l : <><Lock className="w-3 h-3" aria-hidden="true" />{l}</>}
                        </button>
                    );
                })}
            </div>

            <div className="path-bar-progress">
                <span className="font-display font-extrabold text-[15px] leading-tight">{t(`garden3d.title.${level}`)}</span>
                <div className="flex items-center gap-2">
                    <StemProgress className="flex-1" value={total ? (grown / total) * 100 : 0} label={t('pathView.grown', { grown, total })} />
                    <span className="font-mono text-xs text-[var(--color-on-surface-variant)] whitespace-nowrap">{grown}/{total}</span>
                </div>
            </div>

            <div className="path-bar-today">
                <StreakChip count={streak} />
                <GoalDrops done={goal.done} goal={goal.goal} freezes={goal.freezes} />
            </div>

            <div className="path-bar-actions">
                {view && (
                    <div className="path-view-switch" role="group" aria-label={t('pathView.view')}>
                        {(['3d', 'list'] as const).map(v => (
                            <button key={v} type="button" aria-pressed={view.value === v} onClick={() => view.onChange(v)}>
                                {v === '3d' ? t('pathView.view3d') : t('pathView.viewList')}
                            </button>
                        ))}
                    </div>
                )}
                {next && (
                    <button type="button" className="btn-primary path-bar-next px-5 py-2.5 text-sm" onClick={next.onClick}>
                        {next.label}
                    </button>
                )}
            </div>
        </section>
    );
}
