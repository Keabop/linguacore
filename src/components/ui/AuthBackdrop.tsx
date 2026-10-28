/** A small two-leaf sprout planted at (x, y). */
function Sprout({ x, y, scale = 1, light = false }: { x: number; y: number; scale?: number; light?: boolean }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${scale})`} className="auth-sprout">
            <path d="M0 0V-22" stroke="var(--color-primary)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M0 -14c0-7 5-12 13-12 0 8-5 13-13 12Z" fill={light ? 'var(--color-primary-light)' : 'var(--color-primary)'} />
            <path d="M0 -8c0-6-4.5-10-11-10 0 6.5 4.5 10.5 11 10Z" fill="var(--color-primary-light)" />
        </g>
    );
}

/**
 * The auth screens' landscape: a sun over rolling hills with sprouts, in the garden's tokens
 * (so it follows light and dark). It covers whatever box it is given, anchored at the bottom.
 */
export default function AuthBackdrop({ className = '' }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMax slice"
            className={`pointer-events-none ${className}`}
        >
            <rect width="400" height="800" fill="var(--color-surface-container-low)" />

            {/* A sun rising behind the hills: low enough to show in a wide panel as well as a tall phone */}
            <circle cx="290" cy="500" r="92" fill="var(--color-tertiary-container)" />
            <circle cx="290" cy="500" r="52" fill="var(--color-tertiary)" opacity="0.55" />

            {/* Leaves drifting in the wind */}
            <path className="auth-leaf auth-leaf-1" d="M70 380c0-7 5-12 13-12 0 8-5 13-13 12Z" fill="var(--color-primary-light)" opacity="0.7" />
            <path className="auth-leaf auth-leaf-2" d="M180 430c0-6-4.5-10-11-10 0 6.5 4.5 10.5 11 10Z" fill="var(--color-primary)" opacity="0.5" />
            <path className="auth-leaf auth-leaf-3" d="M120 470c0-7 5-12 13-12 0 8-5 13-13 12Z" fill="var(--color-level-a2)" opacity="0.8" />

            <path d="M0 560C90 500 190 515 262 545C322 568 362 542 400 520V800H0Z" fill="var(--color-primary-container)" />
            <path d="M0 645C110 592 212 610 302 640C350 656 380 650 400 640V800H0Z" fill="var(--color-level-a2)" opacity="0.55" />
            <Sprout x={70} y={622} scale={0.9} light />
            <Sprout x={248} y={622} scale={0.75} />
            <path d="M0 722C120 680 262 698 400 688V800H0Z" fill="var(--color-primary)" opacity="0.85" />
            <Sprout x={150} y={700} scale={1.1} light />
            <Sprout x={330} y={694} />
            <rect y="772" width="400" height="28" fill="var(--color-soil)" />
        </svg>
    );
}
