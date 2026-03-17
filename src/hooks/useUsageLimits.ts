import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useTier } from './useTier';

interface UsageLimit {
  allowed: boolean;
  remaining: number;
  limit: number;
}

interface UsageLimitsData {
  tier: 'free' | 'pro';
  limits: {
    'conversation-tutor': UsageLimit;
    'story-generator': UsageLimit;
    'fsrs-reviews': UsageLimit;
  };
}

export function useUsageLimits() {
  const { isFree } = useTier();

  return useQuery({
    queryKey: ['usage-limits'],
    queryFn: async (): Promise<UsageLimitsData> => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/usage', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch usage');
      return res.json();
    },
    enabled: isFree,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
