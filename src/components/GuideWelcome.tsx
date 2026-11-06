import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookOpenCheck, Droplet, Map } from 'lucide-react';
import { useDialogKeys } from '../hooks/useDialogKeys';

interface GuideWelcomeProps {
    open: boolean;
    /** Called either way: the welcome shows only once. */
    onDone: () => void;
}

/** The first visit's welcome: three lines on how Voxie works and the way to the guide. */
export default function GuideWelcome({ open, onDone }: GuideWelcomeProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const reduceMotion = useReducedMotion();
    const ref = useDialogKeys(open, onDone);
    const points = [
        { icon: Map, text: t('guide.welcomePoint1') },
        { icon: Droplet, text: t('guide.welcomePoint2') },
        { icon: BookOpenCheck, text: t('guide.welcomePoint3') },
    ];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                >
                    <div className="absolute inset-0 bg-[color-mix(in_oklch,var(--color-level-ink)_55%,transparent)]" onClick={onDone} />
                    <motion.div
                        ref={ref}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="guide-welcome-title"
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                        className="app-sheet guide-welcome relative z-10 shadow-[var(--shadow-float)]"
                    >
                        <h2 id="guide-welcome-title" className="app-h2">{t('guide.welcomeTitle')}</h2>
                        <ul>
                            {points.map(({ icon: Icon, text }) => (
                                <li key={text} className="flex gap-3 text-[var(--color-on-surface)]">
                                    <Icon className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-primary)]" aria-hidden="true" />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-wrap gap-3 pt-1">
                            <button
                                type="button"
                                autoFocus
                                onClick={() => { onDone(); navigate('/guia'); }}
                                className="btn-primary px-6 py-3 text-sm"
                            >
                                {t('guide.welcomeOpen')}
                            </button>
                            <button type="button" onClick={onDone} className="btn-secondary px-6 py-3 text-sm">
                                {t('guide.welcomeLater')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
