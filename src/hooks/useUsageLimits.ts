import { useEffect } from 'react';
import { apiFetch } from '../lib/apiFetch';
import { USAGE_CHANGED } from '../lib/ai';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    'evaluations': UsageLimit;
  };
}

export function useUsageLimits() {
  const { isFree } = useTier();
  const qc = useQueryClient();

  useEffect(() => {
    const refresh = () => qc.invalidateQueries({ queryKey: ['usage-limits'] });
    window.addEventListener(USAGE_CHANGED, refresh);
    return () => window.removeEventListener(USAGE_CHANGED, refresh);
  }, [qc]);

  const query = useQuery({
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
  // A Pro learner has no limits: a count saved from their free days must not show
  return { ...query, data: isFree ? query.data : undefined };
}
