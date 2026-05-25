import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
    'https://linguacore-zeta.vercel.app', // Producción actual en Vercel
    'https://voxie.pages.dev',             // Cloudflare Pages estimado
    'https://voxie.lat',                   // Dominio final reservado
    'https://www.voxie.lat',
    'http://localhost:5173',
    'http://localhost:4173',
];

function getCorsOrigin(req: VercelRequest): string {
    const origin = req.headers.origin ?? '';
    return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

// ---------------------------------------------------------------------------
// Auth — same pattern as orchestrator.ts
// ---------------------------------------------------------------------------
async function authenticate(req: VercelRequest) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
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
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const corsOrigin = getCorsOrigin(req);
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Authenticate
    const user = await authenticate(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized — valid Supabase session required' });
    }

    try {
        const { plan, action } = req.body as {
            plan?: 'monthly' | 'annual';
            action?: 'cancel' | 'reactivate' | 'verify';
        };

        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('[Payments] Missing MERCADOPAGO_ACCESS_TOKEN');
            return res.status(500).json({ error: 'Payment provider not configured' });
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
                console.error('[Verify] MP search failed:', mpRes.status);
                return res.status(502).json({ error: 'Failed to verify with payment provider' });
            }

            const mpData = await mpRes.json();
            const subscription = mpData.results?.[0];

            if (!subscription) {
                return res.status(200).json({ tier: 'free', subscription_status: 'none' });
            }

            const mpStatus = subscription.status ?? '';
            const tier = mpStatus === 'cancelled' ? 'free' : 'pro';
            const subStatus = mpStatus === 'authorized' ? 'active'
                : mpStatus === 'paused' ? 'past_due'
                : mpStatus === 'cancelled' ? 'cancelled' : 'pending';

            const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (!supabaseUrl || !serviceRoleKey) {
                return res.status(500).json({ error: 'Server configuration error' });
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
                console.error('[Verify] DB update failed:', dbError);
                return res.status(500).json({ error: 'Failed to update profile' });
            }

            console.log(`[Verify] Updated user ${user.id}: tier=${tier}, status=${subStatus}`);
            return res.status(200).json({ tier, subscription_status: subStatus });
        }

        // ---------------------------------------------------------------
        // Cancel / Reactivate existing subscription
        // ---------------------------------------------------------------
        if (action) {
            if (!['cancel', 'reactivate'].includes(action)) {
                return res.status(400).json({ error: 'Invalid action. Must be "cancel" or "reactivate".' });
            }

            const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (!supabaseUrl || !serviceRoleKey) {
                return res.status(500).json({ error: 'Server configuration error' });
            }

            const supabase = createClient(supabaseUrl, serviceRoleKey);
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_id')
                .eq('id', user.id)
                .single();

            if (!profile?.subscription_id) {
                return res.status(400).json({ error: 'No active subscription found' });
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
            return res.status(200).json({ success: true, action: resultAction });
        }

        // ---------------------------------------------------------------
        // Create new subscription
        // ---------------------------------------------------------------
        if (!plan || !PLANS[plan]) {
            return res.status(400).json({ error: 'Invalid plan. Must be "monthly" or "annual".' });
        }

        const config = PLANS[plan];
        const appUrl = process.env.APP_URL || 'https://linguacore-zeta.vercel.app';
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

        return res.status(200).json({ init_point: result.init_point });
    } catch (error: any) {
        console.error('[Payments] Error:', error);
        return res.status(500).json({ error: 'Failed to process subscription request' });
    }
}
