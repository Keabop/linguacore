import { describe, expect, it, vi } from 'vitest';

const gemini = vi.hoisted(() => ({ generateWithFallback: vi.fn(), chatWithFallback: vi.fn() }));
vi.mock('../lib/gemini.js', () => gemini);

import { evaluateSpeaking } from './speaking-evaluator';
import { chat } from './conversation-tutor';
import { CEFR_DESCRIPTORS } from '../lib/cefrDescriptors';

describe('evaluateSpeaking', () => {
    it("measures the answers against the level's speaking descriptor", async () => {
        gemini.generateWithFallback.mockResolvedValueOnce('{"score": 60}');
        await evaluateSpeaking({ transcripts: ['I like football'], prompts: ['What do you do at weekends?'], level: 'B1' });
        const prompt = gemini.generateWithFallback.mock.calls[0][0] as string;
        expect(prompt).toContain(CEFR_DESCRIPTORS.B1.speaking);
        expect(prompt).toContain('0–59');
    });
});

describe('conversation tutor', () => {
    it("talks at the learner's level, after the CEFR interaction descriptor", async () => {
        gemini.chatWithFallback.mockResolvedValueOnce('{"reply": "Hi!", "corrections": [], "suggestions": []}');
        await chat({ messages: [{ role: 'user', content: 'Hello' }], level: 'A2' });
        const history = gemini.chatWithFallback.mock.calls[0][0] as { parts: { text: string }[] }[];
        const system = history[0].parts[0].text;
        expect(system).toContain(CEFR_DESCRIPTORS.A2.interaction);
        expect(system).toContain('no words or grammar above A2');
    });
});
