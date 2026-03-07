import { generateWithFallback } from '../lib/gemini.js';

interface StoryRequest {
    level: string;
    knownWords?: string[];
    topic?: string;
}

interface GeneratedStory {
    id: string;
    level: string;
    title: string;
    content: string;
    wordCount: number;
    estimatedMinutes: number;
    vocabulary: Array<{
        id: string;
        translations: string[];
        cefrLevel: string;
        examples: string[];
        phonetic?: string;
    }>;
}

const LEVEL_CONFIG: Record<string, { wordRange: string; minutes: number; description: string }> = {
    A1: { wordRange: '40-55', minutes: 2, description: 'Very simple sentences. Present tense only. Basic daily vocabulary.' },
    A2: { wordRange: '55-70', minutes: 3, description: 'Simple past and present tenses. Elementary vocabulary. Short compound sentences.' },
    B1: { wordRange: '75-90', minutes: 4, description: 'Mixed tenses including present perfect. Intermediate vocabulary. Complex sentences with connectors.' },
    B2: { wordRange: '90-120', minutes: 5, description: 'All tenses including conditionals and passive voice. Advanced vocabulary. Sophisticated sentence structures.' },
};

export async function generateStory(params: StoryRequest): Promise<GeneratedStory> {
    const config = LEVEL_CONFIG[params.level] || LEVEL_CONFIG['A1'];
    const knownWordsHint = params.knownWords?.length
        ? `\nThe student already knows these words, so try to include some of them naturally but also introduce NEW words: ${params.knownWords.slice(0, 30).join(', ')}`
        : '';
    const topicHint = params.topic ? `\nThe story should be about: ${params.topic}` : '';

    const prompt = `You are a language learning content creator specializing in English stories for Spanish speakers.

Generate an original short story for CEFR level ${params.level}.
${config.description}

Requirements:
- Word count: ${config.wordRange} words
- The story must be engaging and have a clear beginning, middle, and end
- Format the HTML content as paragraphs with <p> tags
- Wrap 10-15 KEY vocabulary words in <span data-word="WORD">WORD</span> tags (the word inside data-word must be lowercase)
- Choose words that are educational for a ${params.level} learner
- Do NOT wrap common articles, prepositions, or pronouns (a, the, in, on, he, she, etc.)
${knownWordsHint}${topicHint}

You MUST respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "title": "Story Title",
  "content": "<p>Story with <span data-word=\\"word\\">word</span> tags.</p>",
  "wordCount": 50,
  "vocabulary": [
    {
      "id": "word",
      "translations": ["traducción en español"],
      "cefrLevel": "${params.level}",
      "examples": ["An example sentence using the word."],
      "phonetic": "/wɜːrd/"
    }
  ]
}

The vocabulary array must contain ALL the words you wrapped in span tags, with accurate Spanish translations and IPA phonetics.`;

    const text = await generateWithFallback(prompt);

    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    let parsed: any;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        console.error('[story-generator] Failed to parse JSON. Raw response:', text.substring(0, 500));
        throw new SyntaxError('Invalid JSON');
    }

    const storyId = `ai-${params.level.toLowerCase()}-${Date.now()}`;

    return {
        id: storyId,
        level: params.level,
        title: parsed.title,
        content: parsed.content,
        wordCount: parsed.wordCount || parseInt(config.wordRange.split('-')[0]),
        estimatedMinutes: config.minutes,
        vocabulary: parsed.vocabulary || [],
    };
}
