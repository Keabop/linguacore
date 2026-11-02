-- The streak counts any study activity (a review, a story, a unit step, a tutor message) on the
-- learner's own calendar day. It used to be computed in the browser on the UTC date, so studying
-- in Mexico after 18:00 counted for the next day.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT;

-- p_day is the learner's local date of the activity, sent so an activity queued offline counts
-- for the day it happened. Only today or yesterday (in the learner's time zone) are taken; any
-- other value counts as today. Runs as the caller, so RLS keeps it on the caller's own row.
CREATE OR REPLACE FUNCTION record_activity(p_kind TEXT, p_timezone TEXT DEFAULT NULL, p_day DATE DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_uid UUID := (select auth.uid());
    v_tz TEXT;
    v_today DATE;
    v_day DATE;
    v_result JSONB;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
    END IF;
    IF p_kind IS NULL OR p_kind NOT IN ('review', 'story', 'unit_step', 'tutor') THEN
        RAISE EXCEPTION 'Unknown activity: %', p_kind USING ERRCODE = '22023';
    END IF;

    -- An unknown zone name is ignored instead of breaking the activity
    IF p_timezone IS NOT NULL AND EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = p_timezone) THEN
        UPDATE profiles SET timezone = p_timezone WHERE id = v_uid AND timezone IS DISTINCT FROM p_timezone;
    END IF;

    SELECT coalesce(timezone, 'UTC') INTO v_tz FROM profiles WHERE id = v_uid;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
    END IF;

    v_today := (now() AT TIME ZONE v_tz)::date;
    v_day := CASE WHEN p_day IN (v_today, v_today - 1) THEN p_day ELSE v_today END;

    -- A day already counted (or a later one, after moving to a zone behind) keeps the streak
    UPDATE profiles p SET
        streak = CASE
            WHEN p.last_study_date >= v_day THEN greatest(p.streak, 1)
            WHEN p.last_study_date = v_day - 1 THEN p.streak + 1
            ELSE 1
        END,
        last_study_date = greatest(p.last_study_date, v_day)
    WHERE p.id = v_uid
    RETURNING jsonb_build_object('streak', p.streak, 'last_study_date', p.last_study_date) INTO v_result;

    RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION record_activity(TEXT, TEXT, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION record_activity(TEXT, TEXT, DATE) TO authenticated;
