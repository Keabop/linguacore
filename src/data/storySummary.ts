import type { Story } from '../lib/db';

/** A story without its text: what lists show (src/data/storyIndex.ts). */
export type StorySummary = Omit<Story, 'content' | 'questions'>;

export const storySummary = ({ id, level, unitId, title, wordCount, estimatedMinutes }: Story): StorySummary =>
    ({ id, level, ...(unitId ? { unitId } : {}), title, wordCount, estimatedMinutes });
