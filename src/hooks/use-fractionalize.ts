/**
 * Hook for fractionalizing compressed NFTs
 * Uses Helius DAS API to fetch Merkle proof and passes it via remaining_accounts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js';
import { getAssetProof, proofToAccounts } from '@/lib/helius';
import { useWallet } from '@/components/solana/solana-provider';

interface FractionalizeParams {
  nftMint: string; // cNFT asset ID
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
}

/**
 * Build and send fractionalize transaction for a compressed NFT
 * 
 * Flow:
 * 1. Fetch Merkle proof from Helius for the cNFT
 * 2. Build transaction with your program's fractionalize instruction
 * 3. Pass proof nodes as remaining_accounts
 * 4. User signs and sends
 */
const fractionalizeCompressedNFT = async (
  params: FractionalizeParams,
  walletAddress: string
): Promise<string> => {
  try {
    // Step 1: Fetch Merkle proof from Helius
    console.log('Fetching Merkle proof for cNFT:', params.nftMint);
    const proof = await getAssetProof(params.nftMint);
    
    if (!proof || !proof.proof) {
      throw new Error('Failed to fetch valid Merkle proof');
    }

    console.log('Merkle proof retrieved:', {
      tree: proof.tree_id,
      leaf: proof.leaf,
      proofLength: proof.proof.length,
    });

    // Step 2: Convert proof to PublicKey array for remaining_accounts
    const proofAccounts = proofToAccounts(proof);
    const treePublicKey = new PublicKey(proof.tree_id);

    console.log('Proof accounts:', proofAccounts.length);

    // Step 3: Build fractionalize transaction
    // TODO: Replace this with actual program instruction once deployed
    // 
    // Example structure:
    // const transaction = await program.methods
    //   .fractionalize(
    //     params.tokenName,
    //     params.tokenSymbol,
    //     new BN(params.totalSupply),
    //     proof.root,
    //     proof.leaf,
    //     new BN(proof.node_index)
    //   )
    //   .accounts({
    //     authority: walletPublicKey,
    //     merkleTree: treePublicKey,
    //     leafOwner: walletPublicKey,
    //     // ... other accounts
    //   })
    //   .remainingAccounts(
    //     proofAccounts.map((pubkey) => ({
    //       pubkey,
    //       isSigner: false,
    //       isWritable: false,
    //     }))
    //   )
    //   .transaction();

    // For now, simulate the transaction
    console.log('Would build transaction with:', {
      ...params,
      treeId: proof.tree_id,
      proofNodes: proofAccounts.length,
      leafIndex: proof.node_index,
    });

    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock signature - will be replaced with actual transaction
    const signature = `mock_cnft_tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    console.log('✅ Fractionalize transaction sent:', signature);
    
    return signature;

  } catch (error) {
    console.error('Fractionalization failed:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fractionalize compressed NFT');
  }
};

/**
 * Hook to fractionalize a compressed NFT
 * Automatically fetches proof and builds transaction
 */
export const useFractionalize = () => {
  const queryClient = useQueryClient();
  const wallet = useWallet();

  return useMutation({
    mutationFn: async (params: FractionalizeParams) => {
      if (!wallet.account?.address) {
        throw new Error('Wallet not connected');
      }

      return fractionalizeCompressedNFT(
        params,
        wallet.account.address
      );
    },
    onSuccess: (signature: string) => {
      toast.success('Compressed NFT fractionalized successfully! 🎉', {
        description: `Transaction: ${signature.substring(0, 20)}...`,
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['vaults'] });
      queryClient.invalidateQueries({ queryKey: ['userCNFTs'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to fractionalize compressed NFT', {
        description: error.message,
      });
      console.error('Fractionalization error:', error);
    },
  });
};
