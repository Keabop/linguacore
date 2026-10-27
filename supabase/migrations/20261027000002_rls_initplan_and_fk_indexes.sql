-- Same access rules, cheaper to evaluate (Supabase linter: auth_rls_initplan,
-- multiple_permissive_policies, unindexed_foreign_keys).
-- 1. auth.uid() wrapped in (select ...) runs once per query instead of once per row.
-- 2. Policies apply to `authenticated` only: for anon auth.uid() is null and never matched.
-- 3. profiles: the user and admin policies are merged so each action has one policy.

-- Tables where each user manages only their own rows
DROP POLICY IF EXISTS "Users manage own cards" ON cards;
CREATE POLICY "Users manage own cards" ON cards FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own simulations" ON cefr_simulations;
CREATE POLICY "Users manage own simulations" ON cefr_simulations FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own known_words" ON known_words;
CREATE POLICY "Users manage own known_words" ON known_words FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own assessments" ON level_assessments;
CREATE POLICY "Users manage own assessments" ON level_assessments FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own read_stories" ON read_stories;
CREATE POLICY "Users manage own read_stories" ON read_stories FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own speaking" ON speaking_submissions;
CREATE POLICY "Users manage own speaking" ON speaking_submissions FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own sessions" ON study_sessions;
CREATE POLICY "Users manage own sessions" ON study_sessions FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own progress" ON unit_progress;
CREATE POLICY "Users manage own progress" ON unit_progress FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own writing" ON writing_submissions;
CREATE POLICY "Users manage own writing" ON writing_submissions FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Tables with separate read/insert/update policies (no delete, as before)
DROP POLICY IF EXISTS "Users can read own sessions" ON conversation_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON conversation_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON conversation_sessions;
CREATE POLICY "Users can read own sessions" ON conversation_sessions FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own sessions" ON conversation_sessions FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own sessions" ON conversation_sessions FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own error cards" ON error_cards;
DROP POLICY IF EXISTS "Users can insert own error cards" ON error_cards;
DROP POLICY IF EXISTS "Users can update own error cards" ON error_cards;
CREATE POLICY "Users can view own error cards" ON error_cards FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own error cards" ON error_cards FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own error cards" ON error_cards FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can read own skill cards" ON skill_cards;
DROP POLICY IF EXISTS "Users can insert own skill cards" ON skill_cards;
DROP POLICY IF EXISTS "Users can update own skill cards" ON skill_cards;
CREATE POLICY "Users can read own skill cards" ON skill_cards FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own skill cards" ON skill_cards FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own skill cards" ON skill_cards FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id);

-- profiles: own row for everything, the admin may also read and update any row.
-- Billing fields stay protected by the protect_profile_billing trigger.
DROP POLICY IF EXISTS "Users manage own data" ON profiles;
DROP POLICY IF EXISTS admin_read_all_profiles ON profiles;
DROP POLICY IF EXISTS admin_update_any_profile ON profiles;
CREATE POLICY profiles_select ON profiles FOR SELECT TO authenticated
    USING ((select auth.uid()) = id OR (select public.is_admin()));
CREATE POLICY profiles_insert ON profiles FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE TO authenticated
    USING ((select auth.uid()) = id OR (select public.is_admin()))
    WITH CHECK ((select auth.uid()) = id OR (select public.is_admin()));
CREATE POLICY profiles_delete ON profiles FOR DELETE TO authenticated
    USING ((select auth.uid()) = id);

-- Foreign keys used by every per-user query
CREATE INDEX IF NOT EXISTS idx_cefr_simulations_user_id ON cefr_simulations (user_id);
CREATE INDEX IF NOT EXISTS idx_level_assessments_user_id ON level_assessments (user_id);
CREATE INDEX IF NOT EXISTS idx_speaking_submissions_user_id ON speaking_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_user_id ON writing_submissions (user_id);
