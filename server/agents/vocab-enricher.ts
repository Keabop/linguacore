import { generateWithFallback } from '../lib/gemini.js';

interface VocabEnrichRequest {
    word: string;
    context?: string;
    level: string;
}

interface VocabEnrichment {
    word: string;
    translations: string[];
    cefrLevel: string;
    examples: string[];
    phonetic: string;
    synonyms: string[];
    antonyms: string[];
    usageNotes: string;
    collocations: string[];
}

export async function enrichVocabulary(params: VocabEnrichRequest): Promise<VocabEnrichment> {
    const contextHint = params.context
        ? `\nThe word appeared in this context: "${params.context}"`
        : '';

    const prompt = `You are an English language expert helping Spanish speakers learn vocabulary.

Provide detailed information about the English word "${params.word}" at CEFR level ${params.level}.
${contextHint}

You MUST respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "word": "${params.word}",
  "translations": ["traducción principal", "traducción alternativa"],
  "cefrLevel": "${params.level}",
  "examples": [
    "Example sentence 1 using the word.",
    "Example sentence 2 in a different context.",
    "Example sentence 3 showing common usage."
  ],
  "phonetic": "/IPA transcription/",
  "synonyms": ["synonym1", "synonym2"],
  "antonyms": ["antonym1"],
  "usageNotes": "Brief note in Spanish about common usage patterns, common mistakes Spanish speakers make, or grammar tips.",
  "collocations": ["common collocation 1", "common collocation 2"]
}

Provide accurate Spanish translations and IPA phonetics. The usage notes should be helpful for Spanish speakers specifically.`;

    const text = await generateWithFallback(prompt);

    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        console.error('[vocab-enricher] Failed to parse JSON. Raw response:', text.substring(0, 500));
        throw new SyntaxError('Invalid JSON');
    }
}
