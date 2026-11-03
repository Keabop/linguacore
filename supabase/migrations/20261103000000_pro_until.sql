-- A cancelled Pro subscription keeps Pro until the end of the period already paid, as the
-- terms promise. The backend stores that date here; after it, the tier counts as free.
-- Additive: apply before deploying the app that reads it.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_until TIMESTAMPTZ;

-- pro_until is a billing field: only the backend or the admin may change it
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
        NEW.pro_until := NULL;
    ELSIF NEW.tier IS DISTINCT FROM OLD.tier
        OR NEW.subscription_id IS DISTINCT FROM OLD.subscription_id
        OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
        OR NEW.trial_started_at IS DISTINCT FROM OLD.trial_started_at
        OR NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at
        OR NEW.pro_until IS DISTINCT FROM OLD.pro_until THEN
        RAISE EXCEPTION 'Billing fields can only be changed by the server'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$;
