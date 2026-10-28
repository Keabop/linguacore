-- Learners can delete their own tutor conversations (and only their own).
DROP POLICY IF EXISTS "Users can delete own sessions" ON conversation_sessions;
CREATE POLICY "Users can delete own sessions" ON conversation_sessions
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);
