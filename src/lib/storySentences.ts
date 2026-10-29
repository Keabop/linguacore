// A story's text split into the sentences the reader highlights and the audio is cut into.
// The story player and the audio generator both split with this, so their sentences match.

export interface StorySentence {
    /** The sentence's markup, with its tappable words. */
    html: string;
    /** What is spoken: the sentence without markup. */
    text: string;
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' };
const PARAGRAPH = /<p([^>]*)>([\s\S]*?)<\/p>/g;

const plain = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&[a-z#0-9]+;/gi, e => ENTITIES[e] ?? e).replace(/\s+/g, ' ').trim();

// A sentence ends at ".", "!" or "?" and a space, but not after a title: "Dr. Patel" is one sentence
const SENTENCE_END = /(?<=[.!?])(?<!\b(?:Mr|Mrs|Ms|Dr|Prof)\.)\s+/;

const sentencesOf = (inner: string): StorySentence[] =>
    inner.split(SENTENCE_END)
        .filter(part => part.trim())
        .map(part => ({ html: part, text: plain(part) }))
        .filter(s => s.text);

/**
 * Sentences of each paragraph (`<p>`), in reading order. A text without paragraphs (an AI story
 * that ignored the format) counts as one paragraph.
 */
export function storyParagraphs(content: string): StorySentence[][] {
    const paragraphs = [...content.matchAll(PARAGRAPH)].map(([, , inner]) => sentencesOf(inner));
    return paragraphs.length ? paragraphs : [sentencesOf(content)];
}

export const storySentences = (content: string): string[] => storyParagraphs(content).flat().map(s => s.text);

/**
 * The story's markup with each sentence passed through `wrap` (numbered in reading order, the
 * same as `storySentences`). Everything outside the paragraphs, and their attributes, stays.
 */
export function wrapStorySentences(content: string, wrap: (html: string, index: number) => string): string {
    let n = 0;
    const join = (inner: string) => sentencesOf(inner).map(s => wrap(s.html, n++)).join(' ');
    if (!content.match(PARAGRAPH)) return `<p>${join(content)}</p>`;
    return content.replace(PARAGRAPH, (_, attrs: string, inner: string) => `<p${attrs}>${join(inner)}</p>`);
}
