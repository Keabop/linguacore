import { useCallback, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

type Flag = 'guide_welcome_seen' | 'guide_opened';

const storageKey = (flag: Flag, userId: string) => `voxie-${flag}:${userId}`;

function readLocal(flag: Flag, userId: string | undefined): boolean {
    if (!userId) return false;
    try {
        return localStorage.getItem(storageKey(flag, userId)) === 'true';
    } catch {
        return false;
    }
}

/**
 * Whether the learner already saw the welcome and opened the guide. Kept in the account (so it
 * holds on every device) and in this browser (so it holds offline and right after the change).
 */
export function useGuide() {
    const { user } = useAuth();
    const meta = user?.user_metadata ?? {};
    const [local, setLocal] = useState<Record<Flag, boolean>>(() => ({
        guide_welcome_seen: readLocal('guide_welcome_seen', user?.id),
        guide_opened: readLocal('guide_opened', user?.id),
    }));

    const mark = useCallback((flag: Flag) => {
        if (!user) return;
        setLocal(prev => (prev[flag] ? prev : { ...prev, [flag]: true }));
        try {
            localStorage.setItem(storageKey(flag, user.id), 'true');
        } catch {
            // The account keeps it
        }
        if (user.user_metadata?.[flag] !== true) void supabase.auth.updateUser({ data: { [flag]: true } });
    }, [user]);

    const opened = meta.guide_opened === true || local.guide_opened || readLocal('guide_opened', user?.id);
    return {
        // Whoever opened the guide on their own doesn't need the welcome either
        welcomeSeen: opened || meta.guide_welcome_seen === true || local.guide_welcome_seen || readLocal('guide_welcome_seen', user?.id),
        opened,
        markWelcomeSeen: () => mark('guide_welcome_seen'),
        markOpened: () => mark('guide_opened'),
    };
}
