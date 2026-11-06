import { AGENT_TYPES, type AgentType } from '../../server/lib/gemini.js';
import { chat } from '../../server/agents/conversation-tutor.js';
import { generateStory } from '../../server/agents/story-generator.js';
import { enrichVocabulary } from '../../server/agents/vocab-enricher.js';
import { createExercise } from '../../server/agents/exercise-creator.js';
import { WRITING_TYPES, evaluateWriting } from '../../server/agents/writing-evaluator.js';
import { generateCareerDeck } from '../../server/agents/career-deck.js';
import { evaluateSpeaking } from '../../server/agents/speaking-evaluator.js';
import { translateStory, translatableStory, translationCacheParams } from '../../server/agents/story-translator.js';
import { env, setEnv } from '../../server/lib/config.js';
import { authenticateRequest } from '../../server/lib/auth.js';
import { isCriteriaExam } from '../../server/lib/examCriteria.js';
import { checkUsageLimit, checkWeeklyLimit, incrementUsage, getUserTier } from '../../server/lib/usageLimits.js';
import { accessTier } from '../../server/lib/roles.js';
import { isCacheable, generateCacheKey, getCachedResponse, setCachedResponse } from '../../server/lib/aiCache.js';
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
// Input Size Validator (from security patch)
// ---------------------------------------------------------------------------
/**
 * Daily limits of the free plan for the agents without one of their own (the tutor counts
 * messages, the story generator stories a week): writing and speaking evaluations share one,
 * and the agents the app doesn't call share another, so none can be called without a cap.
 */
const DAILY_AGENT_LIMITS: Record<string, string> = {
    'writing-evaluator': 'evaluations',
    'speaking-evaluator': 'evaluations',
    'vocab-enricher': 'other-ai',
    'exercise-creator': 'other-ai',
    'career-deck': 'other-ai',
    'story-translator': 'translations',
};

/** The evaluators take an exam id (its criteria are chosen on the server), or none. */
const validExam = (exam: unknown) => exam === undefined || isCriteriaExam(exam);

/** A string of at most `max` characters; with `optional`, also absent (undefined or null). */
const isText = (value: unknown, max: number, optional = false) =>
    (optional && value == null) || (typeof value === 'string' && value.length <= max);

function validateInputSize(agent: AgentType, params: any): { valid: boolean; error?: string } {
    // Only the app's own B1 and B2 stories, looked up by id: never free text, and nothing else, so no
    // extra field can change the cache key and send each request to the model
    if (agent === 'story-translator') {
        const keys = params && typeof params === 'object' && !Array.isArray(params) ? Object.keys(params) : null;
        if (!keys || keys.length !== 1 || typeof params.storyId !== 'string' || params.storyId.length > 40 || !translatableStory(params.storyId)) {
            return { valid: false, error: 'Historia desconocida.' };
        }
        return { valid: true };
    }
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
            
            if (!isText(params.topic, 200, true)) {
                return { valid: false, error: 'El tema de la conversación es demasiado largo (máximo 200 caracteres).' };
            }

            let totalLength = 0;
            for (const msg of messages) {
                if (msg?.role !== 'user' && msg?.role !== 'assistant') {
                    return { valid: false, error: 'Formato de mensajes inválido.' };
                }
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
            if (!isText(params.text, 3000)) {
                return { valid: false, error: 'El texto a evaluar debe ser texto de máximo 3000 caracteres.' };
            }
            if (!isText(params.prompt, 4000) || !isText(params.referenceAnswer, 1000, true)) {
                return { valid: false, error: 'La consigna o la respuesta de referencia son demasiado largas.' };
            }
            if (!WRITING_TYPES.includes(params.type)) return { valid: false, error: 'Tipo de ejercicio desconocido.' };
            const grammar = params.targetGrammar;
            if (grammar != null && (!Array.isArray(grammar) || grammar.length > 10 || grammar.some((g: unknown) => !isText(g, 100)))) {
                return { valid: false, error: 'La lista de gramática objetivo no es válida.' };
            }
            if (!validExam(params.exam)) return { valid: false, error: 'Examen desconocido.' };
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
            // TOEFL has 11 speaking tasks (7 repeat sentences and a 4-question interview)
            if (!Array.isArray(transcripts) || !Array.isArray(prompts) || transcripts.length > 12 || prompts.length > 12) {
                return { valid: false, error: 'Formato de respuestas orales inválido.' };
            }
            const all = [...transcripts, ...prompts];
            if (all.some(t => typeof t !== 'string' || t.length > 3000)) {
                return { valid: false, error: 'Cada respuesta oral debe ser texto de máximo 3000 caracteres.' };
            }
            if (!validExam(params.exam)) return { valid: false, error: 'Examen desconocido.' };
            break;
        }
    }

    return { valid: true };
}

