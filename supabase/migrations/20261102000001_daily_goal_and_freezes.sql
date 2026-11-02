-- Daily goal and streak freezes. The learner picks 1 to 3 activities a day; a story or a unit step
-- is one, and so are every 10 reviewed cards and every 5 messages to the tutor. A freeze is earned
-- every 7 days of streak (2 at most) and is spent on its own, one per missed day.

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS daily_goal SMALLINT NOT NULL DEFAULT 1 CHECK (daily_goal BETWEEN 1 AND 3),
    ADD COLUMN IF NOT EXISTS goal_date DATE,
    ADD COLUMN IF NOT EXISTS goal_progress SMALLINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS goal_reviews SMALLINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS goal_messages SMALLINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS streak_freezes SMALLINT NOT NULL DEFAULT 0 CHECK (streak_freezes BETWEEN 0 AND 2);

-- Same signature as before; the result gains the goal and the freezes. The goal only counts
-- activities of today: one queued offline yesterday still saves the streak, not today's goal.
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

    SELECT * INTO p FROM profiles WHERE id = v_uid FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
    END IF;

    -- An unknown zone name is ignored instead of breaking the activity
    v_tz := CASE
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
