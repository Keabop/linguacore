import i18n from '../i18n/config';

// What a writing or speaking task practices, in Spanish: the A1 and A2 prompts name their
// grammar in English («subject pronoun»), which whoever starts can't read yet. B1 and B2 keep
// the English names, as their learners do.
const LABELS: Record<string, string> = {
    '-ed ending': 'terminación -ed',
    '-ed pronunciation': 'cómo suena la -ed',
    '-ed spelling': 'cómo se escribe la -ed',
    '-er than / more than': 'comparar: -er than / more than',
    '-er vs more': 'comparar: -er o more',
    '-er/more than': 'comparar: -er / more than',
    'abilities': 'habilidades',
    'articles a/an': 'artículos a / an',
    'articles a/an/the': 'artículos a / an / the',
    'auxiliary do/does': 'auxiliar do / does',
    'but/so/and': 'conectores but / so / and',
    'can + base form': 'can + verbo',
    "can/can't": "can / can't (poder)",
    'comparative adjectives': 'adjetivos para comparar',
    'connectors': 'conectores',
    'connectors and/but/because/so': 'conectores and / but / because / so',
    'countable/uncountable nouns': 'sustantivos que se cuentan y que no',
    'daily routine vocabulary': 'palabras de la rutina diaria',
    'demonstratives': 'this / that (este, ese)',
    'demonstratives this/that': 'this / that (este, ese)',
    'ever/never': 'ever / never (alguna vez, nunca)',
    'food vocabulary': 'palabras de comida',
    'frequency adverbs': 'qué tan seguido (always, never...)',
    'future plans': 'planes a futuro',
    'future predictions': 'predicciones',
    'giving advice': 'dar consejos',
    'going to + base form': 'going to + verbo (ir a)',
    'going to future': 'futuro con going to',
    'greetings': 'saludos',
    'have/has + past participle': 'have / has + participio',
    'irregular past participles': 'participios irregulares',
    'modal verbs': 'verbos modales (can, must, should)',
    'modal verbs for advice': 'modales para aconsejar',
    "must/mustn't": "must / mustn't (deber, no deber)",
    'negative form': 'forma negativa',
    'negative sentences': 'oraciones negativas',
    'no "to" after modals': 'sin «to» después de can, must, should',
    'past continuous': 'pasado continuo (was / were + -ing)',
    'past simple': 'pasado simple',
    'past simple irregular': 'pasado simple irregular',
    'past simple regular': 'pasado simple regular',
    'past tense': 'tiempo pasado',
    'plans': 'planes',
    'plans and intentions': 'planes e intenciones',
    'predictions': 'predicciones',
    'prepositions of place': 'dónde está algo (in, on, under...)',
    'present perfect': 'presente perfecto',
    'present simple': 'presente simple',
    'present simple affirmative': 'presente simple afirmativo',
    'present simple negative': 'presente simple negativo',
    'present simple questions': 'preguntas en presente simple',
    'should/must': 'should / must (deberías, debes)',
    'should/must + base form': 'should / must + verbo',
    "should/shouldn't": "should / shouldn't (deberías, no deberías)",
    'singular/plural': 'singular y plural',
    'some/any': 'some / any (algo de, nada de)',
    'storytelling': 'contar una historia',
    'subject pronoun': 'pronombre (I, you, she...)',
    'subject pronouns': 'pronombres (I, you, she...)',
    'subject-verb agreement': 'que el verbo concuerde con quién',
    'superlative adjectives': 'el más... (superlativos)',
    'the + -est': 'the + -est (el más)',
    'the + -est / the most': 'the + -est / the most (el más)',
    'the + -est vs the most': 'the + -est o the most (el más)',
    'there is/are': 'there is / are (hay)',
    'third person -s': 'la -s de he, she, it',
    'took/went': 'took / went (pasados irregulares)',
    'travel vocabulary': 'palabras de viaje',
    'verb to be': 'verbo to be (ser, estar)',
    'was/were + -ing': 'was / were + -ing',
    'was/were agreement': 'was o were según quién',
    'went/saw': 'went / saw (pasados irregulares)',
    'while': 'while (mientras)',
    'will + base form': 'will + verbo',
    'will future': 'futuro con will',
    "will/won't": "will / won't",
};

/** In Spanish when the interface is; with the interface in English, the prompt's own name. */
export const grammarLabel = (tag: string): string => (i18n.language?.startsWith('en') ? tag : LABELS[tag] ?? tag);

// The instructions of the A1 and A2 review exercises, written in English, in Spanish
const PROMPTS: Record<string, string> = {
    'Which is correct?': '¿Cuál es correcta?',
    'Which sentence is correct?': '¿Qué oración es correcta?',
    'Which spelling is correct?': '¿Cuál se escribe bien?',
    'Which is a correct question?': '¿Cuál es una pregunta correcta?',
    'Which question is correct?': '¿Qué pregunta es correcta?',
    'Which is a correct imperative?': '¿Cuál es una orden correcta?',
    'Which is uncountable?': '¿Cuál no se puede contar?',
    'Which noun is countable?': '¿Qué sustantivo se puede contar?',
    'Which gives advice?': '¿Cuál da un consejo?',
    'Which expresses a future plan?': '¿Cuál dice un plan a futuro?',
    'Which word has an extra syllable when you add -ed?': '¿Qué palabra gana una sílaba al ponerle -ed?',
    'Where does the adverb go?': '¿Dónde va el adverbio?',
    'Where is the picture?': '¿Dónde está el cuadro (the picture)?',
    'A teacher says to the class:': 'Una maestra le dice al grupo:',
    'You hold two photos. You say:': 'Tienes dos fotos en la mano. Dices:',
    'You point to a car across the street. You say:': 'Señalas un carro al otro lado de la calle. Dices:',
};

const PROMPT_PATTERNS: [RegExp, (...parts: string[]) => string][] = [
    [/^Arrange: (.+)$/, words => `Ordena: ${words}`],
    [/^How do you answer: "(.+)"\??$/, question => `¿Cómo respondes a «${question}»?`],
    [/^How is -ed pronounced in "(.+)"\?$/, word => `¿Cómo suena la -ed en «${word}»?`],
    [/^The -ed in "(.+)" sounds like:$/, word => `La -ed de «${word}» suena como:`],
    [/^What is the past of "(.+)"\?$/, word => `¿Cuál es el pasado de «${word}»?`],
    [/^What is the full form of "(.+)"\?$/, word => `¿Cuál es la forma completa de «${word}»?`],
    [/^Select the correct contraction for "(.+)"$/, words => `Elige la contracción de «${words}»`],
    [/^Which means the same as "(.+)"\?$/, sentence => `¿Cuál significa lo mismo que «${sentence}»?`],
    [/^Which means "(.+)"\?$/, meaning => `¿Cuál significa «${meaning}»?`],
];

/**
 * The instruction of a review exercise of `unitId`, in Spanish when the interface is and the unit is
 * A1 or A2; B1 and B2 keep their English. A prompt that is the English sentence itself («She ___ a
 * teacher.») stays as it is.
 */
export function skillPrompt(prompt: string, unitId: string): string {
    if (i18n.language?.startsWith('en') || !/^a[12]-/.test(unitId)) return prompt;
    if (PROMPTS[prompt]) return PROMPTS[prompt];
    for (const [pattern, write] of PROMPT_PATTERNS) {
        const match = prompt.match(pattern);
        if (match) return write(...match.slice(1));
    }
    return prompt;
}
