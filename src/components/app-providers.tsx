'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { WalletAdapterProvider } from '@/components/solana/wallet-adapter-provider'
import React from 'react'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <WalletAdapterProvider>
          <SolanaProvider>{children}</SolanaProvider>
        </WalletAdapterProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
