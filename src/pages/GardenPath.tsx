import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { CEFRLevel } from '../lib/db';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useLevelUnitProgress } from '../hooks/useLevelUnitProgress';
import { useGardenPlant } from '../hooks/useGardenPlant';
import { useTheme } from '../lib/ThemeContext';
import { useSidebarPreferences } from '../hooks/useSidebarPreferences';
import { useAdmin } from '../hooks/useAdmin';
import { canDrawGarden, gardenStates, nextUnitIndex } from '../components/garden3d/states';
import PathBar from '../components/path/PathBar';
import PathList from '../components/path/PathList';
import FirstStepsCard from '../components/FirstStepsCard';
import UnitSheet from '../components/path/UnitSheet';
import UnitDetails, { unitAction } from '../components/path/UnitDetails';
import PageLoader from '../components/PageLoader';

// three.js comes with the garden only
const Garden3D = lazy(() => import('../components/garden3d/Garden3D'));

const VIEW_KEY = 'voxie.pathView';
const readView = () => { try { return localStorage.getItem(VIEW_KEY); } catch { return null; } };
const saveView = (view: '3d' | 'list') => { try { localStorage.setItem(VIEW_KEY, view); } catch { /* the choice lasts this visit only */ } };

/** Any error while loading or drawing the garden falls back to the list, never a blank app. */
class DrawFallback extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidCatch() { this.props.onError(); }
    render() { return this.state.failed ? null : this.props.children; }
}

/**
 * The learning path: the level in view as a 3D garden to walk or as a trail of plots, under one
 * slim bar (levels, growth, today's watering, the next step). A plot opens its details; only
 * the details' button enters the unit.
 */
