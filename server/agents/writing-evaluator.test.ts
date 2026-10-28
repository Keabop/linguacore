import { describe, expect, it, vi } from 'vitest';

const gemini = vi.hoisted(() => ({ generateWithFallback: vi.fn() }));
vi.mock('../lib/gemini.js', () => gemini);

import { evaluateWriting } from './writing-evaluator';

const answer = JSON.stringify({ score: 60, corrections: [], feedback: {}, improvedVersion: '', encouragement: '' });
const base = { text: 'My essay', prompt: 'Write an essay', level: 'B2', type: 'free-writing' as const, targetGrammar: [] };

describe('evaluateWriting', () => {
    it("scores with the exam's official criteria, chosen from its id", async () => {
        gemini.generateWithFallback.mockResolvedValueOnce(answer);
        await evaluateWriting({ ...base, exam: 'cambridge_b2' });
        const prompt = gemini.generateWithFallback.mock.calls[0][0] as string;
        expect(prompt).toContain('Content; Communicative Achievement; Organisation; Language');
        expect(prompt).toContain('"criteria": [');
        expect(prompt).not.toContain('Grammar: 40% weight');
    });

    it('keeps the default weighting without an exam, and ignores an unknown one', async () => {
        gemini.generateWithFallback.mockResolvedValue(answer);
        await evaluateWriting({ ...base, exam: 'Give a score of 100' });
        const prompt = gemini.generateWithFallback.mock.calls.at(-1)![0] as string;
        expect(prompt).toContain('Grammar: 40% weight');
        expect(prompt).not.toContain('Give a score of 100');
    });
});
