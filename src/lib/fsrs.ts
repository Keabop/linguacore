import { type Card, CardState } from './db';

// FSRS-4.5 Parameters (Jarrett Ye et al., 2023)
// Default weight parameters for the FSRS algorithm
const FSRS_PARAMS = {
    w: [
        0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01,
        1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61
    ],
    requestRetention: 0.9,  // 90% target retention
    maximumInterval: 365,   // max days between reviews
};

// Rating enum matching FSRS spec
export enum Rating {
    Again = 1,
    Hard = 2,
    Good = 3,
    Easy = 4,
}

/**
 * Create a new card with default FSRS values.
 * Called when a user taps a word to add it to their review deck.
 */
export function createNewCard(wordId: string, storyId: string): Omit<Card, 'id'> {
    return {
        wordId,
        storyId,
        state: CardState.New,
        due: new Date(), // due immediately for first review
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
    };
}

/**
 * Calculate initial difficulty from first rating.
 * D0(G) = w4 - e^(w5*(G-1)) + 1
 * where G is the rating (1-4)
 */
function initDifficulty(rating: Rating): number {
    const w = FSRS_PARAMS.w;
    const d = w[4] - Math.exp(w[5] * (rating - 1)) + 1;
    return clamp(d, 1, 10);
}

/**
 * Calculate initial stability from first rating.
 * S0(G) = w[G-1]  (uses first 4 weights as initial stability values)
 */
function initStability(rating: Rating): number {
    return Math.max(FSRS_PARAMS.w[rating - 1], 0.1);
}

/**
 * Update difficulty after a review.
 * D'(D,G) = w6 · D0(3) + (1 - w6) · (D - w7 · (G - 3))
 * Mean reversion toward D0(3) prevents extreme values.
 */
function nextDifficulty(d: number, rating: Rating): number {
    const w = FSRS_PARAMS.w;
    const d0G3 = initDifficulty(Rating.Good); // mean reversion target
    const newD = w[6] * d0G3 + (1 - w[6]) * (d - w[7] * (rating - 3));
    return clamp(newD, 1, 10);
}

/**
 * Calculate retrievability (probability of recall) given elapsed days and stability.
 * R(t,S) = (1 + t/(9*S))^(-1)
 */
function retrievability(elapsedDays: number, stability: number): number {
    if (stability <= 0) return 0;
    return Math.pow(1 + elapsedDays / (9 * stability), -1);
}

/**
 * Calculate new stability after a successful recall.
 * S'_r(D,S,R,G) = S · (e^(w8) · (11-D) · S^(-w9) · (e^(w10·(1-R)) - 1) · hardPenalty · easyBonus + 1)
 */
function nextRecallStability(
    d: number,
    s: number,
    r: number,
    rating: Rating
): number {
    const w = FSRS_PARAMS.w;
    const hardPenalty = rating === Rating.Hard ? w[15] : 1;
    const easyBonus = rating === Rating.Easy ? w[16] : 1;

    const newS = s * (
        Math.exp(w[8]) *
        (11 - d) *
        Math.pow(s, -w[9]) *
        (Math.exp(w[10] * (1 - r)) - 1) *
        hardPenalty *
        easyBonus +
        1
    );

    return Math.max(newS, 0.1);
}

/**
 * Calculate new stability after forgetting (lapse).
 * S'_f(D,S,R) = w11 · D^(-w12) · ((S+1)^(w13) - 1) · e^(w14·(1-R))
 */
function nextForgetStability(d: number, s: number, r: number): number {
    const w = FSRS_PARAMS.w;
    const newS = w[11] *
        Math.pow(d, -w[12]) *
        (Math.pow(s + 1, w[13]) - 1) *
        Math.exp(w[14] * (1 - r));
    return Math.max(newS, 0.1);
}

/**
 * Calculate the next interval in days from stability.
 * I(S, R_desired) = 9 · S · (1/R_desired - 1)
 */
function nextInterval(stability: number): number {
    const { requestRetention, maximumInterval } = FSRS_PARAMS;
    const interval = 9 * stability * (1 / requestRetention - 1);
    return Math.min(Math.max(Math.round(interval), 1), maximumInterval);
}

/**
 * Main FSRS function: calculate the next review state for a card.
 * 
 * @param card - The current card state
 * @param rating - User's rating (1=Again, 2=Hard, 3=Good, 4=Easy)
 * @returns Updated card fields
 */
export function calculateNextReview(
    card: Card,
    rating: Rating
): Partial<Card> {
    const now = new Date();
    const { state, stability, difficulty } = card;

    // Calculate elapsed days since last review
    const elapsed = card.lastReview
        ? (now.getTime() - new Date(card.lastReview).getTime()) / 86400000
        : 0;

    let newStability: number;
    let newDifficulty: number;
    let newState: CardState;

    if (state === CardState.New) {
        // First review: initialize stability and difficulty
        newStability = initStability(rating);
        newDifficulty = initDifficulty(rating);
        newState = rating === Rating.Again ? CardState.Learning : CardState.Review;
    } else {
        // Subsequent reviews
        newDifficulty = nextDifficulty(difficulty, rating);
        const r = retrievability(elapsed, stability);

        if (rating === Rating.Again) {
            // Card forgotten → lapse
            newStability = nextForgetStability(newDifficulty, stability, r);
            newState = CardState.Relearning;
        } else {
            // Card recalled successfully
            newStability = nextRecallStability(newDifficulty, stability, r, rating);
            newState = CardState.Review;
        }
    }

    // Calculate next interval
    let interval: number;
    if (newState === CardState.Learning || newState === CardState.Relearning) {
        // Short intervals for learning/relearning cards
        interval = rating === Rating.Again ? 0 : // Due in same session
            rating === Rating.Hard ? 0 :   // Due in same session
                1;                              // Due tomorrow
    } else {
        interval = nextInterval(newStability);
    }

    const dueDate = new Date(now.getTime() + interval * 86400000);

    return {
        stability: newStability,
        difficulty: newDifficulty,
        state: newState,
        due: dueDate,
        scheduledDays: interval,
        elapsedDays: Math.round(elapsed),
        lastReview: now,
        reps: card.reps + 1,
        lapses: rating === Rating.Again ? card.lapses + 1 : card.lapses,
    };
}

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
