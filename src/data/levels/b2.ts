// Everything a lesson of B2 needs, loaded on its own (see ./index.ts)
import { b2GrammarCards, b2Exercises } from '../curriculum/b2';
import { b2Skills } from '../curriculum/skills/b2';
import { b2WritingPrompts, b2SpeakingPrompts } from '../output/b2-output';
import { b2Stories } from '../stories-b2';
import { withReadingStats } from '../storyStats';
import type { LevelContent } from './index';

const content: LevelContent = {
    grammarCards: b2GrammarCards,
    exercises: b2Exercises,
    skills: b2Skills,
    writingPrompts: b2WritingPrompts,
    speakingPrompts: b2SpeakingPrompts,
    stories: b2Stories.map(withReadingStats),
};

export default content;
