import type { NextRequest } from 'next/server';
import { getHeliusRpcUrl } from '@/lib/helius';

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { method, params } = body;

		if (!method) {
			return new Response(JSON.stringify({ error: 'Missing method in request body' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}

		const endpoint = getHeliusRpcUrl();

		const resp = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ jsonrpc: '2.0', id: 'proxy', method, params }),
		});

		const text = await resp.text();
		const contentType = resp.headers.get('content-type') || 'application/json';

		return new Response(text, { status: resp.status, headers: { 'content-type': contentType } });
	} catch (err: any) {
		console.error('/api/helius error:', err);
		return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
	}
}

export async function GET() {
	return new Response(JSON.stringify({ status: 'helius proxy endpoint' }), { status: 200, headers: { 'content-type': 'application/json' } });
}
