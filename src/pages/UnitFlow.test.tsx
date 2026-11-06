import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MotionGlobalConfig } from 'framer-motion';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GrammarExercise } from '../lib/db';
import type { UnitStep } from '../hooks/useUnitProgress';

const unit = vi.hoisted(() => ({
    step: 'grammar' as UnitStep,
    updateProgress: vi.fn(async () => {}),
    markStepComplete: vi.fn(async () => {}),
    saveStoryWords: vi.fn(async () => {}),
    // Rows the fake Supabase returns per table
    tables: {} as Record<string, unknown[]>,
}));
const notices = vi.hoisted(() => ({ error: vi.fn(), warning: vi.fn(), clear: vi.fn() }));

vi.mock('../hooks/useUnitProgress', () => ({
    useUnitProgress: () => ({ progress: null, currentStep: unit.step, isLoading: false, updateProgress: unit.updateProgress, markStepComplete: unit.markStepComplete }),
}));
// The unit's own exercises only: the comprehension ones are random and tested on their own
vi.mock('../lib/comprehension', async () => ({
    ...(await vi.importActual<typeof import('../lib/comprehension')>('../lib/comprehension')),
    comprehensionExercises: () => [],
}));
vi.mock('../hooks/useSkillCards', () => ({ useSkillCards: () => ({ addSkillCards: vi.fn(async () => 0) }) }));
vi.mock('../hooks/useGardenPlant', () => ({ useGardenPlant: () => ({ species: 'girasol' }) }));
vi.mock('../hooks/useCards', () => ({ useCards: () => ({ saveStoryWords: unit.saveStoryWords, isWordInDeck: vi.fn(async () => false), isWordKnown: vi.fn(async () => false) }) }));
vi.mock('../lib/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('../lib/notice', () => ({ notice: notices }));
// `select()` can be awaited as is (all rows) or narrowed with `in()` / `eq()`
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: (table: string) => ({
            select: () => {
                const rows = () => ({ data: unit.tables[table] ?? [], error: null });
                return Object.assign(Promise.resolve(rows()), { in: async () => rows(), eq: async () => rows() });
            },
            insert: async () => ({ error: null }),
        }),
    },
}));

import UnitFlow from './UnitFlow';
import { getExercisesByUnit, getGrammarCardByUnit, getStoriesByUnit } from '../data';
import { allVocabulary } from '../data/vocabulary';
import { loadLevel } from '../data/levels';

// The levels already in memory, as after the first visit: the screens render without waiting
beforeAll(() => Promise.all((['A1', 'A2', 'B1', 'B2'] as const).map(loadLevel)));

const renderUnit = (unitId: string) => render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={[`/unit/${unitId}`]}>
            <Routes>
                <Route path="/unit/:unitId" element={<UnitFlow />} />
                <Route path="/learn/:storyId" element={<p>Story page</p>} />
            </Routes>
        </MemoryRouter>
    </QueryClientProvider>,
);

// jsdom never finishes exit animations: without this, the leaving step stays in the page
let skippedBefore: boolean | undefined;
beforeAll(() => { skippedBefore = MotionGlobalConfig.skipAnimations; MotionGlobalConfig.skipAnimations = true; });
afterAll(() => { MotionGlobalConfig.skipAnimations = skippedBefore; });

beforeEach(() => {
    unit.step = 'grammar';
    unit.tables = {};
    unit.updateProgress.mockClear();
    unit.markStepComplete.mockClear();
    unit.saveStoryWords.mockReset().mockResolvedValue(undefined);
    notices.error.mockClear();
});

