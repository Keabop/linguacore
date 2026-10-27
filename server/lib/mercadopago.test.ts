// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { findLatestPreapproval, getPreapproval, mapSubscriptionStatus } from './mercadopago';

function mockFetch(body: unknown, status = 200) {
    const fn = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
    vi.stubGlobal('fetch', fn);
    return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('mapSubscriptionStatus', () => {
    it('gives Pro only to an authorized subscription', () => {
        expect(mapSubscriptionStatus('authorized')).toEqual({ tier: 'pro', subscription_status: 'active' });
    });

    it('keeps Pro while a payment is paused', () => {
        expect(mapSubscriptionStatus('paused')).toEqual({ tier: 'pro', subscription_status: 'past_due' });
    });

    it('drops to free when cancelled', () => {
        expect(mapSubscriptionStatus('cancelled')).toEqual({ tier: 'free', subscription_status: 'cancelled' });
    });

    it('does not touch the tier while pending', () => {
        expect(mapSubscriptionStatus('pending')).toEqual({ tier: null, subscription_status: 'pending' });
        expect(mapSubscriptionStatus('')).toEqual({ tier: null, subscription_status: 'pending' });
    });
});

describe('Mercado Pago client', () => {
    it('sends the token and encodes the id', async () => {
        const fetch = mockFetch({ id: 'a/b', status: 'authorized' });
        await getPreapproval('token-1', 'a/b');
        const [url, init] = fetch.mock.calls[0];
        expect(url).toBe('https://api.mercadopago.com/preapproval/a%2Fb');
        expect(init.headers.Authorization).toBe('Bearer token-1');
    });

    it('throws with the status when the API fails', async () => {
        mockFetch({ message: 'not found' }, 404);
        await expect(getPreapproval('token-1', 'x')).rejects.toThrow(/404/);
    });

    it('searches the newest subscription of a user', async () => {
        const fetch = mockFetch({ results: [{ id: 'sub-2' }] });
        await expect(findLatestPreapproval('token-1', 'user-1')).resolves.toEqual({ id: 'sub-2' });
        const url = new URL(fetch.mock.calls[0][0]);
        expect(url.searchParams.get('external_reference')).toBe('user-1');
        expect(url.searchParams.get('criteria')).toBe('desc');
    });

    it('returns null when the user has no subscription', async () => {
        mockFetch({ results: [] });
        await expect(findLatestPreapproval('token-1', 'user-1')).resolves.toBeNull();
    });
});
