import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Card, CardState } from '../lib/db';
import { createNewCard, calculateNextReview, Rating } from '../lib/fsrs';
import { useCallback } from 'react';

/**
 * Hook to manage flashcard operations:
 * - Get due cards for review
 * - Add new cards from story reader
 * - Process review ratings
 */
export function useCards() {
    // Get all cards due for review (due date <= now)
    const dueCards = useLiveQuery(async () => {
        const now = new Date();
        return db.cards
            .where('due')
            .belowOrEqual(now)
            .toArray();
    }, []);

    // Get total card count
    const totalCards = useLiveQuery(() => db.cards.count(), []);

    // Check if a word is already in the deck
    const isWordInDeck = useCallback(async (wordId: string): Promise<boolean> => {
        const card = await db.cards.where('wordId').equals(wordId).first();
        return !!card;
    }, []);

    // Check if a word is marked as already known
    const isWordKnown = useCallback(async (wordId: string): Promise<boolean> => {
        const known = await db.knownWords.get(wordId);
        return !!known;
    }, []);

    // Add a new word to the review deck
    const addCard = useCallback(async (wordId: string, storyId: string) => {
        const exists = await isWordInDeck(wordId);
        if (exists) return false;

        const cardData = createNewCard(wordId, storyId);
        const id = `${wordId}-${Date.now()}`;
        await db.cards.add({ ...cardData, id } as Card);

        // Update user's word count
        const vocab = await db.vocabulary.get(wordId);
        if (vocab) {
            const user = await db.users.toCollection().first();
            if (user && user.id !== undefined) {
                const level = vocab.cefrLevel;
                await db.users.update(user.id, (u: any) => {
                    u.totalWordsLearned = (u.totalWordsLearned || 0) + 1;
                    if (!u.levelProgress[level]) u.levelProgress[level] = { words: 0, stories: 0, retention: 0 };
                    u.levelProgress[level].words = (u.levelProgress[level].words || 0) + 1;
                });
            }
        }

        return true;
    }, [isWordInDeck]);

    // Mark a word as already known (counts for progression, no flashcard)
    const markAsKnown = useCallback(async (wordId: string) => {
        const alreadyKnown = await isWordKnown(wordId);
        const alreadyInDeck = await isWordInDeck(wordId);
        if (alreadyKnown || alreadyInDeck) return false;

        // Store in knownWords table
        await db.knownWords.add({ wordId, knownAt: new Date() });

        // Update user's word count (same as adding a card)
        const vocab = await db.vocabulary.get(wordId);
        if (vocab) {
            const user = await db.users.toCollection().first();
            if (user && user.id !== undefined) {
                const level = vocab.cefrLevel;
                await db.users.update(user.id, (u: any) => {
                    u.totalWordsLearned = (u.totalWordsLearned || 0) + 1;
                    if (!u.levelProgress[level]) u.levelProgress[level] = { words: 0, stories: 0, retention: 0 };
                    u.levelProgress[level].words = (u.levelProgress[level].words || 0) + 1;
                });
            }
        }

        return true;
    }, [isWordInDeck, isWordKnown]);

    // Process a review rating
    const reviewCard = useCallback(async (card: Card, rating: Rating) => {
        const updates = calculateNextReview(card, rating);
        await db.cards.update(card.id, updates);

        // Update study streak
        const user = await db.users.toCollection().first();
        if (user && user.id !== undefined) {
            const today = new Date().toISOString().split('T')[0];
            if (user.lastStudyDate !== today) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                const newStreak = user.lastStudyDate === yesterday ? user.streak + 1 : 1;
                await db.users.update(user.id, {
                    streak: newStreak,
                    lastStudyDate: today,
                });
            }
        }

        return updates;
    }, []);

    return {
        dueCards: dueCards ?? [],
        totalCards: totalCards ?? 0,
        isWordInDeck,
        isWordKnown,
        addCard,
        markAsKnown,
        reviewCard,
    };
}
