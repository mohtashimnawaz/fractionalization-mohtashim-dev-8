# ⚠️ IMPORTANT: Real cNFT Required

## NO MOCKS - Real Compressed NFT Only

This application **requires a REAL compressed NFT** created on Solana devnet.

### Why Mocks Don't Work

```
❌ Mock NFT → Mock Merkle Proof → ❌ On-chain Verification FAILS
✅ Real cNFT → Real Merkle Proof → ✅ On-chain Verification SUCCESS
```

**Reason:** Your Anchor program will verify the Merkle proof on-chain. Mock proofs will always fail because they don't match any real tree structure in the blockchain state.

## Quick Start (3 Steps)

### 1. Get Helius API Key
```bash
# Go to https://www.helius.dev/
# Sign up (free tier)
# Create API key
# Add to .env.local:
NEXT_PUBLIC_HELIUS_API_KEY=your_key_here
```

### 2. Create Real cNFT on Devnet

**Option A: Solana Playground (Easiest - 5 minutes)**
1. Go to https://beta.solpg.io/
2. Switch to devnet (top right)
3. Get devnet SOL from faucet
4. Use built-in tools to create compressed NFT
5. Mint to your wallet

**Option B: Metaplex Sugar CLI**
```bash
npm install -g @metaplex-foundation/sugar-cli
sugar create-config
sugar upload
sugar deploy
sugar mint
```

**Full instructions:** See `CNFT_SETUP.md`

### 3. Test the App
```bash
npm run dev
# Connect wallet (must own the cNFT)
# Go to /fractionalize
# You'll see your real cNFT from Helius
```

## What Happens

### Without Real cNFT
```
Connect Wallet → No cNFTs found → ⚠️ Warning shown
"You must create a real compressed NFT on Solana devnet"
```

### With Real cNFT
```
Connect Wallet → Helius fetches your cNFTs → See them in UI
Select cNFT → Configure tokens → Fractionalize
Real Merkle Proof fetched → Transaction built → ✅ Success
```

## Verification

Your cNFT is real if:
- ✅ You created it using Metaplex/Bubblegum
- ✅ It exists on-chain (viewable in explorer)
- ✅ Helius DAS API can find it
- ✅ You own it in your connected wallet
- ✅ It's on devnet (for testing)

## Files Updated

All mock NFT data has been removed:
- `src/mocks/nfts.ts` → Empty (with warning)
- `src/hooks/use-user-nfts.ts` → Deprecated (use `useUserCNFTs`)
- `src/components/fractionalization/select-nft-step.tsx` → Shows warning if no cNFTs

## Need Help?

1. Read `CNFT_SETUP.md` for detailed instructions
2. Check `CNFT_INTEGRATION_SUMMARY.md` for technical details
3. Use Solana Playground (easiest way to create cNFT)

## Remember

**No shortcuts:** You can't skip creating the real cNFT. The Merkle proof MUST be real for on-chain verification to work.

---

**Ready?** Create your cNFT, add Helius key, and test! 🚀
