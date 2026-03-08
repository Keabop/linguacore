import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useCards } from '../hooks/useCards';
import { Home, BookOpen, RefreshCw, BarChart3, Flame, ArrowRight, Brain, MessageCircle, Map, PenLine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LevelBadge from './ui/LevelBadge';

const navItems: { path: string; icon: LucideIcon; labelKey: string }[] = [
    { path: '/', icon: Home, labelKey: 'nav.home' },
    { path: '/path', icon: Map, labelKey: 'nav.path' },
    { path: '/learn', icon: BookOpen, labelKey: 'nav.learn' },
    { path: '/chat', icon: MessageCircle, labelKey: 'nav.chat' },
    { path: '/practice', icon: PenLine, labelKey: 'nav.practice' },
    { path: '/review', icon: RefreshCw, labelKey: 'nav.review' },
    { path: '/stats', icon: BarChart3, labelKey: 'nav.stats' },
];

export default function Layout() {
    const { t } = useTranslation();
    const location = useLocation();
    const { progressInfo, user } = useLevelProgression();
    const { dueCards } = useCards();

    return (
        <div className="app-layout">
            {/* ===== LEFT SIDEBAR ===== */}
            <aside className="sidebar-nav">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 px-2">
                    <Brain className="w-7 h-7 text-white" />
                    <span className="text-xl font-extrabold text-white tracking-tight">LinguaCore</span>
                </div>

                {/* Nav items */}
                <nav className="flex-1 space-y-2">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{t(item.labelKey)}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Level badge at bottom */}
                {progressInfo && (
                    <div className="mt-auto pt-6 border-t border-border px-2">
                        <div className="flex items-center gap-3">
                            <LevelBadge level={progressInfo.currentLevel} size="default" />
                            <div className="flex-1">
                                <p className="text-xs text-text-muted mb-2">{t('progress.currentLevel')}</p>
                                <div className="h-1.5 bg-bg-app rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white/25 rounded-full transition-all duration-500"
                                        style={{ width: `${progressInfo.overallPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <div className="main-content">
                <div className="main-content-inner">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ===== RIGHT SIDEBAR (Widgets) ===== */}
            <aside className="sidebar-widgets">
                {/* Streak widget */}
                {user && (
                    <div className="widget">
                        <div className="widget-title">{t('dashboard.streak')}</div>
                        <div className="flex items-center gap-4">
                            <Flame className="w-8 h-8 text-accent-orange" />
                            <div>
                                <p className="text-3xl font-extrabold text-accent-orange leading-tight">{user.streak}</p>
                                <p className="text-xs text-text-muted mt-1">{t('dashboard.days')}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Due cards widget */}
                <NavLink to="/review" className="block">
                    <div className={`widget transition-all hover:border-primary/40 ${dueCards.length > 0 ? 'animate-pulse-glow' : ''}`}>
                        <div className="widget-title">{t('dashboard.dueToday')}</div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-extrabold leading-tight">{dueCards.length}</p>
                                <p className="text-xs text-text-muted mt-1">{t('dashboard.cards')}</p>
                            </div>
                            {dueCards.length > 0 && (
                                <span className="bg-primary text-bg-app text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    {t('dashboard.startReview')} <ArrowRight className="w-3 h-3" />
                                </span>
                            )}
                        </div>
                    </div>
                </NavLink>

                {/* Progress widget — unit-based */}
                {progressInfo && (
                    <div className="widget">
                        <div className="widget-title">{t('progress.title')}</div>
                        <div className="space-y-5">
                            <WidgetProgress
                                label={t('progress.unitsCompleted')}
                                current={progressInfo.unitsCompleted}
                                target={progressInfo.unitsTotal}
                            />
                            <div className="pt-2">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-text-muted">{t('progress.currentLevel')}</span>
                                    <span className="text-text-secondary font-bold">{progressInfo.overallPercent}%</span>
                                </div>
                                <div className="h-2 bg-bg-app rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white/30 rounded-full transition-all duration-500"
                                        style={{ width: `${progressInfo.overallPercent}%` }}
                                    />
                                </div>
                            </div>
                            {progressInfo.currentUnitId && (
                                <div className="pt-1 text-xs text-text-muted">
                                    {t('progress.nextUnit')}: <span className="text-text-secondary font-semibold">{progressInfo.currentUnitId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </aside>

            {/* ===== FLOATING BOTTOM BAR (Mobile) ===== */}
            {!/^\/learn\/.+/.test(location.pathname) && (
                <nav className="floating-bar">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive ? 'active' : ''
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{t(item.labelKey)}</span>
                        </NavLink>
                    ))}
                </nav>
            )}
        </div>
    );
}

function WidgetProgress({ label, current, target }: {
    label: string; current: number; target: number;
}) {
    const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const met = current >= target;
    return (
        <div>
            <div className="flex justify-between text-xs mb-2">
                <span className="text-text-secondary">{label}</span>
                <span className={`font-bold ${met ? 'text-text-secondary' : 'text-text-muted'}`}>
                    {current}/{target}
                </span>
            </div>
            <div className="h-1.5 bg-bg-app rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${met ? 'bg-white/30' : 'bg-white/20'}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
