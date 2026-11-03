import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { List } from 'lucide-react';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useLevelUnitProgress } from '../hooks/useLevelUnitProgress';
import { useCards } from '../hooks/useCards';
import { useSkillCards } from '../hooks/useSkillCards';
import { useGardenPlant } from '../hooks/useGardenPlant';
import { useLevelUpNotice } from '../hooks/useLevelUpNotice';
import { useTheme } from '../lib/ThemeContext';
import { useSidebarPreferences } from '../hooks/useSidebarPreferences';
import { useAdmin } from '../hooks/useAdmin';
import { canDrawGarden, gardenStates, nextUnitIndex } from '../components/garden3d/states';
import LevelBadge from '../components/ui/LevelBadge';
import StemProgress from '../components/ui/StemProgress';
import StreakChip from '../components/ui/StreakChip';
import GoalDrops from '../components/ui/GoalDrops';
import PageLoader from '../components/PageLoader';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import Dashboard from './Dashboard';

// three.js comes with the garden only
const Garden3D = lazy(() => import('../components/garden3d/Garden3D'));
const LevelUpModal = lazy(() => import('../components/ui/LevelUpModal'));

/**
 * The home: the level as a 3D garden to walk, with today's plan on top. Browsers that
 * can't draw it keep the classic home.
 */
export default function GardenHome() {
    const [drawable, setDrawable] = useState(canDrawGarden);
    const fail = () => setDrawable(false);
    return drawable ? <DrawFallback onError={fail}><Garden onFail={fail} /></DrawFallback> : <Dashboard />;
}

/** Any error while loading or drawing the garden falls back to the classic home, never a blank app. */
class DrawFallback extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidCatch() { this.props.onError(); }
    render() { return this.state.failed ? null : this.props.children; }
}

function Garden({ onFail }: { onFail: () => void }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, progressInfo } = useLevelProgression();
    const level = progressInfo?.currentLevel ?? 'A1';
    const { units, progress, isLoading } = useLevelUnitProgress(level);
    const { dueCards } = useCards();
    const { dueSkillCards } = useSkillCards();
    const { species } = useGardenPlant();
    const { mode } = useTheme();
    const levelUp = useLevelUpNotice(user?.currentLevel);
    const { position } = useSidebarPreferences();
    const { isAdmin } = useAdmin();
    const [compact, setCompact] = useState(false);
    // The unit just completed is read once; the history entry forgets it, so going back
    // or reloading doesn't grow the plant again
    const [grewId] = useState(() => (location.state as { grew?: string } | null)?.grew);

    useEffect(() => {
        if (grewId) navigate(location.pathname, { replace: true, state: null });
        const onScroll = () => setCompact(scrollY > 40);
        addEventListener('scroll', onScroll, { passive: true });
        // The page above the garden is tall: other pages start at the top, not where the trail was
        document.body.classList.add('has-garden3d');
        return () => { removeEventListener('scroll', onScroll); document.body.classList.remove('has-garden3d'); scrollTo(0, 0); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!user || !progressInfo || isLoading) return <PageLoader />;
    if (units.length === 0) return <Dashboard />;

    const states = gardenStates(units, progress);
    const next = nextUnitIndex(states);
    // Coming back from a unit just completed (of this level): start there and watch its plant grow
    const grew = grewId ? units.findIndex(u => u.id === grewId) : -1;
    // Nothing to continue: the first unit with its speaking pending, else the level's tree
    const start = grew >= 0 ? grew : next >= 0 ? next : states.indexOf('pending') >= 0 ? states.indexOf('pending') : units.length - 1;
    const lessons = units.filter(u => !u.isAssessment).length;
    const grown = states.filter(s => s === 'done' || s === 'pending').length;
    const pending = states.filter(s => s === 'pending').length;
    const reviewCount = dueCards.length + dueSkillCards.length;
    const stage = t(`garden3d.stage.${level}`);
    const subtitle = states.includes('exam-done') ? t('garden3d.subDone', { stage })
        : states.includes('exam-open') ? t('garden3d.subExam', { level })
        : pending && grown === lessons ? t('garden3d.subPending', { count: pending })
        : t('garden3d.sub', { grown, total: lessons, count: lessons - grown, level });

    return (
        <>
            <PWAInstallPrompt />
            {/* The trail's length in scroll: the garden walks with the page */}
            <div style={{ height: `${Math.max(units.length, 4) * 60}vh` }} aria-hidden="true" />

            {createPortal(
                <section className={`garden3d-hero ${compact ? 'is-compact' : ''} ${position === 'top' ? 'below-rail' : ''} ${isAdmin ? 'beside-admin' : ''}`} aria-labelledby="garden-title">
                    <div className="flex items-center justify-between gap-3">
                        <LevelBadge level={level} withStage />
                        <div className="flex items-center gap-3">
                            <StreakChip count={user.streak} />
                            <GoalDrops done={user.goalProgress} goal={user.dailyGoal} freezes={user.streakFreezes} />
                        </div>
                    </div>
                    <h1 id="garden-title" className="text-[clamp(1.25rem,4.5vw,1.75rem)] font-extrabold tracking-[-0.035em] leading-tight">
                        {t(`garden3d.title.${level}`)}
                    </h1>
                    <div className="garden3d-hero-more space-y-3">
                        <p className="text-sm text-[var(--color-on-surface-muted)]">{subtitle}</p>
                        <StemProgress value={lessons ? (grown / lessons) * 100 : 0} label={t('garden.unitsLabel', { done: grown, total: lessons })} />
                        <div className="flex flex-wrap items-center gap-2">
                            {next >= 0 && (
                                <button className="btn-primary px-5 py-2.5 text-sm" onClick={() => navigate(`/path/${units[next].id}`)}>
                                    {units[next].isAssessment ? t('garden3d.takeExam') : t('garden3d.continueUnit', { n: units[next].unitNumber })}
                                </button>
                            )}
                            {reviewCount > 0 && (
                                <button className="btn-secondary px-5 py-2.5 text-sm" onClick={() => navigate('/review')}>
                                    {t('dashboard.review')} · {reviewCount}
                                </button>
                            )}
                            <Link to="/path" className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]">
                                <List className="w-3.5 h-3.5" aria-hidden="true" />{t('garden3d.listView')}
                            </Link>
                        </div>
                    </div>
                </section>,
                document.body,
            )}

            <Suspense fallback={null}>
                <Garden3D
                    units={units}
                    states={states}
                    level={level}
                    species={species}
                    night={mode === 'dark'}
                    startAt={start}
                    grow={grew >= 0 ? grew : undefined}
                    onOpen={i => navigate(`/path/${units[i].id}`)}
                    onFail={onFail}
                />
            </Suspense>

            {levelUp.mounted && (
                <Suspense fallback={null}>
                    <LevelUpModal level={levelUp.newLevel} isOpen={levelUp.open} onClose={levelUp.close} />
                </Suspense>
            )}
        </>
    );
}
