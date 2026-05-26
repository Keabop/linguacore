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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
    };
}

// ---------------------------------------------------------------------------
// Authenticate
// ---------------------------------------------------------------------------
async function authenticate(request: Request) {
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
// Plan config
// ---------------------------------------------------------------------------
const PLANS = {
    monthly: {
        reason: 'Voxie Plan Pro - Mensual',
        frequency: 1,
        frequency_type: 'months' as const,
        transaction_amount: 129,
    },
    annual: {
        reason: 'Voxie Plan Pro - Anual',
        frequency: 12,
        frequency_type: 'months' as const,
        transaction_amount: 1200,
    },
};

// ---------------------------------------------------------------------------
// Cloudflare Pages Function Entry Point
// ---------------------------------------------------------------------------
export const onRequestPost: PagesFunction = async (context) => {
    const { request, env: bindings } = context;
    setEnv(bindings); // Inyectar variables de entorno de Cloudflare

    const corsHeaders = getCorsHeaders(request);

    // Authenticate
    const user = await authenticate(request);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized — valid Supabase session required' }), {
            status: 401,
            headers: corsHeaders,
        });
    }

    try {
        const { plan, action } = await request.json() as {
            plan?: 'monthly' | 'annual';
            action?: 'cancel' | 'reactivate' | 'verify';
        };

        const accessToken = env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('[Payments Edge] Missing MERCADOPAGO_ACCESS_TOKEN');
            return new Response(JSON.stringify({ error: 'Payment provider not configured' }), {
                status: 500,
                headers: corsHeaders,
            });
        }

        const client = new MercadoPagoConfig({ accessToken });
        const preApproval = new PreApproval(client);

        // ---------------------------------------------------------------
        // Verify subscription (called when user returns from MP checkout)
        // ---------------------------------------------------------------
        if (action === 'verify') {
            const mpRes = await fetch(
                `https://api.mercadopago.com/preapproval/search?external_reference=${user.id}&sort=date_created&criteria=desc&limit=1`,
                { headers: { Authorization: `Bearer ${accessToken}` } },
            );

            if (!mpRes.ok) {
                console.error('[Verify Edge] MP search failed:', mpRes.status);
                return new Response(JSON.stringify({ error: 'Failed to verify with payment provider' }), {
                    status: 502,
                    headers: corsHeaders,
                });
            }

            const mpData: any = await mpRes.json();
            const subscription = mpData.results?.[0];

            if (!subscription) {
                return new Response(JSON.stringify({ tier: 'free', subscription_status: 'none' }), {
                    status: 200,
                    headers: corsHeaders,
                });
            }

            const mpStatus = subscription.status ?? '';
            const tier = mpStatus === 'cancelled' ? 'free' : 'pro';
            const subStatus = mpStatus === 'authorized' ? 'active'
                : mpStatus === 'paused' ? 'past_due'
                : mpStatus === 'cancelled' ? 'cancelled' : 'pending';

            const supabaseUrl = env.SUPABASE_URL;
            const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
            if (!supabaseUrl || !serviceRoleKey) {
                return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                    status: 500,
                    headers: corsHeaders,
                });
            }

            const supabase = createClient(supabaseUrl, serviceRoleKey);
            const { error: dbError } = await supabase
                .from('profiles')
                .update({
                    tier,
                    subscription_id: subscription.id?.toString() ?? null,
                    subscription_status: subStatus,
                })
                .eq('id', user.id);

            if (dbError) {
                console.error('[Verify Edge] DB update failed:', dbError);
                return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
                    status: 500,
                    headers: corsHeaders,
                });
            }

            console.log(`[Verify Edge] Updated user ${user.id}: tier=${tier}, status=${subStatus}`);
            return new Response(JSON.stringify({ tier, subscription_status: subStatus }), {
                status: 200,
                headers: corsHeaders,
            });
        }

        // ---------------------------------------------------------------
        // Cancel / Reactivate existing subscription
        // ---------------------------------------------------------------
        if (action) {
            if (!['cancel', 'reactivate'].includes(action)) {
                return new Response(JSON.stringify({ error: 'Invalid action. Must be "cancel" or "reactivate".' }), {
                    status: 400,
                    headers: corsHeaders,
                });
            }

            const supabaseUrl = env.SUPABASE_URL;
            const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
            if (!supabaseUrl || !serviceRoleKey) {
                return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                    status: 500,
                    headers: corsHeaders,
                });
            }

            const supabase = createClient(supabaseUrl, serviceRoleKey);
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_id')
                .eq('id', user.id)
                .single();

            if (!profile?.subscription_id) {
                return new Response(JSON.stringify({ error: 'No active subscription found' }), {
                    status: 400,
                    headers: corsHeaders,
                });
            }

            await preApproval.update({
                id: profile.subscription_id,
                body: { status: action === 'cancel' ? 'cancelled' : 'authorized' },
            });

            await supabase
                .from('profiles')
                .update({ subscription_status: action === 'cancel' ? 'cancelled' : 'active' })
                .eq('id', user.id);

            const resultAction = action === 'cancel' ? 'cancelled' : 'reactivated';
            return new Response(JSON.stringify({ success: true, action: resultAction }), {
                status: 200,
                headers: corsHeaders,
            });
        }

        // ---------------------------------------------------------------
        // Create new subscription
        // ---------------------------------------------------------------
        if (!plan || !PLANS[plan]) {
            return new Response(JSON.stringify({ error: 'Invalid plan. Must be "monthly" or "annual".' }), {
                status: 400,
                headers: corsHeaders,
            });
        }

        const config = PLANS[plan];
        const appUrl = env.APP_URL || 'https://linguacore-zeta.vercel.app';
        const backUrl = appUrl + '/pricing?status=success';
        const notificationUrl = appUrl + '/api/payments/webhook';

        const result = await preApproval.create({
            body: {
                reason: config.reason,
                auto_recurring: {
                    frequency: config.frequency,
                    frequency_type: config.frequency_type,
                    transaction_amount: config.transaction_amount,
                    currency_id: 'MXN',
                },
                back_url: backUrl,
                notification_url: notificationUrl,
                payer_email: user.email!,
                external_reference: user.id,
            } as any,
        });

        return new Response(JSON.stringify({ init_point: result.init_point }), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';
        const errorDetails = error?.response || error?.cause || null;
        console.error('[Payments Edge] Error:', error, 'Details:', errorDetails);
        return new Response(JSON.stringify({ 
            error: 'Failed to process subscription request',
            message: errorMessage,
            stack: errorStack,
            details: errorDetails
        }), {
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
