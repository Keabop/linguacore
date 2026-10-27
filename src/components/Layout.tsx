import { useState, useRef, useEffect, Suspense } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { User, GripVertical, GripHorizontal, Shield } from 'lucide-react';
import {
    BookOpenIcon, GraduationCapIcon, HouseIcon, MapIcon, MessageCircleIcon, PencilIcon, RefreshCwIcon,
    type AnimatedIcon, type AnimatedIconHandle,
} from './icons';
import LevelBadge from './ui/LevelBadge';
import { LeafMark } from './ui/Wordmark';
import Bilingual from './ui/Bilingual';
import OfflineBanner from './OfflineBanner';
import PageLoader from './PageLoader';
import { useSyncManager } from '../hooks/useSyncManager';
import { useAuth } from '../lib/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { useSidebarPreferences, type SidebarPosition } from '../hooks/useSidebarPreferences';

// Rail geometry in px. The rail is placed with left/top/width/height only, so it can animate
// between any two of these boxes, including the one that follows the pointer while dragging.
const RAIL_GAP = 24;
const RAIL_THICK = 68;
const RAIL_LONG = 540;
const RAIL_EXPANDED = 260;

type RailBox = { left: number; top: number; width: number; height: number };

const isVerticalPos = (pos: SidebarPosition) => pos === 'left' || pos === 'right';

function dockedBox(pos: SidebarPosition, expanded: boolean, vw: number, vh: number): RailBox {
    if (isVerticalPos(pos)) {
        const width = expanded ? RAIL_EXPANDED : RAIL_THICK;
        return { width, height: RAIL_LONG, top: (vh - RAIL_LONG) / 2, left: pos === 'left' ? RAIL_GAP : vw - RAIL_GAP - width };
    }
    return { width: RAIL_LONG, height: RAIL_THICK, left: (vw - RAIL_LONG) / 2, top: pos === 'top' ? RAIL_GAP : vh - RAIL_GAP - RAIL_THICK };
}

/** The edge closest to the pointer is where the rail will dock. */
function nearestEdge(x: number, y: number, vw: number, vh: number): SidebarPosition {
    const distances: [SidebarPosition, number][] = [['left', x], ['right', vw - x], ['top', y], ['bottom', vh - y]];
    return distances.reduce((best, d) => (d[1] < best[1] ? d : best))[0];
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), Math.max(min, max));

/** While dragging, the rail already has the shape of where it will land and keeps its grip under the pointer. */
function draggedBox(pos: SidebarPosition, x: number, y: number, vw: number, vh: number): RailBox {
    const vertical = isVerticalPos(pos);
    const width = vertical ? RAIL_THICK : RAIL_LONG;
    const height = vertical ? RAIL_LONG : RAIL_THICK;
    // The grip sits at the start of the rail: near the top when vertical, near the left when horizontal
    const left = vertical ? x - width / 2 : x - 40;
    const top = vertical ? y - 32 : y - height / 2;
    return { width, height, left: clamp(left, 8, vw - width - 8), top: clamp(top, 8, vh - height - 8) };
}

const KEY_TO_EDGE: Record<string, SidebarPosition> = {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'top', ArrowDown: 'bottom',
};

const navItems: { path: string; icon: AnimatedIcon; labelKey: string; end?: boolean }[] = [
    { path: '/dashboard', icon: HouseIcon, labelKey: 'nav.home' },
    { path: '/path', icon: MapIcon, labelKey: 'nav.path' },
    { path: '/learn', icon: BookOpenIcon, labelKey: 'nav.learn' },
    { path: '/chat', icon: MessageCircleIcon, labelKey: 'nav.chat' },
    { path: '/practice', icon: PencilIcon, labelKey: 'nav.practice' },
    { path: '/review', icon: RefreshCwIcon, labelKey: 'nav.review', end: true },
    { path: '/review/simulator', icon: GraduationCapIcon, labelKey: 'nav.simulator' },
];

