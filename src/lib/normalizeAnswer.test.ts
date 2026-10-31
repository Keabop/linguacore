import { describe, expect, it } from 'vitest';
import { answersMatch, normalizeAnswer } from './normalizeAnswer';

describe('answersMatch', () => {
    it('ignores case, extra spaces and the final punctuation', () => {
        expect(answersMatch('  She   WORKS here! ', 'She works here.')).toBe(true);
    });

    it('accepts a contraction written out, and the other way round', () => {
        expect(answersMatch("I don't like it", 'I do not like it')).toBe(true);
        expect(answersMatch('She is not here', "She isn't here")).toBe(true);
        expect(answersMatch("can't", 'cannot')).toBe(true);
    });

    it('accepts the curly apostrophe that phone keyboards type', () => {
        expect(answersMatch('don’t', "don't")).toBe(true);
        expect(answersMatch('I’m tired', 'I am tired')).toBe(true);
    });

    it('still tells different answers apart', () => {
        expect(answersMatch('He work here', 'He works here')).toBe(false);
        expect(answersMatch('does', "doesn't")).toBe(false);
    });
});

describe('normalizeAnswer', () => {
    it('keeps punctuation inside the sentence', () => {
        expect(normalizeAnswer('No, he is never late.')).toBe('no, he is never late');
    });
});
