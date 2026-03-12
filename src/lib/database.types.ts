export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type LevelProgress = Record<CEFRLevel, {
    words: number;
    stories: number;
    retention: number;
}>;

export type Profile = {
    id: string;
    current_level: CEFRLevel;
    unlocked_levels: CEFRLevel[];
    total_words_learned: number;
    streak: number;
    last_study_date: string | null;
    level_progress: LevelProgress;
    created_at: string;
};

export type CardRow = {
    id: number;
    user_id: string;
    word_id: string;
    story_id: string;
    state: number;
    due: string;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    scheduled_days: number;
    reps: number;
    lapses: number;
    last_review: string | null;
};

export type StudySessionRow = {
    id: number;
    user_id: string;
    date: string;
    cards_reviewed: number;
    new_words_learned: number;
    duration: number;
};

export type ReadStoryRow = {
    id: number;
    user_id: string;
    story_id: string;
    completed_at: string;
    words_added: number;
};

export type KnownWordRow = {
    user_id: string;
    word_id: string;
    known_at: string;
};

export type UnitProgressRow = {
    id: number;
    user_id: string;
    unit_id: string;
    grammar_card_read: boolean;
    story_completed: boolean;
    vocab_reviewed: boolean;
    exercises_score: number;
    output_completed: boolean;
    checkpoint_passed: boolean;
    completed_at: string | null;
};

export type SkillCardRow = {
    id: number;
    user_id: string;
    skill_id: string;
    unit_id: string;
    state: number;
    due: string;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    scheduled_days: number;
    reps: number;
    lapses: number;
    last_review: string | null;
    created_at: string;
};

export type LevelAssessmentRow = {
    id: number;
    user_id: string;
    level: CEFRLevel;
    score: number;
    passed: boolean;
    attempted_at: string;
};

export type WritingSubmissionRow = {
    id: number;
    user_id: string;
    prompt_id: string;
    unit_id: string;
    user_text: string;
    score: number;
    corrections: any[];
    feedback_summary: Record<string, any>;
    improved_version: string;
    submitted_at: string;
};

export type SpeakingSubmissionRow = {
    id: number;
    user_id: string;
    prompt_id: string;
    unit_id: string;
    transcript: string;
    accuracy_score: number;
    ai_feedback: string | null;
    submitted_at: string;
};

// Supabase Database type for createClient<Database>
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Partial<Profile> & { id: string };
                Update: Partial<Omit<Profile, 'id'>>;
                Relationships: [];
            };
            cards: {
                Row: CardRow;
                Insert: Omit<CardRow, 'id'>;
                Update: Partial<Omit<CardRow, 'id'>>;
                Relationships: [];
            };
            study_sessions: {
                Row: StudySessionRow;
                Insert: Omit<StudySessionRow, 'id'>;
                Update: Partial<Omit<StudySessionRow, 'id'>>;
                Relationships: [];
            };
            read_stories: {
                Row: ReadStoryRow;
                Insert: Omit<ReadStoryRow, 'id'>;
                Update: Partial<Omit<ReadStoryRow, 'id'>>;
                Relationships: [];
            };
            known_words: {
                Row: KnownWordRow;
                Insert: KnownWordRow;
                Update: Partial<KnownWordRow>;
                Relationships: [];
            };
            unit_progress: {
                Row: UnitProgressRow;
                Insert: Omit<UnitProgressRow, 'id'>;
                Update: Partial<Omit<UnitProgressRow, 'id'>>;
                Relationships: [];
            };
            skill_cards: {
                Row: SkillCardRow;
                Insert: Omit<SkillCardRow, 'id' | 'created_at'>;
                Update: Partial<Omit<SkillCardRow, 'id' | 'created_at'>>;
                Relationships: [];
            };
            level_assessments: {
                Row: LevelAssessmentRow;
                Insert: Omit<LevelAssessmentRow, 'id'>;
                Update: Partial<Omit<LevelAssessmentRow, 'id'>>;
                Relationships: [];
            };
            writing_submissions: {
                Row: WritingSubmissionRow;
                Insert: Omit<WritingSubmissionRow, 'id'>;
                Update: Partial<Omit<WritingSubmissionRow, 'id'>>;
                Relationships: [];
            };
            speaking_submissions: {
                Row: SpeakingSubmissionRow;
                Insert: Omit<SpeakingSubmissionRow, 'id'>;
                Update: Partial<Omit<SpeakingSubmissionRow, 'id'>>;
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
    };
};
