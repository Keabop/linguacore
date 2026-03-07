import Dexie, { type Table } from 'dexie';

// CEFR Level type
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

// FSRS Card States
export enum CardState {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

export interface User {
  id?: number;
  currentLevel: CEFRLevel;
  unlockedLevels: CEFRLevel[];
  createdAt: Date;
  totalWordsLearned: number;
  streak: number;
  lastStudyDate: string | null; // ISO date string (YYYY-MM-DD)
  levelProgress: Record<CEFRLevel, {
    words: number;
    stories: number;
    retention: number;
  }>;
}

export interface Story {
  id: string;
  level: CEFRLevel;
  title: string;
  content: string; // HTML with <span data-word="..."> for clickable words
  wordCount: number;
  estimatedMinutes: number;
  unitId?: string;  // Links story to a learning path unit
}

export interface Vocabulary {
  id: string; // the word itself, e.g., "apple"
  translations: string[];
  cefrLevel: CEFRLevel;
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
  lastReview?: Date;
}

export interface StudySession {
  id?: number;
  date: string; // ISO date YYYY-MM-DD
  cardsReviewed: number;
  newWordsLearned: number;
  duration: number; // minutes
}

export interface ReadStory {
  id?: number;
  storyId: string;
  completedAt: Date;
  wordsAdded: number;
}

export interface KnownWord {
  wordId: string; // PK — the word itself
  knownAt: Date;
}

// ===== Learning Path Types =====

export type ExerciseType = 'fill-blank' | 'multiple-choice' | 'word-order';

export interface Unit {
  id: string;           // e.g., "a1-u1", "b2-u14"
  level: CEFRLevel;
  unitNumber: number;
  title: string;        // e.g., "Introducing Yourself"
  grammarTopic: string; // e.g., "Verb 'to be' + pronouns"
  theme: string;        // e.g., "Greetings, introductions"
  isAssessment: boolean;
}

export interface GrammarCard {
  id: string;           // e.g., "gc-a1-u1"
  unitId: string;
  title: string;
  explanation: string;  // In Spanish, HTML allowed
  examples: string[];   // English examples with translations
  rules: string[];      // Key grammar rules
}

export interface GrammarExercise {
  id: string;
  unitId: string;
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  options?: string[];       // For multiple-choice
  scrambledWords?: string[];// For word-order
  explanation: string;      // In Spanish
}

export interface UnitProgress {
  id?: number;
  unitId: string;
  grammarCardRead: boolean;
  storyCompleted: boolean;
  vocabReviewed: boolean;
  exercisesScore: number;   // 0-100
  checkpointPassed: boolean;
  completedAt?: Date;
}

export interface LevelAssessment {
  id?: number;
  level: CEFRLevel;
  score: number;        // 0-100
  passed: boolean;      // score >= 80
  attemptedAt: Date;
}

class LinguaCoreDB extends Dexie {
  users!: Table<User>;
  stories!: Table<Story>;
  vocabulary!: Table<Vocabulary>;
  cards!: Table<Card>;
  studySessions!: Table<StudySession>;
  readStories!: Table<ReadStory>;
  knownWords!: Table<KnownWord>;
  units!: Table<Unit>;
  grammarCards!: Table<GrammarCard>;
  grammarExercises!: Table<GrammarExercise>;
  unitProgress!: Table<UnitProgress>;
  levelAssessments!: Table<LevelAssessment>;

  constructor() {
    super('LinguaCoreDB');
    this.version(2).stores({
      users: '++id',
      stories: 'id, level',
      vocabulary: 'id, cefrLevel',
      cards: 'id, wordId, due, state',
      studySessions: '++id, date',
      readStories: '++id, storyId, completedAt',
      knownWords: 'wordId',
    });
    this.version(3).stores({
      users: '++id',
      stories: 'id, level',
      vocabulary: 'id, cefrLevel',
      cards: 'id, wordId, due, state',
      studySessions: '++id, date',
      readStories: '++id, storyId, completedAt',
      knownWords: 'wordId',
      units: 'id, level, unitNumber',
      grammarCards: 'id, unitId',
      grammarExercises: 'id, unitId',
      unitProgress: '++id, unitId',
      levelAssessments: '++id, level, attemptedAt',
    });
    this.version(4).stores({
      stories: 'id, level, unitId',
    });

  }
}

export const db = new LinguaCoreDB();
