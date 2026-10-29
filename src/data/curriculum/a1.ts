import type { GrammarCard, GrammarExercise } from '../../lib/db';

export { a1Units } from './units';

export const a1GrammarCards: GrammarCard[] = [
  // ===== Unit 1: Verb "to be" + pronouns =====
  {
    id: 'gc-a1-u1',
    unitId: 'a1-u1',
    title: "El verbo 'to be' y los pronombres personales",
    explanation: `<h3>¿Qué es el verbo "to be"?</h3>
<p>"To be" equivale a <strong>ser</strong> y <strong>estar</strong> al mismo tiempo. Se usa para decir quién eres, de dónde eres, tu edad, tu profesión, cómo te sientes y dónde está algo.</p>

<h3>Pronombres personales</h3>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td><strong>I</strong></td><td>yo (siempre con mayúscula)</td></tr>
<tr><td><strong>you</strong></td><td>tú, usted, ustedes</td></tr>
<tr><td><strong>he / she</strong></td><td>él / ella</td></tr>
<tr><td><strong>it</strong></td><td>cosas, animales, el clima, la hora</td></tr>
<tr><td><strong>we / they</strong></td><td>nosotros / ellos, ellas</td></tr>
</table>

<h3>Afirmativo</h3>
<ul>
<li><strong>I am</strong> → I'm</li>
<li><strong>He / She / It is</strong> → he's, she's, it's</li>
<li><strong>You / We / They are</strong> → you're, we're, they're</li>
</ul>

<h3>Negativo: am / is / are + not</h3>
<p>I'm not · he <strong>isn't</strong> (is not) · they <strong>aren't</strong> (are not). Con "I" no existe "amn't": se dice <strong>I'm not</strong>.</p>

<h3>Preguntas: el verbo va antes del sujeto</h3>
<ul>
<li><strong>Are you</strong> a student? → Yes, I am. / No, I'm not.</li>
<li><strong>Is she</strong> from Peru? → Yes, she is. / No, she isn't.</li>
</ul>
<p>En las respuestas cortas afirmativas no se contrae: "Yes, I am" (no "Yes, I'm").</p>

<h3>Errores típicos</h3>
<ul>
<li>"<s>I have 20 years</s>" → <strong>I'm 20 (years old)</strong>. La edad se dice con "to be", no con "have".</li>
<li>"<s>Is cold</s>" → <strong>It's cold</strong>. En inglés la oración siempre necesita sujeto.</li>
<li>"<s>She is hungry?</s>" → <strong>Is she hungry?</strong> Para preguntar, el verbo cambia de lugar.</li>
<li>"<s>I am agree</s>" → <strong>I agree</strong>. "Agree" ya es verbo: no lleva "to be".</li>
</ul>`,
    examples: [
      'I am a student. → Yo soy estudiante.',
      'She is from Mexico. → Ella es de México.',
      "I'm 25 years old. → Tengo 25 años.",
      "It's cold today. → Hoy hace frío.",
      "We aren't tired. → No estamos cansados.",
      'Are they your parents? → ¿Son ellos tus papás?',
      "Is the bank open? No, it isn't. → ¿Está abierto el banco? No.",
    ],
    rules: [
      'Usa "am" solo con "I"',
      'Usa "is" con he, she, it (tercera persona singular)',
      'Usa "are" con you, we, they',
      'Siempre pon sujeto: "It is cold", nunca solo "Is cold"',
      'La edad va con "to be": "I am 20", no "I have 20 years"',
      'Preguntas: am/is/are + sujeto: "Are you ready?"',
    ],
  },

  // ===== Unit 2: Articles + demonstratives =====
  {
    id: 'gc-a1-u2',
    unitId: 'a1-u2',
    title: 'Artículos y demostrativos',
    explanation: `<h3>Artículos indefinidos: a / an</h3>
<p>Significan <strong>un / una</strong> y van solo con sustantivos singulares que se pueden contar. La elección depende del <strong>sonido</strong> con que empieza la palabra, no de la letra:</p>
<ul>
<li><strong>a</strong> + sonido de consonante: a book, a car, <strong>a university</strong> (suena "yu")</li>
<li><strong>an</strong> + sonido de vocal: an apple, an egg, <strong>an hour</strong> (la h no suena)</li>
</ul>

<h3>Artículo definido: the</h3>
<p><strong>The</strong> equivale a el, la, los, las. No cambia con el género ni con el número: the boy, the girls, the house. Se usa cuando los dos sabemos de qué cosa hablamos: "Close <strong>the</strong> door" (la puerta de este cuarto).</p>

<h3>Sin artículo</h3>
<p>Para hablar de algo en general con plurales o incontables no se pone artículo: "<strong>Dogs</strong> are friendly", "I like <strong>music</strong>".</p>

<h3>Demostrativos</h3>
<table>
<tr><th></th><th>Cerca</th><th>Lejos</th></tr>
<tr><td>Singular</td><td><strong>this</strong> (este, esta, esto)</td><td><strong>that</strong> (ese, aquel, eso)</td></tr>
<tr><td>Plural</td><td><strong>these</strong> (estos, estas)</td><td><strong>those</strong> (esos, aquellos)</td></tr>
</table>
<p>Pueden ir solos ("<strong>This</strong> is my bag") o antes del sustantivo ("<strong>these</strong> shoes").</p>

<h3>Errores típicos</h3>
<ul>
<li>"<s>She is teacher</s>" → <strong>She is a teacher</strong>. Una profesión en singular lleva "a/an" (en plural no: "They are teachers").</li>
<li>"<s>The life is hard</s>" → <strong>Life is hard</strong>. En general, sin "the".</li>
<li>"<s>This shoes are new</s>" → <strong>These shoes are new</strong>. El demostrativo también va en plural.</li>
<li>"<s>a apple</s>" → <strong>an apple</strong>. Antes de sonido vocal, "an".</li>
</ul>`,
    examples: [
      'This is a pen. → Esto es un bolígrafo.',
      'That is an orange. → Eso es una naranja.',
      'The cat is on the table. → El gato está en la mesa.',
      'These are my books. → Estos son mis libros.',
      'My brother is an engineer. → Mi hermano es ingeniero.',
      'I love music. → Me encanta la música.',
      'Are those your keys? → ¿Esas son tus llaves?',
    ],
    rules: [
      'Usa "a" antes de sonido consonante, "an" antes de sonido vocal',
      'Una profesión en singular lleva "a/an": "She is a doctor"',
      '"The" es para algo concreto que los dos conocemos',
      'Para hablar en general no uses "the": "Life is beautiful"',
      'this/these = cerca; that/those = lejos',
      'El demostrativo concuerda en número: "this book", "these books"',
    ],
  },

  // ===== Unit 3: Present simple (affirmative) =====
  {
    id: 'gc-a1-u3',
    unitId: 'a1-u3',
    title: 'Presente Simple (afirmativo)',
    explanation: `<h3>¿Cuándo se usa?</h3>
<p>El Presente Simple sirve para <strong>rutinas y hábitos</strong> (I get up at seven), <strong>hechos que siempre son verdad</strong> (Water boils at 100 °C) y <strong>gustos y situaciones permanentes</strong> (She lives in Lima).</p>

<h3>Estructura</h3>
<p><strong>Sujeto + verbo en forma base</strong>: I work, you work, we work, they work.</p>
<p>Con <strong>he / she / it</strong> el verbo lleva <strong>-s</strong>: he work<strong>s</strong>, she work<strong>s</strong>, it work<strong>s</strong>. Es el único cambio.</p>

<h3>Ortografía de la -s</h3>
<ul>
<li><strong>Mayoría de verbos:</strong> + s → play → plays, read → reads</li>
<li><strong>Terminados en -s, -sh, -ch, -x, -o:</strong> + es → watch → watches, go → goes, do → does</li>
<li><strong>Consonante + y:</strong> y → ies → study → studies, fly → flies</li>
<li><strong>Vocal + y:</strong> solo + s → play → plays, buy → buys</li>
<li><strong>Irregular:</strong> have → <strong>has</strong></li>
</ul>

<h3>Cómo suena la -s</h3>
<ul>
<li><strong>/s/</strong> después de sonidos como p, t, k, f: works, eats, sleeps</li>
<li><strong>/z/</strong> después de vocales y la mayoría de consonantes: plays, lives, reads</li>
<li><strong>/ɪz/</strong> (una sílaba más) después de s, sh, ch, x: watches, washes, fixes</li>
</ul>

<h3>Palabras que suelen acompañarlo</h3>
<p>every day, every morning, on Mondays, at the weekend, in the evening.</p>

<h3>Errores típicos</h3>
<ul>
<li>"<s>She work in a bank</s>" → <strong>She works in a bank</strong>. No olvides la -s con he/she/it.</li>
<li>"<s>He haves a car</s>" → <strong>He has a car</strong>. "Have" es irregular.</li>
<li>"<s>I am work every day</s>" → <strong>I work every day</strong>. No mezcles "to be" con otro verbo.</li>
<li>"<s>My parents lives here</s>" → <strong>My parents live here</strong>. La -s es solo para uno (singular).</li>
</ul>`,
    examples: [
      'I wake up at seven. → Me despierto a las siete.',
      'She works in a hospital. → Ella trabaja en un hospital.',
      'He watches TV every night. → Él ve la tele todas las noches.',
      'My sister studies English. → Mi hermana estudia inglés.',
      'They live near the park. → Ellos viven cerca del parque.',
      'Our teacher has two cats. → Nuestra maestra tiene dos gatos.',
      'The shop opens at nine. → La tienda abre a las nueve.',
    ],
    rules: [
      'Con I, you, we, they: verbo en forma base (I work)',
      'Con he, she, it: verbo + s (she works)',
      'Verbos en -s, -sh, -ch, -x, -o: + es (watches, goes)',
      'Consonante + y → ies (studies); vocal + y → s (plays)',
      '"Have" con he/she/it es "has"',
      'No pongas "am/is/are" antes de otro verbo: "I work", no "I am work"',
    ],
  },

  // ===== Unit 4: Present simple (negative/questions) + frequency adverbs =====
  {
    id: 'gc-a1-u4',
    unitId: 'a1-u4',
    title: 'Presente Simple (negativo y preguntas) + adverbios de frecuencia',
    explanation: `<h3>Negativo: don't / doesn't + verbo base</h3>
<ul>
<li>I / you / we / they <strong>don't</strong> (do not) + verbo: I <strong>don't like</strong> coffee.</li>
<li>he / she / it <strong>doesn't</strong> (does not) + verbo: She <strong>doesn't eat</strong> meat.</li>
</ul>
<p>La -s ya está en "doesn't", así que el verbo principal va <strong>sin -s</strong>.</p>

<h3>Preguntas: Do / Does + sujeto + verbo base</h3>
<ul>
<li><strong>Do</strong> you speak English? → Yes, I do. / No, I don't.</li>
<li><strong>Does</strong> he play the guitar? → Yes, he does. / No, he doesn't.</li>
<li>Con palabra interrogativa: <strong>Where do</strong> you live? <strong>What time does</strong> the class start?</li>
</ul>
<p>En las respuestas cortas se repite solo el auxiliar, no el verbo: "Do you like tea?" → "Yes, I <strong>do</strong>" (no "Yes, I like").</p>

<h3>Adverbios de frecuencia</h3>
<p><strong>always</strong> (100 %) → <strong>usually</strong> → <strong>often</strong> → <strong>sometimes</strong> → <strong>rarely</strong> → <strong>never</strong> (0 %)</p>
<ul>
<li>Van <strong>antes</strong> del verbo principal: She <strong>usually walks</strong> to work.</li>
<li>Van <strong>después</strong> de "to be": He <strong>is always</strong> late.</li>
<li>"Never" ya es negativo: no se usa con "don't".</li>
</ul>

<h3>Errores típicos</h3>
<ul>
<li>"<s>She doesn't likes pizza</s>" → <strong>She doesn't like pizza</strong>. Después de "doesn't", verbo sin -s.</li>
<li>"<s>You speak English?</s>" → <strong>Do you speak English?</strong> La pregunta necesita "do/does".</li>
<li>"<s>I don't never eat meat</s>" → <strong>I never eat meat</strong>. No se usan dos negativos.</li>
<li>"<s>I go always to the gym</s>" → <strong>I always go to the gym</strong>. El adverbio va antes del verbo.</li>
</ul>`,
    examples: [
      "I don't like coffee. → No me gusta el café.",
      "She doesn't eat meat. → Ella no come carne.",
      'Do you speak French? → ¿Hablas francés?',
      'Where does your brother work? → ¿Dónde trabaja tu hermano?',
      'I always have breakfast at home. → Siempre desayuno en casa.',
      'He is never late. → Él nunca llega tarde.',
      'We sometimes go to the cinema. → A veces vamos al cine.',
    ],
    rules: [
      "Negativo: don't / doesn't + verbo base",
      'Preguntas: Do / Does + sujeto + verbo base',
      'Después de "does" o "doesn\'t" el verbo no lleva -s',
      'El adverbio de frecuencia va antes del verbo principal',
      'Con "to be" el adverbio va después: "He is always happy"',
      '"Never" ya es negativo: "I never drink coffee", sin "don\'t"',
    ],
  },

  // ===== Unit 5: There is/are + prepositions of place =====
  {
    id: 'gc-a1-u5',
    unitId: 'a1-u5',
    title: 'There is / There are + preposiciones de lugar',
    explanation: `<h3>There is / There are = hay</h3>
<p>En español "hay" no cambia, pero en inglés depende de lo que viene después:</p>
<ul>
<li><strong>There is</strong> (there's) + singular o incontable: There is a bank. There is some milk.</li>
<li><strong>There are</strong> + plural: There are two banks. There are many people.</li>
</ul>

<h3>Negativo y preguntas</h3>
<ul>
<li>There <strong>isn't</strong> a gym. There <strong>aren't</strong> any shops.</li>
<li><strong>Is there</strong> a pharmacy near here? → Yes, there is. / No, there isn't.</li>
<li><strong>Are there</strong> any buses? → Yes, there are. / No, there aren't.</li>
<li><strong>How many</strong> rooms <strong>are there</strong>?</li>
</ul>

<h3>Preposiciones de lugar</h3>
<ul>
<li><strong>in</strong> → dentro de: in the box, in the kitchen</li>
<li><strong>on</strong> → sobre una superficie: on the table, on the wall</li>
<li><strong>under</strong> → debajo de: under the bed</li>
<li><strong>next to</strong> → al lado de: next to the bank</li>
<li><strong>between</strong> → entre dos cosas: between the school and the park</li>
<li><strong>in front of</strong> → enfrente de / delante de; <strong>behind</strong> → detrás de</li>
<li><strong>opposite</strong> → frente a, del otro lado de la calle</li>
</ul>

<h3>Errores típicos</h3>
<ul>
<li>"<s>Have a park near my house</s>" → <strong>There is a park near my house</strong>. "Hay" no se dice con "have".</li>
<li>"<s>There is three cats</s>" → <strong>There are three cats</strong>. Con plural, "are".</li>
<li>"<s>The picture is in the wall</s>" → <strong>on the wall</strong>. Sobre una superficie, "on".</li>
<li>"<s>In front of the bank</s>" para decir "frente al banco, cruzando la calle" → <strong>opposite the bank</strong>.</li>
</ul>`,
    examples: [
      'There is a park near my house. → Hay un parque cerca de mi casa.',
      'There are two windows in the room. → Hay dos ventanas en el cuarto.',
      "There isn't any milk in the fridge. → No hay leche en el refri.",
      'Is there a bathroom near here? → ¿Hay un baño cerca de aquí?',
      'The keys are on the table. → Las llaves están sobre la mesa.',
      'The cat is under the bed. → El gato está debajo de la cama.',
      'The café is between the bank and the school. → El café está entre el banco y la escuela.',
    ],
    rules: [
      '"There is" con singular o incontable; "there are" con plural',
      '"Hay" nunca se dice con "have"',
      'Preguntas: "Is there...?" / "Are there...?"',
      'Negativo: "There isn\'t a..." / "There aren\'t any..."',
      'in = dentro; on = sobre una superficie; under = debajo',
      '"In front of" es delante; "opposite" es del otro lado de la calle',
    ],
  },

  // ===== Unit 6: Can/can't + imperatives =====
  {
    id: 'gc-a1-u6',
    unitId: 'a1-u6',
    title: "Can / Can't + imperativos",
    explanation: `<h3>Can: poder y saber hacer algo</h3>
<p><strong>Can</strong> expresa <strong>habilidad</strong> (I can swim = sé nadar), <strong>posibilidad</strong> (You can park here) y <strong>permiso</strong> (Can I open the window?).</p>

<h3>Estructura: igual para todos los sujetos</h3>
<ul>
<li>Afirmativo: Sujeto + <strong>can</strong> + verbo base → She <strong>can speak</strong> three languages.</li>
<li>Negativo: Sujeto + <strong>can't</strong> (cannot) + verbo base → I <strong>can't drive</strong>.</li>
<li>Pregunta: <strong>Can</strong> + sujeto + verbo base? → <strong>Can you</strong> help me? → Yes, I can. / No, I can't.</li>
</ul>
<p>"Can" nunca cambia: no lleva -s, no usa "do" y el verbo que sigue va sin "to".</p>

<h3>Pedir algo con amabilidad</h3>
<p><strong>Can I</strong> have a coffee, please? · <strong>Can you</strong> repeat that, please?</p>

<h3>Imperativos: dar instrucciones</h3>
<ul>
<li>Afirmativo: verbo base, sin sujeto → <strong>Open</strong> your books. <strong>Turn</strong> left.</li>
<li>Negativo: <strong>Don't</strong> + verbo base → <strong>Don't run</strong>! <strong>Don't</strong> forget your keys.</li>
<li>Para sugerir algo juntos: <strong>Let's</strong> + verbo base → <strong>Let's go</strong>!</li>
<li>Agrega <strong>please</strong> para sonar amable: Please sit down.</li>
</ul>

<h3>Errores típicos</h3>
<ul>
<li>"<s>She cans swim</s>" → <strong>She can swim</strong>. "Can" no lleva -s.</li>
<li>"<s>I can to speak English</s>" → <strong>I can speak English</strong>. Después de "can", sin "to".</li>
<li>"<s>Do you can help me?</s>" → <strong>Can you help me?</strong> "Can" no usa "do".</li>
<li>"<s>No run!</s>" → <strong>Don't run!</strong> El imperativo negativo empieza con "don't".</li>
</ul>`,
    examples: [
      'She can speak three languages. → Ella sabe hablar tres idiomas.',
      "I can't drive. → No sé manejar.",
      'Can you help me, please? → ¿Me puedes ayudar, por favor?',
      'Can I pay by card? → ¿Puedo pagar con tarjeta?',
      'Open your books, please. → Abran sus libros, por favor.',
      "Don't touch that! → ¡No toques eso!",
      "Let's take a break. → Tomemos un descanso.",
    ],
    rules: [
      '"Can" es igual para todos los sujetos: I can, she can',
      'Después de "can" va el verbo base, sin "to"',
      'Negativo: can\'t (cannot); preguntas: Can + sujeto + verbo',
      'Imperativo afirmativo: verbo base sin sujeto ("Sit down")',
      'Imperativo negativo: Don\'t + verbo base ("Don\'t run")',
      '"Let\'s" + verbo para proponer algo juntos',
    ],
  },

  // ===== Unit 7: Countable/uncountable + some/any =====
  {
    id: 'gc-a1-u7',
    unitId: 'a1-u7',
    title: 'Contables e incontables + some/any',
    explanation: `<h3>Sustantivos contables e incontables</h3>
<ul>
<li><strong>Contables:</strong> se pueden contar uno por uno y tienen plural → a banana, two bananas, three eggs.</li>
<li><strong>Incontables:</strong> no se cuentan y no tienen plural → water, rice, milk, money, bread, information, advice.</li>
</ul>
<p>Para contar algo incontable se usa un recipiente o una medida: <strong>a bottle of</strong> water, <strong>a kilo of</strong> rice, <strong>a piece of</strong> bread, <strong>a cup of</strong> coffee.</p>

<h3>Some y Any</h3>
<ul>
<li><strong>Some</strong> → afirmativo: I have <strong>some</strong> apples. There is <strong>some</strong> cheese.</li>
<li><strong>Any</strong> → negativo y preguntas: I don't have <strong>any</strong> milk. Do you have <strong>any</strong> questions?</li>
<li>Para <strong>ofrecer o pedir</strong> se usa "some" también en preguntas: Would you like <strong>some</strong> tea? Can I have <strong>some</strong> water?</li>
</ul>

<h3>How much / How many</h3>
<ul>
<li><strong>How many</strong> + contable plural: How many eggs do we need?</li>
<li><strong>How much</strong> + incontable: How much water do you drink? También para precios: <strong>How much</strong> is it?</li>
</ul>

<h3>Errores típicos</h3>
<ul>
<li>"<s>I need an information</s>" → <strong>I need some information</strong>. "Information" es incontable.</li>
<li>"<s>How many money do you have?</s>" → <strong>How much money</strong>. "Money" es incontable.</li>
<li>"<s>I don't have some eggs</s>" → <strong>I don't have any eggs</strong>. En negativo, "any".</li>
<li>"<s>The breads are fresh</s>" → <strong>The bread is fresh</strong>. Los incontables van en singular.</li>
</ul>`,
    examples: [
      'I need some eggs. → Necesito unos huevos.',
      "There isn't any bread. → No hay pan.",
      'How much sugar do you want? → ¿Cuánta azúcar quieres?',
      'How many students are there? → ¿Cuántos estudiantes hay?',
      'Would you like some coffee? → ¿Quieres café?',
      'Can I have a bottle of water, please? → ¿Me da una botella de agua, por favor?',
      "We don't have any money. → No tenemos dinero.",
    ],
    rules: [
      '"Some" en afirmativo, "any" en negativo y preguntas',
      'Para ofrecer o pedir se usa "some": "Would you like some tea?"',
      '"How many" para contables, "How much" para incontables',
      'Los incontables nunca llevan "a/an" ni plural',
      'Se cuentan con medidas: a bottle of water, a piece of bread',
      'money, information, advice, bread y rice son incontables',
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
