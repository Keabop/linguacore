// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { currentTier, findLatestPreapproval, findPreapprovals, getPreapproval, mapSubscriptionStatus } from './mercadopago';

function mockFetch(body: unknown, status = 200) {
    const fn = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
    vi.stubGlobal('fetch', fn);
    return fn;
}

afterEach(() => vi.unstubAllGlobals());

const NOW = new Date('2026-11-03T12:00:00Z');

describe('mapSubscriptionStatus', () => {
    it('gives Pro only to an authorized subscription', () => {
        expect(mapSubscriptionStatus('authorized')).toEqual({ tier: 'pro', subscription_status: 'active', pro_until: null });
    });

    it('keeps Pro while a payment is paused', () => {
        expect(mapSubscriptionStatus('paused')).toEqual({ tier: 'pro', subscription_status: 'past_due', pro_until: null });
    });

    it('keeps Pro until the end of the paid period when cancelled', () => {
        expect(mapSubscriptionStatus('cancelled', '2026-11-20T00:00:00Z', NOW))
            .toEqual({ tier: 'pro', subscription_status: 'cancelled', pro_until: '2026-11-20T00:00:00Z' });
    });

    it('drops to free when cancelled with no paid period left', () => {
        expect(mapSubscriptionStatus('cancelled', null, NOW)).toEqual({ tier: 'free', subscription_status: 'cancelled', pro_until: null });
        expect(mapSubscriptionStatus('cancelled', '2026-11-01T00:00:00Z', NOW)).toEqual({ tier: 'free', subscription_status: 'cancelled', pro_until: null });
    });

    it('does not touch the tier while pending', () => {
        expect(mapSubscriptionStatus('pending')).toEqual({ tier: null, subscription_status: 'pending', pro_until: null });
        expect(mapSubscriptionStatus('')).toEqual({ tier: null, subscription_status: 'pending', pro_until: null });
    });
});

describe('currentTier', () => {
    it('reads a cancelled Pro as free once its paid period is over', () => {
        expect(currentTier({ tier: 'pro', subscription_status: 'cancelled', pro_until: '2026-11-20T00:00:00Z' }, NOW)).toBe('pro');
        expect(currentTier({ tier: 'pro', subscription_status: 'cancelled', pro_until: '2026-11-01T00:00:00Z' }, NOW)).toBe('free');
        expect(currentTier({ tier: 'pro', subscription_status: 'cancelled', pro_until: null }, NOW)).toBe('free');
    });

    it('leaves an active or free profile as it is', () => {
        expect(currentTier({ tier: 'pro', subscription_status: 'active' }, NOW)).toBe('pro');
        expect(currentTier({ tier: null }, NOW)).toBe('free');
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

    it('lists every subscription of a user for the account deletion', async () => {
        const fetch = mockFetch({ results: [{ id: 'sub-2' }, { id: 'sub-1' }] });
        await expect(findPreapprovals('token-1', 'user-1')).resolves.toEqual([{ id: 'sub-2' }, { id: 'sub-1' }]);
        expect(new URL(fetch.mock.calls[0][0]).searchParams.get('external_reference')).toBe('user-1');
    });

    it('returns null when the user has no subscription', async () => {
        mockFetch({ results: [] });
        await expect(findLatestPreapproval('token-1', 'user-1')).resolves.toBeNull();
    });
});
