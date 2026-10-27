// Minimal Mercado Pago preapproval client over fetch. The official SDK needs Node's
// crypto, which Cloudflare only provides with nodejs_compat and a recent compat date.

const API_BASE = 'https://api.mercadopago.com/preapproval';

export interface Preapproval {
    id?: string;
    status?: string;
    external_reference?: string;
    init_point?: string;
}

async function request<T>(accessToken: string, path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            ...init.headers,
        },
    });

    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Mercado Pago ${init.method ?? 'GET'} ${path} failed: ${res.status} ${detail.slice(0, 300)}`);
    }

    return res.json() as Promise<T>;
}

export function createPreapproval(accessToken: string, body: Record<string, unknown>): Promise<Preapproval> {
    return request<Preapproval>(accessToken, '', {
        method: 'POST',
        headers: { 'X-Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(body),
    });
}

export function getPreapproval(accessToken: string, id: string): Promise<Preapproval> {
    return request<Preapproval>(accessToken, `/${encodeURIComponent(id)}`);
}

export function updatePreapproval(accessToken: string, id: string, body: Record<string, unknown>): Promise<Preapproval> {
    return request<Preapproval>(accessToken, `/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

export async function findLatestPreapproval(accessToken: string, userId: string): Promise<Preapproval | null> {
    const params = new URLSearchParams({
        external_reference: userId,
        sort: 'date_created',
        criteria: 'desc',
        limit: '1',
    });
    const data = await request<{ results?: Preapproval[] }>(accessToken, `/search?${params}`);
    return data.results?.[0] ?? null;
}

/** Maps a Mercado Pago preapproval status to profile fields. `tier: null` keeps the current tier. */
export function mapSubscriptionStatus(mpStatus: string): { tier: 'free' | 'pro' | null; subscription_status: string } {
    switch (mpStatus) {
        case 'authorized':
            return { tier: 'pro', subscription_status: 'active' };
        case 'paused':
            return { tier: 'pro', subscription_status: 'past_due' };
        case 'cancelled':
            return { tier: 'free', subscription_status: 'cancelled' };
        default:
            // pending, etc. — not paid yet: keep the current tier
            return { tier: null, subscription_status: 'pending' };
    }
}
