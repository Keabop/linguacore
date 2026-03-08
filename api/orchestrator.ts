import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { generateStory } from './agents/story-generator.js';
import { enrichVocabulary } from './agents/vocab-enricher.js';
import { createExercise } from './agents/exercise-creator.js';
import { chat } from './agents/conversation-tutor.js';
import { evaluateWriting } from './agents/writing-evaluator.js';
import type { AgentType } from './lib/gemini.js';

const ALLOWED_ORIGINS = [
    'https://linguacore-zeta.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173',
];

function getCorsOrigin(req: VercelRequest): string {
    const origin = req.headers.origin ?? '';
    return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

/** Validate Supabase JWT from Authorization header */
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

/** Simple in-memory rate limiter (resets on cold start) */
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const corsOrigin = getCorsOrigin(req);
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limit by IP
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) {
        return res.status(429).json({ error: 'Too many requests. Try again later.' });
    }

    // Authenticate — require valid Supabase JWT
    const userId = await authenticate(req);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized — valid Supabase session required' });
    }

    try {
        const { agent, params } = req.body as { agent: AgentType; params: any };

        if (!agent) {
            return res.status(400).json({ error: 'Missing "agent" field in request body' });
        }

        // Validate agent name before dispatching
        const VALID_AGENTS: AgentType[] = ['story-generator', 'vocab-enricher', 'exercise-creator', 'conversation-tutor', 'writing-evaluator'];
        if (!VALID_AGENTS.includes(agent)) {
            return res.status(400).json({ error: `Unknown agent: ${agent}` });
        }

        let result: any;

        switch (agent) {
            case 'story-generator':
                result = await generateStory(params);
                break;
            case 'vocab-enricher':
                result = await enrichVocabulary(params);
                break;
            case 'exercise-creator':
                result = await createExercise(params);
                break;
            case 'conversation-tutor':
                result = await chat(params);
                break;
            case 'writing-evaluator':
                result = await evaluateWriting(params);
                break;
        }

        return res.status(200).json(result);
    } catch (error: any) {
        const isSyntaxError = error instanceof SyntaxError;
        console.error(`[Orchestrator Error]${isSyntaxError ? ' (JSON parse failure)' : ''}`, error);
        return res.status(500).json({
            error: 'Agent execution failed',
            message: isSyntaxError
                ? 'AI returned invalid JSON. Please try again.'
                : (error.message || 'Unknown error'),
        });
    }
}
