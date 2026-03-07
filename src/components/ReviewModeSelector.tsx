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
                <h2 className="text-2xl font-extrabold text-text leading-tight">{t('review.chooseMode')}</h2>
                <p className="text-text-secondary text-sm leading-relaxed">
                    {dueCount} {t('review.dueCards')}
                </p>
            </div>

            <div className="space-y-5">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('cloze')}
                    className="mode-card w-full text-left"
                >
                    <Pencil className="w-8 h-8 text-accent-blue mb-4" />
                    <h3 className="text-lg font-bold text-accent-blue mb-2 leading-tight">
                        {t('review.clozeMode')}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {t('review.clozeDescription')}
                    </p>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('translation')}
                    className="mode-card w-full text-left"
                >
                    <Languages className="w-8 h-8 text-accent-purple mb-4" />
                    <h3 className="text-lg font-bold text-accent-purple mb-2 leading-tight">
                        {t('review.translationMode')}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        {t('review.translationDescription')}
                    </p>
                </motion.button>
            </div>
        </motion.div>
    );
}
