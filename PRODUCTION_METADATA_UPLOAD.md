# 📦 Production Metadata Upload Guide

## ⚠️ Current Implementation

**Status**: Using **mock Arweave URLs** for testing

The current `uploadMetadata()` function in `src/hooks/use-mint-cnft.ts` generates fake Arweave-style URLs like:
```
https://arweave.net/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**This is only for testing!** The URLs don't actually contain any metadata.

---

## 🚀 Production Solutions

### Option 1: Metaplex Sugar CLI (Recommended for Bulk)

**Best for**: Bulk minting, pre-prepared assets

```bash
# Install Sugar CLI
bash <(curl -sSf https://sugar.metaplex.com/install.sh)

# Prepare your assets folder
mkdir -p assets
# Add files: 0.json, 0.png, 1.json, 1.png, etc.

# Upload to Arweave via Bundlr
sugar upload

# This gives you real Arweave URIs for each asset
```

**Pros**:
- Official Metaplex tool
- Handles batching automatically
- Optimized for Bubblegum/cNFTs
- One-time upload cost (~0.01 SOL per NFT)

**Example assets structure**:
```
assets/
├── 0.json       # {"name": "NFT #1", "image": "0.png", ...}
├── 0.png
├── 1.json
├── 1.png
└── collection.json
```

### Option 2: Bundlr Network (Code-based)

**Best for**: Dynamic minting, programmatic upload

```typescript
import Bundlr from '@bundlr-network/client';
import { Connection, Keypair } from '@solana/web3.js';

async function uploadToBundlr(metadata: object): Promise<string> {
  const bundlr = new Bundlr(
    'https://devnet.bundlr.network',
    'solana',
    yourWalletKeypair,
    { providerUrl: 'https://api.devnet.solana.com' }
  );

  // Upload image first
  const imageResponse = await bundlr.uploadFile(imageBuffer);
  const imageUri = `https://arweave.net/${imageResponse.id}`;

  // Create metadata with image URI
  const metadataJson = {
    name: metadata.name,
    symbol: metadata.symbol,
    image: imageUri,
    // ... rest of metadata
  };

  // Upload metadata JSON
  const metadataResponse = await bundlr.upload(JSON.stringify(metadataJson), {
    tags: [{ name: 'Content-Type', value: 'application/json' }],
  });

  return `https://arweave.net/${metadataResponse.id}`;
}
```

**Costs**:
- ~0.00001 SOL per KB
- Image (~100KB): ~0.001 SOL
- Metadata JSON (~1KB): ~0.00001 SOL
- Total per NFT: ~0.0011 SOL

### Option 3: IPFS via nft.storage (Free)

**Best for**: Testing, low-cost solution

```typescript
import { NFTStorage, File } from 'nft.storage';

async function uploadToIPFS(metadata: object, imageBlob: Blob): Promise<string> {
  const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });

  // Upload to IPFS
  const nft = await client.store({
    name: metadata.name,
    description: metadata.description,
    image: new File([imageBlob], 'image.png', { type: 'image/png' }),
  });

  // Returns IPFS URI
  return nft.url; // ipfs://...
}
```

**Pros**:
- Free (up to 100GB)
- Simple API
- Good for testing

**Cons**:
- IPFS gateway required for viewing
- Less permanent than Arweave
- Gateway reliability varies

### Option 4: Server-Side Upload API Route

**Best for**: Production web apps with dynamic minting

Create `/api/upload-metadata/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import Bundlr from '@bundlr-network/client';

