import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/AuthContext';
import { clearGuest, loadGuest } from '../lib/guestTrial';

/** An account this recent is the one the visitor just created. */
const NEW_ACCOUNT_MS = 24 * 60 * 60 * 1000;

/**
 * On sign-in, moves a waiting trial into the account, once. Only into a new account: on a shared
 * computer, the trial of a visitor must not end up in the account of whoever signs in next.
 */
export default function GuestImporter() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const running = useRef(false);

    useEffect(() => {
        const guest = loadGuest();
        if (!user || !guest || running.current || !navigator.onLine) return;
        if (Date.now() - new Date(user.created_at).getTime() > NEW_ACCOUNT_MS) {
            clearGuest();
            return;
        }
        running.current = true;
        import('../lib/guestImport')
            .then(({ importGuest }) => importGuest(user.id, guest))
            .then(() => {
                clearGuest();
                qc.invalidateQueries({ queryKey: ['cards'] });
                qc.invalidateQueries({ queryKey: ['readStories'] });
                qc.invalidateQueries({ queryKey: ['profile'] });
            })
            // Kept for the next sign-in
            .catch(err => console.error('[guestTrial] import failed:', err))
            .finally(() => { running.current = false; });
    }, [user, qc]);

    return null;
}
