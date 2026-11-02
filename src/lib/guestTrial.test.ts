import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => {
    const calls: { table: string; op: string; rows: unknown; options?: unknown }[] = [];
    const profile = { current_level: 'A1', unlocked_levels: ['A1'] };
    const from = (table: string) => ({
        upsert: (rows: unknown, options: unknown) => { calls.push({ table, op: 'upsert', rows, options }); return Promise.resolve({ error: null }); },
        update: (rows: unknown) => ({ eq: () => { calls.push({ table, op: 'update', rows }); return Promise.resolve({ error: null }); } }),
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { ...profile, total_words_learned: 0 }, error: null }) }) }),
    });
    return { calls, profile, supabase: { from, auth: { updateUser: vi.fn(() => Promise.resolve({ error: null })) } } };
});
vi.mock('./supabase', () => ({ supabase: db.supabase }));
vi.mock('../data/levels', () => ({
    loadLevel: () => Promise.resolve({ stories: [{ id: 'a1-001', content: '<p><span data-word="name">name</span> <span data-word="hello">hello</span></p>' }] }),
}));

const { clearGuest, levelsUpTo, loadGuest, saveGuestPlacement, saveGuestStory } = await import('./guestTrial');
const { importGuest } = await import('./guestImport');

beforeEach(() => {
    clearGuest();
    db.calls.length = 0;
    db.profile.current_level = 'A1';
    db.profile.unlocked_levels = ['A1'];
});

describe('guest trial storage', () => {
    it('keeps the story and the placement together', () => {
        expect(loadGuest()).toBeNull();
        saveGuestStory('a1-001', ['name', 'city'], ['hello']);
        saveGuestPlacement('A2');
        expect(loadGuest()).toMatchObject({ story: { id: 'a1-001', deck: ['name', 'city'], known: ['hello'] }, placement: 'A2' });
    });

    it('drops what the app would not have written', () => {
        localStorage.setItem('voxie.guest', JSON.stringify({ story: { id: 'b2-001', deck: ['x'], known: [], completedAt: 'now' }, placement: 'C2' }));
        expect(loadGuest()).toBeNull();
        localStorage.setItem('voxie.guest', JSON.stringify({ story: { id: 'a1-001', deck: 'name', known: [], completedAt: 'now' } }));
        expect(loadGuest()).toBeNull();
        localStorage.setItem('voxie.guest', '{not json');
        expect(loadGuest()).toBeNull();
    });

    it('places above B2 at B2, the highest level Voxie teaches', () => {
        saveGuestPlacement('C1');
        expect(loadGuest()?.placement).toBe('B2');
    });

    it('opens the placed level and every one below it', () => {
        expect(levelsUpTo('B1', ['A1'])).toEqual(['A1', 'A2', 'B1']);
        expect(levelsUpTo('A1', ['A1', 'A2', 'B1'])).toEqual(['A1', 'A2', 'B1']);
    });
});

describe('importGuest', () => {
    it('saves only the story words, the read story and the level, skipping what is already there', async () => {
        await importGuest('user-1', {
            story: { id: 'a1-001', deck: ['name', 'invented'], known: ['hello'], completedAt: '2026-11-02T20:00:00.000Z' },
            placement: 'A2',
        });
        const byTable = Object.fromEntries(db.calls.map(c => [c.table + ':' + c.op, c]));
        expect(byTable['cards:upsert'].options).toMatchObject({ onConflict: 'user_id,word_id', ignoreDuplicates: true });
        expect(byTable['cards:upsert'].rows).toEqual([expect.objectContaining({ user_id: 'user-1', word_id: 'name', story_id: 'a1-001' })]);
        expect(byTable['known_words:upsert'].rows).toEqual([expect.objectContaining({ word_id: 'hello' })]);
        expect(byTable['read_stories:upsert'].options).toMatchObject({ ignoreDuplicates: true });
        expect(db.calls.filter(c => c.table === 'profiles').map(c => c.rows)).toEqual([
            { total_words_learned: 2 },
            { current_level: 'A2', unlocked_levels: ['A1', 'A2'] },
        ]);
        expect(db.supabase.auth.updateUser).toHaveBeenCalledWith({ data: { came_from_trial: true } });
    });

    it('never moves a learner down to a lower placed level', async () => {
        db.profile.current_level = 'B1';
        db.profile.unlocked_levels = ['A1', 'A2', 'B1'];
        await importGuest('user-1', { placement: 'A2' });
        expect(db.calls.find(c => c.table === 'profiles')?.rows).toEqual({ current_level: 'B1', unlocked_levels: ['A1', 'A2', 'B1'] });
    });
});
