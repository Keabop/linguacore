import { GLOSSARY, getGlossaryEntry } from '../data/glossary';

/** Text inside these is not glossed: headings, crossed-out mistakes, code and existing controls. */
const SKIP = 'h1, h2, h3, h4, h5, h6, s, del, code, a, button, th';

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ');

const formToId = new Map(GLOSSARY.flatMap(entry => entry.forms.map(form => [normalize(form), entry.id] as const)));

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Longest forms first, so «verbo auxiliar» wins over «verbo». Whole words only; the preceding character
// is captured instead of using a lookbehind, which iOS Safari before 16.4 cannot parse.
const alternatives = [...formToId.keys()]
    .sort((a, b) => b.length - a.length)
    .map(form => escapeRegExp(form).replace(/ /g, '\\s+'))
    .join('|');
const TERM_PATTERN = new RegExp(`(^|[^\\p{L}\\p{N}])(${alternatives})(?=[^\\p{L}\\p{N}]|$)`, 'giu');

function termButton(doc: Document, id: string, text: string): HTMLButtonElement {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'gloss-term';
    button.dataset.term = id;
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = text;
    return button;
}

/**
 * Turns the first mention of each glossary term in an explanation into a button that opens its
 * definition. Terms are found on their own, and a phrase the matcher would miss can be marked by hand
 * with `<span data-term="id">…</span>`. Expects sanitized HTML; only adds markup of its own.
 *
 * Pass the same `seen` set to several calls to gloss each term once across all of them.
 */
export function glossify(html: string, seen = new Set<string>()): string {
    const template = document.createElement('template');
    template.innerHTML = html;
    const doc = template.content.ownerDocument;

    const glossText = (node: Text) => {
        const text = node.data;
        const fragment = doc.createDocumentFragment();
        let last = 0;
        TERM_PATTERN.lastIndex = 0;
        for (let match = TERM_PATTERN.exec(text); match; match = TERM_PATTERN.exec(text)) {
            const [, before, word] = match;
            const id = formToId.get(normalize(word));
            if (!id || seen.has(id)) continue;
            seen.add(id);
            const start = match.index + before.length;
            fragment.append(text.slice(last, start), termButton(doc, id, word));
            last = start + word.length;
        }
        if (last === 0) return;
        fragment.append(text.slice(last));
        node.replaceWith(fragment);
    };

    const walk = (parent: Node) => {
        for (const child of [...parent.childNodes]) {
            if (child.nodeType === Node.TEXT_NODE) {
                glossText(child as Text);
                continue;
            }
            if (child.nodeType !== Node.ELEMENT_NODE) continue;
            const element = child as Element;
            const markedId = element.getAttribute('data-term');
            if (markedId !== null) {
                if (getGlossaryEntry(markedId) && !seen.has(markedId)) {
                    seen.add(markedId);
                    element.replaceWith(termButton(doc, markedId, element.textContent ?? ''));
                }
                continue;
            }
            if (!element.matches(SKIP)) walk(element);
        }
    };

    walk(template.content);
    return template.innerHTML;
}

/** Plain text (a rule of the card) as HTML that is safe to gloss. */
export function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
