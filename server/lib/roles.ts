import type { User } from '@supabase/supabase-js';

/**
 * The tier whose limits apply. The admin role lives in app_metadata, which only the service
 * role can change, and gives Pro access without a paid tier on record.
 */
export function accessTier(user: Pick<User, 'app_metadata'>, tier: string): string {
    return user.app_metadata?.role === 'admin' ? 'pro' : tier;
}
