import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGardenPlant } from './useGardenPlant';
import { useAuth } from '../lib/AuthContext';
import { useTier } from './useTier';
import { supabase } from '../lib/supabase';

vi.mock('../lib/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('./useTier', () => ({ useTier: vi.fn() }));
vi.mock('../lib/supabase', () => ({
    supabase: { auth: { updateUser: vi.fn() } },
}));

function setup(gardenPlant: unknown, isPro: boolean, loading = false) {
    vi.mocked(useAuth).mockReturnValue({ user: { user_metadata: { garden_plant: gardenPlant } } } as any);
    vi.mocked(useTier).mockReturnValue({ isPro, loading } as any);
    return renderHook(() => useGardenPlant()).result;
}

describe('useGardenPlant', () => {
    beforeEach(() => vi.clearAllMocks());

    it('defaults to the sunflower when nothing is saved', () => {
        expect(setup(undefined, false).current.species).toBe('girasol');
    });

    it('ignores unknown saved values', () => {
        expect(setup('palmera', false).current.species).toBe('girasol');
    });

    it('uses a free species for any user', () => {
        expect(setup('cactus', false).current.species).toBe('cactus');
    });

    it('lets Pro users keep a Pro species', () => {
        expect(setup('bonsai', true).current.species).toBe('bonsai');
    });

    it('falls back to the sunflower when a free user has a Pro species saved', () => {
        const result = setup('bonsai', false);
        expect(result.current.species).toBe('girasol');
        expect(result.current.chosen).toBe('bonsai');
    });

    it('keeps the saved Pro species while the tier is still loading', () => {
        expect(setup('rosa', false, true).current.species).toBe('rosa');
    });

    it('saves the choice in user_metadata', async () => {
        vi.mocked(supabase.auth.updateUser).mockResolvedValue({ error: null } as any);
        const result = setup(undefined, false);
        await act(() => result.current.setPlant('tulipan'));
        expect(supabase.auth.updateUser).toHaveBeenCalledWith({ data: { garden_plant: 'tulipan' } });
    });

    it('throws when saving fails so the picker can roll back', async () => {
        vi.mocked(supabase.auth.updateUser).mockResolvedValue({ error: new Error('offline') } as any);
        const result = setup(undefined, false);
        await expect(result.current.setPlant('tulipan')).rejects.toThrow('offline');
    });
});
