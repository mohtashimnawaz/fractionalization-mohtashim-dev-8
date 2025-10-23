#!/usr/bin/env node
const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function checkSetup() {
  console.log('');
  console.log('🔍 Checking setup for cNFT tree creation...');
  console.log('');

  const checks = {
    wallet: false,
    balance: false,
    helius: false,
    tree: false,
  };

  // Check 1: Wallet exists
  let walletPath = path.join(process.env.HOME, '.config/solana/id.json');
  
  if (!fs.existsSync(walletPath)) {
    walletPath = path.join(process.env.HOME, '.config/solana/devnet-wallet.json');
  }
  
  if (fs.existsSync(walletPath)) {
    checks.wallet = true;
    console.log('✅ Wallet found:', walletPath);
    
    try {
      const keypairData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
      const publicKey = new PublicKey(keypairData.slice(32, 64));
      console.log('   Address:', publicKey.toBase58());
    } catch (e) {
      console.log('   ⚠️  Could not read wallet address');
    }
  } else {
    console.log('❌ Wallet NOT found');
    console.log('   Expected locations:');
    console.log('     ~/.config/solana/id.json');
    console.log('     ~/.config/solana/devnet-wallet.json');
    console.log('');
    console.log('   Create one with:');
    console.log('   solana-keygen new');
  }
  console.log('');

  // Check 2: Balance (if wallet exists)
  if (checks.wallet) {
    try {
      const keypairData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
      const publicKey = new PublicKey(keypairData.slice(32, 64));
      
      const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
      const endpoint = apiKey 
        ? `https://devnet.helius-rpc.com/?api-key=${apiKey}`
        : 'https://api.devnet.solana.com';
      
      const connection = new Connection(endpoint, 'confirmed');
      const balance = await connection.getBalance(publicKey);
      const balanceSOL = balance / 1e9;
      
      console.log('💰 Balance:', balanceSOL.toFixed(4), 'SOL');
      
      if (balanceSOL >= 0.2) {
        checks.balance = true;
        console.log('   ✅ Sufficient balance for tree creation');
      } else {
        console.log('   ❌ Insufficient balance (need at least 0.2 SOL)');
        console.log('');
        console.log('   Get devnet SOL:');
        console.log('   solana airdrop 1 --url devnet');
        console.log('   (run multiple times to get ~0.5 SOL)');
      }
    } catch (e) {
      console.log('⚠️  Could not check balance:', e.message);
    }
  } else {
    console.log('⏭️  Skipping balance check (no wallet)');
  }
  console.log('');

  // Check 3: Helius API key
  const heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  if (heliusKey && heliusKey.length > 20) {
    checks.helius = true;
    console.log('✅ Helius API key configured');
    console.log('   Key:', heliusKey.substring(0, 8) + '...' + heliusKey.substring(heliusKey.length - 4));
  } else {
    console.log('⚠️  Helius API key not found (will use public RPC)');
    console.log('   Public RPC is slower but works fine');
  }
  console.log('');

  // Check 4: Tree address in .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const treeMatch = envContent.match(/NEXT_PUBLIC_MERKLE_TREE_ADDRESS=([A-Za-z0-9]+)/);
    
    if (treeMatch && treeMatch[1]) {
      checks.tree = true;
      console.log('✅ Merkle tree configured:', treeMatch[1]);
      console.log('   Mode: User Wallet Signing (Mode 1)');
      console.log('');
      console.log('   🎉 You\'re all set! Users will sign transactions.');
    } else {
      console.log('⏳ Merkle tree NOT configured');
      console.log('   Mode: Helius API Fallback (Mode 2)');
      console.log('');
      console.log('   To enable user wallet signing:');
      console.log('   1. Run: node create-tree.js');
      console.log('   2. Add tree address to .env.local');
      console.log('   3. Restart dev server');
    }
  } else {
    console.log('❌ .env.local not found');
  }
  console.log('');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📊 Setup Summary:');
  console.log('');
  console.log(`   Wallet:         ${checks.wallet ? '✅' : '❌'}`);
  console.log(`   Balance (0.2+): ${checks.balance ? '✅' : '❌'}`);
  console.log(`   Helius API:     ${checks.helius ? '✅' : '⚠️ '} (optional)`);
  console.log(`   Merkle Tree:    ${checks.tree ? '✅' : '⏳'}`);
  console.log('');

  if (checks.wallet && checks.balance && !checks.tree) {
    console.log('🚀 Ready to create tree! Run:');
    console.log('');
    console.log('   node create-tree.js');
    console.log('');
  } else if (checks.tree) {
    console.log('🎉 All set! User wallet signing is enabled.');
    console.log('');
    console.log('   Test by running: npm run dev');
    console.log('   Then navigate to: http://localhost:3000/fractionalize');
    console.log('');
  } else {
    console.log('⏳ Follow steps above to complete setup');
    console.log('');
    console.log('   Quick start: See QUICK_START.md');
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

checkSetup().catch(console.error);
