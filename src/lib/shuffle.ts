/** Fisher–Yates shuffle; returns a new array. (`sort(() => Math.random() - 0.5)` is biased.) */
export function shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/** Shuffles the options of an index-keyed question and moves the correct index with them. */
export function shuffleQuestion<T extends { options: string[]; correctIndex: number }>(question: T): T {
    const order = shuffle(question.options.map((_, i) => i));
    return {
        ...question,
        options: order.map(i => question.options[i]),
        correctIndex: order.indexOf(question.correctIndex),
    };
}
