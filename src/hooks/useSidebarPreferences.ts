import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';

export interface UseSidebarPreferencesResult {
    position: SidebarPosition;
    onboardingShown: boolean;
    updatePosition: (newPos: SidebarPosition) => Promise<void>;
    completeOnboarding: () => Promise<void>;
}

export function useSidebarPreferences(): UseSidebarPreferencesResult {
    const { user } = useAuth();

    // Initial state loading safely from localStorage
    const [position, setPosition] = useState<SidebarPosition>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('voxie_sidebar_position');
            if (saved === 'left' || saved === 'right' || saved === 'top' || saved === 'bottom') {
                return saved;
            }
        }
        return 'left';
    });

    const [onboardingShown, setOnboardingShown] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('voxie_sidebar_onboarding_shown');
            if (saved !== null) {
                return saved === 'true';
            }
        }
        return false;
    });

    // Sync from user metadata when user object changes
    useEffect(() => {
        if (user) {
            const metadata = user.user_metadata || {};
            const metaPos = metadata.sidebar_position;
            const metaOnboarding = metadata.sidebar_onboarding_shown;

            if (metaPos === 'left' || metaPos === 'right' || metaPos === 'top' || metaPos === 'bottom') {
                setPosition(metaPos);
                localStorage.setItem('voxie_sidebar_position', metaPos);
            }
            if (typeof metaOnboarding === 'boolean') {
                setOnboardingShown(metaOnboarding);
                localStorage.setItem('voxie_sidebar_onboarding_shown', String(metaOnboarding));
            }
        }
    }, [user]);

    const updatePosition = async (newPos: SidebarPosition) => {
        setPosition(newPos);
        if (typeof window !== 'undefined') {
            localStorage.setItem('voxie_sidebar_position', newPos);
        }
        if (user) {
            await supabase.auth.updateUser({
                data: { sidebar_position: newPos },
            });
        }
    };

    const completeOnboarding = async () => {
        setOnboardingShown(true);
        if (typeof window !== 'undefined') {
            localStorage.setItem('voxie_sidebar_onboarding_shown', 'true');
        }
        if (user) {
            await supabase.auth.updateUser({
                data: { sidebar_onboarding_shown: true },
            });
        }
    };

    return {
        position,
        onboardingShown,
        updatePosition,
        completeOnboarding,
    };
}
