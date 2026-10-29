import type { Story } from '../lib/db';
import { a1Stories } from './stories-a1';
import { a2Stories } from './stories-a2';
import { b1Stories } from './stories-b1';
import { b2Stories } from './stories-b2';

/** Words in the story's text, without the markup. */
function countWords(content: string): number {
    return content.replace(/<[^>]+>/g, ' ').match(/[A-Za-z']+/g)?.length ?? 0;
}

// About 100 words a minute: a learner reading carefully, tapping unknown words
const withReadingStats = (s: Omit<Story, 'wordCount' | 'estimatedMinutes'>): Story => {
    const wordCount = countWords(s.content);
    return { ...s, wordCount, estimatedMinutes: Math.max(1, Math.round(wordCount / 100)) };
};

export const storiesData: Story[] = [...a1Stories, ...a2Stories, ...b1Stories, ...b2Stories].map(withReadingStats);
