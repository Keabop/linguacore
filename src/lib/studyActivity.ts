import type { Profile } from './database.types';

/**
 * The streak counts any study activity on the learner's own calendar day, and the daily goal
 * counts activities of today: a story or a unit step is one, and so are every 10 reviewed cards
 * and every 5 messages to the tutor. A freeze is earned every 7 days of streak (2 at most) and
 * covers one missed day. Supabase decides (`record_activity`); the browser mirrors the same rules
 * to show the result right away (hooks/useRecordActivity).
 */

export type ActivityKind = 'review' | 'story' | 'unit_step' | 'tutor';

export const MAX_FREEZES = 2;
const REVIEWS_PER_STEP = 10;
const MESSAGES_PER_STEP = 5;

/** The profile fields `record_activity` reads and writes. */
export type ActivityState = Pick<Profile,
    'streak' | 'last_study_date' | 'streak_freezes' | 'daily_goal' | 'goal_date' | 'goal_progress' | 'goal_reviews' | 'goal_messages'>;

export interface ActivityResult extends ActivityState {
    freezes_used: number;
}

/** YYYY-MM-DD of a moment in the browser's time zone (not UTC, as `toISOString` would give). */
export function localDate(at: Date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
}

/** Whole days from one YYYY-MM-DD date to another. */
export function daysBetween(from: string, to: string): number {
    const utc = (day: string) => {
        const [y, m, d] = day.split('-').map(Number);
        return Date.UTC(y, m - 1, d);
    };
    return Math.round((utc(to) - utc(from)) / 86_400_000);
}

/** The day before a YYYY-MM-DD date. */
export function previousDay(day: string): string {
    const [y, m, d] = day.split('-').map(Number);
    return localDate(new Date(y, m - 1, d - 1));
}

/** The streak still alive today: days missed since the last study must be covered by freezes. */
export function displayStreak(streak: number, lastStudyDate: string | null, freezes = 0, today: string = localDate()): number {
    if (!lastStudyDate || streak === 0) return 0;
    const missed = daysBetween(lastStudyDate, today) - 1;
    return missed <= freezes ? streak : 0;
}

/** Today's goal progress; a goal last counted on another day starts again at 0. */
export function goalProgressToday(state: Pick<ActivityState, 'goal_date' | 'goal_progress'>, today: string = localDate()): number {
    return state.goal_date === today ? state.goal_progress : 0;
}

/** The profile after an activity on `day`, the same rules as `record_activity`. */
export function applyActivity(state: ActivityState, kind: ActivityKind, day: string, today: string = day): ActivityResult {
    const last = state.last_study_date;
    let streak: number;
    let used = 0;
    if (last && last >= day) {
        streak = Math.max(state.streak, 1);
    } else if (last && daysBetween(last, day) === 1) {
        streak = state.streak + 1;
    } else if (last && state.streak > 0 && daysBetween(last, day) - 1 <= state.streak_freezes) {
        used = daysBetween(last, day) - 1;
        streak = state.streak + 1;
    } else {
        streak = 1;
    }
    let freezes = state.streak_freezes - used;
    if (streak > state.streak && streak % 7 === 0) freezes = Math.min(MAX_FREEZES, freezes + 1);

    const fresh = state.goal_date !== today;
    let progress = fresh ? 0 : state.goal_progress;
    let reviews = fresh ? 0 : state.goal_reviews;
    let messages = fresh ? 0 : state.goal_messages;
    if (day === today) {
        if (kind === 'story' || kind === 'unit_step') {
            progress++;
        } else if (kind === 'review') {
            if (++reviews % REVIEWS_PER_STEP === 0) progress++;
        } else if (++messages % MESSAGES_PER_STEP === 0) {
            progress++;
        }
    }

    return {
        streak,
        last_study_date: last && last > day ? last : day,
        streak_freezes: freezes,
        freezes_used: used,
        daily_goal: state.daily_goal,
        goal_date: today,
        goal_progress: progress,
        goal_reviews: reviews,
        goal_messages: messages,
    };
}
