interface UsageBadgeProps {
  remaining: number;
  limit: number;
  label: string;
}

export function UsageBadge({ remaining, limit, label }: UsageBadgeProps) {
  if (!isFinite(limit)) return null;

  const isLow = remaining <= Math.ceil(limit * 0.2);
  const isExhausted = remaining === 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium shadow-sm ${
        isExhausted
          ? 'bg-[var(--color-error)]/10 text-[var(--color-error)] shadow-[var(--color-error)]/5'
          : isLow
            ? 'bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary-ink)] shadow-[var(--color-tertiary)]/5'
            : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)]'
      }`}
    >
      {remaining}/{limit} {label}
    </span>
  );
}
