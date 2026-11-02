import type { Story } from '../lib/db';

/** Words in the story's text, without the markup. */
export function countWords(content: string): number {
    return content.replace(/<[^>]+>/g, ' ').match(/[A-Za-z']+/g)?.length ?? 0;
}

// About 100 words a minute: a learner reading carefully, tapping unknown words
export const withReadingStats = (s: Omit<Story, 'wordCount' | 'estimatedMinutes'>): Story => {
    const wordCount = countWords(s.content);
    return { ...s, wordCount, estimatedMinutes: Math.max(1, Math.round(wordCount / 100)) };
};
