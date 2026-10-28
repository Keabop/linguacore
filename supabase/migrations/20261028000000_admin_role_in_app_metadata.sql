-- The admin is a role in app_metadata instead of an email written into functions and code.
-- app_metadata can only be changed with the service role, never by the user, and travels
-- in the JWT, so checking it costs no query. A new admin is granted with the same UPDATE.
-- The database and the UI see a granted or removed role once the session token refreshes
-- (signing in again, or within the hour); the backend reads the user fresh on each call.

UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'luiszwazagamer@gmail.com';

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS TABLE(
    id UUID, email TEXT, full_name TEXT, current_level TEXT, unlocked_levels TEXT[],
    total_words_learned INTEGER, streak INTEGER, last_study_date TIMESTAMPTZ,
    level_progress JSONB, tier TEXT, trial_started_at TIMESTAMPTZ, trial_ends_at TIMESTAMPTZ,
    subscription_id TEXT, subscription_status TEXT, created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT p.id, u.email::text,
        (u.raw_user_meta_data->>'full_name')::text,
        p.current_level::text, p.unlocked_levels::text[],
        p.total_words_learned, p.streak, p.last_study_date,
        p.level_progress, p.tier::text, p.trial_started_at,
        p.trial_ends_at, p.subscription_id,
        p.subscription_status::text, p.created_at
    FROM profiles p JOIN auth.users u ON p.id = u.id
    WHERE public.is_admin()
    ORDER BY p.created_at DESC;
$$;
