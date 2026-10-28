// Score conversions of the simulators. Official exams publish ranges, not exact formulas, and
// cut-offs move between versions: every result shown from here is labelled as an estimate.

export type CefrResult = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// ---------- IELTS (Academic): raw marks out of 40 → band, and overall band

// [minimum raw out of 40, band], highest first. Common published tables (Listening and
// Academic Reading differ slightly in the middle).
const IELTS_LISTENING: [number, number][] = [
    [39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [11, 4], [8, 3.5], [6, 3], [4, 2.5],
];
const IELTS_READING: [number, number][] = [
    [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5],
];

/** Band for a Listening or Reading section; raw marks are scaled to 40 if the section has another size. */
export function ieltsBand(earned: number, total: number, section: 'listening' | 'reading'): number {
    if (total <= 0) return 0;
    const raw40 = Math.round((earned / total) * 40);
    const table = section === 'listening' ? IELTS_LISTENING : IELTS_READING;
    return table.find(([min]) => raw40 >= min)?.[1] ?? (raw40 > 0 ? 2 : 0);
}

/** Overall band: mean of the four, to the nearest half (.25 → .5, .75 → next whole), as IELTS does. */
export function ieltsOverall(bands: number[]): number {
    const mean = bands.reduce((a, b) => a + b, 0) / bands.length;
    return Math.floor(mean * 2 + 0.5) / 2;
}

/** IELTS bands per CEFR level, as aligned by IELTS. */
export function cefrFromIelts(band: number): CefrResult {
    if (band >= 8.5) return 'C2';
    if (band >= 7) return 'C1';
    if (band >= 5.5) return 'B2';
    if (band >= 4) return 'B1';
    return band >= 3 ? 'A2' : 'A1';
}

// ---------- TOEFL iBT (format of January 2026): band 1–6 per section in half steps

const TOEFL_STEPS: [number, number][] = [
    [0.95, 6], [0.88, 5.5], [0.8, 5], [0.7, 4.5], [0.6, 4], [0.5, 3.5], [0.4, 3], [0.3, 2.5], [0.2, 2], [0.1, 1.5],
];

/**
 * Band of an adaptive section. Learners routed to the lower stage never saw the hardest items,
 * so their band is capped at 4 (B2), as an adaptive test would.
 */
export function toeflBand(ratio: number, stage?: 'lower' | 'upper'): number {
    const band = TOEFL_STEPS.find(([min]) => ratio >= min)?.[1] ?? 1;
    return stage === 'lower' ? Math.min(band, 4) : band;
}

/** Overall band: mean of the section bands to the nearest half. */
export function toeflOverall(bands: number[]): number {
    const mean = bands.reduce((a, b) => a + b, 0) / bands.length;
    return Math.round(mean * 2) / 2;
}

/** TOEFL 2026 bands are aligned to CEFR: 1 A1 … 6 C2 (half bands take the lower level). */
export function cefrFromToefl(band: number): CefrResult {
    return (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrResult[])[Math.max(0, Math.min(5, Math.floor(band) - 1))];
}

// ---------- Cambridge English Scale (B1 Preliminary, B2 First)

// [share of marks, scale score] anchors; values in between are interpolated
const CAMBRIDGE_ANCHORS: Record<'b1' | 'b2', [number, number][]> = {
    // Preliminary: ~70% passes at 140 (B1); 160+ is grade A (B2)
    b1: [[0, 82], [0.45, 120], [0.7, 140], [0.85, 153], [0.9, 160], [1, 170]],
    // First: ~60% passes at 160 (B2); 180+ is grade A (C1)
    b2: [[0, 102], [0.4, 140], [0.6, 160], [0.8, 173], [0.9, 180], [1, 190]],
};

export function cambridgeScale(ratio: number, exam: 'b1' | 'b2'): number {
    const anchors = CAMBRIDGE_ANCHORS[exam];
    const r = Math.max(0, Math.min(1, ratio));
    for (let i = 1; i < anchors.length; i++) {
        const [r0, s0] = anchors[i - 1];
        const [r1, s1] = anchors[i];
        if (r <= r1) return Math.round(s0 + ((r - r0) / (r1 - r0)) * (s1 - s0));
    }
    return anchors.at(-1)![1];
}

/** CEFR level reported by the Cambridge English Scale. */
export function cefrFromCambridge(scale: number): CefrResult {
    if (scale >= 200) return 'C2';
    if (scale >= 180) return 'C1';
    if (scale >= 160) return 'B2';
    if (scale >= 140) return 'B1';
    if (scale >= 120) return 'A2';
    return 'A1';
}
