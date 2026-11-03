// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getUser = vi.fn();
const deleteUser = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({ auth: { getUser, admin: { deleteUser } } }),
}));

const findPreapprovals = vi.fn();
const getPreapproval = vi.fn();
const updatePreapproval = vi.fn();
vi.mock('../../../server/lib/mercadopago.js', () => ({ findPreapprovals, getPreapproval, updatePreapproval }));

const { onRequestPost } = await import('./delete');

const BINDINGS = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service', MERCADOPAGO_ACCESS_TOKEN: 'mp' };

async function call(token: string | null = 'valid') {
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const request = new Request('https://voxie.pages.dev/api/account/delete', { method: 'POST', headers });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await onRequestPost({ request, env: BINDINGS } as any);
    return { status: res.status, body: await res.json() as Record<string, unknown> };
}

beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    deleteUser.mockResolvedValue({ error: null });
    findPreapprovals.mockResolvedValue([]);
    updatePreapproval.mockResolvedValue({});
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('account deletion', () => {
    it('asks for a session', async () => {
        expect((await call(null)).status).toBe(401);
        expect(deleteUser).not.toHaveBeenCalled();
    });

    it('deletes only the caller, with no subscription to cancel', async () => {
        expect(await call()).toEqual({ status: 200, body: { deleted: true } });
        expect(findPreapprovals).toHaveBeenCalledWith('mp', 'user-1');
        expect(updatePreapproval).not.toHaveBeenCalled();
        expect(deleteUser).toHaveBeenCalledWith('user-1');
    });

    it('cancels every open subscription before deleting, even one the profile never recorded', async () => {
        findPreapprovals.mockResolvedValue([
            { id: 'sub-3', status: 'authorized' },
            { id: 'sub-2', status: 'cancelled' },
            { id: 'sub-1', status: 'pending' },
        ]);
        await call();
        expect(updatePreapproval.mock.calls).toEqual([['mp', 'sub-3', { status: 'cancelled' }], ['mp', 'sub-1', { status: 'cancelled' }]]);
        expect(deleteUser).toHaveBeenCalled();
    });

    it('keeps the account when Mercado Pago refuses to cancel', async () => {
        findPreapprovals.mockResolvedValue([{ id: 'sub-1', status: 'authorized' }]);
        updatePreapproval.mockRejectedValue(new Error('Mercado Pago PUT failed: 500'));
        getPreapproval.mockResolvedValue({ id: 'sub-1', status: 'authorized' });
        expect(await call()).toEqual({ status: 502, body: { error: 'subscription_cancel_failed' } });
        expect(deleteUser).not.toHaveBeenCalled();
    });

    it('goes on when the subscription was already cancelled in Mercado Pago', async () => {
        findPreapprovals.mockResolvedValue([{ id: 'sub-1', status: 'authorized' }]);
        updatePreapproval.mockRejectedValue(new Error('Mercado Pago PUT failed: 400'));
        getPreapproval.mockResolvedValue({ id: 'sub-1', status: 'cancelled' });
        expect((await call()).status).toBe(200);
        expect(deleteUser).toHaveBeenCalledWith('user-1');
    });

    it('keeps the account when Mercado Pago cannot be searched', async () => {
        findPreapprovals.mockRejectedValue(new Error('Mercado Pago GET failed: 503'));
        expect((await call()).status).toBe(502);
        expect(deleteUser).not.toHaveBeenCalled();
    });
});
