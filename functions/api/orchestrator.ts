import { AGENT_TYPES, type AgentType } from '../../server/lib/gemini.js';
import { chat } from '../../server/agents/conversation-tutor.js';
import { generateStory } from '../../server/agents/story-generator.js';
import { enrichVocabulary } from '../../server/agents/vocab-enricher.js';
import { createExercise } from '../../server/agents/exercise-creator.js';
import { evaluateWriting } from '../../server/agents/writing-evaluator.js';
import { generateCareerDeck } from '../../server/agents/career-deck.js';
import { evaluateSpeaking } from '../../server/agents/speaking-evaluator.js';
import { env, setEnv } from '../../server/lib/config.js';
import { checkUsageLimit, checkWeeklyLimit, incrementUsage, getUserTier } from '../../server/lib/usageLimits.js';
import { accessTier } from '../../server/lib/roles.js';
import { isCacheable, generateCacheKey, getCachedResponse, setCachedResponse } from '../../server/lib/aiCache.js';
import { createClient, type User } from '@supabase/supabase-js';
import { getCorsHeaders } from '../../server/lib/cors.js';

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
async function authenticate(request: Request): Promise<User | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;
    return user;
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
        case 'career-deck': {
            if (typeof params.profession !== 'string' || params.profession.length > 100) {
                return { valid: false, error: 'La profesión es demasiado larga (máximo 100 caracteres).' };
            }
            break;
        }
        case 'speaking-evaluator': {
            const { transcripts, prompts } = params;
            if (!Array.isArray(transcripts) || !Array.isArray(prompts) || transcripts.length > 10 || prompts.length > 10) {
                return { valid: false, error: 'Formato de respuestas orales inválido.' };
            }
            const all = [...transcripts, ...prompts];
            if (all.some(t => typeof t !== 'string' || t.length > 3000)) {
                return { valid: false, error: 'Cada respuesta oral debe ser texto de máximo 3000 caracteres.' };
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

    const corsHeaders = getCorsHeaders(request, 'POST, OPTIONS');

    // Rate limit by IP
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(ip)) {
        return new Response(JSON.stringify({ error: 'Too many requests. Try again later.' }), {
            status: 429,
            headers: corsHeaders,
        });
    }

    // Authenticate
    const user = await authenticate(request);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized — valid Supabase session required' }), {
            status: 401,
            headers: corsHeaders,
        });
    }

    // Fetch user tier for per-user limits
    const userId = user.id;
    const userTier = accessTier(user, await getUserTier(userId));

    try {
        const { agent, params } = await request.json() as { agent: AgentType; params: any };

        if (!agent) {
            return new Response(JSON.stringify({ error: 'Missing "agent" field in request body' }), {
                status: 400,
                headers: corsHeaders,
            });
        }

        // Validate agent name
        if (!AGENT_TYPES.includes(agent)) {
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
            case 'career-deck':
                result = await generateCareerDeck(params);
                break;
            case 'speaking-evaluator':
                result = await evaluateSpeaking(params);
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
            message: isSyntaxError ? 'AI returned invalid JSON. Please try again.' : 'Unexpected error. Please try again.',
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
        headers: getCorsHeaders(context.request, 'POST, OPTIONS'),
    });
};
