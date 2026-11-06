import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    saveGoal: vi.fn(async () => true),
    markOpened: vi.fn(),
    openNotebook: vi.fn(),
    goal: 1 as number | undefined,
}));
vi.mock('../hooks/useDailyGoal', () => ({ useDailyGoal: () => mocks.saveGoal }));
vi.mock('../hooks/useGuide', () => ({ useGuide: () => ({ opened: false, welcomeSeen: false, markOpened: mocks.markOpened, markWelcomeSeen: vi.fn() }) }));
vi.mock('../hooks/useLevelProgression', () => ({ useLevelProgression: () => ({ user: mocks.goal === undefined ? undefined : { dailyGoal: mocks.goal } }) }));
vi.mock('../components/notebook/NotebookContext', () => ({ useNotebook: () => ({ open: mocks.openNotebook }) }));

import Guide from './Guide';

const renderGuide = () => render(<MemoryRouter><Guide /></MemoryRouter>);

describe('Guía', () => {
    beforeEach(() => {
        mocks.saveGoal.mockClear();
        mocks.markOpened.mockClear();
        mocks.openNotebook.mockClear();
        mocks.goal = 1;
    });

    it('lists its chapters and marks the guide as opened', () => {
        renderGuide();
        expect(screen.getByRole('heading', { level: 1, name: 'Cómo aprender con Voxie' })).toBeInTheDocument();
        const contents = screen.getByRole('navigation', { name: 'En esta guía' });
        expect(contents.querySelectorAll('a')).toHaveLength(7);
        expect(screen.getByRole('heading', { level: 2, name: 'Qué anotar en tu libreta' })).toBeInTheDocument();
        expect(mocks.markOpened).toHaveBeenCalled();
    });

    it('counts the units of each level from the curriculum', () => {
        renderGuide();
        expect(screen.getByText('7 unidades y un examen')).toBeInTheDocument();
        expect(screen.getByText('13 unidades y un examen')).toBeInTheDocument();
    });

    it('starts the plan at the current goal and adopts another one', async () => {
        renderGuide();
        expect(screen.getByText('Es tu meta: 1 actividad al día')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('tab', { name: '40 min' }));
        expect(screen.getAllByText('Checkpoint').length).toBeGreaterThan(1);
        fireEvent.click(screen.getByRole('button', { name: /Usar esta meta: 3 actividades al día/ }));

        expect(mocks.saveGoal).toHaveBeenCalledWith(3);
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Listo. Tu meta del inicio ya cambió.'));
    });

    it('says so when the goal could not be saved', async () => {
        mocks.saveGoal.mockResolvedValueOnce(false);
        renderGuide();
        fireEvent.click(screen.getByRole('tab', { name: '20 min' }));
        fireEvent.click(screen.getByRole('button', { name: /Usar esta meta: 2 actividades/ }));
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No se pudo guardar tu meta.'));
    });

    it('opens the plan at the goal of a profile that arrives after the page', () => {
        mocks.goal = undefined;
        const { rerender } = renderGuide();
        mocks.goal = 3;
        rerender(<MemoryRouter><Guide /></MemoryRouter>);
        expect(screen.getByRole('tab', { name: '40 min' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Es tu meta: 3 actividades al día')).toBeInTheDocument();
    });

    it('opens the notebook from its tool', () => {
        renderGuide();
        fireEvent.click(screen.getByRole('button', { name: 'Abrir la libreta' }));
        expect(mocks.openNotebook).toHaveBeenCalled();
    });
});
