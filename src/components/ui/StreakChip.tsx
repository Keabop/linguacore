import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame } from 'lucide-react';

interface StreakChipProps {
    count: number;
    className?: string;
}

/** Sun pill with the streak. The flame jumps once when the count goes up (an achievement moment). */
export default function StreakChip({ count, className = '' }: StreakChipProps) {
    const { t } = useTranslation();
    const prev = useRef(count);
    const [bumped, setBumped] = useState(false);

    useEffect(() => {
        if (count > prev.current) {
            setBumped(false);
            requestAnimationFrame(() => setBumped(true));
        }
        prev.current = count;
    }, [count]);

    return (
        <span
            className={`streak-chip ${bumped ? 'is-bumped' : ''} ${className}`}
            aria-label={t('garden.streakLabel', { count })}
            onAnimationEnd={() => setBumped(false)}
        >
            <Flame className="w-4 h-4" fill="currentColor" aria-hidden="true" />
            {count}
        </span>
    );
}
