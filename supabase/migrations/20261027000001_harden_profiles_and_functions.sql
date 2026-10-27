-- 1. Users could update their own profile row freely, including tier and subscription
--    fields, so anyone could make themselves Pro from the browser. Billing fields now
--    change only through the backend (service role) or the admin.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT coalesce(auth.email() = 'luiszwazagamer@gmail.com', false);
$$;

CREATE OR REPLACE FUNCTION protect_profile_billing()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF coalesce(auth.role(), '') <> 'authenticated' OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        NEW.tier := 'free';
        NEW.subscription_id := NULL;
        NEW.subscription_status := 'inactive';
        NEW.trial_started_at := NULL;
        NEW.trial_ends_at := NULL;
    ELSIF NEW.tier IS DISTINCT FROM OLD.tier
        OR NEW.subscription_id IS DISTINCT FROM OLD.subscription_id
        OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
        OR NEW.trial_started_at IS DISTINCT FROM OLD.trial_started_at
        OR NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at THEN
        RAISE EXCEPTION 'Billing fields can only be changed by the server'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_billing ON profiles;
CREATE TRIGGER protect_profile_billing
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION protect_profile_billing();

-- 2. SECURITY DEFINER functions: fixed search_path and no public execution.
--    increment_usage takes any user id, so only the backend may call it.

ALTER FUNCTION increment_usage(UUID, TEXT, DATE) SET search_path = public;
ALTER FUNCTION admin_get_users() SET search_path = public;
ALTER FUNCTION handle_new_user() SET search_path = public;

REVOKE EXECUTE ON FUNCTION increment_usage(UUID, TEXT, DATE) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION admin_get_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION increment_usage(UUID, TEXT, DATE) TO service_role;
GRANT EXECUTE ON FUNCTION admin_get_users() TO authenticated;

-- 3. Users created while the trigger was missing or after the data wipe have no profile.

INSERT INTO profiles (id)
SELECT u.id FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);