/**
 * The EU (with its outermost regions, which Cloudflare reports with their own codes), Iceland,
 * Liechtenstein, Norway, Switzerland and the UK.
 */
const UNSERVED_COUNTRIES = new Set([
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU',
    'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GF', 'GP', 'MQ', 'RE', 'YT', 'MF', 'AX',
    'IS', 'LI', 'NO', 'CH', 'GB',
]);

// ---------------------------------------------------------------------------
// Cloudflare Pages Function Entry Point
// ---------------------------------------------------------------------------
export const onRequestPost: PagesFunction = async (context) => {
    const { request, env: bindings } = context;
    setEnv(bindings); // Inyectar las variables de entorno de Cloudflare

    const corsHeaders = getCorsHeaders(request, 'POST, OPTIONS');

    // Gemini's unpaid quota can't serve the EEA, Switzerland or the UK (see the terms of service)
    if (UNSERVED_COUNTRIES.has(request.headers.get('CF-IPCountry') ?? '')) {
        return new Response(JSON.stringify({ error: 'region_unavailable' }), { status: 451, headers: corsHeaders });
    }

    // Rate limit by IP
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(ip)) {
        return new Response(JSON.stringify({ error: 'Too many requests. Try again later.' }), {
            status: 429,
            headers: corsHeaders,
        });
    }

    // Authenticate
    const auth = await authenticateRequest(request);
    if ('response' in auth) return auth.response(corsHeaders);
    const { user } = auth;

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

        // A story already translated costs nothing: it is served before the daily limit is checked
        const cacheKey = isCacheable(agent)
            ? generateCacheKey(agent, agent === 'story-translator' ? translationCacheParams(params.storyId) : params)
            : null;
        const cachedFirst = agent === 'story-translator' && cacheKey ? await getCachedResponse(cacheKey) : null;
        if (cachedFirst) {
            return new Response(JSON.stringify(cachedFirst), { status: 200, headers: corsHeaders });
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

        const dailyFeature = DAILY_AGENT_LIMITS[agent];
        if (dailyFeature) {
            const usage = await checkUsageLimit(userId, dailyFeature, userTier);
            if (!usage.allowed) {
                return new Response(JSON.stringify({
                    error: 'daily_limit_reached',
                    message: 'Ya usaste lo que tienes de IA hoy para esto. Mañana tienes más, o actualiza a Pro para uso ilimitado.',
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

        // --- Cache lookup (the translator's was done above) ---
        if (cacheKey && agent !== 'story-translator') {
            try {
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
            case 'story-translator':
                result = await translateStory({ storyId: params.storyId });
                break;
        }

        // --- Cache store ---
        if (cacheKey && isCacheable(agent)) {
            setCachedResponse(cacheKey, agent, cacheKey, result).catch(() => {});
        }

        // --- Increment usage ---
        // waitUntil: a Worker may stop work left running after the response
        const counted = agent === 'conversation-tutor' || agent === 'story-generator' ? agent : dailyFeature;
        if (counted) context.waitUntil(incrementUsage(userId, counted).catch(() => {}));

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
