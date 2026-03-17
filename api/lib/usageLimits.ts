import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Daily limits for free tier (pro = unlimited)
// ---------------------------------------------------------------------------
const FREE_DAILY_LIMITS: Record<string, number> = {
    'conversation-tutor': 5,   // 5 messages/day
    'fsrs-reviews': 10,        // 10 cards/day
};

const FREE_WEEKLY_LIMITS: Record<string, number> = {
    'story-generator': 1,      // 1 story/week
};

// ---------------------------------------------------------------------------
// Supabase admin client (service role — same pattern as aiCache)
// ---------------------------------------------------------------------------
function getSupabaseAdmin(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface UsageCheckResult {
    allowed: boolean;
    remaining: number;
    limit: number;
}

// ---------------------------------------------------------------------------
// checkUsageLimit — daily limit check
// ---------------------------------------------------------------------------
export async function checkUsageLimit(
    userId: string,
    feature: string,
    tier: string,
): Promise<UsageCheckResult> {
    const limit = FREE_DAILY_LIMITS[feature];

    // Pro users or features without a daily limit → always allowed
    if (tier === 'pro' || limit === undefined) {
        return { allowed: true, remaining: Infinity, limit: Infinity };
    }

    try {
        const sb = getSupabaseAdmin();
        if (!sb) return { allowed: true, remaining: limit, limit }; // graceful fallback

        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        const { data, error } = await sb
            .from('usage_tracking')
            .select('count')
            .eq('user_id', userId)
            .eq('feature', feature)
            .eq('usage_date', today)
            .maybeSingle();

        if (error) {
            console.error('[usageLimits] daily check error:', error.message);
            return { allowed: true, remaining: limit, limit }; // graceful fallback
        }

        const used = data?.count ?? 0;
        const remaining = Math.max(0, limit - used);
        return { allowed: remaining > 0, remaining, limit };
    } catch (err) {
        console.error('[usageLimits] unexpected error in checkUsageLimit:', err);
        return { allowed: true, remaining: limit, limit };
    }
}

// ---------------------------------------------------------------------------
// checkWeeklyLimit — counts from Monday of the current week
// ---------------------------------------------------------------------------
export async function checkWeeklyLimit(
    userId: string,
    feature: string,
    tier: string,
): Promise<UsageCheckResult> {
    const limit = FREE_WEEKLY_LIMITS[feature];

    if (tier === 'pro' || limit === undefined) {
        return { allowed: true, remaining: Infinity, limit: Infinity };
    }

    try {
        const sb = getSupabaseAdmin();
        if (!sb) return { allowed: true, remaining: limit, limit };

        // Monday of current week (ISO weeks start on Monday)
        const now = new Date();
        const day = now.getDay(); // 0=Sun, 1=Mon, …
        const diffToMonday = day === 0 ? 6 : day - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - diffToMonday);
        const mondayStr = monday.toISOString().slice(0, 10);

        const { data, error } = await sb
            .from('usage_tracking')
            .select('count')
            .eq('user_id', userId)
            .eq('feature', feature)
            .gte('usage_date', mondayStr);

        if (error) {
            console.error('[usageLimits] weekly check error:', error.message);
            return { allowed: true, remaining: limit, limit };
        }

        const used = (data ?? []).reduce((sum, row) => sum + (row.count ?? 0), 0);
        const remaining = Math.max(0, limit - used);
        return { allowed: remaining > 0, remaining, limit };
    } catch (err) {
        console.error('[usageLimits] unexpected error in checkWeeklyLimit:', err);
        return { allowed: true, remaining: limit, limit };
    }
}

// ---------------------------------------------------------------------------
// incrementUsage — fire-and-forget call to increment_usage RPC
// ---------------------------------------------------------------------------
export async function incrementUsage(userId: string, feature: string): Promise<void> {
    try {
        const sb = getSupabaseAdmin();
        if (!sb) return;

        const today = new Date().toISOString().slice(0, 10);

        const { error } = await sb.rpc('increment_usage', {
            p_user_id: userId,
            p_feature: feature,
            p_date: today,
        });

        if (error) {
            console.error('[usageLimits] increment error:', error.message);
        }
    } catch (err) {
        console.error('[usageLimits] unexpected error in incrementUsage:', err);
    }
}

// ---------------------------------------------------------------------------
// getUserTier — fetch tier from profiles table
// ---------------------------------------------------------------------------
export async function getUserTier(userId: string): Promise<string> {
    try {
        const sb = getSupabaseAdmin();
        if (!sb) return 'free';

        const { data, error } = await sb
            .from('profiles')
            .select('tier')
            .eq('id', userId)
            .maybeSingle();

        if (error || !data) return 'free';
        return data.tier ?? 'free';
    } catch {
        return 'free';
    }
}

// ---------------------------------------------------------------------------
// getAllLimitsForUser — returns usage status for all tracked features
// ---------------------------------------------------------------------------
export async function getAllLimitsForUser(
    userId: string,
    tier: string,
): Promise<Record<string, UsageCheckResult>> {
    const [conversationTutor, storyGenerator, fsrsReviews] = await Promise.all([
        checkUsageLimit(userId, 'conversation-tutor', tier),
        checkWeeklyLimit(userId, 'story-generator', tier),
        checkUsageLimit(userId, 'fsrs-reviews', tier),
    ]);

    return {
        'conversation-tutor': conversationTutor,
        'story-generator': storyGenerator,
        'fsrs-reviews': fsrsReviews,
    };
}