function RailNavItem({ path, icon: Icon, labelKey, expanded, position, end }: {
    path: string; icon: AnimatedIcon; labelKey: string; expanded: boolean; position: SidebarPosition; end?: boolean;
}) {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);
    // The whole item, not only the glyph, triggers the icon animation
    const iconRef = useRef<AnimatedIconHandle>(null);
    const isVertical = position === 'left' || position === 'right';

    return (
        <NavLink
            to={path}
            end={end}
            className={({ isActive }) =>
                `rail-item flex items-center transition-all duration-300 relative select-none ${
                    isVertical
                        ? `h-12 rounded-xl ${expanded ? 'px-4 justify-start mx-3' : 'px-0 justify-center mx-2.5'}`
                        : `h-10 w-10 justify-center mx-0.5 rounded-full`
                } ${
                    isActive
                        ? 'text-[var(--color-primary)] font-bold'
                        : 'hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]'
                }`
            }
            aria-label={t(labelKey)}
            onMouseEnter={() => { setIsHovered(true); iconRef.current?.startAnimation(); }}
            onMouseLeave={() => { setIsHovered(false); iconRef.current?.stopAnimation(); }}
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.span
                            layoutId="rail-active-pill"
                            aria-hidden="true"
                            className="absolute inset-0 -z-10 rounded-[inherit] bg-[var(--color-primary-container)]"
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                    )}
                    <div className={`${isVertical ? 'w-12 h-12' : 'w-10 h-10'} flex items-center justify-center shrink-0`}>
                        <Icon ref={iconRef} size={22} aria-hidden="true" />
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
                                    ? "absolute left-full px-2.5 py-1.5 bg-[var(--color-on-surface)] text-[var(--color-background)] text-[9.5px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none"
                                    : `absolute px-2.5 py-1.5 bg-[var(--color-on-surface)] text-[var(--color-background)] text-[9.5px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none ${
                                        position === 'top' ? 'top-full mt-2.5 left-1/2 -translate-x-1/2' : 'bottom-full mb-2.5 left-1/2 -translate-x-1/2'
                                    }`
                                }
                            >
                                {t(labelKey)}
                                <div className={isVertical
                                    ? "absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[var(--color-on-surface)]"
                                    : `absolute left-1/2 -translate-x-1/2 border-x-4 border-x-transparent ${
                                        position === 'top' ? 'bottom-full border-b-4 border-b-[var(--color-on-surface)]' : 'top-full border-t-4 border-t-[var(--color-on-surface)]'
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
    const { isAdmin } = useAdmin();
    const syncState = useSyncManager();
    const scrollRef = useRef<HTMLElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);

    const [isNavHovered, setIsNavHovered] = useState(false);
    const [isProfileHovered, setIsProfileHovered] = useState(false);

    // Sidebar preferences hook state
    const { position, onboardingShown, updatePosition, completeOnboarding } = useSidebarPreferences();
    const [drag, setDrag] = useState<{ x: number; y: number; zone: SidebarPosition } | null>(null);
    const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

    useEffect(() => {
        const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // While dragging, everything inside the rail already takes the shape of the target edge
    const railPos = drag?.zone ?? position;
    const isVertical = isVerticalPos(railPos);
    const railBox = drag
        ? draggedBox(drag.zone, drag.x, drag.y, viewport.w, viewport.h)
        : dockedBox(position, isNavHovered, viewport.w, viewport.h);

    const hideFloatingBar = /^\/learn\/.+/.test(location.pathname);

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

    const pointerTo = (e: { clientX: number; clientY: number }) => ({
        x: e.clientX, y: e.clientY, zone: nearestEdge(e.clientX, e.clientY, viewport.w, viewport.h),
    });

    const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        e.preventDefault();
        setIsNavHovered(false);
        setDrag(pointerTo(e));
    };

    // Listened on the window: the grip is re-created when the rail turns, so it can't hold the pointer
    const isDragging = drag !== null;
    const dragRef = useRef(drag);
    dragRef.current = drag;
    useEffect(() => {
        if (!isDragging) return;
        const move = (e: PointerEvent) => setDrag(pointerTo(e));
        const end = () => {
            const zone = dragRef.current?.zone;
            setDrag(null);
            if (zone && zone !== position) updatePosition(zone);
        };
        const cancel = () => setDrag(null);
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);
        window.addEventListener('pointercancel', cancel);
        return () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', end);
            window.removeEventListener('pointercancel', cancel);
        };
    }, [isDragging, position, viewport]); // eslint-disable-line react-hooks/exhaustive-deps

    const moveWithKeys = (e: React.KeyboardEvent) => {
        const edge = KEY_TO_EDGE[e.key];
        if (!edge) return;
        e.preventDefault();
        if (edge !== position) updatePosition(edge);
    };

    return (
        <div className={`app-layout pos-${position}`}>

            {/* ===== WHERE THE RAIL WILL LAND WHILE DRAGGING ===== */}
            <AnimatePresence>
                {drag && (
                    <motion.div
                        aria-hidden="true"
                        className="rail-drop-slot"
                        initial={{ opacity: 0, ...dockedBox(drag.zone, false, viewport.w, viewport.h) }}
                        animate={{ opacity: 1, ...dockedBox(drag.zone, false, viewport.w, viewport.h) }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    />
                )}
            </AnimatePresence>

            {/* ===== DRAGGABLE RAIL SIDEBAR ===== */}
            <motion.aside
                ref={sidebarRef}
                className={`sidebar-rail pos-${railPos} fixed bg-[var(--color-card)] border border-[var(--color-outline-variant)] ${drag ? 'is-dragging' : ''}`}
                onMouseEnter={() => { if (!drag) setIsNavHovered(true); }}
                onMouseLeave={() => setIsNavHovered(false)}
                initial={false}
                animate={railBox}
                transition={drag
                    ? { type: 'spring', stiffness: 700, damping: 48, mass: 0.6 }
                    : { type: 'spring', stiffness: 260, damping: 30 }}
            >
                {/* Fades in when the rail turns between vertical and horizontal */}
                <motion.div
                    key={isVertical ? 'vertical' : 'horizontal'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.18 }}
                    className={`flex h-full w-full ${isVertical ? 'flex-col' : 'flex-row items-center'}`}
                >
                {/* Drag Handle & Logo Section */}
                <div className={`flex shrink-0 ${
                    isVertical
                        ? 'flex-col items-center mb-2 mt-1 w-full'
                        : 'flex-row items-center mr-4'
                }`}>

                    {/* Drag Handle */}
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Mover la barra: arrástrala o usa las flechas"
                        onPointerDown={startDrag}
                        onKeyDown={moveWithKeys}
                        className={`drag-handle touch-none flex items-center justify-center cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-primary)] transition-colors shrink-0 relative ${
                            !onboardingShown ? 'drag-handle-glow bg-[var(--color-primary)]/10' : ''
                        } ${
                            isVertical ? 'mb-1 w-8 h-8' : 'mr-3 w-8 h-8'
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
                                className={`fixed z-[60] bg-[var(--color-card)] text-[var(--color-on-surface)] border border-[var(--color-primary)]/30 p-4 rounded-2xl shadow-[var(--shadow-float)] w-[200px] text-left text-xs pointer-events-auto ${
                                    isVertical
                                        ? 'left-full ml-4 top-0'
                                        : position === 'top'
                                            ? 'top-full mt-4 left-0'
                                            : 'bottom-full mb-4 left-0'
                                }`}
                            >
                                <p className="font-semibold leading-relaxed select-none">
                                    💡 <strong>¡Nueva función!</strong> Arrastra la barra desde este tirador para colocarla arriba, abajo, a la izquierda o derecha.
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        completeOnboarding();
                                    }}
                                    className="mt-3 w-full py-1.5 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[10px] font-black rounded-full shadow-md text-center hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer"
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
                        <div className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center shrink-0 rounded-full bg-[var(--color-primary-container)]">
                            <LeafMark className="w-6 h-6" />
                        </div>
                        <AnimatePresence>
                            {isNavHovered && isVertical && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, transition: { duration: 0 } }}
                                    className="ml-2 text-xl font-display font-extrabold text-[var(--color-on-surface)] tracking-[-0.04em]"
                                >
                                    voxie
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Nav items */}
                <nav className={`flex px-1 ${
                    isVertical
                        ? 'flex-col gap-1 shrink-0 w-full'
                        : 'flex-row items-center justify-center space-x-0.5'
                }`}>
                    {navItems.map(item => (
                        <RailNavItem
                            key={item.path}
                            path={item.path}
                            icon={item.icon}
                            labelKey={item.labelKey}
                            expanded={isNavHovered}
                            position={railPos}
                            end={item.end}
                        />
                    ))}
                </nav>

                {/* User area at bottom/right */}
                {progressInfo && authUser && (
                    <div className={`shrink-0 ${isVertical ? 'w-full mt-auto mb-1' : 'ml-2 flex items-center h-full'}`}>
                        <NavLink
                            to="/account"
                            className={({ isActive }) =>
                                `flex items-center rounded-xl transition-all duration-300 relative select-none ${
                                    isVertical
                                        ? `h-12 ${isNavHovered ? 'px-4 justify-start mx-3' : 'px-0 mx-2.5 justify-center'}`
                                        : `h-10 w-10 justify-center rounded-full`
                                } ${
                                    isActive
                                        ? 'bg-[var(--color-primary-container)] text-[var(--color-primary)] font-bold'
                                        : 'hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]'
                                }`
                            }
                            onMouseEnter={() => setIsProfileHovered(true)}
                            onMouseLeave={() => setIsProfileHovered(false)}
                        >
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-base md:text-lg font-black text-[var(--color-on-primary)] shrink-0 shadow-md">
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
                                            <LevelBadge level={progressInfo.currentLevel} size="compact" withStage />
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
                                            ? "absolute left-full px-2.5 py-1.5 bg-[var(--color-on-surface)] text-[var(--color-background)] text-[9.5px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none"
                                            : `absolute px-2.5 py-1.5 bg-[var(--color-on-surface)] text-[var(--color-background)] text-[9.5px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none ${
                                                position === 'top' ? 'top-full mt-2.5 left-1/2 -translate-x-1/2' : 'bottom-full mb-2.5 left-1/2 -translate-x-1/2'
                                            }`
                                        }
                                    >
                                        {t('nav.profile')}
                                        <div className={isVertical
                                            ? "absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[var(--color-on-surface)]"
                                            : `absolute left-1/2 -translate-x-1/2 border-x-4 border-x-transparent ${
                                                position === 'top' ? 'bottom-full border-b-4 border-b-[var(--color-on-surface)]' : 'top-full border-t-4 border-t-[var(--color-on-surface)]'
                                            }`
                                        } />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    </div>
                )}
                </motion.div>
            </motion.aside>

            {/* ===== MAIN CONTENT ===== */}
            <div className="main-content">
                <div className={`main-content-inner ${hideFloatingBar ? 'no-floating-bar-padding' : ''}`}>
                    <OfflineBanner syncState={syncState} />
                    {/* Pages without their own boundary show the sprout while their code loads,
                        then fade in instead of appearing at once */}
                    <Suspense fallback={<PageLoader />}>
                        <div key={location.pathname} className="page-enter">
                            <Outlet />
                        </div>
                    </Suspense>
                </div>
            </div>

            {/* ===== FLOATING BOTTOM BAR (Mobile Only) ===== */}
            {!hideFloatingBar && (
                <nav ref={scrollRef} className="floating-bar">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive ? 'active' : ''
                            }
                        >
                            <item.icon size={20} isAnimated={false} aria-hidden="true" />
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

            {/* ===== FLOATING ADMIN BUTTON (Top-Left, Admin Only) ===== */}
            {isAdmin && (
                <NavLink
                    to="/admin"
                    aria-label="Admin"
                    className={({ isActive }) =>
                        `fixed top-4 left-4 z-[55] w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer active:scale-90 ${
                            isActive
                                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                                : 'bg-[var(--color-card)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-primary)] border border-[var(--color-outline-variant)]'
                        }`
                    }
                >
                    <Shield className="w-5 h-5" aria-hidden="true" />
                </NavLink>
            )}
        </div>
    );
}
