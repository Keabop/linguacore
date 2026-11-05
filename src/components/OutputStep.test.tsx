import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OutputStep from './OutputStep';

const speaking = [{ id: 's1', unitId: 'a1-u1' }];
const writing = [{ id: 'w1', unitId: 'a1-u1' }];
let content: { writingPrompts: unknown[]; speakingPrompts: unknown[] };

vi.mock('../data/levels', () => ({ levelOfId: () => 'A1', useLevelContent: () => content }));
vi.mock('../hooks/useUsageLimits', () => ({ useUsageLimits: () => ({ data: undefined }) }));
vi.mock('./writing/WritingRunner', () => ({
    default: ({ onComplete }: { onComplete: (s: number) => void }) => <button onClick={() => onComplete(80)}>escribir</button>,
}));
vi.mock('./speaking/SpeakingRunner', () => ({
    default: ({ onComplete }: { onComplete: (s: number) => void }) => <button onClick={() => onComplete(70)}>hablar</button>,
}));

const renderStep = (props: Partial<Parameters<typeof OutputStep>[0]> = {}) => {
    const handlers = { onComplete: vi.fn(), onSpeakingPending: vi.fn().mockResolvedValue(true), onSpeakingDone: vi.fn() };
    render(<MemoryRouter><OutputStep unitId="a1-u1" level="A1" {...handlers} {...props} /></MemoryRouter>);
    return handlers;
};

beforeEach(() => {
    localStorage.clear();
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
});
