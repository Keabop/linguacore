import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const speech = vi.hoisted(() => ({
    isListening: false,
    transcript: 'this is a pencil that is an eraser',
    interimTranscript: '',
    startListening: () => {},
    stopListening: () => {},
    resetTranscript: () => {},
    recognitionSupported: true,
    recognitionError: null,
    speak: () => {},
    isSpeaking: false,
    cancelSpeech: () => {},
    synthesisSupported: true,
}));
vi.mock('../../hooks/useSpeech', () => ({ useSpeech: () => speech }));
vi.mock('../ui/NoEnglishVoices', () => ({ default: () => null }));

import ReadAloud from './ReadAloud';

describe('ReadAloud', () => {
    it('shows the graded text as written, with spaces so a long sentence can wrap', () => {
        const target = 'This is a pencil. That is an eraser — the book is on the table.';
        render(<ReadAloud instruction="Lee en voz alta." targetText={target} onComplete={() => {}} />);
        fireEvent.click(screen.getByRole('button', { name: 'Evaluar' }));

        const graded = screen.getByText('pencil.').parentElement!;
        expect(graded.textContent).toBe(target);
        expect(screen.getByText('This')).toHaveClass('text-[var(--color-success)]');
        expect(screen.getByText('table.')).toHaveClass('decoration-wavy');
        expect(screen.getByText('—')).not.toHaveClass('decoration-wavy');
        expect(screen.getByText('57%')).toBeInTheDocument();
    });
});
