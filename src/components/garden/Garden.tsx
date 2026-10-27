import Plant from './Plant';
import { useGardenPlant } from '../../hooks/useGardenPlant';
import type { SpeciesId } from './species';

interface GardenProps {
    /** Units in the current level. */
    total: number;
    /** Units already completed; the next one shows as a sprout. */
    completed: number;
    /** Accessible description, e.g. "5 de 8 unidades completas". */
    label: string;
    /** Overrides the user's chosen species (previews, landing). */
    species?: SpeciesId;
    /** Grow the plants on mount instead of rendering them grown. */
    grow?: boolean;
    className?: string;
}

// Fixed (not random) so the row reads as a garden and stays stable between renders.
const HEIGHTS = [40, 46, 36, 48, 42, 44, 38, 46];

export default function Garden({ total, completed, label, species, grow = true, className = '' }: GardenProps) {
    const { species: chosen } = useGardenPlant();
    const sp = species ?? chosen;
    const count = Math.max(total, 1);

    return (
        <div
            role="img"
            aria-label={label}
            className={`garden ${className}`}
            style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        >
            {Array.from({ length: count }, (_, i) => (
                <Plant
                    key={i}
                    species={sp}
                    stage={i < completed ? 'grown' : i === completed ? 'sprout' : 'seed'}
                    height={HEIGHTS[i % HEIGHTS.length]}
                    grow={grow}
                    delay={150 + i * 110}
                />
            ))}
        </div>
    );
}
