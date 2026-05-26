import { createClient } from '@supabase/supabase-js';
import type { AgentType } from './gemini.js';
import { env } from './config.js';

const CACHEABLE_AGENTS: AgentType[] = [
    'story-generator',
    'vocab-enricher',
    'exercise-creator',
];

function getSupabaseAdmin() {
    const url = env.SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
}

/** Check whether an agent's responses can be cached */
export function isCacheable(agent: AgentType): boolean {
    return CACHEABLE_AGENTS.includes(agent);
}

/** Deterministic 64-bit string hash (MurmurHash3-like) - synchronous and zero-dependency */
function hashString(str: string): string {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

/** Generate a deterministic cache key from agent name + params (excluding user-specific fields) */
export function generateCacheKey(agent: AgentType, params: Record<string, any>): string {
    // Strip user-specific / non-deterministic fields
    const { messages, userId, user_id, ...cacheable } = params ?? {};
    const payload = `${agent}:${JSON.stringify(cacheable)}`;
    return hashString(payload);
}

/** Look up a cached response. Returns the response object or null. */
export async function getCachedResponse(cacheKey: string): Promise<any | null> {
    try {
        const sb = getSupabaseAdmin();
        if (!sb) return null;

        const { data, error } = await sb
            .from('ai_cache')
            .select('response')
            .eq('cache_key', cacheKey)
            .maybeSingle();

        if (error || !data) return null;

        // Fire-and-forget: bump hit_count & last_hit_at
        Promise.resolve(
            sb.from('ai_cache')
                .select('hit_count')
                .eq('cache_key', cacheKey)
                .maybeSingle()
        ).then(({ data: row }) => {
            if (!row) return;
            sb.from('ai_cache')
                .update({
                    hit_count: (row.hit_count ?? 0) + 1,
                    last_hit_at: new Date().toISOString(),
                })
                .eq('cache_key', cacheKey)
                .then(() => {});
        }).catch(() => {});

        return data.response;
    } catch {
        return null;
    }
}

/** Store a response in the cache (upsert). */
export async function setCachedResponse(
    cacheKey: string,
    agent: AgentType,
    paramsHash: string,
    response: any,
): Promise<void> {
    try {
        const sb = getSupabaseAdmin();
        if (!sb) return;

        await sb.from('ai_cache').upsert(
            {
                cache_key: cacheKey,
                agent,
                params_hash: paramsHash,
                response,
                hit_count: 0,
                last_hit_at: new Date().toISOString(),
            },
            { onConflict: 'cache_key' },
        );
    } catch {
        // Cache write failure is non-critical — request still succeeds
    }
}
