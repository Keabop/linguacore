import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
    'https://linguacore-zeta.vercel.app',
    'https://voxie.lat',
    'https://www.voxie.lat',
    'http://localhost:5173',
    'http://localhost:4173',
];

function getCorsOrigin(req: VercelRequest): string {
    const origin = req.headers.origin ?? '';
    return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
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
// Handler — NO auth required (Mercado Pago sends webhooks directly)
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const corsOrigin = getCorsOrigin(req);
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // MP requires 200 for ALL events, even ones we don't handle
    if (req.method !== 'POST') {
        return res.status(200).end();
    }

    try {
        const { type, data } = req.body as { type?: string; data?: { id?: string } };

        // Only handle subscription_preapproval events
        if (type !== 'subscription_preapproval' || !data?.id) {
            return res.status(200).json({ received: true });
        }

        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('[Webhook] Missing MERCADOPAGO_ACCESS_TOKEN');
            return res.status(200).json({ received: true });
        }

        // Fetch subscription details from MP
        const client = new MercadoPagoConfig({ accessToken });
        const preApproval = new PreApproval(client);
        const subscription = await preApproval.get({ id: data.id });

        const userId = subscription.external_reference;
        if (!userId) {
            console.error('[Webhook] No external_reference in subscription:', data.id);
            return res.status(200).json({ received: true });
        }

        // Map MP status to our profile fields
        const { tier, subscription_status } = mapSubscriptionStatus(subscription.status ?? '');

        // Update profile using service role key (bypasses RLS)
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
            console.error('[Webhook] Missing Supabase config');
            return res.status(200).json({ received: true });
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
            console.error('[Webhook] Failed to update profile:', error);
        } else {
            console.log(`[Webhook] Updated user ${userId}: tier=${tier}, status=${subscription_status}`);
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('[Webhook] Error processing webhook:', error);
        // Always return 200 so MP doesn't retry indefinitely
        return res.status(200).json({ received: true });
    }
}
