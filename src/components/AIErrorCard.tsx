import { RefreshCw } from 'lucide-react';
import { useOnline } from '../hooks/useOnline';
import { useTranslation } from 'react-i18next';

interface Props {
    error: string;
    onRetry: () => void;
    disabled?: boolean;
}

export default function AIErrorCard({ error, onRetry, disabled }: Props) {
    const { isOnline } = useOnline();
    const { t } = useTranslation();

    return (
        <div className="bg-red-500/8 rounded-[2rem] p-6 space-y-4 shadow-[var(--shadow-card)]">
            <p className="text-sm text-red-400">{error}</p>
            <button
                onClick={onRetry}
                disabled={disabled || !isOnline}
                className="btn-secondary flex items-center gap-2 text-sm font-semibold"
            >
                <RefreshCw className="w-4 h-4" />
                {isOnline ? t('common.retry') : t('common.offlineDisabled')}
            </button>
        </div>
    );
}
