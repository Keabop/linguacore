import { useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { useTier } from './useTier';
import { DEFAULT_SPECIES, SPECIES, isSpeciesId, type SpeciesId } from '../components/garden/species';

/**
 * The user's garden species. Stored in Supabase Auth `user_metadata.garden_plant`
 * so it follows the user across devices without a table. Pro species fall back to
 * the default when the user is not (or no longer) Pro.
 */
export function useGardenPlant() {
    const { user } = useAuth();
    const { isPro, loading } = useTier();

    const saved = user?.user_metadata?.garden_plant;
    const chosen: SpeciesId = isSpeciesId(saved) ? saved : DEFAULT_SPECIES;
    const species: SpeciesId = SPECIES[chosen].pro && !isPro && !loading ? DEFAULT_SPECIES : chosen;

    const setPlant = useCallback(async (id: SpeciesId) => {
        const { error } = await supabase.auth.updateUser({ data: { garden_plant: id } });
        if (error) throw error;
    }, []);

    return { species, chosen, setPlant, isPro };
}
