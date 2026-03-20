import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { Home, BookOpen, RefreshCw, MessageCircle, Map, PenLine, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LevelBadge from './ui/LevelBadge';
import OfflineBanner from './OfflineBanner';
import { useSyncManager } from '../hooks/useSyncManager';
import { useAuth } from '../lib/AuthContext';

const navItems: { path: string; icon: LucideIcon; labelKey: string }[] = [
    { path: '/dashboard', icon: Home, labelKey: 'nav.home' },
    { path: '/path', icon: Map, labelKey: 'nav.path' },
    { path: '/learn', icon: BookOpen, labelKey: 'nav.learn' },
    { path: '/chat', icon: MessageCircle, labelKey: 'nav.chat' },
    { path: '/practice', icon: PenLine, labelKey: 'nav.practice' },
    { path: '/review', icon: RefreshCw, labelKey: 'nav.review' },
];

function RailNavItem({ path, icon: Icon, labelKey, expanded }: {
    path: string; icon: LucideIcon; labelKey: string; expanded: boolean;
}) {
    const { t } = useTranslation();
    return (
        <NavLink
            to={path}
            className={({ isActive }) =>
                `rail-item ${isActive ? 'active' : ''}`
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.div
                            layoutId="activeIndicator"
                            className="absolute -left-3 w-1 h-6 bg-primary rounded-r-full"
                        />
                    )}
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                    </div>
                    <AnimatePresence>
                        {expanded && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0 } }}
                                className="text-sm font-semibold whitespace-nowrap"
                            >
                                {t(labelKey)}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </>
            )}
        </NavLink>
    );
}

export default function Layout() {
    const { t } = useTranslation();
    const location = useLocation();
    const { progressInfo } = useLevelProgression();
    const { user: authUser } = useAuth();
    const syncState = useSyncManager();
    const scrollRef = useRef<HTMLElement>(null);
    const [expanded, setExpanded] = useState(false);

    // Auto-scroll active nav item into view on route change
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        const active = container.querySelector('a.active') as HTMLElement | null;
        if (active) {
            const offset = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
            container.scrollTo({ left: offset, behavior: 'smooth' });
        }
    }, [location.pathname]);

    return (
        <div className="app-layout">
            {/* ===== RAIL SIDEBAR ===== */}
            <motion.aside
                className="sidebar-rail"
                onMouseEnter={() => setExpanded(true)}
                onMouseLeave={() => setExpanded(false)}
                animate={{ width: expanded ? 240 : 68 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                {/* Logo */}
                <div className="flex items-center px-3 mb-10">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        <img src="/logo.png" alt="Voxie" className="w-7 h-7 rounded-lg object-cover" />
                    </div>
                    <AnimatePresence>
                        {expanded && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0 } }}
                                className="ml-3 text-xl font-extrabold text-text tracking-tight"
                            >
                                Voxie
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav items */}
                <nav className="flex-1 space-y-1">
                    {navItems.map(item => (
                        <RailNavItem
                            key={item.path}
                            path={item.path}
                            icon={item.icon}
                            labelKey={item.labelKey}
                            expanded={expanded}
                        />
                    ))}
                </nav>

                {/* User area at bottom */}
                {progressInfo && authUser && (
                    <NavLink
                        to="/account"
                        className={({ isActive }) =>
                            `mt-auto pt-6 border-t border-border px-2 flex items-center gap-3 rounded-xl py-2 transition-colors hover:bg-bg-app/50 ${isActive ? 'bg-bg-app/50' : ''}`
                        }
                    >
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                            {authUser.email?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0 } }}
                                    className="flex-1 min-w-0"
                                >
                                    <p className="text-sm font-semibold text-text truncate">
                                        {authUser.user_metadata?.full_name || authUser.email?.split('@')[0]}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <LevelBadge level={progressInfo.currentLevel} size="compact" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </NavLink>
                )}
            </motion.aside>

            {/* ===== MAIN CONTENT ===== */}
            <div className="main-content">
                <div className="main-content-inner">
                    <OfflineBanner syncState={syncState} />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ===== FLOATING BOTTOM BAR (Mobile) ===== */}
            {!/^\/learn\/.+/.test(location.pathname) && (
                <nav ref={scrollRef} className="floating-bar">
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
                    {/* Profile pill — replaces Stats on mobile */}
                    <NavLink
                        to="/account"
                        className={({ isActive }) =>
                            `floating-bar-profile ${isActive ? 'active' : ''}`
                        }
                    >
                        <User className="w-5 h-5" />
                        <span>{t('nav.profile')}</span>
                    </NavLink>
                </nav>
            )}
        </div>
    );
}
