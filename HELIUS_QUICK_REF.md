# Quick Reference: Helius + cNFT Integration

## Environment Setup

```bash
# .env.local
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

## Key Functions

### Fetch User's cNFTs
```typescript
import { useUserCNFTs } from '@/hooks';

const { data: cnfts, isLoading, error, refetch } = useUserCNFTs(walletAddress);
```

### Get Merkle Proof
```typescript
import { useCNFTProof } from '@/hooks';

const { data: proof } = useCNFTProof(assetId);
// proof.proof = string[] of proof nodes
// proof.tree_id = Merkle tree address
// proof.leaf = leaf hash
// proof.node_index = leaf index in tree
```

### Fractionalize with Proof
```typescript
import { useFractionalize } from '@/hooks';

const { mutate: fractionalize } = useFractionalize();

fractionalize({
  nftMint: assetId,      // cNFT asset ID
  tokenName: 'My Token',
  tokenSymbol: 'MTK',
  totalSupply: 1000000,
});

// Proof is automatically fetched and included in transaction
```

## Anchor Program Integration

When you deploy your program, update `src/hooks/use-fractionalize.ts`:

```typescript
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { YourProgram } from '../anchor/target/types/your_program';

// Inside fractionalizeCompressedNFT:
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program<YourProgram>(IDL, provider);

const tx = await program.methods
  .fractionalize(
    tokenName,
    tokenSymbol,
    new BN(totalSupply),
    proof.root,
    proof.leaf,
    new BN(proof.node_index)
  )
  .accounts({
    authority: walletPublicKey,
    merkleTree: new PublicKey(proof.tree_id),
    // ... your other accounts
  })
  .remainingAccounts(
    proofToAccounts(proof).map(pubkey => ({
      pubkey,
      isSigner: false,
      isWritable: false,
    }))
  )
  .rpc();

return tx;
```

## DAS API Endpoints Used

| Function | Helius Method | Purpose |
|----------|---------------|---------|
| `getAssetsByOwner()` | `getAssetsByOwner` | Fetch all cNFTs for a wallet |
| `getAsset()` | `getAsset` | Get detailed cNFT metadata |
| `getAssetProof()` | `getAssetProof` | Get Merkle proof for transactions |

## Proof Structure

```typescript
interface AssetProof {
  root: string;           // Merkle tree root
  proof: string[];        // Array of proof node hashes
  node_index: number;     // Leaf index in tree
  leaf: string;           // Leaf hash
  tree_id: string;        // Merkle tree public key
}
```

## Transaction Flow

```
1. User selects cNFT
2. Frontend calls getAssetProof(assetId)
3. Proof returned with tree + proof nodes
4. Build Anchor transaction:
   - Include proof.root, proof.leaf, proof.node_index as instruction args
   - Pass proof nodes as remaining_accounts
5. User signs
6. Program verifies proof on-chain
7. cNFT fractionalized ✅
```

## Useful Links

- Helius Dashboard: https://www.helius.dev/
- DAS API Docs: https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api
- Metaplex Bubblegum: https://developers.metaplex.com/bubblegum
- Solana Cookbook: https://solanacookbook.com/

## Testing Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Check TypeScript
npm run typecheck
```

## Ready to Deploy?

1. ✅ Helius API key in `.env.local`
2. ✅ Test cNFT created on devnet
3. ✅ UI tested (mocked transactions work)
4. ⏳ Deploy Anchor program to devnet
5. ⏳ Update `use-fractionalize.ts` with real tx
6. ⏳ Test complete flow

---

**All set!** 🚀
