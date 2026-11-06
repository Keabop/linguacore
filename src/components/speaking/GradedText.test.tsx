import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GradedText from './GradedText';

describe('GradedText', () => {
    it('grades each written word in order and leaves a lone dash out', () => {
        const text = "I don't know - well-known at 10:30.";
        // Compared words: i, dont, know, wellknown, at, 1030
        const { container } = render(<GradedText text={text} matches={[true, false, true, true, false, true]} />);

        expect(container.textContent).toBe(text);
        expect(screen.getByText('I')).toHaveClass('text-[var(--color-success)]');
        expect(screen.getByText("don't")).toHaveClass('decoration-wavy');
        expect(screen.getByText('-')).toHaveClass('text-[var(--color-on-surface)]');
        expect(screen.getByText('well-known')).toHaveClass('text-[var(--color-success)]');
        expect(screen.getByText('at')).toHaveClass('decoration-wavy');
        expect(screen.getByText('10:30.')).toHaveClass('text-[var(--color-success)]');
    });
});
