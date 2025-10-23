import type { NextRequest } from 'next/server';
import { getHeliusRpcUrl } from '@/lib/helius';

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { name, symbol, owner, description, imageUrl, attributes } = body;

		if (!name || !symbol || !owner) {
			return new Response(JSON.stringify({ error: 'Missing required fields: name, symbol, owner' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}

		const endpoint = getHeliusRpcUrl();

		const resp = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 'helius-mint',
				method: 'mintCompressedNft',
				params: {
					name,
					symbol,
					owner,
					description: description || `A compressed NFT: ${name}`,
					attributes: attributes || [],
					imageUrl: imageUrl || 'https://arweave.net/placeholder-image',
					sellerFeeBasisPoints: 500,
				},
			}),
		});

		if (!resp.ok) {
			const txt = await resp.text();
			return new Response(JSON.stringify({ error: `Helius error: ${resp.status} - ${txt}` }), { status: 502, headers: { 'content-type': 'application/json' } });
		}

		const data = await resp.json();
		if (data.error) {
			return new Response(JSON.stringify({ error: data.error }), { status: 502, headers: { 'content-type': 'application/json' } });
		}

		return new Response(JSON.stringify({ signature: data.result.signature, assetId: data.result.assetId }), { status: 200, headers: { 'content-type': 'application/json' } });
	} catch (err: any) {
		console.error('API /api/mint-cnft error:', err);
		return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
	}
}

export async function GET() {
	return new Response(JSON.stringify({ status: 'mint-cnft endpoint' }), { status: 200, headers: { 'content-type': 'application/json' } });
}
