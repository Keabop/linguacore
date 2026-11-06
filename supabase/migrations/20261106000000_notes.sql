-- Notebook: the learner's own notes, taken from any screen. Each note remembers where it was
-- written (unit, story or page) to take the learner back there. Deleting only marks the row, so a
-- delete queued offline is an ordinary update. Additive: the current app never reads it.

CREATE TABLE IF NOT EXISTS notes (
    -- Made by the client, so a note written offline keeps its id once synced
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL DEFAULT '' CHECK (char_length(body) <= 5000),
    quote TEXT CHECK (char_length(quote) <= 1000),
    context_key TEXT CHECK (char_length(context_key) <= 200),
    context_label TEXT CHECK (char_length(context_label) <= 200),
    context_path TEXT CHECK (char_length(context_path) <= 300),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own notes" ON notes;
CREATE POLICY "Users read own notes" ON notes
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users add own notes" ON notes;
CREATE POLICY "Users add own notes" ON notes
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users edit own notes" ON notes;
CREATE POLICY "Users edit own notes" ON notes
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS notes_user_updated_idx ON notes (user_id, updated_at DESC) WHERE deleted_at IS NULL;
