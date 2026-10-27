import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FlameIcon, type AnimatedIconHandle } from '../icons';

interface StreakChipProps {
    count: number;
    className?: string;
}

/** Sun pill with the streak. The flame flickers once when the count goes up (an achievement moment). */
export default function StreakChip({ count, className = '' }: StreakChipProps) {
    const { t } = useTranslation();
    const prev = useRef(count);
    const flame = useRef<AnimatedIconHandle>(null);

    useEffect(() => {
        if (count > prev.current) flame.current?.startAnimation();
        prev.current = count;
    }, [count]);

    return (
        <span className={`streak-chip ${className}`}>
            <FlameIcon ref={flame} size={16} aria-hidden="true" />
            <span aria-hidden="true">{count}</span>
            <span className="sr-only">{t('garden.streakLabel', { count })}</span>
        </span>
    );
}
