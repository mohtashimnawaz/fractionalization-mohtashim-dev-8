# Metaplex Bubblegum cNFT Minting - Complete Setup

## Overview

This project now supports **user-paid cNFT minting** using Metaplex Bubblegum. Users sign transactions with their wallet and pay for the minting costs directly.

## Key Features

✅ **User Wallet Signing**: Users approve all transactions via their connected wallet  
✅ **Decentralized Minting**: No server-side signing, fully on-chain  
✅ **Metaplex Bubblegum**: Industry-standard compressed NFT protocol  
✅ **Dual Wallet System**: wallet-ui for UI + @solana/wallet-adapter for transaction signing  

## Architecture

### Wallet Provider Hierarchy

```
<ReactQueryProvider>
  <ThemeProvider>
    <WalletAdapterProvider>  ← Standard Solana wallet adapter (for signing)
      <SolanaProvider>        ← wallet-ui (for UI components)
        {children}
      </SolanaProvider>
    </WalletAdapterProvider>
  </ThemeProvider>
</ReactQueryProvider>
```

### Why Two Wallet Systems?

1. **wallet-ui** (@wallet-ui/react):
   - Modern UI components
   - Clean wallet selection interface
   - Used for: UI rendering, wallet state display

2. **@solana/wallet-adapter-react**:
   - Standard Solana wallet adapter
   - Exposes `signTransaction`, `signMessage` methods
   - Used for: Transaction signing, Metaplex operations

## Minting Flow

### Step 1: Create Merkle Tree
```typescript
const merkleTree = generateSigner(umi);
await createTree(umi, {
  merkleTree,
  maxDepth: 14,        // 2^14 = 16,384 capacity
  maxBufferSize: 64,   // Concurrent updates
}).sendAndConfirm(umi);
```

**Cost**: ~0.15 SOL per tree  
**Capacity**: 16,384 cNFTs per tree  
**Production Tip**: Reuse existing trees to save costs

### Step 2: Upload Metadata
```typescript
const metadata = {
  name: params.name,
  symbol: params.symbol,
  description: params.description,
  image: params.imageUrl,
  attributes: [...],
  properties: {...},
};
```

**Current**: Data URI (base64 encoded JSON)  
**Production**: Upload to Arweave or IPFS using:
- Metaplex Sugar CLI
- Bundlr/Arweave uploader
- IPFS pinning services

### Step 3: Mint Compressed NFT
```typescript
await mintV1(umi, {
  leafOwner: userPublicKey,
  merkleTree: merkleTreeAddress,
  metadata: {
    name, symbol, uri,
    sellerFeeBasisPoints: 500, // 5% royalty
    creators: [{ address, verified, share: 100 }],
  },
}).sendAndConfirm(umi);
```

**Cost**: ~0.001 SOL per mint  
**User Action**: Signs transaction in wallet popup  

## Implementation Files

### `/src/components/solana/wallet-adapter-provider.tsx`
Standard Solana wallet adapter provider with:
- ConnectionProvider (Helius RPC)
- WalletProvider (Phantom, Solflare)
- WalletModalProvider (wallet selection UI)

### `/src/hooks/use-mint-cnft.ts`
Complete Metaplex Bubblegum minting logic:
- `createMerkleTree()` - Creates tree with 16K capacity
- `uploadMetadata()` - Generates metadata JSON
- `mintCompressedNFT()` - Full mint transaction flow
- `useMintCNFT()` - React Query mutation hook

### `/src/components/fractionalization/select-nft-step.tsx`
UI with "Mint cNFT" button that:
- Opens dialog with form (name, symbol, description, imageUrl)
- Calls `useMintCNFT.mutateAsync()`
- Shows transaction status in toast notifications
- Auto-refreshes cNFT list after minting

## Testing the Minting Flow

### 1. Connect Your Wallet
- Make sure you have 0.2+ SOL on devnet
- Connect using Phantom or Solflare

### 2. Navigate to Fractionalize Page
```
http://localhost:3000/fractionalize
```

### 3. Click "Mint cNFT" Button
- Fill in:
  - **Name**: (required) e.g., "My Test cNFT"
  - **Symbol**: (required) e.g., "TEST"
  - **Description**: (optional) e.g., "A test compressed NFT"
  - **Image URL**: (optional) e.g., "https://via.placeholder.com/400"

### 4. Click "Mint cNFT" in Dialog
- **First Transaction**: Create Merkle tree (~0.15 SOL)
  - Wallet popup will ask for approval
  - Click "Approve"
  
- **Second Transaction**: Mint cNFT (~0.001 SOL)
  - Another wallet popup
  - Click "Approve"

### 5. Wait for Indexing
- Helius DAS API indexes cNFTs within 3-10 seconds
- UI automatically refreshes to show your new cNFT

## Cost Breakdown

