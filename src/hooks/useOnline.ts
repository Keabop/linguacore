import { useSyncExternalStore } from 'react';

function subscribe(cb: () => void) {
    window.addEventListener('online', cb);
    window.addEventListener('offline', cb);
    return () => {
        window.removeEventListener('online', cb);
        window.removeEventListener('offline', cb);
    };
}

function getSnapshot() {
    return navigator.onLine;
}

function getServerSnapshot() {
    return true;
}

export function useOnline() {
    const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return { isOnline };
}
