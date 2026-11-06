import { useCallback, useState } from 'react';

function read<T>(key: string, initial: T): T {
    try {
        const raw = sessionStorage.getItem(key);
        return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
        return initial;
    }
}

/**
 * State that survives a reload of the tab (not a new tab or another device). For the tries of a
 * step, so reloading neither resets the count nor asks again for what was already passed.
 * `clear` forgets it once the step is done.
 */
export function useSessionState<T>(key: string, initial: T) {
    const [value, setValue] = useState<T>(() => read(key, initial));

    const set = useCallback((update: T | ((current: T) => T)) => {
        setValue(current => {
            const next = typeof update === 'function' ? (update as (current: T) => T)(current) : update;
            try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* kept in memory only */ }
            return next;
        });
    }, [key]);

    const clear = useCallback(() => {
        try { sessionStorage.removeItem(key); } catch { /* nothing stored */ }
    }, [key]);

    return [value, set, clear] as const;
}
