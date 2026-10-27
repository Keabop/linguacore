import { useTranslation } from 'react-i18next';
import type { CEFRLevel } from '../../lib/db';

interface LevelBadgeProps {
    level: CEFRLevel;
    size?: 'default' | 'compact';
    /** Show the growth stage name next to the level (A1 Semilla, A2 Brote…). */
    withStage?: boolean;
}

const LEVEL_BG: Record<CEFRLevel, string> = {
    A1: 'var(--color-level-a1)',
    A2: 'var(--color-level-a2)',
    B1: 'var(--color-level-b1)',
    B2: 'var(--color-level-b2)',
};

/** CEFR level as a leaf-shaped chip in its growth-stage colour. */
export default function LevelBadge({ level, size = 'default', withStage = false }: LevelBadgeProps) {
    const { t } = useTranslation();
    const isDefault = size === 'default';

    return (
        <span
            className={`level-leaf ${isDefault ? 'text-xs px-3 py-1' : 'text-[10px] px-2 py-0.5'}`}
            style={{ background: LEVEL_BG[level] }}
            title={t(`garden.stage.${level}`)}
        >
            {level}
            {withStage && <span className="font-body font-semibold">{t(`garden.stage.${level}`)}</span>}
        </span>
    );
}
