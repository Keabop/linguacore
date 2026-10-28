import { env, setEnv } from '../../server/lib/config.js';
import { getUserTier, getAllLimitsForUser } from '../../server/lib/usageLimits.js';
import { accessTier } from '../../server/lib/roles.js';
import { createClient, type User } from '@supabase/supabase-js';
import { getCorsHeaders } from '../../server/lib/cors.js';

// ---------------------------------------------------------------------------
// Authenticate
// ---------------------------------------------------------------------------
async function authenticate(request: Request): Promise<User | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;
    return user;
}

// ---------------------------------------------------------------------------
// Cloudflare Pages Function Entry Point (GET request)
// ---------------------------------------------------------------------------
export const onRequestGet: PagesFunction = async (context) => {
    const { request, env: bindings } = context;
    setEnv(bindings); // Inyectar variables de entorno de Cloudflare

    const corsHeaders = getCorsHeaders(request, 'GET, OPTIONS');

    // Authenticate
    const user = await authenticate(request);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized — valid Supabase session required' }), {
            status: 401,
            headers: corsHeaders,
        });
    }

    try {
        const tier = accessTier(user, await getUserTier(user.id));
        const limits = await getAllLimitsForUser(user.id, tier);

        return new Response(JSON.stringify({ tier, limits }), {
            status: 200,
            headers: corsHeaders,
        });
    } catch (error: any) {
        console.error('[Usage Edge API] Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch usage data' }), {
            status: 500,
            headers: corsHeaders,
        });
    }
};

// CORS Preflight Options handling
export const onRequestOptions: PagesFunction = async (context) => {
    return new Response(null, {
        status: 204,
        headers: getCorsHeaders(context.request, 'GET, OPTIONS'),
    });
};
