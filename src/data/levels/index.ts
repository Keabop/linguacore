// The lesson content of each level (grammar, exercises, review skills, writing and speaking
// prompts, stories), loaded on demand: a screen downloads only the level it shows. The service
// worker precaches every level, so this works offline too. Tests and scripts keep using the
// whole set from `src/data/index.ts`; app code doesn't (src/data/content.test.ts checks it).
import { useEffect, useState } from 'react';
import type { GrammarCard, GrammarExercise, GrammarSkill, SpeakingPrompt, Story, WritingPrompt } from '../../lib/db';

export interface LevelContent {
    grammarCards: GrammarCard[];
    exercises: GrammarExercise[];
    skills: GrammarSkill[];
    writingPrompts: WritingPrompt[];
    speakingPrompts: SpeakingPrompt[];
    stories: Story[];
}

export type ContentLevel = 'A1' | 'A2' | 'B1' | 'B2';

const loaders: Record<ContentLevel, () => Promise<{ default: LevelContent }>> = {
    A1: () => import('./a1'),
    A2: () => import('./a2'),
    B1: () => import('./b1'),
    B2: () => import('./b2'),
};

/** The level of a unit, story or skill id ("a1-u3", "a2-004", "b1-u2-s1"), or null. */
export function levelOfId(id: string | undefined): ContentLevel | null {
    const level = id?.slice(0, 2).toUpperCase();
    return level && level in loaders ? level as ContentLevel : null;
}

const loaded = new Map<ContentLevel, LevelContent>();
const loading = new Map<ContentLevel, Promise<LevelContent>>();

export function loadLevel(level: ContentLevel): Promise<LevelContent> {
    const hit = loaded.get(level);
    if (hit) return Promise.resolve(hit);
    let promise = loading.get(level);
    if (!promise) {
        promise = loaders[level]().then(m => {
            loaded.set(level, m.default);
            return m.default;
        });
        // A failed download (offline before the service worker cached it) is tried again next time
        promise.catch(() => loading.delete(level));
        loading.set(level, promise);
    }
    return promise;
}

/** The content of a level once loaded (null while it loads, or with no level). */
export function useLevelContent(level: ContentLevel | null): LevelContent | null {
    const [state, setState] = useState<{ level: ContentLevel; content: LevelContent } | null>(null);
    useEffect(() => {
        if (!level || loaded.has(level)) return;
        let alive = true;
        loadLevel(level).then(content => { if (alive) setState({ level, content }); }, () => {});
        return () => { alive = false; };
    }, [level]);
    if (!level) return null;
    return loaded.get(level) ?? (state?.level === level ? state.content : null);
}

/** The content of several levels, once all of them are loaded (null until then). */
export function useLevelsContent(levels: ContentLevel[]): LevelContent[] | null {
    const key = [...new Set(levels)].sort().join(',');
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!key) return;
        let alive = true;
        Promise.all(key.split(',').map(l => loadLevel(l as ContentLevel))).then(() => { if (alive) setTick(t => t + 1); }, () => {});
        return () => { alive = false; };
    }, [key]);
    if (!key) return [];
    const all = key.split(',').map(l => loaded.get(l as ContentLevel));
    return all.every(Boolean) ? all as LevelContent[] : null;
}
