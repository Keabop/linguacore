import type { DialogueLine } from './exam/types';
import { AUDIO_MANIFEST } from '../data/audio/manifest';

// Names of the pre-generated audio files (npm run content:audio): a hash of what is said, by
// whom and how fast, so a file is regenerated whenever its script or story changes.

export interface AudioEntry {
    src: string;
    /** Stories: the second at which each sentence starts. */
    sentences?: number[];
}

/** FNV-1a, 32 bits, in hex. */
export function audioKey(parts: string[]): string {
    let hash = 0x811c9dc5;
    for (const ch of parts.join('\n')) {
        hash ^= ch.codePointAt(0)!;
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
}

export const dialogueKey = (lines: DialogueLine[], rate: number) =>
    audioKey(['dialogue', String(rate), ...lines.map(l => `${l.speaker}|${l.accent}|${l.gender}|${l.text}`)]);

export const storyKey = (sentences: string[], rate: number) => audioKey(['story', 'US', String(rate), ...sentences]);

export const audioFor = (key: string): AudioEntry | undefined => AUDIO_MANIFEST[key];

/** Name of the service worker's cache for recordings (vite.config.ts). */
export const AUDIO_CACHE = 'audio-cache';

/**
 * Saves the whole file in the recordings' cache. <audio> asks for byte ranges (206), which the
 * service worker can't store; with the full file there, it answers those ranges offline.
 */
export function keepForOffline(src: string) {
    if (typeof caches === 'undefined') return;
    caches.open(AUDIO_CACHE)
        .then(cache => cache.match(src).then(hit => (hit ? undefined : cache.add(src))))
        .catch(() => { /* no space or no network: it plays online only */ });
}
