'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletAdapterProviderProps {
  children: React.ReactNode;
}

/**
 * Standard Solana Wallet Adapter Provider
 * Provides wallet connection and transaction signing capabilities
 * Used alongside wallet-ui for Metaplex Bubblegum operations
 */
export function WalletAdapterProvider({ children }: WalletAdapterProviderProps) {
  // Get Helius RPC endpoint from environment
  const endpoint = useMemo(() => {
    // Use a public RPC URL for client-side wallet connection.
    // If you need a custom RPC, set NEXT_PUBLIC_SOLANA_RPC_URL in your environment (client-visible).
    const publicRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

    if (publicRpc) return publicRpc;

    // Use the public Solana devnet RPC by default
    return `https://${network}.rpcpool.com`;
  }, []);

  // Configure wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
