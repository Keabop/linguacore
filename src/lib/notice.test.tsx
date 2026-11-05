import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { PageNotice, notice } from './notice';

let go: (path: string) => void = () => {};
function Nav() {
    go = useNavigate();
    return null;
}

const renderNotice = () => render(
    <MemoryRouter initialEntries={['/practice']}>
        <Nav />
        <PageNotice />
    </MemoryRouter>,
);

describe('PageNotice', () => {
    afterEach(() => act(() => notice.clear()));

    it('writes an error on the page and closes it', () => {
        renderNotice();
        act(() => notice.error({ title: 'No se pudo guardar' }));
        expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar');
        fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('leaves with the screen it belongs to', () => {
        renderNotice();
        act(() => notice.error({ title: 'No se pudo guardar' }));
        act(() => go('/dashboard'));
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('keeps an ended session through the jump to the sign-in, and no further', () => {
        renderNotice();
        act(() => notice.error({ title: 'Tu sesión terminó', persist: true }));
        act(() => go('/auth'));
        expect(screen.getByRole('alert')).toHaveTextContent('Tu sesión terminó');
        act(() => go('/landing'));
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
