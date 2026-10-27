import { generateWithFallback } from '../lib/gemini.js';

interface CareerDeckRequest {
    profession: string;
    level: string;
}

interface CareerWord {
    word: string;
    translation: string;
    example: string;
    exampleTranslation: string;
}

export async function generateCareerDeck(params: CareerDeckRequest): Promise<CareerWord[]> {
    const prompt = `Eres un lingüista experto en inglés profesional.

Evalúa críticamente si la ocupación, profesión, hobby, industria o dominio técnico especializado dado: "${params.profession}" es coherente, real y reconocible (ya sea en inglés o español).

Si el término es incoherente, es una cadena aleatoria de caracteres/números (por ejemplo, 'asdf', '12345'), está vacío o carece de cualquier contexto claro del cual se pueda extraer vocabulario técnico o profesional relevante, debes retornar obligatoriamente un arreglo JSON vacío: [].

Si el término es válido y coherente, genera una lista de 15 palabras o frases esenciales en inglés especializadas para dicho campo: "${params.profession}", adaptadas para el nivel CEFR: "${params.level}".

Responde SOLO con JSON válido (sin markdown ni bloques de código): un arreglo con este formato exacto de objetos, o [] si no es válido:
[
  {
    "word": "palabra en inglés (ej. reluctancy)",
    "translation": "traducción directa en español (ej. renuencia)",
    "example": "una oración de ejemplo en inglés simple y clara que use la palabra",
    "exampleTranslation": "la traducción de la oración de ejemplo al español"
  }
]`;

    const text = await generateWithFallback(prompt);

    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        console.error('[career-deck] Failed to parse JSON. Raw response:', text.substring(0, 500));
        throw new SyntaxError('Invalid JSON');
    }
}
