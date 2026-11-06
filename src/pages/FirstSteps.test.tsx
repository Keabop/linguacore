import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firstStepsLessons } from '../data/firstSteps';

const mocks = vi.hoisted(() => ({
    completeLesson: vi.fn(async () => {}),
    saveStoryWords: vi.fn(async () => 3),
    lastExercises: [] as { type: string }[],
}));
vi.mock('../hooks/useFirstSteps', () => ({
    useFirstSteps: () => ({ done: [], finished: false, isLoading: false, completeLesson: mocks.completeLesson }),
}));
vi.mock('../hooks/useCards', () => ({ useCards: () => ({ saveStoryWords: mocks.saveStoryWords }) }));
// The practice passes at once; it keeps what it was given to check the mix of exercises
vi.mock('../components/exercises/ExerciseRunner', () => ({
    default: ({ exercises, onComplete }: { exercises: { type: string }[]; onComplete: (score: number) => void }) => {
        mocks.lastExercises = exercises;
        return <button onClick={() => onComplete(100)}>terminar práctica</button>;
    },
}));
vi.mock('../components/speaking/SpeakingRunner', () => ({ default: () => <p>grabadora</p> }));

import FirstSteps from './FirstSteps';

const greetings = firstStepsLessons[0];

describe('Primeros pasos', () => {
    beforeEach(() => {
        mocks.completeLesson.mockClear();
        mocks.saveStoryWords.mockClear();
    });

    it('teaches a lesson with its dialogue and adds its words to the review', async () => {
        render(<MemoryRouter><FirstSteps /></MemoryRouter>);
        fireEvent.click(screen.getByRole('button', { name: new RegExp(greetings.title) }));

        expect(screen.getByRole('heading', { name: 'Una plática' })).toBeInTheDocument();
        for (const line of greetings.dialogue) expect(screen.getAllByText(line.es).length).toBeGreaterThan(0);

        fireEvent.click(screen.getByRole('button', { name: `Añadir ${greetings.words.length} palabras a mi repaso` }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'Ya están en tu repaso' })).toBeDisabled());
        expect(mocks.saveStoryWords).toHaveBeenCalledWith('a1-u0', greetings.words, [], { countLearned: false });
    });

    it('practices understanding and writing, finishes the lesson, then offers to say it aloud', async () => {
        render(<MemoryRouter><FirstSteps /></MemoryRouter>);
        fireEvent.click(screen.getByRole('button', { name: new RegExp(greetings.title) }));
        fireEvent.click(screen.getByRole('button', { name: 'Practicar' }));

        const types = new Set(mocks.lastExercises.map(e => e.type));
        expect(types).toEqual(new Set(['meaning-choice', 'listen-choice', 'word-order', 'fill-blank']));

        fireEvent.click(screen.getByRole('button', { name: 'terminar práctica' }));
        expect(mocks.completeLesson).toHaveBeenCalledWith(greetings.id);
        expect(await screen.findByRole('heading', { name: 'Dilo en voz alta' })).toBeInTheDocument();
        expect(screen.getByText('grabadora')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /No puedo hablar ahora/ }));
        expect(await screen.findByRole('heading', { name: 'Primeros pasos' })).toBeInTheDocument();
    });
});
