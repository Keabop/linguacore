/**
 * A tappable word: `w('tooth', 'teeth')` links the card and shows the form the text needs. A
 * `gloss` says what it means here when the card's translation alone would mislead, as «old» in
 * «years old».
 */
export function w(word: string, shown = word, gloss?: string): string {
    return gloss
        ? `<span data-word="${word}" data-gloss="${gloss.replace(/"/g, '&quot;')}">${shown}</span>`
        : `<span data-word="${word}">${shown}</span>`;
}
