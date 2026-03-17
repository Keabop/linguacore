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
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
        isExhausted
          ? 'bg-red-500/10 text-red-400'
          : isLow
            ? 'bg-amber-500/10 text-amber-400'
            : 'bg-white/5 text-text-muted'
      }`}
    >
      {remaining}/{limit} {label}
    </span>
  );
}
