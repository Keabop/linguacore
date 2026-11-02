-- The streak and the daily goal change only through record_activity. Before, RLS let a learner
-- write any of these fields of their own profile from the browser (a 365-day streak in one call).
-- Apply after the app that calls record_activity is deployed: the previous app wrote the streak
-- directly and would be refused.

CREATE OR REPLACE FUNCTION protect_profile_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF coalesce(auth.role(), '') <> 'authenticated' OR public.is_admin()
        OR current_setting('voxie.recording_activity', true) = 'on' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        NEW.streak := 0;
        NEW.last_study_date := NULL;
        NEW.streak_freezes := 0;
        NEW.goal_date := NULL;
        NEW.goal_progress := 0;
        NEW.goal_reviews := 0;
        NEW.goal_messages := 0;
    ELSIF NEW.streak IS DISTINCT FROM OLD.streak
        OR NEW.last_study_date IS DISTINCT FROM OLD.last_study_date
        OR NEW.streak_freezes IS DISTINCT FROM OLD.streak_freezes
        OR NEW.timezone IS DISTINCT FROM OLD.timezone
        OR NEW.goal_date IS DISTINCT FROM OLD.goal_date
        OR NEW.goal_progress IS DISTINCT FROM OLD.goal_progress
        OR NEW.goal_reviews IS DISTINCT FROM OLD.goal_reviews
        OR NEW.goal_messages IS DISTINCT FROM OLD.goal_messages THEN
        RAISE EXCEPTION 'The streak and the daily goal change only through record_activity'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_progress ON profiles;
CREATE TRIGGER protect_profile_progress
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION protect_profile_progress();

-- record_activity marks its own write for the trigger above
CREATE OR REPLACE FUNCTION record_activity(p_kind TEXT, p_timezone TEXT DEFAULT NULL, p_day DATE DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_uid UUID := (select auth.uid());
    p profiles%ROWTYPE;
    v_tz TEXT;
    v_today DATE;
    v_day DATE;
    v_streak INTEGER;
    v_last DATE;
    v_used INTEGER := 0;
    v_freezes INTEGER;
    v_progress INTEGER;
    v_reviews INTEGER;
    v_messages INTEGER;
    v_goal_date DATE;
    v_before INTEGER;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
    END IF;
    IF p_kind IS NULL OR p_kind NOT IN ('review', 'story', 'unit_step', 'tutor') THEN
        RAISE EXCEPTION 'Unknown activity: %', p_kind USING ERRCODE = '22023';
    END IF;

    -- Lets protect_profile_progress tell this function's write apart from a direct update
    PERFORM set_config('voxie.recording_activity', 'on', true);

    SELECT * INTO p FROM profiles WHERE id = v_uid FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
    END IF;

    -- An unknown zone name is ignored instead of breaking the activity. The zone list is only
    -- read when the zone changes: it is a slow view and most calls send the same zone.
    v_tz := CASE
        WHEN p_timezone IS NOT DISTINCT FROM p.timezone THEN coalesce(p.timezone, 'UTC')
        WHEN p_timezone IS NOT NULL AND EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = p_timezone) THEN p_timezone
        ELSE coalesce(p.timezone, 'UTC')
    END;
    v_today := (now() AT TIME ZONE v_tz)::date;
    v_day := CASE WHEN p_day IN (v_today, v_today - 1) THEN p_day ELSE v_today END;

    -- Streak. A day already counted (or a later one, after moving to a zone behind) keeps it;
    -- missed days are covered by freezes when there are enough of them.
    v_last := greatest(p.last_study_date, v_day);
    IF p.last_study_date >= v_day THEN
        v_streak := greatest(p.streak, 1);
    ELSIF p.last_study_date = v_day - 1 THEN
        v_streak := p.streak + 1;
    ELSIF p.last_study_date IS NOT NULL AND p.streak > 0 AND v_day - p.last_study_date - 1 <= p.streak_freezes THEN
        v_used := v_day - p.last_study_date - 1;
        v_streak := p.streak + 1;
    ELSE
        v_streak := 1;
    END IF;
    v_freezes := p.streak_freezes - v_used;
    IF v_streak > p.streak AND v_streak % 7 = 0 THEN
        v_freezes := least(2, v_freezes + 1);
    END IF;

    -- Goal of today
    IF p.goal_date IS DISTINCT FROM v_today THEN
        v_progress := 0; v_reviews := 0; v_messages := 0;
    ELSE
        v_progress := p.goal_progress; v_reviews := p.goal_reviews; v_messages := p.goal_messages;
    END IF;
    v_goal_date := v_today;
    v_before := v_progress;
    IF v_day = v_today THEN
        IF p_kind IN ('story', 'unit_step') THEN
            v_progress := v_progress + 1;
        ELSIF p_kind = 'review' THEN
            v_reviews := v_reviews + 1;
            IF v_reviews % 10 = 0 THEN v_progress := v_progress + 1; END IF;
        ELSE
            v_messages := v_messages + 1;
            IF v_messages % 5 = 0 THEN v_progress := v_progress + 1; END IF;
        END IF;
    END IF;

    UPDATE profiles SET
        timezone = v_tz,
        streak = v_streak,
        last_study_date = v_last,
        streak_freezes = v_freezes,
        goal_date = v_goal_date,
        goal_progress = least(v_progress, 32767),
        goal_reviews = least(v_reviews, 32767),
        goal_messages = least(v_messages, 32767)
    WHERE id = v_uid;
    PERFORM set_config('voxie.recording_activity', 'off', true);

    RETURN jsonb_build_object(
        'streak', v_streak,
        'last_study_date', v_last,
        'streak_freezes', v_freezes,
        'freezes_used', v_used,
        'daily_goal', p.daily_goal,
        'goal_date', v_goal_date,
        'goal_progress', v_progress,
        'goal_reviews', v_reviews,
        'goal_messages', v_messages,
        'goal_met_now', v_before < p.daily_goal AND v_progress >= p.daily_goal
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION record_activity(TEXT, TEXT, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION record_activity(TEXT, TEXT, DATE) TO authenticated;
