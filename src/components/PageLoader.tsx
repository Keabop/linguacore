import { useLayoutEffect, useState } from 'react';

/** How long the sprout takes to grow; keep in sync with the delays in index.css (.sprout-loader). */
export const SPROUT_GROW_MS = 800;

// Several loaders often follow each other (session check, page chunk, page data). They share one
// start time so the sprout keeps growing across them instead of starting over each time.
const REUSE_WINDOW_MS = 300;
let mounted = 0;
let startedAt = 0;
let lastUnmountAt = 0;

/** Resolves once the sprout of the loader on screen (if any) has finished growing. */
export function afterSproutGrows(): Promise<void> {
    // Wait a frame: the Suspense fallback mounts after the lazy import has started
    return new Promise(resolve => requestAnimationFrame(() => {
        if (!mounted) return resolve();
        setTimeout(resolve, Math.max(0, startedAt + SPROUT_GROW_MS - performance.now()));
    }));
}

/** Page loader: a sprout that grows from the soil once and then sways while it waits. */
export default function PageLoader() {
    const [offset] = useState(() => {
        const now = performance.now();
        if (!mounted && now - lastUnmountAt > REUSE_WINDOW_MS) startedAt = now;
        return now - startedAt;
    });

    useLayoutEffect(() => {
        mounted++;
        return () => {
            mounted--;
            lastUnmountAt = performance.now();
        };
    }, []);

    return (
        <div className="flex min-h-[60vh] items-center justify-center" role="status">
            <svg
                viewBox="0 0 48 56"
                className="sprout-loader h-14 w-12"
                style={{ '--sprout-offset': `${Math.round(offset)}ms` } as React.CSSProperties}
                aria-hidden="true"
            >
                <ellipse cx="24" cy="50" rx="14" ry="3.5" className="sprout-loader-soil" />
                <g className="sprout-loader-plant">
                    <path d="M24 49V24" className="sprout-loader-stem" pathLength={1} />
                    <path d="M24 32c0-7 5-12 13-12 0 8-5 13-13 12Z" className="sprout-loader-leaf sprout-loader-leaf-r" />
                    <path d="M24 38c0-6-4.5-10-11-10 0 6.5 4.5 10.5 11 10Z" className="sprout-loader-leaf sprout-loader-leaf-l" />
                </g>
            </svg>
            <span className="sr-only">Cargando…</span>
        </div>
    );
}
