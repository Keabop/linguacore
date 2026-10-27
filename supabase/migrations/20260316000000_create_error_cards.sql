-- Error cards: personalized error review with FSRS spaced repetition
CREATE TABLE error_cards (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    error_pattern TEXT NOT NULL,
    original_sentence TEXT NOT NULL,
    corrected_sentence TEXT NOT NULL,
    explanation TEXT NOT NULL,
    error_type TEXT NOT NULL CHECK (error_type IN ('grammar', 'vocabulary', 'spelling', 'style')),
    source TEXT NOT NULL CHECK (source IN ('tutor', 'writing', 'unit')),
    example_variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    state INTEGER NOT NULL DEFAULT 0,
    due TIMESTAMPTZ NOT NULL DEFAULT now(),
    stability REAL NOT NULL DEFAULT 0,
    difficulty REAL NOT NULL DEFAULT 0,
    elapsed_days INTEGER NOT NULL DEFAULT 0,
    scheduled_days INTEGER NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    last_review TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE error_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own error cards"
    ON error_cards FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own error cards"
    ON error_cards FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own error cards"
    ON error_cards FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_error_cards_user_due ON error_cards (user_id, due);
CREATE INDEX idx_error_cards_user_pattern ON error_cards (user_id, error_pattern);
