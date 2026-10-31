import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MotionGlobalConfig } from 'framer-motion';
import { useEffect, useState } from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// The progress follows what is saved: a score of 0 keeps the unit on the exercise step
const unit = vi.hoisted(() => ({
    mounts: 0,
    // The saved row the unit starts from: by default, at the exercise step
    start: { grammar_card_read: true, story_completed: true, vocab_reviewed: true, exercises_score: 0, output_completed: false, checkpoint_passed: false } as Record<string, unknown>,
}));

vi.mock('../hooks/useUnitProgress', async () => {
    const { determineStep } = await vi.importActual<typeof import('../hooks/useUnitProgress')>('../hooks/useUnitProgress');
    return {
        determineStep,
        useUnitProgress: () => {
            const [row, setRow] = useState(unit.start as never);
            return {
                progress: row,
                currentStep: determineStep(row),
                isLoading: false,
                updateProgress: async (u: object) => setRow(r => ({ ...(r as object), ...u }) as never),
                markStepComplete: async () => {},
            };
        },
    };
});
// A runner that only reports the score it is told to, and counts how often it starts fresh
vi.mock('../components/exercises/ExerciseRunner', () => ({
    default: ({ onComplete }: { onComplete: (score: number) => void }) => {
        useEffect(() => { unit.mounts++; }, []);
        return (
            <div>
                <button onClick={() => onComplete(0)}>all wrong</button>
                <button onClick={() => onComplete(60)}>some right</button>
                <button onClick={() => onComplete(100)}>all right</button>
            </div>
        );
    },
}));
vi.mock('../hooks/useSkillCards', () => ({ useSkillCards: () => ({ addSkillCards: vi.fn(async () => 0) }) }));
vi.mock('../hooks/useGardenPlant', () => ({ useGardenPlant: () => ({ species: 'girasol' }) }));
vi.mock('../hooks/useCards', () => ({ useCards: () => ({ saveStoryWords: vi.fn(), isWordInDeck: vi.fn(async () => false), isWordKnown: vi.fn(async () => false) }) }));
vi.mock('../lib/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('../lib/supabase', () => ({ supabase: { from: () => ({ select: () => ({ eq: async () => ({ data: [] }) }), insert: async () => ({}) }) } }));

import UnitFlow from './UnitFlow';

beforeAll(() => { MotionGlobalConfig.skipAnimations = true; });
afterAll(() => { MotionGlobalConfig.skipAnimations = false; });

const renderUnit = () => render(
    <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/unit/a1-u2']}>
            <Routes><Route path="/unit/:unitId" element={<UnitFlow />} /></Routes>
        </MemoryRouter>
    </QueryClientProvider>,
);

describe('UnitFlow exercise step', () => {
    it('starts the exercises over when every answer was wrong, instead of leaving the learner on the score', async () => {
        unit.mounts = 0;
        renderUnit();
        expect(unit.mounts).toBe(1);
        fireEvent.click(screen.getByRole('button', { name: 'all wrong' }));
        await act(() => new Promise(r => setTimeout(r, 50)));
        expect(screen.getByRole('button', { name: 'all wrong' })).toBeInTheDocument();
        expect(unit.mounts).toBe(2);
    });

    it('moves on to the output step with a score above zero', async () => {
        renderUnit();
        fireEvent.click(screen.getByRole('button', { name: 'some right' }));
        await act(() => new Promise(r => setTimeout(r, 50)));
        expect(screen.queryByRole('button', { name: 'some right' })).toBeNull();
    });
});

describe('UnitFlow checkpoint', () => {
    const atCheckpoint = { grammar_card_read: true, story_completed: true, vocab_reviewed: true, exercises_score: 80, output_completed: true, checkpoint_passed: false };

    it('asks for 80 % and offers another try below it', async () => {
        unit.start = atCheckpoint;
        renderUnit();
        fireEvent.click(screen.getByRole('button', { name: 'some right' }));
        await act(() => new Promise(r => setTimeout(r, 50)));
        expect(screen.getByText('60%')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Inténtalo de nuevo/ }));
        await act(() => new Promise(r => setTimeout(r, 50)));
        expect(screen.getByRole('button', { name: 'all right' })).toBeInTheDocument();
    });

    it('completes the unit at 80 % or more', async () => {
        unit.start = atCheckpoint;
        renderUnit();
        fireEvent.click(screen.getByRole('button', { name: 'all right' }));
        await act(() => new Promise(r => setTimeout(r, 50)));
        expect(screen.queryByRole('button', { name: 'all right' })).toBeNull();
        expect(screen.queryByText('Checkpoint')).toBeNull();
    });
});
