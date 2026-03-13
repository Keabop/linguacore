import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { ConversationSessionRow } from '../lib/database.types';

export interface ConversationSession {
    id: number;
    level: string;
    topic: string | null;
    messages: Array<{
        role: 'user' | 'assistant';
        content: string;
        corrections?: Array<{ original: string; corrected: string; explanation: string }>;
        suggestions?: string[];
    }>;
    startedAt: Date;
    endedAt: Date | null;
}

function rowToSession(row: ConversationSessionRow): ConversationSession {
    return {
        id: row.id,
        level: row.level,
        topic: row.topic,
        messages: row.messages ?? [],
        startedAt: new Date(row.started_at),
        endedAt: row.ended_at ? new Date(row.ended_at) : null,
    };
}

export function useConversationHistory() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const userId = user?.id;

    // Fetch past completed sessions (ended_at IS NOT NULL), most recent first
    const { data: sessions } = useQuery({
        queryKey: ['conversation-sessions', userId],
        queryFn: async () => {
            const { data } = await supabase
                .from('conversation_sessions')
                .select('*')
                .not('ended_at', 'is', null)
                .order('started_at', { ascending: false })
                .limit(50);
            return ((data ?? []) as ConversationSessionRow[]).map(rowToSession);
        },
        enabled: !!userId,
    });

    // Save a completed conversation session
    const saveSession = useCallback(async (
        level: string,
        messages: ConversationSession['messages'],
        topic?: string,
    ) => {
        if (!userId) return null;

        const { data, error } = await supabase
            .from('conversation_sessions')
            .insert({
                user_id: userId,
                level,
                topic: topic ?? null,
                messages: messages as any,
                started_at: new Date().toISOString(),
                ended_at: new Date().toISOString(),
            })
            .select('id')
            .single();

        if (error) throw error;
        qc.invalidateQueries({ queryKey: ['conversation-sessions'] });
        return data?.id;
    }, [userId, qc]);

    return {
        sessions: sessions ?? [],
        saveSession,
    };
}
