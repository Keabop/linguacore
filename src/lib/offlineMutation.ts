import { supabase } from './supabase';
import { enqueue } from './offlineQueue';

/**
 * Execute a Supabase INSERT. If offline, queue it for later sync.
 * @returns true if executed immediately, false if queued.
 */
export async function offlineInsert(
    table: string,
    data: Record<string, unknown>,
): Promise<boolean> {
    if (navigator.onLine) {
        const { error } = await (supabase.from(table) as any).insert(data);
        if (error) throw error;
        return true;
    }
    await enqueue({ table, operation: 'insert', data });
    return false;
}

/**
 * Execute a Supabase UPDATE with .eq() filters. If offline, queue it.
 * @returns true if executed immediately, false if queued.
 */
export async function offlineUpdate(
    table: string,
    data: Record<string, unknown>,
    match: Record<string, unknown>,
): Promise<boolean> {
    if (navigator.onLine) {
        let query = (supabase.from(table) as any).update(data);
        for (const [key, value] of Object.entries(match)) {
            query = query.eq(key, value);
        }
        const { error } = await query;
        if (error) throw error;
        return true;
    }
    await enqueue({ table, operation: 'update', data, match });
    return false;
}