export async function POST(request: Request) {
  const { name, symbol, description, imageUrl } = await request.json();

  // Initialize Bundlr with server-side wallet
  const bundlr = new Bundlr(
    'https://node1.bundlr.network',
    'solana',
    process.env.SERVER_WALLET_PRIVATE_KEY,
    { providerUrl: process.env.SOLANA_RPC_URL }
  );

  // Upload image if provided
  let finalImageUri = imageUrl;
  if (imageUrl && imageUrl.startsWith('data:')) {
    const imageBuffer = Buffer.from(imageUrl.split(',')[1], 'base64');
    const imageResponse = await bundlr.uploadFile(imageBuffer);
    finalImageUri = `https://arweave.net/${imageResponse.id}`;
  }

  // Create and upload metadata
  const metadata = {
    name,
    symbol,
    description,
    image: finalImageUri,
    attributes: [],
    properties: {
      category: 'image',
      files: [{ uri: finalImageUri, type: 'image/png' }],
    },
  };

  const metadataResponse = await bundlr.upload(JSON.stringify(metadata), {
    tags: [{ name: 'Content-Type', value: 'application/json' }],
  });

  return NextResponse.json({
    uri: `https://arweave.net/${metadataResponse.id}`,
  });
}
```

Then update `use-mint-cnft.ts`:

```typescript
async function uploadMetadata(params: MintCNFTParams): Promise<string> {
  const response = await fetch('/api/upload-metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  return data.uri;
}
```

---

## 🔧 Implementation Steps

### For Testing (Current):
✅ Mock URLs work fine for development
✅ Minting transactions succeed
✅ Tree functionality verified

### For Production:

1. **Choose a storage solution** (Arweave via Bundlr recommended)

2. **Install dependencies**:
   ```bash
   npm install @bundlr-network/client
   # or
   npm install nft.storage
   ```

3. **Add environment variables**:
   ```bash
   # For Bundlr
   SERVER_WALLET_PRIVATE_KEY=your-wallet-private-key
   
   # For nft.storage
   NFT_STORAGE_API_KEY=your-api-key
   ```

4. **Create upload API route** (Option 4 above)

5. **Update `uploadMetadata()` function** to call your API:
   ```typescript
   async function uploadMetadata(params: MintCNFTParams): Promise<string> {
     const response = await fetch('/api/upload-metadata', {
       method: 'POST',
       body: JSON.stringify(params),
     });
     return (await response.json()).uri;
   }
   ```

6. **Update `mintWithExistingTree()` to be async**:
   ```typescript
   const uri = await uploadMetadata(params);
   ```

7. **Test with real uploads**

---

## 💰 Cost Comparison

| Solution | Per Image | Per Metadata | Total/NFT | Permanence |
|----------|-----------|--------------|-----------|------------|
| Arweave (Bundlr) | ~0.001 SOL | ~0.00001 SOL | ~0.0011 SOL | Permanent |
| IPFS (nft.storage) | Free | Free | Free | Depends on pinning |
| Arweave (Direct) | ~0.01 SOL | ~0.0001 SOL | ~0.011 SOL | Permanent |

**Recommendation**: Use Arweave via Bundlr for production - best balance of cost and permanence.

---

## 📝 Metadata JSON Standard

Standard Metaplex metadata format:

```json
{
  "name": "My cNFT #1",
  "symbol": "CNFT",
  "description": "A compressed NFT",
  "image": "https://arweave.net/...",
  "animation_url": "https://arweave.net/...",
  "external_url": "https://example.com",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    }
  ],
  "properties": {
    "category": "image",
    "files": [
      {
        "uri": "https://arweave.net/...",
        "type": "image/png"
      }
    ]
  }
}
```

---

## 🚨 Important Notes

1. **URI Length Limit**: Max **200 characters** for Bubblegum program
2. **Metadata Permanence**: Arweave is permanent, IPFS needs pinning
3. **Costs**: Budget ~0.001-0.01 SOL per NFT for storage
4. **Server-side**: Upload from server to protect wallet keys
5. **Caching**: Consider caching uploaded URIs to avoid duplicates

---

## ✅ Quick Production Checklist

- [ ] Choose storage solution (Arweave/IPFS)
- [ ] Set up server-side wallet for uploads
- [ ] Create `/api/upload-metadata` route
- [ ] Install Bundlr or nft.storage SDK
- [ ] Update `uploadMetadata()` to call API
- [ ] Make `mintWithExistingTree()` async
- [ ] Test with real image uploads
- [ ] Monitor upload costs
- [ ] Implement error handling for failed uploads
- [ ] Add retry logic for network issues

---

**Current Status**: ✅ Minting works with mock URIs  
**Next Step**: Implement real metadata upload for production
