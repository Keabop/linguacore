// Vocabulary cards loaded by level: a screen downloads the decks of the words it shows, found
// through a small index of ids (wordLevels.ts), instead of the ~3,000 cards of every level.
// Tests and scripts keep using the whole set from ./index.ts; app code doesn't.
import { useEffect, useState } from 'react';
import type { Vocabulary } from '../../lib/db';
import type { ContentLevel } from '../levels';
import { vocabularyAliases } from './aliases';
import { WORD_IDS } from './wordLevels';

const loaders: Record<ContentLevel, () => Promise<{ default: Vocabulary[] }>> = {
    A1: () => import('./decks/a1'),
    A2: () => import('./decks/a2'),
    B1: () => import('./decks/b1'),
    B2: () => import('./decks/b2'),
};

let levelById: Map<string, ContentLevel> | null = null;

/** A card id as it is now (an old, inflected id maps to its current card). */
const current = (id: string) => vocabularyAliases[id] ?? id;

/** The level of a card, or null for a word that isn't in any deck (a custom word). */
export function levelOfWord(id: string): ContentLevel | null {
    levelById ??= new Map(Object.entries(WORD_IDS).flatMap(([level, ids]) => ids.split('|').map(w => [w, level as ContentLevel])));
    return levelById.get(current(id)) ?? null;
}

const decks = new Map<ContentLevel, Map<string, Vocabulary>>();
const loading = new Map<ContentLevel, Promise<void>>();

function loadDeck(level: ContentLevel): Promise<void> {
    if (decks.has(level)) return Promise.resolve();
    let promise = loading.get(level);
    if (!promise) {
        promise = loaders[level]().then(m => { decks.set(level, new Map(m.default.map(v => [v.id, v]))); });
        // A failed download (offline before the service worker cached it) is tried again next time
        promise.catch(() => loading.delete(level));
        loading.set(level, promise);
    }
    return promise;
}

export interface VocabularyLookup {
    /** A card by its id (or its old id), if its deck is loaded. */
    get: (id: string) => Vocabulary | undefined;
    /** Cards keyed by the ids asked for. */
    map: (ids: string[]) => Map<string, Vocabulary>;
    /** Every card of the loaded decks taught in a unit. */
    unitDeck: (unitId: string) => Vocabulary[];
}

const lookup: VocabularyLookup = {
    get: id => {
        const level = levelOfWord(id);
        return level ? decks.get(level)?.get(current(id)) : undefined;
    },
    map: ids => {
        const out = new Map<string, Vocabulary>();
        for (const id of ids) {
            const v = lookup.get(id);
            if (v) out.set(id, v);
        }
        return out;
    },
    unitDeck: unitId => [...decks.values()].flatMap(d => [...d.values()].filter(v => v.unitId === unitId)),
};

const levelsOf = (ids: string[], extra: ContentLevel[]) =>
    [...new Set([...ids.map(levelOfWord).filter((l): l is ContentLevel => !!l), ...extra])].sort();

/** Loads the decks of these words (and of any extra levels), then answers lookups. */
export async function loadVocabulary(ids: string[], extra: ContentLevel[] = []): Promise<VocabularyLookup> {
    await Promise.all(levelsOf(ids, extra).map(loadDeck));
    return lookup;
}

/**
 * Lookups once the decks of these words (and of any extra levels) are loaded; null until then.
 * A failed download is thrown, so the screen's error boundary offers to reload.
 */
export function useVocabulary(ids: string[], extra: ContentLevel[] = []): VocabularyLookup | null {
    const levels = levelsOf(ids, extra);
    const key = levels.join(',');
    const [failure, setFailure] = useState<{ key: string; error: unknown } | null>(null);
    const [, setTick] = useState(0);
    useEffect(() => {
        const wanted = key ? key.split(',') as ContentLevel[] : [];
        if (wanted.every(l => decks.has(l))) return;
        let alive = true;
        Promise.all(wanted.map(loadDeck)).then(
            () => { if (alive) setTick(t => t + 1); },
            error => { if (alive) setFailure({ key, error }); },
        );
        return () => { alive = false; };
    }, [key]);
    if (failure?.key === key) throw failure.error;
    return levels.every(l => decks.has(l)) ? lookup : null;
}
