import type { Story } from '../lib/db';
import { withReadingStats } from './storyStats';
import { a1Stories } from './stories-a1';
import { a2Stories } from './stories-a2';
import { b1Stories } from './stories-b1';
import { b2Stories } from './stories-b2';

export const storiesData: Story[] = [...a1Stories, ...a2Stories, ...b1Stories, ...b2Stories].map(withReadingStats);