export default function GardenPath() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, progressInfo } = useLevelProgression();
    const currentLevel = progressInfo?.currentLevel ?? 'A1';
    const [picked, setPicked] = useState<CEFRLevel | null>(null);
    const level = picked ?? currentLevel;
    const { units, progress, isLoading } = useLevelUnitProgress(level);
    const { species } = useGardenPlant();
    const { mode } = useTheme();
    const { position } = useSidebarPreferences();
    const { isAdmin } = useAdmin();

    const [drawable, setDrawable] = useState(canDrawGarden);
    const [view, setView] = useState<'3d' | 'list'>(() => (readView() === 'list' ? 'list' : '3d'));
    const show3D = drawable && view === '3d';
    const [selected, setSelected] = useState<number | null>(null);
    const diveRef = useRef<((i: number) => Promise<void>) | null>(null);
    // The unit just completed is read once; the history entry forgets it, so going back
    // or reloading doesn't grow the plant again
    const [grewId] = useState(() => (location.state as { grew?: string } | null)?.grew);

    useEffect(() => {
        if (grewId) navigate(location.pathname, { replace: true, state: null });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // The page above the garden is tall: other pages (and the list) start at the top
    useEffect(() => {
        if (!show3D) return;
        document.body.classList.add('has-garden3d');
        return () => { document.body.classList.remove('has-garden3d'); scrollTo(0, 0); };
    }, [show3D]);

    const changeView = (v: '3d' | 'list') => { saveView(v); setView(v); setSelected(null); scrollTo(0, 0); };
    const changeLevel = (l: CEFRLevel) => { setPicked(l === currentLevel ? null : l); setSelected(null); };
    const closeSheet = useCallback(() => setSelected(null), []);

    if (!user || !progressInfo || isLoading) return <PageLoader />;

    const states = gardenStates(units, progress);
    const next = nextUnitIndex(states);
    const viewingCurrent = level === currentLevel;
    const grew = viewingCurrent && grewId ? units.findIndex(u => u.id === grewId) : -1;
    const pending = states.indexOf('pending');
    const start = grew >= 0 ? grew : next >= 0 ? next : pending >= 0 ? pending : units.length - 1;
    const lessons = units.filter(u => !u.isAssessment).length;
    const grown = states.filter(s => s === 'done' || s === 'pending').length;

    const enter = async (i: number) => {
        if (show3D) await diveRef.current?.(i);
        navigate(`/path/${units[i].id}`);
    };
    const byId = new Map((progress ?? []).map(p => [p.unit_id, p]));

    const bar = (
        <PathBar
            level={level}
            unlocked={user.unlockedLevels ?? [currentLevel]}
            onLevel={changeLevel}
            grown={grown}
            total={lessons}
            streak={user.streak}
            goal={{ done: user.goalProgress, goal: user.dailyGoal, freezes: user.streakFreezes }}
            view={drawable ? { value: show3D ? '3d' : 'list', onChange: changeView } : undefined}
            next={next >= 0 ? {
                label: units[next].isAssessment ? t('pathView.takeExam') : t('garden3d.continueUnit', { n: units[next].unitNumber }),
                onClick: () => enter(next),
            } : undefined}
            floating={show3D}
        />
    );

    if (!show3D) {
        return (
            <div className="space-y-6">
                {bar}
                {!viewingCurrent && grown === lessons && <p className="text-sm text-[var(--color-on-surface-muted)]">{t('pathView.pastLevel')}</p>}
                {/* Only for whoever is starting: in A1 with fewer than two units done, as on the home page */}
                {viewingCurrent && level === 'A1' && states.filter(s => s === 'done' || s === 'pending').length < 2 && <FirstStepsCard />}
                <PathList key={level} level={level} units={units} states={states} progress={progress} species={species} openAt={start} thenOpen={grew >= 0 && next >= 0 && next !== grew ? next : undefined} onOpen={enter} />
            </div>
        );
    }

    const sel = selected !== null ? units[selected] : null;
    return (
        <>
            {/* The trail's length in scroll: the garden walks with the page */}
            <div style={{ height: `${Math.max(units.length, 4) * 60}vh` }} aria-hidden="true" />
            <PathDock className={`path-bar-dock ${position === 'top' ? 'below-rail' : ''} ${isAdmin ? 'beside-admin' : ''}`}>{bar}</PathDock>
            <DrawFallback onError={() => setDrawable(false)}>
                <Suspense fallback={null}>
                    <Garden3D
                        key={level}
                        units={units}
                        states={states}
                        level={level}
                        species={species}
                        night={mode === 'dark'}
                        startAt={start}
                        grow={grew >= 0 ? grew : undefined}
                        onSelect={setSelected}
                        selected={selected}
                        diveRef={diveRef}
                        onFail={() => setDrawable(false)}
                    />
                </Suspense>
            </DrawFallback>
            {sel && selected !== null && (
                <UnitSheet
                    label={sel.isAssessment ? t('garden3d.final') : t('garden3d.unit', { n: sel.unitNumber })}
                    title={sel.isAssessment ? t('garden3d.examTitle') : sel.title}
                    subtitle={sel.isAssessment ? undefined : sel.grammarTopic}
                    status={t(`pathView.status.${states[selected]}`)}
                    onClose={closeSheet}
                >
                    <UnitDetails
                        unit={sel}
                        state={states[selected]}
                        progress={byId.get(sel.id)}
                        action={unitAction(selected, units, states, byId.get(sel.id), t)}
                        onAction={enter}
                    />
                </UnitSheet>
            )}
        </>
    );
}

/** The floating bar's dock. It publishes where it ends, so the unit panel opens below it whatever its height. */
function PathDock({ className, children }: { className: string; children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const root = document.documentElement;
        const publish = () => root.style.setProperty('--path-dock-bottom', `${Math.round(el.getBoundingClientRect().bottom)}px`);
        publish();
        const observer = new ResizeObserver(publish);
        observer.observe(el);
        addEventListener('resize', publish);
        return () => {
            observer.disconnect();
            removeEventListener('resize', publish);
            root.style.removeProperty('--path-dock-bottom');
        };
    }, []);
    return createPortal(<div ref={ref} className={className}>{children}</div>, document.body);
}
