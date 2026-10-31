// Everything a lesson of A1 needs, loaded on its own (see ./index.ts)
import { a1GrammarCards, a1Exercises } from '../curriculum/a1';
import { a1Skills } from '../curriculum/skills/a1';
import { a1WritingPrompts, a1SpeakingPrompts } from '../output/a1-output';
import { a1Stories } from '../stories-a1';
import { withReadingStats } from '../storyStats';
import type { LevelContent } from './index';

const content: LevelContent = {
    grammarCards: a1GrammarCards,
    exercises: a1Exercises,
    skills: a1Skills,
    writingPrompts: a1WritingPrompts,
    speakingPrompts: a1SpeakingPrompts,
    stories: a1Stories.map(withReadingStats),
};

export default content;
