/**
 * Whether two texts are the same answer written the same way: only spaces and the curly
 * apostrophe of phone keyboards are forgiven. Capitals and punctuation count, unlike
 * answersMatch, because here the AI is skipped and the answer gets full marks.
 */
export function sameText(a: string, b: string): boolean {
    const clean = (text: string) => text.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
    return clean(a) === clean(b);
}
