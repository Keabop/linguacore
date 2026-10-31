import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MotionGlobalConfig } from 'framer-motion';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UnitStep } from '../hooks/useUnitProgress';

const unit = vi.hoisted(() => ({
    step: 'grammar' as UnitStep,
    updateProgress: vi.fn(async () => {}),
    markStepComplete: vi.fn(async () => {}),
}));

vi.mock('../hooks/useUnitProgress', () => ({
    useUnitProgress: () => ({ progress: null, currentStep: unit.step, isLoading: false, updateProgress: unit.updateProgress, markStepComplete: unit.markStepComplete }),
}));
vi.mock('../hooks/useSkillCards', () => ({ useSkillCards: () => ({ addSkillCards: vi.fn(async () => 0) }) }));
vi.mock('../hooks/useGardenPlant', () => ({ useGardenPlant: () => ({ species: 'girasol' }) }));
vi.mock('../hooks/useCards', () => ({ useCards: () => ({ saveStoryWords: vi.fn(), isWordInDeck: vi.fn(async () => false), isWordKnown: vi.fn(async () => false) }) }));
vi.mock('../lib/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('../lib/supabase', () => ({ supabase: { from: () => ({ select: () => ({ eq: async () => ({ data: [] }) }), insert: async () => ({}) }) } }));

import UnitFlow from './UnitFlow';
import { getExercisesByUnit, getGrammarCardByUnit } from '../data';

const renderUnit = (unitId: string) => render(
    <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={[`/unit/${unitId}`]}>
            <Routes><Route path="/unit/:unitId" element={<UnitFlow />} /></Routes>
        </MemoryRouter>
    </QueryClientProvider>,
);

// jsdom never finishes exit animations: without this, the leaving step stays in the page
beforeAll(() => { MotionGlobalConfig.skipAnimations = true; });
afterAll(() => { MotionGlobalConfig.skipAnimations = false; });

describe('UnitFlow', () => {
    beforeEach(() => {
        unit.updateProgress.mockClear();
        unit.markStepComplete.mockClear();
    });

    it('opens on the grammar card of a new unit', () => {
        unit.step = 'grammar';
        renderUnit('a1-u1');
        expect(screen.getByRole('heading', { name: getGrammarCardByUnit('a1-u1')!.title })).toBeInTheDocument();
    });

    it("shows the unit's own exercises at the exercise step", () => {
        unit.step = 'exercises';
        const exercises = getExercisesByUnit('a1-u1');
        renderUnit('a1-u1');
        expect(screen.getByText(`1 de ${exercises.length}`)).toBeInTheDocument();
    });

    it('celebrates a finished unit', () => {
        unit.step = 'completed';
        renderUnit('a1-u1');
        expect(screen.queryByText('1 de 6')).toBeNull();
        expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });

    it('turns the assessment unit into the end-of-level exam', () => {
        unit.step = 'grammar';
        renderUnit('a1-u8');
        expect(screen.getByRole('button', { name: 'Comenzar' })).toBeInTheDocument();
        expect(screen.getByText(/preguntas de gramática/)).toBeInTheDocument();
    });

    it('says so for a unit that does not exist', () => {
        renderUnit('z9-u1');
        expect(screen.getByText('Unidad no encontrada.')).toBeInTheDocument();
    });
});
