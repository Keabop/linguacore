import type { Unit, GrammarCard, GrammarExercise } from '../../lib/db';

export const a1Units: Unit[] = [
  {
    id: 'a1-u1',
    level: 'A1',
    unitNumber: 1,
    title: 'Introducing Yourself',
    grammarTopic: "Verb 'to be' + pronouns",
    theme: 'Greetings, introductions',
    isAssessment: false,
  },
  {
    id: 'a1-u2',
    level: 'A1',
    unitNumber: 2,
    title: 'Things Around Me',
    grammarTopic: 'Articles (a/an/the) + demonstratives (this/that)',
    theme: 'Objects, classroom, colors',
    isAssessment: false,
  },
  {
    id: 'a1-u3',
    level: 'A1',
    unitNumber: 3,
    title: 'My Daily Life',
    grammarTopic: 'Present Simple (affirmative)',
    theme: 'Daily routines, time, days',
    isAssessment: false,
  },
  {
    id: 'a1-u4',
    level: 'A1',
    unitNumber: 4,
    title: 'What Do You Like?',
    grammarTopic: 'Present Simple (negative/questions) + frequency adverbs',
    theme: 'Hobbies, likes/dislikes',
    isAssessment: false,
  },
  {
    id: 'a1-u5',
    level: 'A1',
    unitNumber: 5,
    title: 'Where Is It?',
    grammarTopic: 'There is/are + prepositions of place',
    theme: 'Home, rooms, furniture',
    isAssessment: false,
  },
  {
    id: 'a1-u6',
    level: 'A1',
    unitNumber: 6,
    title: 'I Can Do It!',
    grammarTopic: 'Can/can\'t (ability) + imperatives',
    theme: 'Abilities, giving directions',
    isAssessment: false,
  },
  {
    id: 'a1-u7',
    level: 'A1',
    unitNumber: 7,
    title: 'At the Market',
    grammarTopic: 'Countable/uncountable + some/any',
    theme: 'Food, shopping, numbers',
    isAssessment: false,
  },
  {
    id: 'a1-u8',
    level: 'A1',
    unitNumber: 8,
    title: 'A1 Level Assessment',
    grammarTopic: 'All A1 grammar',
    theme: 'Comprehensive review',
    isAssessment: true,
  },
];

