import { describe, expect, it } from 'vitest';
import { escapeHtml, glossify } from './glossify';

const terms = (html: string) => {
    const box = document.createElement('div');
    box.innerHTML = html;
    return [...box.querySelectorAll<HTMLButtonElement>('button.gloss-term')].map(b => [b.dataset.term, b.textContent]);
};

describe('glossify', () => {
    it('turns the grammar terms of a sentence into buttons, keeping the text', () => {
        const html = '<p>Van solo con sustantivos singulares que se pueden contar.</p>';
        const out = glossify(html);
        expect(terms(out)).toEqual([
            ['sustantivo', 'sustantivos'],
            ['singular', 'singulares'],
            ['contable', 'que se pueden contar'],
        ]);
        const box = document.createElement('div');
        box.innerHTML = out;
        expect(box.textContent).toBe('Van solo con sustantivos singulares que se pueden contar.');
    });

    it('glosses only the first mention of each term, across calls that share the same set', () => {
        const seen = new Set<string>();
        expect(terms(glossify('<p>El sujeto va antes. Sin sujeto no hay oración.</p>', seen))).toEqual([['sujeto', 'sujeto']]);
        expect(terms(glossify('Siempre pon sujeto', seen))).toEqual([]);
    });

    it('prefers the longest term and keeps the original capitals', () => {
        expect(terms(glossify('<p>El Verbo auxiliar ayuda.</p>'))).toEqual([['verbo-auxiliar', 'Verbo auxiliar']]);
    });

    it('matches whole words only', () => {
        expect(terms(glossify('<p>Subjetivo, vocalista, pluralidad.</p>'))).toEqual([]);
    });

    it('leaves headings, crossed-out mistakes and code alone', () => {
        const html = '<h3>El sujeto</h3><p><s>Is cold</s> <code>verbo</code></p><p>Falta el sujeto.</p>';
        expect(terms(glossify(html))).toEqual([['sujeto', 'sujeto']]);
    });

    it('glosses a phrase marked by hand, and drops a mark with an unknown term', () => {
        const html = '<p><span data-term="contable">una cosa que cuentas</span> y <span data-term="nada">otra</span></p>';
        const out = glossify(html);
        expect(terms(out)).toEqual([['contable', 'una cosa que cuentas']]);
        expect(out).toContain('<span data-term="nada">otra</span>');
    });

    it('marks every term as a closed dialog button', () => {
        const box = document.createElement('div');
        box.innerHTML = glossify('<p>El adjetivo describe.</p>');
        const button = box.querySelector('button')!;
        expect(button.type).toBe('button');
        expect(button.getAttribute('aria-haspopup')).toBe('dialog');
        expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('treats plain text as text', () => {
        const out = glossify(escapeHtml('Usa <b> con el sujeto & listo'));
        expect(out).toContain('&lt;b&gt;');
        expect(terms(out)).toEqual([['sujeto', 'sujeto']]);
    });
});
