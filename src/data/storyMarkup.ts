/** A tappable word: `w('tooth', 'teeth')` links the card and shows the form the text needs. */
export function w(word: string, shown = word): string {
    return `<span data-word="${word}">${shown}</span>`;
}
