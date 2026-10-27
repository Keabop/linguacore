-- Objects that existed in the database but had no migration in the repo.
-- Idempotent: safe to run against the current database.

CREATE TABLE IF NOT EXISTS ai_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT NOT NULL UNIQUE,
    agent TEXT NOT NULL,
    params_hash TEXT NOT NULL,
    response JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    hit_count INTEGER DEFAULT 0,
    last_hit_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_agent ON ai_cache (agent);

-- Only the backend (service role) reads and writes the cache
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    count INTEGER NOT NULL DEFAULT 1,
    UNIQUE (user_id, feature, usage_date)
);

-- Only the backend (service role) reads and writes usage
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID, p_feature TEXT, p_date DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO usage_tracking (user_id, feature, usage_date, count)
    VALUES (p_user_id, p_feature, p_date, 1)
    ON CONFLICT (user_id, feature, usage_date)
    DO UPDATE SET count = usage_tracking.count + 1;
END;
$$;

CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS TABLE (
    id UUID, email TEXT, full_name TEXT, current_level TEXT, unlocked_levels TEXT[],
    total_words_learned INTEGER, streak INTEGER, last_study_date TIMESTAMPTZ,
    level_progress JSONB, tier TEXT, trial_started_at TIMESTAMPTZ, trial_ends_at TIMESTAMPTZ,
    subscription_id TEXT, subscription_status TEXT, created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT p.id, u.email::text,
        (u.raw_user_meta_data->>'full_name')::text,
        p.current_level::text, p.unlocked_levels::text[],
        p.total_words_learned, p.streak, p.last_study_date,
        p.level_progress, p.tier::text, p.trial_started_at,
        p.trial_ends_at, p.subscription_id,
        p.subscription_status::text, p.created_at
    FROM profiles p JOIN auth.users u ON p.id = u.id
    WHERE auth.email() = 'luiszwazagamer@gmail.com'
    ORDER BY p.created_at DESC;
$$;

DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
CREATE POLICY "admin_read_all_profiles" ON profiles
    FOR SELECT USING (auth.email() = 'luiszwazagamer@gmail.com');

DROP POLICY IF EXISTS "admin_update_any_profile" ON profiles;
CREATE POLICY "admin_update_any_profile" ON profiles
    FOR UPDATE USING (auth.email() = 'luiszwazagamer@gmail.com')
    WITH CHECK (auth.email() = 'luiszwazagamer@gmail.com');
