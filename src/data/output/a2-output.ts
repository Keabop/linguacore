import type { WritingPrompt, SpeakingPrompt } from '../../lib/db';

// ─── A2 Writing Prompts ───────────────────────────────────────────────
// 2 per unit (u1-u10), skip u11 (assessment)
// Pattern: 1 sentence-construction + 1 error-correction OR free-writing

export const a2WritingPrompts: WritingPrompt[] = [
  // ── U1: Past Simple regular verbs (Yesterday) ─────────────────────
  {
    id: 'wp-a2-u1-1',
    unitId: 'a2-u1',
    type: 'sentence-construction',
    level: 'A2',
    instruction: 'Traduce la siguiente oración al inglés. Usa el Pasado Simple con verbos regulares.',
    sourceText: 'Ayer cociné la cena y limpié la cocina.',
    referenceAnswer: 'Yesterday I cooked dinner and cleaned the kitchen.',
    targetGrammar: ['past simple regular', '-ed ending'],
    wordLimit: { min: 5, max: 15 },
  },
  {
    id: 'wp-a2-u1-2',
    unitId: 'a2-u1',
    type: 'error-correction',
    level: 'A2',
    instruction: 'La siguiente oración tiene un error en el Pasado Simple. Encuentra el error y escribe la oración correcta.',
    errorText: 'She watchd a movie and then she walkked home.',
    referenceAnswer: 'She watched a movie and then she walked home.',
    targetGrammar: ['past simple regular', '-ed spelling'],
  },

  // ── U2: Past Simple irregular verbs (Travel) ─────────────────────
  {
    id: 'wp-a2-u2-1',
    unitId: 'a2-u2',
    type: 'sentence-construction',
    level: 'A2',
    instruction: 'Traduce la siguiente oración al inglés. Usa el Pasado Simple con verbos irregulares.',
    sourceText: 'El verano pasado fui a la playa y vi delfines.',
    referenceAnswer: 'Last summer I went to the beach and saw dolphins.',
    targetGrammar: ['past simple irregular', 'went/saw'],
    wordLimit: { min: 6, max: 16 },
  },
  {
    id: 'wp-a2-u2-2',
    unitId: 'a2-u2',
    type: 'error-correction',
    level: 'A2',
    instruction: 'La siguiente oración tiene errores con verbos irregulares en pasado. Encuentra los errores y escribe la oración correcta.',
    errorText: 'We taked the bus and goed to the airport at night.',
    referenceAnswer: 'We took the bus and went to the airport at night.',
    targetGrammar: ['past simple irregular', 'took/went'],
  },

  // ── U3: Past Continuous (Memories) ────────────────────────────────
  {
    id: 'wp-a2-u3-1',
    unitId: 'a2-u3',
    type: 'sentence-construction',
    level: 'A2',
    instruction: 'Traduce la siguiente oración al inglés. Usa el Pasado Continuo (was/were + -ing).',
    sourceText: 'A las ocho de la noche, mis padres estaban viendo televisión y yo estaba leyendo un libro.',
    referenceAnswer: 'At eight in the evening, my parents were watching TV and I was reading a book.',
    targetGrammar: ['past continuous', 'was/were + -ing'],
    wordLimit: { min: 10, max: 22 },
  },
  {
    id: 'wp-a2-u3-2',
    unitId: 'a2-u3',
    type: 'error-correction',
    level: 'A2',
    instruction: 'La siguiente oración tiene un error con el Pasado Continuo. Encuentra el error y escribe la oración correcta.',
    errorText: 'The children was playing in the garden when it started to rain.',
    referenceAnswer: 'The children were playing in the garden when it started to rain.',
    targetGrammar: ['past continuous', 'was/were agreement'],
  },

  // ── U4: Comparative adjectives (Shopping) ─────────────────────────
  {
    id: 'wp-a2-u4-1',
    unitId: 'a2-u4',
    type: 'sentence-construction',
    level: 'A2',
    instruction: 'Traduce la siguiente oración al inglés. Usa adjetivos comparativos.',
    sourceText: 'Este vestido es más bonito que aquel, pero es más caro.',
    referenceAnswer: 'This dress is prettier than that one, but it is more expensive.',
    targetGrammar: ['comparative adjectives', '-er/more than'],
    wordLimit: { min: 8, max: 18 },
  },
  {
    id: 'wp-a2-u4-2',
    unitId: 'a2-u4',
    type: 'error-correction',
    level: 'A2',
    instruction: 'La siguiente oración tiene un error con los comparativos. Encuentra el error y escribe la oración correcta.',
    errorText: 'This jacket is more cheap than the blue one, but it is more prettier.',
    referenceAnswer: 'This jacket is cheaper than the blue one, but it is prettier.',
    targetGrammar: ['comparative adjectives', '-er vs more'],
  },

  // ── U5: Superlative adjectives (World records) ────────────────────
  {
    id: 'wp-a2-u5-1',
    unitId: 'a2-u5',
    type: 'sentence-construction',
    level: 'A2',
    instruction: 'Traduce la siguiente oración al inglés. Usa adjetivos superlativos.',
    sourceText: 'El guepardo es el animal más rápido del mundo.',
    referenceAnswer: 'The cheetah is the fastest animal in the world.',
    targetGrammar: ['superlative adjectives', 'the + -est'],
    wordLimit: { min: 6, max: 15 },
  },
  {
    id: 'wp-a2-u5-2',
    unitId: 'a2-u5',
    type: 'error-correction',
    level: 'A2',
    instruction: 'La siguiente oración tiene un error con los superlativos. Encuentra el error y escribe la oración correcta.',
    errorText: 'Mount Everest is the most tallest mountain in the world.',
    referenceAnswer: 'Mount Everest is the tallest mountain in the world.',
    targetGrammar: ['superlative adjectives', 'the + -est vs the most'],
  },

  // ── U6: Future with 'going to' (Plans) ───────────────────────────
  {
    id: 'wp-a2-u6-1',
    unitId: 'a2-u6',
    type: 'sentence-construction',
    level: 'A2',
    instruction: 'Traduce la siguiente oración al inglés. Usa "going to" para hablar de planes futuros.',
    sourceText: 'Este fin de semana vamos a visitar a nuestros abuelos y vamos a cocinar juntos.',
    referenceAnswer: 'This weekend we are going to visit our grandparents and we are going to cook together.',
    targetGrammar: ['going to future', 'plans'],
    wordLimit: { min: 10, max: 22 },
  },
  {
    id: 'wp-a2-u6-2',
    unitId: 'a2-u6',
    type: 'error-correction',
    level: 'A2',
    instruction: 'La siguiente oración tiene un error con "going to". Encuentra el error y escribe la oración correcta.',
    errorText: 'She is going to travels to London next month.',
    referenceAnswer: 'She is going to travel to London next month.',
    targetGrammar: ['going to + base form', 'future plans'],
  },

  // ── U7: Future with 'will' (Predictions) ─────────────────────────
  {
    id: 'wp-a2-u7-1',
    unitId: 'a2-u7',
    type: 'sentence-construction',
    level: 'A2',
    instruction: 'Traduce la siguiente oración al inglés. Usa "will" para hacer predicciones sobre el futuro.',
    sourceText: 'Creo que mañana lloverá y hará frío.',
    referenceAnswer: 'I think it will rain tomorrow and it will be cold.',
    targetGrammar: ['will future', 'predictions'],
    wordLimit: { min: 6, max: 16 },
  },
  {
    id: 'wp-a2-u7-2',
    unitId: 'a2-u7',
    type: 'error-correction',
    level: 'A2',
    instruction: 'La siguiente oración tiene un error con "will". Encuentra el error y escribe la oración correcta.',
    errorText: 'In the future, robots will helps people with their work.',
    referenceAnswer: 'In the future, robots will help people with their work.',
    targetGrammar: ['will + base form', 'predictions'],
  },

  // ── U8: Present Perfect intro (Experiences) ──────────────────────
  {
    id: 'wp-a2-u8-1',
    unitId: 'a2-u8',
    type: 'sentence-construction',
    level: 'A2',
    instruction: 'Traduce la siguiente oración al inglés. Usa el Presente Perfecto (have/has + participio pasado).',
    sourceText: 'He visitado tres países, pero nunca he ido a Japón.',
    referenceAnswer: 'I have visited three countries, but I have never been to Japan.',
    targetGrammar: ['present perfect', 'have/has + past participle'],
    wordLimit: { min: 8, max: 18 },
  },
  {
    id: 'wp-a2-u8-2',
    unitId: 'a2-u8',
    type: 'error-correction',
    level: 'A2',
    instruction: 'La siguiente oración tiene un error con el Presente Perfecto. Encuentra el error y escribe la oración correcta.',
    errorText: 'She has ate sushi before, but she has never drank green tea.',
    referenceAnswer: 'She has eaten sushi before, but she has never drunk green tea.',
    targetGrammar: ['present perfect', 'irregular past participles'],
  },

  // ── U9: Modals should/must (Advice) ──────────────────────────────
  {
    id: 'wp-a2-u9-1',
    unitId: 'a2-u9',
    type: 'sentence-construction',
    level: 'A2',
    instruction: 'Traduce la siguiente oración al inglés. Usa "should" o "must" para dar consejos.',
    sourceText: 'Deberías dormir ocho horas. No debes comer tanta azúcar.',
    referenceAnswer: "You should sleep eight hours. You must not eat so much sugar.",
    targetGrammar: ['should/must', 'modal verbs for advice'],
    wordLimit: { min: 8, max: 18 },
  },
  {
    id: 'wp-a2-u9-2',
    unitId: 'a2-u9',
    type: 'error-correction',
    level: 'A2',
    instruction: 'La siguiente oración tiene un error con los verbos modales. Encuentra el error y escribe la oración correcta.',
    errorText: 'You should to drink more water and you must to exercise every day.',
    referenceAnswer: 'You should drink more water and you must exercise every day.',
    targetGrammar: ['should/must + base form', 'no "to" after modals'],
  },

  // ── U10: Connectors (and, but, because, so) (Storytelling) ───────
  {
    id: 'wp-a2-u10-1',
    unitId: 'a2-u10',
    type: 'sentence-construction',
    level: 'A2',
    instruction: 'Traduce la siguiente oración al inglés. Usa los conectores "and", "but", "because" o "so" correctamente.',
    sourceText: 'Quería ir al parque, pero estaba lloviendo, así que me quedé en casa y leí un libro.',
    referenceAnswer: 'I wanted to go to the park, but it was raining, so I stayed at home and read a book.',
    targetGrammar: ['connectors', 'but/so/and'],
    wordLimit: { min: 12, max: 25 },
  },
  {
    id: 'wp-a2-u10-2',
    unitId: 'a2-u10',
    type: 'free-writing',
    level: 'A2',
    instruction: 'Escribe una historia corta en inglés (4-6 oraciones) sobre un día especial que tuviste. Usa al menos tres conectores diferentes (and, but, because, so). Intenta usar vocabulario variado.',
    referenceAnswer: 'Last Saturday was a special day because it was my birthday. I woke up early and my family prepared a big breakfast for me. I wanted to go to the beach, but it was cloudy, so we decided to go to the cinema instead. We watched a great movie and then we had dinner at my favourite restaurant.',
    targetGrammar: ['connectors and/but/because/so', 'past simple', 'storytelling'],
    wordLimit: { min: 30, max: 80 },
  },
];

