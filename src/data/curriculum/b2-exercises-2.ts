import type { GrammarExercise } from '../../lib/db';

export const b2ExercisesPart2: GrammarExercise[] = [
  // ========================
  // UNIT 8: Participle clauses (-ing/-ed as modifiers)
  // ========================
  {
    id: 'ex-b2-u8-1',
    unitId: 'b2-u8',
    type: 'fill-blank',
    question: '___ by the sudden noise, the cat jumped off the table.',
    correctAnswer: 'Startled',
    explanation:
      'Usamos el participio pasado "Startled" porque el sujeto (the cat) recibe la acción de ser asustado. Las cláusulas de participio pasado indican una causa o razón.',
  },
  {
    id: 'ex-b2-u8-2',
    unitId: 'b2-u8',
    type: 'fill-blank',
    question:
      '___ along the riverbank, we noticed a family of ducks swimming nearby.',
    correctAnswer: 'Walking',
    explanation:
      'Usamos el participio presente "Walking" porque el sujeto (we) realiza la acción de caminar. La cláusula de participio describe una acción simultánea.',
  },
  {
    id: 'ex-b2-u8-3',
    unitId: 'b2-u8',
    type: 'multiple-choice',
    question:
      'The letter, ___ in haste, contained several spelling mistakes.',
    correctAnswer: 'written',
    options: ['writing', 'written', 'having write'],
    explanation:
      'Se usa el participio pasado "written" porque la carta fue escrita (voz pasiva). La cláusula de participio funciona como una oración de relativo reducida: "which was written in haste".',
  },
  {
    id: 'ex-b2-u8-4',
    unitId: 'b2-u8',
    type: 'multiple-choice',
    question:
      '___ that the exam was cancelled, the students left the building.',
    correctAnswer: 'Having been told',
    options: ['Having been told', 'Telling', 'Having telling'],
    explanation:
      'Usamos "Having been told" (participio perfecto pasivo) porque los estudiantes recibieron la información antes de irse. Indica una acción pasiva completada antes de la acción principal.',
  },
  {
    id: 'ex-b2-u8-5',
    unitId: 'b2-u8',
    type: 'word-order',
    question:
      'Reorder: a participle clause describing someone exhausted after work.',
    correctAnswer: 'Exhausted from work she fell asleep immediately',
    scrambledWords: [
      'fell',
      'Exhausted',
      'she',
      'immediately',
      'from',
      'asleep',
      'work',
    ],
    explanation:
      'La cláusula de participio pasado "Exhausted from work" va al inicio para describir el estado del sujeto antes de la acción principal.',
  },
  {
    id: 'ex-b2-u8-6',
    unitId: 'b2-u8',
    type: 'word-order',
    question:
      'Reorder: a sentence using a present participle clause about a man.',
    correctAnswer: 'Feeling confident he accepted the job offer',
    scrambledWords: [
      'the',
      'accepted',
      'Feeling',
      'offer',
      'he',
      'confident',
      'job',
    ],
    explanation:
      'La cláusula de participio presente "Feeling confident" describe la razón o estado emocional del sujeto al realizar la acción principal.',
  },

  // ========================
  // UNIT 9: Future Perfect + Future Continuous
  // ========================
  {
    id: 'ex-b2-u9-1',
    unitId: 'b2-u9',
    type: 'fill-blank',
    question:
      'By the time you arrive, I ___ dinner for everyone. (already / prepare)',
    correctAnswer: 'will have already prepared',
    explanation:
      'El futuro perfecto "will have already prepared" indica una acción que estará completada antes de un momento específico en el futuro (cuando llegues).',
  },
  {
    id: 'ex-b2-u9-2',
    unitId: 'b2-u9',
    type: 'fill-blank',
    question:
      "Don't call me at 3 PM. I ___ a presentation at that time. (give)",
    correctAnswer: 'will be giving',
    explanation:
      'El futuro continuo "will be giving" se usa para describir una acción que estará en progreso en un momento específico del futuro.',
  },
  {
    id: 'ex-b2-u9-3',
    unitId: 'b2-u9',
    type: 'multiple-choice',
    question: 'By next July, they ___ married for 25 years.',
    correctAnswer: 'will have been',
    options: ['will be', 'will have been', 'are being'],
    explanation:
      'Usamos el futuro perfecto "will have been" para indicar la duración acumulada de un estado hasta un punto futuro específico (el próximo julio).',
  },
  {
    id: 'ex-b2-u9-4',
    unitId: 'b2-u9',
    type: 'multiple-choice',
    question:
      'This time tomorrow, we ___ over the Atlantic Ocean on our way to New York.',
    correctAnswer: 'will be flying',
    options: ['will fly', 'will have flown', 'will be flying'],
    explanation:
      'El futuro continuo "will be flying" describe una acción que estará en curso en un momento determinado del futuro ("this time tomorrow").',
  },
  {
    id: 'ex-b2-u9-5',
    unitId: 'b2-u9',
    type: 'word-order',
    question: 'Reorder: a future perfect sentence about finishing a book.',
    correctAnswer: 'She will have finished the book by Friday',
    scrambledWords: [
      'Friday',
      'will',
      'finished',
      'She',
      'by',
      'the',
      'have',
      'book',
    ],
    explanation:
      'La estructura del futuro perfecto es "will have + participio pasado". "By Friday" indica el límite temporal antes del cual la acción estará completa.',
  },
  {
    id: 'ex-b2-u9-6',
    unitId: 'b2-u9',
    type: 'word-order',
    question:
      'Reorder: a future continuous sentence about studying at a specific time.',
    correctAnswer: 'At eight tonight I will be studying grammar',
    scrambledWords: [
      'studying',
      'will',
      'tonight',
      'I',
      'grammar',
      'At',
      'eight',
      'be',
    ],
    explanation:
      'La estructura del futuro continuo es "will be + -ing". El marcador temporal "At eight tonight" sitúa la acción en un momento preciso del futuro.',
  },

  // ========================
  // UNIT 10: Phrasal verbs (advanced patterns)
  // ========================
  {
    id: 'ex-b2-u10-1',
    unitId: 'b2-u10',
    type: 'fill-blank',
    question:
      'The company had to ___ hundreds of workers due to the economic crisis.',
    correctAnswer: 'lay off',
    explanation:
      '"Lay off" significa despedir trabajadores, generalmente por razones económicas. Es un phrasal verb separable: "lay workers off" también es correcto.',
  },
  {
    id: 'ex-b2-u10-2',
    unitId: 'b2-u10',
    type: 'fill-blank',
    question:
      "I can't ___ with his constant complaining anymore. It's exhausting.",
    correctAnswer: 'put up',
    explanation:
      '"Put up with" significa tolerar o soportar algo desagradable. Es un phrasal verb de tres palabras inseparable, muy usado en el habla cotidiana.',
  },
  {
    id: 'ex-b2-u10-3',
    unitId: 'b2-u10',
    type: 'multiple-choice',
    question: 'The meeting has been ___ until next Monday due to the storm.',
    correctAnswer: 'put off',
    options: ['put off', 'put out', 'put away'],
    explanation:
      '"Put off" significa posponer o aplazar. "Put out" significa apagar (un fuego) y "put away" significa guardar algo en su lugar.',
  },
  {
    id: 'ex-b2-u10-4',
    unitId: 'b2-u10',
    type: 'multiple-choice',
    question:
      'Scientists are trying to ___ why some people are immune to the virus.',
    correctAnswer: 'figure out',
    options: ['figure out', 'carry out', 'turn out'],
    explanation:
      '"Figure out" significa descubrir o entender algo. "Carry out" significa realizar/ejecutar y "turn out" significa resultar ser.',
  },
  {
    id: 'ex-b2-u10-5',
    unitId: 'b2-u10',
    type: 'word-order',
    question: 'Reorder: a sentence with the phrasal verb "come up with".',
    correctAnswer: 'They came up with a brilliant solution',
    scrambledWords: ['with', 'a', 'They', 'came', 'brilliant', 'up', 'solution'],
    explanation:
      '"Come up with" significa idear o inventar algo. Es un phrasal verb inseparable de tres palabras que se usa mucho en contextos creativos y de resolución de problemas.',
  },
  {
    id: 'ex-b2-u10-6',
    unitId: 'b2-u10',
    type: 'word-order',
    question:
      'Reorder: a sentence with the phrasal verb "look forward to".',
    correctAnswer: 'We are looking forward to the concert',
    scrambledWords: [
      'looking',
      'the',
      'to',
      'We',
      'are',
      'concert',
      'forward',
    ],
    explanation:
      '"Look forward to" significa esperar algo con entusiasmo. Va seguido de un sustantivo o gerundio. Es muy común en registros formales e informales.',
  },

  // ========================
  // UNIT 11: Inversion + cleft sentences (emphasis)
  // ========================
  {
    id: 'ex-b2-u11-1',
    unitId: 'b2-u11',
    type: 'fill-blank',
    question: 'Not only ___ the exam, but she also got the highest score.',
    correctAnswer: 'did she pass',
    explanation:
      'Después de "Not only" al inicio de la oración, se usa inversión del sujeto y auxiliar: "did she pass". Esta estructura enfatiza ambas partes de la oración.',
  },
  {
    id: 'ex-b2-u11-2',
    unitId: 'b2-u11',
    type: 'fill-blank',
    question: 'It ___ the manager who made the final decision, not the team.',
    correctAnswer: 'was',
    explanation:
      'Esta es una oración escindida (cleft sentence) con la estructura "It was... who/that...". Se usa para enfatizar quién realizó la acción.',
  },
  {
    id: 'ex-b2-u11-3',
    unitId: 'b2-u11',
    type: 'multiple-choice',
    question: 'Rarely ___ such a beautiful sunset in this city.',
    correctAnswer: 'do we see',
    options: ['we see', 'do we see', 'we do see'],
    explanation:
      'Después de adverbios negativos como "Rarely" al inicio, se requiere inversión: auxiliar + sujeto + verbo. "Rarely do we see" es la forma correcta.',
  },
  {
    id: 'ex-b2-u11-4',
    unitId: 'b2-u11',
    type: 'multiple-choice',
    question: 'What ___ was his lack of experience, not his attitude.',
    correctAnswer: 'concerned them',
    options: ['concerned them', 'did concern them', 'them concerned'],
    explanation:
      'En la oración pseudo-escindida "What concerned them was...", la cláusula con "What" actúa como sujeto. Se usa para enfatizar el complemento.',
  },
  {
    id: 'ex-b2-u11-5',
    unitId: 'b2-u11',
    type: 'word-order',
    question: 'Reorder: an inverted sentence starting with "Never".',
    correctAnswer: 'Never have I seen such a disaster',
    scrambledWords: ['a', 'have', 'such', 'Never', 'disaster', 'seen', 'I'],
    explanation:
      'Con "Never" al inicio se invierte el orden: "Never + have + sujeto + participio". Esta estructura es formal y enfática.',
  },
  {
    id: 'ex-b2-u11-6',
    unitId: 'b2-u11',
    type: 'word-order',
    question: 'Reorder: a cleft sentence emphasizing "the noise".',
    correctAnswer: 'It was the noise that bothered me most',
    scrambledWords: ['most', 'was', 'the', 'It', 'that', 'me', 'noise', 'bothered'],
    explanation:
      'La oración escindida "It was... that..." permite enfatizar un elemento. Aquí se destaca "the noise" como la causa principal de la molestia.',
  },

  // ========================
  // UNIT 12: Narrative tenses (all tenses in storytelling)
  // ========================
  {
    id: 'ex-b2-u12-1',
    unitId: 'b2-u12',
    type: 'fill-blank',
    question:
      'She ___ for two hours when the phone suddenly rang. (walk)',
    correctAnswer: 'had been walking',
    explanation:
      'El pasado perfecto continuo "had been walking" describe una acción en progreso que ocurría antes de otra acción pasada (the phone rang). Establece el contexto temporal en la narración.',
  },
  {
    id: 'ex-b2-u12-2',
    unitId: 'b2-u12',
    type: 'fill-blank',
    question:
      'By the time the police arrived, the thief ___ through the back window. (escape)',
    correctAnswer: 'had escaped',
    explanation:
      'El pasado perfecto "had escaped" indica que la acción de escapar ocurrió antes de la llegada de la policía. Es esencial en narrativas para ordenar eventos pasados.',
  },
  {
    id: 'ex-b2-u12-3',
    unitId: 'b2-u12',
    type: 'multiple-choice',
    question:
      'While I ___ dinner, I heard a strange noise coming from the garden.',
    correctAnswer: 'was cooking',
    options: ['cooked', 'was cooking', 'had cooked'],
    explanation:
      'El pasado continuo "was cooking" describe una acción en progreso que fue interrumpida por otra acción (heard). Se usa para establecer la escena en narrativas.',
  },
  {
    id: 'ex-b2-u12-4',
    unitId: 'b2-u12',
    type: 'multiple-choice',
    question:
      'He realized he ___ his wallet at the restaurant, so he drove back.',
    correctAnswer: 'had left',
    options: ['left', 'had left', 'was leaving'],
    explanation:
      'El pasado perfecto "had left" se usa porque olvidar la cartera ocurrió antes de darse cuenta. En narrativas, el pasado perfecto marca la acción más antigua.',
  },
  {
    id: 'ex-b2-u12-5',
    unitId: 'b2-u12',
    type: 'word-order',
    question:
      'Reorder: a narrative sentence using the past perfect continuous.',
    correctAnswer: 'They had been waiting for hours before help arrived',
    scrambledWords: [
      'arrived',
      'had',
      'for',
      'They',
      'hours',
      'been',
      'waiting',
      'before',
      'help',
    ],
    explanation:
      'El pasado perfecto continuo "had been waiting" enfatiza la duración de la espera antes de que llegara la ayuda. "Before" conecta las dos acciones en orden cronológico.',
  },
  {
    id: 'ex-b2-u12-6',
    unitId: 'b2-u12',
    type: 'word-order',
    question: 'Reorder: a narrative sentence with past simple and past continuous.',
    correctAnswer: 'The sun was setting when we reached the village',
    scrambledWords: [
      'when',
      'The',
      'reached',
      'was',
      'we',
      'village',
      'setting',
      'sun',
      'the',
    ],
    explanation:
      'El pasado continuo "was setting" describe el fondo de la escena, mientras que el pasado simple "reached" narra la acción principal. Esta combinación es fundamental en la narrativa.',
  },

  // ========================
  // UNIT 13: Connectors + discourse markers (cohesion)
  // ========================
  {
    id: 'ex-b2-u13-1',
    unitId: 'b2-u13',
    type: 'fill-blank',
    question:
      'The project was extremely expensive. ___, the results were disappointing.',
    correctAnswer: 'Furthermore',
    explanation:
      '"Furthermore" es un conector de adición que introduce información adicional que refuerza el argumento anterior. Se usa en escritura formal y ensayos.',
  },
  {
    id: 'ex-b2-u13-2',
    unitId: 'b2-u13',
    type: 'fill-blank',
    question:
      'He studied hard for the test. ___, he failed to pass it.',
    correctAnswer: 'Nevertheless',
    explanation:
      '"Nevertheless" es un marcador de contraste que introduce una idea inesperada o contraria a lo esperado. Equivale a "sin embargo" o "no obstante" en español.',
  },
  {
    id: 'ex-b2-u13-3',
    unitId: 'b2-u13',
    type: 'multiple-choice',
    question:
      'She accepted the offer ___ the salary was lower than expected.',
    correctAnswer: 'even though',
    options: ['even though', 'because', 'so that'],
    explanation:
      '"Even though" introduce una concesión: a pesar de que el salario era bajo, aceptó. "Because" indica causa y "so that" indica propósito, que no encajan aquí.',
  },
  {
    id: 'ex-b2-u13-4',
    unitId: 'b2-u13',
    type: 'multiple-choice',
    question:
      'The economy is improving. ___, unemployment remains a serious issue.',
    correctAnswer: 'However',
    options: ['Therefore', 'However', 'As a result'],
    explanation:
      '"However" introduce un contraste con la idea anterior. "Therefore" y "As a result" indican consecuencia, que no se ajusta al sentido de la oración.',
  },
  {
    id: 'ex-b2-u13-5',
    unitId: 'b2-u13',
    type: 'word-order',
    question: 'Reorder: a sentence using "as a result" as a discourse marker.',
    correctAnswer: 'He missed the bus and as a result arrived late',
    scrambledWords: [
      'arrived',
      'the',
      'He',
      'a',
      'result',
      'missed',
      'and',
      'as',
      'late',
      'bus',
    ],
    explanation:
      '"As a result" es un conector de consecuencia que une la causa (perder el autobús) con el efecto (llegar tarde). Se coloca entre las dos cláusulas.',
  },
  {
    id: 'ex-b2-u13-6',
    unitId: 'b2-u13',
    type: 'word-order',
    question:
      'Reorder: a sentence using "in addition" to add information.',
    correctAnswer: 'In addition the hotel offers free breakfast daily',
    scrambledWords: [
      'free',
      'In',
      'the',
      'offers',
      'hotel',
      'daily',
      'addition',
      'breakfast',
    ],
    explanation:
      '"In addition" es un marcador discursivo de adición que introduce información extra. Se coloca al inicio de la oración seguido del resto de la cláusula.',
  },
];
