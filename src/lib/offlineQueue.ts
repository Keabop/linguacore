import { get, set } from 'idb-keyval';
import type { SupabaseClient } from '@supabase/supabase-js';

const QUEUE_KEY = 'LINGUACORE_MUTATION_QUEUE';

export interface QueuedMutation {
    id: string;
    timestamp: number;
    table: string;
    operation: 'insert' | 'update';
    data: Record<string, unknown>;
    match?: Record<string, unknown>;   // .eq() filters for updates
}

let memoryQueue: QueuedMutation[] = [];
let syncing = false;
let listeners: Array<() => void> = [];

function notify() {
    for (const fn of listeners) fn();
}

export function subscribeToPendingMutations(fn: () => void) {
    listeners.push(fn);
    return () => {
        listeners = listeners.filter(l => l !== fn);
    };
}

export function getPendingCount(): number {
    return memoryQueue.length;
}

export function isSyncing(): boolean {
    return syncing;
}

export function getLastSyncTime(): number | null {
    const val = localStorage.getItem('LINGUACORE_LAST_SYNC');
    return val ? Number(val) : null;
}

function setLastSyncTime() {
    localStorage.setItem('LINGUACORE_LAST_SYNC', String(Date.now()));
}

/** Load the queue from IndexedDB into memory (call once on startup) */
export async function loadQueue(): Promise<void> {
    const stored = await get<QueuedMutation[]>(QUEUE_KEY);
    memoryQueue = stored ?? [];
    notify();
}

/** Persist the in-memory queue to IndexedDB */
async function persistQueue(): Promise<void> {
    await set(QUEUE_KEY, memoryQueue);
}

/** Add a mutation to the queue */
export async function enqueue(mutation: Omit<QueuedMutation, 'id' | 'timestamp'>): Promise<void> {
    const entry: QueuedMutation = {
        ...mutation,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
    };
    memoryQueue.push(entry);
    await persistQueue();
    notify();
}

/** Process all queued mutations (call when coming back online) */
export async function processQueue(
    supabase: SupabaseClient,
): Promise<{ success: number; failed: number }> {
    if (syncing || memoryQueue.length === 0) return { success: 0, failed: 0 };

    syncing = true;
    notify();

    let success = 0;
    let failed = 0;
    const remaining: QueuedMutation[] = [];

    for (const mutation of memoryQueue) {
        try {
            if (mutation.operation === 'insert') {
                // Use upsert to handle duplicate key conflicts gracefully
                // (e.g. unit_progress already synced from another session/tab)
                const { error } = await supabase.from(mutation.table).upsert(mutation.data, { onConflict: 'user_id,unit_id', ignoreDuplicates: false });
                if (error) {
                    // If upsert also fails (e.g. different conflict constraint), try plain insert
                    // but ignore duplicate key errors (23505) — the record already exists
                    if (error.code === '23505') {
                        // Record already exists, treat as success
                        console.info('[OfflineQueue] Record already exists, skipping:', mutation.table);
                    } else {
                        throw error;
                    }
                }
            } else if (mutation.operation === 'update' && mutation.match) {
                let query = supabase.from(mutation.table).update(mutation.data) as any;
                for (const [key, value] of Object.entries(mutation.match)) {
                    query = query.eq(key, value);
                }
                const { error } = await query;
                if (error) throw error;
            }
            success++;
        } catch (err) {
            console.error('[OfflineQueue] Sync failed:', mutation.table, err);
            remaining.push(mutation);
            failed++;
        }
    }

    memoryQueue = remaining;
    await persistQueue();
    syncing = false;
    if (success > 0) setLastSyncTime();
    notify();

    return { success, failed };
}
