import { generateWithFallback } from '../lib/gemini.js';
import { b1Stories } from '../../src/data/stories-b1';
import { b2Stories } from '../../src/data/stories-b2';
import { storySentences } from '../../src/lib/storySentences';

export interface StoryTranslationResponse {
    sentences: string[];
    questions: { question: string; options: string[] }[];
}

/**
 * The Spanish of a B1 or B2 story, sentence by sentence (A1 and A2 have theirs written by hand).
 * The story is looked up here by its id, so the AI only ever translates the app's own stories.
 */
export const translatableStory = (storyId: string) => [...b1Stories, ...b2Stories].find(s => s.id === storyId);

export async function translateStory(params: { storyId: string }): Promise<StoryTranslationResponse> {
    const story = translatableStory(params.storyId);
    if (!story) throw new Error('Unknown story');
    const sentences = storySentences(story.content);
    const questions = (story.questions ?? []).map(q => ({ question: q.question, options: q.options }));

    const prompt = `You translate English stories for Spanish speakers in Mexico who are learning English.
Translate into natural Mexican Spanish, faithful to the meaning. Keep names as they are.

Return ONLY valid JSON (no markdown) with exactly this shape:
{"sentences": [...], "questions": [{"question": "...", "options": ["...", "..."]}]}

- "sentences": exactly ${sentences.length} strings, the translation of each sentence below, in the same order. Never merge or split sentences.
- "questions": exactly ${questions.length} items, each question and its options translated in the same order.

Sentences:
${JSON.stringify(sentences)}

Questions:
${JSON.stringify(questions)}`;

    const text = await generateWithFallback(prompt);
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    let parsed: StoryTranslationResponse;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        console.error('[story-translator] Failed to parse JSON. Raw response:', text.substring(0, 300));
        throw new SyntaxError('Invalid JSON');
    }
    // A translation that doesn't line up with the story would show the wrong Spanish under a sentence
    const aligned = Array.isArray(parsed.sentences) && parsed.sentences.length === sentences.length
        && parsed.sentences.every(s => typeof s === 'string')
        && Array.isArray(parsed.questions) && parsed.questions.length === questions.length
        && parsed.questions.every((q, i) => typeof q.question === 'string' && Array.isArray(q.options) && q.options.length === questions[i].options.length);
    if (!aligned) throw new SyntaxError('Translation does not match the story');
    return { sentences: parsed.sentences, questions: parsed.questions };
}
