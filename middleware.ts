import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const config = { matcher: '/api/:path*' };

const ALLOWED_ORIGINS = [
    'https://linguacore-zeta.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173',
];

// Simple in-memory rate limiter (resets on cold start — sufficient for burst protection)
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const timestamps = hits.get(ip)?.filter(t => now - t < WINDOW_MS) ?? [];
    timestamps.push(now);
    hits.set(ip, timestamps);
    return timestamps.length > MAX_REQUESTS;
}

export default function middleware(req: NextRequest) {
    const origin = req.headers.get('origin') ?? '';
    const referer = req.headers.get('referer') ?? '';

    const isAllowed = ALLOWED_ORIGINS.some(
        o => origin.startsWith(o) || referer.startsWith(o),
    );

    // Allow preflight
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    // Origin check
    if (!isAllowed) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: 'Too many requests. Try again later.' },
            { status: 429 },
        );
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    return response;
}
