import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { CEFRLevel } from '../../lib/db';
import { BookOpen } from 'lucide-react';
import PlantCircle from '../garden/PlantCircle';
import LevelBadge from './LevelBadge';
import { useGardenPlant } from '../../hooks/useGardenPlant';

interface LevelUpModalProps {
    level: CEFRLevel;
    isOpen: boolean;
    onClose: () => void;
}

// Plant height grows with each stage so the new level reads as growth
// Taller at each level, and never past the circle's top
const STAGE_HEIGHT: Record<CEFRLevel, number> = { A1: 26, A2: 32, B1: 38, B2: 44 };

export default function LevelUpModal({ level, isOpen, onClose }: LevelUpModalProps) {
    const { t } = useTranslation();
    const { species } = useGardenPlant();

    const storyCounts: Record<CEFRLevel, number> = {
        A1: 10, A2: 10, B1: 10, B2: 0,
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="level-up-title"
                >
                    <div
                        className="absolute inset-0 bg-[color-mix(in_oklch,var(--color-level-ink)_55%,transparent)]"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                        className="relative bg-[var(--color-card)] rounded-[var(--radius-lg)] p-8 max-w-sm w-full text-center z-10 space-y-4 shadow-[var(--shadow-float)]"
                    >
                        <PlantCircle species={species} size="lg" height={STAGE_HEIGHT[level]} delay={250} />

                        <h2 id="level-up-title" className="text-2xl font-extrabold text-[var(--color-on-surface)]">
                            {t('levelUp.congratulations')}
                        </h2>

                        <div className="flex items-center justify-center gap-2">
                            <LevelBadge level={level} withStage />
                        </div>

                        <p className="text-lg font-bold text-[var(--color-primary)]">
                            {t('levelUp.stageReached', { stage: t(`garden.stage.${level}`) })}
                        </p>
                        <p className="text-[var(--color-on-surface-muted)] text-sm">{t('levelUp.message')}</p>

                        {storyCounts[level] > 0 && (
                            <p className="text-sm font-medium text-[var(--color-on-surface)] bg-[var(--color-surface-container)] rounded-xl p-3">
                                <BookOpen className="w-4 h-4 inline" aria-hidden="true" /> {storyCounts[level]} {t('levelUp.newStoriesAvailable')}
                            </p>
                        )}

                        <button
                            onClick={onClose}
                            className="btn-primary w-full py-3 text-base"
                            autoFocus
                        >
                            {t('levelUp.continue')}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
