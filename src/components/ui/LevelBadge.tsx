import type { CEFRLevel } from '../../lib/db';

interface LevelBadgeProps {
    level: CEFRLevel;
    size?: 'default' | 'compact';
}

const levelConfig: Record<CEFRLevel, {
    bg: string;
    text: string;
}> = {
    A1: {
        bg: 'bg-[#60A5FA]/10',
        text: 'text-[#7AB4F5]',
    },
    A2: {
        bg: 'bg-[#4ADE80]/10',
        text: 'text-[#6CD99A]',
    },
    B1: {
        bg: 'bg-[#FBBF24]/10',
        text: 'text-[#D4A832]',
    },
    B2: {
        bg: 'bg-[#F87171]/10',
        text: 'text-[#D98080]',
    },
};

export default function LevelBadge({ level, size = 'default' }: LevelBadgeProps) {
    const config = levelConfig[level];

    const isDefault = size === 'default';

    return (
        <span
            className={`
                inline-flex items-center justify-center
                font-bold tracking-wide select-none whitespace-nowrap
                ${config.bg} ${config.text}
                ${isDefault
                    ? 'text-xs px-3 py-1 rounded-md min-w-[40px]'
                    : 'text-[10px] px-2 py-0.5 rounded-md min-w-[32px]'
                }
            `}
        >
            {level}
        </span>
    );
}
