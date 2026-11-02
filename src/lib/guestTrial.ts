import type { CEFRLevel } from './database.types';

/**
 * What a visitor does before creating an account: one story read (the words marked in it) and
 * the placement test. It waits in this browser and moves to a new account on its first sign-in
 * (components/GuestImporter, lib/guestImport).
 */

const KEY = 'voxie.guest';
export const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
/** More marks than the trial story has words means the data was not written by the app. */
const MAX_WORDS = 60;

/** The story a visitor can read without an account. */
export const TRIAL_STORY_ID = 'a1-001';

export interface GuestTrial {
    story?: { id: string; deck: string[]; known: string[]; completedAt: string };
    placement?: CEFRLevel;
}

const wordList = (value: unknown): string[] | null =>
    Array.isArray(value) && value.length <= MAX_WORDS && value.every(w => typeof w === 'string' && w.length <= 40)
        ? [...new Set(value as string[])]
        : null;

/** The trial waiting in this browser, or null. Anything the app would not have written is dropped. */
export function loadGuest(): GuestTrial | null {
    let raw: unknown;
    try {
        raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    } catch {
        return null;
    }
    if (!raw || typeof raw !== 'object') return null;
    const { story, placement } = raw as Record<string, any>;
    const trial: GuestTrial = {};
    if (story && story.id === TRIAL_STORY_ID && typeof story.completedAt === 'string') {
        const deck = wordList(story.deck);
        const known = wordList(story.known);
        if (deck && known) trial.story = { id: story.id, deck, known: known.filter(w => !deck.includes(w)), completedAt: story.completedAt };
    }
    if (LEVELS.includes(placement)) trial.placement = placement;
    return trial.story || trial.placement ? trial : null;
}

function saveGuest(change: Partial<GuestTrial>) {
    try {
        localStorage.setItem(KEY, JSON.stringify({ ...loadGuest(), ...change }));
    } catch {
        // Private mode or blocked storage: the trial still works, it just isn't kept
    }
}

export function saveGuestStory(id: string, deck: string[], known: string[]) {
    saveGuest({ story: { id, deck, known, completedAt: new Date().toISOString() } });
}

/** The placement test can place above B2; Voxie teaches up to B2. */
export function teachableLevel(level: string): CEFRLevel {
    return LEVELS.includes(level as CEFRLevel) ? level as CEFRLevel : 'B2';
}

export function saveGuestPlacement(level: string) {
    saveGuest({ placement: teachableLevel(level) });
}

export function clearGuest() {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // Nothing to clear
    }
}

/** The levels a placement opens: that one and every one below it, added to those already open. */
export function levelsUpTo(placement: CEFRLevel, unlocked: CEFRLevel[]): CEFRLevel[] {
    const upTo = LEVELS.slice(0, LEVELS.indexOf(placement) + 1);
    return LEVELS.filter(l => upTo.includes(l) || unlocked.includes(l));
}
