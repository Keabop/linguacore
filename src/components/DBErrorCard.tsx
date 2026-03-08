import { DatabaseZap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
    onReset?: () => void;
}

export default function DBErrorCard({ onReset }: Props) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
            <div className="bg-bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <DatabaseZap className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-white mb-1">{t('common.dataNotFound')}</h3>
                    <p className="text-sm text-text-muted">{t('common.dataCorrupt')}</p>
                </div>
                {onReset && (
                    <button
                        onClick={onReset}
                        className="text-sm font-semibold text-primary hover:text-primary-light transition-colors"
                    >
                        {t('common.resetData')}
                    </button>
                )}
            </div>
        </div>
    );
}
