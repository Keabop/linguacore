import { createClient, type User } from '@supabase/supabase-js';
import { env } from './config.js';

/**
 * Who is calling, from the request's Supabase access token. A missing or rejected token is
 * the caller's problem (401: the app refreshes the session or asks to sign in again); missing
 * server keys are ours (500), so a misconfigured deploy never signs users out.
 */
export async function authenticateRequest(request: Request): Promise<{ user: User } | { response: (headers: HeadersInit) => Response }> {
    const fail = (status: number, error: string) => ({
        response: (headers: HeadersInit) => new Response(JSON.stringify({ error }), { status, headers }),
    });

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[auth] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
        return fail(500, 'Server misconfigured');
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return fail(401, 'Unauthorized — valid Supabase session required');

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error } = await supabase.auth.getUser(authHeader.slice(7));
    // A token whose session was revoked (signed out on another device) lands here too
    if (error || !user) return fail(401, 'Unauthorized — valid Supabase session required');
    return { user };
}
