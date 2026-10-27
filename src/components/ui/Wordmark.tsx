/** Voxie leaf mark: a stem with two leaves, in the leaf colour. */
export function LeafMark({ className = 'w-7 h-7' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={`text-[var(--color-primary)] ${className}`} aria-hidden="true">
            <path d="M12 21V11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M12 12c0-4 3-7 8-7 0 5-3 8-8 7Z" fill="currentColor" />
            <path d="M12 15c0-3-2.5-5.5-7-5.5 0 4 2.5 6 7 5.5Z" fill="currentColor" opacity=".55" />
        </svg>
    );
}

/** Mark + lowercase name, as in the identity sheet. */
export default function Wordmark({ className = '', markClassName = 'w-7 h-7' }: { className?: string; markClassName?: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 font-display font-extrabold tracking-[-0.04em] text-[var(--color-on-surface)] ${className}`}>
            <LeafMark className={markClassName} />
            voxie
        </span>
    );
}
