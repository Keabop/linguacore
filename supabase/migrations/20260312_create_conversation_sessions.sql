CREATE TABLE conversation_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    level TEXT NOT NULL,
    topic TEXT,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
    ON conversation_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
    ON conversation_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
    ON conversation_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Index for listing history
CREATE INDEX idx_conversation_sessions_user ON conversation_sessions(user_id, started_at DESC);
