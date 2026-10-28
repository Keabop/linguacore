import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
    getSession: vi.fn(),
    refreshSession: vi.fn(),
    signOut: vi.fn(),
}));
vi.mock('./supabase', () => ({ supabase: { auth } }));
vi.mock('./toast', () => ({ toast: { error: vi.fn() } }));

import { apiFetch, SessionEndedError } from './apiFetch';

const reply = (status: number) => new Response('{}', { status });
const tokenOf = (call: unknown[]) => (call[1] as RequestInit).headers as Record<string, string>;

describe('apiFetch', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
        auth.getSession.mockResolvedValue({ data: { session: { access_token: 'old' } } });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('sends the access token', async () => {
        fetchMock.mockResolvedValueOnce(reply(200));
        const res = await apiFetch('/api/usage');
        expect(res.status).toBe(200);
        expect(tokenOf(fetchMock.mock.calls[0]).Authorization).toBe('Bearer old');
    });

    it('refreshes a rejected token and repeats the call once', async () => {
        fetchMock.mockResolvedValueOnce(reply(401)).mockResolvedValueOnce(reply(200));
        auth.refreshSession.mockResolvedValue({ data: { session: { access_token: 'new' } }, error: null });
        const res = await apiFetch('/api/orchestrator', { method: 'POST' });
        expect(res.status).toBe(200);
        expect(tokenOf(fetchMock.mock.calls[1]).Authorization).toBe('Bearer new');
        expect(auth.signOut).not.toHaveBeenCalled();
    });

    it('signs out this device when the session is gone (revoked from another device)', async () => {
        fetchMock.mockResolvedValueOnce(reply(401));
        auth.refreshSession.mockResolvedValue({ data: { session: null }, error: new Error('Invalid Refresh Token') });
        await expect(apiFetch('/api/orchestrator')).rejects.toBeInstanceOf(SessionEndedError);
        expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    });

    it('leaves other errors to the caller', async () => {
        fetchMock.mockResolvedValueOnce(reply(500));
        const res = await apiFetch('/api/orchestrator');
        expect(res.status).toBe(500);
        expect(auth.refreshSession).not.toHaveBeenCalled();
    });
});
