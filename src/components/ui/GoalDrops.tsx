import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplet, Snowflake } from 'lucide-react';
import { celebrateCorrect } from '../../lib/celebrate';
import { localDate } from '../../lib/studyActivity';

const CELEBRATED_KEY = 'voxie.goalCelebrated';

interface GoalDropsProps {
    /** Activities done today. */
    done: number;
    /** Activities a day the learner aims for (1–3). */
    goal: number;
    /** Streak freezes left. */
    freezes: number;
}

/** Today's goal as drops to water the garden, and the freezes that keep the streak. The drops pop once a day when the goal is met. */
export default function GoalDrops({ done, goal, freezes }: GoalDropsProps) {
    const { t } = useTranslation();
    const drops = useRef<HTMLDivElement>(null);
    const shown = Math.min(done, goal);

    // Activities happen on other screens: the drops pop the first time the met goal is seen today
    useEffect(() => {
        if (done < goal) return;
        const today = localDate();
        try {
            if (localStorage.getItem(CELEBRATED_KEY) === today) return;
            localStorage.setItem(CELEBRATED_KEY, today);
        } catch {
            // Without storage the drops still pop, once per visit to the home screen
        }
        celebrateCorrect(drops.current);
    }, [done, goal]);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <div ref={drops} className="flex items-center gap-1" role="img" aria-label={t('streak.goalLabel', { done: shown, goal, count: goal })}>
                    {Array.from({ length: goal }, (_, i) => (
                        <Droplet
                            key={i}
                            className={`w-5 h-5 ${i < shown ? 'text-[var(--color-primary)] fill-[var(--color-primary)]' : 'text-[var(--color-outline)]'}`}
                            aria-hidden="true"
                        />
                    ))}
                </div>
                <span className="font-mono text-xs text-[var(--color-on-surface-muted)]" aria-hidden="true">{shown}/{goal}</span>
            </div>
            {freezes > 0 && (
                <span className="inline-flex items-center gap-1 text-[var(--color-on-surface-muted)]" title={t('streak.freezesHint')}>
                    <Snowflake className="w-4 h-4" aria-hidden="true" />
                    <span className="font-mono text-xs" aria-hidden="true">×{freezes}</span>
                    <span className="sr-only">{t('streak.freezesLabel', { count: freezes })}</span>
                </span>
            )}
        </div>
    );
}
