import { afterEach, describe, expect, it, vi } from 'vitest';

const apiFetch = vi.fn();
vi.mock('./apiFetch', () => ({ apiFetch: (...args: unknown[]) => apiFetch(...args) }));

const { evaluateWriting } = await import('./ai');

const reply = (status: number, body: string) => new Response(body, { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => apiFetch.mockReset());

describe('AI errors', () => {
    it('says plainly that the AI did not answer when the server does not give a reason', async () => {
        apiFetch.mockResolvedValue(reply(404, '<html>Not found</html>'));
        await expect(evaluateWriting('I am Rosa.', 'Preséntate', 'A1', 'free-writing', [])).rejects.toThrow('La IA no respondió');
    });

    it("keeps the server's own message for a limit", async () => {
        apiFetch.mockResolvedValue(reply(429, JSON.stringify({ error: 'daily_limit_reached', message: 'Ya usaste lo que tienes de IA hoy.' })));
        await expect(evaluateWriting('I am Rosa.', 'Preséntate', 'A1', 'free-writing', [])).rejects.toThrow('Ya usaste lo que tienes de IA hoy.');
    });
});
