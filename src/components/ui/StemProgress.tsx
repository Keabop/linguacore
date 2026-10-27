interface StemProgressProps {
    /** 0–100 */
    value: number;
    label: string;
    className?: string;
}

/** Progress bar drawn as a growing stem with a leaf at its tip. */
export default function StemProgress({ value, label, className = '' }: StemProgressProps) {
    const pct = Math.min(100, Math.max(0, Math.round(value)));

    return (
        <div
            className={`progress-bloom ${className}`}
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
        >
            <div className="progress-bloom-fill" style={{ width: `${pct}%` }} />
        </div>
    );
}
