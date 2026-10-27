import { useEffect, useState } from 'react';
import { SPECIES, type SpeciesId } from './species';

export type PlantStage = 'seed' | 'sprout' | 'grown';

interface PlantProps {
    species: SpeciesId;
    stage: PlantStage;
    /** Stem height in viewBox units (the frame is 64 tall, soil at 56). */
    height?: number;
    /** Start as a seed and grow into `stage` after `delay` ms. */
    grow?: boolean;
    delay?: number;
    className?: string;
}

const SOIL_Y = 56;

export default function Plant({ species, stage, height = 44, grow = false, delay = 0, className = '' }: PlantProps) {
    const [shown, setShown] = useState<PlantStage>(grow ? 'seed' : stage);

    useEffect(() => {
        if (!grow) {
            setShown(stage);
            return;
        }
        const id = window.setTimeout(() => setShown(stage), delay);
        return () => window.clearTimeout(id);
    }, [stage, grow, delay]);

    const sp = SPECIES[species];
    const top = SOIL_Y - height;
    const low = SOIL_Y - height * 0.45;
    const [leafLow, leafTop] = sp.leaves(top, low);

    return (
        <span className={`plant sp-${species} is-${shown} ${className}`} aria-hidden="true">
            <svg viewBox="0 0 40 64" preserveAspectRatio="xMidYMax meet">
                <ellipse className="seed" cx={20} cy={SOIL_Y + 1} rx={4.5} ry={3} />
                <path
                    className="stem"
                    pathLength={100}
                    d={`M20 ${SOIL_Y} C 19 ${SOIL_Y - height * 0.35}, 22 ${SOIL_Y - height * 0.7}, 20 ${top}`}
                />
                <path className="leaf leaf-low" d={leafLow} />
                <path className="leaf leaf-top" d={leafTop} />
                <g className="bloom">{sp.bloom(20, top - 3)}</g>
            </svg>
        </span>
    );
}
