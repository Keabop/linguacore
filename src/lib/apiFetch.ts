import { supabase } from './supabase';
import { toast } from './toast';
import i18n from '../i18n/config';

/** The session no longer exists on the server; the user was signed out on this device. */
export class SessionEndedError extends Error {
    status = 401;
}

const withToken = (init: RequestInit, token: string | undefined): RequestInit => ({
    ...init,
    headers: { ...(init.headers as Record<string, string> | undefined), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
});

/**
 * fetch to the app's own /api with the user's access token. A 401 means the server no longer
 * accepts that token, typically because the session was signed out on another device while
 * this one kept its copy: the session is refreshed and the call repeated once. If it can't be
 * refreshed, the session is over, so this device signs out and asks to sign in again.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(input, withToken(init, session?.access_token));
    if (res.status !== 401 || !session) return res;

    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) {
        const retried = await fetch(input, withToken(init, data.session.access_token));
        if (retried.status !== 401) return retried;
    }

    await supabase.auth.signOut({ scope: 'local' });
    toast.error({ title: i18n.t('auth.sessionEndedTitle'), description: i18n.t('auth.sessionEndedBody') });
    throw new SessionEndedError('Session ended');
}
