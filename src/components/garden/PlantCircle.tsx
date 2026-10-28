import Plant from './Plant';
import type { SpeciesId } from './species';

interface PlantCircleProps {
    species: SpeciesId;
    /** Stem height in the plant's viewBox units; up to 44 keeps the flower inside the circle. */
    height?: number;
    size?: 'md' | 'lg';
    grow?: boolean;
    delay?: number;
}

const SIZE = { md: 'h-24 w-24', lg: 'h-36 w-36' };

/**
 * A grown plant in a round bed with its soil: empty states, story completed, unit and level
 * up. `Plant` fills its container, so it needs a sized one; this one keeps the whole plant,
 * flower included, inside the circle at any size.
 */
export default function PlantCircle({ species, height = 40, size = 'md', grow = true, delay = 0 }: PlantCircleProps) {
    return (
        <div className={`relative mx-auto ${SIZE[size]} overflow-hidden rounded-full bg-[var(--color-primary-container)] shadow-[inset_0_-0.75rem_0_var(--color-soil)]`}>
            {/* The plant's soil line (88% of its frame) meets the soil band at the bottom */}
            <div className="absolute inset-x-0 top-[4%] bottom-0 mx-auto w-3/5">
                <Plant species={species} stage="grown" height={Math.min(height, 44)} grow={grow} delay={delay} />
            </div>
        </div>
    );
}
