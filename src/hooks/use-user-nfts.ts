/**
 * Hook for fetching user's NFTs
 * 
 * @deprecated This hook is deprecated. Use useUserCNFTs instead.
 * The app now only supports compressed NFTs via Helius DAS API.
 * See: src/hooks/use-user-cnfts.ts
 */

import { useQuery } from '@tanstack/react-query';
import { UserNFT } from '@/types';

/**
 * Fetch NFTs owned by the connected wallet
 * @deprecated Use useUserCNFTs for real compressed NFTs
 */
const fetchUserNFTs = async (walletAddress?: string): Promise<UserNFT[]> => {
  if (!walletAddress) return [];
  
  // This hook is deprecated - all NFT data now comes from Helius DAS API
  console.warn('⚠️ useUserNFTs is deprecated. Use useUserCNFTs instead.');
  return [];
};

/**
 * Hook to fetch user's NFTs
 * @deprecated Use useUserCNFTs for real compressed NFTs from Helius
 */
export const useUserNFTs = (walletAddress?: string) => {
  return useQuery({
    queryKey: ['userNFTs', walletAddress],
    queryFn: () => fetchUserNFTs(walletAddress),
    enabled: !!walletAddress,
    staleTime: 60000, // 1 minute
  });
};
