import { env, setEnv } from '../../api/lib/config.js';
import { getUserTier, getAllLimitsForUser } from '../../api/lib/usageLimits.js';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// CORS Setup
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
    'https://linguacore-zeta.vercel.app',
    'https://voxie.pages.dev',
    'https://voxie.lat',
    'https://www.voxie.lat',
    'http://localhost:8788',
    'http://localhost:5173',
    'http://localhost:4173',
];

function getCorsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get('Origin') ?? '';
    const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
    };
}

// ---------------------------------------------------------------------------
// Authenticate
// ---------------------------------------------------------------------------
async function authenticate(request: Request): Promise<string | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;
    return user.id;
}

// ---------------------------------------------------------------------------
// Cloudflare Pages Function Entry Point (GET request)
// ---------------------------------------------------------------------------
export const onRequestGet: PagesFunction = async (context) => {
    const { request, env: bindings } = context;
    setEnv(bindings); // Inyectar variables de entorno de Cloudflare

    const corsHeaders = getCorsHeaders(request);

    // Authenticate
    const userId = await authenticate(request);
    if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized — valid Supabase session required' }), {
            status: 401,
            headers: corsHeaders,
        });
    }

    try {
        const tier = await getUserTier(userId);
        const limits = await getAllLimitsForUser(userId, tier);

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
        headers: getCorsHeaders(context.request),
    });
};
