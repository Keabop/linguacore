import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { CEFRLevel } from '../../lib/db';
import { Trophy, BookOpen } from 'lucide-react';

interface LevelUpModalProps {
    level: CEFRLevel;
    isOpen: boolean;
    onClose: () => void;
}

function Confetti({ delay, x }: { delay: number; x: number }) {
    const colors = ['#6366F1', '#818CF8', '#F59E0B', '#22C55E', '#A78BFA', '#FBBF24'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return (
        <motion.div
            initial={{ opacity: 1, y: 0, x, scale: 1, rotate: 0 }}
            animate={{
                opacity: 0,
                y: [0, -120, 300],
                x: [x, x + (Math.random() - 0.5) * 200],
                scale: [1, 1.2, 0.5],
                rotate: Math.random() * 720,
            }}
            transition={{ duration: 2, delay, ease: 'easeOut' }}
            className="absolute top-1/3 left-1/2 w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
        />
    );
}

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
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {Array.from({ length: 30 }, (_, i) => (
                            <Confetti key={i} delay={i * 0.05} x={(Math.random() - 0.5) * 100} />
                        ))}
                    </div>

                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        className="bg-bg-card rounded-3xl p-8 max-w-sm w-full text-center relative z-10 space-y-4 border border-border-light shadow-2xl"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: 2 }}
                            className="flex justify-center"
                        >
                            <Trophy className="w-16 h-16 text-accent-gold" />
                        </motion.div>

                        <h2 className="text-2xl font-extrabold text-white">{t('levelUp.congratulations')}</h2>
                        <p className="text-xl font-bold text-primary">
                            {t('levelUp.unlocked', { level })}
                        </p>
                        <p className="text-text-secondary text-sm">{t('levelUp.message')}</p>

                        <div className="bg-bg-app rounded-xl p-3 border border-border">
                            <p className="text-sm font-medium text-text">
                                <BookOpen className="w-4 h-4 inline" /> {storyCounts[level]} {t('levelUp.newStoriesAvailable')}
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-lg transition-colors"
                        >
                            {t('levelUp.continue')}
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
