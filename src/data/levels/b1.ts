// Everything a lesson of B1 needs, loaded on its own (see ./index.ts)
import { b1GrammarCards, b1Exercises } from '../curriculum/b1';
import { b1Skills } from '../curriculum/skills/b1';
import { b1WritingPrompts, b1SpeakingPrompts } from '../output/b1-output';
import { b1Stories } from '../stories-b1';
import { withReadingStats } from '../storyStats';
import type { LevelContent } from './index';

const content: LevelContent = {
    grammarCards: b1GrammarCards,
    exercises: b1Exercises,
    skills: b1Skills,
    writingPrompts: b1WritingPrompts,
    speakingPrompts: b1SpeakingPrompts,
    stories: b1Stories.map(withReadingStats),
};

export default content;
