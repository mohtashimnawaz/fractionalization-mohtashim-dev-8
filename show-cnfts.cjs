const { Connection, PublicKey } = require('@solana/web3.js');

const HELIUS_API_KEY = 'e8d45907-aaf1-4837-9bcd-b3652dcdaeb6';
const HELIUS_RPC_URL = `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const WALLET_ADDRESS = '6xX9G1jy4quapnew9CpHd1rz3pWKgysM2Q4MMBkmQMxN';

async function getAssetsByOwner(ownerAddress) {
  const response = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAssetsByOwner',
      params: {
        ownerAddress,
        page: 1,
        limit: 1000,
      },
    }),
  });

  const { result } = await response.json();
  return result;
}

async function main() {
  console.log('');
  console.log('🔍 Fetching compressed NFTs from Helius DAS API...');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📍 Wallet Address:', WALLET_ADDRESS);
  console.log('🌐 Network: Devnet');
  console.log('');

  try {
    const data = await getAssetsByOwner(WALLET_ADDRESS);
    
    const compressedNFTs = data.items.filter(asset => 
      asset.compression && asset.compression.compressed === true
    );

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📊 SUMMARY`);
    console.log('');
    console.log(`   Total Assets: ${data.total}`);
    console.log(`   Compressed NFTs: ${compressedNFTs.length}`);
    console.log(`   Regular NFTs: ${data.total - compressedNFTs.length}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (compressedNFTs.length > 0) {
      console.log('');
      console.log('🎨 YOUR COMPRESSED NFTs:');
      console.log('');
      
      compressedNFTs.forEach((asset, index) => {
        const name = asset.content?.metadata?.name || 'Unnamed';
        const symbol = asset.content?.metadata?.symbol || 'N/A';
        const description = asset.content?.metadata?.description || 'No description';
        const image = asset.content?.links?.image || asset.content?.files?.[0]?.uri || 'No image';
        
        console.log(`${index + 1}. ${name} (${symbol})`);
        console.log(`   ├─ Asset ID: ${asset.id}`);
        console.log(`   ├─ 🗜️  COMPRESSED: ${asset.compression.compressed ? '✅ YES' : '❌ NO'}`);
        console.log(`   ├─ Compression Details:`);
        console.log(`   │  ├─ Data Hash: ${asset.compression.data_hash}`);
        console.log(`   │  ├─ Creator Hash: ${asset.compression.creator_hash}`);
        console.log(`   │  ├─ Asset Hash: ${asset.compression.asset_hash}`);
        console.log(`   │  └─ Sequence: ${asset.compression.seq}`);
        console.log(`   ├─ Description: ${description}`);
        console.log(`   ├─ Image: ${image.substring(0, 60)}${image.length > 60 ? '...' : ''}`);
        console.log(`   ├─ Merkle Tree: ${asset.compression.tree}`);
        console.log(`   ├─ Leaf ID: ${asset.compression.leaf_id}`);
        console.log(`   ├─ Owner: ${asset.ownership.owner}`);
        
        if (asset.content?.metadata?.attributes && asset.content.metadata.attributes.length > 0) {
          console.log(`   ├─ Attributes:`);
          asset.content.metadata.attributes.forEach(attr => {
            console.log(`   │  • ${attr.trait_type}: ${attr.value}`);
          });
        }
        
        if (asset.creators && asset.creators.length > 0) {
          console.log(`   ├─ Creators:`);
          asset.creators.forEach(creator => {
            console.log(`   │  • ${creator.address} (${creator.share}%) ${creator.verified ? '✓' : ''}`);
          });
        }
        
        console.log(`   └─ Explorer: https://explorer.solana.com/address/${asset.id}?cluster=devnet`);
        console.log('');
      });
    } else {
      console.log('');
      console.log('❌ No compressed NFTs found in your wallet');
      console.log('');
      console.log('💡 To mint a cNFT:');
      console.log('   1. Go to: http://localhost:3000/fractionalize');
      console.log('   2. Click "Mint cNFT"');
      console.log('   3. Fill in the details and mint');
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ Done!');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error fetching cNFTs:', error.message);
    console.error('');
    
    if (error.message.includes('Failed to fetch') || error.message.includes('fetch failed')) {
      console.error('💡 Troubleshooting:');
      console.error('   • Check your internet connection');
      console.error('   • Verify Helius API key is valid');
      console.error('   • Make sure devnet.helius-rpc.com is accessible');
    }
    console.error('');
    process.exit(1);
  }
}

main();
