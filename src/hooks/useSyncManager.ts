import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';
import {
    loadQueue,
    processQueue,
    subscribeToPendingMutations,
    getPendingCount,
    isSyncing,
    getLastSyncTime,
} from '../lib/offlineQueue';

export interface SyncState {
    pendingCount: number;
    syncing: boolean;
    lastSyncTime: number | null;
}

export function useSyncManager(): SyncState & { manualSync: () => Promise<void> } {
    const qc = useQueryClient();
    const [syncState, setSyncState] = useState<SyncState>({
        pendingCount: 0,
        syncing: false,
        lastSyncTime: null,
    });

    // Subscribe to queue state changes
    useEffect(() => {
        const update = () => {
            setSyncState({
                pendingCount: getPendingCount(),
                syncing: isSyncing(),
                lastSyncTime: getLastSyncTime(),
            });
        };
        const unsub = subscribeToPendingMutations(update);
        // Initial read
        update();
        return unsub;
    }, []);

    // Load persisted queue on mount
    useEffect(() => {
        loadQueue();
    }, []);

    // Auto-sync when coming back online
    useEffect(() => {
        const handleOnline = async () => {
            const result = await processQueue(supabase);
            if (result.success > 0) {
                qc.invalidateQueries();
                toast.success({
                    title: 'Sincronización completada',
                    description: `${result.success} cambios sincronizados`,
                });
            }
            if (result.failed > 0) {
                toast.error({
                    title: 'Error de sincronización',
                    description: `${result.failed} cambios no pudieron sincronizarse`,
                });
            }
        };

        window.addEventListener('online', handleOnline);

        if (navigator.onLine) {
            handleOnline();
        }

        return () => window.removeEventListener('online', handleOnline);
    }, [qc]);

    const manualSync = useCallback(async () => {
        if (!navigator.onLine) return;
        const result = await processQueue(supabase);
        if (result.success > 0) {
            qc.invalidateQueries();
            toast.success({
                title: 'Sincronización completada',
                description: `${result.success} cambios sincronizados`,
            });
        }
    }, [qc]);

    return {
        ...syncState,
        manualSync,
    };
}
