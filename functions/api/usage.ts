import { env, setEnv } from '../../server/lib/config.js';
import { authenticateRequest } from '../../server/lib/auth.js';
import { getUserTier, getAllLimitsForUser } from '../../server/lib/usageLimits.js';
import { accessTier } from '../../server/lib/roles.js';
import { getCorsHeaders } from '../../server/lib/cors.js';

// ---------------------------------------------------------------------------
// Cloudflare Pages Function Entry Point (GET request)
// ---------------------------------------------------------------------------
export const onRequestGet: PagesFunction = async (context) => {
    const { request, env: bindings } = context;
    setEnv(bindings); // Inyectar variables de entorno de Cloudflare

    const corsHeaders = getCorsHeaders(request, 'GET, OPTIONS');

    // Authenticate
    const auth = await authenticateRequest(request);
    if ('response' in auth) return auth.response(corsHeaders);
    const { user } = auth;

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
