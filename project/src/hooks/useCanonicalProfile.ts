import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchCanonicalProfile, type CanonicalProfile } from '../services/canonicalProfile';

export const PROFILE_QUERY_KEY = 'canonical-profile';

export function profileQueryOptions(userId: string) {
  return {
    queryKey: [PROFILE_QUERY_KEY, userId] as const,
    queryFn: () => fetchCanonicalProfile(userId),
    staleTime: 30_000,
  };
}

export function useCanonicalProfile(userId: string | undefined) {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) return Promise.resolve(null);
      return fetchCanonicalProfile(userId);
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useFetchCanonicalProfile() {
  const queryClient = useQueryClient();
  return useCallback(
    (userId: string | undefined) => {
      if (!userId) return Promise.resolve(null);
      return queryClient.fetchQuery(profileQueryOptions(userId));
    },
    [queryClient],
  );
}

export function useInvalidateProfile() {
  const qc = useQueryClient();
  return useCallback((userId?: string) => {
    if (userId) void qc.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, userId] });
    else void qc.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
  }, [qc]);
}

export function canonicalToAppUser(p: CanonicalProfile) {
  return {
    id: p.id,
    username: p.username ?? '',
    email: p.email ?? '',
    avatar: p.avatar_url ?? '',
    level: p.level,
    xp: p.xp,
    xpToNext: p.xp_to_next,
    totalPoints: p.total_points,
    currentPoints: p.current_points,
    rank: 0,
    joinDate: p.created_at.split('T')[0],
    streak: p.current_streak,
    achievements: 0,
    totalAchievements: 0,
    phone: p.phone ?? undefined,
    bio: p.bio ?? undefined,
  };
}
