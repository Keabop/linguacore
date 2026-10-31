import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const progress = vi.hoisted(() => ({ markStepComplete: vi.fn(async () => {}) }));
vi.mock('../hooks/useUnitProgress', () => ({ useUnitProgress: () => progress }));

import GrammarCard from './GrammarCard';
import { getGrammarCardByUnit } from '../data';

describe('GrammarCard', () => {
    const card = getGrammarCardByUnit('a1-u1')!;

    beforeEach(() => progress.markStepComplete.mockReset().mockResolvedValue(undefined));

    it('shows the explanation, every example and every rule of the unit', () => {
        render(<GrammarCard unitId="a1-u1" onComplete={() => {}} />);
        expect(screen.getByRole('heading', { name: card.title })).toBeInTheDocument();
        expect(screen.getByText('Errores típicos')).toBeInTheDocument();
        for (const rule of card.rules) expect(screen.getByText(rule)).toBeInTheDocument();
        expect(card.examples.every(e => document.body.textContent!.includes(e.split(' → ')[0]))).toBe(true);
    });

    it('saves the step and moves on when the learner has read it', async () => {
        const onComplete = vi.fn();
        render(<GrammarCard unitId="a1-u1" onComplete={onComplete} />);
        fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
        await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
        expect(progress.markStepComplete).toHaveBeenCalledWith('grammar');
    });

    it('stays on the card, ready to retry, when saving fails', async () => {
        progress.markStepComplete.mockRejectedValueOnce(new Error('offline'));
        const onComplete = vi.fn();
        render(<GrammarCard unitId="a1-u1" onComplete={onComplete} />);
        fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'Entendido' })).toBeEnabled());
        expect(onComplete).not.toHaveBeenCalled();
    });

    it('shows nothing for a unit without a card (the level assessment)', () => {
        const { container } = render(<GrammarCard unitId="a1-u8" onComplete={() => {}} />);
        expect(container).toBeEmptyDOMElement();
    });
});