export const a1GrammarCards: GrammarCard[] = [
  {
    id: 'gc-a1-u1',
    unitId: 'a1-u1',
    title: "El verbo 'to be' y los pronombres personales",
    explanation: `<h3>Pronombres personales</h3>
<p><strong>I</strong> (yo), <strong>you</strong> (t\u00fa/usted), <strong>he</strong> (\u00e9l), <strong>she</strong> (ella), <strong>it</strong> (ello), <strong>we</strong> (nosotros), <strong>they</strong> (ellos/ellas)</p>
<h3>Verbo "to be" en presente</h3>
<ul>
<li><strong>I am</strong> (yo soy/estoy)</li>
<li><strong>You/We/They are</strong> (t\u00fa eres, nosotros somos, ellos son)</li>
<li><strong>He/She/It is</strong> (\u00e9l/ella es/est\u00e1)</li>
</ul>
<h3>Contracciones</h3>
<p>I'm, you're, he's, she's, it's, we're, they're</p>
<h3>Negativo</h3>
<p>I'm not, you aren't (are not), he isn't (is not)</p>`,
    examples: [
      'I am a student. \u2192 Yo soy estudiante.',
      'She is from Mexico. \u2192 Ella es de M\u00e9xico.',
      'They are happy. \u2192 Ellos est\u00e1n felices.',
      'It is a book. \u2192 Es un libro.',
      "We aren't tired. \u2192 No estamos cansados.",
    ],
    rules: [
      'Usa "am" solo con "I"',
      'Usa "is" con he, she, it (tercera persona singular)',
      'Usa "are" con you, we, they',
      'En ingl\u00e9s siempre se necesita el sujeto: "It is cold" (no solo "Is cold")',
    ],
  },
  {
    id: 'gc-a1-u2',
    unitId: 'a1-u2',
    title: 'Art\u00edculos y demostrativos',
    explanation: `<h3>Art\u00edculos</h3>
<ul>
<li><strong>a</strong> \u2014 antes de consonante: a book, a car</li>
<li><strong>an</strong> \u2014 antes de vocal: an apple, an egg</li>
<li><strong>the</strong> \u2014 cuando hablamos de algo espec\u00edfico: the teacher (el maestro que conocemos)</li>
</ul>
<h3>Demostrativos</h3>
<ul>
<li><strong>this</strong> (esto/este) \u2014 cerca, singular</li>
<li><strong>that</strong> (eso/ese) \u2014 lejos, singular</li>
<li><strong>these</strong> (estos) \u2014 cerca, plural</li>
<li><strong>those</strong> (esos) \u2014 lejos, plural</li>
</ul>`,
    examples: [
      'This is a pen. \u2192 Esto es un bol\u00edgrafo.',
      'That is an orange. \u2192 Eso es una naranja.',
      'The cat is on the table. \u2192 El gato est\u00e1 en la mesa.',
      'These are my books. \u2192 Estos son mis libros.',
    ],
    rules: [
      'Usa "a" antes de sonido consonante, "an" antes de sonido vocal',
      'Usa "the" cuando ambos saben de qu\u00e9 hablas',
      '"this/these" para cosas cercanas, "that/those" para lejanas',
    ],
  },
  {
    id: 'gc-a1-u3',
    unitId: 'a1-u3',
    title: 'Presente Simple (afirmativo)',
    explanation: `<h3>Estructura</h3>
<p>Sujeto + verbo (base form)</p>
<p>Con <strong>he/she/it</strong> se agrega <strong>-s</strong> o <strong>-es</strong> al verbo.</p>
<h3>Reglas para la tercera persona</h3>
<ul>
<li>Mayor\u00eda: + s \u2192 works, plays, reads</li>
<li>Verbos en -s, -sh, -ch, -x, -o: + es \u2192 goes, watches, washes</li>
<li>Verbos en consonante + y: cambia y \u2192 ies \u2192 studies, carries</li>
</ul>
<h3>Usos</h3>
<p>Rutinas, h\u00e1bitos, hechos generales, horarios.</p>`,
    examples: [
      'I wake up at 7:00. \u2192 Me despierto a las 7:00.',
      'She works in a hospital. \u2192 Ella trabaja en un hospital.',
      'The train leaves at 9:00. \u2192 El tren sale a las 9:00.',
      'We eat breakfast every morning. \u2192 Desayunamos cada ma\u00f1ana.',
    ],
    rules: [
      'Con I/you/we/they: verbo sin cambios',
      'Con he/she/it: agrega -s o -es',
      'Se usa para rutinas, h\u00e1bitos y hechos generales',
    ],
  },
  {
    id: 'gc-a1-u4',
    unitId: 'a1-u4',
    title: 'Presente Simple (negativo y preguntas) + adverbios de frecuencia',
    explanation: `<h3>Negativo</h3>
<ul>
<li>I/You/We/They + <strong>don't</strong> + verbo base</li>
<li>He/She/It + <strong>doesn't</strong> + verbo base (sin -s)</li>
</ul>
<h3>Preguntas</h3>
<ul>
<li><strong>Do</strong> + I/you/we/they + verbo base?</li>
<li><strong>Does</strong> + he/she/it + verbo base?</li>
</ul>
<h3>Adverbios de frecuencia</h3>
<p><strong>always</strong> (siempre) > <strong>usually</strong> (usualmente) > <strong>often</strong> (a menudo) > <strong>sometimes</strong> (a veces) > <strong>rarely</strong> (rara vez) > <strong>never</strong> (nunca)</p>
<p>Van antes del verbo principal: I <strong>always</strong> eat breakfast.</p>`,
    examples: [
      "I don't like coffee. \u2192 No me gusta el caf\u00e9.",
      "She doesn't play tennis. \u2192 Ella no juega tenis.",
      'Do you speak English? \u2192 \u00bfHablas ingl\u00e9s?',
      'I usually walk to school. \u2192 Usualmente camino a la escuela.',
    ],
    rules: [
      "Negativo: don't/doesn't + verbo BASE (sin -s)",
      'Preguntas: Do/Does + sujeto + verbo BASE',
      'Adverbios de frecuencia van ANTES del verbo principal',
      'Con "to be" el adverbio va DESPU\u00c9S: She is always happy',
    ],
  },
  {
    id: 'gc-a1-u5',
    unitId: 'a1-u5',
    title: 'There is / There are + preposiciones de lugar',
    explanation: `<h3>There is / There are</h3>
<ul>
<li><strong>There is</strong> + sustantivo singular/incontable: There is a lamp.</li>
<li><strong>There are</strong> + sustantivo plural: There are two chairs.</li>
<li>Negativo: There <strong>isn't</strong> / There <strong>aren't</strong></li>
<li>Pregunta: <strong>Is there...?</strong> / <strong>Are there...?</strong></li>
</ul>
<h3>Preposiciones de lugar</h3>
<ul>
<li><strong>in</strong> (dentro de), <strong>on</strong> (sobre), <strong>under</strong> (debajo de)</li>
<li><strong>next to</strong> (al lado de), <strong>between</strong> (entre), <strong>behind</strong> (detr\u00e1s de)</li>
<li><strong>in front of</strong> (enfrente de), <strong>above</strong> (encima de)</li>
</ul>`,
    examples: [
      'There is a sofa in the living room. \u2192 Hay un sof\u00e1 en la sala.',
      'There are three bedrooms. \u2192 Hay tres habitaciones.',
      'The cat is under the table. \u2192 El gato est\u00e1 debajo de la mesa.',
      'Is there a park near here? \u2192 \u00bfHay un parque cerca de aqu\u00ed?',
    ],
    rules: [
      '"There is" para singular, "There are" para plural',
      'Las preposiciones van despu\u00e9s del verbo: The book is ON the table',
      'Pregunta: Is there / Are there + ...?',
    ],
  },
  {
    id: 'gc-a1-u6',
    unitId: 'a1-u6',
    title: 'Can / Can\'t + imperativos',
    explanation: `<h3>Can (poder / saber)</h3>
<ul>
<li>Afirmativo: Sujeto + <strong>can</strong> + verbo base</li>
<li>Negativo: Sujeto + <strong>can't</strong> (cannot)</li>
<li>Pregunta: <strong>Can</strong> + sujeto + verbo base?</li>
</ul>
<p>"Can" NO cambia con he/she/it \u2014 siempre es "can".</p>
<h3>Imperativos (\u00f3rdenes/instrucciones)</h3>
<ul>
<li>Afirmativo: Verbo base: <strong>Open</strong> the door. <strong>Turn</strong> left.</li>
<li>Negativo: <strong>Don't</strong> + verbo: <strong>Don't</strong> run. <strong>Don't</strong> touch that.</li>
</ul>`,
    examples: [
      'I can swim. \u2192 Yo s\u00e9 nadar.',
      "She can't drive. \u2192 Ella no sabe manejar.",
      'Can you help me? \u2192 \u00bfPuedes ayudarme?',
      'Turn right at the corner. \u2192 Gira a la derecha en la esquina.',
    ],
    rules: [
      '"Can" es igual para TODOS los sujetos (no se agrega -s)',
      'Despu\u00e9s de "can" siempre va el verbo en forma base',
      'Los imperativos no llevan sujeto \u2014 empiezan directamente con el verbo',
    ],
  },
  {
    id: 'gc-a1-u7',
    unitId: 'a1-u7',
    title: 'Contables e incontables + some/any',
    explanation: `<h3>Sustantivos contables e incontables</h3>
<ul>
<li><strong>Contables:</strong> se pueden contar \u2192 a banana, two bananas, three eggs</li>
<li><strong>Incontables:</strong> no se pueden contar \u2192 water, rice, money, bread, information</li>
</ul>
<h3>Some y Any</h3>
<ul>
<li><strong>Some</strong> \u2192 oraciones afirmativas y ofrecimientos: I have some apples. Would you like some tea?</li>
<li><strong>Any</strong> \u2192 oraciones negativas y preguntas: I don't have any milk. Do you have any questions?</li>
</ul>
<h3>How much / How many</h3>
<ul>
<li><strong>How many</strong> + contable plural: How many eggs do we need?</li>
<li><strong>How much</strong> + incontable: How much water do you want?</li>
</ul>`,
    examples: [
      'I need some eggs. \u2192 Necesito algunos huevos.',
      "There isn't any bread. \u2192 No hay pan.",
      'How much sugar do you want? \u2192 \u00bfCu\u00e1nta az\u00facar quieres?',
      'How many students are there? \u2192 \u00bfCu\u00e1ntos estudiantes hay?',
    ],
    rules: [
      '"Some" en afirmativo, "any" en negativo y preguntas',
      '"How many" para contables, "How much" para incontables',
      'Los incontables NUNCA llevan "a/an" ni plural',
    ],
  },
];

