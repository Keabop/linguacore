// Types-only module — Dexie removed, data lives in Supabase + static files.
// Keep these types for backward compatibility with components/data files.

export type { CEFRLevel } from './database.types';

// FSRS Card States
export enum CardState {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

export interface Story {
  id: string;
  level: import('./database.types').CEFRLevel;
  title: string;
  content: string;
  wordCount: number;
  estimatedMinutes: number;
  unitId?: string;
}

export interface Vocabulary {
  id: string;
  translations: string[];
  cefrLevel: import('./database.types').CEFRLevel;
  examples: string[];
  phonetic?: string;
}

export interface Card {
  id: string;
  wordId: string;
  storyId: string;
  state: CardState;
  due: Date;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview: Date | undefined;
}

export interface SkillCard {
    id: string;
    skillId: string;
    unitId: string;
    state: CardState;
    due: Date;
    stability: number;
    difficulty: number;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    lastReview: Date | undefined;
}

export type ExerciseType = 'fill-blank' | 'multiple-choice' | 'word-order';

export interface Unit {
  id: string;
  level: import('./database.types').CEFRLevel;
  unitNumber: number;
  title: string;
  grammarTopic: string;
  theme: string;
  isAssessment: boolean;
}

export interface GrammarCard {
  id: string;
  unitId: string;
  title: string;
  explanation: string;
  examples: string[];
  rules: string[];
}

export interface GrammarExercise {
  id: string;
  unitId: string;
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  options?: string[];
  scrambledWords?: string[];
  explanation: string;
}

export interface UnitProgress {
  id?: number;
  unitId: string;
  grammarCardRead: boolean;
  storyCompleted: boolean;
  vocabReviewed: boolean;
  exercisesScore: number;
  outputCompleted: boolean;
  checkpointPassed: boolean;
  completedAt?: Date;
}

export type WritingType = 'sentence-construction' | 'paragraph-completion' | 'free-writing' | 'error-correction';
export type SpeakingType = 'read-aloud' | 'oral-response';

export interface WritingPrompt {
  id: string;
  unitId: string;
  type: WritingType;
  level: import('./database.types').CEFRLevel;
  instruction: string;
  sourceText?: string;
  errorText?: string;
  referenceAnswer?: string;
  targetGrammar: string[];
  wordLimit?: { min: number; max: number };
}

export interface SpeakingPrompt {
  id: string;
  unitId: string;
  type: SpeakingType;
  level: import('./database.types').CEFRLevel;
  instruction: string;
  targetText?: string;
  targetGrammar?: string[];
}
