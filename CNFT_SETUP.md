# Compressed NFT Setup Guide for Testing

⚠️ **IMPORTANT: You MUST create a REAL compressed NFT on Solana devnet.**

Mock NFTs will NOT work because Merkle proofs must match actual on-chain tree structures. The proof verification will fail with mock data.

## Why Real cNFTs Are Required

- Compressed NFTs use Merkle trees stored on-chain
- Each cNFT has a unique proof path in the tree
- Your fractionalization program will verify the proof on-chain
- Mock proofs will always fail verification
- **You need a real cNFT in your devnet wallet to test**

## Prerequisites

- Solana CLI installed and configured for devnet
- A devnet wallet with some SOL (get from [Solana Faucet](https://faucet.solana.com/))
- Node.js and npm installed

## Quick Setup

### 1. Get Helius API Key

1. Go to [Helius](https://www.helius.dev/)
2. Sign up for a free account
3. Create a new API key
4. Copy your API key

### 2. Configure Environment

Create `.env.local` in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Helius API key:

```env
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key_here
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### 3. Create a Compressed NFT on Devnet

#### Option A: Using Metaplex Sugar CLI (Recommended)

1. Install Sugar CLI:
```bash
npm install -g @metaplex-foundation/sugar-cli
```

2. Create a collection config:
```bash
mkdir cnft-test && cd cnft-test
```

3. Create `config.json`:
```json
{
  "price": 0,
  "number": 1,
  "symbol": "TEST",
  "sellerFeeBasisPoints": 500,
  "gatekeeper": null,
  "solTreasuryAccount": "YOUR_WALLET_ADDRESS",
  "splTokenAccount": null,
  "splToken": null,
  "goLiveDate": "2024-01-01T00:00:00Z",
  "endSettings": null,
  "whitelistMintSettings": null,
  "hiddenSettings": null,
  "uploadMethod": "bundlr",
  "retainAuthority": true,
  "isMutable": true,
  "creators": [
    {
      "address": "YOUR_WALLET_ADDRESS",
      "share": 100
    }
  ]
}
```

4. Create `assets` folder with your NFT:
```bash
mkdir assets
```

5. Add files:
- `assets/0.json` - Metadata
- `assets/0.png` - Image

Example `0.json`:
```json
{
  "name": "Test Compressed NFT #1",
  "symbol": "TCNFT",
  "description": "A test compressed NFT for fractionalization",
  "image": "0.png",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Test"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "0.png",
        "type": "image/png"
      }
    ],
    "category": "image"
  }
}
```

6. Upload and create cNFT:
```bash
sugar upload
sugar deploy
sugar mint
```

#### Option B: Using TypeScript (Metaplex SDK)

1. Install dependencies:
```bash
npm install @metaplex-foundation/js @solana/web3.js
```

2. Create `create-cnft.ts`:
```typescript
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import fs from 'fs';

const connection = new Connection(clusterApiUrl('devnet'));
const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync('path/to/your/keypair.json', 'utf-8')))
);

const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(wallet));

async function createCompressedNFT() {
  const { nft } = await metaplex.nfts().create({
    uri: 'https://arweave.net/your-metadata-uri',
    name: 'Test Compressed NFT',
    sellerFeeBasisPoints: 500,
    isCompressed: true,
    maxDepth: 14,
    maxBufferSize: 64,
  });

  console.log('Created cNFT:', nft.address.toString());
}

createCompressedNFT();
```

3. Run:
```bash
ts-node create-cnft.ts
```

#### Option C: Using Solana Playground (Easiest for Quick Testing)

1. Go to [Solana Playground](https://beta.solpg.io/)
2. Switch to devnet
3. Use their built-in tools to create a compressed NFT collection
4. Mint a cNFT to your wallet

## Verify Your cNFT

Once created, verify your cNFT appears in the app:

1. Start the dev server:
```bash
npm run dev
```

2. Connect your wallet (the one that owns the cNFT)

3. Navigate to `/fractionalize`

4. You should see your compressed NFT in the selection grid with a "cNFT" badge

## Testing the Fractionalization Flow

### Current State (Before Program Deployment)

The frontend is ready but using mock transactions:

1. Select your cNFT from the list
2. Configure token parameters (name, symbol, supply)
3. Click "Fractionalize"
4. The app will:
   - ✅ Fetch your cNFT from Helius
   - ✅ Get the Merkle proof
   - ✅ Build transaction structure
   - ⏳ **Mock the transaction** (real tx will be enabled when program is deployed)

You'll see console logs showing:
- Merkle proof fetched
- Tree ID and proof length
- Transaction would be built with proof in `remaining_accounts`

### After Program Deployment

Once you deploy the Anchor program to devnet:

1. Update `/Users/mohtashimnawaz/Desktop/fractionalization/anchor/target/idl/fractionalizationskytrade.json` with the deployed program IDL

2. Update `src/hooks/use-fractionalize.ts` to replace the mock transaction with real Anchor calls:

```typescript
const transaction = await program.methods
  .fractionalize(
    params.tokenName,
    params.tokenSymbol,
    new BN(params.totalSupply),
    proof.root,
    proof.leaf,
    new BN(proof.node_index)
  )
  .accounts({
    authority: walletPublicKey,
    merkleTree: treePublicKey,
    // ... other accounts from your program
  })
  .remainingAccounts(
    proofAccounts.map((pubkey) => ({
      pubkey,
      isSigner: false,
      isWritable: false,
    }))
  )
  .rpc();
```

3. Test the full flow end-to-end

## Troubleshooting

### "No compressed NFTs found"

- Make sure you're connected with the wallet that owns the cNFT
- Verify you're on devnet
- Check Helius API key is correct in `.env.local`
- Try refreshing the page or clicking the "Refresh" button

### "Failed to fetch Merkle proof"

- Helius free tier has rate limits - wait a moment and retry
- Verify the cNFT exists on devnet
- Check console for specific error messages

### "Wallet not connected"

- Install a Solana wallet extension (Phantom, Solflare, etc.)
- Make sure wallet is set to devnet
- Click "Select Wallet" in the app header

## Useful Resources

- [Helius DAS API Docs](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api)
- [Metaplex Compressed NFTs Guide](https://developers.metaplex.com/bubblegum)
- [Solana Cookbook - Compressed NFTs](https://solanacookbook.com/references/nfts.html#compressed-nfts)
- [Anchor Program Examples](https://www.anchor-lang.com/docs/programs)

## Next Steps

1. ✅ Get Helius API key and add to `.env.local`
2. ✅ Create a test cNFT on devnet in your wallet
3. ✅ Test the UI flow (should show your cNFT and build mock transactions)
4. ⏳ Deploy your Anchor program to devnet
5. ⏳ Update `use-fractionalize.ts` with real transaction building
6. ✅ Test complete fractionalization flow

---

**Ready to test?** Start with Step 1-3, then let me know when your program is deployed and I'll help you integrate the real transactions! 🚀
