import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/AuthContext';
import { offlineRpc } from '../lib/offlineMutation';
import { applyActivity, localDate, type ActivityKind, type ActivityResult } from '../lib/studyActivity';
import type { Profile } from '../lib/database.types';

function timeZone(): string | null {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
    } catch {
        return null;
    }
}

/** Records a study activity and tells the learner when a freeze saved the streak. */
export function useRecordActivity() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const userId = user?.id;

    return useCallback(async (kind: ActivityKind) => {
        if (!userId) return;
        const key = ['profile', userId];
        const cached = qc.getQueryData<Profile | null>(key);
        const today = localDate();

        const optimistic = cached ? applyActivity(cached, kind, today) : null;
        if (cached && optimistic) {
            const { freezes_used: _used, ...fields } = optimistic;
            qc.setQueryData<Profile>(key, { ...cached, ...fields });
        }
        try {
            const result = await offlineRpc<ActivityResult>('record_activity', {
                p_kind: kind,
                p_timezone: timeZone(),
                p_day: today,
            }, userId);
            if (result) {
                const { freezes_used: _freezes, ...fields } = result;
                qc.setQueryData<Profile | null>(key, prev => prev && { ...prev, ...fields });
            }
        } catch {
            qc.invalidateQueries({ queryKey: ['profile'] });
            return;
        }
    }, [userId, qc]);
}
