import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { useTier } from './useTier';
import { useAdmin } from './useAdmin';
import { useAuth } from '../lib/AuthContext';

vi.mock('../lib/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../lib/supabase', () => ({ supabase: {} }));
vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));

function setup(user: object, tier: 'free' | 'pro' | undefined, isLoading = false) {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1', ...user } } as any);
    vi.mocked(useQuery).mockReturnValue({ data: tier ? { tier, trial_ends_at: null } : undefined, isLoading } as any);
    return renderHook(() => ({ tier: useTier(), admin: useAdmin() })).result.current;
}

const ADMIN = { app_metadata: { role: 'admin' } };

describe('useAdmin', () => {
    beforeEach(() => vi.clearAllMocks());

    it('reads the role from app_metadata', () => {
        expect(setup(ADMIN, 'free').admin.isAdmin).toBe(true);
    });

    it('ignores a role in user_metadata, which the user can edit', () => {
        expect(setup({ app_metadata: {}, user_metadata: { role: 'admin' } }, 'free').admin.isAdmin).toBe(false);
    });
});

describe('useTier', () => {
    beforeEach(() => vi.clearAllMocks());

    it('gives the admin Pro access while billing stays free', () => {
        const { tier } = setup(ADMIN, 'free');
        expect(tier).toMatchObject({ tier: 'free', isPro: true, isFree: false, adminAccess: true });
        expect(tier.limits.tutorMessagesPerDay).toBe(Infinity);
    });

    it('does not mark a paying admin as admin access', () => {
        expect(setup(ADMIN, 'pro').tier).toMatchObject({ tier: 'pro', isPro: true, adminAccess: false });
    });

    it('waits for the profile before showing admin access', () => {
        expect(setup(ADMIN, undefined, true).tier.adminAccess).toBe(false);
    });

    it('keeps free limits for a regular free user', () => {
        const { tier } = setup({ app_metadata: {} }, 'free');
        expect(tier).toMatchObject({ isPro: false, isFree: true, adminAccess: false });
        expect(tier.limits.tutorMessagesPerDay).toBe(5);
    });
});
