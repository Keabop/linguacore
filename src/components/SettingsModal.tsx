import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Globe, CreditCard, LogOut, Loader2, AlertTriangle, Crown, User, BookOpen, Droplet, Scale, Trash2 } from 'lucide-react';
import { clear as clearIdb } from 'idb-keyval';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../lib/ThemeContext';
import { useAuth } from '../lib/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { useTier } from '../hooks/useTier';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { supabase } from '../lib/supabase';
import { offlineUpdate } from '../lib/offlineMutation';
import { apiFetch } from '../lib/apiFetch';
import { LEGAL_OWNER } from '../data/legalOwner';
import PlantPicker from './garden/PlantPicker';
import GardenStylePicker from './garden/GardenStylePicker';
import type { Profile } from '../lib/database.types';
import { version } from '../../package.json';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
    const { t, i18n } = useTranslation();
    const { mode, toggleMode } = useTheme();
    const { user, signOut } = useAuth();
    const { subscription, cancelSubscription, reactivateSubscription } = useSubscription();
    // Subscription controls follow the paid tier: the admin's Pro access has nothing to cancel
    const { tier, isPro, adminAccess } = useTier();
    const navigate = useNavigate();

    const [username, setUsername] = useState(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
    const [updatingUsername, setUpdatingUsername] = useState(false);
    const [usernameSuccess, setUsernameSuccess] = useState(false);

    const handleUpdateUsername = async () => {
        if (!username.trim()) return;
        setUpdatingUsername(true);
        setUsernameSuccess(false);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: username.trim() }
            });
            if (error) throw error;
            setUsernameSuccess(true);
            setTimeout(() => setUsernameSuccess(false), 2000);
        } catch (err) {
            console.error('Failed to update username:', err);
        } finally {
            setUpdatingUsername(false);
        }
    };

    const qc = useQueryClient();
    const { user: progress } = useLevelProgression();

    // Saved silently: the drops on the home screen show the new goal
    const handleGoalChange = async (goal: number) => {
        if (!user) return;
        const key = ['profile', user.id];
        qc.setQueryData<Profile | null>(key, prev => prev && { ...prev, daily_goal: goal });
        try {
            await offlineUpdate('profiles', { daily_goal: goal }, { id: user.id });
        } catch {
            qc.invalidateQueries({ queryKey: ['profile'] });
        }
    };

    const [currentLang, setCurrentLang] = useState(localStorage.getItem('voxie-display-language') || 'es');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const handleLangChange = (lang: string) => {
        localStorage.setItem('voxie-display-language', lang);
        setCurrentLang(lang);
        if (lang === 'bilingual') {
            i18n.changeLanguage('en');
        } else {
            i18n.changeLanguage(lang);
        }
        window.dispatchEvent(new Event('voxie-language-changed'));
    };
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

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // The server cancels Pro and deletes every row; this device then forgets the account too
    const handleDeleteAccount = async () => {
        setActionLoading(true);
        setDeleteError(null);
        try {
            const res = await apiFetch('/api/account/delete', { method: 'POST' });
            if (!res.ok) {
                const { error } = await res.json().catch(() => ({ error: '' }));
                throw new Error(error);
            }
            // Sign out first, then forget the account's data; the reload drops what is left in
            // memory (the offline queue, the query cache and its persister). Theme and language stay.
            await signOut();
            await clearIdb().catch(() => {});
            await caches?.delete('api-cache').catch(() => false);
            for (const key of Object.keys(localStorage)) {
                if (key !== 'theme-mode' && key !== 'voxie-display-language') localStorage.removeItem(key);
            }
            window.location.replace('/');
        } catch (err) {
            setDeleteError(t((err as Error).message === 'subscription_cancel_failed' ? 'settings.deleteSubscriptionError' : 'settings.deleteError', { email: LEGAL_OWNER.email }));
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
                        className="fixed inset-0 z-50 bg-[color-mix(in_oklch,var(--color-level-ink)_55%,transparent)]"
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
                            <div className="p-6 space-y-6 max-h-[75dvh] overflow-y-auto">
                                {/* Username */}
                                <div className="space-y-2 text-left font-body">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-[var(--color-on-surface-muted)]" />
                                        <span className="text-sm font-semibold text-[var(--color-on-surface)]">Nombre de usuario</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Escribe tu nombre"
                                            className="flex-1 text-xs text-[var(--color-on-surface)] font-bold px-3.5 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                        />
                                        <button
                                            onClick={handleUpdateUsername}
                                            disabled={updatingUsername || !username.trim()}
                                            className="btn-primary px-4 py-2 text-xs disabled:opacity-55 shrink-0 flex items-center justify-center min-w-[70px]"
                                        >
                                            {updatingUsername ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : usernameSuccess ? (
                                                '¡Listo!'
                                            ) : (
                                                'Guardar'
                                            )}
                                        </button>
                                    </div>
                                    {usernameSuccess && (
                                        <p role="status" className="text-[10px] font-bold text-[var(--color-success)]">
                                            ¡Nombre de usuario actualizado con éxito!
                                        </p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-[var(--color-outline-subtle)]" />

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
                                    <select
                                        value={currentLang}
                                        onChange={(e) => handleLangChange(e.target.value)}
                                        className="text-xs text-[var(--color-on-surface)] font-bold px-3 py-1.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-outline-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 cursor-pointer"
                                    >
                                        <option value="es">Español</option>
                                        <option value="en">English</option>
                                        <option value="bilingual">Bilingüe (EN + ES)</option>
                                    </select>
                                </div>

                                {/* Daily goal */}
                                {progress && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Droplet className="w-5 h-5 text-[var(--color-on-surface-muted)]" />
                                                <label htmlFor="daily-goal" className="text-sm font-medium text-[var(--color-on-surface)]">{t('settings.dailyGoal')}</label>
                                            </div>
                                            <select
                                                id="daily-goal"
                                                value={progress.dailyGoal}
                                                onChange={(e) => handleGoalChange(Number(e.target.value))}
                                                className="text-xs text-[var(--color-on-surface)] font-bold px-3 py-1.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-outline-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 cursor-pointer"
                                            >
                                                {[1, 2, 3].map(n => <option key={n} value={n}>{t('settings.dailyGoalOption', { count: n })}</option>)}
                                            </select>
                                        </div>
                                        <p className="text-xs text-[var(--color-on-surface-muted)] pl-8">{t('settings.dailyGoalHint')}</p>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="border-t border-[var(--color-outline-subtle)]" />

                                <PlantPicker onNavigate={onClose} />

                                <GardenStylePicker />

                                {/* Divider */}
                                <div className="border-t border-[var(--color-outline-subtle)]" />

                                {/* Plan & Subscription */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-[var(--color-on-surface-muted)]" />
                                        <span className="text-sm font-medium text-[var(--color-on-surface)]">{t('settings.planAndSubscription')}</span>
                                    </div>

                                    {tier === 'pro' && subscription?.subscriptionStatus === 'active' && (
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
                                                className="text-xs text-[var(--color-error)] hover:text-[var(--color-error)] transition-colors"
                                            >
                                                {t('account.cancelSubscription')}
                                            </button>
                                        </div>
                                    )}

                                    {tier === 'pro' && subscription?.subscriptionStatus === 'cancelled' && (
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

                                    {adminAccess && (
                                        <div className="bg-[var(--color-background)] border border-[var(--color-outline-subtle)] rounded-xl p-4">
                                            <div className="flex items-center gap-2">
                                                <Crown className="w-4 h-4 text-[var(--color-primary)]" />
                                                <span className="text-sm font-bold text-[var(--color-on-surface)]">{t('settings.adminAccess')}</span>
                                            </div>
                                            <p className="mt-1 text-xs text-[var(--color-on-surface-muted)]">{t('settings.adminAccessHint')}</p>
                                        </div>
                                    )}

                                    {!isPro && (
                                        <div className="bg-[var(--color-background)] border border-[var(--color-outline-subtle)] rounded-xl p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-[var(--color-on-surface-muted)]">{t('account.planFree')}</span>
                                            </div>
                                            <button
                                                onClick={() => { navigate('/pricing'); onClose(); }}
                                                className="btn-primary text-xs px-4 py-2"
                                            >
                                                {t('account.upgradeToPro')}
                                            </button>
                                        </div>
                                    )}

                                    {actionError && (
                                        <p className="text-xs text-[var(--color-error)]">{actionError}</p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-[var(--color-outline-subtle)]" />

                                {/* Sources of the content and their licence notices */}
                                <button
                                    onClick={() => { onClose(); navigate('/credits'); }}
                                    className="flex items-center gap-3 text-sm text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-colors w-full"
                                >
                                    <BookOpen className="w-5 h-5" />
                                    {t('settings.credits')}
                                </button>

                                {/* Privacy notice, terms and cookie policy */}
                                <div className="flex items-start gap-3 text-sm text-[var(--color-on-surface-muted)]">
                                    <Scale className="w-5 h-5 shrink-0" />
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {([['/privacidad', 'settings.privacy'], ['/terminos', 'settings.terms'], ['/cookies', 'settings.cookies']] as const).map(([to, key]) => (
                                            <button key={to} onClick={() => { onClose(); navigate(to); }} className="hover:text-[var(--color-on-surface)] transition-colors">
                                                {t(key)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 text-sm text-[var(--color-error)] hover:text-[var(--color-error)] transition-colors w-full"
                                >
                                    <LogOut className="w-5 h-5" />
                                    {t('settings.logout')}
                                </button>

                                <button
                                    onClick={() => { setDeleteError(null); setShowDeleteConfirm(true); }}
                                    className="flex items-center gap-3 text-sm text-[var(--color-on-surface-muted)] hover:text-[var(--color-error)] transition-colors w-full"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    {t('settings.deleteAccount')}
                                </button>

                                <p className="text-xs text-center text-[var(--color-on-surface-muted)]">
                                    {t('settings.version', { version })}
                                </p>
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
                                    className="fixed inset-0 z-[60] bg-[color-mix(in_oklch,var(--color-level-ink)_40%,transparent)]"
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
                                            <div className="w-10 h-10 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center">
                                                <AlertTriangle className="w-5 h-5 text-[var(--color-error)]" />
                                            </div>
                                            <h3 className="text-base font-bold text-[var(--color-on-surface)]">{t('account.cancelConfirmTitle')}</h3>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs text-[var(--color-on-surface-muted)] font-semibold">{t('account.cancelConfirmLose')}</p>
                                            <ul className="space-y-1.5">
                                                {[
                                                    t('account.cancelLoseLevel'),
                                                    t('account.cancelLoseTutor'),
                                                    t('account.cancelLoseWriting'),
                                                    t('account.cancelLoseStories'),
                                                ].map(item => (
                                                    <li key={item} className="flex items-center gap-2 text-sm text-[var(--color-error)]">
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
                                                className="btn-primary flex-1 py-2.5 text-sm"
                                            >
                                                {t('account.cancelKeep')}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={actionLoading}
                                                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[var(--color-error)]/30 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors flex items-center justify-center gap-1"
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

                    {/* Delete Account Confirmation Dialog */}
                    <AnimatePresence>
                        {showDeleteConfirm && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[60] bg-[color-mix(in_oklch,var(--color-level-ink)_40%,transparent)]"
                                    onClick={() => setShowDeleteConfirm(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    <div
                                        role="alertdialog"
                                        aria-labelledby="delete-account-title"
                                        className="w-full max-w-sm bg-[var(--color-card)] border border-[var(--color-outline-subtle)] rounded-2xl p-6 space-y-4"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center">
                                                <AlertTriangle className="w-5 h-5 text-[var(--color-error)]" />
                                            </div>
                                            <h3 id="delete-account-title" className="text-base font-bold text-[var(--color-on-surface)]">{t('settings.deleteConfirmTitle')}</h3>
                                        </div>

                                        <p className="text-sm text-[var(--color-on-surface-muted)]">{t('settings.deleteConfirmBody')}</p>
                                        {tier === 'pro' && subscription?.subscriptionStatus !== 'cancelled' && (
                                            <p className="text-xs text-[var(--color-on-surface-muted)] bg-[var(--color-background)] rounded-lg p-3">{t('settings.deleteConfirmPro')}</p>
                                        )}
                                        {deleteError && <p className="text-xs text-[var(--color-error)]">{deleteError}</p>}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="btn-primary flex-1 py-2.5 text-sm"
                                            >
                                                {t('settings.deleteKeep')}
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={actionLoading}
                                                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[var(--color-error)]/30 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors flex items-center justify-center gap-1"
                                            >
                                                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                {t('settings.deleteConfirm')}
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
