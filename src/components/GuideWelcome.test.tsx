import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import GuideWelcome from './GuideWelcome';

const renderWelcome = (onDone = vi.fn()) => {
    render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
                <Route path="/dashboard" element={<GuideWelcome open onDone={onDone} />} />
                <Route path="/guia" element={<p>la guía</p>} />
            </Routes>
        </MemoryRouter>,
    );
    return onDone;
};

describe('Bienvenida', () => {
    it('leads to the guide and is not shown again', () => {
        const onDone = renderWelcome();
        expect(screen.getByRole('dialog', { name: 'Te damos la bienvenida a Voxie' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Ver la guía' }));
        expect(onDone).toHaveBeenCalled();
        expect(screen.getByText('la guía')).toBeInTheDocument();
    });

    it('can be left for later, also with Escape', () => {
        const onDone = renderWelcome();
        fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }));
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onDone).toHaveBeenCalledTimes(2);
    });
});
