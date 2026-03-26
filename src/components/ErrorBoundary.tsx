import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    children: ReactNode;
    fallbackRoute?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/** Detect if the error is a failed dynamic import (offline / chunk missing) */
function isChunkLoadError(error: Error | null): boolean {
    if (!error) return false;
    const msg = error.message.toLowerCase();
    return (
        msg.includes('failed to fetch dynamically imported module') ||
        msg.includes('loading chunk') ||
        msg.includes('loading css chunk') ||
        msg.includes('dynamically imported module')
    );
}

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = this.props.fallbackRoute ?? '/';
    };

    render() {
        if (this.state.hasError) {
            const isOfflineChunk = isChunkLoadError(this.state.error);
            const isOffline = !navigator.onLine;

            // Offline-specific UI for failed dynamic imports
            if (isOfflineChunk && isOffline) {
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center min-h-[60vh] px-4"
                    >
                        <div className="bg-[var(--color-card)] border border-accent-orange/20 rounded-2xl p-8 max-w-md w-full text-center space-y-5">
                            <div className="mx-auto w-14 h-14 rounded-full bg-accent-orange/10 flex items-center justify-center">
                                <WifiOff className="w-7 h-7 text-accent-orange" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white mb-2">
                                    Página no disponible offline
                                </h2>
                                <p className="text-sm text-[var(--color-on-surface-muted)]">
                                    Esta página no se ha cargado previamente y no está disponible sin conexión.
                                    Vuelve al inicio o conéctate a internet para cargarla.
                                </p>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={this.handleGoHome}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors"
                                >
                                    <Home className="w-4 h-4" />
                                    Ir al inicio
                                </button>
                            </div>
                        </div>
                    </motion.div>
                );
            }

            // Generic error UI
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center min-h-[60vh] px-4"
                >
                    <div className="bg-[var(--color-card)] border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center space-y-5">
                        <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-7 h-7 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white mb-2">Algo salió mal</h2>
                            <p className="text-sm text-[var(--color-on-surface-muted)]">
                                Esta página tuvo un error inesperado. Puedes intentar recargarla.
                            </p>
                        </div>
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="text-xs text-red-400/70 bg-red-500/5 rounded-lg p-3 overflow-auto max-h-32 text-left">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Recargar
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Ir al inicio
                            </button>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return this.props.children;
    }
}