// ─── A2 Speaking Prompts ──────────────────────────────────────────────
// 2 per unit (u1-u10), skip u11 (assessment)
// Pattern: 1 read-aloud + 1 oral-response

export const a2SpeakingPrompts: SpeakingPrompt[] = [
  // ── U1: Past Simple regular verbs (Yesterday) ─────────────────────
  {
    id: 'sp-a2-u1-1',
    unitId: 'a2-u1',
    type: 'read-aloud',
    level: 'A2',
    instruction: 'Lee las siguientes oraciones en voz alta. Presta atención a la pronunciación de la terminación "-ed" (/t/, /d/, /ɪd/).',
    targetText: 'Yesterday I walked to school, studied for two hours, and then watched a documentary about animals.',
  },
  {
    id: 'sp-a2-u1-2',
    unitId: 'a2-u1',
    type: 'oral-response',
    level: 'A2',
    instruction: 'Responde en inglés: ¿Qué hiciste ayer después de la escuela o el trabajo? Menciona al menos tres actividades usando el Pasado Simple con verbos regulares.',
    targetGrammar: ['past simple regular', '-ed pronunciation'],
  },

  // ── U2: Past Simple irregular verbs (Travel) ─────────────────────
  {
    id: 'sp-a2-u2-1',
    unitId: 'a2-u2',
    type: 'read-aloud',
    level: 'A2',
    instruction: 'Lee las siguientes oraciones en voz alta con buena pronunciación.',
    targetText: 'Last year I went to Italy. I ate delicious pasta, drank espresso, and took many photos of the Colosseum.',
  },
  {
    id: 'sp-a2-u2-2',
    unitId: 'a2-u2',
    type: 'oral-response',
    level: 'A2',
    instruction: 'Responde en inglés: Describe un viaje que hiciste. ¿Adónde fuiste? ¿Qué viste? ¿Qué comiste? Usa verbos irregulares en pasado (went, saw, ate, took, etc.).',
    targetGrammar: ['past simple irregular', 'travel vocabulary'],
  },

  // ── U3: Past Continuous (Memories) ────────────────────────────────
  {
    id: 'sp-a2-u3-1',
    unitId: 'a2-u3',
    type: 'read-aloud',
    level: 'A2',
    instruction: 'Lee las siguientes oraciones en voz alta. Presta atención a la entonación y al ritmo.',
    targetText: 'While my mother was cooking dinner, my father was reading the newspaper and we were doing our homework.',
  },
  {
    id: 'sp-a2-u3-2',
    unitId: 'a2-u3',
    type: 'oral-response',
    level: 'A2',
    instruction: 'Responde en inglés: Piensa en un recuerdo de cuando eras pequeño/a. ¿Qué estabas haciendo? ¿Qué estaban haciendo las personas a tu alrededor? Usa el Pasado Continuo (was/were + -ing).',
    targetGrammar: ['past continuous', 'was/were + -ing', 'while'],
  },

  // ── U4: Comparative adjectives (Shopping) ─────────────────────────
  {
    id: 'sp-a2-u4-1',
    unitId: 'a2-u4',
    type: 'read-aloud',
    level: 'A2',
    instruction: 'Lee las siguientes oraciones en voz alta con buena pronunciación.',
    targetText: 'The red shoes are cheaper than the blue ones, but the blue ones are more comfortable and more fashionable.',
  },
  {
    id: 'sp-a2-u4-2',
    unitId: 'a2-u4',
    type: 'oral-response',
    level: 'A2',
    instruction: 'Responde en inglés: Compara dos tiendas o dos productos que conoces. ¿Cuál es más grande, más barato, mejor, más popular? Usa al menos tres adjetivos comparativos.',
    targetGrammar: ['comparative adjectives', '-er than / more than'],
  },

  // ── U5: Superlative adjectives (World records) ────────────────────
  {
    id: 'sp-a2-u5-1',
    unitId: 'a2-u5',
    type: 'read-aloud',
    level: 'A2',
    instruction: 'Lee las siguientes oraciones en voz alta. Presta atención a la pronunciación de los superlativos.',
    targetText: 'The blue whale is the largest animal on Earth. The Sahara is the hottest desert and Russia is the biggest country.',
  },
  {
    id: 'sp-a2-u5-2',
    unitId: 'a2-u5',
    type: 'oral-response',
    level: 'A2',
    instruction: 'Responde en inglés: Habla sobre tu ciudad o tu país. ¿Cuál es el edificio más alto? ¿Cuál es el lugar más bonito? ¿Cuál es la comida más famosa? Usa al menos tres superlativos.',
    targetGrammar: ['superlative adjectives', 'the + -est / the most'],
  },

  // ── U6: Future with 'going to' (Plans) ───────────────────────────
  {
    id: 'sp-a2-u6-1',
    unitId: 'a2-u6',
    type: 'read-aloud',
    level: 'A2',
    instruction: 'Lee las siguientes oraciones en voz alta con buena entonación.',
    targetText: "Next summer we are going to travel to the mountains. We are going to camp near a lake and we're going to hike every day.",
  },
  {
    id: 'sp-a2-u6-2',
    unitId: 'a2-u6',
    type: 'oral-response',
    level: 'A2',
    instruction: 'Responde en inglés: ¿Cuáles son tus planes para las próximas vacaciones? Di al menos tres cosas que vas a hacer usando "I am going to...".',
    targetGrammar: ['going to future', 'plans and intentions'],
  },

  // ── U7: Future with 'will' (Predictions) ─────────────────────────
  {
    id: 'sp-a2-u7-1',
    unitId: 'a2-u7',
    type: 'read-aloud',
    level: 'A2',
    instruction: 'Lee las siguientes oraciones en voz alta. Presta atención a la contracción "\'ll".',
    targetText: "I think technology will change our lives. Cars will drive themselves and people won't need to go to offices.",
  },
  {
    id: 'sp-a2-u7-2',
    unitId: 'a2-u7',
    type: 'oral-response',
    level: 'A2',
    instruction: 'Responde en inglés: ¿Cómo crees que será el mundo en 50 años? Haz al menos tres predicciones usando "will" y "won\'t".',
    targetGrammar: ['will/won\'t', 'future predictions'],
  },

  // ── U8: Present Perfect intro (Experiences) ──────────────────────
  {
    id: 'sp-a2-u8-1',
    unitId: 'a2-u8',
    type: 'read-aloud',
    level: 'A2',
    instruction: 'Lee las siguientes oraciones en voz alta. Presta atención a la pronunciación de "have" y los participios pasados.',
    targetText: 'I have traveled to five countries. I have eaten snails in France, but I have never tried sushi.',
  },
  {
    id: 'sp-a2-u8-2',
    unitId: 'a2-u8',
    type: 'oral-response',
    level: 'A2',
    instruction: 'Responde en inglés: Habla sobre tus experiencias. Menciona tres cosas que has hecho y dos cosas que nunca has hecho. Usa "I have..." y "I have never...".',
    targetGrammar: ['present perfect', 'have/has + past participle', 'ever/never'],
  },

  // ── U9: Modals should/must (Advice) ──────────────────────────────
  {
    id: 'sp-a2-u9-1',
    unitId: 'a2-u9',
    type: 'read-aloud',
    level: 'A2',
    instruction: 'Lee las siguientes oraciones en voz alta con buena pronunciación.',
    targetText: "If you want to be healthy, you should exercise regularly. You must drink enough water, and you shouldn't eat too much sugar.",
  },
  {
    id: 'sp-a2-u9-2',
    unitId: 'a2-u9',
    type: 'oral-response',
    level: 'A2',
    instruction: 'Responde en inglés: Tu amigo/a quiere aprender inglés más rápido. Dale al menos tres consejos usando "you should...", "you shouldn\'t...", y "you must...".',
    targetGrammar: ['should/shouldn\'t', 'must/mustn\'t', 'giving advice'],
  },

  // ── U10: Connectors (and, but, because, so) (Storytelling) ───────
  {
    id: 'sp-a2-u10-1',
    unitId: 'a2-u10',
    type: 'read-aloud',
    level: 'A2',
    instruction: 'Lee el siguiente párrafo en voz alta. Haz una pequeña pausa antes de cada conector (and, but, because, so).',
    targetText: 'I wanted to buy a new phone because my old one was broken. I went to the shop, but it was closed, so I decided to order one online and it arrived the next day.',
  },
  {
    id: 'sp-a2-u10-2',
    unitId: 'a2-u10',
    type: 'oral-response',
    level: 'A2',
    instruction: 'Responde en inglés: Cuenta una historia breve sobre algo divertido o interesante que te pasó. Usa al menos tres conectores diferentes (and, but, because, so) para unir tus ideas.',
    targetGrammar: ['connectors and/but/because/so', 'storytelling', 'past tense'],
  },
];
