import { useEffect, useState } from 'react';
import type { CEFRLevel } from '../lib/db';
import { useAuth } from '../lib/AuthContext';

const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

/**
 * Shows the level-up celebration once, on the first home visit after the level went up.
 * The level last seen is kept per account on this device.
 */
export function useLevelUpNotice(level: CEFRLevel | undefined) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [newLevel, setNewLevel] = useState<CEFRLevel>('A2');
    // Stays mounted after the first open so the modal can play its exit animation
    const [mounted, setMounted] = useState(false);
    if (open && !mounted) setMounted(true);

    useEffect(() => {
        if (!level || !user?.id) return;
        const key = `voxie:seen-level:${user.id}`;
        let seen: string | null = null;
        try {
            seen = localStorage.getItem(key);
            localStorage.setItem(key, level);
        } catch {
            return;
        }
        if (seen && LEVEL_ORDER.indexOf(level) > LEVEL_ORDER.indexOf(seen as CEFRLevel)) {
            setNewLevel(level);
            setOpen(true);
        }
    }, [level, user?.id]);

    return { open, mounted, newLevel, close: () => setOpen(false) };
}
