import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { CEFRLevel } from '../../lib/db';
import { Trophy, BookOpen } from 'lucide-react';
import { Particles, Aurora, SplitText } from '../reactbits';

interface LevelUpModalProps {
    level: CEFRLevel;
    isOpen: boolean;
    onClose: () => void;
}

const levelColors: Record<CEFRLevel, string[]> = {
    A1: ['#60A5FA', '#3B82F6', '#1D4ED8'],
    A2: ['#4ADE80', '#22C55E', '#16A34A'],
    B1: ['#FBBF24', '#F59E0B', '#D97706'],
    B2: ['#F87171', '#EF4444', '#DC2626'],
};

export default function LevelUpModal({ level, isOpen, onClose }: LevelUpModalProps) {
    const { t } = useTranslation();

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
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

                    {/* Modal card */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        className="relative bg-[var(--color-card)] rounded-3xl p-8 max-w-sm w-full text-center z-10 space-y-4 border border-[var(--color-outline-subtle)] shadow-2xl overflow-hidden"
                    >
                        {/* Aurora background */}
                        <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden">
                            <Aurora
                                colorStops={levelColors[level] as [string, string, string]}
                                speed={0.4}
                                blend={0.5}
                                amplitude={0.8}
                                className="w-full h-full"
                            />
                        </div>

                        {/* Particles */}
                        <div className="absolute inset-0 z-[1] pointer-events-none">
                            <Particles
                                particleColors={levelColors[level]}
                                particleCount={60}
                                speed={0.3}
                                particleBaseSize={60}
                                alphaParticles={true}
                                className="w-full h-full"
                            />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 space-y-4">
                            {/* Trophy */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.3, 1] }}
                                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                                className="flex justify-center"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-accent-gold/20 blur-2xl rounded-full animate-pulse" />
                                    <Trophy className="w-16 h-16 text-accent-gold relative z-10" />
                                </div>
                            </motion.div>

                            {/* SplitText title */}
                            <SplitText
                                text={t('levelUp.congratulations')}
                                className="text-2xl font-extrabold text-white"
                                delay={20}
                                splitType="chars"
                                animationFrom={{ opacity: 0, transform: 'translate3d(0,20px,0)' }}
                                animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                                tag="h2"
                            />

                            <p className="text-xl font-bold text-[var(--color-primary)]">
                                {t('levelUp.unlocked', { level })}
                            </p>
                            <p className="text-[var(--color-on-surface-muted)] text-sm">{t('levelUp.message')}</p>

                            <div className="bg-[var(--color-background)] rounded-xl p-3 border border-[var(--color-outline-subtle)]">
                                <p className="text-sm font-medium text-[var(--color-on-surface)]">
                                    <BookOpen className="w-4 h-4 inline" /> {storyCounts[level]} {t('levelUp.newStoriesAvailable')}
                                </p>
                            </div>

                            {/* Continue button with delay */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className="w-full bg-[var(--color-primary)] hover:brightness-90 text-white font-bold py-3 rounded-xl text-lg transition-colors"
                                >
                                    {t('levelUp.continue')}
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
