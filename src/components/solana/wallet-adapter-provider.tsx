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
    const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
    
    if (apiKey) {
      return `https://${network}.helius-rpc.com/?api-key=${apiKey}`;
    }
    
    // Fallback to public devnet
    return 'https://api.devnet.solana.com';
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
