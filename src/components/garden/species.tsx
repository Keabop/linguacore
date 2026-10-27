import type { ReactNode } from 'react';

/*
 * Garden species. Every species shares the same growth stages (seed → sprout → grown)
 * and the same SVG frame (viewBox 0 0 40 64, soil surface at y = 56); only the leaves
 * and the bloom change. Colours come from tokens in index.css.
 */

export type SpeciesId =
    | 'girasol' | 'tulipan' | 'margarita' | 'cactus'
    | 'rosa' | 'lavanda' | 'bonsai' | 'orquidea';

export interface Species {
    id: SpeciesId;
    pro: boolean;
    /** Leaf paths [low, top] for a plant whose stem goes from the soil up to `top`. */
    leaves: (top: number, low: number) => [string, string];
    bloom: (cx: number, cy: number) => ReactNode;
}

export const DEFAULT_SPECIES: SpeciesId = 'girasol';

function ring(n: number, cx: number, cy: number, dist: number, rx: number, ry: number, className: string) {
    return Array.from({ length: n }, (_, i) => (
        <ellipse
            key={i}
            className={className}
            cx={cx}
            cy={cy - dist}
            rx={rx}
            ry={ry}
            transform={`rotate(${(360 / n) * i} ${cx} ${cy})`}
        />
    ));
}

const roundLeaves = (top: number, low: number): [string, string] => [
    `M20 ${low} c -2 -7 -8 -10 -14 -10 c 0 7 5 11 14 10 z`,
    `M20.5 ${top + 9} c 2 -8 8 -12 15 -12 c 0 8 -6 13 -15 12 z`,
];

const bladeLeaves = (_top: number, low: number): [string, string] => [
    `M20 ${low + 4} c -3 -8 -7 -16 -7 -24 c 4 5 7 13 7 24 z`,
    `M20 ${low + 2} c 3 -7 6 -13 6 -20 c -3 4 -6 10 -6 20 z`,
];

export const SPECIES: Record<SpeciesId, Species> = {
    girasol: {
        id: 'girasol',
        pro: false,
        leaves: roundLeaves,
        bloom: (cx, cy) => (
            <>
                {ring(10, cx, cy, 5.6, 2.3, 4, 'petal-sun')}
                <circle className="core-sun" cx={cx} cy={cy} r={4.3} />
            </>
        ),
    },
    tulipan: {
        id: 'tulipan',
        pro: false,
        leaves: bladeLeaves,
        bloom: (cx, cy) => (
            <path
                className="petal-tulip"
                d={`M${cx - 6} ${cy - 1} C ${cx - 7} ${cy - 9}, ${cx - 3} ${cy - 11}, ${cx - 2} ${cy - 7} L ${cx} ${cy - 11} L ${cx + 2} ${cy - 7} C ${cx + 3} ${cy - 11}, ${cx + 7} ${cy - 9}, ${cx + 6} ${cy - 1} C ${cx + 5} ${cy + 4}, ${cx - 5} ${cy + 4}, ${cx - 6} ${cy - 1} Z`}
            />
        ),
    },
    margarita: {
        id: 'margarita',
        pro: false,
        leaves: roundLeaves,
        bloom: (cx, cy) => (
            <>
                {ring(12, cx, cy, 5, 1.7, 3.8, 'petal-daisy')}
                <circle className="core-daisy" cx={cx} cy={cy} r={3} />
            </>
        ),
    },
    cactus: {
        id: 'cactus',
        pro: false,
        leaves: (top, low) => [`M16.5 ${low + 2} h -4 v -8`, `M23.5 ${top + 14} h 4 v -7`],
        bloom: (cx, cy) => (
            <>
                {ring(5, cx, cy + 1, 2.6, 2, 2.6, 'petal-cactus')}
                <circle className="core-daisy" cx={cx} cy={cy + 1} r={1.6} />
            </>
        ),
    },
    rosa: {
        id: 'rosa',
        pro: true,
        leaves: roundLeaves,
        bloom: (cx, cy) => (
            <>
                <path className="leaf-sepal" d={`M${cx} ${cy + 5} l -6 3 l 2.5 -6 z M${cx} ${cy + 5} l 6 3 l -2.5 -6 z`} />
                <circle className="petal-rose" cx={cx} cy={cy} r={7} />
                <path className="petal-rose-inner" d={`M${cx - 4.4} ${cy} a 4.4 4.4 0 1 1 4.4 4.4 a 2.8 2.8 0 1 1 -1.9 -4.8`} />
                <circle className="petal-rose-core" cx={cx + 0.5} cy={cy - 0.7} r={1.7} />
            </>
        ),
    },
    lavanda: {
        id: 'lavanda',
        pro: true,
        leaves: bladeLeaves,
        bloom: (cx, cy) => (
            <>
                {Array.from({ length: 7 }, (_, i) => (
                    <ellipse
                        key={i}
                        className="petal-lavender"
                        cx={cx + (i % 2 === 0 ? -1.6 : 1.6)}
                        cy={cy + 3 - i * 2.4}
                        rx={2}
                        ry={1.6}
                    />
                ))}
            </>
        ),
    },
    bonsai: {
        id: 'bonsai',
        pro: true,
        leaves: (top, low) => [
            `M20 ${low - 2} m -11 0 a 5.5 4.2 0 1 0 11 0 a 5.5 4.2 0 1 0 -11 0`,
            `M20 ${top + 10} m 0 0 a 6 4.4 0 1 0 12 0 a 6 4.4 0 1 0 -12 0`,
        ],
        bloom: (cx, cy) => (
            <>
                <ellipse className="foliage" cx={cx - 3.5} cy={cy + 1} rx={5} ry={4} />
                <ellipse className="foliage" cx={cx + 3.5} cy={cy + 1} rx={5} ry={4} />
                <ellipse className="foliage" cx={cx} cy={cy - 2.5} rx={5.5} ry={4.2} />
            </>
        ),
    },
    orquidea: {
        id: 'orquidea',
        pro: true,
        leaves: (_top, low) => [
            `M20 ${low + 14} c -4 -5 -11 -5 -15 -2 c 5 3 11 4 15 2 z`,
            `M20 ${low + 12} c 4 -5 11 -5 15 -2 c -5 3 -11 4 -15 2 z`,
        ],
        bloom: (cx, cy) => (
            <>
                {ring(5, cx, cy, 4.6, 2.6, 3.8, 'petal-orchid')}
                <path className="petal-orchid-lip" d={`M${cx - 2.6} ${cy + 1} q 2.6 5 5.2 0 q -2.6 -1.6 -5.2 0 z`} />
                <circle className="core-daisy" cx={cx} cy={cy - 0.4} r={1.2} />
            </>
        ),
    },
};

export const SPECIES_ORDER: SpeciesId[] = [
    'girasol', 'tulipan', 'margarita', 'cactus', 'rosa', 'lavanda', 'bonsai', 'orquidea',
];

export function isSpeciesId(value: unknown): value is SpeciesId {
    return typeof value === 'string' && value in SPECIES;
}
