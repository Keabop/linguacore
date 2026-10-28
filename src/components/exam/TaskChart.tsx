import type { ChartData } from '../../lib/exam/types';

// Four series that differ in hue, keep 3:1 contrast on the card in both themes, and also differ
// in marker shape, so they can be told apart without colour
const SERIES = ['var(--color-primary)', 'var(--color-tertiary-ink)', 'var(--color-error)', 'var(--color-on-surface)'];
const MARKERS = ['circle', 'square', 'triangle', 'diamond'] as const;

const W = 600;
const H = 320;
const PAD = { top: 16, right: 92, bottom: 40, left: 44 };

/** Axis top and grid step: at most 10 grid lines, on a tidy step (1, 2, 2.5, 5, 10…). */
function axis(value: number): { max: number; step: number } {
    const exp = 10 ** Math.floor(Math.log10(Math.max(1, value)));
    const step = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10].map(m => m * exp).find(st => Math.ceil(value / st) <= 10)!;
    return { max: Math.ceil(value / step) * step, step };
}

function Marker({ shape, x, y, color }: { shape: typeof MARKERS[number]; x: number; y: number; color: string }) {
    const r = 4;
    if (shape === 'circle') return <circle cx={x} cy={y} r={r} fill={color} />;
    if (shape === 'square') return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} fill={color} />;
    if (shape === 'triangle') return <path d={`M${x} ${y - r - 1}L${x + r + 1} ${y + r}L${x - r - 1} ${y + r}Z`} fill={color} />;
    return <path d={`M${x} ${y - r - 1}L${x + r + 1} ${y}L${x} ${y + r + 1}L${x - r - 1} ${y}Z`} fill={color} />;
}

/** Spreads end-of-line labels so they never overlap (at least `gap` apart vertically). */
function spread(ys: number[], gap = 14): number[] {
    const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
    for (let k = 1; k < order.length; k++) order[k].y = Math.max(order[k].y, order[k - 1].y + gap);
    const out: number[] = [];
    for (const o of order) out[o.i] = o.y;
    return out;
}

/** The chart an IELTS Writing Task 1 asks to describe, with a data table for screen readers. */
export default function TaskChart({ chart }: { chart: ChartData }) {
    const { max, step } = axis(Math.max(...chart.series.flatMap(s => s.values)));
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
    const slot = plotW / chart.categories.length;
    const x = (i: number) => PAD.left + slot * i + slot / 2;
    const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => +(i * step).toFixed(2));
    const suffix = chart.unit === '%' ? '%' : '';
    const last = chart.categories.length - 1;
    const labelY = spread(chart.series.map(s => y(s.values[last]) + 4));

    return (
        <figure className="space-y-3">
            <figcaption className="text-sm font-bold text-[var(--color-on-surface)]">{chart.title}</figcaption>
            {/* Below ~520px the labels would shrink past legibility: the chart scrolls inside its box instead */}
            <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px] h-auto" role="img" aria-label={`${chart.title}. The data is in the table that follows.`}>
                {ticks.map(t => (
                    <g key={t}>
                        <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-outline-variant)" strokeWidth="1" />
                        <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize="12" fill="var(--color-on-surface-muted)">{t}{suffix}</text>
                    </g>
                ))}
                {chart.categories.map((c, i) => (
                    <text key={c} x={x(i)} y={H - PAD.bottom + 18} textAnchor="middle" fontSize="12" fill="var(--color-on-surface-muted)">{c}</text>
                ))}
                {chart.kind === 'bar'
                    ? chart.series.map((s, si) => {
                        const barW = (slot * 0.7) / chart.series.length;
                        return s.values.map((v, i) => (
                            <rect key={`${s.name}-${i}`} x={PAD.left + slot * i + slot * 0.15 + barW * si} y={y(v)} width={barW - 2} height={PAD.top + plotH - y(v)} rx="3" fill={SERIES[si % SERIES.length]} />
                        ));
                    })
                    : chart.series.map((s, si) => {
                        const color = SERIES[si % SERIES.length];
                        return (
                            <g key={s.name}>
                                <polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
                                {s.values.map((v, i) => <Marker key={i} shape={MARKERS[si % MARKERS.length]} x={x(i)} y={y(v)} color={color} />)}
                                {/* The series name at the end of its line, so the legend isn't needed to read it */}
                                <text x={x(last) + 10} y={labelY[si]} fontSize="12" fontWeight="700" fill={color}>{s.name}</text>
                            </g>
                        );
                    })}
                {!suffix && (
                    <text x={12} y={PAD.top + plotH / 2} fontSize="12" fill="var(--color-on-surface-muted)" transform={`rotate(-90 12 ${PAD.top + plotH / 2})`} textAnchor="middle">{chart.unit}</text>
                )}
            </svg>
            </div>
            {chart.kind === 'bar' && (
                <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-[var(--color-on-surface-muted)]" aria-hidden="true">
                    {chart.series.map((s, si) => (
                        <li key={s.name} className="flex items-center gap-1.5">
                            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: SERIES[si % SERIES.length] }} />
                            {s.name}
                        </li>
                    ))}
                </ul>
            )}
            <table className="sr-only">
                <caption>{chart.title}</caption>
                <thead><tr><th scope="col" />{chart.categories.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
                <tbody>
                    {chart.series.map(s => (
                        <tr key={s.name}><th scope="row">{s.name}</th>{s.values.map((v, i) => <td key={i}>{v}{suffix}</td>)}</tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}
