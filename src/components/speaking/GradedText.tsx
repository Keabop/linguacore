import { Fragment } from 'react';

/** How read-aloud answers are compared: lower case, letters and digits only. */
export const normalizeSpeech = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

interface GradedTextProps {
    /** The text as written. */
    text: string;
    /** One entry per compared word of `normalizeSpeech(text)`: true when it was said right. */
    matches: boolean[];
}

/**
 * The text to read, as written, with each word green or red. The words keep real spaces between
 * them, so a long sentence wraps instead of widening the page.
 */
export default function GradedText({ text, matches }: GradedTextProps) {
    let next = 0;
    // A word that normalizes to nothing (a lone «—») is shown but not graded
    const words = text.trim().split(/\s+/).map(word => ({ word, matchIndex: normalizeSpeech(word) ? next++ : null }));
    return (
        <p className="text-lg leading-relaxed font-medium break-words">
            {words.map(({ word, matchIndex }, i) => {
                const tone = matchIndex === null ? 'text-[var(--color-on-surface)]' : matches[matchIndex] ? 'text-[var(--color-success)]' : 'text-accent-red underline decoration-wavy';
                return (
                    <Fragment key={i}>
                        {i > 0 && ' '}
                        <span className={tone}>{word}</span>
                    </Fragment>
                );
            })}
        </p>
    );
}
