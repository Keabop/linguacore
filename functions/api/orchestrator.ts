import type { AgentType } from '../../api/lib/gemini.js';
import { chat } from '../../api/agents/conversation-tutor.js';
import { generateStory } from '../../api/agents/story-generator.js';
import { enrichVocabulary } from '../../api/agents/vocab-enricher.js';
import { createExercise } from '../../api/agents/exercise-creator.js';
import { evaluateWriting } from '../../api/agents/writing-evaluator.js';
import { env, setEnv } from '../../api/lib/config.js';
import { checkUsageLimit, checkWeeklyLimit, incrementUsage, getUserTier } from '../../api/lib/usageLimits.js';
import { isCacheable, generateCacheKey, getCachedResponse, setCachedResponse } from '../../api/lib/aiCache.js';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// CORS Setup
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
    'https://linguacore-zeta.vercel.app',
    'https://voxie.pages.dev',
    'https://voxie.lat',
    'https://www.voxie.lat',
    'http://localhost:8788', // Cloudflare local Wrangler dev server
    'http://localhost:5173',
    'http://localhost:4173',
];

function getCorsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get('Origin') ?? '';
    const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
    };
}

// ---------------------------------------------------------------------------
// Rate Limiter
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Authenticate
// ---------------------------------------------------------------------------
async function authenticate(request: Request): Promise<string | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;
    return user.id;
}

// ---------------------------------------------------------------------------
// Input Size Validator (from security patch)
// ---------------------------------------------------------------------------
function validateInputSize(agent: AgentType, params: any): { valid: boolean; error?: string } {
    if (!params) return { valid: true };

    switch (agent) {
        case 'conversation-tutor': {
            const messages = params.messages;
            if (!Array.isArray(messages)) {
                return { valid: false, error: 'Formato de mensajes inválido.' };
            }
            if (messages.length > 15) {
                return { valid: false, error: 'La conversación es demasiado larga. Intenta iniciar un nuevo chat.' };
            }
            
            let totalLength = 0;
            for (const msg of messages) {
                if (typeof msg.content !== 'string') {
                    return { valid: false, error: 'El contenido del mensaje debe ser texto.' };
                }
                if (msg.content.length > 1000) {
                    return { valid: false, error: 'El mensaje es demasiado largo (máximo 1000 caracteres).' };
                }
                totalLength += msg.content.length;
            }
            
            if (totalLength > 10000) {
                return { valid: false, error: 'El historial de chat supera el límite permitido de caracteres.' };
            }
            break;
        }
        case 'story-generator': {
            if (params.topic && typeof params.topic === 'string' && params.topic.length > 500) {
                return { valid: false, error: 'El tema de la historia es demasiado largo (máximo 500 caracteres).' };
            }
            break;
        }
        case 'vocab-enricher': {
            if (params.word && typeof params.word === 'string' && params.word.length > 100) {
                return { valid: false, error: 'La palabra o frase es demasiado larga (máximo 100 caracteres).' };
            }
            break;
        }
        case 'exercise-creator': {
            if (params.topic && typeof params.topic === 'string' && params.topic.length > 500) {
                return { valid: false, error: 'El tema para el ejercicio es demasiado largo (máximo 500 caracteres).' };
            }
            break;
        }
        case 'writing-evaluator': {
            if (params.text && typeof params.text === 'string' && params.text.length > 3000) {
                return { valid: false, error: 'El texto a evaluar es demasiado largo (máximo 3000 caracteres).' };
            }
            break;
        }
    }

    return { valid: true };
}

// ---------------------------------------------------------------------------
// Cloudflare Pages Function Entry Point
// ---------------------------------------------------------------------------
export const onRequestPost: PagesFunction = async (context) => {
    const { request, env: bindings } = context;
    setEnv(bindings); // Inyectar las variables de entorno de Cloudflare

    const corsHeaders = getCorsHeaders(request);

    // Rate limit by IP
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(ip)) {
        return new Response(JSON.stringify({ error: 'Too many requests. Try again later.' }), {
            status: 429,
            headers: corsHeaders,
        });
    }

    // Authenticate
    const userId = await authenticate(request);
    if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized — valid Supabase session required' }), {
            status: 401,
            headers: corsHeaders,
        });
    }

    // Fetch user tier for per-user limits
    const userTier = await getUserTier(userId);

    try {
        const { agent, params } = await request.json() as { agent: AgentType; params: any };

        if (!agent) {
            return new Response(JSON.stringify({ error: 'Missing "agent" field in request body' }), {
                status: 400,
                headers: corsHeaders,
            });
        }

        // Validate agent name
        const VALID_AGENTS: AgentType[] = ['story-generator', 'vocab-enricher', 'exercise-creator', 'conversation-tutor', 'writing-evaluator'];
        if (!VALID_AGENTS.includes(agent)) {
            return new Response(JSON.stringify({ error: `Unknown agent: ${agent}` }), {
                status: 400,
                headers: corsHeaders,
            });
        }

        // Validate input size
        const validation = validateInputSize(agent, params);
        if (!validation.valid) {
            return new Response(JSON.stringify({ error: 'input_too_large', message: validation.error }), {
                status: 400,
                headers: corsHeaders,
            });
        }

        // --- Usage limits check ---
        if (agent === 'conversation-tutor') {
            const usage = await checkUsageLimit(userId, 'conversation-tutor', userTier);
            if (!usage.allowed) {
                return new Response(JSON.stringify({
                    error: 'daily_limit_reached',
                    message: 'Has alcanzado el límite diario de mensajes del tutor. Actualiza a Pro para uso ilimitado.',
                    remaining: 0,
                }), {
                    status: 429,
                    headers: corsHeaders,
                });
            }
        }

        if (agent === 'story-generator') {
            const usage = await checkWeeklyLimit(userId, 'story-generator', userTier);
            if (!usage.allowed) {
                return new Response(JSON.stringify({
                    error: 'weekly_limit_reached',
                    message: 'Has alcanzado el límite semanal de historias. Actualiza a Pro para uso ilimitado.',
                    remaining: 0,
                }), {
                    status: 429,
                    headers: corsHeaders,
                });
            }
        }

        // --- Cache lookup ---
        let cacheKey: string | null = null;
        if (isCacheable(agent)) {
            try {
                cacheKey = generateCacheKey(agent, params);
                const cached = await getCachedResponse(cacheKey);
                if (cached) {
                    return new Response(JSON.stringify(cached), {
                        status: 200,
                        headers: corsHeaders,
                    });
                }
            } catch {
                // Cache miss or failure
            }
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

        // --- Cache store ---
        if (cacheKey && isCacheable(agent)) {
            setCachedResponse(cacheKey, agent, cacheKey, result).catch(() => {});
        }

        // --- Increment usage ---
        if (agent === 'conversation-tutor' || agent === 'story-generator') {
            incrementUsage(userId, agent).catch(() => {});
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (error: any) {
        const isSyntaxError = error instanceof SyntaxError;
        console.error(`[Orchestrator Edge Error]${isSyntaxError ? ' (JSON parse failure)' : ''}`, error);
        return new Response(JSON.stringify({
            error: 'Agent execution failed',
            message: isSyntaxError ? 'AI returned invalid JSON. Please try again.' : (error.message || 'Unknown error'),
        }), {
            status: 500,
            headers: corsHeaders,
        });
    }
};

// CORS Preflight Options handling
export const onRequestOptions: PagesFunction = async (context) => {
    return new Response(null, {
        status: 204,
        headers: getCorsHeaders(context.request),
    });
};
