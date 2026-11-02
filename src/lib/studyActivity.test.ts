import { describe, expect, it } from 'vitest';
import { applyActivity, daysBetween, displayStreak, goalProgressToday, localDate, previousDay, type ActivityState } from './studyActivity';

const TODAY = '2026-11-02';

const state = (over: Partial<ActivityState> = {}): ActivityState => ({
    streak: 4,
    last_study_date: '2026-11-01',
    streak_freezes: 0,
    daily_goal: 1,
    goal_date: null,
    goal_progress: 0,
    goal_reviews: 0,
    goal_messages: 0,
    ...over,
});

describe('dates', () => {
    it('gives the calendar day in the browser zone, late at night too', () => {
        // In Mexico City 23:30 is already the next day in UTC; the local day must win
        expect(localDate(new Date(2026, 10, 2, 23, 30))).toBe('2026-11-02');
        expect(localDate(new Date(2026, 10, 3, 0, 15))).toBe('2026-11-03');
        expect(localDate(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
    });

    it('steps back across months and years', () => {
        expect(previousDay('2026-03-01')).toBe('2026-02-28');
        expect(previousDay('2026-01-01')).toBe('2025-12-31');
    });

    it('counts whole days, across a daylight saving change too', () => {
        expect(daysBetween('2026-11-01', '2026-11-02')).toBe(1);
        expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2);
        expect(daysBetween('2026-11-02', '2026-11-01')).toBe(-1);
    });
});

describe('applyActivity: streak', () => {
    it('starts at 1 on the first study day', () => {
        expect(applyActivity(state({ streak: 0, last_study_date: null }), 'story', TODAY).streak).toBe(1);
    });

    it('does not count the same day twice', () => {
        expect(applyActivity(state({ last_study_date: TODAY }), 'story', TODAY).streak).toBe(4);
    });

    it('adds a day after studying yesterday', () => {
        expect(applyActivity(state(), 'story', TODAY)).toMatchObject({ streak: 5, last_study_date: TODAY, freezes_used: 0 });
    });

    it('starts over after a missed day without freezes', () => {
        expect(applyActivity(state({ last_study_date: '2026-10-31' }), 'story', TODAY).streak).toBe(1);
    });

    it('keeps a later day already counted (a zone behind after travelling)', () => {
        expect(applyActivity(state({ last_study_date: '2026-11-03' }), 'story', TODAY)).toMatchObject({ streak: 4, last_study_date: '2026-11-03' });
    });
});

describe('applyActivity: freezes', () => {
    it('spends one freeze per missed day and keeps the streak', () => {
        const r = applyActivity(state({ last_study_date: '2026-10-31', streak_freezes: 1 }), 'story', TODAY);
        expect(r).toMatchObject({ streak: 5, streak_freezes: 0, freezes_used: 1 });
    });

    it('covers two missed days with two freezes', () => {
        const r = applyActivity(state({ last_study_date: '2026-10-30', streak_freezes: 2 }), 'story', TODAY);
        expect(r).toMatchObject({ streak: 5, streak_freezes: 0, freezes_used: 2 });
    });

    it('starts over when the freezes do not cover every missed day', () => {
        const r = applyActivity(state({ last_study_date: '2026-10-29', streak_freezes: 2 }), 'story', TODAY);
        expect(r).toMatchObject({ streak: 1, streak_freezes: 2, freezes_used: 0 });
    });

    it('earns a freeze at every 7 days of streak, 2 at most', () => {
        expect(applyActivity(state({ streak: 6 }), 'story', TODAY).streak_freezes).toBe(1);
        expect(applyActivity(state({ streak: 13, streak_freezes: 2 }), 'story', TODAY).streak_freezes).toBe(2);
        expect(applyActivity(state({ streak: 7, last_study_date: TODAY }), 'story', TODAY).streak_freezes).toBe(0);
    });
});

describe('applyActivity: daily goal', () => {
    it('counts a story and a unit step as one activity each', () => {
        const first = applyActivity(state({ daily_goal: 2 }), 'story', TODAY);
        expect(first).toMatchObject({ goal_progress: 1 });
        const second = applyActivity({ ...state({ daily_goal: 2 }), ...first }, 'unit_step', TODAY);
        expect(second).toMatchObject({ goal_progress: 2 });
    });

    it('counts every 10 reviews and every 5 tutor messages as one activity', () => {
        expect(applyActivity(state({ goal_date: TODAY, goal_reviews: 9 }), 'review', TODAY)).toMatchObject({ goal_reviews: 10, goal_progress: 1 });
        expect(applyActivity(state({ goal_date: TODAY, goal_reviews: 3 }), 'review', TODAY)).toMatchObject({ goal_reviews: 4, goal_progress: 0 });
        expect(applyActivity(state({ goal_date: TODAY, goal_messages: 4 }), 'tutor', TODAY)).toMatchObject({ goal_messages: 5, goal_progress: 1 });
    });

    it('starts the goal again on a new day', () => {
        const r = applyActivity(state({ goal_date: '2026-11-01', goal_progress: 3, goal_reviews: 7 }), 'review', TODAY);
        expect(r).toMatchObject({ goal_date: TODAY, goal_progress: 0, goal_reviews: 1 });
    });

    it('does not count an activity of yesterday for today\'s goal', () => {
        const r = applyActivity(state({ last_study_date: '2026-10-31' }), 'story', '2026-11-01', TODAY);
        expect(r).toMatchObject({ streak: 5, last_study_date: '2026-11-01', goal_progress: 0 });
    });
});

describe('displayStreak and goalProgressToday', () => {
    it('shows a streak studied today or yesterday', () => {
        expect(displayStreak(5, TODAY, 0, TODAY)).toBe(5);
        expect(displayStreak(5, '2026-11-01', 0, TODAY)).toBe(5);
    });

    it('keeps a streak whose missed days the freezes cover', () => {
        expect(displayStreak(5, '2026-10-31', 1, TODAY)).toBe(5);
        expect(displayStreak(5, '2026-10-31', 0, TODAY)).toBe(0);
        expect(displayStreak(5, null, 2, TODAY)).toBe(0);
    });

    it('reads the goal of another day as 0', () => {
        expect(goalProgressToday({ goal_date: TODAY, goal_progress: 2 }, TODAY)).toBe(2);
        expect(goalProgressToday({ goal_date: '2026-11-01', goal_progress: 2 }, TODAY)).toBe(0);
    });
});
