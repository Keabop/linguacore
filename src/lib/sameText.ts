/**
 * Whether two texts have the same words: capitals, punctuation and spacing don't count. A
 * correction that only changes those is not one (the evaluator drops them too).
 */
export function sameWords(a: string, b: string): boolean {
    const bare = (text: string) => text.toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').trim();
    return bare(a) === bare(b);
}

/** Pieces of `text` with the first case-insensitive match of each phrase marked, without overlaps. */
export function markPhrases(text: string, phrases: string[]): { text: string; marked: boolean }[] {
    const lower = text.toLowerCase();
    const ranges: [number, number][] = [];
    for (const phrase of phrases) {
        const p = phrase.trim().toLowerCase();
        if (!p) continue;
        let from = 0;
        while (from <= lower.length) {
            const at = lower.indexOf(p, from);
            if (at < 0) break;
            const end = at + p.length;
            if (!ranges.some(([s, e]) => at < e && end > s)) { ranges.push([at, end]); break; }
            from = at + 1;
        }
    }
    ranges.sort((x, y) => x[0] - y[0]);
    const pieces: { text: string; marked: boolean }[] = [];
    let cursor = 0;
    for (const [s, e] of ranges) {
        if (s > cursor) pieces.push({ text: text.slice(cursor, s), marked: false });
        pieces.push({ text: text.slice(s, e), marked: true });
        cursor = e;
    }
    if (cursor < text.length) pieces.push({ text: text.slice(cursor), marked: false });
    return pieces;
}
