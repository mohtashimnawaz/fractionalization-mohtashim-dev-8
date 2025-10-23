# 🚀 Quick Start: Enable User Wallet Signing for cNFT Minting

## Current Status
✅ Code is ready and built successfully
✅ Dual-mode system implemented (auto-detects based on tree configuration)
⏳ Waiting for tree creation to enable user wallet signing

---

## What You Need to Do (5-10 minutes)

### Step 1: Install Dependencies (1 minute)
```bash
npm install @solana/spl-account-compression
```

### Step 2: Create Your Wallet (if you don't have one)
```bash
# Create new wallet
solana-keygen new --outfile ~/.config/solana/devnet-wallet.json

# Set it as default
solana config set --keypair ~/.config/solana/devnet-wallet.json
solana config set --url devnet
```

### Step 3: Fund Your Wallet (2 minutes)
```bash
# Request devnet SOL (run multiple times to get ~0.5 SOL)
solana airdrop 1

# Check balance
solana balance
```

**Note**: You need at least 0.2 SOL to create the tree (one-time cost)

### Step 4: Create the Merkle Tree (2 minutes)
```bash
# First, check your setup
node check-setup.cjs

# Then create the tree
node create-tree.cjs
```

**Expected Output:**
```
✅ Tree created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Add this to your .env.local file:

NEXT_PUBLIC_MERKLE_TREE_ADDRESS=A6W8AEE7wkejKnDb8yd1R2JxmPzSPMyJSoaCPL5Qk4JS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 5: Configure Environment (30 seconds)
Add the tree address to your `.env.local`:
```bash
NEXT_PUBLIC_MERKLE_TREE_ADDRESS=<your-tree-address-from-step-4>
```

### Step 6: Restart Dev Server (30 seconds)
```bash
# Stop current server (Ctrl+C)
# Start again to pick up new environment variable
npm run dev
```

---

## ✅ Testing User Wallet Signing

1. **Open your app**: http://localhost:3000/fractionalize
2. **Click "Mint cNFT"** button
3. **Fill the form** (name, symbol, description, imageUrl)
4. **Click "Mint cNFT"** in the dialog
5. **Wallet popup appears** 🎉 (Phantom/Solflare)
6. **Approve the transaction**
7. **You pay ~0.001 SOL** from your wallet
8. **cNFT minted** and appears in UI after 3-10 seconds

**Expected Console Log:**
```
🔐 Using existing tree - user will sign transaction
Tree Address: A6W8AEE7wkejKnDb8yd1R2JxmPzSPMyJSoaCPL5Qk4JS
```

**Expected Toast:**
```
🎉 cNFT Minted Successfully!
You signed and paid for this transaction
```

---

## 🔄 How It Works (No Code Changes Needed)

The system **automatically switches** between two modes:

### Mode 1: User Wallet Signing (with tree)
- ✅ **When**: `NEXT_PUBLIC_MERKLE_TREE_ADDRESS` is set
- ✅ **What**: Wallet popup appears
- ✅ **Who Pays**: User pays ~0.001 SOL
- ✅ **User Experience**: Full decentralization, user owns transaction

### Mode 2: Helius API Fallback (without tree)
- ⚡ **When**: `NEXT_PUBLIC_MERKLE_TREE_ADDRESS` is NOT set
- ⚡ **What**: Server-side minting via Helius API
- ⚡ **Who Pays**: Helius (free for user)
- ⚡ **User Experience**: Instant, no wallet popup

---

## 📊 Tree Capacity

Your tree can hold **16,384 cNFTs** (maxDepth 14)

To check how many you've used:
```bash
solana account <your-tree-address> --url devnet
```

When you reach 80% capacity (~13,000 mints):
1. Create a new tree with `node create-tree.cjs`
2. Update `.env.local` with new tree address
3. Restart dev server

**Pro Tip**: Create 2-3 trees upfront for redundancy

---

## 🐛 Troubleshooting

### "Insufficient balance" when creating tree
```bash
solana airdrop 1
# Wait 30 seconds, then repeat
solana airdrop 1
```

### Wallet popup doesn't appear when minting
1. Check `.env.local` has `NEXT_PUBLIC_MERKLE_TREE_ADDRESS`
2. Restart dev server (Ctrl+C, then `npm run dev`)
3. Check browser console for tree address log
4. Make sure wallet extension (Phantom/Solflare) is installed

### "Tree authority not found" error
- Tree wasn't created properly
- Run `create-tree.js` again
- Make sure you have sufficient balance

### Want to switch back to Helius API?
1. Remove or comment out `NEXT_PUBLIC_MERKLE_TREE_ADDRESS` from `.env.local`
2. Restart dev server
3. System automatically falls back to Helius API

---

## 📚 More Details

- **Full tree setup guide**: See `TREE_SETUP_GUIDE.md`
- **Why this approach**: See `WHY_NO_WALLET_SIGNING.md`
- **Implementation status**: See `CNFT_MINTING_STATUS.md`
- **Code location**: `src/hooks/use-mint-cnft.ts`

---

## ✨ What's Next?

After successfully testing:
1. Create 2-3 backup trees for production
2. Implement tree rotation logic (switch when one fills up)
3. Add tree capacity monitoring to admin dashboard
4. Upload metadata to Arweave/IPFS (currently using data URIs)
5. Test on mainnet (SDK works better there)

---

## 🎯 Success Criteria

You've completed setup when:
- ✅ Tree created successfully (address starts with capital letter)
- ✅ Tree address in `.env.local`
- ✅ Dev server restarted
- ✅ Wallet popup appears when minting
- ✅ User signs transaction
- ✅ User pays ~0.001 SOL
- ✅ cNFT appears in UI after 3-10 seconds

---

**Need Help?** Check console logs and wallet extension - they'll show what's happening!
