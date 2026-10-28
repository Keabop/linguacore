import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useAdmin } from './useAdmin';
import { useMemo } from 'react';
import type { Profile } from '../lib/database.types';

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
  /** The paid tier on record (billing). */
  tier: Tier;
  /** Pro access that comes from the admin role, not from a subscription. */
  adminAccess: boolean;
  isPro: boolean;
  isFree: boolean;
  isTrial: boolean;
  trialEndsAt: Date | null;
  limits: TierLimits;
  loading: boolean;
}

export function useTier(): TierInfo {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

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

  return useMemo(() => {
    const tier: Tier = (profile?.tier as Tier) ?? 'free';
    const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
    const isTrial = trialEndsAt !== null && trialEndsAt > new Date() && tier === 'pro';
    // isPro, isFree and limits describe access: the admin gets Pro without touching billing
    const access: Tier = isAdmin ? 'pro' : tier;

    return {
      tier,
      adminAccess: isAdmin && !isLoading && tier !== 'pro',
      isPro: access === 'pro',
      isFree: access === 'free',
      isTrial,
      trialEndsAt,
      limits: TIER_LIMITS[access],
      loading: isLoading,
    };
  }, [profile?.tier, profile?.trial_ends_at, isLoading, isAdmin]);
}
