import { generateWithFallback } from '../lib/gemini.js';
// The stories themselves, so the server translates only them (and knows when one has changed)
import { b1Stories } from '../../src/data/stories-b1.js';
import { b2Stories } from '../../src/data/stories-b2.js';
import { storySentences } from '../../src/lib/storySentences.js';

export interface StoryTranslationResponse {
    sentences: string[];
    questions: { question: string; options: string[] }[];
}

/**
 * The Spanish of a B1 or B2 story, sentence by sentence (A1 and A2 have theirs written by hand).
 * The story is looked up here by its id, so the AI only ever translates the app's own stories.
 */
export const translatableStory = (storyId: string) => [...b1Stories, ...b2Stories].find(s => s.id === storyId);

/** What gets translated: the story's sentences and questions, as they are today. */
function translationSource(storyId: string) {
    const story = translatableStory(storyId);
    if (!story) return null;
    return {
        sentences: storySentences(story.content),
        questions: (story.questions ?? []).map(q => ({ question: q.question, options: q.options })),
    };
}

/**
 * The cache key's input: the id plus the text itself, so editing a story makes a new translation
 * instead of serving the old one under sentences that no longer match. Nothing the client sends.
 */
export function translationCacheParams(storyId: string) {
    return { storyId, source: translationSource(storyId) };
}

export async function translateStory(params: { storyId: string }): Promise<StoryTranslationResponse> {
    const source = translationSource(params.storyId);
    if (!source) throw new Error('Unknown story');
    const { sentences, questions } = source;

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
