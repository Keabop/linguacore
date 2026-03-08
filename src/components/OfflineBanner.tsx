import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useOnline } from '../hooks/useOnline';
import { useTranslation } from 'react-i18next';

export default function OfflineBanner() {
    const { isOnline } = useOnline();
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-accent-orange/30 bg-accent-orange/10 px-4 py-3 text-sm text-accent-orange"
                >
                    <WifiOff className="w-4 h-4 shrink-0" />
                    <span>{t('common.offline')}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
