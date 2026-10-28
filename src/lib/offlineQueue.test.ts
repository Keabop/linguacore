import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { enqueue, getPendingCount, processQueue } from './offlineQueue';

vi.mock('idb-keyval', () => ({ get: vi.fn(async () => undefined), set: vi.fn(async () => undefined) }));

/** A Supabase stand-in that records each write and answers with `error`. */
function fakeSupabase(error: { code: string } | null = null) {
    const calls: { table: string; op: string; options?: unknown }[] = [];
    const client = {
        from: (table: string) => ({
            insert: async () => { calls.push({ table, op: 'insert' }); return { error }; },
            upsert: async (_: unknown, options: unknown) => { calls.push({ table, op: 'upsert', options }); return { error }; },
        }),
    } as unknown as SupabaseClient;
    return { client, calls };
}

describe('processQueue', () => {
    beforeEach(async () => {
        // Empty whatever a previous test left
        await processQueue(fakeSupabase().client);
    });

    it('upserts an insert on its own unique columns', async () => {
        await enqueue({ table: 'cards', operation: 'insert', data: { word_id: 'hello' }, onConflict: 'user_id,word_id', ignoreDuplicates: true });
        const { client, calls } = fakeSupabase();
        await processQueue(client);
        expect(calls).toEqual([{ table: 'cards', op: 'upsert', options: { onConflict: 'user_id,word_id', ignoreDuplicates: true } }]);
    });

    it('inserts plainly when no unique columns are given, and keeps unit_progress rows queued before', async () => {
        await enqueue({ table: 'error_cards', operation: 'insert', data: {} });
        await enqueue({ table: 'unit_progress', operation: 'insert', data: {} });
        const { client, calls } = fakeSupabase();
        await processQueue(client);
        expect(calls.map(c => `${c.table}:${c.op}`)).toEqual(['error_cards:insert', 'unit_progress:upsert']);
    });

    it('drops a row that already exists instead of retrying it forever', async () => {
        await enqueue({ table: 'read_stories', operation: 'insert', data: {} });
        await processQueue(fakeSupabase({ code: '23505' }).client);
        expect(getPendingCount()).toBe(0);
    });

    it('keeps a row that failed for another reason', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        await enqueue({ table: 'read_stories', operation: 'insert', data: {} });
        await processQueue(fakeSupabase({ code: '08006' }).client);
        expect(getPendingCount()).toBe(1);
    });
});
