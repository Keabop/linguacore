import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';
import { seedDatabase } from './seed';

beforeEach(async () => {
    // Clear all tables before each test
    await db.delete();
    await db.open();
});

describe('seedDatabase', () => {
    it('creates exactly 1 user on empty DB', async () => {
        await seedDatabase();
        const count = await db.users.count();
        expect(count).toBe(1);
    });

    it('does not duplicate user on second call', async () => {
        await seedDatabase();
        await seedDatabase();
        const count = await db.users.count();
        expect(count).toBe(1);
    });

    it('seeds units on first call', async () => {
        await seedDatabase();
        const count = await db.units.count();
        expect(count).toBeGreaterThan(0);
    });

    it('seeds stories on first call', async () => {
        await seedDatabase();
        const count = await db.stories.count();
        expect(count).toBeGreaterThan(0);
    });

    it('does not duplicate units on second call', async () => {
        await seedDatabase();
        const first = await db.units.count();
        await seedDatabase();
        const second = await db.units.count();
        expect(second).toBe(first);
    });

    it('does not duplicate stories on second call', async () => {
        await seedDatabase();
        const first = await db.stories.count();
        await seedDatabase();
        const second = await db.stories.count();
        expect(second).toBe(first);
    });

    it('seeds writing prompts', async () => {
        await seedDatabase();
        const count = await db.writingPrompts.count();
        expect(count).toBeGreaterThan(0);
    });

    it('does not duplicate writing prompts on second call', async () => {
        await seedDatabase();
        const first = await db.writingPrompts.count();
        await seedDatabase();
        const second = await db.writingPrompts.count();
        expect(second).toBe(first);
    });
});
