import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Pencil, Languages } from 'lucide-react';

export type ReviewMode = 'cloze' | 'translation';

interface Props {
    dueCount: number;
    onSelect: (mode: ReviewMode) => void;
}

export default function ReviewModeSelector({ dueCount, onSelect }: Props) {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 py-8"
        >
            <div className="text-center space-y-3">
                <h2 className="text-2xl font-extrabold text-[var(--color-on-surface)] leading-tight">{t('review.chooseMode')}</h2>
                <p className="text-[var(--color-on-surface-muted)] text-sm leading-relaxed">
                    {dueCount} {t('review.dueCards')}
                </p>
            </div>

            <div className="space-y-6">
                <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('cloze')}
                    className="mode-card w-full text-left shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
                >
                    <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center mb-4">
                        <Pencil className="w-6 h-6 text-accent-blue" />
                    </div>
                    <h3 className="text-lg font-bold text-accent-blue mb-2 leading-tight">
                        {t('review.clozeMode')}
                    </h3>
                    <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">
                        {t('review.clozeDescription')}
                    </p>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('translation')}
                    className="mode-card w-full text-left shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
                >
                    <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 flex items-center justify-center mb-4">
                        <Languages className="w-6 h-6 text-accent-purple" />
                    </div>
                    <h3 className="text-lg font-bold text-accent-purple mb-2 leading-tight">
                        {t('review.translationMode')}
                    </h3>
                    <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">
                        {t('review.translationDescription')}
                    </p>
                </motion.button>
            </div>
        </motion.div>
    );
}
