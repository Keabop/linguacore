import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OutputStep from './OutputStep';

const speaking = [{ id: 's1', unitId: 'a1-u1' }];
const writing = [{ id: 'w1', unitId: 'a1-u1' }];
let content: { writingPrompts: unknown[]; speakingPrompts: unknown[] };

vi.mock('../data/levels', () => ({ levelOfId: () => 'A1', useLevelContent: () => content }));
vi.mock('../hooks/useUsageLimits', () => ({ useUsageLimits: () => ({ data: undefined }) }));
// What the next writing and speaking rounds score
const scores = vi.hoisted(() => ({ writing: 80, speaking: 70 }));
const addErrorCard = vi.hoisted(() => vi.fn(async () => true));
type Done = (s: number, results: { id: string; score: number; review: { wrong?: string; right?: string; why: string }[] }[]) => void;
vi.mock('./writing/WritingRunner', () => ({
    default: ({ onComplete, prompts }: { onComplete: Done; prompts: { id: string }[] }) => (
        <button onClick={() => onComplete(scores.writing, prompts.map(p => ({ id: p.id, score: scores.writing, review: [{ wrong: 'I is', right: 'I am', why: 'Con I va am.' }] })))}>escribir</button>
    ),
}));
vi.mock('./speaking/SpeakingRunner', () => ({
    default: ({ onComplete, prompts }: { onComplete: Done; prompts: { id: string }[] }) => (
        <button onClick={() => onComplete(scores.speaking, prompts.map(p => ({ id: p.id, score: scores.speaking, review: [] })))}>hablar</button>
    ),
}));
vi.mock('../hooks/useErrorCards', () => ({ useErrorCards: () => ({ addErrorCard }) }));

const renderStep = (props: Partial<Parameters<typeof OutputStep>[0]> = {}) => {
    const handlers = { onComplete: vi.fn(), onSpeakingPending: vi.fn().mockResolvedValue(true), onSpeakingDone: vi.fn() };
    render(<MemoryRouter><OutputStep unitId="a1-u1" level="A1" {...handlers} {...props} /></MemoryRouter>);
    return handlers;
};

beforeEach(() => {
    localStorage.clear();
    scores.writing = 80;
    scores.speaking = 70;
    addErrorCard.mockClear();
    content = { writingPrompts: [], speakingPrompts: speaking };
});

