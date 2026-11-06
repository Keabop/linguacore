import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/AuthContext';
import { offlineUpdate } from '../lib/offlineMutation';
import type { Profile } from '../lib/database.types';

/**
 * Saves the daily goal (1–3 activities). The home screen's drops change at once; offline the change
 * waits in the queue. Resolves false when it could not be saved, and the cached profile is reloaded.
 */
export function useDailyGoal() {
    const { user } = useAuth();
    const qc = useQueryClient();

    return useCallback(async (goal: number): Promise<boolean> => {
        if (!user) return false;
        qc.setQueryData<Profile | null>(['profile', user.id], prev => prev && { ...prev, daily_goal: goal });
        try {
            await offlineUpdate('profiles', { daily_goal: goal }, { id: user.id });
            return true;
        } catch {
            qc.invalidateQueries({ queryKey: ['profile'] });
            return false;
        }
    }, [user, qc]);
}
