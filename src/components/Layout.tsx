import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { Home, BookOpen, RefreshCw, MessageCircle, Map, PenLine, User, GripVertical, GripHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LevelBadge from './ui/LevelBadge';
import Bilingual from './ui/Bilingual';
import OfflineBanner from './OfflineBanner';
import { useSyncManager } from '../hooks/useSyncManager';
import { useAuth } from '../lib/AuthContext';
import { useSidebarPreferences, type SidebarPosition } from '../hooks/useSidebarPreferences';

const navItems: { path: string; icon: LucideIcon; labelKey: string }[] = [
    { path: '/dashboard', icon: Home, labelKey: 'nav.home' },
    { path: '/path', icon: Map, labelKey: 'nav.path' },
    { path: '/learn', icon: BookOpen, labelKey: 'nav.learn' },
    { path: '/chat', icon: MessageCircle, labelKey: 'nav.chat' },
    { path: '/practice', icon: PenLine, labelKey: 'nav.practice' },
    { path: '/review', icon: RefreshCw, labelKey: 'nav.review' },
];

function RailNavItem({ path, icon: Icon, labelKey, expanded, position }: {
    path: string; icon: LucideIcon; labelKey: string; expanded: boolean; position: SidebarPosition;
}) {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);
    const isVertical = position === 'left' || position === 'right';

    return (
        <NavLink
            to={path}
            className={({ isActive }) =>
                `rail-item flex items-center transition-all duration-300 relative select-none ${
                    isVertical 
                        ? `h-12 my-2 rounded-xl ${expanded ? 'px-4 justify-start mx-4' : 'px-0 justify-center mx-2.5'}` 
                        : `h-11 w-11 justify-center mx-1 rounded-full`
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
                            className={isVertical 
                                ? "absolute left-0 w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-container)] rounded-r-full"
                                : "absolute bottom-0 h-1 w-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] rounded-t-full"
                            }
                        />
                    )}
                    <div className={`${isVertical ? 'w-12 h-12' : 'w-11 h-11'} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <AnimatePresence>
                        {expanded && isVertical && (
                            <Bilingual 
                                textKey={labelKey} 
                                className="text-sm font-semibold whitespace-nowrap text-[var(--color-on-surface)]" 
                                subClassName="text-[9px] -mt-0.5 opacity-80"
                            />
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {isHovered && (!expanded || !isVertical) && (
                            <motion.div
                                initial={isVertical ? { opacity: 0, x: -10, scale: 0.95 } : { opacity: 0, y: position === 'top' ? -10 : 10, scale: 0.95 }}
                                animate={isVertical ? { opacity: 1, x: 14, scale: 1 } : { opacity: 1, y: position === 'top' ? 4 : -4, scale: 1 }}
                                exit={isVertical ? { opacity: 0, x: -10, scale: 0.95 } : { opacity: 0, y: position === 'top' ? -10 : 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className={isVertical
                                    ? "absolute left-full px-2.5 py-1.5 bg-[#3A264B] text-white text-[9.5px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none"
                                    : `absolute px-2.5 py-1.5 bg-[#3A264B] text-white text-[9.5px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none ${
                                        position === 'top' ? 'top-full mt-2.5 left-1/2 -translate-x-1/2' : 'bottom-full mb-2.5 left-1/2 -translate-x-1/2'
                                    }`
                                }
                            >
                                {t(labelKey)}
                                <div className={isVertical
                                    ? "absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#3A264B]"
                                    : `absolute left-1/2 -translate-x-1/2 border-x-4 border-x-transparent ${
                                        position === 'top' ? 'bottom-full border-b-4 border-b-[#3A264B]' : 'top-full border-t-4 border-t-[#3A264B]'
                                    }`
                                } />
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
    const sidebarRef = useRef<HTMLElement>(null);
    const dragControls = useDragControls();

    const [isNavHovered, setIsNavHovered] = useState(false);
    const [isProfileHovered, setIsProfileHovered] = useState(false);
    
    // Sidebar preferences hook state
    const { position, onboardingShown, updatePosition, completeOnboarding } = useSidebarPreferences();
    const [isDragging, setIsDragging] = useState(false);
    const [activeDropZone, setActiveDropZone] = useState<SidebarPosition | null>(null);

    const isVertical = position === 'left' || position === 'right';

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

    // Handle drag target calculations
    const handleDrag = (_event: any, info: any) => {
        const x = info.point.x;
        const y = info.point.y;
        const w = window.innerWidth;
        const h = window.innerHeight;

        const distToLeft = x;
        const distToRight = w - x;
        const distToTop = y;
        const distToBottom = h - y;

        const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

        if (minDist === distToLeft) {
            setActiveDropZone('left');
        } else if (minDist === distToRight) {
            setActiveDropZone('right');
        } else if (minDist === distToTop) {
            setActiveDropZone('top');
        } else {
            setActiveDropZone('bottom');
        }
    };

    const handleDragEnd = async () => {
        setIsDragging(false);
        if (activeDropZone) {
            await updatePosition(activeDropZone);
        }
        setActiveDropZone(null);
    };

    return (
        <div className={`app-layout pos-${position}`}>
            
            {/* ===== DROP TARGETS OVERLAY DURING ACTIVE DRAGGING ===== */}
            {isDragging && (
                <div className="drop-zone-overlay">
                    <div className={`drop-target-area col-start-1 row-start-2 ${activeDropZone === 'left' ? 'active' : ''}`}>
                        <span>Alinear Izquierda</span>
                    </div>
                    <div className={`drop-target-area col-start-3 row-start-2 ${activeDropZone === 'right' ? 'active' : ''}`}>
                        <span>Alinear Derecha</span>
                    </div>
                    <div className={`drop-target-area col-start-2 row-start-1 ${activeDropZone === 'top' ? 'active' : ''}`}>
                        <span>Alinear Arriba</span>
                    </div>
                    <div className={`drop-target-area col-start-2 row-start-3 ${activeDropZone === 'bottom' ? 'active' : ''}`}>
                        <span>Alinear Abajo</span>
                    </div>
                </div>
            )}

            {/* ===== DRAGGABLE RAIL SIDEBAR ===== */}
            <motion.aside
                ref={sidebarRef}
                className={`sidebar-rail pos-${position} fixed bg-white/85 dark:bg-[#1E0A35]/85 backdrop-blur-xl border border-purple-500/10`}
                onMouseEnter={() => setIsNavHovered(true)}
                onMouseLeave={() => setIsNavHovered(false)}
                animate={isVertical ? { 
                    width: isNavHovered ? 260 : 68,
                    height: 'auto',
                    top: '50%',
                    left: position === 'left' ? '1.5rem' : 'auto',
                    right: position === 'right' ? '1.5rem' : 'auto',
                    x: 0,
                    y: '-50%'
                } : {
                    width: '90%',
                    height: 68,
                    left: '50%',
                    top: position === 'top' ? '1.5rem' : 'auto',
                    bottom: position === 'bottom' ? '1.5rem' : 'auto',
                    x: '-50%',
                    y: 0
                }}
                transition={{ 
                    type: 'spring', 
                    stiffness: 240, 
                    damping: 28 
                }}
                drag
                dragListener={false}
                dragControls={dragControls}
                dragMomentum={false}
                onDragStart={() => setIsDragging(true)}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
            >
                {/* Drag Handle & Logo Section */}
                <div className={`flex shrink-0 ${
                    isVertical 
                        ? 'flex-col items-center mb-6 mt-1 w-full' 
                        : 'flex-row items-center mr-4'
                }`}>
                    
                    {/* Drag Handle */}
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        className={`drag-handle flex items-center justify-center cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-primary)] transition-colors shrink-0 relative ${
                            !onboardingShown ? 'drag-handle-glow bg-purple-500/10' : ''
                        } ${
                            isVertical ? 'mb-4 w-8 h-8' : 'mr-3 w-8 h-8'
                        }`}
                        title="Arrastra para reubicar la barra"
                    >
                        {isVertical ? (
                            <GripVertical className="w-5 h-5 shrink-0" />
                        ) : (
                            <GripHorizontal className="w-5 h-5 shrink-0" />
                        )}

                        {/* Onboarding Dialog Overlay */}
                        {!onboardingShown && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`fixed z-[60] bg-white/95 dark:bg-[#1E0A35]/95 backdrop-blur-xl p-4 rounded-2xl shadow-[var(--shadow-float)] border border-purple-500/20 max-w-[240px] text-left text-xs pointer-events-auto ${
                                    isVertical 
                                        ? 'left-full ml-4 top-0' 
                                        : position === 'top' 
                                            ? 'top-full mt-4 left-0' 
                                            : 'bottom-full mb-4 left-0'
                                }`}
                            >
                                <p className="font-semibold text-[var(--color-on-surface)] leading-relaxed select-none">
                                    💡 <strong>¡Nueva función!</strong> Arrastra la barra desde este tirador para colocarla arriba, abajo, a la izquierda o derecha.
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        completeOnboarding();
                                    }}
                                    className="mt-3 w-full py-1.5 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white text-[10px] font-black rounded-full shadow-md text-center hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer"
                                >
                                    Entendido
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Logo */}
                    <div className={`flex items-center transition-all duration-300 ${
                        isVertical 
                            ? (isNavHovered ? 'px-4 mx-4 justify-start w-full' : 'px-0 mx-2.5 justify-center')
                            : 'justify-start'
                    }`}>
                        <div className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center shrink-0">
                            <img src="/logo.png" alt="Voxie" className="w-10 h-10 md:w-11 md:h-11 object-contain rounded-full shadow-md" />
                        </div>
                        <AnimatePresence>
                            {isNavHovered && isVertical && (
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
                </div>

                {/* Nav items */}
                <nav className={`flex-1 px-1 ${
                    isVertical 
                        ? 'space-y-4 w-full' 
                        : 'flex flex-row items-center justify-center space-x-1 space-y-0'
                }`}>
                    {navItems.map(item => (
                        <RailNavItem
                            key={item.path}
                            path={item.path}
                            icon={item.icon}
                            labelKey={item.labelKey}
                            expanded={isNavHovered}
                            position={position}
                        />
                    ))}
                </nav>

                {/* User area at bottom/right */}
                {progressInfo && authUser && (
                    <div className={`shrink-0 ${isVertical ? 'w-full' : 'ml-4'}`}>
                        <NavLink
                            to="/account"
                            className={({ isActive }) =>
                                `flex items-center rounded-xl transition-all duration-300 relative select-none ${
                                    isVertical
                                        ? `h-12 mt-6 ${isNavHovered ? 'px-4 justify-start mx-4' : 'px-0 justify-center mx-2.5'}`
                                        : `h-11 justify-center px-3`
                                } ${
                                    isActive
                                        ? 'bg-[var(--color-surface-container)] text-[var(--color-primary)] font-bold shadow-[var(--shadow-card)]'
                                        : 'hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]'
                                }`
                            }
                            onMouseEnter={() => setIsProfileHovered(true)}
                            onMouseLeave={() => setIsProfileHovered(false)}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center text-base md:text-lg font-black text-white shrink-0 shadow-md">
                                {authUser.email?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <AnimatePresence>
                                {isNavHovered && isVertical && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, transition: { duration: 0 } }}
                                        className="flex-1 min-w-0 ml-3 text-left"
                                    >
                                        <p className="text-sm font-semibold text-[var(--color-on-surface)] truncate">
                                            {authUser.user_metadata?.full_name || authUser.email?.split('@')[0]}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Bilingual textKey="progress.currentLevel" className="text-[10px] font-bold text-[var(--color-on-surface-muted)]" />
                                            <LevelBadge level={progressInfo.currentLevel} size="compact" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <AnimatePresence>
                                {isProfileHovered && (!isNavHovered || !isVertical) && (
                                    <motion.div
                                        initial={isVertical ? { opacity: 0, x: -10, scale: 0.95 } : { opacity: 0, y: position === 'top' ? -10 : 10, scale: 0.95 }}
                                        animate={isVertical ? { opacity: 1, x: 14, scale: 1 } : { opacity: 1, y: position === 'top' ? 4 : -4, scale: 1 }}
                                        exit={isVertical ? { opacity: 0, x: -10, scale: 0.95 } : { opacity: 0, y: position === 'top' ? -10 : 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className={isVertical
                                            ? "absolute left-full px-2.5 py-1.5 bg-[#3A264B] text-white text-[9.5px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none"
                                            : `absolute px-2.5 py-1.5 bg-[#3A264B] text-white text-[9.5px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none ${
                                                position === 'top' ? 'top-full mt-2.5 left-1/2 -translate-x-1/2' : 'bottom-full mb-2.5 left-1/2 -translate-x-1/2'
                                            }`
                                        }
                                    >
                                        {t('nav.profile')}
                                        <div className={isVertical
                                            ? "absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#3A264B]"
                                            : `absolute left-1/2 -translate-x-1/2 border-x-4 border-x-transparent ${
                                                position === 'top' ? 'bottom-full border-b-4 border-b-[#3A264B]' : 'top-full border-t-4 border-t-[#3A264B]'
                                            }`
                                        } />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    </div>
                )}
            </motion.aside>

            {/* ===== MAIN CONTENT ===== */}
            <div className="main-content">
                <div className="main-content-inner">
                    <OfflineBanner syncState={syncState} />
                    <Outlet />
                </div>
            </div>

            {/* ===== FLOATING BOTTOM BAR (Mobile Only) — Glassmorphism ===== */}
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
