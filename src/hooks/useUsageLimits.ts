import { apiFetch } from '../lib/apiFetch';
import { useQuery } from '@tanstack/react-query';
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
      const res = await apiFetch('/api/usage');
      if (!res.ok) throw new Error('Failed to fetch usage');
      return res.json();
    },
    enabled: isFree,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
