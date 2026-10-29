import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/supabase', () => ({ supabase: { from: () => ({ insert: async () => ({}) }) } }));
vi.mock('../lib/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));

import LevelAssessment from './LevelAssessment';
import { getUnitsByLevel } from '../data';
import { levelFinalBanks } from '../data/assessments/level-final';

const renderExam = () => render(
    <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
            <LevelAssessment level="A1" unitId="a1-u8" onComplete={() => {}} />
        </QueryClientProvider>
    </MemoryRouter>,
);

describe('LevelAssessment', () => {
    const units = getUnitsByLevel('A1').filter(u => !u.isAssessment).length;
    const total = units + levelFinalBanks.A1.transfer.length + 10;

    it('says what the exam has before it starts', () => {
        renderExam();
        expect(screen.getByText(`${units + levelFinalBanks.A1.transfer.length} preguntas de gramática`)).toBeInTheDocument();
        expect(screen.getByText('80% para aprobar')).toBeInTheDocument();
    });

    it('asks one question at a time and moves on only once it is answered', () => {
        renderExam();
        fireEvent.click(screen.getByRole('button', { name: 'Comenzar' }));
        expect(screen.getByText(new RegExp(`Pregunta 1 de ${total}`))).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    });
});
