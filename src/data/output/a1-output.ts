import type { WritingPrompt, SpeakingPrompt } from '../../lib/db';

// ─── A1 Writing Prompts ───────────────────────────────────────────────
// 2 per unit (u1-u7), skip u8 (assessment)
// Pattern: 1 sentence-construction + 1 error-correction OR free-writing

export const a1WritingPrompts: WritingPrompt[] = [
  // ── U1: Verb 'to be' + pronouns (Greetings) ──────────────────────
  {
    id: 'wp-a1-u1-1',
    unitId: 'a1-u1',
    type: 'sentence-construction',
    level: 'A1',
    instruction: 'Traduce la siguiente oración al inglés. Usa el verbo "to be" y el pronombre correcto.',
    sourceText: 'Ella es mi profesora de inglés.',
    referenceAnswer: 'She is my English teacher.',
    targetGrammar: ['subject pronoun', 'verb to be'],
    wordLimit: { min: 3, max: 10 },
  },
  {
    id: 'wp-a1-u1-2',
    unitId: 'a1-u1',
    type: 'error-correction',
    level: 'A1',
    instruction: 'La siguiente oración tiene un error. Encuentra el error y escribe la oración correcta.',
    errorText: 'They is happy today.',
    referenceAnswer: 'They are happy today.',
    targetGrammar: ['verb to be', 'subject-verb agreement'],
  },

  // ── U2: Articles (a/an/the) + demonstratives (Classroom objects) ──
  {
    id: 'wp-a1-u2-1',
    unitId: 'a1-u2',
    type: 'sentence-construction',
    level: 'A1',
    instruction: 'Traduce la siguiente oración al inglés. Presta atención a los artículos (a, an, the).',
    sourceText: 'Esto es un borrador y eso es una regla.',
    referenceAnswer: 'This is an eraser and that is a ruler.',
    targetGrammar: ['articles a/an', 'demonstratives this/that'],
    wordLimit: { min: 5, max: 15 },
  },
  {
    id: 'wp-a1-u2-2',
    unitId: 'a1-u2',
    type: 'error-correction',
    level: 'A1',
    instruction: 'La siguiente oración tiene un error con el artículo. Encuentra el error y escribe la oración correcta.',
    errorText: 'This is a umbrella on the desk.',
    referenceAnswer: 'This is an umbrella on the desk.',
    targetGrammar: ['articles a/an', 'demonstratives'],
  },

  // ── U3: Present Simple affirmative (Daily routine) ────────────────
  {
    id: 'wp-a1-u3-1',
    unitId: 'a1-u3',
    type: 'sentence-construction',
    level: 'A1',
    instruction: 'Traduce la siguiente oración al inglés. Usa el Presente Simple en forma afirmativa.',
    sourceText: 'Mi hermano desayuna a las siete de la mañana.',
    referenceAnswer: 'My brother has breakfast at seven in the morning.',
    targetGrammar: ['present simple affirmative', 'third person -s'],
    wordLimit: { min: 5, max: 15 },
  },
  {
    id: 'wp-a1-u3-2',
    unitId: 'a1-u3',
    type: 'error-correction',
    level: 'A1',
    instruction: 'La siguiente oración tiene un error en el verbo. Encuentra el error y escribe la oración correcta.',
    errorText: 'She wake up at six every day.',
    referenceAnswer: 'She wakes up at six every day.',
    targetGrammar: ['present simple', 'third person -s'],
  },

  // ── U4: Present Simple negative/questions + frequency adverbs (Free time) ──
  {
    id: 'wp-a1-u4-1',
    unitId: 'a1-u4',
    type: 'sentence-construction',
    level: 'A1',
    instruction: 'Traduce la siguiente oración al inglés. Usa la forma negativa del Presente Simple y un adverbio de frecuencia.',
    sourceText: 'Yo nunca juego videojuegos los lunes.',
    referenceAnswer: 'I never play video games on Mondays.',
    targetGrammar: ['present simple negative', 'frequency adverbs'],
    wordLimit: { min: 5, max: 15 },
  },
  {
    id: 'wp-a1-u4-2',
    unitId: 'a1-u4',
    type: 'error-correction',
    level: 'A1',
    instruction: 'La siguiente oración tiene un error. Encuentra el error y escribe la oración correcta.',
    errorText: 'Does she goes to the park on Saturdays?',
    referenceAnswer: 'Does she go to the park on Saturdays?',
    targetGrammar: ['present simple questions', 'auxiliary do/does'],
  },

  // ── U5: There is/are + prepositions (My home) ────────────────────
  {
    id: 'wp-a1-u5-1',
    unitId: 'a1-u5',
    type: 'sentence-construction',
    level: 'A1',
    instruction: 'Traduce la siguiente oración al inglés. Usa "there is" o "there are" y una preposición de lugar.',
    sourceText: 'Hay tres sillas en la cocina.',
    referenceAnswer: 'There are three chairs in the kitchen.',
    targetGrammar: ['there is/are', 'prepositions of place'],
    wordLimit: { min: 4, max: 12 },
  },
  {
    id: 'wp-a1-u5-2',
    unitId: 'a1-u5',
    type: 'error-correction',
    level: 'A1',
    instruction: 'La siguiente oración tiene un error con "there is/are". Encuentra el error y escribe la oración correcta.',
    errorText: 'There is two windows next to the door.',
    referenceAnswer: 'There are two windows next to the door.',
    targetGrammar: ['there is/are', 'singular/plural'],
  },

  // ── U6: Can/can't + imperatives (Abilities) ──────────────────────
  {
    id: 'wp-a1-u6-1',
    unitId: 'a1-u6',
    type: 'sentence-construction',
    level: 'A1',
    instruction: 'Traduce la siguiente oración al inglés. Usa "can" o "can\'t".',
    sourceText: 'Mi gato puede saltar muy alto, pero no puede nadar.',
    referenceAnswer: "My cat can jump very high, but it can't swim.",
    targetGrammar: ['can/can\'t', 'abilities'],
    wordLimit: { min: 6, max: 16 },
  },
  {
    id: 'wp-a1-u6-2',
    unitId: 'a1-u6',
    type: 'error-correction',
    level: 'A1',
    instruction: 'La siguiente oración tiene un error con "can". Encuentra el error y escribe la oración correcta.',
    errorText: 'She can plays the guitar very well.',
    referenceAnswer: 'She can play the guitar very well.',
    targetGrammar: ['can + base form', 'modal verbs'],
  },

  // ── U7: Countable/uncountable + some/any (Food/drink) ────────────
  {
    id: 'wp-a1-u7-1',
    unitId: 'a1-u7',
    type: 'sentence-construction',
    level: 'A1',
    instruction: 'Traduce la siguiente oración al inglés. Usa "some" o "any" correctamente.',
    sourceText: 'No hay leche en la nevera, pero hay algunas manzanas.',
    referenceAnswer: "There isn't any milk in the fridge, but there are some apples.",
    targetGrammar: ['some/any', 'countable/uncountable nouns'],
    wordLimit: { min: 8, max: 20 },
  },
  {
    id: 'wp-a1-u7-2',
    unitId: 'a1-u7',
    type: 'error-correction',
    level: 'A1',
    instruction: 'La siguiente oración tiene un error con "some/any". Encuentra el error y escribe la oración correcta.',
    errorText: 'Do you want some coffee? No, I don\'t want some coffee.',
    referenceAnswer: "Do you want some coffee? No, I don't want any coffee.",
    targetGrammar: ['some/any', 'negative sentences'],
  },
];

