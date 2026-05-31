import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSidebarPreferences } from './useSidebarPreferences';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

// Mock the AuthContext and supabase modules
vi.mock('../lib/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            updateUser: vi.fn(),
        },
    },
}));

describe('useSidebarPreferences', () => {
    let mockUser: any = null;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        mockUser = null;

        // Default mock implementation for useAuth
        vi.mocked(useAuth).mockImplementation(() => ({
            user: mockUser,
            session: null,
            loading: false,
            signUp: vi.fn(),
            signIn: vi.fn(),
            signInWithGoogle: vi.fn(),
            signOut: vi.fn(),
        }));
    });

    describe('Initialization', () => {
        it('should initialize with position "left" and onboardingShown false by default', () => {
            const { result } = renderHook(() => useSidebarPreferences());

            expect(result.current.position).toBe('left');
            expect(result.current.onboardingShown).toBe(false);
        });

        it('should initialize using values from localStorage when they exist', () => {
            localStorage.setItem('voxie_sidebar_position', 'right');
            localStorage.setItem('voxie_sidebar_onboarding_shown', 'true');

            const { result } = renderHook(() => useSidebarPreferences());

            expect(result.current.position).toBe('right');
            expect(result.current.onboardingShown).toBe(true);
        });

        it('should ignore invalid values in localStorage', () => {
            localStorage.setItem('voxie_sidebar_position', 'invalid-position');
            localStorage.setItem('voxie_sidebar_onboarding_shown', 'maybe');

            const { result } = renderHook(() => useSidebarPreferences());

            expect(result.current.position).toBe('left');
            expect(result.current.onboardingShown).toBe(false);
        });
    });

    describe('Sync from Supabase', () => {
        it('should sync metadata when a logged-in user changes', () => {
            const { result, rerender } = renderHook(() => useSidebarPreferences());

            // Initially default values
            expect(result.current.position).toBe('left');
            expect(result.current.onboardingShown).toBe(false);

            // Change user to a logged-in user with different preferences
            mockUser = {
                id: 'test-user-id',
                user_metadata: {
                    sidebar_position: 'right',
                    sidebar_onboarding_shown: true,
                },
            };

            // Rerender hook to pick up new useAuth return value
            act(() => {
                rerender();
            });

            // State should update based on Supabase user metadata
            expect(result.current.position).toBe('right');
            expect(result.current.onboardingShown).toBe(true);

            // It should also have written to localStorage
            expect(localStorage.getItem('voxie_sidebar_position')).toBe('right');
            expect(localStorage.getItem('voxie_sidebar_onboarding_shown')).toBe('true');
        });

        it('should partially sync when only one preference metadata is available', () => {
            const { result, rerender } = renderHook(() => useSidebarPreferences());

            mockUser = {
                id: 'test-user-id',
                user_metadata: {
                    sidebar_position: 'right',
                },
            };

            act(() => {
                rerender();
            });

            expect(result.current.position).toBe('right');
            expect(result.current.onboardingShown).toBe(false);
            expect(localStorage.getItem('voxie_sidebar_position')).toBe('right');
            expect(localStorage.getItem('voxie_sidebar_onboarding_shown')).toBeNull();
        });
    });

    describe('updatePosition', () => {
        it('should update position state and localStorage, and not call Supabase if not logged in', async () => {
            const { result } = renderHook(() => useSidebarPreferences());

            await act(async () => {
                await result.current.updatePosition('right');
            });

            expect(result.current.position).toBe('right');
            expect(localStorage.getItem('voxie_sidebar_position')).toBe('right');
            expect(supabase.auth.updateUser).not.toHaveBeenCalled();
        });

        it('should update position state, localStorage, and call Supabase if logged in', async () => {
            mockUser = { id: 'test-user-id' };
            const { result } = renderHook(() => useSidebarPreferences());

            await act(async () => {
                await result.current.updatePosition('right');
            });

            expect(result.current.position).toBe('right');
            expect(localStorage.getItem('voxie_sidebar_position')).toBe('right');
            expect(supabase.auth.updateUser).toHaveBeenCalledWith({
                data: { sidebar_position: 'right' },
            });
        });
    });

    describe('completeOnboarding', () => {
        it('should update onboardingShown state and localStorage, and not call Supabase if not logged in', async () => {
            const { result } = renderHook(() => useSidebarPreferences());

            await act(async () => {
                await result.current.completeOnboarding();
            });

            expect(result.current.onboardingShown).toBe(true);
            expect(localStorage.getItem('voxie_sidebar_onboarding_shown')).toBe('true');
            expect(supabase.auth.updateUser).not.toHaveBeenCalled();
        });

        it('should update onboardingShown state, localStorage, and call Supabase if logged in', async () => {
            mockUser = { id: 'test-user-id' };
            const { result } = renderHook(() => useSidebarPreferences());

            await act(async () => {
                await result.current.completeOnboarding();
            });

            expect(result.current.onboardingShown).toBe(true);
            expect(localStorage.getItem('voxie_sidebar_onboarding_shown')).toBe('true');
            expect(supabase.auth.updateUser).toHaveBeenCalledWith({
                data: { sidebar_onboarding_shown: true },
            });
        });
    });
});
