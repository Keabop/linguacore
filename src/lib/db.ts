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
  outputCompleted: boolean;  // NEW
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

// ===== Output System Types =====

export type WritingType = 'sentence-construction' | 'paragraph-completion' | 'free-writing' | 'error-correction';
export type SpeakingType = 'read-aloud' | 'oral-response';

export interface WritingPrompt {
  id: string;              // e.g., "wp-a1-u1-1"
  unitId: string;
  type: WritingType;
  level: CEFRLevel;
  instruction: string;     // Spanish instruction for the student
  sourceText?: string;     // For sentence-construction: Spanish sentence to translate
  errorText?: string;      // For error-correction: English text with deliberate errors
  referenceAnswer?: string;// Model answer for comparison
  targetGrammar: string[]; // Grammar patterns that should appear
  wordLimit?: { min: number; max: number };
}

export interface SpeakingPrompt {
  id: string;              // e.g., "sp-a1-u1-1"
  unitId: string;
  type: SpeakingType;
  level: CEFRLevel;
  instruction: string;     // Spanish instruction
  targetText?: string;     // For read-aloud: exact text to pronounce
  targetGrammar?: string[];// Expected grammar in oral response
}

export interface WritingSubmission {
  id?: number;
  promptId: string;
  unitId: string;
  userText: string;
  score: number;           // 0-100
  corrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
    type: 'grammar' | 'vocabulary' | 'spelling' | 'style';
  }>;
  feedbackSummary: {
    grammar: { score: number; note: string };
    vocabulary: { score: number; note: string };
    coherence: { score: number; note: string };
  };
  improvedVersion: string;
  submittedAt: Date;
}

export interface SpeakingSubmission {
  id?: number;
  promptId: string;
  unitId: string;
  transcript: string;      // What SpeechRecognition heard
  accuracyScore: number;   // 0-100
  aiFeedback?: string;     // AI feedback for oral-response
  submittedAt: Date;
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
  writingPrompts!: Table<WritingPrompt>;
  speakingPrompts!: Table<SpeakingPrompt>;
  writingSubmissions!: Table<WritingSubmission>;
  speakingSubmissions!: Table<SpeakingSubmission>;

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
    this.version(5).stores({
      writingPrompts: 'id, unitId, type, level',
      speakingPrompts: 'id, unitId, type, level',
      writingSubmissions: '++id, promptId, unitId, submittedAt',
      speakingSubmissions: '++id, promptId, unitId, submittedAt',
    });

  }
}

export const db = new LinguaCoreDB();
