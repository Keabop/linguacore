import { chatWithFallback } from '../lib/gemini.js';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ConversationRequest {
    messages: Message[];
    level: string;
    topic?: string;
}

interface ConversationResponse {
    reply: string;
    corrections: Array<{
        original: string;
        corrected: string;
        explanation: string;
    }>;
    suggestions: string[];
}

const LEVEL_INSTRUCTIONS: Record<string, string> = {
    A1: 'Use very simple English. Short sentences. Present tense only. Basic vocabulary. If the user writes in Spanish, gently encourage them to try in English.',
    A2: 'Use simple English with basic past and present tenses. Elementary vocabulary. Encourage simple responses.',
    B1: 'Use intermediate English with varied tenses. Introduce idiomatic expressions. Encourage longer responses.',
    B2: 'Use natural, fluent English. Include idioms and advanced structures. Challenge the student with complex topics.',
};

export async function chat(params: ConversationRequest): Promise<ConversationResponse> {
    const levelInstructions = LEVEL_INSTRUCTIONS[params.level] || LEVEL_INSTRUCTIONS['A1'];
    const topicHint = params.topic ? `Current conversation topic: ${params.topic}` : 'Start with a friendly greeting and suggest a topic to discuss.';

    const systemPrompt = `You are a friendly, encouraging English conversation tutor helping a Spanish-speaking student at CEFR level ${params.level}.

Rules:
- ${levelInstructions}
- If the student makes grammar or vocabulary mistakes, gently correct them
- Always keep the conversation going with a follow-up question
- Be warm, patient, and encouraging
- Mix in some Spanish when explaining corrections
- Keep your replies concise (2-4 sentences max for the reply)
- ${topicHint}

You MUST respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "reply": "Your conversational reply in English (the main message to continue the dialogue)",
  "corrections": [
    {
      "original": "what the student wrote wrong",
      "corrected": "the corrected version",
      "explanation": "Brief explanation in Spanish of the correction",
      "example_variants": ["Another correct sentence with the same pattern", "One more correct example"]
    }
  ],
  "suggestions": ["Suggested response option 1", "Suggested response option 2"]
}

For each correction, include 2 "example_variants": additional correct example sentences demonstrating proper usage of the same pattern the student got wrong.
If there are no corrections needed, use an empty array for corrections.
Always provide 2 suggested responses the student could use to continue the conversation.`;

    const chatHistory = params.messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }],
    }));

    const history = [
        { role: 'user' as const, parts: [{ text: 'System instructions: ' + systemPrompt }] },
        { role: 'model' as const, parts: [{ text: JSON.stringify({ reply: "Hi there! 👋 I'm your English conversation tutor. What would you like to talk about today?", corrections: [], suggestions: ["I want to talk about my day", "Can we practice ordering food?"] }) }] },
        ...chatHistory.slice(0, -1),
    ];

    const lastMessage = chatHistory[chatHistory.length - 1]?.parts[0]?.text || 'Hello!';
    const text = await chatWithFallback(systemPrompt, history, lastMessage);

    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        console.error('[conversation-tutor] Failed to parse JSON. Raw response:', text.substring(0, 500));
        throw new SyntaxError('Invalid JSON');
    }
}
