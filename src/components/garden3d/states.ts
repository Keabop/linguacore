import type { Unit } from '../../lib/db';
import type { UnitProgressRow } from '../../lib/database.types';

/** What each plot of the garden shows; kept apart from the scene so pages can use it without three.js. */
export type GardenUnitState = 'done' | 'pending' | 'current' | 'locked' | 'exam-locked' | 'exam-open' | 'exam-done';

/**
 * One state per unit of the level, in order: finished units grow (with a sign when their
 * speaking was left for later), the first unfinished one is in progress and the rest are seeds.
 * The level's exam opens once every unit is finished and nothing is pending.
 */
export function gardenStates(units: Unit[], progress: UnitProgressRow[] | undefined): GardenUnitState[] {
    const byId = new Map((progress ?? []).map(p => [p.unit_id, p]));
    const lessons = units.filter(u => !u.isAssessment);
    const lessonsDone = lessons.every(u => byId.get(u.id)?.completed_at);
    const pending = lessons.some(u => byId.get(u.id)?.speaking_pending);
    let currentFound = false;
    return units.map(u => {
        const p = byId.get(u.id);
        if (u.isAssessment) return p?.completed_at ? 'exam-done' : lessonsDone && !pending ? 'exam-open' : 'exam-locked';
        if (p?.completed_at) return p.speaking_pending ? 'pending' : 'done';
        if (currentFound) return 'locked';
        currentFound = true;
        return 'current';
    });
}

/** The unit the "Continue" button opens: the one in progress, else the open exam. */
export function nextUnitIndex(states: GardenUnitState[]): number {
    const current = states.indexOf('current');
    return current >= 0 ? current : states.indexOf('exam-open');
}

/** Whether this browser can draw the 3D garden: three.js needs WebGL 2. */
export function canDrawGarden(): boolean {
    try {
        const gl = document.createElement('canvas').getContext('webgl2');
        // The probe's context is freed now: browsers cap how many can be alive
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        return !!gl;
    } catch {
        return false;
    }
}
