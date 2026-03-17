import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useMemo } from 'react';

export type Tier = 'free' | 'pro';

interface TierLimits {
  maxLevel: string;
  tutorMessagesPerDay: number;
  conversationHistoryVisible: number;
  storiesPerWeek: number;
  fsrsCardsPerDay: number;
  autoErrorCards: boolean;
}

const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    maxLevel: 'A1',
    tutorMessagesPerDay: 5,
    conversationHistoryVisible: 2,
    storiesPerWeek: 1,
    fsrsCardsPerDay: 10,
    autoErrorCards: false,
  },
  pro: {
    maxLevel: 'B2',
    tutorMessagesPerDay: Infinity,
    conversationHistoryVisible: Infinity,
    storiesPerWeek: Infinity,
    fsrsCardsPerDay: Infinity,
    autoErrorCards: true,
  },
};

interface TierInfo {
  tier: Tier;
  isPro: boolean;
  isFree: boolean;
  isTrial: boolean;
  trialEndsAt: Date | null;
  limits: TierLimits;
  loading: boolean;
}

export function useTier(): TierInfo {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-tier', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('tier, trial_started_at, trial_ends_at')
        .eq('id', user!.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  return useMemo(() => {
    const tier: Tier = (profile?.tier as Tier) ?? 'free';
    const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
    const isTrial = trialEndsAt !== null && trialEndsAt > new Date() && tier === 'pro';

    return {
      tier,
      isPro: tier === 'pro',
      isFree: tier === 'free',
      isTrial,
      trialEndsAt,
      limits: TIER_LIMITS[tier],
      loading: isLoading,
    };
  }, [profile?.tier, profile?.trial_ends_at, isLoading]);
}
