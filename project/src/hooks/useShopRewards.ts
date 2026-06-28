import { useQuery } from '@tanstack/react-query';
import { getRewards, type Reward } from '../services/rewards';

export const SHOP_REWARDS_QUERY_KEY = ['shop-rewards'] as const;

/** Cached active rewards for the customer shop — survives remounts, no refetch on scroll. */
export function useShopRewards() {
  return useQuery<Reward[]>({
    queryKey: SHOP_REWARDS_QUERY_KEY,
    queryFn: () => getRewards(),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
