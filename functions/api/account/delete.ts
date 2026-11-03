import { createClient } from '@supabase/supabase-js';
import { authenticateRequest } from '../../../server/lib/auth.js';
import { env, setEnv } from '../../../server/lib/config.js';
import { getCorsHeaders } from '../../../server/lib/cors.js';
import { findPreapprovals, getPreapproval, updatePreapproval } from '../../../server/lib/mercadopago.js';

/**
 * Deletes the caller's account and, through ON DELETE CASCADE, every row of theirs. Every
 * subscription of theirs still open in Mercado Pago is cancelled first, found by the user id
 * it carries and not by the profile, which may not know a subscription whose webhook never
 * arrived. If one can't be cancelled, nothing is deleted: the learner is never charged for an
 * account that no longer exists.
 */
export const onRequestPost: PagesFunction = async (context) => {
    const { request, env: bindings } = context;
    setEnv(bindings);
    const corsHeaders = getCorsHeaders(request, 'POST, OPTIONS');
    const json = (status: number, body: Record<string, unknown>) =>
        new Response(JSON.stringify(body), { status, headers: corsHeaders });

    const auth = await authenticateRequest(request);
    if ('response' in auth) return auth.response(corsHeaders);
    const { user } = auth;

    const accessToken = env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('[Account delete] Missing MERCADOPAGO_ACCESS_TOKEN');
        return json(500, { error: 'Payment provider not configured' });
    }

    try {
        const open = (await findPreapprovals(accessToken, user.id)).filter(sub => sub.id && sub.status !== 'cancelled');
        for (const sub of open) {
            try {
                await updatePreapproval(accessToken, sub.id!, { status: 'cancelled' });
            } catch (error) {
                // Cancelled meanwhile (from Mercado Pago itself, say): nothing left to stop
                if ((await getPreapproval(accessToken, sub.id!)).status !== 'cancelled') throw error;
            }
        }
    } catch (error) {
        console.error('[Account delete] Subscription cancel failed:', error);
        return json(502, { error: 'subscription_cancel_failed' });
    }

    const supabase = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
        console.error('[Account delete] Delete failed:', error);
        return json(500, { error: 'Failed to delete the account' });
    }
    return json(200, { deleted: true });
};

export const onRequestOptions: PagesFunction = async ({ request }) =>
    new Response(null, { status: 204, headers: getCorsHeaders(request, 'POST, OPTIONS') });
