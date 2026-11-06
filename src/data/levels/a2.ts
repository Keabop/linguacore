// Everything a lesson of A2 needs, loaded on its own (see ./index.ts)
import { a2GrammarCards, a2Exercises } from '../curriculum/a2';
import { a2Skills } from '../curriculum/skills/a2';
import { a2WritingPrompts, a2SpeakingPrompts } from '../output/a2-output';
import { a2Stories } from '../stories-a2';
import { a2StoryTranslations } from '../translations/stories-a2';
import { withReadingStats } from '../storyStats';
import type { LevelContent } from './index';

const content: LevelContent = {
    grammarCards: a2GrammarCards,
    exercises: a2Exercises,
    skills: a2Skills,
    writingPrompts: a2WritingPrompts,
    speakingPrompts: a2SpeakingPrompts,
    stories: a2Stories.map(story => ({ ...withReadingStats(story), translation: a2StoryTranslations[story.id] })),
};

export default content;
