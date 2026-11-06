/**
 * Grammar terms the explanations use without defining them («sujeto», «participio»…). Tapping one in
 * a grammar card opens its definition. The explanations are written in Spanish, so the glossary is too.
 *
 * `forms` are the spellings found in the text, in lower case. When two forms overlap, the longest one
 * wins («verbo auxiliar» before «verbo»), so they can share words.
 */
export interface GlossaryEntry {
    id: string;
    term: string;
    forms: string[];
    definition: string;
    example: string;
}

export const GLOSSARY: GlossaryEntry[] = [
    // Words and their kinds
    {
        id: 'sustantivo',
        term: 'Sustantivo',
        forms: ['sustantivo', 'sustantivos'],
        definition: 'Palabra que nombra a una persona, un animal, una cosa o una idea.',
        example: 'teacher, dog, book, love',
    },
    {
        id: 'contable',
        term: 'Sustantivo contable',
        forms: ['contable', 'contables', 'que se puede contar', 'que se pueden contar'],
        definition: 'Sustantivo que se cuenta por unidades: tiene singular y plural, y en singular lleva «a» o «an».',
        example: 'an apple, two apples',
    },
    {
        id: 'incontable',
        term: 'Sustantivo incontable',
        forms: ['incontable', 'incontables', 'que no se puede contar', 'que no se pueden contar'],
        definition: 'Sustantivo que no se cuenta por unidades: no tiene plural ni lleva «a» o «an».',
        example: 'water, music, information',
    },
    {
        id: 'singular',
        term: 'Singular',
        forms: ['singular', 'singulares'],
        definition: 'Forma que habla de una sola persona o cosa.',
        example: 'a book, she is',
    },
    {
        id: 'plural',
        term: 'Plural',
        forms: ['plural', 'plurales'],
        definition: 'Forma que habla de dos o más personas o cosas. En inglés casi siempre se le agrega -s al sustantivo.',
        example: 'two books, they are',
    },
    {
        id: 'verbo',
        term: 'Verbo',
        forms: ['verbo', 'verbos'],
        definition: 'Palabra que dice qué hace alguien o cómo está algo.',
        example: 'run, eat, be, have',
    },
    {
        id: 'adjetivo',
        term: 'Adjetivo',
        forms: ['adjetivo', 'adjetivos'],
        definition: 'Palabra que describe a un sustantivo. En inglés va antes del sustantivo y no cambia en plural.',
        example: 'a big house, big houses',
    },
    {
        id: 'adverbio',
        term: 'Adverbio',
        forms: ['adverbio', 'adverbios'],
        definition: 'Palabra que dice cómo, cuándo, dónde o qué tan seguido pasa algo. Muchos terminan en -ly.',
        example: 'quickly, always, here',
    },
    {
        id: 'pronombre',
        term: 'Pronombre',
        forms: ['pronombre', 'pronombres'],
        definition: 'Palabra que toma el lugar de un sustantivo para no repetirlo.',
        example: 'Ana is tired. She is tired.',
    },
    {
        id: 'posesivo',
        term: 'Posesivo',
        forms: ['posesivo', 'posesivos'],
        definition: 'Palabra que dice de quién es algo.',
        example: 'my book, your car, it is mine',
    },
    {
        id: 'articulo',
        term: 'Artículo',
        forms: ['artículo', 'artículos'],
        definition: 'Palabra corta que va antes de un sustantivo y dice si hablamos de algo en general o de algo que ya conocemos.',
        example: 'a, an, the',
    },
    {
        id: 'demostrativo',
        term: 'Demostrativo',
        forms: ['demostrativo', 'demostrativos'],
        definition: 'Palabra que señala algo según esté cerca o lejos de quien habla.',
        example: 'this, that, these, those',
    },
    {
        id: 'preposicion',
        term: 'Preposición',
        forms: ['preposición', 'preposiciones'],
        definition: 'Palabra corta que une ideas y marca lugar, tiempo o dirección.',
        example: 'in, on, at, to, from',
    },
    {
        id: 'conector',
        term: 'Conector',
        forms: ['conector', 'conectores', 'conjunción', 'conjunciones'],
        definition: 'Palabra que une dos ideas o dos oraciones.',
        example: 'and, but, because, although',
    },
    {
        id: 'cuantificador',
        term: 'Cuantificador',
        forms: ['cuantificador', 'cuantificadores'],
        definition: 'Palabra que dice cuánto o cuántos hay de algo.',
        example: 'some, any, much, many, a lot of',
    },

    // Parts of a sentence
    {
        id: 'sujeto',
        term: 'Sujeto',
        forms: ['sujeto', 'sujetos'],
        definition: 'Quién o qué hace la acción. En inglés va antes del verbo y nunca se omite.',
        example: 'She works here. It is cold.',
    },
    {
        id: 'objeto',
        term: 'Objeto',
        forms: ['objeto directo', 'objeto indirecto', 'pronombre objeto', 'pronombres objeto', 'pronombres de objeto'],
        definition: 'Quién o qué recibe la acción del verbo. En inglés va después del verbo.',
        example: 'I called her. She gave me the keys.',
    },
    {
        id: 'clausula',
        term: 'Cláusula',
        forms: ['cláusula', 'cláusulas'],
        definition: 'Parte de una oración que tiene su propio sujeto y su propio verbo.',
        example: 'I stayed home | because it was raining.',
    },
    {
        id: 'clausula-relativa',
        term: 'Cláusula relativa',
        forms: ['cláusula relativa', 'cláusulas relativas', 'oración relativa', 'oraciones relativas'],
        definition: 'Cláusula que da información sobre un sustantivo. Empieza con who, which, that, where o whose.',
        example: 'The woman who lives next door is a doctor.',
    },
    {
        id: 'pronombre-relativo',
        term: 'Pronombre relativo',
        forms: ['pronombre relativo', 'pronombres relativos'],
        definition: 'Palabra que abre una cláusula relativa y apunta al sustantivo que va antes.',
        example: 'who, which, that, whose, where',
    },
    {
        id: 'tercera-persona',
        term: 'Tercera persona',
        forms: ['tercera persona'],
        definition: 'He, she, it o cualquier sustantivo en singular. En presente simple su verbo lleva -s.',
        example: 'She works. The dog runs.',
    },

    // Verb forms
    {
        id: 'verbo-auxiliar',
        term: 'Verbo auxiliar',
        forms: ['verbo auxiliar', 'verbos auxiliares', 'auxiliar', 'auxiliares'],
        definition: 'Verbo que ayuda a otro a formar preguntas, negaciones o tiempos. El significado lo pone el otro verbo.',
        example: 'Do you work? She has eaten.',
    },
    {
        id: 'modal',
        term: 'Verbo modal',
        forms: ['verbo modal', 'verbos modales', 'modal', 'modales'],
        definition: 'Auxiliar que agrega una idea de habilidad, permiso, consejo, obligación o posibilidad. Va con el verbo en forma base y no cambia con el sujeto.',
        example: 'She can swim. You should rest.',
    },
    {
        id: 'modal-perfecto',
        term: 'Modal perfecto',
        forms: ['modal perfecto', 'modales perfectos'],
        definition: 'Modal + have + participio. Sirve para deducir, dudar o lamentar algo del pasado.',
        example: 'She must have left. I should have called.',
    },
    {
        id: 'forma-base',
        term: 'Forma base',
        forms: ['forma base'],
        definition: 'El verbo como aparece en el diccionario, sin «to» y sin terminaciones.',
        example: 'go, eat, be',
    },
    {
        id: 'infinitivo',
        term: 'Infinitivo',
        forms: ['infinitivo', 'infinitivos'],
        definition: 'La forma base del verbo con «to» delante.',
        example: 'I want to go.',
    },
    {
        id: 'gerundio',
        term: 'Gerundio',
        forms: ['gerundio', 'gerundios'],
        definition: 'El verbo con -ing. Forma los tiempos continuos y también funciona como sustantivo.',
        example: 'I am reading. Swimming is fun.',
    },
    {
        id: 'participio',
        term: 'Participio',
        forms: ['participio', 'participios', 'participio pasado', 'participios pasados'],
        definition: 'Forma del verbo de los tiempos perfectos y de la voz pasiva. En los verbos regulares termina en -ed.',
        example: 'I have worked. It was eaten.',
    },
    {
        id: 'participio-presente',
        term: 'Participio presente',
        forms: ['participio presente', 'participios presentes'],
        definition: 'El verbo con -ing cuando describe a un sustantivo o abre una cláusula corta en lugar de una oración completa.',
        example: 'a running man. Feeling tired, I went home.',
    },
    {
        id: 'verbo-regular',
        term: 'Verbo regular',
        forms: ['verbo regular', 'verbos regulares'],
        definition: 'Verbo que forma el pasado y el participio agregando -ed.',
        example: 'work → worked, play → played',
    },
    {
        id: 'verbo-irregular',
        term: 'Verbo irregular',
        forms: ['verbo irregular', 'verbos irregulares'],
        definition: 'Verbo que no usa -ed en el pasado o en el participio: hay que aprender sus formas.',
        example: 'go → went → gone',
    },
    {
        id: 'contraccion',
        term: 'Contracción',
        forms: ['contracción', 'contracciones'],
        definition: 'Dos palabras unidas en una con apóstrofo. Es lo normal al hablar.',
        example: "I am → I'm, do not → don't",
    },
    {
        id: 'imperativo',
        term: 'Imperativo',
        forms: ['imperativo', 'imperativos'],
        definition: 'Forma para dar órdenes, instrucciones o consejos: el verbo en forma base, sin sujeto.',
        example: "Open the door. Don't worry.",
    },
    {
        id: 'comparativo',
        term: 'Comparativo',
        forms: ['comparativo', 'comparativos'],
        definition: 'Forma del adjetivo para comparar dos cosas: -er o more, seguido de than.',
        example: 'taller than, more expensive than',
    },
    {
        id: 'superlativo',
        term: 'Superlativo',
        forms: ['superlativo', 'superlativos'],
        definition: 'Forma del adjetivo para decir que algo es el que más de su grupo: the + -est o the most.',
        example: 'the tallest, the most expensive',
    },

    // Kinds of sentence
    {
        id: 'afirmativo',
        term: 'Afirmativa',
        forms: ['afirmativo', 'afirmativa', 'afirmativos', 'afirmativas'],
        definition: 'Oración que dice que algo sí pasa.',
        example: 'I like coffee.',
    },
    {
        id: 'negativo',
        term: 'Negativa',
        forms: ['forma negativa', 'oración negativa', 'oraciones negativas', 'negativo', 'negativa', 'negativos', 'negativas'],
        definition: 'Oración que dice que algo no pasa. En inglés lleva «not», casi siempre con un auxiliar.',
        example: "I don't like coffee. She isn't here.",
    },
    {
        id: 'interrogativo',
        term: 'Interrogativa',
        forms: ['interrogativo', 'interrogativa', 'interrogativos', 'interrogativas'],
        definition: 'Oración que hace una pregunta. En inglés el auxiliar va antes del sujeto.',
        example: 'Do you like coffee?',
    },

    // Tenses
    {
        id: 'tiempo-verbal',
        term: 'Tiempo verbal',
        forms: ['tiempo verbal', 'tiempos verbales'],
        definition: 'Forma del verbo que dice cuándo pasa algo.',
        example: 'I work / I worked / I will work',
    },
    {
        id: 'presente-simple',
        term: 'Presente simple',
        forms: ['presente simple'],
        definition: 'Tiempo para hábitos, rutinas y cosas que siempre son ciertas.',
        example: 'I work every day. Water boils at 100 °C.',
    },
    {
        id: 'presente-continuo',
        term: 'Presente continuo',
        forms: ['presente continuo', 'presente progresivo'],
        definition: 'Tiempo para lo que pasa ahora o en estos días: am/is/are + verbo con -ing.',
        example: 'I am studying right now.',
    },
    {
        id: 'presente-perfecto',
        term: 'Presente perfecto',
        forms: ['presente perfecto'],
        definition: 'Tiempo que une el pasado con el presente: have/has + participio.',
        example: 'I have lived here for two years.',
    },
    {
        id: 'pasado-simple',
        term: 'Pasado simple',
        forms: ['pasado simple'],
        definition: 'Tiempo para acciones que terminaron en un momento del pasado.',
        example: 'I visited Oaxaca last year.',
    },
    {
        id: 'pasado-continuo',
        term: 'Pasado continuo',
        forms: ['pasado continuo', 'pasado progresivo'],
        definition: 'Tiempo para algo que estaba pasando en un momento del pasado: was/were + verbo con -ing.',
        example: 'I was cooking when you called.',
    },
    {
        id: 'pasado-perfecto',
        term: 'Pasado perfecto',
        forms: ['pasado perfecto'],
        definition: 'Tiempo para algo que pasó antes de otro momento del pasado: had + participio.',
        example: 'The train had left when I arrived.',
    },

    // Bigger structures
    {
        id: 'condicional',
        term: 'Condicional',
        forms: ['condicional', 'condicionales'],
        definition: 'Oración con «if»: dice qué pasa o qué pasaría si se cumple una condición.',
        example: 'If it rains, I stay home.',
    },
    {
        id: 'condicional-cero',
        term: 'Condicional cero',
        forms: ['condicional cero', 'zero conditional'],
        definition: 'Para hechos que siempre se cumplen: if + presente, presente.',
        example: 'If you heat ice, it melts.',
    },
    {
        id: 'primer-condicional',
        term: 'Primer condicional',
        forms: ['primer condicional', 'primera condicional', 'first conditional'],
        definition: 'Para algo posible en el futuro: if + presente, will + verbo.',
        example: 'If it rains, I will stay home.',
    },
    {
        id: 'segundo-condicional',
        term: 'Segundo condicional',
        forms: ['segundo condicional', 'segunda condicional', 'second conditional'],
        definition: 'Para situaciones imaginarias o poco probables: if + pasado, would + verbo.',
        example: 'If I had more time, I would travel.',
    },
    {
        id: 'tercer-condicional',
        term: 'Tercer condicional',
        forms: ['tercer condicional', 'tercera condicional', 'third conditional'],
        definition: 'Para imaginar un pasado distinto que ya no se puede cambiar: if + had + participio, would have + participio.',
        example: 'If I had studied, I would have passed.',
    },
    {
        id: 'voz-pasiva',
        term: 'Voz pasiva',
        forms: ['voz pasiva', 'pasiva', 'pasivas'],
        definition: 'Forma en la que importa quién recibe la acción, no quién la hace: be + participio.',
        example: 'The bridge was built in 1990.',
    },
    {
        id: 'voz-activa',
        term: 'Voz activa',
        forms: ['voz activa'],
        definition: 'La forma normal: el sujeto hace la acción.',
        example: 'They built the bridge in 1990.',
    },
    {
        id: 'estilo-indirecto',
        term: 'Estilo indirecto',
        forms: ['estilo indirecto', 'reported speech'],
        definition: 'Contar lo que alguien dijo sin repetir sus palabras exactas. El verbo suele pasar un tiempo atrás.',
        example: '"I am tired." → She said she was tired.',
    },
    {
        id: 'phrasal-verb',
        term: 'Phrasal verb',
        forms: ['phrasal verb', 'phrasal verbs'],
        definition: 'Verbo + una partícula (up, out, off…) que juntos significan algo nuevo.',
        example: 'give up = rendirse, look after = cuidar',
    },
    {
        id: 'inversion',
        term: 'Inversión',
        forms: ['inversión'],
        definition: 'Poner el auxiliar antes del sujeto, como en una pregunta, para dar énfasis en un registro formal.',
        example: 'Never have I seen such a mess.',
    },

    // Sounds
    {
        id: 'vocal',
        term: 'Sonido vocal',
        forms: ['sonido de vocal', 'sonido vocal', 'sonidos vocales'],
        definition: 'Los sonidos de a, e, i, o, u. Para «a» o «an» cuenta cómo suena la palabra, no la letra con que se escribe.',
        example: 'an apple, an hour',
    },
    {
        id: 'consonante',
        term: 'Sonido consonante',
        forms: ['sonido de consonante', 'sonido consonante', 'sonidos consonantes'],
        definition: 'Cualquier sonido que no es vocal, como b, d, k o y.',
        example: 'a book, a university (suena «yu»)',
    },
    {
        id: 'letra-vocal',
        term: 'Vocal',
        forms: ['vocal', 'vocales'],
        definition: 'Las letras a, e, i, o, u. En las reglas de ortografía cuenta la letra escrita.',
        example: 'play → plays (vocal + y)',
    },
    {
        id: 'letra-consonante',
        term: 'Consonante',
        forms: ['consonante', 'consonantes'],
        definition: 'Cualquier letra que no es vocal, como b, d, t o y.',
        example: 'study → studies (consonante + y)',
    },
    {
        id: 'silaba',
        term: 'Sílaba',
        forms: ['sílaba', 'sílabas'],
        definition: 'Cada golpe de voz en que se divide una palabra.',
        example: 'ap-ple (2), beau-ti-ful (3)',
    },
];

const byId = new Map(GLOSSARY.map(entry => [entry.id, entry]));

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
    return byId.get(id);
}
