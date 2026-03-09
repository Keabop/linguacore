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
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 space-y-3">
            <p className="text-sm text-red-400">{error}</p>
            <button
                onClick={onRetry}
                disabled={disabled || !isOnline}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-primary/15 hover:bg-primary/25 px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
                <RefreshCw className="w-4 h-4" />
                {isOnline ? t('common.retry') : t('common.offlineDisabled')}
            </button>
        </div>
    );
}
