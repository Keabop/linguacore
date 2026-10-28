// Question model of the exam simulators (placement, Cambridge, IELTS, TOEFL).

export interface DialogueLine {
    speaker: 'A' | 'B';
    accent: 'US' | 'UK';
    gender: 'male' | 'female';
    text: string;
}

export type ExamSection = 'use-of-english' | 'reading' | 'listening';
export type ExamLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

/**
 * Two-stage adaptive exams (TOEFL 2026, placement): everyone answers the `router` items of a
 * section, then gets the `lower` or `upper` set depending on how the router went.
 */
export type ExamStage = 'router' | 'lower' | 'upper';

export type TfngAnswer = 'true' | 'false' | 'not-given';

interface QuestionBase {
    id: string;
    section: ExamSection;
    level: ExamLevel;
    /** Reading text the question is about (questions of one text repeat it). */
    passage?: string | null;
    /** Listening script; also played with the browser's voices when there is no audio file. */
    dialogue?: DialogueLine[];
    /** Pre-generated audio of the dialogue (public/audio/...). */
    audioSrc?: string;
    /**
     * Questions that share one text or recording (an IELTS Listening part). The audio's play
     * limit counts per group, as the exam plays each part for all its questions.
     */
    group?: string;
    stage?: ExamStage;
    /** Name of the exam task, shown above the question ("Read in Daily Life"). */
    task?: string;
    /** Fragment of the passage or script that answers the question (for review and tests). */
    evidence?: string;
}

/** One right option. `fixedOrder` keeps options as listed (headings i–x, A–F). */
export interface MultipleChoiceQuestion extends QuestionBase {
    kind?: 'mc';
    text: string;
    options: string[];
    correctIndex: number;
    fixedOrder?: boolean;
}

/** True / False / Not Given (or Yes / No / Not Given for opinions). */
export interface TfngQuestion extends QuestionBase {
    kind: 'tfng';
    /** The statement to judge. */
    text: string;
    answer: TfngAnswer;
    variant?: 'yes-no';
}

/** Gap to complete with words from the text: `text` holds one "___". */
export interface GapQuestion extends QuestionBase {
    kind: 'gap';
    text: string;
    /** Accepted answers (case, spacing and edge punctuation are ignored). */
    answers: string[];
    /** "NO MORE THAN TWO WORDS" → 2. */
    maxWords?: number;
    /** "… AND/OR A NUMBER": figures don't count towards `maxWords`. */
    allowNumber?: boolean;
}

/**
 * TOEFL "Complete the Words": a paragraph where some words lose their second half, written
 * as `stu[dent]`. Each missing part is one mark.
 */
export interface CompleteWordsQuestion extends QuestionBase {
    kind: 'complete-words';
    text: string;
}

/** TOEFL "Build a Sentence": put the pieces in order. */
export interface BuildSentenceQuestion extends QuestionBase {
    kind: 'build-sentence';
    /** What the sentence answers (e.g. the other speaker's line). */
    text: string;
    pieces: string[];
    answer: string;
}

export interface ChartData {
    kind: 'bar' | 'line';
    title: string;
    /** Unit of the values, shown on the axis ("%", "millions"). */
    unit: string;
    categories: string[];
    series: { name: string; values: number[] }[];
}

/** A post of an online class discussion (TOEFL Academic Discussion). */
export interface DiscussionPost {
    author: string;
    role: 'professor' | 'student';
    text: string;
}

/**
 * A writing task. IELTS Task 1 carries the chart to describe; the TOEFL email lists the
 * points it must cover, and the academic discussion the posts it answers.
 */
export interface ExamWritingTask {
    id: string;
    title: string;
    prompt: string;
    targetWords: string;
    instructions: string;
    chart?: ChartData;
    points?: string[];
    discussion?: DiscussionPost[];
}

export interface ExamSpeakingTask {
    id: string;
    title: string;
    prompt: string;
    instructions: string;
    timeSeconds: number;
    /** IELTS Part 2 cue card points. */
    cueCard?: string[];
    /** TOEFL Listen and Repeat: the prompt is heard once and never shown. */
    listenOnly?: boolean;
}

export type AssessmentQuestion =
    | MultipleChoiceQuestion
    | TfngQuestion
    | GapQuestion
    | CompleteWordsQuestion
    | BuildSentenceQuestion;

/**
 * What the learner answered: option index (mc), TFNG value or gap text (strings), the missing
 * parts of each word (complete-words) or the piece order (build-sentence).
 */
export type ExamResponse = number | string | string[] | number[];

export const isMultipleChoice = (q: AssessmentQuestion): q is MultipleChoiceQuestion =>
    q.kind === undefined || q.kind === 'mc';