// ─── A1 Speaking Prompts ──────────────────────────────────────────────
// 2 per unit (u1-u7), skip u8 (assessment)
// Pattern: 1 read-aloud + 1 oral-response

export const a1SpeakingPrompts: SpeakingPrompt[] = [
  // ── U1: Verb 'to be' + pronouns (Greetings) ──────────────────────
  {
    id: 'sp-a1-u1-1',
    unitId: 'a1-u1',
    type: 'read-aloud',
    level: 'A1',
    instruction: 'Lee la siguiente oración en voz alta con buena pronunciación.',
    targetText: 'Hello! I am Maria. I am a student. Nice to meet you!',
  },
  {
    id: 'sp-a1-u1-2',
    unitId: 'a1-u1',
    type: 'oral-response',
    level: 'A1',
    instruction: 'Responde en inglés a la siguiente pregunta: Alguien te dice "Hi, my name is John. What is your name?" Preséntate y di de dónde eres.',
    targetGrammar: ['verb to be', 'subject pronouns', 'greetings'],
  },

  // ── U2: Articles (a/an/the) + demonstratives (Classroom objects) ──
  {
    id: 'sp-a1-u2-1',
    unitId: 'a1-u2',
    type: 'read-aloud',
    level: 'A1',
    instruction: 'Lee las siguientes oraciones en voz alta. Presta atención a la pronunciación de "a", "an" y "the".',
    targetText: 'This is a pencil. That is an eraser. The book is on the table.',
  },
  {
    id: 'sp-a1-u2-2',
    unitId: 'a1-u2',
    type: 'oral-response',
    level: 'A1',
    instruction: 'Mira a tu alrededor y describe tres objetos que puedes ver. Usa "this is..." o "that is..." con el artículo correcto (a/an/the). Responde en inglés.',
    targetGrammar: ['articles a/an/the', 'demonstratives this/that'],
  },

  // ── U3: Present Simple affirmative (Daily routine) ────────────────
  {
    id: 'sp-a1-u3-1',
    unitId: 'a1-u3',
    type: 'read-aloud',
    level: 'A1',
    instruction: 'Lee las siguientes oraciones en voz alta. Presta atención a la pronunciación de la "s" en tercera persona.',
    targetText: 'She gets up at seven. She brushes her teeth and eats breakfast.',
  },
  {
    id: 'sp-a1-u3-2',
    unitId: 'a1-u3',
    type: 'oral-response',
    level: 'A1',
    instruction: 'Describe en inglés tres cosas que haces todos los días por la mañana. Usa el Presente Simple (por ejemplo: "I wake up at...").',
    targetGrammar: ['present simple affirmative', 'daily routine vocabulary'],
  },

  // ── U4: Present Simple negative/questions + frequency adverbs (Free time) ──
  {
    id: 'sp-a1-u4-1',
    unitId: 'a1-u4',
    type: 'read-aloud',
    level: 'A1',
    instruction: 'Lee las siguientes oraciones en voz alta con buena entonación.',
    targetText: "I usually read books on weekends. I don't often watch TV. Do you sometimes play sports?",
  },
  {
    id: 'sp-a1-u4-2',
    unitId: 'a1-u4',
    type: 'oral-response',
    level: 'A1',
    instruction: 'Responde en inglés: ¿Qué actividades haces en tu tiempo libre? Menciona algo que haces siempre, algo que haces a veces y algo que no haces nunca. Usa adverbios de frecuencia.',
    targetGrammar: ['present simple', 'frequency adverbs', 'negative form'],
  },

  // ── U5: There is/are + prepositions (My home) ────────────────────
  {
    id: 'sp-a1-u5-1',
    unitId: 'a1-u5',
    type: 'read-aloud',
    level: 'A1',
    instruction: 'Lee las siguientes oraciones en voz alta. Presta atención a la diferencia entre "there is" y "there are".',
    targetText: 'There is a big sofa in the living room. There are two lamps next to it.',
  },
  {
    id: 'sp-a1-u5-2',
    unitId: 'a1-u5',
    type: 'oral-response',
    level: 'A1',
    instruction: 'Describe en inglés tu habitación. Di qué hay y dónde está cada cosa. Usa "there is", "there are" y preposiciones como "on", "next to", "under".',
    targetGrammar: ['there is/are', 'prepositions of place'],
  },

  // ── U6: Can/can't + imperatives (Abilities) ──────────────────────
  {
    id: 'sp-a1-u6-1',
    unitId: 'a1-u6',
    type: 'read-aloud',
    level: 'A1',
    instruction: 'Lee las siguientes oraciones en voz alta. Presta atención a la diferencia de pronunciación entre "can" /kən/ y "can\'t" /kænt/.',
    targetText: "I can speak two languages. I can't drive a car. Can you ride a bicycle?",
  },
  {
    id: 'sp-a1-u6-2',
    unitId: 'a1-u6',
    type: 'oral-response',
    level: 'A1',
    instruction: 'Responde en inglés: Di tres cosas que puedes hacer bien y dos cosas que no puedes hacer. Usa "I can..." y "I can\'t...".',
    targetGrammar: ['can/can\'t', 'abilities'],
  },

  // ── U7: Countable/uncountable + some/any (Food/drink) ────────────
  {
    id: 'sp-a1-u7-1',
    unitId: 'a1-u7',
    type: 'read-aloud',
    level: 'A1',
    instruction: 'Lee las siguientes oraciones en voz alta con buena pronunciación.',
    targetText: "I need some bread and some butter. We don't have any eggs. Is there any water?",
  },
  {
    id: 'sp-a1-u7-2',
    unitId: 'a1-u7',
    type: 'oral-response',
    level: 'A1',
    instruction: 'Responde en inglés: Imagina que estás en una tienda. Di qué alimentos necesitas comprar y qué alimentos ya tienes en casa. Usa "some", "any", "I need..." y "I have...".',
    targetGrammar: ['some/any', 'countable/uncountable nouns', 'food vocabulary'],
  },
];
