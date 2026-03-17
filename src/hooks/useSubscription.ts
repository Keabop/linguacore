import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

interface SubscriptionInfo {
    tier: 'free' | 'pro';
    subscriptionId: string | null;
    subscriptionStatus: 'inactive' | 'active' | 'cancelled' | 'past_due';
    createdAt: string;
}

export function useSubscription() {
    const { user, session } = useAuth();
    const qc = useQueryClient();

    const { data: subscription, isLoading } = useQuery({
        queryKey: ['subscription', user?.id],
        queryFn: async () => {
            const { data } = await supabase
                .from('profiles')
                .select('tier, subscription_id, subscription_status, created_at')
                .eq('id', user!.id)
                .single();
            if (!data) return null;
            return {
                tier: data.tier,
                subscriptionId: data.subscription_id,
                subscriptionStatus: data.subscription_status,
                createdAt: data.created_at,
            } as SubscriptionInfo;
        },
        enabled: !!user?.id,
        staleTime: 30_000,
    });

    const manageSubscription = async (action: 'cancel' | 'reactivate') => {
        if (!session?.access_token) throw new Error('No session');

        const res = await fetch('/api/payments/cancel-subscription', {
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
