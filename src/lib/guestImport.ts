import { supabase } from './supabase';
import { createNewCard } from './fsrs';
import { loadLevel } from '../data/levels';
import { LEVELS, levelsUpTo, type GuestTrial } from './guestTrial';
import type { CEFRLevel } from './database.types';

/**
 * Moves the trial into a new account. Loaded only when there is a trial to move, so the
 * landing doesn't download the card scheduler.
 */

/** Every write skips what is already there, so it can run twice. */
export async function importGuest(userId: string, guest: GuestTrial): Promise<void> {
    const skip = { onConflict: 'user_id,word_id', ignoreDuplicates: true };
    if (guest.story) {
        const { id, completedAt } = guest.story;
        // Only words the trial story really marks: the rest came from somewhere else
        const content = await loadLevel('A1');
        const html = content.stories.find(s => s.id === id)?.content ?? '';
        const marked = new Set([...html.matchAll(/data-word="([^"]+)"/g)].map(m => m[1]));
        const deck = guest.story.deck.filter(w => marked.has(w));
        const known = guest.story.known.filter(w => marked.has(w));
        if (deck.length) {
            const cards = deck.map(wordId => {
                const card = createNewCard(wordId, id);
                return {
                    user_id: userId, word_id: wordId, story_id: id, state: card.state, due: card.due.toISOString(),
                    stability: card.stability, difficulty: card.difficulty, elapsed_days: card.elapsedDays,
                    scheduled_days: card.scheduledDays, reps: card.reps, lapses: card.lapses, last_review: null,
                };
            });
            const { error } = await supabase.from('cards').upsert(cards, skip);
            if (error) throw error;
        }
        if (known.length) {
            const rows = known.map(wordId => ({ user_id: userId, word_id: wordId, known_at: completedAt }));
            const { error } = await supabase.from('known_words').upsert(rows, skip);
            if (error) throw error;
        }
        const added = deck.length + known.length;
        if (added) {
            const { data: profile } = await supabase.from('profiles').select('total_words_learned').eq('id', userId).single();
            if (profile) await supabase.from('profiles').update({ total_words_learned: profile.total_words_learned + added }).eq('id', userId);
        }
        const { error } = await supabase.from('read_stories').upsert(
            { user_id: userId, story_id: id, completed_at: completedAt, words_added: deck.length },
            { onConflict: 'user_id,story_id', ignoreDuplicates: true },
        );
        if (error) throw error;
    }
    if (guest.placement) {
        const { data: profile, error } = await supabase.from('profiles').select('current_level, unlocked_levels').eq('id', userId).single();
        if (error) throw error;
        const unlocked = levelsUpTo(guest.placement, (profile?.unlocked_levels ?? ['A1']) as CEFRLevel[]);
        // A level the learner already reached is kept: the test only moves them up
        const current = profile && LEVELS.indexOf(profile.current_level as CEFRLevel) > LEVELS.indexOf(guest.placement)
            ? profile.current_level : guest.placement;
        const { error: updateError } = await supabase.from('profiles').update({ current_level: current, unlocked_levels: unlocked }).eq('id', userId);
        if (updateError) throw updateError;
    }
    // Shows in the admin panel which accounts came from the trial
    await supabase.auth.updateUser({ data: { came_from_trial: true } });
}
