# Vocabulary Portability and Career Decks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement FSRS vocabulary deck CSV export, custom keyword list import, seamless compatibility for custom words in review sessions, and one-click AI-powered specialized career deck generation on the Account Settings page.

**Architecture:** 
1. **Export Module**: Query Supabase `cards` table, match words with static/custom definitions, and trigger a secure, browser-native `.csv` download.
2. **Import Module**: Accept text-pasted or uploaded word lists, cross-check definitions, register new terms in `known_words`, and schedule them into FSRS `cards` with a dynamic `story_id = 'imported'`.
3. **Compatibility Filter**: Update `ReviewSession.tsx` to automatically generate a mock `Vocabulary` fallback structure for custom words so they render cleanly in both Cloze and Translation review modes.
4. **AI Career Decks**: Expose a generator function using Gemini 1.5 Flash in `ai.ts` to return 15 industry-specific vocabulary words based on any user profession, and insert them into the user's study deck.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Supabase (JS client), Gemini 1.5 Flash, Vitest.

---

### Task 1: Implement Dynamic ReviewSession Fallback for Custom Words

**Files:**
- Modify: `src/pages/ReviewSession.tsx`

**Step 1: Write the failing test**
Create a test file `src/test/CustomWordsReview.test.ts` or add to existing test suite to ensure the fallback handles undefined words:
- Modify `src/pages/ReviewSession.tsx` so `currentVocab` has a fallback:
```typescript
    const currentVocab = currentCard
        ? (getVocab(currentCard.wordId) || {
            id: currentCard.wordId,
            word: currentCard.wordId,
            translations: ['palabra personalizada'],
            definition: 'Custom word imported by the user.',
            examples: [`This is the custom word: ${currentCard.wordId}.`],
            exampleTranslations: ['Esta es la palabra personalizada.'],
            level: 'B2',
          })
        : undefined;
```

**Step 2: Check compiler syntax**
Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**
```bash
git add src/pages/ReviewSession.tsx
git commit -m "feat: add fallback vocabulary support for custom and imported words in ReviewSession"
```

---

### Task 2: Create AI Career Deck Generator in ai.ts

**Files:**
- Modify: `src/lib/ai.ts`

**Step 1: Implement generator in `ai.ts`**
Export a new function `generateCareerDeck` utilizing Gemini 1.5 Flash to return 15 industry-specific words:
```typescript
export interface CareerWord {
    word: string;
    translation: string;
    example: string;
    exampleTranslation: string;
}

export async function generateCareerDeck(profession: string, level: string): Promise<CareerWord[]> {
    const { GoogleGenAI } = await import('@google/generative-ai');
    // Use fallback API key check
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) throw new Error('API key missing');

    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
    Eres un lingüista experto en inglés profesional. Genera una lista de 15 palabras o frases esenciales en inglés especializadas para la profesión: "${profession}", adaptadas para el nivel CEFR: "${level}".
    
    Debes retornar un JSON array con el siguiente formato exacto de objetos:
    [
      {
        "word": "palabra en inglés (ej. reluctancy)",
        "translation": "traducción directa en español (ej. renuencia)",
        "example": "una oración de ejemplo en inglés simple y clara que use la palabra",
        "exampleTranslation": "la traducción de la oración de ejemplo al español"
      }
    ]
    `;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return JSON.parse(text) as CareerWord[];
}
```

**Step 2: Verify compilation**
Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**
```bash
git add src/lib/ai.ts
git commit -m "feat: implement generateCareerDeck function using Gemini 1.5 Flash in ai.ts"
```

---

### Task 3: Build Export and Import Mazo Interfaces in Account.tsx

**Files:**
- Modify: `src/pages/Account.tsx`

**Step 1: Add state and handlers in `Account.tsx`**
Inside `Account.tsx`, add the required state variables and database sync functions:
- Import `generateCareerDeck` from `../lib/ai`
- Import `getVocab` from `../data`
- Implement FSRS Export:
```typescript
    const handleExportFSRS = async () => {
        try {
            const { data: cardsData, error } = await supabase
                .from('cards')
                .select('*');
            if (error) throw error;
            
            let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // Add BOM for Excel compatibility
            csvContent += 'Word,Translation,CEFR Level,State,Reps,Last Review\n';
            
            for (const card of (cardsData || [])) {
                const vocab = getVocab(card.word_id);
                const word = card.word_id;
                const translation = vocab?.translations ? vocab.translations.join('; ') : 'Palabra personalizada';
                const level = vocab?.level || 'B2';
                const state = card.state === 0 ? 'New' : card.state === 1 ? 'Learning' : card.state === 2 ? 'Review' : 'Relearning';
                const reps = card.reps;
                const lastReview = card.last_review ? new Date(card.last_review).toISOString().split('T')[0] : 'Never';
                
                const row = `"${word}","${translation}","${level}","${state}",${reps},"${lastReview}"`;
                csvContent += row + '\n';
            }
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `voxie_fsrs_deck_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Failed to export CSV:', err);
        }
    };
```
- Implement CSV/Text Import:
```typescript
    const handleImportWords = async (text: string) => {
        if (!text.trim() || !authUser?.id) return;
        
        // Split by commas, semicolons or new lines
        const rawWords = text.split(/[,;\n]+/).map(w => w.trim()).filter(Boolean);
        if (rawWords.length === 0) return;
        
        try {
            for (const word of rawWords) {
                const wordClean = word.toLowerCase();
                
                // 1. Insert into known_words
                await supabase
                    .from('known_words')
                    .insert({ user_id: authUser.id, word_id: wordClean });
                    
                // 2. Insert into cards with FSRS defaults and story_id = 'imported'
                await supabase
                    .from('cards')
                    .insert({
                        user_id: authUser.id,
                        word_id: wordClean,
                        story_id: 'imported',
                        state: 0,
                        due: new Date().toISOString(),
                    });
            }
            qc.invalidateQueries({ queryKey: ['unitProgress'] });
            window.location.reload(); // Quick refresh to update state
        } catch (err) {
            console.error('Import failed:', err);
        }
    };
```
- Implement AI Career Deck generator triggers:
```typescript
    const handleCreateCareerDeck = async (profession: string) => {
        if (!profession.trim() || !authUser?.id) return;
        try {
            const words = await generateCareerDeck(profession, progressInfo?.currentLevel || 'A1');
            for (const item of words) {
                const wordClean = item.word.toLowerCase();
                
                // Insert known word
                await supabase
                    .from('known_words')
                    .insert({ user_id: authUser.id, word_id: wordClean });
                    
                // Insert cards
                await supabase
                    .from('cards')
                    .insert({
                        user_id: authUser.id,
                        word_id: wordClean,
                        story_id: `career-${profession.replace(/\s+/g, '-')}`,
                        state: 0,
                        due: new Date().toISOString(),
                    });
            }
            qc.invalidateQueries({ queryKey: ['unitProgress'] });
            window.location.reload();
        } catch (err) {
            console.error('Failed to generate career deck:', err);
        }
    };
```

**Step 2: Add visual components inside `Account.tsx`**
Below the stats panel, render a glassmorphic Card widget for **"Gestión de Mazos de Vocabulario"** containing:
- Button for CSV Export.
- Text Input Area + Import button.
- Select/Input with quick-actions to generate an AI Career Deck (e.g. "Ingeniero de Software", "Medicina", "Negocios" or custom write-in).

**Step 3: Run comprehensive verification**
Run: `npm run test:run`
Run: `npm run build`
Expected: SUCCESS

**Step 4: Commit**
```bash
git add src/pages/Account.tsx
git commit -m "feat: integrate export, custom import, and AI career decks in Account settings"
```
