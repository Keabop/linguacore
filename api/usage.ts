import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getUserTier, getAllLimitsForUser } from './lib/usageLimits.js';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
    'https://linguacore-zeta.vercel.app',
    'https://voxie.lat',
    'https://www.voxie.lat',
    'http://localhost:5173',
    'http://localhost:4173',
];

function getCorsOrigin(req: VercelRequest): string {
    const origin = req.headers.origin ?? '';
    return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

// ---------------------------------------------------------------------------
// Auth — same pattern as orchestrator.ts
// ---------------------------------------------------------------------------
async function authenticate(req: VercelRequest): Promise<string | null> {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;
    return user.id;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const corsOrigin = getCorsOrigin(req);
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Authenticate
    const userId = await authenticate(req);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized — valid Supabase session required' });
    }

    try {
        const tier = await getUserTier(userId);
        const limits = await getAllLimitsForUser(userId, tier);

        return res.status(200).json({ tier, limits });
    } catch (error: any) {
        console.error('[Usage API] Error:', error);
        return res.status(500).json({ error: 'Failed to fetch usage data' });
    }
}
