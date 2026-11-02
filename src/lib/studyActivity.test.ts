import { describe, expect, it } from 'vitest';
import { displayStreak, localDate, nextStreak, previousDay } from './studyActivity';

describe('localDate', () => {
    it('gives the calendar day in the browser zone, late at night too', () => {
        // In Mexico City 23:30 is already the next day in UTC; the local day must win
        expect(localDate(new Date(2026, 10, 2, 23, 30))).toBe('2026-11-02');
        expect(localDate(new Date(2026, 10, 3, 0, 15))).toBe('2026-11-03');
    });

    it('pads month and day', () => {
        expect(localDate(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
    });
});

describe('previousDay', () => {
    it('crosses months and years', () => {
        expect(previousDay('2026-11-02')).toBe('2026-11-01');
        expect(previousDay('2026-03-01')).toBe('2026-02-28');
        expect(previousDay('2026-01-01')).toBe('2025-12-31');
    });
});

describe('nextStreak', () => {
    it('starts at 1 on the first study day', () => {
        expect(nextStreak(0, null, '2026-11-02')).toEqual({ streak: 1, lastStudyDate: '2026-11-02' });
    });

    it('does not count the same day twice', () => {
        expect(nextStreak(4, '2026-11-02', '2026-11-02')).toEqual({ streak: 4, lastStudyDate: '2026-11-02' });
    });

    it('adds a day after studying yesterday', () => {
        expect(nextStreak(4, '2026-11-01', '2026-11-02')).toEqual({ streak: 5, lastStudyDate: '2026-11-02' });
    });

    it('starts over after a missed day', () => {
        expect(nextStreak(4, '2026-10-31', '2026-11-02')).toEqual({ streak: 1, lastStudyDate: '2026-11-02' });
    });

    it('keeps a later day already counted (a zone behind after travelling)', () => {
        expect(nextStreak(4, '2026-11-03', '2026-11-02')).toEqual({ streak: 4, lastStudyDate: '2026-11-03' });
    });
});

describe('displayStreak', () => {
    it('shows a streak studied today or yesterday', () => {
        expect(displayStreak(5, '2026-11-02', '2026-11-02')).toBe(5);
        expect(displayStreak(5, '2026-11-01', '2026-11-02')).toBe(5);
    });

    it('shows 0 for a streak broken before yesterday', () => {
        expect(displayStreak(5, '2026-10-31', '2026-11-02')).toBe(0);
        expect(displayStreak(5, null, '2026-11-02')).toBe(0);
    });
});
