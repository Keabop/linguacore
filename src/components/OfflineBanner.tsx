import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useOnline } from '../hooks/useOnline';
import type { SyncState } from '../hooks/useSyncManager';

interface Props {
    syncState?: SyncState;
}

export default function OfflineBanner({ syncState }: Props) {
    const { isOnline } = useOnline();

    const pendingCount = syncState?.pendingCount ?? 0;
    const syncing = syncState?.syncing ?? false;

    // Determine banner state
    type BannerType = 'offline' | 'syncing' | 'pending' | null;
    let bannerType: BannerType = null;

    if (!isOnline) {
        bannerType = 'offline';
    } else if (syncing) {
        bannerType = 'syncing';
    } else if (pendingCount > 0) {
        bannerType = 'pending';
    }

    const config = {
        offline: {
            icon: WifiOff,
            text: 'Sin conexión a internet. Las funciones con IA no están disponibles.',
            className: 'border-accent-orange/30 bg-accent-orange/10 text-accent-orange',
            spin: false,
        },
        syncing: {
            icon: RefreshCw,
            text: 'Sincronizando cambios...',
            className: 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
            spin: true,
        },
        pending: {
            icon: AlertCircle,
            text: `${pendingCount} cambio${pendingCount !== 1 ? 's' : ''} pendiente${pendingCount !== 1 ? 's' : ''} de sincronizar`,
            className: 'border-accent-amber/30 bg-accent-amber/10 text-accent-amber',
            spin: false,
        },
    };

    return (
        <AnimatePresence>
            {bannerType && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mx-4 mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${config[bannerType].className}`}
                >
                    {(() => {
                        const Icon = config[bannerType!].icon;
                        return <Icon className={`w-4 h-4 shrink-0 ${config[bannerType!].spin ? 'animate-spin' : ''}`} />;
                    })()}
                    <span>{config[bannerType].text}</span>
                    {bannerType === 'offline' && pendingCount > 0 && (
                        <span className="ml-auto text-xs opacity-75">
                            {pendingCount} en cola
                        </span>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
