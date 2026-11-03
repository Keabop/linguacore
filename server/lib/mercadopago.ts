// Minimal Mercado Pago preapproval client over fetch. The official SDK needs Node's
// crypto, which Cloudflare only provides with nodejs_compat and a recent compat date.

const API_BASE = 'https://api.mercadopago.com/preapproval';

export interface Preapproval {
    id?: string;
    status?: string;
    external_reference?: string;
    init_point?: string;
    /** Date of the next charge: while authorized, the end of the period already paid. */
    next_payment_date?: string;
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

/** Every subscription a user ever started, newest first (the first page is plenty for one person). */
export async function findPreapprovals(accessToken: string, userId: string): Promise<Preapproval[]> {
    const params = new URLSearchParams({ external_reference: userId, sort: 'date_created', criteria: 'desc', limit: '100' });
    const data = await request<{ results?: Preapproval[] }>(accessToken, `/search?${params}`);
    return data.results ?? [];
}

/**
 * Maps a Mercado Pago preapproval status to profile fields. `tier: null` keeps the current tier.
 * A cancelled subscription keeps Pro until `paidUntil`, the end of the period already paid,
 * when that date is still ahead; the app reads the tier as free once `pro_until` passes.
 */
export function mapSubscriptionStatus(
    mpStatus: string,
    paidUntil?: string | null,
    now = new Date(),
): { tier: 'free' | 'pro' | null; subscription_status: string; pro_until: string | null } {
    switch (mpStatus) {
        case 'authorized':
            return { tier: 'pro', subscription_status: 'active', pro_until: null };
        case 'paused':
            return { tier: 'pro', subscription_status: 'past_due', pro_until: null };
        case 'cancelled': {
            const keepsPro = !!paidUntil && new Date(paidUntil) > now;
            return { tier: keepsPro ? 'pro' : 'free', subscription_status: 'cancelled', pro_until: keepsPro ? paidUntil! : null };
        }
        default:
            // pending, etc. — not paid yet: keep the current tier
            return { tier: null, subscription_status: 'pending', pro_until: null };
    }
}

/** The tier a profile gives today: a cancelled Pro lasts until `pro_until`. */
export function currentTier(profile: { tier?: string | null; subscription_status?: string | null; pro_until?: string | null }, now = new Date()): string {
    const tier = profile.tier ?? 'free';
    if (tier === 'pro' && profile.subscription_status === 'cancelled' && !(profile.pro_until && new Date(profile.pro_until) > now)) return 'free';
    return tier;
}
