import { useEffect, useLayoutEffect, useRef, type MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Mic, Lock, Check } from 'lucide-react';
import type { CEFRLevel, Unit } from '../../lib/db';
import type { SpeciesId } from '../garden/species';
import type { GardenUnitState } from './states';
import { createGarden, type Anchor, type GardenHandle } from './scene';
import { useGardenStyle } from '../../hooks/useGardenPlant';

interface Garden3DProps {
    units: Unit[];
    states: GardenUnitState[];
    level: CEFRLevel;
    species: SpeciesId;
    night: boolean;
    /** Index of the unit to start at. */
    startAt: number;
    /** Index of a unit just completed: its plant grows. */
    grow?: number;
    /** A plot's sign was chosen: the page shows its details. */
    onSelect: (index: number) => void;
    /** The plot whose details are open. */
    selected?: number | null;
    /** Filled with the camera's dive, which the page runs before opening a unit. */
    diveRef?: MutableRefObject<((index: number) => Promise<void>) | null>;
    /** The garden could not be drawn (or its context was lost): the page shows the classic home. */
    onFail: () => void;
}

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The garden drawn behind the page: the page's scroll walks the trail, and each plot carries
 * its label. Lives in its own chunk with three.js, so only the home downloads it.
 */
export default function Garden3D({ units, states, level, species, night, startAt, grow, onSelect, selected, diveRef, onFail }: Garden3DProps) {
    const { t } = useTranslation();
    const stageRef = useRef<HTMLDivElement>(null);
    const { style } = useGardenStyle();
    const labelsRef = useRef<(HTMLDivElement | null)[]>([]);
    const handleRef = useRef<GardenHandle | null>(null);
    const statesKey = states.join(',');

    // The scene is rebuilt only when what it draws changes; labels follow it every frame without React
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        // A new canvas per scene: a disposed scene gives its context back for good, so a canvas
        // can't be drawn on again (React runs effects twice in development, and theme or plant changes rebuild)
        const canvas = document.createElement('canvas');
        canvas.className = 'garden3d-canvas';
        stage.append(canvas);
        const hero = document.querySelector('.path-bar');
        const place = (anchors: Anchor[]) => {
            // A label whose top would slip under the plan card hides instead
            const top = (hero?.getBoundingClientRect().bottom ?? 0) + 8;
            anchors.forEach((a, i) => {
                const el = labelsRef.current[i];
                if (!el) return;
                const visible = a.visible && a.y - el.offsetHeight > top;
                el.style.transform = `translate(${a.x}px, ${a.y}px) translate(-50%, -100%)`;
                el.style.opacity = visible ? '1' : '0';
                el.style.visibility = visible ? 'visible' : 'hidden';
            });
        };
        let handle: GardenHandle;
        try {
            handle = createGarden(canvas, { states, level, species, night, reducedMotion: reducedMotion(), grow, pixel: style === 'pixel' }, place);
        } catch {
            canvas.remove();
            onFail();
            return;
        }
        handleRef.current = handle;
        if (diveRef) diveRef.current = (i: number) => handle.dive(i);
        const lost = (e: Event) => { e.preventDefault(); onFail(); };
        canvas.addEventListener('webglcontextlost', lost);
        const onScroll = () => {
            const max = document.documentElement.scrollHeight - innerHeight;
            handle.setProgress(max > 0 ? scrollY / max : 0);
        };
        addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => { removeEventListener('scroll', onScroll); canvas.removeEventListener('webglcontextlost', lost); handle.dispose(); canvas.remove(); handleRef.current = null; if (diveRef) diveRef.current = null; };
    }, [statesKey, level, species, night, grow, style]); // eslint-disable-line react-hooks/exhaustive-deps

    // Open on the unit in progress (or the one that just grew)
    useLayoutEffect(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        if (units.length > 1) scrollTo({ top: (startAt / (units.length - 1)) * max });
    }, [startAt, units.length]);

    const pendingUnit = states.indexOf('pending');

    return createPortal(
        <>
            <div ref={stageRef} aria-hidden="true" />
            <div className="garden3d-labels">
                {units.map((u, i) => {
                    const s = states[i];
                    const title = u.isAssessment ? t('garden3d.examTitle') : u.title;
                    return (
                        <div
                            key={u.id}
                            ref={el => { labelsRef.current[i] = el; }}
                            className={`garden3d-tag ${s === 'current' || s === 'exam-open' ? 'is-current' : ''} ${selected === i ? 'is-selected' : ''}`}
                        >
                            <small>{u.isAssessment ? t('garden3d.final') : t('garden3d.unit', { n: u.unitNumber })}</small>
                            <b>{title}</b>
                            {s === 'done' && <span className="ok"><Check className="w-3 h-3" aria-hidden="true" />{t('garden3d.done')}</span>}
                            {s === 'pending' && <span className="pending"><Mic className="w-3 h-3" aria-hidden="true" />{t('garden3d.pending')}</span>}
                            {s === 'current' && <span className="ok">{t('pathView.status.current')}</span>}
                            {s === 'locked' && <span className="muted"><Lock className="w-3 h-3" aria-hidden="true" />{t('pathView.status.locked')}</span>}
                            {s === 'exam-open' && <span className="ok">{t('pathView.status.exam-open')}</span>}
                            {s === 'exam-done' && <span className="ok"><Check className="w-3 h-3" aria-hidden="true" />{t('garden3d.examDone')}</span>}
                            {s === 'exam-locked' && (
                                pendingUnit >= 0
                                    ? <span className="pending">{t('garden3d.examPending', { n: units[pendingUnit].unitNumber })}</span>
                                    : <span className="muted"><Lock className="w-3 h-3" aria-hidden="true" />{t('pathView.status.exam-locked')}</span>
                            )}
                            {/* The whole sign opens the plot's details, whatever its state */}
                            <button type="button" className="garden3d-tag-link" onClick={() => onSelect(i)} aria-label={t('pathView.details', { title })} aria-pressed={selected === i} />
                        </div>
                    );
                })}
            </div>
        </>,
        document.body,
    );
}
