import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { SkillCard } from '../lib/db';
import { CardState } from '../lib/db';
import { getSkillsByUnit } from '../data';
import { useSkillCards } from '../hooks/useSkillCards';

interface Props {
    unitId: string;
}

export default function SkillBreakdown({ unitId }: Props) {
    const skills = getSkillsByUnit(unitId);
    const { getSkillCardsByUnit } = useSkillCards();
    const [cards, setCards] = useState<SkillCard[]>([]);

    useEffect(() => {
        getSkillCardsByUnit(unitId).then(setCards);
    }, [unitId, getSkillCardsByUnit]);

    if (skills.length === 0) return null;

    const cardMap = new Map(cards.map(c => [c.skillId, c]));
    const masteredCount = cards.filter(c => c.state === CardState.Review && c.stability > 10).length;

    return (
        <div className="space-y-3 mt-3">
            {/* Mastery bar */}
            <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--color-on-surface-muted)]">Skills:</span>
                <div className="flex-1 h-1.5 bg-[var(--color-background)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${skills.length > 0 ? (masteredCount / skills.length) * 100 : 0}%` }}
                    />
                </div>
                <span className="text-[var(--color-on-surface-muted)] font-bold">{masteredCount}/{skills.length}</span>
            </div>

            {/* Skill list */}
            <div className="space-y-1.5">
                {skills.map(skill => {
                    const card = cardMap.get(skill.id);
                    const isDue = card && new Date(card.due) <= new Date();
                    const isMastered = card && card.state === CardState.Review && card.stability > 10;

                    return (
                        <div key={skill.id} className="flex items-center gap-2 text-xs">
                            {isMastered ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                            ) : isDue ? (
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            ) : card ? (
                                <Clock className="w-3.5 h-3.5 text-[var(--color-on-surface-muted)] flex-shrink-0" />
                            ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-[var(--color-outline-subtle)] flex-shrink-0" />
                            )}
                            <span className={`${isDue ? 'text-amber-400' : isMastered ? 'text-green-400' : 'text-[var(--color-on-surface-muted)]'}`}>
                                {skill.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