describe('OutputStep', () => {
    it('leaves the speaking pending and lets the unit go on', async () => {
        const h = renderStep();
        fireEvent.click(screen.getByRole('button', { name: /No puedo hablar ahora/ }));
        expect(h.onSpeakingPending).toHaveBeenCalled();
        expect(await screen.findByText('Habla pendiente')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Continuar al checkpoint (habla pendiente)' }));
        expect(h.onComplete).toHaveBeenCalled();
    });

    it('still asks for the writing before going on', async () => {
        content = { writingPrompts: writing, speakingPrompts: speaking };
        renderStep();
        fireEvent.click(screen.getByRole('button', { name: /Habla/ }));
        fireEvent.click(screen.getByRole('button', { name: /No puedo hablar ahora/ }));
        fireEvent.click(await screen.findByRole('button', { name: 'escribir' }));
        expect(screen.getByRole('button', { name: 'Continuar al checkpoint (habla pendiente)' })).toBeInTheDocument();
    });

    it('does not leave the speaking pending when it could not be saved', async () => {
        const h = renderStep({ onSpeakingPending: vi.fn().mockResolvedValue(false) });
        fireEvent.click(screen.getByRole('button', { name: /No puedo hablar ahora/ }));
        expect(await screen.findByText(/No se pudo guardar/)).toBeInTheDocument();
        expect(screen.queryByText('Habla pendiente')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Continuar al checkpoint/ })).not.toBeInTheDocument();
        expect(h.onComplete).not.toHaveBeenCalled();
    });

    it('lets the learner take the pending speaking back up', () => {
        renderStep({ speakingPending: true });
        fireEvent.click(screen.getByRole('button', { name: /Ya puedo hablar/ }));
        fireEvent.click(screen.getByRole('button', { name: 'hablar' }));
        expect(screen.getByRole('button', { name: 'Continuar al checkpoint' })).toBeInTheDocument();
    });

    it('in a finished unit, only does the pending speaking and clears it', () => {
        content = { writingPrompts: writing, speakingPrompts: speaking };
        const h = renderStep({ speakingOnly: true, speakingPending: true });
        expect(screen.queryByRole('button', { name: 'escribir' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /No puedo hablar ahora/ })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ahora no, volver a la ruta' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'hablar' }));
        expect(h.onSpeakingDone).toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Volver a la ruta' }));
        expect(h.onComplete).toHaveBeenCalled();
    });

    it('clears a pending speaking whose unit no longer has speaking prompts', () => {
        content = { writingPrompts: [], speakingPrompts: [] };
        const h = renderStep({ speakingOnly: true, speakingPending: true });
        fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
        expect(h.onSpeakingDone).toHaveBeenCalled();
        expect(h.onComplete).toHaveBeenCalled();
    });

    it('under the pass mark reviews the mistakes, redoes what failed and lets go on after the second try', async () => {
        content = { writingPrompts: writing, speakingPrompts: [] };
        scores.writing = 50;
        const h = renderStep();
        fireEvent.click(screen.getByRole('button', { name: 'escribir' }));
        expect(await screen.findByRole('heading', { name: 'Repasa antes de volver a intentarlo' })).toBeInTheDocument();
        expect(screen.getByText('Sacaste 50%. Para seguir necesitas 75%.')).toBeInTheDocument();
        expect(screen.getByText('I am')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Seguir de todos modos/ })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Repetir el ejercicio que falló' }));
        fireEvent.click(screen.getByRole('button', { name: 'escribir' }));
        fireEvent.click(await screen.findByRole('button', { name: /Seguir de todos modos/ }));
        expect(addErrorCard).toHaveBeenCalledWith({ original: 'I is', corrected: 'I am', explanation: 'Con I va am.' }, 'unit');
        fireEvent.click(await screen.findByRole('button', { name: 'Continuar al checkpoint' }));
        expect(h.onComplete).toHaveBeenCalled();
    });

    it('asks speaking for 70', async () => {
        scores.speaking = 69;
        renderStep();
        fireEvent.click(screen.getByRole('button', { name: 'hablar' }));
        expect(await screen.findByText('Sacaste 69%. Para seguir necesitas 70%.')).toBeInTheDocument();
    });

    it('with a 0 in speaking, the review still lets the speaking be left for later', async () => {
        scores.speaking = 0;
        const h = renderStep();
        fireEvent.click(screen.getByRole('button', { name: 'hablar' }));
        expect(await screen.findByText('Sacaste 0%. Para seguir necesitas 70%.')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /No puedo hablar ahora/ }));
        expect(h.onSpeakingPending).toHaveBeenCalled();
    });

    it('after two tries with a 0 the learner may go on', async () => {
        content = { writingPrompts: writing, speakingPrompts: [] };
        scores.writing = 0;
        renderStep();
        fireEvent.click(screen.getByRole('button', { name: 'escribir' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Repetir el ejercicio que falló' }));
        fireEvent.click(screen.getByRole('button', { name: 'escribir' }));
        expect(await screen.findByRole('button', { name: /Seguir de todos modos/ })).toBeInTheDocument();
    });

    it('remembers the tries after a reload, without asking again for what passed', async () => {
        content = { writingPrompts: writing, speakingPrompts: [] };
        scores.writing = 50;
        const first = render(<MemoryRouter><OutputStep unitId="a1-u1" level="A1" onComplete={vi.fn()} /></MemoryRouter>);
        fireEvent.click(screen.getByRole('button', { name: 'escribir' }));
        await screen.findByRole('heading', { name: 'Repasa antes de volver a intentarlo' });
        first.unmount();

        renderStep();
        expect(screen.getByRole('heading', { name: 'Repasa antes de volver a intentarlo' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Repetir el ejercicio que falló' }));
        fireEvent.click(screen.getByRole('button', { name: 'escribir' }));
        expect(await screen.findByRole('button', { name: /Seguir de todos modos/ })).toBeInTheDocument();
    });
});
