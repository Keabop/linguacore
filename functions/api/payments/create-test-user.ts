import { env, setEnv } from '../../../api/lib/config.js';

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

export const onRequestGet: PagesFunction = async (context) => {
    const { request, env: bindings } = context;
    setEnv(bindings);

    const corsHeaders = getCorsHeaders(request);

    try {
        const accessToken = env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'MERCADOPAGO_ACCESS_TOKEN not configured in environment' }), {
                status: 500,
                headers: corsHeaders,
            });
        }

        const mpRes = await fetch('https://api.mercadopago.com/users/test', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                site_id: 'MLM',
                description: 'Voxie Test Buyer Generated'
            }),
        });

        const data = await mpRes.json();

        return new Response(JSON.stringify({
            status: mpRes.status,
            ok: mpRes.ok,
            result: data,
        }), {
            status: mpRes.status,
            headers: corsHeaders,
        });
    } catch (error: any) {
        console.error('[Create Test User] Error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to create test user',
            message: error.message || String(error),
        }), {
            status: 500,
            headers: corsHeaders,
        });
    }
};

export const onRequestOptions: PagesFunction = async (context) => {
    return new Response(null, {
        status: 204,
        headers: getCorsHeaders(context.request),
    });
};
