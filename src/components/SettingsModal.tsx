import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Globe, CreditCard, LogOut, Loader2, AlertTriangle, Crown } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { useAuth } from '../lib/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useTier } from '../hooks/useTier';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
    const { t } = useTranslation();
    const { mode, toggleMode } = useTheme();
    const { signOut } = useAuth();
    const { subscription, cancelSubscription, reactivateSubscription } = useSubscription();
    const { isPro } = useTier();
    const navigate = useNavigate();

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const handleCancel = async () => {
        setActionLoading(true);
        setActionError(null);
        try {
            await cancelSubscription();
            setShowCancelConfirm(false);
            onClose();
        } catch {
            setActionError(t('account.cancelError'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReactivate = async () => {
        setActionLoading(true);
        setActionError(null);
        try {
            await reactivateSubscription();
            onClose();
        } catch {
            setActionError(t('account.reactivateError'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <div
                            className="w-full max-w-md bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-outline-subtle)]">
                                <h2 className="text-lg font-bold text-[var(--color-on-surface)]">{t('settings.title')}</h2>
                                <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--color-background)] transition-colors">
                                    <X className="w-5 h-5 text-[var(--color-on-surface-muted)]" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Theme */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {mode === 'dark' ? <Moon className="w-5 h-5 text-[var(--color-on-surface-muted)]" /> : <Sun className="w-5 h-5 text-[var(--color-on-surface-muted)]" />}
                                        <span className="text-sm font-medium text-[var(--color-on-surface)]">{t('settings.theme')}</span>
                                    </div>
                                    <button
                                        onClick={toggleMode}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-background)] border border-[var(--color-outline-subtle)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-colors"
                                    >
                                        {mode === 'dark' ? t('settings.themeLight') : t('settings.themeDark')}
                                    </button>
                                </div>

                                {/* Language */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-[var(--color-on-surface-muted)]" />
                                        <span className="text-sm font-medium text-[var(--color-on-surface)]">{t('settings.language')}</span>
                                    </div>
                                    <span className="text-xs text-[var(--color-on-surface-muted)] px-3 py-1.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-outline-subtle)]">
                                        Español
                                    </span>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-[var(--color-outline-subtle)]" />

                                {/* Plan & Subscription */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-[var(--color-on-surface-muted)]" />
                                        <span className="text-sm font-medium text-[var(--color-on-surface)]">{t('settings.planAndSubscription')}</span>
                                    </div>

                                    {isPro && subscription?.subscriptionStatus === 'active' && (
                                        <div className="bg-[var(--color-background)] border border-[var(--color-outline-subtle)] rounded-xl p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Crown className="w-4 h-4 text-[var(--color-primary)]" />
                                                <span className="text-sm font-bold text-[var(--color-on-surface)]">Plan Pro</span>
                                                <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded-full font-medium">
                                                    {t('account.planPro')}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setShowCancelConfirm(true)}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                {t('account.cancelSubscription')}
                                            </button>
                                        </div>
                                    )}

                                    {isPro && subscription?.subscriptionStatus === 'cancelled' && (
                                        <div className="bg-[var(--color-background)] border border-[var(--color-outline-subtle)] rounded-xl p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Crown className="w-4 h-4 text-accent-amber" />
                                                <span className="text-sm font-bold text-[var(--color-on-surface)]">Plan Pro</span>
                                                <span className="text-xs bg-accent-amber/10 text-accent-amber px-2 py-0.5 rounded-full font-medium">
                                                    Cancela pronto
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleReactivate}
                                                disabled={actionLoading}
                                                className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)]-light transition-colors flex items-center gap-1"
                                            >
                                                {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                                {t('account.reactivateSubscription')}
                                            </button>
                                        </div>
                                    )}

                                    {!isPro && (
                                        <div className="bg-[var(--color-background)] border border-[var(--color-outline-subtle)] rounded-xl p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-[var(--color-on-surface-muted)]">{t('account.planFree')}</span>
                                            </div>
                                            <button
                                                onClick={() => { navigate('/pricing'); onClose(); }}
                                                className="text-xs bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium hover:brightness-90 transition-colors"
                                            >
                                                {t('account.upgradeToPro')}
                                            </button>
                                        </div>
                                    )}

                                    {actionError && (
                                        <p className="text-xs text-red-400">{actionError}</p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-[var(--color-outline-subtle)]" />

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
                                >
                                    <LogOut className="w-5 h-5" />
                                    {t('settings.logout')}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Cancel Confirmation Dialog */}
                    <AnimatePresence>
                        {showCancelConfirm && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[60] bg-black/40"
                                    onClick={() => setShowCancelConfirm(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                                    onClick={() => setShowCancelConfirm(false)}
                                >
                                    <div
                                        className="w-full max-w-sm bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-2xl p-6 space-y-4"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                            </div>
                                            <h3 className="text-base font-bold text-[var(--color-on-surface)]">{t('account.cancelConfirmTitle')}</h3>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs text-[var(--color-on-surface-muted)] font-semibold uppercase tracking-wider">{t('account.cancelConfirmLose')}</p>
                                            <ul className="space-y-1.5">
                                                {[
                                                    t('account.cancelLoseLevel'),
                                                    t('account.cancelLoseTutor'),
                                                    t('account.cancelLoseWriting'),
                                                    t('account.cancelLoseStories'),
                                                ].map(item => (
                                                    <li key={item} className="flex items-center gap-2 text-sm text-red-400">
                                                        <X className="w-3.5 h-3.5 shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <p className="text-xs text-[var(--color-on-surface-muted)] bg-[var(--color-background)] rounded-lg p-3">
                                            {t('account.cancelAccessUntil', { date: 'el final de tu período de facturación' })}
                                        </p>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowCancelConfirm(false)}
                                                className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-[var(--color-primary)] text-white hover:brightness-90 transition-colors"
                                            >
                                                {t('account.cancelKeep')}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={actionLoading}
                                                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1"
                                            >
                                                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                {t('account.cancelConfirm')}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}
