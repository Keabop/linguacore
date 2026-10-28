import { env, setEnv } from '../../../server/lib/config.js';
import { authenticateRequest } from '../../../server/lib/auth.js';
import { createClient } from '@supabase/supabase-js';
import { getCorsHeaders } from '../../../server/lib/cors.js';
import { createPreapproval, findLatestPreapproval, mapSubscriptionStatus, updatePreapproval } from '../../../server/lib/mercadopago.js';

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

    const corsHeaders = getCorsHeaders(request, 'POST, OPTIONS');

    // Authenticate
    const auth = await authenticateRequest(request);
    if ('response' in auth) return auth.response(corsHeaders);
    const { user } = auth;

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

        // ---------------------------------------------------------------
        // Verify subscription (called when user returns from MP checkout)
        // ---------------------------------------------------------------
        if (action === 'verify') {
            let subscription;
            try {
                subscription = await findLatestPreapproval(accessToken, user.id);
            } catch (error) {
                console.error('[Verify Edge] MP search failed:', error);
                return new Response(JSON.stringify({ error: 'Failed to verify with payment provider' }), {
                    status: 502,
                    headers: corsHeaders,
                });
            }

            if (!subscription) {
                return new Response(JSON.stringify({ tier: 'free', subscription_status: 'none' }), {
                    status: 200,
                    headers: corsHeaders,
                });
            }

            const { tier: mappedTier, subscription_status: subStatus } = mapSubscriptionStatus(subscription.status ?? '');

            const supabaseUrl = env.SUPABASE_URL;
            const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
            if (!supabaseUrl || !serviceRoleKey) {
                return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                    status: 500,
                    headers: corsHeaders,
                });
            }

            const supabase = createClient(supabaseUrl, serviceRoleKey);
            const { data: updated, error: dbError } = await supabase
                .from('profiles')
                .update({
                    ...(mappedTier ? { tier: mappedTier } : {}),
                    subscription_id: subscription.id?.toString() ?? null,
                    subscription_status: subStatus,
                })
                .eq('id', user.id)
                .select('tier')
                .single();

            if (dbError) {
                console.error('[Verify Edge] DB update failed:', dbError);
                return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
                    status: 500,
                    headers: corsHeaders,
                });
            }

            const tier = updated?.tier ?? 'free';
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

            await updatePreapproval(accessToken, profile.subscription_id, {
                status: action === 'cancel' ? 'cancelled' : 'authorized',
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
        const appUrl = env.APP_URL || 'https://voxie.pages.dev';
        const backUrl = appUrl + '/pricing?status=success';
        const notificationUrl = appUrl + '/api/payments/webhook';

        const isSandbox = accessToken.startsWith('TEST-');
        const subscriptionBody: any = {
            reason: config.reason,
            auto_recurring: {
                frequency: config.frequency,
                frequency_type: config.frequency_type,
                transaction_amount: config.transaction_amount,
                currency_id: 'MXN',
            },
            back_url: backUrl,
            notification_url: notificationUrl,
            // In Sandbox, use the test payer email (created via MP API for this app)
            // In Production, use the real Supabase user email
            payer_email: isSandbox
                ? (env.MERCADOPAGO_TEST_PAYER_EMAIL?.trim() || user.email!.trim())
                : user.email!.trim(),
            external_reference: user.id,
        };


        const result = await createPreapproval(accessToken, subscriptionBody);

        return new Response(JSON.stringify({ init_point: result.init_point }), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (error: any) {
        console.error('[Payments Edge] Error:', error, error?.cause ?? '');
        return new Response(JSON.stringify({ error: 'Failed to process subscription request' }), {
            status: 500,
            headers: corsHeaders,
        });
    }
};

// CORS Preflight Options handling
export const onRequestOptions: PagesFunction = async (context) => {
    return new Response(null, {
        status: 204,
        headers: getCorsHeaders(context.request, 'POST, OPTIONS'),
    });
};
