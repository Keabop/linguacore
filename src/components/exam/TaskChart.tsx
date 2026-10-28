import type { ChartData } from '../../lib/exam/types';

// Series colours from the garden palette, distinct in light and dark themes
const SERIES = ['var(--color-primary)', 'var(--color-tertiary-ink)', 'var(--color-level-b2)', 'var(--color-level-a1)'];

const W = 560;
const H = 300;
const PAD = { top: 16, right: 16, bottom: 44, left: 48 };

/** Rounds the axis maximum up to a tidy step (10, 20, 50, 100…). */
function niceMax(value: number): number {
    const exp = 10 ** Math.floor(Math.log10(Math.max(1, value)));
    return [1, 2, 2.5, 5, 10].map(m => m * exp).find(m => m >= value) ?? value;
}

/** The chart an IELTS Writing Task 1 asks to describe, with a data table for screen readers. */
export default function TaskChart({ chart }: { chart: ChartData }) {
    const max = niceMax(Math.max(...chart.series.flatMap(s => s.values)));
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
    const slot = plotW / chart.categories.length;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => f * max);

    return (
        <figure className="space-y-3">
            <figcaption className="text-sm font-bold text-[var(--color-on-surface)]">{chart.title}</figcaption>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${chart.title}. Los datos están en la tabla siguiente.`}>
                {ticks.map(t => (
                    <g key={t}>
                        <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-outline-variant)" strokeWidth="1" />
                        <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-on-surface-muted)">{t}{chart.unit === '%' ? '%' : ''}</text>
                    </g>
                ))}
                {chart.categories.map((c, i) => (
                    <text key={c} x={PAD.left + slot * i + slot / 2} y={H - PAD.bottom + 18} textAnchor="middle" fontSize="11" fill="var(--color-on-surface-muted)">{c}</text>
                ))}
                {chart.kind === 'bar'
                    ? chart.series.map((s, si) => {
                        const barW = (slot * 0.7) / chart.series.length;
                        return s.values.map((v, i) => (
                            <rect
                                key={`${s.name}-${i}`}
                                x={PAD.left + slot * i + slot * 0.15 + barW * si}
                                y={y(v)}
                                width={barW - 2}
                                height={PAD.top + plotH - y(v)}
                                rx="3"
                                fill={SERIES[si % SERIES.length]}
                            />
                        ));
                    })
                    : chart.series.map((s, si) => (
                        <g key={s.name}>
                            <polyline
                                points={s.values.map((v, i) => `${PAD.left + slot * i + slot / 2},${y(v)}`).join(' ')}
                                fill="none"
                                stroke={SERIES[si % SERIES.length]}
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                            />
                            {s.values.map((v, i) => (
                                <circle key={i} cx={PAD.left + slot * i + slot / 2} cy={y(v)} r="3.5" fill={SERIES[si % SERIES.length]} />
                            ))}
                        </g>
                    ))}
                {chart.unit !== '%' && (
                    <text x={12} y={PAD.top + plotH / 2} fontSize="11" fill="var(--color-on-surface-muted)" transform={`rotate(-90 12 ${PAD.top + plotH / 2})`} textAnchor="middle">{chart.unit}</text>
                )}
            </svg>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-[var(--color-on-surface-muted)]" aria-hidden="true">
                {chart.series.map((s, si) => (
                    <li key={s.name} className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: SERIES[si % SERIES.length] }} />
                        {s.name}
                    </li>
                ))}
            </ul>
            <table className="sr-only">
                <caption>{chart.title} ({chart.unit})</caption>
                <thead><tr><th scope="col" />{chart.categories.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
                <tbody>
                    {chart.series.map(s => (
                        <tr key={s.name}><th scope="row">{s.name}</th>{s.values.map((v, i) => <td key={i}>{v}</td>)}</tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}
