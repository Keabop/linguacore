CREATE TABLE skill_cards (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    state SMALLINT NOT NULL DEFAULT 0,
    due TIMESTAMPTZ NOT NULL DEFAULT now(),
    stability FLOAT NOT NULL DEFAULT 0,
    difficulty FLOAT NOT NULL DEFAULT 0,
    elapsed_days INT NOT NULL DEFAULT 0,
    scheduled_days INT NOT NULL DEFAULT 0,
    reps INT NOT NULL DEFAULT 0,
    lapses INT NOT NULL DEFAULT 0,
    last_review TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, skill_id)
);

-- Enable RLS
ALTER TABLE skill_cards ENABLE ROW LEVEL SECURITY;

-- RLS: users can only access their own skill cards
CREATE POLICY "Users can read own skill cards"
    ON skill_cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill cards"
    ON skill_cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill cards"
    ON skill_cards FOR UPDATE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_skill_cards_due ON skill_cards(user_id, due);
CREATE INDEX idx_skill_cards_unit ON skill_cards(user_id, unit_id);
