// Centralized static data lookups — replaces all Dexie queries for static content
import { storiesData } from './stories';
import { vocabularyData } from './vocabulary';
import {
    a1Units, a1GrammarCards, a1Exercises,
    a2Units, a2GrammarCards, a2Exercises,
    b1Units, b1GrammarCards, b1Exercises,
    b2Units, b2GrammarCards, b2Exercises,
    a1Skills, a2Skills, b1Skills, b2Skills,
} from './curriculum';
import {
    a1WritingPrompts, a1SpeakingPrompts,
    a2WritingPrompts, a2SpeakingPrompts,
    b1WritingPrompts, b1SpeakingPrompts,
    b2WritingPrompts, b2SpeakingPrompts,
} from './output';

export const allStories = storiesData;
export const allVocabulary = vocabularyData;
export const allUnits = [...a1Units, ...a2Units, ...b1Units, ...b2Units];
export const allGrammarCards = [...a1GrammarCards, ...a2GrammarCards, ...b1GrammarCards, ...b2GrammarCards];
export const allExercises = [...a1Exercises, ...a2Exercises, ...b1Exercises, ...b2Exercises];
export const allWritingPrompts = [...a1WritingPrompts, ...a2WritingPrompts, ...b1WritingPrompts, ...b2WritingPrompts];
export const allSpeakingPrompts = [...a1SpeakingPrompts, ...a2SpeakingPrompts, ...b1SpeakingPrompts, ...b2SpeakingPrompts];

// Lookup helpers
export const getStory = (id: string) => allStories.find(s => s.id === id);
export const getVocab = (id: string) => allVocabulary.find(v => v.id === id);
export const getUnit = (id: string) => allUnits.find(u => u.id === id);
export const getUnitsByLevel = (level: string) =>
    allUnits.filter(u => u.level === level).sort((a, b) => a.unitNumber - b.unitNumber);
export const getGrammarCardByUnit = (unitId: string) =>
    allGrammarCards.find(gc => gc.unitId === unitId);
export const getExercisesByUnit = (unitId: string) =>
    allExercises.filter(e => e.unitId === unitId);
export const getExercisesByLevel = (level: string) => {
    const unitIds = new Set(getUnitsByLevel(level).map(u => u.id));
    return allExercises.filter(e => unitIds.has(e.unitId));
};
export const getStoryByUnit = (unitId: string) =>
    allStories.find(s => s.unitId === unitId);
export const getStoriesByLevel = (level: string) =>
    allStories.filter(s => s.level === level);
export const getWritingPromptsByUnit = (unitId: string) =>
    allWritingPrompts.filter(p => p.unitId === unitId);
export const getSpeakingPromptsByUnit = (unitId: string) =>
    allSpeakingPrompts.filter(p => p.unitId === unitId);
export const getVocabByIds = (ids: string[]) => {
    const set = new Set(ids);
    return allVocabulary.filter(v => set.has(v.id));
};
export const allGrammarSkills = [...a1Skills, ...a2Skills, ...b1Skills, ...b2Skills];
export const getSkillsByUnit = (unitId: string) =>
    allGrammarSkills.filter(s => s.unitId === unitId);
export const getSkill = (skillId: string) =>
    allGrammarSkills.find(s => s.id === skillId);

export const getVocabMap = (ids: string[]) => {
    const map = new Map<string, typeof allVocabulary[0]>();
    for (const v of allVocabulary) {
        if (ids.includes(v.id)) map.set(v.id, v);
    }
    return map;
};
