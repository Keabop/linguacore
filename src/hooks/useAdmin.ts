import { useAuth } from '../lib/AuthContext';

/**
 * Whether the signed-in user has the admin role. It lives in app_metadata, which only the
 * server can set; this only shows or hides admin screens, the database enforces the same
 * check through is_admin().
 */
export function useAdmin() {
    const { user } = useAuth();
    return { isAdmin: user?.app_metadata?.role === 'admin' };
}
