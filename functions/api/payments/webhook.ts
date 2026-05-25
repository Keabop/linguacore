import { env, setEnv } from '../../../api/lib/config.js';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };
}

// ---------------------------------------------------------------------------
// Status mapping: MP subscription status → profile fields
// ---------------------------------------------------------------------------
function mapSubscriptionStatus(mpStatus: string): { tier: string; subscription_status: string } {
    switch (mpStatus) {
        case 'authorized':
            return { tier: 'pro', subscription_status: 'active' };
        case 'paused':
            return { tier: 'pro', subscription_status: 'past_due' };
        case 'cancelled':
            return { tier: 'free', subscription_status: 'cancelled' };
        default:
            // pending, etc. — don't downgrade
            return { tier: 'pro', subscription_status: 'pending' };
    }
}

// ---------------------------------------------------------------------------
// Cloudflare Pages Function Entry Point
// ---------------------------------------------------------------------------
export const onRequestPost: PagesFunction = async (context) => {
    const { request, env: bindings } = context;
    setEnv(bindings); // Inyectar variables de entorno de Cloudflare

    const corsHeaders = getCorsHeaders(request);

    // Mercado Pago requiere 200 para todos los eventos, incluso fallidos, para evitar reintentos infinitos
    try {
        // 1. Extraer parámetros del Query String de la URL
        const url = new URL(request.url);
        const query = Object.fromEntries(url.searchParams.entries());

        // 2. Extraer cuerpo JSON si existe
        let body: any = {};
        try {
            body = await request.json();
        } catch {
            // Petición vacía o no JSON — continuar
        }

        // 3. Captura tolerante y "todoterreno" de Mercado Pago
        // Obtener el tipo de evento y el ID del pago o suscripción de cualquier parte
        const eventType = body.type || body.topic || query.topic || '';
        const subscriptionId = body.data?.id || body.id || query.id || '';

        // Aceptamos tanto 'subscription_preapproval' como 'preapproval'
        const isSubscriptionEvent = eventType === 'subscription_preapproval' || eventType === 'preapproval';

        if (!isSubscriptionEvent || !subscriptionId) {
            console.log('[Webhook Edge] Ignored event:', { eventType, subscriptionId });
            return new Response(JSON.stringify({ received: true, ignored: true }), {
                status: 200,
                headers: corsHeaders,
            });
        }

        const accessToken = env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('[Webhook Edge] Missing MERCADOPAGO_ACCESS_TOKEN');
            return new Response(JSON.stringify({ received: true }), {
                status: 200,
                headers: corsHeaders,
            });
        }

        // 4. Consultar los detalles reales de la suscripción a Mercado Pago
        const client = new MercadoPagoConfig({ accessToken });
        const preApproval = new PreApproval(client);
        const subscription = await preApproval.get({ id: subscriptionId.toString() });

        const userId = subscription.external_reference;
        if (!userId) {
            console.error('[Webhook Edge] No external_reference (userId) in subscription:', subscriptionId);
            return new Response(JSON.stringify({ received: true }), {
                status: 200,
                headers: corsHeaders,
            });
        }

        // 5. Mapear estado
        const { tier, subscription_status } = mapSubscriptionStatus(subscription.status ?? '');

        // 6. Conectar a Supabase usando Service Role Key (evita RLS) y actualizar
        const supabaseUrl = env.SUPABASE_URL;
        const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
            console.error('[Webhook Edge] Missing Supabase credentials');
            return new Response(JSON.stringify({ received: true }), {
                status: 200,
                headers: corsHeaders,
            });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { error } = await supabase
            .from('profiles')
            .update({
                tier,
                subscription_id: subscription.id?.toString() ?? null,
                subscription_status,
            })
            .eq('id', userId);

        if (error) {
            console.error('[Webhook Edge] Failed to update profile in Supabase:', error);
        } else {
            console.log(`[Webhook Edge] SUCCESS! Updated user ${userId}: tier=${tier}, status=${subscription_status}`);
        }

        return new Response(JSON.stringify({ received: true, updated: true }), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (error: any) {
        console.error('[Webhook Edge] Unexpected error processing webhook:', error);
        // Siempre retornamos 200 para que Mercado Pago no intente infinitamente en caso de bug
        return new Response(JSON.stringify({ received: true, error: error.message }), {
            status: 200,
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