export const a1Exercises: GrammarExercise[] = [
  // ===== Unit 1: Verb "to be" =====
  { id: 'ex-a1-u1-1', unitId: 'a1-u1', type: 'fill-blank', question: 'I ___ a student.', correctAnswer: 'am', explanation: 'Con "I" siempre se usa "am".' },
  { id: 'ex-a1-u1-2', unitId: 'a1-u1', type: 'fill-blank', question: 'They ___ from Brazil.', correctAnswer: 'are', explanation: 'Con "they" se usa "are".' },
  { id: 'ex-a1-u1-3', unitId: 'a1-u1', type: 'multiple-choice', question: 'She ___ a teacher.', correctAnswer: 'is', options: ['am', 'is', 'are'], explanation: 'Con "she" (tercera persona singular) se usa "is".' },
  { id: 'ex-a1-u1-4', unitId: 'a1-u1', type: 'multiple-choice', question: 'We ___ happy today.', correctAnswer: 'are', options: ['am', 'is', 'are'], explanation: 'Con "we" se usa "are".' },
  { id: 'ex-a1-u1-5', unitId: 'a1-u1', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'They are my friends.', scrambledWords: ['friends.', 'are', 'They', 'my'], explanation: 'Estructura: Sujeto + verbo to be + complemento.' },
  { id: 'ex-a1-u1-6', unitId: 'a1-u1', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'I am not tired.', scrambledWords: ['not', 'I', 'tired.', 'am'], explanation: 'Negativo de "to be": Sujeto + am/is/are + not.' },

  // ===== Unit 2: Articles + demonstratives =====
  { id: 'ex-a1-u2-1', unitId: 'a1-u2', type: 'fill-blank', question: 'This is ___ apple.', correctAnswer: 'an', explanation: '"Apple" empieza con vocal, se usa "an".' },
  { id: 'ex-a1-u2-2', unitId: 'a1-u2', type: 'fill-blank', question: '___ is my pencil. (near)', correctAnswer: 'This', explanation: '"This" se usa para objetos cercanos en singular.' },
  { id: 'ex-a1-u2-3', unitId: 'a1-u2', type: 'multiple-choice', question: 'I want ___ book on the shelf over there.', correctAnswer: 'that', options: ['this', 'that', 'a'], explanation: '"That" se usa para objetos lejanos.' },
  { id: 'ex-a1-u2-4', unitId: 'a1-u2', type: 'multiple-choice', question: '___ are your keys? (far)', correctAnswer: 'Those', options: ['This', 'These', 'Those'], explanation: '"Those" es el plural de "that" (lejos).' },
  { id: 'ex-a1-u2-5', unitId: 'a1-u2', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'This is a red pen.', scrambledWords: ['a', 'This', 'pen.', 'red', 'is'], explanation: 'Estructura: Demostrativo + is + art\u00edculo + adjetivo + sustantivo.' },
  { id: 'ex-a1-u2-6', unitId: 'a1-u2', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'Those are the new chairs.', scrambledWords: ['new', 'Those', 'the', 'chairs.', 'are'], explanation: '"Those are" para plural lejano.' },

  // ===== Unit 3: Present Simple affirmative =====
  { id: 'ex-a1-u3-1', unitId: 'a1-u3', type: 'fill-blank', question: 'She ___ (work) in a hospital.', correctAnswer: 'works', explanation: 'Con "she" se agrega -s: work \u2192 works.' },
  { id: 'ex-a1-u3-2', unitId: 'a1-u3', type: 'fill-blank', question: 'He ___ (watch) TV every night.', correctAnswer: 'watches', explanation: 'Verbos terminados en -ch agregan -es: watch \u2192 watches.' },
  { id: 'ex-a1-u3-3', unitId: 'a1-u3', type: 'multiple-choice', question: 'They ___ breakfast at 8:00.', correctAnswer: 'eat', options: ['eat', 'eats', 'eating'], explanation: 'Con "they" el verbo no cambia.' },
  { id: 'ex-a1-u3-4', unitId: 'a1-u3', type: 'multiple-choice', question: 'Maria ___ to school every day.', correctAnswer: 'goes', options: ['go', 'goes', 'gos'], explanation: 'Verbos en -o agregan -es: go \u2192 goes.' },
  { id: 'ex-a1-u3-5', unitId: 'a1-u3', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'I wake up at seven.', scrambledWords: ['at', 'wake', 'seven.', 'I', 'up'], explanation: 'Estructura: Sujeto + verbo + complemento.' },
  { id: 'ex-a1-u3-6', unitId: 'a1-u3', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'She studies English every day.', scrambledWords: ['every', 'She', 'English', 'studies', 'day.'], explanation: 'Con "she": study \u2192 studies (consonante + y \u2192 ies).' },

  // ===== Unit 4: Present Simple negative/questions + adverbs =====
  { id: 'ex-a1-u4-1', unitId: 'a1-u4', type: 'fill-blank', question: "I ___ like coffee.", correctAnswer: "don't", explanation: "Negativo con I/you/we/they: don't + verbo base." },
  { id: 'ex-a1-u4-2', unitId: 'a1-u4', type: 'fill-blank', question: "___ she speak French?", correctAnswer: 'Does', explanation: 'Preguntas con he/she/it: Does + sujeto + verbo base.' },
  { id: 'ex-a1-u4-3', unitId: 'a1-u4', type: 'multiple-choice', question: "He ___ play guitar.", correctAnswer: "doesn't", options: ["don't", "doesn't", "isn't"], explanation: "Negativo con he/she/it: doesn't + verbo base." },
  { id: 'ex-a1-u4-4', unitId: 'a1-u4', type: 'multiple-choice', question: 'I ___ go to the gym. (100% of the time)', correctAnswer: 'always', options: ['never', 'sometimes', 'always'], explanation: '"Always" significa siempre (100%).' },
  { id: 'ex-a1-u4-5', unitId: 'a1-u4', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: "Do you like pizza?", scrambledWords: ['like', 'you', 'Do', 'pizza?'], explanation: 'Pregunta: Do + sujeto + verbo base.' },
  { id: 'ex-a1-u4-6', unitId: 'a1-u4', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'She usually reads before bed.', scrambledWords: ['reads', 'She', 'bed.', 'before', 'usually'], explanation: 'El adverbio de frecuencia va antes del verbo principal.' },

  // ===== Unit 5: There is/are + prepositions =====
  { id: 'ex-a1-u5-1', unitId: 'a1-u5', type: 'fill-blank', question: 'There ___ a park near my house.', correctAnswer: 'is', explanation: '"A park" es singular, se usa "There is".' },
  { id: 'ex-a1-u5-2', unitId: 'a1-u5', type: 'fill-blank', question: 'The keys are ___ the table.', correctAnswer: 'on', explanation: '"On" significa sobre una superficie.' },
  { id: 'ex-a1-u5-3', unitId: 'a1-u5', type: 'multiple-choice', question: 'There ___ three cats in the garden.', correctAnswer: 'are', options: ['is', 'are', 'be'], explanation: '"Three cats" es plural, se usa "There are".' },
  { id: 'ex-a1-u5-4', unitId: 'a1-u5', type: 'multiple-choice', question: 'The lamp is ___ the desk.', correctAnswer: 'on', options: ['in', 'on', 'under'], explanation: 'La l\u00e1mpara est\u00e1 SOBRE el escritorio \u2192 "on".' },
  { id: 'ex-a1-u5-5', unitId: 'a1-u5', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'There are two windows in the room.', scrambledWords: ['the', 'There', 'windows', 'room.', 'in', 'are', 'two'], explanation: 'There are + cantidad + sustantivo + preposici\u00f3n + lugar.' },
  { id: 'ex-a1-u5-6', unitId: 'a1-u5', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'Is there a bathroom near here?', scrambledWords: ['a', 'near', 'Is', 'bathroom', 'there', 'here?'], explanation: 'Pregunta: Is there + sustantivo + lugar.' },

  // ===== Unit 6: Can/can't + imperatives =====
  { id: 'ex-a1-u6-1', unitId: 'a1-u6', type: 'fill-blank', question: 'She ___ speak three languages.', correctAnswer: 'can', explanation: '"Can" expresa habilidad. No cambia con he/she/it.' },
  { id: 'ex-a1-u6-2', unitId: 'a1-u6', type: 'fill-blank', question: "___ run in the hallway!", correctAnswer: "Don't", explanation: 'Imperativo negativo: Don\'t + verbo base.' },
  { id: 'ex-a1-u6-3', unitId: 'a1-u6', type: 'multiple-choice', question: '___ you play the piano?', correctAnswer: 'Can', options: ['Can', 'Do', 'Are'], explanation: 'Para preguntar sobre habilidad se usa "Can".' },
  { id: 'ex-a1-u6-4', unitId: 'a1-u6', type: 'multiple-choice', question: "___ the door, please.", correctAnswer: 'Open', options: ['Open', 'Opens', 'Opening'], explanation: 'Los imperativos usan el verbo en forma base, sin sujeto.' },
  { id: 'ex-a1-u6-5', unitId: 'a1-u6', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: "I can't drive a car.", scrambledWords: ['a', "can't", 'drive', 'I', 'car.'], explanation: "Negativo: Sujeto + can't + verbo base." },
  { id: 'ex-a1-u6-6', unitId: 'a1-u6', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'Turn left at the corner.', scrambledWords: ['the', 'Turn', 'at', 'left', 'corner.'], explanation: 'Imperativo: Verbo + direcci\u00f3n + lugar.' },

  // ===== Unit 7: Countable/uncountable + some/any =====
  { id: 'ex-a1-u7-1', unitId: 'a1-u7', type: 'fill-blank', question: 'I need ___ milk. (affirmative)', correctAnswer: 'some', explanation: '"Some" se usa en oraciones afirmativas.' },
  { id: 'ex-a1-u7-2', unitId: 'a1-u7', type: 'fill-blank', question: "There isn't ___ bread left.", correctAnswer: 'any', explanation: '"Any" se usa en oraciones negativas.' },
  { id: 'ex-a1-u7-3', unitId: 'a1-u7', type: 'multiple-choice', question: 'How ___ water do you drink per day?', correctAnswer: 'much', options: ['many', 'much', 'some'], explanation: '"Water" es incontable \u2192 How much.' },
  { id: 'ex-a1-u7-4', unitId: 'a1-u7', type: 'multiple-choice', question: 'How ___ apples do we need?', correctAnswer: 'many', options: ['many', 'much', 'any'], explanation: '"Apples" es contable plural \u2192 How many.' },
  { id: 'ex-a1-u7-5', unitId: 'a1-u7', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'Do you have any questions?', scrambledWords: ['any', 'have', 'Do', 'you', 'questions?'], explanation: '"Any" en preguntas.' },
  { id: 'ex-a1-u7-6', unitId: 'a1-u7', type: 'word-order', question: 'Ordena para formar una oraci\u00f3n:', correctAnswer: 'I would like some rice, please.', scrambledWords: ['some', 'I', 'rice,', 'like', 'please.', 'would'], explanation: '"Some" en ofrecimientos y peticiones.' },
];
