// @vitest-environment node
import { createHmac } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const update = vi.fn();
const eq = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({ from: () => ({ update: (fields: unknown) => { update(fields); return { eq }; } }) }),
}));

const getPreapproval = vi.fn();
vi.mock('../../../server/lib/mercadopago.js', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../../../server/lib/mercadopago')>()),
    getPreapproval,
}));

const { onRequestPost } = await import('./webhook');

const SECRET = 'whsec';
const BASE = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service', MERCADOPAGO_ACCESS_TOKEN: 'mp' };

function notify({ id = 'sub-1', bodyId = id, secret, signWith }: { id?: string; bodyId?: string; secret?: string; signWith?: string } = {}) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-request-id': 'req-1' };
    if (signWith) {
        const ts = '1704908010';
        const v1 = createHmac('sha256', signWith).update(`id:${id};request-id:req-1;ts:${ts};`).digest('hex');
        headers['x-signature'] = `ts=${ts},v1=${v1}`;
    }
    const request = new Request(`https://voxie.pages.dev/api/payments/webhook?data.id=${id}&type=subscription_preapproval`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: 'subscription_preapproval', data: { id: bodyId } }),
    });
    const env = secret ? { ...BASE, MERCADOPAGO_WEBHOOK_SECRET: secret } : BASE;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return onRequestPost({ request, env } as any);
}

beforeEach(() => {
    vi.clearAllMocks();
    eq.mockResolvedValue({ error: null });
    getPreapproval.mockResolvedValue({ id: 'sub-1', status: 'authorized', external_reference: 'user-1' });
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('Mercado Pago webhook', () => {
    it('upgrades the user when the signature is valid', async () => {
        const res = await notify({ secret: SECRET, signWith: SECRET });
        expect(res.status).toBe(200);
        expect(update).toHaveBeenCalledWith({ tier: 'pro', subscription_id: 'sub-1', subscription_status: 'active' });
        expect(eq).toHaveBeenCalledWith('id', 'user-1');
    });

    it('rejects a forged notification without asking Mercado Pago', async () => {
        const res = await notify({ secret: SECRET, signWith: 'attacker' });
        expect(res.status).toBe(401);
        expect(getPreapproval).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });

    it('processes the signed id, not a different one slipped into the body', async () => {
        const res = await notify({ secret: SECRET, signWith: SECRET, bodyId: 'someone-else' });
        expect(res.status).toBe(200);
        expect(getPreapproval).toHaveBeenCalledWith('mp', 'sub-1');
    });

    it('rejects an unsigned notification once the secret is set', async () => {
        const res = await notify({ secret: SECRET });
        expect(res.status).toBe(401);
    });

    it('still works without the secret, re-checking with Mercado Pago', async () => {
        const res = await notify();
        expect(res.status).toBe(200);
        expect(getPreapproval).toHaveBeenCalledWith('mp', 'sub-1');
    });

    it('ignores events that are not subscriptions', async () => {
        const request = new Request('https://voxie.pages.dev/api/payments/webhook', {
            method: 'POST',
            body: JSON.stringify({ type: 'payment', data: { id: '1' } }),
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await onRequestPost({ request, env: BASE } as any);
        expect(await res.json()).toEqual({ received: true, ignored: true });
        expect(getPreapproval).not.toHaveBeenCalled();
    });
});
