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
// Auth — same pattern as create-subscription.ts
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
        const { action } = req.body as { action: 'cancel' | 'reactivate' };

        if (!action || !['cancel', 'reactivate'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action. Must be "cancel" or "reactivate".' });
        }

        // Fetch user profile to get subscription_id (using service role to bypass RLS)
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
            console.error('[CancelSub] Missing Supabase config');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile?.subscription_id) {
            return res.status(400).json({ error: 'No active subscription found' });
        }

        // Update subscription status via Mercado Pago
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('[CancelSub] Missing MERCADOPAGO_ACCESS_TOKEN');
            return res.status(500).json({ error: 'Payment provider not configured' });
        }

        const client = new MercadoPagoConfig({ accessToken });
        const preApproval = new PreApproval(client);

        const newMpStatus = action === 'cancel' ? 'cancelled' : 'authorized';

        await preApproval.update({
            id: profile.subscription_id,
            body: { status: newMpStatus },
        });

        // Update profile subscription_status
        // On cancel: keep tier as 'pro' — webhook handles downgrade when billing period ends
        // On reactivate: set status to 'active'
        const newSubscriptionStatus = action === 'cancel' ? 'cancelled' : 'active';

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ subscription_status: newSubscriptionStatus })
            .eq('id', user.id);

        if (updateError) {
            console.error('[CancelSub] Failed to update profile:', updateError);
            return res.status(500).json({ error: 'Failed to update profile' });
        }

        const resultAction = action === 'cancel' ? 'cancelled' : 'reactivated';
        console.log(`[CancelSub] User ${user.id}: subscription ${resultAction}`);

        return res.status(200).json({ success: true, action: resultAction });
    } catch (error: any) {
        console.error('[CancelSub] Error:', error);
        return res.status(500).json({ error: 'Failed to update subscription' });
    }
}
