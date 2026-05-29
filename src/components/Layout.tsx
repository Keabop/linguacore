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
    const [isHovered, setIsHovered] = useState(false);
    return (
        <NavLink
            to={path}
            className={({ isActive }) =>
                `rail-item flex items-center gap-3 h-10 my-1 rounded-xl transition-all duration-300 relative select-none ${
                    expanded 
                        ? 'px-3 justify-start mx-3' 
                        : 'px-0 justify-center mx-2'
                } ${
                    isActive
                        ? 'bg-[var(--color-surface-container)] text-[var(--color-primary)] font-bold shadow-[var(--shadow-card)]'
                        : 'hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]'
                }`
            }
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-container)] rounded-r-full"
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
                    <AnimatePresence>
                        {isHovered && !expanded && (
                            <motion.div
                                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                animate={{ opacity: 1, x: 14, scale: 1 }}
                                exit={{ opacity: 0, x: -10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-full px-2.5 py-1.5 bg-[#3A264B] text-white text-[9.5px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none"
                            >
                                {t(labelKey)}
                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#3A264B]" />
                            </motion.div>
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
    const [isNavHovered, setIsNavHovered] = useState(false);
    const [isProfileHovered, setIsProfileHovered] = useState(false);

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
            {/* ===== RAIL SIDEBAR — Fluid Scholar ===== */}
            <motion.aside
                className="sidebar-rail fixed left-4 top-1/2 -translate-y-1/2 bg-white/85 backdrop-blur-xl border border-purple-500/10"
                onMouseEnter={() => setIsNavHovered(true)}
                onMouseLeave={() => setIsNavHovered(false)}
                animate={{ width: isNavHovered ? 188 : 58 }}
                transition={{ 
                    type: 'spring', 
                    stiffness: 240, 
                    damping: 28 
                }}
            >
                {/* Logo */}
                <div className={`flex items-center mb-10 transition-all duration-300 ${isNavHovered ? 'px-3 mx-3 justify-start' : 'px-0 mx-2 justify-center'}`}>
                    <div className="w-10 h-10 flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] shadow-lg">
                        <img src="/logo.png" alt="Voxie" className="w-6 h-6 object-contain" />
                    </div>
                    <AnimatePresence>
                        {isNavHovered && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0 } }}
                                className="ml-3 text-xl font-extrabold text-[var(--color-on-surface)] tracking-tight"
                            >
                                Voxie
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav items */}
                <nav className="flex-1 space-y-1 px-1">
                    {navItems.map(item => (
                        <RailNavItem
                            key={item.path}
                            path={item.path}
                            icon={item.icon}
                            labelKey={item.labelKey}
                            expanded={isNavHovered}
                        />
                    ))}
                </nav>

                {/* User area at bottom */}
                {progressInfo && authUser && (
                    <NavLink
                        to="/account"
                        className={({ isActive }) =>
                            `flex items-center gap-3 h-10 mt-auto rounded-xl transition-all duration-300 relative select-none ${
                                isNavHovered
                                    ? 'px-3 justify-start mx-3'
                                    : 'px-0 justify-center mx-2'
                            } ${
                                isActive
                                    ? 'bg-[var(--color-surface-container)] text-[var(--color-primary)] font-bold shadow-[var(--shadow-card)]'
                                    : 'hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]'
                            }`
                        }
                        onMouseEnter={() => setIsProfileHovered(true)}
                        onMouseLeave={() => setIsProfileHovered(false)}
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md">
                            {authUser.email?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <AnimatePresence>
                            {isNavHovered && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0 } }}
                                    className="flex-1 min-w-0"
                                >
                                    <p className="text-sm font-semibold text-[var(--color-on-surface)] truncate">
                                        {authUser.user_metadata?.full_name || authUser.email?.split('@')[0]}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <LevelBadge level={progressInfo.currentLevel} size="compact" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <AnimatePresence>
                            {isProfileHovered && !isNavHovered && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 14, scale: 1 }}
                                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-full px-2.5 py-1.5 bg-[#3A264B] text-white text-[9.5px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none"
                                >
                                    {t('nav.profile')}
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#3A264B]" />
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
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ===== FLOATING BOTTOM BAR (Mobile) — Glassmorphism ===== */}
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
                    {/* Profile pill */}
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
