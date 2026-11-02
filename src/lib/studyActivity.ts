/**
 * The streak counts any study activity on the learner's own calendar day. Supabase decides
 * (`record_activity`); the browser mirrors the same rule to show the new streak right away
 * (hooks/useRecordActivity).
 */

export type ActivityKind = 'review' | 'story' | 'unit_step' | 'tutor';

/** YYYY-MM-DD of a moment in the browser's time zone (not UTC, as `toISOString` would give). */
export function localDate(at: Date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
}

/** The day before a YYYY-MM-DD date. */
export function previousDay(day: string): string {
    const [y, m, d] = day.split('-').map(Number);
    return localDate(new Date(y, m - 1, d - 1));
}

/** The streak still alive today: one last studied before yesterday is broken. */
export function displayStreak(streak: number, lastStudyDate: string | null, today: string = localDate()): number {
    if (!lastStudyDate || streak === 0) return 0;
    return lastStudyDate >= previousDay(today) ? streak : 0;
}

/** The streak after studying on `day`, the same rule as `record_activity`. */
export function nextStreak(streak: number, lastStudyDate: string | null, day: string): { streak: number; lastStudyDate: string } {
    if (lastStudyDate && lastStudyDate >= day) return { streak: Math.max(streak, 1), lastStudyDate };
    if (lastStudyDate === previousDay(day)) return { streak: streak + 1, lastStudyDate: day };
    return { streak: 1, lastStudyDate: day };
}
