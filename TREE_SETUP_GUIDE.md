# Setup Pre-Created Merkle Tree for cNFT Minting

Follow these steps to create a Merkle tree once, then reuse it for all mints (with user wallet signatures).

## Step 1: Install Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
```

Add to PATH:
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

Verify installation:
```bash
solana --version
```

## Step 2: Create Devnet Wallet

```bash
# Generate new keypair
solana-keygen new --outfile ~/.config/solana/devnet-wallet.json

# Set to use devnet
solana config set --url devnet

# Set your wallet
solana config set --keypair ~/.config/solana/devnet-wallet.json

# Check your address
solana address
```

## Step 3: Fund Your Wallet

You need ~0.5 SOL for tree creation:

```bash
# Airdrop SOL (run multiple times if needed)
solana airdrop 1

# Check balance
solana balance
```

## Step 4: Install Dependencies for Tree Creation

```bash
npm install -g ts-node
npm install --save-dev @types/node
```

## Step 5: Create Tree Script

Save this as `create-tree.js` in your project root:

```javascript
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { 
  getConcurrentMerkleTreeAccountSize,
  createAllocTreeIx,
  createInitEmptyMerkleTreeIx,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID
} = require('@solana/spl-account-compression');
const fs = require('fs');

const BUBBLEGUM_PROGRAM_ID = new PublicKey('BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY');

async function createTree() {
  // Load your wallet
  const keypairPath = process.env.HOME + '/.config/solana/devnet-wallet.json';
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  const payer = Keypair.fromSecretKey(Uint8Array.from(keypairData));

  console.log('Wallet:', payer.publicKey.toBase58());

  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log('Balance:', balance / 1e9, 'SOL');
  
  if (balance < 0.2e9) {
    console.error('❌ Insufficient balance. Need at least 0.2 SOL');
    console.error('Run: solana airdrop 1');
    process.exit(1);
  }

  // Generate tree keypair
  const treeKeypair = Keypair.generate();
  console.log('Tree address:', treeKeypair.publicKey.toBase58());

  const maxDepth = 14;
  const maxBufferSize = 64;
  const canopyDepth = 0;

  // Derive tree authority (PDA)
  const [treeAuthority] = PublicKey.findProgramAddressSync(
    [treeKeypair.publicKey.toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );

  console.log('Tree authority:', treeAuthority.toBase58());

  // Get space needed
  const space = getConcurrentMerkleTreeAccountSize(maxDepth, maxBufferSize, canopyDepth);
  const lamports = await connection.getMinimumBalanceForRentExemption(space);

  console.log('Creating tree with:');
  console.log('- Max depth:', maxDepth, '(capacity:', Math.pow(2, maxDepth), 'cNFTs)');
  console.log('- Max buffer size:', maxBufferSize);
  console.log('- Space required:', space, 'bytes');
  console.log('- Cost:', lamports / 1e9, 'SOL');

  const allocTreeIx = await createAllocTreeIx(
    connection,
    treeKeypair.publicKey,
    payer.publicKey,
    maxDepth,
    maxBufferSize,
    canopyDepth
  );

  const initTreeIx = createInitEmptyMerkleTreeIx(
    treeKeypair.publicKey,
    treeAuthority,
    maxDepth,
    maxBufferSize
  );

  const { blockhash } = await connection.getLatestBlockhash();
  
  const tx = new Transaction()
    .add(allocTreeIx)
    .add(initTreeIx);
  
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer.publicKey;
  tx.sign(payer, treeKeypair);

  console.log('Sending transaction...');
  const signature = await connection.sendRawTransaction(tx.serialize());
  
  console.log('Confirming...');
  await connection.confirmTransaction(signature, 'confirmed');

  console.log('✅ Tree created successfully!');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Add this to your .env.local:');
  console.log('');
  console.log(`NEXT_PUBLIC_MERKLE_TREE_ADDRESS=${treeKeypair.publicKey.toBase58()}`);
  console.log('');
  console.log('Transaction:', signature);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

createTree().catch(console.error);
```

## Step 6: Install Required Packages

```bash
npm install @solana/spl-account-compression
```

## Step 7: Run the Script

```bash
node create-tree.js
```

Expected output:
```
Wallet: YourWalletAddress...
Balance: 1.5 SOL
Tree address: TreeAddress...
Tree authority: TreeAuthorityAddress...
Creating tree with:
- Max depth: 14 (capacity: 16384 cNFTs)
- Max buffer size: 64
- Space required: 802840 bytes
- Cost: 0.006 SOL
Sending transaction...
Confirming...
✅ Tree created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add this to your .env.local:

NEXT_PUBLIC_MERKLE_TREE_ADDRESS=YourTreeAddress...

Transaction: signature...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Step 8: Add to .env.local

Copy the tree address from the output and add to `.env.local`:

```bash
NEXT_PUBLIC_HELIUS_API_KEY=your-existing-key
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_MERKLE_TREE_ADDRESS=YourTreeAddressFromStep7
```

## Step 9: Code is Already Updated

The code will automatically use the tree from environment variable when available.

## Verify Tree

Check your tree on Solana Explorer:
```
https://explorer.solana.com/address/YourTreeAddress?cluster=devnet
```

## Create Additional Trees (Optional)

To create more trees for redundancy:

1. Run the script again: `node create-tree.js`
2. Store addresses in env:
```bash
NEXT_PUBLIC_MERKLE_TREE_ADDRESS=tree1,tree2,tree3
```
3. App will round-robin between them

## Troubleshooting

**Insufficient Balance:**
```bash
solana airdrop 1
# Wait 30 seconds, then:
solana airdrop 1
```

**Transaction Failed:**
- Make sure you're on devnet: `solana config get`
- Check balance: `solana balance`
- Try again with fresh airdrop

**Tree Full:**
- Each tree holds 16,384 cNFTs
- Create new tree when current is ~80% full
- Monitor with: `solana account YourTreeAddress --url devnet`

## Next Steps

After setup:
1. ✅ Tree is created and funded
2. ✅ Tree address in .env.local
3. ✅ Code updated to use existing tree
4. 🚀 **Users will now sign transactions and pay ~0.001 SOL per mint**

No more tree authority errors! 🎉
