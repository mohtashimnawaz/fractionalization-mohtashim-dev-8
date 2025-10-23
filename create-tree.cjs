const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { createTree: createMerkleTree } = require('@metaplex-foundation/mpl-bubblegum');
const { keypairIdentity, generateSigner } = require('@metaplex-foundation/umi');
const fs = require('fs');
const path = require('path');

async function createTree() {
  try {
    // Load your wallet - try configured wallet first, then fallback
    let keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
    
    if (!fs.existsSync(keypairPath)) {
      keypairPath = path.join(process.env.HOME, '.config/solana/devnet-wallet.json');
    }
    
    if (!fs.existsSync(keypairPath)) {
      console.error('❌ Wallet not found');
      console.error('');
      console.error('Expected locations:');
      console.error('  ~/.config/solana/id.json');
      console.error('  ~/.config/solana/devnet-wallet.json');
      console.error('');
      console.error('Create one with:');
      console.error('  solana-keygen new');
      console.error('');
      console.error('Then fund it with:');
      console.error('  solana airdrop 1');
      process.exit(1);
    }

    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    const payer = Keypair.fromSecretKey(Uint8Array.from(keypairData));

    console.log('🔑 Wallet:', payer.publicKey.toBase58());
    console.log('');

    // Connect to devnet with Helius if available
    const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    const endpoint = apiKey 
      ? `https://devnet.helius-rpc.com/?api-key=${apiKey}`
      : 'https://api.devnet.solana.com';
    
    const connection = new Connection(endpoint, 'confirmed');
    
    // Check balance
    const balance = await connection.getBalance(payer.publicKey);
    console.log('💰 Balance:', (balance / 1e9).toFixed(4), 'SOL');
    console.log('');
    
    if (balance < 0.2e9) {
      console.error('❌ Insufficient balance. Need at least 0.2 SOL');
      console.error('');
      console.error('Get devnet SOL:');
      console.error('  solana airdrop 1');
      console.error('');
      process.exit(1);
    }

    console.log('🌳 Creating Merkle Tree...');
    console.log('');

    const maxDepth = 14;
    const maxBufferSize = 64;

    console.log('📋 Configuration:');
    console.log('   Max depth:', maxDepth, `(capacity: ${Math.pow(2, maxDepth).toLocaleString()} cNFTs)`);
    console.log('   Max buffer size:', maxBufferSize);
    console.log('');
    console.log('💵 Estimated cost: ~0.2-0.25 SOL');
    console.log('');
    console.log('⏳ Creating tree (this may take 30-60 seconds)...');
    console.log('');

    // Initialize UMI
    const umi = createUmi(endpoint);
    
    // Convert web3.js keypair to UMI format (UMI 0.9.2 format)
    const umiKeypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(payer.secretKey));
    
    umi.use(keypairIdentity(umiKeypair));

    // Generate tree signer using UMI
    const merkleTree = generateSigner(umi);

    console.log('   Tree address:', merkleTree.publicKey);
    console.log('');

    try {
      // Create the tree - UMI 0.9.2 returns a transaction builder
      const result = await createMerkleTree(umi, {
        merkleTree,
        maxDepth,
        maxBufferSize,
        public: false,
      });

      // Send the transaction
      await result.sendAndConfirm(umi);

      console.log('');
      console.log('✅ Tree created successfully!');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('📝 Add this to your .env.local file:');
      console.log('');
      console.log(`NEXT_PUBLIC_MERKLE_TREE_ADDRESS=${merkleTree.publicKey}`);
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('🔗 View on Solana Explorer:');
      console.log(`https://explorer.solana.com/address/${merkleTree.publicKey}?cluster=devnet`);
      console.log('');
      console.log('🎉 Users can now mint with wallet signatures!');
      console.log('');
    } catch (error) {
      console.error('');
      console.error('❌ Error creating tree:', error.message);
      console.error('');
      
      if (error.message.includes('insufficient funds')) {
        console.error('💡 Solution: Get more devnet SOL');
        console.error('   solana airdrop 1');
      } else if (error.message.includes('tree_authority') || error.message.includes('AccountNotInitialized')) {
        console.error('💡 This is a known SDK issue on devnet.');
        console.error('   Workaround: Use Helius API (Mode 2) for now.');
        console.error('   Tree-based minting works better on mainnet.');
      }
      
      throw error;
    }
  } catch (error) {
    console.error('');
    console.error('❌ Error creating tree:', error.message);
    console.error('');
    
    if (error.message.includes('insufficient funds')) {
      console.error('💡 Solution: Get more devnet SOL');
      console.error('   solana airdrop 1 --url devnet');
    }
    
    process.exit(1);
  }
}

createTree();
