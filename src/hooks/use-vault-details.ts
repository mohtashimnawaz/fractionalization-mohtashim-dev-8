/**
 * Hook for fetching individual vault details
 */

import { useQuery } from '@tanstack/react-query';
import { Vault } from '@/types';

/**
 * Fetch a single vault by ID
 * TODO: Replace with actual on-chain call when program is deployed
 */
const fetchVaultById = async (_id: string): Promise<Vault | null> => {
  // No mock data - will be replaced with real on-chain vault fetching
  console.warn('⚠️ useVaultDetails: Mock data removed. Implement real vault fetching when program is deployed.');
  return null;
};

/**
 * Hook to fetch vault details by ID
 */
export const useVaultDetails = (id: string) => {
  return useQuery({
    queryKey: ['vault', id],
    queryFn: () => fetchVaultById(id),
    enabled: !!id,
    staleTime: 30000,
  });
};
