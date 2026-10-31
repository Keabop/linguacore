import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ClozeReview from './ClozeReview';
import type { Card, Vocabulary } from '../lib/db';

const card = { id: 'c1', wordId: "o'clock", storyId: 'none' } as unknown as Card;
const word = { id: "o'clock", translations: ['en punto'], cefrLevel: 'A1', examples: ["The class starts at nine o'clock."] } as unknown as Vocabulary;

const answer = (text: string) => {
    fireEvent.change(screen.getByRole('textbox'), { target: { value: text } });
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
};

describe('ClozeReview', () => {
    it('accepts the word typed with the curly apostrophe of a phone keyboard', () => {
        render(<ClozeReview card={card} vocabulary={word} onResult={vi.fn()} />);
        answer('O’clock');
        expect(screen.getByText('¡Correcto!')).toBeInTheDocument();
    });

    it('rejects another word', () => {
        render(<ClozeReview card={card} vocabulary={word} onResult={vi.fn()} />);
        answer('clock');
        expect(screen.getByText('Incorrecto')).toBeInTheDocument();
    });
});
