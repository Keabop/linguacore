// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getUser = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({ auth: { getUser } }),
}));

const agents = vi.hoisted(() => ({
    chat: vi.fn(),
    generateStory: vi.fn(),
    enrichVocabulary: vi.fn(),
}));
vi.mock('../../server/agents/conversation-tutor.js', () => ({ chat: agents.chat }));
vi.mock('../../server/agents/story-generator.js', () => ({ generateStory: agents.generateStory }));
vi.mock('../../server/agents/vocab-enricher.js', () => ({ enrichVocabulary: agents.enrichVocabulary }));

const usage = vi.hoisted(() => ({
    checkUsageLimit: vi.fn(),
    checkWeeklyLimit: vi.fn(),
    incrementUsage: vi.fn(),
    getUserTier: vi.fn(),
}));
vi.mock('../../server/lib/usageLimits.js', () => usage);

const cache = vi.hoisted(() => ({
    isCacheable: vi.fn(() => false),
    generateCacheKey: vi.fn(() => 'key'),
    getCachedResponse: vi.fn(),
    setCachedResponse: vi.fn(() => Promise.resolve()),
}));
vi.mock('../../server/lib/aiCache.js', () => cache);

const { onRequestPost } = await import('./orchestrator');

const BINDINGS = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service' };
let ipCounter = 0;

/** Each call gets its own IP so the in-memory rate limiter never interferes. */
async function call(body: unknown, { token = 'valid', ip }: { token?: string | null; ip?: string } = {}) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip ?? `10.0.0.${++ipCounter}` };
    if (token) headers.Authorization = `Bearer ${token}`;
    const request = new Request('https://voxie.pages.dev/api/orchestrator', {
        method: 'POST',
        headers,
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await onRequestPost({ request, env: BINDINGS } as any);
    return { status: res.status, body: await res.json() as Record<string, any> };
}

beforeEach(() => {
    vi.clearAllMocks();
    cache.isCacheable.mockReturnValue(false);
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    usage.getUserTier.mockResolvedValue('free');
    usage.checkUsageLimit.mockResolvedValue({ allowed: true, remaining: 4, limit: 5 });
    usage.checkWeeklyLimit.mockResolvedValue({ allowed: true, remaining: 1, limit: 1 });
    usage.incrementUsage.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('orchestrator', () => {
    it('asks for a session', async () => {
        const res = await call({ agent: 'vocab-enricher', params: {} }, { token: null });
        expect(res.status).toBe(401);
    });

    it('rejects an invalid session', async () => {
        getUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('jwt expired') });
        const res = await call({ agent: 'vocab-enricher', params: {} });
        expect(res.status).toBe(401);
    });

    it('rejects an unknown agent', async () => {
        const res = await call({ agent: 'shell', params: {} });
        expect(res.status).toBe(400);
    });

    it('rejects input that is too large', async () => {
        const res = await call({ agent: 'vocab-enricher', params: { word: 'x'.repeat(101) } });
        expect(res).toMatchObject({ status: 400, body: { error: 'input_too_large' } });
        expect(agents.enrichVocabulary).not.toHaveBeenCalled();
    });

    it('stops a free user at the daily tutor limit', async () => {
        usage.checkUsageLimit.mockResolvedValueOnce({ allowed: false, remaining: 0, limit: 5 });
        const res = await call({ agent: 'conversation-tutor', params: { messages: [{ role: 'user', content: 'hi' }] } });
        expect(res).toMatchObject({ status: 429, body: { error: 'daily_limit_reached' } });
        expect(agents.chat).not.toHaveBeenCalled();
    });

    it('stops a free user at the weekly story limit', async () => {
        usage.checkWeeklyLimit.mockResolvedValueOnce({ allowed: false, remaining: 0, limit: 1 });
        const res = await call({ agent: 'story-generator', params: { topic: 'cats' } });
        expect(res).toMatchObject({ status: 429, body: { error: 'weekly_limit_reached' } });
    });

    it('gives the admin Pro limits without a paid tier', async () => {
        getUser.mockResolvedValueOnce({ data: { user: { id: 'user-1', app_metadata: { role: 'admin' } } }, error: null });
        agents.chat.mockResolvedValueOnce({ reply: 'Hi!', corrections: [], suggestions: [] });
        await call({ agent: 'conversation-tutor', params: { messages: [{ role: 'user', content: 'hi' }] } });
        expect(usage.checkUsageLimit).toHaveBeenCalledWith('user-1', 'conversation-tutor', 'pro');
    });

    it('ignores an admin role in user_metadata, which the user can edit', async () => {
        getUser.mockResolvedValueOnce({ data: { user: { id: 'user-1', app_metadata: {}, user_metadata: { role: 'admin' } } }, error: null });
        agents.chat.mockResolvedValueOnce({ reply: 'Hi!', corrections: [], suggestions: [] });
        await call({ agent: 'conversation-tutor', params: { messages: [{ role: 'user', content: 'hi' }] } });
        expect(usage.checkUsageLimit).toHaveBeenCalledWith('user-1', 'conversation-tutor', 'free');
    });

    it('runs the agent and counts the tutor message', async () => {
        agents.chat.mockResolvedValueOnce({ reply: 'Hi!', corrections: [], suggestions: [] });
        const res = await call({ agent: 'conversation-tutor', params: { messages: [{ role: 'user', content: 'hi' }] } });
        expect(res).toEqual({ status: 200, body: { reply: 'Hi!', corrections: [], suggestions: [] } });
        expect(usage.incrementUsage).toHaveBeenCalledWith('user-1', 'conversation-tutor');
    });

    it('answers from the cache without calling the model', async () => {
        cache.isCacheable.mockReturnValue(true);
        cache.getCachedResponse.mockResolvedValueOnce({ word: 'cat' });
        const res = await call({ agent: 'vocab-enricher', params: { word: 'cat' } });
        expect(res).toEqual({ status: 200, body: { word: 'cat' } });
        expect(agents.enrichVocabulary).not.toHaveBeenCalled();
    });

    it('explains invalid JSON from the model', async () => {
        agents.enrichVocabulary.mockRejectedValueOnce(new SyntaxError('Unexpected token'));
        const res = await call({ agent: 'vocab-enricher', params: { word: 'cat' } });
        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/invalid JSON/);
    });

    it('limits requests per IP', async () => {
        agents.enrichVocabulary.mockResolvedValue({});
        const statuses: number[] = [];
        for (let i = 0; i < 31; i++) statuses.push((await call({ agent: 'vocab-enricher', params: {} }, { ip: '192.0.2.1' })).status);
        expect(statuses.slice(0, 30).every(s => s === 200)).toBe(true);
        expect(statuses[30]).toBe(429);
    });
});
