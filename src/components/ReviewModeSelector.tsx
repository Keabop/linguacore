import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Pencil, Languages } from 'lucide-react';
import PageHead from './ui/PageHead';

export type ReviewMode = 'cloze' | 'translation';

interface Props {
    dueCount: number;
    onSelect: (mode: ReviewMode) => void;
}

const MODES = [
    { mode: 'cloze' as const, icon: Pencil, title: 'review.clozeMode', description: 'review.clozeDescription' },
    { mode: 'translation' as const, icon: Languages, title: 'review.translationMode', description: 'review.translationDescription' },
];

/** Two index cards on the table: the learner picks how to go through today's cards */
export default function ReviewModeSelector({ dueCount, onSelect }: Props) {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
        >
            <PageHead title={t('review.chooseMode')} meta={[`${dueCount} ${t('review.dueCards')}`]} />

            <div className="grid gap-4 sm:grid-cols-2">
                {MODES.map(({ mode, icon: Icon, title, description }) => (
                    <button key={mode} type="button" onClick={() => onSelect(mode)} className="app-index">
                        <span className="unit-step-icon" aria-hidden="true"><Icon className="w-5 h-5" /></span>
                        <span className="app-h3">{t(title)}</span>
                        <span className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">{t(description)}</span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
