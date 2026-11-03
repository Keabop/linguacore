import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LegalConsent from './LegalConsent';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { LEGAL_VERSION } from '../data/legalOwner';

vi.mock('../lib/supabase', () => ({ supabase: { auth: { updateUser: vi.fn() } } }));
vi.mock('../lib/AuthContext', () => ({ useAuth: vi.fn() }));

const signOut = vi.fn();
function signedIn(metadata: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'user-1', user_metadata: metadata }, signOut } as any);
}

const renderGate = () => render(<MemoryRouter><LegalConsent><p>la app</p></LegalConsent></MemoryRouter>);

beforeEach(() => vi.clearAllMocks());

describe('LegalConsent', () => {
    it('lets an account that accepted this version straight in', () => {
        signedIn({ accepted_legal: LEGAL_VERSION });
        renderGate();
        expect(screen.getByText('la app')).toBeInTheDocument();
    });

    it('stops an account made with Google until it accepts, and records the version', async () => {
        signedIn({ full_name: 'Ana' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(supabase.auth.updateUser).mockResolvedValue({ error: null } as any);
        renderGate();
        expect(screen.queryByText('la app')).not.toBeInTheDocument();

        const accept = screen.getByRole('button', { name: 'Aceptar y continuar' });
        expect(accept).toBeDisabled();
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(accept);
        await waitFor(() => expect(supabase.auth.updateUser).toHaveBeenCalledWith({ data: { accepted_legal: LEGAL_VERSION } }));
    });

    it('opens the terms in a new tab and lets the person sign out instead', () => {
        signedIn({ accepted_legal: '2020-01-01' });
        renderGate();
        expect(screen.getByRole('link', { name: 'Términos' })).toHaveAttribute('target', '_blank');
        fireEvent.click(screen.getByRole('button', { name: 'No acepto, cerrar sesión' }));
        expect(signOut).toHaveBeenCalled();
    });
});
