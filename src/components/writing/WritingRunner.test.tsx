import { fireEvent, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { MotionGlobalConfig } from 'framer-motion';
import type { WritingPrompt } from '../../lib/db';
import WritingRunner from './WritingRunner';
import { isLimitReached } from '../../lib/ai';

// The real client needs the Supabase keys of .env.local; this test never reaches it
vi.mock('../../lib/supabase', () => ({ supabase: {} }));

const evaluateWriting = vi.hoisted(() => vi.fn());
vi.mock('../../lib/ai', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../../lib/ai')>()),
    evaluateWriting,
}));

beforeAll(() => { MotionGlobalConfig.skipAnimations = true; });
afterAll(() => { MotionGlobalConfig.skipAnimations = false; });

const prompt: WritingPrompt = {
    id: 'w1', unitId: 'a1-u1', type: 'free-writing', level: 'A1',
    instruction: 'Write about your family.', targetGrammar: [], wordLimit: { min: 3, max: 50 },
    referenceAnswer: 'My family is small. I have one sister.',
};

function limitError() {
    return Object.assign(new Error('limit'), { status: 429, code: 'daily_limit_reached' });
}

describe('WritingRunner at the free plan limit', () => {
    it('shows the model answer and finishes the step without a score', async () => {
        evaluateWriting.mockRejectedValueOnce(limitError());
        const onComplete = vi.fn();
        render(<MemoryRouter><WritingRunner prompts={[prompt]} level="A1" onComplete={onComplete} /></MemoryRouter>);

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'I have a big family.' } });
        fireEvent.click(screen.getByRole('button', { name: /enviar|evaluar/i }));

        expect(await screen.findByText('My family is small. I have one sister.')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
        expect(onComplete).toHaveBeenCalledWith(null);
    });

    it('tells a reached limit apart from other errors, so it is not retried', () => {
        expect(isLimitReached(limitError())).toBe(true);
        expect(isLimitReached(Object.assign(new Error('x'), { status: 429, code: 'weekly_limit_reached' }))).toBe(true);
        expect(isLimitReached(Object.assign(new Error('busy'), { status: 429 }))).toBe(false);
        expect(isLimitReached(null)).toBe(false);
    });
});

const evaluation = {
    score: 80,
    corrections: [{ original: 'is big', corrected: 'is very big', explanation: 'Más natural.', type: 'style' }],
    feedback: { grammar: { score: 80, note: '' }, vocabulary: { score: 80, note: '' }, coherence: { score: 80, note: '' } },
    improvedVersion: 'I have a very big family.',
    encouragement: '¡Bien!',
};

describe('WritingRunner saves AI evaluations', () => {
    const submit = (text: string) => {
        fireEvent.change(screen.getByRole('textbox'), { target: { value: text } });
        fireEvent.click(screen.getByRole('button', { name: /enviar|evaluar/i }));
    };

    it('reuses the evaluation when the same answer is sent again', async () => {
        evaluateWriting.mockReset().mockResolvedValue(evaluation);
        const first = render(<MemoryRouter><WritingRunner prompts={[{ ...prompt, id: 'w2', instruction: 'Write about your house.' }]} level="A1" onComplete={vi.fn()} /></MemoryRouter>);
        submit('My house is big.');
        expect(await screen.findByText('¡Bien!')).toBeInTheDocument();
        first.unmount();

        render(<MemoryRouter><WritingRunner prompts={[{ ...prompt, id: 'w2', instruction: 'Write about your house.' }]} level="A1" onComplete={vi.fn()} /></MemoryRouter>);
        submit('My house is  big.');
        expect(await screen.findByText('¡Bien!')).toBeInTheDocument();
        expect(evaluateWriting).toHaveBeenCalledTimes(1);
    });

    it('still asks the AI when only the capitals or the punctuation differ', async () => {
        evaluateWriting.mockReset().mockResolvedValue(evaluation);
        render(<MemoryRouter><WritingRunner prompts={[{ ...prompt, id: 'w3' }]} level="A1" onComplete={vi.fn()} /></MemoryRouter>);
        submit('my family is small. i have one sister');
        expect(await screen.findByText('¡Bien!')).toBeInTheDocument();
        expect(evaluateWriting).toHaveBeenCalledTimes(1);
    });

    it('does not ask the AI when the answer is the model answer', async () => {
        evaluateWriting.mockReset();
        render(<MemoryRouter><WritingRunner prompts={[prompt]} level="A1" onComplete={vi.fn()} /></MemoryRouter>);
        submit('My family is small.  I have one sister.');
        expect(await screen.findByText(/coincide con la respuesta modelo/)).toBeInTheDocument();
        expect(screen.getByText(/Sin correcciones/)).toBeInTheDocument();
        expect(screen.queryByText('Ver versión mejorada')).not.toBeInTheDocument();
        expect(evaluateWriting).not.toHaveBeenCalled();
    });
});
