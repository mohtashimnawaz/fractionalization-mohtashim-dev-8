import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  const treeAddress = process.env.NEXT_PUBLIC_MERKLE_TREE_ADDRESS;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT_SET',
    hasTreeAddress: !!treeAddress,
    treeAddress: treeAddress || 'NOT_SET',
    allEnvVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
  });
}
