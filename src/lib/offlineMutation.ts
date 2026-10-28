import { supabase } from './supabase';
import { enqueue } from './offlineQueue';

/** Insert as an upsert on these unique columns; `ignoreDuplicates` keeps rows already there. */
export interface ConflictOptions {
    onConflict: string;
    ignoreDuplicates?: boolean;
}

function write(table: string, rows: Record<string, unknown> | Record<string, unknown>[], conflict?: ConflictOptions) {
    const query = supabase.from(table) as any;
    return conflict
        ? query.upsert(rows, { onConflict: conflict.onConflict, ignoreDuplicates: conflict.ignoreDuplicates ?? false })
        : query.insert(rows);
}

/**
 * Execute a Supabase INSERT. If offline, queue it for later sync.
 * @returns true if executed immediately, false if queued.
 */
export async function offlineInsert(
    table: string,
    data: Record<string, unknown>,
    conflict?: ConflictOptions,
): Promise<boolean> {
    if (navigator.onLine) {
        const { error } = await write(table, data, conflict);
        if (error) throw error;
        return true;
    }
    await enqueue({ table, operation: 'insert', data, ...conflict });
    return false;
}

/**
 * Execute a Supabase INSERT of several rows in one request. If offline, each row is queued.
 * @returns true if executed immediately, false if queued.
 */
export async function offlineInsertMany(
    table: string,
    rows: Record<string, unknown>[],
    conflict?: ConflictOptions,
): Promise<boolean> {
    if (navigator.onLine) {
        const { error } = await write(table, rows, conflict);
        if (error) throw error;
        return true;
    }
    for (const data of rows) await enqueue({ table, operation: 'insert', data, ...conflict });
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
