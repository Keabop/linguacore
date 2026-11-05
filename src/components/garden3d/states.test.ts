import { describe, expect, it } from 'vitest';
import type { Unit } from '../../lib/db';
import type { UnitProgressRow } from '../../lib/database.types';
import { gardenStates, nextUnitIndex } from './states';

const units = [1, 2, 3, 4].map(n => ({ id: `a1-u${n}`, unitNumber: n, isAssessment: n === 4 })) as Unit[];
const done = (id: string, extra: Partial<UnitProgressRow> = {}) => ({ unit_id: id, completed_at: '2026-11-03T00:00:00Z', ...extra }) as UnitProgressRow;

describe('gardenStates', () => {
    it('grows finished units, opens the first unfinished one and keeps the rest as seeds', () => {
        expect(gardenStates(units, [done('a1-u1')])).toEqual(['done', 'current', 'locked', 'exam-locked']);
        expect(gardenStates(units, undefined)).toEqual(['current', 'locked', 'locked', 'exam-locked']);
    });

    it('marks a unit finished with its speaking left for later, and keeps the exam closed for it', () => {
        const states = gardenStates(units, [done('a1-u1'), done('a1-u2', { speaking_pending: true }), done('a1-u3')]);
        expect(states).toEqual(['done', 'pending', 'done', 'exam-locked']);
        expect(nextUnitIndex(states)).toBe(-1);
    });

    it('opens the exam once every unit is finished, and blooms when it is passed', () => {
        const all = [done('a1-u1'), done('a1-u2'), done('a1-u3')];
        expect(gardenStates(units, all)[3]).toBe('exam-open');
        expect(nextUnitIndex(gardenStates(units, all))).toBe(3);
        expect(gardenStates(units, [...all, done('a1-u4')])[3]).toBe('exam-done');
    });
});
