import { useAuth } from '../lib/AuthContext';

/** Hardcoded admin email list. Only users with these emails get admin access. */
const ADMIN_EMAILS: readonly string[] = ['luiszwazagamer@gmail.com'];

export function useAdmin() {
    const { user } = useAuth();
    const isAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email));
    return { isAdmin, adminEmail: ADMIN_EMAILS[0] };
}
