import { db } from './db';

/**
 * Seed the database with initial data on first launch.
 * Only seeds if the database is empty (no user exists).
 *
 * Data modules (stories, vocabulary) are dynamically imported so they
 * are split into a separate chunk and only downloaded on the very first
 * visit when the DB is empty.
 *
 * Curriculum data is seeded separately so that existing users
 * (created before curriculum was added) also receive it.
 */
export async function seedDatabase(): Promise<void> {
    const userCount = await db.users.count();
    if (userCount === 0) {
        // Create default user
        await db.users.add({
            currentLevel: 'A1',
            unlockedLevels: ['A1'],
            createdAt: new Date(),
            totalWordsLearned: 0,
            streak: 0,
            lastStudyDate: null,
            levelProgress: {
                A1: { words: 0, stories: 0, retention: 0 },
                A2: { words: 0, stories: 0, retention: 0 },
                B1: { words: 0, stories: 0, retention: 0 },
                B2: { words: 0, stories: 0, retention: 0 },
            },
        });

        // Dynamically import data only when seeding is needed (first visit)
        const [{ storiesData }, { vocabularyData }] = await Promise.all([
            import('../data/stories'),
            import('../data/vocabulary'),
        ]);

        // Seed stories
        await db.stories.bulkAdd(storiesData);

        // Seed vocabulary
        await db.vocabulary.bulkAdd(vocabularyData);

        console.log('✅ LinguaCore database seeded successfully');
    }

    // Seed curriculum data separately — even existing users may need it
    const unitCount = await db.units.count();
    if (unitCount === 0) {
        const {
            a1Units, a1GrammarCards, a1Exercises,
            a2Units, a2GrammarCards, a2Exercises,
            b1Units, b1GrammarCards, b1Exercises,
            b2Units, b2GrammarCards, b2Exercises,
        } = await import('../data/curriculum');

        await db.units.bulkAdd([...a1Units, ...a2Units, ...b1Units, ...b2Units]);
        await db.grammarCards.bulkAdd([...a1GrammarCards, ...a2GrammarCards, ...b1GrammarCards, ...b2GrammarCards]);
        await db.grammarExercises.bulkAdd([...a1Exercises, ...a2Exercises, ...b1Exercises, ...b2Exercises]);
        console.log('✅ Curriculum seeded successfully (A1-B2)');
    }
}
