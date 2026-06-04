import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { Profile } from '../lib/database.types';

interface SubscriptionInfo {
    tier: 'free' | 'pro';
    subscriptionId: string | null;
    subscriptionStatus: 'inactive' | 'active' | 'cancelled' | 'past_due';
    createdAt: string;
}

export function useSubscription() {
    const { user, session } = useAuth();
    const qc = useQueryClient();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user!.id)
                .single();
            return data as Profile | null;
        },
        enabled: !!user?.id,
    });

    const subscription = profile ? {
        tier: profile.tier,
        subscriptionId: profile.subscription_id,
        subscriptionStatus: profile.subscription_status,
        createdAt: profile.created_at,
    } as SubscriptionInfo : null;

    const manageSubscription = async (action: 'cancel' | 'reactivate') => {
        if (!session?.access_token) throw new Error('No session');

        const res = await fetch('/api/payments/create-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ action }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to update subscription');
        }

        // Invalidate queries to refetch fresh data
        qc.invalidateQueries({ queryKey: ['subscription'] });
        qc.invalidateQueries({ queryKey: ['profile-tier'] });
        qc.invalidateQueries({ queryKey: ['profile'] });
    };

    return {
        subscription,
        loading: isLoading,
        cancelSubscription: () => manageSubscription('cancel'),
        reactivateSubscription: () => manageSubscription('reactivate'),
    };
}
