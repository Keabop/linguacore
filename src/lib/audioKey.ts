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
