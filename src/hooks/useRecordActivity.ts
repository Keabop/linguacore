import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext';
import { offlineRpc } from '../lib/offlineMutation';
import { toast } from '../lib/toast';
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
    const { t } = useTranslation();
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
        let freezesUsed = optimistic?.freezes_used ?? 0;
        try {
            const result = await offlineRpc<ActivityResult>('record_activity', {
                p_kind: kind,
                p_timezone: timeZone(),
                p_day: today,
            }, userId);
            if (result) {
                const { freezes_used, ...fields } = result;
                freezesUsed = freezes_used;
                qc.setQueryData<Profile | null>(key, prev => prev && { ...prev, ...fields });
            }
        } catch {
            qc.invalidateQueries({ queryKey: ['profile'] });
            return;
        }
        if (freezesUsed > 0) {
            toast.info({ title: t('streak.freezeUsed', { count: freezesUsed }) });
        }
    }, [userId, qc, t]);
}