describe('UnitFlow', () => {
    it('opens on the grammar card of a new unit', () => {
        renderUnit('a1-u1');
        expect(screen.getByRole('heading', { name: getGrammarCardByUnit('a1-u1')!.title })).toBeInTheDocument();
    });

    it("shows the unit's own exercises at the exercise step", () => {
        unit.step = 'exercises';
        renderUnit('a1-u1');
        expect(screen.getByText(`1 de ${getExercisesByUnit('a1-u1').length}`)).toBeInTheDocument();
    });

    it('celebrates a finished unit', () => {
        unit.step = 'completed';
        renderUnit('a1-u1');
        expect(screen.getByRole('heading', { name: '¡Unidad completada!' })).toBeInTheDocument();
    });

    it('turns the assessment unit into the end-of-level exam', async () => {
        renderUnit('a1-u8');
        expect(await screen.findByRole('button', { name: 'Comenzar' })).toBeInTheDocument();
        expect(screen.getByText(/preguntas de gramática/)).toBeInTheDocument();
    });

    it('keeps the end-of-level exam closed while a unit has its speaking pending', async () => {
        unit.tables.unit_progress = [{ unit_id: 'a1-u2', completed_at: '2026-11-03T00:00:00Z', speaking_pending: true }];
        renderUnit('a1-u8');
        expect(await screen.findByRole('heading', { name: 'Te falta 1 parte de habla' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Comenzar' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Falta: Habla/ })).toBeInTheDocument();
        unit.tables.unit_progress = [];
    });

    it('says so for a unit that does not exist', () => {
        renderUnit('z9-u1');
        expect(screen.getByText('Unidad no encontrada.')).toBeInTheDocument();
    });
});

describe('UnitFlow story step', () => {
    const stories = getStoriesByUnit('a1-u1');

    it('sends the learner to the next unread story', async () => {
        unit.step = 'story';
        unit.tables.read_stories = [{ story_id: stories[0].id }];
        renderUnit('a1-u1');
        fireEvent.click(await screen.findByRole('button', { name: `Leer «${stories[1].title}»` }));
        expect(await screen.findByText('Story page')).toBeInTheDocument();
        expect(unit.markStepComplete).not.toHaveBeenCalled();
    });

    it('completes the step once every story of the unit is read', async () => {
        unit.step = 'story';
        unit.tables.read_stories = stories.map(s => ({ story_id: s.id }));
        renderUnit('a1-u1');
        fireEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
        await waitFor(() => expect(unit.markStepComplete).toHaveBeenCalledWith('story'));
    });
});

describe('UnitFlow vocabulary step', () => {
    const deck = allVocabulary.filter(v => v.unitId === 'a1-u1');

    it('adds to the review only the words the learner does not have yet', async () => {
        unit.step = 'vocab';
        unit.tables.cards = [{ word_id: deck[0].id }];
        renderUnit('a1-u1');
        fireEvent.click(await screen.findByRole('button', { name: `Añadir ${deck.length - 1} palabras a mi repaso` }));
        await waitFor(() => expect(unit.saveStoryWords).toHaveBeenCalledOnce());
        const [, ids] = unit.saveStoryWords.mock.calls[0] as unknown as [string, string[]];
        expect(ids).toHaveLength(deck.length - 1);
        expect(ids).not.toContain(deck[0].id);
    });

    it('says so when the words could not be added, and lets the learner try again', async () => {
        unit.step = 'vocab';
        unit.saveStoryWords.mockRejectedValueOnce(new Error('offline'));
        renderUnit('a1-u1');
        const add = await screen.findByRole('button', { name: `Añadir ${deck.length} palabras a mi repaso` });
        fireEvent.click(add);
        await waitFor(() => expect(notices.error).toHaveBeenCalled());
        expect(add).toBeEnabled();
    });
});

describe('UnitFlow exercises with every answer wrong', () => {
    /** Answers the exercise on screen wrong, whatever its type, and goes to the next one. */
    async function answerWrong(ex: GrammarExercise) {
        if (ex.type === 'fill-blank') {
            fireEvent.change(await screen.findByRole('textbox'), { target: { value: 'zzz' } });
            fireEvent.click(screen.getByRole('button', { name: /Comprobar/ }));
        } else if (ex.type === 'multiple-choice') {
            fireEvent.click(await screen.findByRole('button', { name: ex.options!.find(o => o !== ex.correctAnswer)! }));
        } else {
            // The scrambled order itself is a wrong answer
            for (const w of ex.scrambledWords!) {
                fireEvent.click((await screen.findAllByRole('button', { name: w })).at(-1)!);
                await waitFor(() => expect(screen.getAllByRole('button', { name: w })).toHaveLength(1));
            }
            fireEvent.click(screen.getByRole('button', { name: /Comprobar/ }));
        }
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    }

    it('starts the exercises over, with the real runner, instead of leaving the learner on the score', async () => {
        unit.step = 'exercises';
        const exercises = getExercisesByUnit('a1-u1');
        expect(exercises.map(e => e.scrambledWords?.join(' ') ?? '')).not.toContain(exercises.find(e => e.type === 'word-order')!.correctAnswer);
        renderUnit('a1-u1');
        for (let i = 0; i < exercises.length; i++) {
            await screen.findByText(`${i + 1} de ${exercises.length}`);
            // The counter moves first; the next exercise appears once the last one has left
            await waitFor(() => expect(screen.queryByRole('button', { name: /Siguiente/ })).toBeNull());
            await answerWrong(exercises[i]);
        }
        await screen.findByText('Puntuación: 0%');
        // First a short review of what failed, then the set again; nothing is saved as passed
        fireEvent.click(screen.getByRole('button', { name: 'Ver qué repasar' }));
        expect(await screen.findByRole('heading', { name: 'Repasa antes de volver a intentarlo' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Intentarlo de nuevo/ }));
        expect(await screen.findByText(`1 de ${exercises.length}`)).toBeInTheDocument();
        expect(unit.updateProgress).not.toHaveBeenCalledWith({ exercises_score: 0 });
        expect(screen.queryByText('Puntuación: 0%')).toBeNull();
    // Six real exercises with their animations: longer than the default 5 s on a busy machine
    }, 20000);
});
