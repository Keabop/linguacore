import type { GrammarCard, GrammarExercise } from './db';
import { shuffle } from './shuffle';

/** An English sentence and its Spanish, as the grammar cards write their examples («I am → Yo soy»). */
export interface Pair {
    en: string;
    es: string;
}

export function examplePairs(card: GrammarCard | undefined): Pair[] {
    return (card?.examples ?? []).flatMap(example => {
        const [en, es] = example.split(' → ');
        return en?.trim() && es?.trim() ? [{ en: en.trim(), es: es.trim() }] : [];
    });
}

const others = (pairs: Pair[], pair: Pair, key: keyof Pair, count: number) =>
    shuffle(pairs.filter(p => p[key] !== pair[key]).map(p => p[key])).slice(0, count);

/**
 * Exercises that ask to understand, not to copy a pattern: what an English sentence means, and
 * which sentence was heard. Made from pairs (a grammar card's examples, a lesson's phrases), each
 * with two wrong options from the same set, so every unit has them without new content.
 */
export function comprehensionExercises(pairs: Pair[], unitId: string, count = { meaning: 2, listen: 2 }): GrammarExercise[] {
    if (pairs.length < 3) return [];
    const picked = shuffle(pairs);
    const meaning = picked.slice(0, count.meaning).map((pair, i): GrammarExercise => ({
        id: `${unitId}-meaning-${i}`,
        unitId,
        type: 'meaning-choice',
        question: pair.en,
        correctAnswer: pair.es,
        options: [pair.es, ...others(pairs, pair, 'es', 2)],
        explanation: `«${pair.en}» = «${pair.es}».`,
    }));
    const listen = picked.slice(count.meaning, count.meaning + count.listen).map((pair, i): GrammarExercise => ({
        id: `${unitId}-listen-${i}`,
        unitId,
        type: 'listen-choice',
        question: pair.en,
        correctAnswer: pair.en,
        options: [pair.en, ...others(pairs, pair, 'en', 2)],
        explanation: `Se oye «${pair.en}»: ${pair.es}.`,
        meaning: pair.es,
    }));
    return [...meaning, ...listen];
}

/** A sentence to write: built from its shuffled words, or with `blank` typed into its gap. */
export interface GuidedSentence {
    en: string;
    es: string;
    /** The one word to type; without it the sentence is put in order. */
    blank?: string;
}

/**
 * Guided writing for whoever starts: the Spanish says what to write, and the English is either put
 * in order from its own words or completed with the one word missing. Graded on the device, no AI.
 */
export function guidedWritingExercises(sentences: GuidedSentence[], unitId: string): GrammarExercise[] {
    return sentences.map((sentence, i): GrammarExercise => sentence.blank
        ? {
            id: `${unitId}-write-${i}`,
            unitId,
            type: 'fill-blank',
            question: `${sentence.en.replace(new RegExp(`\\b${sentence.blank}\\b`), '___')} (${sentence.es})`,
            correctAnswer: sentence.blank,
            explanation: `«${sentence.en}» = «${sentence.es}».`,
        }
        : {
            id: `${unitId}-write-${i}`,
            unitId,
            type: 'word-order',
            question: `Escríbelo en inglés: «${sentence.es}»`,
            correctAnswer: sentence.en,
            scrambledWords: shuffle(sentence.en.split(' ')),
            explanation: `«${sentence.es}» = «${sentence.en}».`,
        });
}
