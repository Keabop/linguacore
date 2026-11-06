import type { ReactElement } from 'react';
import { act, render as rtlRender, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getUnitsByLevel } from '../../data/curriculum/units';
import { unitTitle } from '../../data/curriculum/unitTitles';
import type { GardenUnitState } from '../garden3d/states';
import PathList from './PathList';

vi.mock('../../lib/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

const render = (ui: ReactElement) => rtlRender(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

const units = getUnitsByLevel('A1').slice(0, 3);
const states: GardenUnitState[] = ['done', 'current', 'locked'];

const expanded = () => screen.getAllByRole('button', { expanded: true }).map(b => b.textContent ?? '');

describe('PathList', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('shows the unit just completed open, then closes it and opens the next one', () => {
        render(<PathList level="A1" units={units} states={states} progress={[]} species="girasol" openAt={0} thenOpen={1} onOpen={vi.fn()} />);
        expect(expanded()).toHaveLength(1);
        expect(expanded()[0]).toContain(unitTitle(units[0]));

        act(() => { vi.advanceTimersByTime(1500); });
        expect(screen.getByRole('button', { name: new RegExp(unitTitle(units[1])) })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: new RegExp(unitTitle(units[0])) })).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens the unit in progress and leaves it open without a completed one', () => {
        render(<PathList level="A1" units={units} states={states} progress={[]} species="girasol" openAt={1} onOpen={vi.fn()} />);
        act(() => { vi.advanceTimersByTime(3000); });
        expect(screen.getByRole('button', { name: new RegExp(unitTitle(units[1])) })).toHaveAttribute('aria-expanded', 'true');
    });
});
