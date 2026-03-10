import { get, set, del } from 'idb-keyval';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

const IDB_KEY = 'LINGUACORE_QUERY_CACHE';

/**
 * IndexedDB persister for React Query using idb-keyval.
 * Stores the entire query cache as a single blob in IndexedDB.
 */
export function createIdbPersister(): Persister {
    return {
        persistClient: async (client: PersistedClient) => {
            await set(IDB_KEY, client);
        },
        restoreClient: async () => {
            return await get<PersistedClient>(IDB_KEY);
        },
        removeClient: async () => {
            await del(IDB_KEY);
        },
    };
}
