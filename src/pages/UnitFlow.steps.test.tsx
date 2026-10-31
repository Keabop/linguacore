import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MotionGlobalConfig } from 'framer-motion';
import { useState } from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// How the unit moves from step to step once each one reports its result. The progress follows
// what is saved (the real `determineStep`); the runner and the output step only report a result.
const unit = vi.hoisted(() => ({ start: {} as Record<string, unknown> }));
const NEW_ROW = { grammar_card_read: true, story_completed: true, vocab_reviewed: true, exercises_score: 0, output_completed: false, checkpoint_passed: false };

vi.mock('../hooks/useUnitProgress', async () => {
    const { determineStep } = await vi.importActual<typeof import('../hooks/useUnitProgress')>('../hooks/useUnitProgress');
    return {
        determineStep,
        useUnitProgress: () => {
            const [row, setRow] = useState(unit.start as never);
            const save = async (u: object) => setRow(r => ({ ...(r as object), ...u }) as never);
            return {
                progress: row,
                currentStep: determineStep(row),
                isLoading: false,
                updateProgress: save,
                markStepComplete: async (step: string) => { if (step === 'output') await save({ output_completed: true }); },
            };
        },
    };
});
vi.mock('../components/exercises/ExerciseRunner', () => ({
    default: ({ onComplete }: { onComplete: (score: number) => void }) => (
        <div>
            <button onClick={() => onComplete(60)}>score 60</button>
            <button onClick={() => onComplete(100)}>score 100</button>
        </div>
    ),
}));
vi.mock('../components/OutputStep', () => ({
    default: ({ onComplete }: { onComplete: () => void }) => <button onClick={onComplete}>output done</button>,
}));
vi.mock('../hooks/useSkillCards', () => ({ useSkillCards: () => ({ addSkillCards: vi.fn(async () => 0) }) }));
vi.mock('../hooks/useGardenPlant', () => ({ useGardenPlant: () => ({ species: 'girasol' }) }));
vi.mock('../hooks/useCards', () => ({ useCards: () => ({ saveStoryWords: vi.fn(), isWordInDeck: vi.fn(async () => false), isWordKnown: vi.fn(async () => false) }) }));
vi.mock('../lib/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('../lib/supabase', () => ({ supabase: { from: () => ({ select: () => Promise.resolve({ data: [], error: null }), insert: async () => ({ error: null }) }) } }));

import UnitFlow from './UnitFlow';

// jsdom never finishes exit animations: without this, the leaving step stays in the page
let skippedBefore: boolean | undefined;
beforeAll(() => { skippedBefore = MotionGlobalConfig.skipAnimations; MotionGlobalConfig.skipAnimations = true; });
afterAll(() => { MotionGlobalConfig.skipAnimations = skippedBefore; });

beforeEach(() => { unit.start = { ...NEW_ROW }; });

const renderUnit = () => render(
    <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/unit/a1-u2']}>
            <Routes><Route path="/unit/:unitId" element={<UnitFlow />} /></Routes>
        </MemoryRouter>
    </QueryClientProvider>,
);

describe('UnitFlow steps', () => {
    it('goes from the exercises to the output step with a score above zero', async () => {
        renderUnit();
        fireEvent.click(screen.getByRole('button', { name: 'score 60' }));
        expect(await screen.findByRole('button', { name: 'output done' })).toBeInTheDocument();
    });

    it('goes from the output step to the checkpoint', async () => {
        unit.start = { ...NEW_ROW, exercises_score: 80 };
        renderUnit();
        fireEvent.click(screen.getByRole('button', { name: 'output done' }));
        expect(await screen.findByText('Checkpoint')).toBeInTheDocument();
    });

    it('asks for 80 % at the checkpoint and offers another try below it', async () => {
        unit.start = { ...NEW_ROW, exercises_score: 80, output_completed: true };
        renderUnit();
        fireEvent.click(screen.getByRole('button', { name: 'score 60' }));
        expect(await screen.findByText('60%')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Inténtalo de nuevo/ }));
        expect(await screen.findByRole('button', { name: 'score 100' })).toBeInTheDocument();
    });

    it('completes the unit at 80 % or more', async () => {
        unit.start = { ...NEW_ROW, exercises_score: 80, output_completed: true };
        renderUnit();
        fireEvent.click(screen.getByRole('button', { name: 'score 100' }));
        expect(await screen.findByRole('heading', { name: '¡Unidad completada!' })).toBeInTheDocument();
    });
});
