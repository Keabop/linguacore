import { useQuery } from '@tanstack/react-query';
import type { CEFRLevel } from '../lib/db';
import type { UnitProgressRow } from '../lib/database.types';
import { getUnitsByLevel } from '../data/curriculum/units';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

/** Progress rows of every unit of a level (the path and the end-of-level exam share the query). */
export function useLevelUnitProgress(level: CEFRLevel) {
    const { user } = useAuth();
    const units = getUnitsByLevel(level);
    const query = useQuery({
        queryKey: ['unitProgress', level, user?.id],
        queryFn: async () => {
            if (units.length === 0) return [];
            const { data, error } = await supabase.from('unit_progress').select('*').in('unit_id', units.map(u => u.id));
            // A failed read must not look like "nothing pending": the exam would open
            if (error) throw error;
            return (data ?? []) as UnitProgressRow[];
        },
        enabled: !!user?.id && units.length > 0,
    });
    // Units finished with their speaking left for later, in the order of the path
    const pendingSpeaking = units.filter(u => query.data?.some(p => p.unit_id === u.id && p.speaking_pending));
    return { units, progress: query.data, isLoading: query.isLoading, isError: query.isError, pendingSpeaking };
}