| Operation | Cost | Frequency |
|-----------|------|-----------|
| Create Merkle Tree | ~0.15 SOL | Once per 16,384 cNFTs |
| Mint cNFT | ~0.001 SOL | Per cNFT |
| **Total First Mint** | ~0.151 SOL | - |
| **Subsequent Mints** | ~0.001 SOL | (reusing tree) |

### Production Cost Optimization

**Current Implementation**: Creates new tree for each mint (~0.15 SOL)  
**Production Optimization**: Reuse existing trees

```typescript
// Instead of creating new tree:
const merkleTreeAddress = await createMerkleTree(umi);

// Use existing tree:
const existingTree = umiPublicKey('YourTreeAddress...');
await mintV1(umi, {
  merkleTree: existingTree,
  // ... rest of params
});
```

**Savings**: ~99% cost reduction for bulk minting

## Transaction Flow Diagram

```
User Clicks "Mint cNFT"
        ↓
Initialize UMI with wallet adapter identity
        ↓
Create Merkle Tree Transaction
        ↓
🔐 Wallet Popup #1: Approve tree creation (~0.15 SOL)
        ↓
Tree Created → Get tree address
        ↓
Generate Metadata JSON (data URI)
        ↓
Build Mint Transaction
        ↓
🔐 Wallet Popup #2: Approve mint (~0.001 SOL)
        ↓
Transaction Confirmed
        ↓
Helius indexes cNFT (3-10 seconds)
        ↓
UI auto-refreshes → New cNFT appears
```

## Metadata Storage

### Current (Testing)
- **Method**: Data URI (base64 encoded JSON)
- **Storage**: On-chain in transaction
- **Pros**: No external dependencies, instant
- **Cons**: Not best practice, metadata can't be updated

### Production Recommendations

#### Option 1: Arweave (Recommended)
```bash
# Install Metaplex Sugar
npm install -g @metaplex-foundation/sugar

# Upload metadata
sugar upload ./metadata
```

- **Cost**: ~0.0005 AR per file (~$0.01)
- **Permanence**: Immutable, permanent storage
- **Best for**: NFT collections, high-value assets

#### Option 2: IPFS
```typescript
import { NFTStorage } from 'nft.storage';

const client = new NFTStorage({ token: API_KEY });
const metadata = await client.store({
  name, description, image,
});
const uri = metadata.url; // ipfs://...
```

- **Cost**: Free (with pinning service)
- **Best for**: Development, testing, mutable metadata

## Environment Variables

Required in `.env.local`:

```bash
# Helius API Key (for RPC + DAS API)
NEXT_PUBLIC_HELIUS_API_KEY=your-api-key-here

# Network (devnet or mainnet-beta)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

## Troubleshooting

### Wallet Popup Not Appearing
**Cause**: Wallet adapter not initialized  
**Solution**: Check browser console for errors, ensure wallet extension is installed

### "Wallet not connected" Error
**Cause**: Using wallet-ui's useWallet() instead of wallet-adapter's  
**Solution**: Import from `@solana/wallet-adapter-react`:
```typescript
import { useWallet } from '@solana/wallet-adapter-react';
```

### Transaction Fails with "Insufficient Funds"
**Cause**: Not enough SOL for tree creation (~0.15 SOL) + mint (~0.001 SOL)  
**Solution**: Get devnet SOL:
```bash
solana airdrop 1 <your-wallet-address> --url devnet
```

### cNFT Not Showing After Mint
**Cause**: Helius indexing delay (3-10 seconds)  
**Solution**: Wait, UI auto-refreshes at 3s and 10s intervals

### "Tree Authority" Error
**Cause**: Tree configuration mismatch  
**Solution**: Use recommended settings (maxDepth: 14, maxBufferSize: 64)

## Next Steps

### Task 3: Fractionalization Transaction
Once your Anchor program is deployed:

1. Get program ID from deployment
2. Update `use-fractionalize.ts` with program methods
3. Pass Merkle proof as `remaining_accounts`
4. Test complete flow: mint → fractionalize → verify vault

### Production Deployment
- [ ] Switch metadata storage to Arweave/IPFS
- [ ] Implement tree reuse logic
- [ ] Add tree capacity monitoring
- [ ] Deploy to Vercel/mainnet-beta
- [ ] Add transaction history UI

## Resources

- [Metaplex Bubblegum Docs](https://developers.metaplex.com/bubblegum)
- [Compressed NFTs Guide](https://docs.solana.com/developing/guides/compressed-nfts)
- [UMI Framework](https://github.com/metaplex-foundation/umi)
- [Helius DAS API](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api)

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify wallet has sufficient SOL
3. Ensure environment variables are set
4. Check Helius API key is valid
5. Review transaction logs in Solana Explorer

---

**Status**: ✅ Fully Implemented and Ready for Testing  
**Last Updated**: January 2025
