// A story's text split into the sentences the reader highlights and the audio is cut into.
// The story player and the audio generator both split with this, so their sentences match.

export interface StorySentence {
    /** The sentence's markup, with its tappable words. */
    html: string;
    /** What is spoken: the sentence without markup. */
    text: string;
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' };

const plain = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&[a-z#0-9]+;/gi, e => ENTITIES[e] ?? e).replace(/\s+/g, ' ').trim();

/** Sentences of each paragraph (`<p>`), in reading order. */
export function storyParagraphs(content: string): StorySentence[][] {
    return [...content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(([, inner]) =>
        inner.split(/(?<=[.!?])\s+/)
            .filter(part => part.trim())
            .map(part => ({ html: part, text: plain(part) }))
            .filter(s => s.text),
    );
}

export const storySentences = (content: string): string[] => storyParagraphs(content).flat().map(s => s.text);
