/** Page loader: a sprout that grows from the soil and starts again, instead of a spinner. */
export default function PageLoader() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center" role="status">
            <svg viewBox="0 0 48 56" className="sprout-loader h-14 w-12" aria-hidden="true">
                <ellipse cx="24" cy="50" rx="14" ry="3.5" className="sprout-loader-soil" />
                <path d="M24 49V24" className="sprout-loader-stem" pathLength={1} />
                <path d="M24 32c0-7 5-12 13-12 0 8-5 13-13 12Z" className="sprout-loader-leaf sprout-loader-leaf-r" />
                <path d="M24 38c0-6-4.5-10-11-10 0 6.5 4.5 10.5 11 10Z" className="sprout-loader-leaf sprout-loader-leaf-l" />
            </svg>
            <span className="sr-only">Cargando…</span>
        </div>
    );
}
