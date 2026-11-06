import { useCallback, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

type Flag = 'guide_welcome_seen' | 'guide_opened';

/**
 * A newcomer to the whole app, not to a level: still in A1, nothing else open and no unit finished.
 * Whoever moved up a level is not new. Unknown until the unit progress loads.
 */
export function isGuideNewcomer(p: { progressLoaded: boolean; level: string; unlockedLevels?: string[]; unitsCompleted: number }): boolean {
    return p.progressLoaded && p.level === 'A1' && (p.unlockedLevels?.length ?? 1) <= 1 && p.unitsCompleted === 0;
}

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
 * What was marked in this session belongs to its learner: another one signing in starts clean.
 */
export function useGuide() {
    const { user } = useAuth();
    const userId = user?.id;
    const meta = user?.user_metadata ?? {};
    const [marked, setMarked] = useState<{ userId: string; flags: Flag[] } | null>(null);
    const markedNow = (flag: Flag) => !!marked && marked.userId === userId && marked.flags.includes(flag);
    const has = (flag: Flag) => meta[flag] === true || markedNow(flag) || readLocal(flag, userId);

    const mark = useCallback((flag: Flag) => {
        if (!user) return;
        setMarked(prev => {
            const flags = prev?.userId === user.id ? prev.flags : [];
            return flags.includes(flag) ? prev : { userId: user.id, flags: [...flags, flag] };
        });
        try {
            localStorage.setItem(storageKey(flag, user.id), 'true');
        } catch {
            // The account keeps it
        }
        if (user.user_metadata?.[flag] !== true) void supabase.auth.updateUser({ data: { [flag]: true } });
    }, [user]);

    const opened = has('guide_opened');
    return {
        // Whoever opened the guide on their own doesn't need the welcome either
        welcomeSeen: opened || has('guide_welcome_seen'),
        opened,
        markWelcomeSeen: useCallback(() => mark('guide_welcome_seen'), [mark]),
        markOpened: useCallback(() => mark('guide_opened'), [mark]),
    };
}
