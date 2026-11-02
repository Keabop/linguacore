import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/AuthContext';
import { offlineRpc } from '../lib/offlineMutation';
import { localDate, nextStreak, type ActivityKind } from '../lib/studyActivity';
import type { Profile } from '../lib/database.types';

function timeZone(): string | null {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
    } catch {
        return null;
    }
}

/** Records a study activity; once a day is counted, the rest of that day's activities skip the request. */
export function useRecordActivity() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const userId = user?.id;

    return useCallback(async (kind: ActivityKind) => {
        if (!userId) return;
        const key = ['profile', userId];
        const cached = qc.getQueryData<Profile | null>(key);
        const today = localDate();
        if (cached?.last_study_date === today) return;

        if (cached) {
            const next = nextStreak(cached.streak, cached.last_study_date, today);
            qc.setQueryData<Profile>(key, { ...cached, streak: next.streak, last_study_date: next.lastStudyDate });
        }
        try {
            const result = await offlineRpc<{ streak: number; last_study_date: string }>('record_activity', {
                p_kind: kind,
                p_timezone: timeZone(),
                p_day: today,
            }, userId);
            if (result) {
                qc.setQueryData<Profile | null>(key, prev => prev && { ...prev, ...result });
            }
        } catch {
            qc.invalidateQueries({ queryKey: ['profile'] });
        }
    }, [userId, qc]);
}
