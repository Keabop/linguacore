import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AnswerFeedback, { readingTime } from './AnswerFeedback';

describe('readingTime', () => {
    it('gives a short explanation at least two and a half seconds', () => {
        expect(readingTime('')).toBe(2500);
        expect(readingTime('Correcto.')).toBe(2500);
        expect(readingTime('Use are with they.')).toBe(2680);
    });

    it('grows with the words to read, up to seven seconds', () => {
        expect(readingTime(Array(10).fill('word').join(' '))).toBe(4000);
        expect(readingTime(Array(80).fill('word').join(' '))).toBe(7000);
    });
});

describe('AnswerFeedback', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('moves on by itself after a right answer, once there was time to read', () => {
        const onNext = vi.fn();
        render(<AnswerFeedback correct explanation="Correcto." onNext={onNext} />);
        act(() => { vi.advanceTimersByTime(2400); });
        expect(onNext).not.toHaveBeenCalled();
        act(() => { vi.advanceTimersByTime(200); });
        expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('moves on once when the learner taps before the time is up', () => {
        const onNext = vi.fn();
        render(<AnswerFeedback correct explanation="Use are with they." onNext={onNext} />);
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
        act(() => { vi.advanceTimersByTime(8000); });
        expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('waits for the learner after a wrong answer', () => {
        const onNext = vi.fn();
        render(<AnswerFeedback correct={false} correctAnswer="They are" explanation="Use are with they." onNext={onNext} />);
        act(() => { vi.advanceTimersByTime(10000); });
        expect(onNext).not.toHaveBeenCalled();
        expect(screen.getByText('They are')).toBeInTheDocument();
    });
});
