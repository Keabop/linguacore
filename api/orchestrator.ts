import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateStory } from './agents/story-generator.js';
import { enrichVocabulary } from './agents/vocab-enricher.js';
import { createExercise } from './agents/exercise-creator.js';
import { chat } from './agents/conversation-tutor.js';
import type { AgentType } from './lib/gemini.js';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Set CORS headers
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    try {
        const { agent, params } = req.body as { agent: AgentType; params: any };

        if (!agent) {
            return res.status(400).json({ error: 'Missing "agent" field in request body' });
        }

        // Validate agent name before dispatching
        const VALID_AGENTS: AgentType[] = ['story-generator', 'vocab-enricher', 'exercise-creator', 'conversation-tutor'];
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
