import type { Unit, GrammarCard, GrammarExercise } from '../../lib/db';

export const a2Units: Unit[] = [
  {
    id: 'a2-u1',
    level: 'A2',
    unitNumber: 1,
    title: 'What Did You Do Yesterday?',
    grammarTopic: 'Past Simple — regular verbs',
    theme: 'Describing yesterday, weekend',
    isAssessment: false,
  },
  {
    id: 'a2-u2',
    level: 'A2',
    unitNumber: 2,
    title: 'Travel Stories',
    grammarTopic: 'Past Simple — irregular verbs + negatives/questions',
    theme: 'Travel stories, experiences',
    isAssessment: false,
  },
  {
    id: 'a2-u3',
    level: 'A2',
    unitNumber: 3,
    title: 'What Are You Doing?',
    grammarTopic: 'Present Continuous (now vs. habits)',
    theme: 'Describing actions, plans',
    isAssessment: false,
  },
  {
    id: 'a2-u4',
    level: 'A2',
    unitNumber: 4,
    title: 'My Plans for the Future',
    grammarTopic: 'Going to (future plans)',
    theme: 'Making plans, vacations',
    isAssessment: false,
  },
  {
    id: 'a2-u5',
    level: 'A2',
    unitNumber: 5,
    title: 'Bigger, Better, Best',
    grammarTopic: 'Comparatives + superlatives',
    theme: 'Describing people, places',
    isAssessment: false,
  },
  {
    id: 'a2-u6',
    level: 'A2',
    unitNumber: 6,
    title: 'Rules and Advice',
    grammarTopic: 'Must/have to/should (obligation + advice)',
    theme: 'Health, rules, advice',
    isAssessment: false,
  },
  {
    id: 'a2-u7',
    level: 'A2',
    unitNumber: 7,
    title: 'For You, From Me',
    grammarTopic: 'Object pronouns + possessive pronouns',
    theme: 'Relationships, giving/receiving',
    isAssessment: false,
  },
  {
    id: 'a2-u8',
    level: 'A2',
    unitNumber: 8,
    title: 'What Will Happen?',
    grammarTopic: 'First conditional (if + present → will)',
    theme: 'Consequences, possibilities',
    isAssessment: false,
  },
  {
    id: 'a2-u9',
    level: 'A2',
    unitNumber: 9,
    title: 'Telling Stories',
    grammarTopic: 'Adverbs of manner + past continuous (intro)',
    theme: 'Telling stories, describing scenes',
    isAssessment: false,
  },
  {
    id: 'a2-u10',
    level: 'A2',
    unitNumber: 10,
    title: 'A2 Level Assessment',
    grammarTopic: 'All A2 grammar',
    theme: 'Comprehensive review',
    isAssessment: true,
  },
];

export const a2GrammarCards: GrammarCard[] = [
  // ===== Unit 1: Past Simple — regular verbs =====
  {
    id: 'gc-a2-u1',
    unitId: 'a2-u1',
    title: 'Pasado Simple — verbos regulares',
    explanation: `<h3>¿Qué es el Pasado Simple?</h3>
<p>El Pasado Simple se usa para hablar de acciones que <strong>ocurrieron y terminaron</strong> en el pasado. Con verbos regulares, la forma es siempre la misma: <strong>verbo + -ed</strong>.</p>

<h3>Estructura afirmativa</h3>
<p><strong>Sujeto + verbo en pasado (-ed)</strong></p>
<p>La forma <strong>no cambia</strong> con ningún pronombre: I walked, she walked, they walked.</p>

<h3>Reglas de ortografía para agregar -ed</h3>
<ul>
<li><strong>Mayoría de verbos:</strong> simplemente agrega -ed → work → <strong>worked</strong>, play → <strong>played</strong></li>
<li><strong>Verbos terminados en -e:</strong> solo agrega -d → live → <strong>lived</strong>, love → <strong>loved</strong>, dance → <strong>danced</strong></li>
<li><strong>Consonante + vocal + consonante (CVC) en sílaba acentuada:</strong> dobla la consonante final + -ed → stop → <strong>stopped</strong>, plan → <strong>planned</strong>, prefer → <strong>preferred</strong></li>
<li><strong>Verbos terminados en consonante + -y:</strong> cambia -y por -ied → study → <strong>studied</strong>, carry → <strong>carried</strong>, try → <strong>tried</strong></li>
<li><strong>Verbos terminados en vocal + -y:</strong> simplemente agrega -ed → play → <strong>played</strong>, stay → <strong>stayed</strong></li>
</ul>

<h3>Negativo: didn't + verbo base</h3>
<p><strong>Sujeto + didn't (did not) + verbo base</strong></p>
<p>Importante: después de "didn't" el verbo vuelve a su forma base (sin -ed).</p>
<ul>
<li>I <strong>didn't work</strong> yesterday. (no: I didn't worked)</li>
<li>She <strong>didn't study</strong> last night.</li>
</ul>

<h3>Preguntas: Did + sujeto + verbo base</h3>
<p><strong>Did + sujeto + verbo base?</strong></p>
<ul>
<li><strong>Did</strong> you <strong>call</strong> her? → Yes, I did. / No, I didn't.</li>
<li><strong>Did</strong> he <strong>finish</strong> his homework?</li>
</ul>

<h3>Expresiones de tiempo del pasado</h3>
<ul>
<li><strong>yesterday</strong> (ayer), <strong>yesterday morning/afternoon/evening</strong></li>
<li><strong>last night</strong> (anoche), <strong>last week</strong> (la semana pasada), <strong>last month</strong>, <strong>last year</strong></li>
<li><strong>ago</strong> (hace): two days ago, three years ago</li>
<li><strong>in + año:</strong> in 2020, in 1999</li>
</ul>`,
    examples: [
      'I walked to school yesterday. → Ayer caminé a la escuela.',
      'She studied all night. → Ella estudió toda la noche.',
      'They stopped the car. → Ellos detuvieron el coche.',
      "He didn't watch TV last night. → Él no vio televisión anoche.",
      'Did you call your mother? → ¿Llamaste a tu mamá?',
    ],
    rules: [
      'Verbos regulares en pasado: agrega -ed (o -d si termina en -e)',
      'La forma es igual para todos los sujetos: I worked, she worked, they worked',
      'Negativo: didn\'t + verbo BASE (sin -ed): I didn\'t work',
      'Preguntas: Did + sujeto + verbo BASE: Did you work?',
      'CVC en sílaba acentuada dobla la consonante final: stop → stopped',
    ],
  },

  // ===== Unit 2: Past Simple — irregular verbs + negatives/questions =====
  {
    id: 'gc-a2-u2',
    unitId: 'a2-u2',
    title: 'Pasado Simple — verbos irregulares, negativos y preguntas',
    explanation: `<h3>Verbos irregulares</h3>
<p>Los verbos irregulares tienen formas de pasado únicas que debes memorizar. No siguen la regla de -ed.</p>

<table>
<tr><th>Forma base</th><th>Pasado</th><th>Significado</th></tr>
<tr><td>go</td><td><strong>went</strong></td><td>ir</td></tr>
<tr><td>have</td><td><strong>had</strong></td><td>tener</td></tr>
<tr><td>see</td><td><strong>saw</strong></td><td>ver</td></tr>
<tr><td>take</td><td><strong>took</strong></td><td>tomar/llevar</td></tr>
<tr><td>make</td><td><strong>made</strong></td><td>hacer/fabricar</td></tr>
<tr><td>come</td><td><strong>came</strong></td><td>venir</td></tr>
<tr><td>give</td><td><strong>gave</strong></td><td>dar</td></tr>
<tr><td>know</td><td><strong>knew</strong></td><td>saber/conocer</td></tr>
<tr><td>find</td><td><strong>found</strong></td><td>encontrar</td></tr>
<tr><td>think</td><td><strong>thought</strong></td><td>pensar</td></tr>
<tr><td>buy</td><td><strong>bought</strong></td><td>comprar</td></tr>
<tr><td>say</td><td><strong>said</strong></td><td>decir</td></tr>
<tr><td>get</td><td><strong>got</strong></td><td>obtener/llegar</td></tr>
<tr><td>tell</td><td><strong>told</strong></td><td>decir/contar</td></tr>
<tr><td>leave</td><td><strong>left</strong></td><td>salir/dejar</td></tr>
<tr><td>eat</td><td><strong>ate</strong></td><td>comer</td></tr>
<tr><td>drink</td><td><strong>drank</strong></td><td>beber</td></tr>
<tr><td>write</td><td><strong>wrote</strong></td><td>escribir</td></tr>
<tr><td>read</td><td><strong>read</strong></td><td>leer (pronunciado /rɛd/)</td></tr>
<tr><td>meet</td><td><strong>met</strong></td><td>conocer/reunirse</td></tr>
<tr><td>run</td><td><strong>ran</strong></td><td>correr</td></tr>
</table>

<h3>Negativo con verbos irregulares</h3>
<p>Igual que los regulares: <strong>didn't + verbo BASE</strong> (forma original, no la forma irregular).</p>
<ul>
<li>She went to Paris. → She <strong>didn't go</strong> to Paris. (no: didn't went)</li>
<li>He had breakfast. → He <strong>didn't have</strong> breakfast.</li>
</ul>

<h3>Preguntas con verbos irregulares</h3>
<p><strong>Did + sujeto + verbo BASE?</strong></p>
<ul>
<li>They went to the beach. → <strong>Did</strong> they <strong>go</strong> to the beach?</li>
<li>She made dinner. → <strong>Did</strong> she <strong>make</strong> dinner?</li>
</ul>

<h3>Respuestas cortas</h3>
<ul>
<li>Did you see the movie? → <strong>Yes, I did.</strong> / <strong>No, I didn't.</strong></li>
<li>Did he go to work? → <strong>Yes, he did.</strong> / <strong>No, he didn't.</strong></li>
</ul>`,
    examples: [
      'We went to Italy last summer. → Fuimos a Italia el verano pasado.',
      'She found her keys. → Ella encontró sus llaves.',
      "I didn't buy anything at the market. → No compré nada en el mercado.",
      'Did you see that film? → ¿Viste esa película?',
      'Yes, I did. It was great! → Sí. ¡Estuvo genial!',
    ],
    rules: [
      'Los verbos irregulares tienen formas de pasado únicas: go → went, have → had, see → saw',
      'Negativo: didn\'t + verbo BASE (forma original): I didn\'t go (no "didn\'t went")',
      'Preguntas: Did + sujeto + verbo BASE: Did you go?',
      'Respuestas cortas: Yes, I did. / No, I didn\'t.',
      'Después de "did" y "didn\'t" siempre va el verbo en forma base',
    ],
  },

  // ===== Unit 3: Present Continuous =====
  {
    id: 'gc-a2-u3',
    unitId: 'a2-u3',
    title: 'Presente Continuo',
    explanation: `<h3>Estructura del Presente Continuo</h3>
<p><strong>Sujeto + am/is/are + verbo-ing</strong></p>
<ul>
<li>I <strong>am working</strong></li>
<li>He/She/It <strong>is working</strong></li>
<li>You/We/They <strong>are working</strong></li>
</ul>

<h3>Reglas de ortografía para -ing</h3>
<ul>
<li><strong>Mayoría de verbos:</strong> agrega -ing → work → <strong>working</strong>, read → <strong>reading</strong></li>
<li><strong>Verbos terminados en -e muda:</strong> elimina -e y agrega -ing → dance → <strong>dancing</strong>, make → <strong>making</strong>, write → <strong>writing</strong></li>
<li><strong>Consonante + vocal + consonante (CVC) en sílaba acentuada:</strong> dobla la consonante + -ing → run → <strong>running</strong>, swim → <strong>swimming</strong>, sit → <strong>sitting</strong>, begin → <strong>beginning</strong></li>
<li><strong>Verbos terminados en -ie:</strong> cambia a -y + ing → lie → <strong>lying</strong>, die → <strong>dying</strong></li>
</ul>

<h3>Usos del Presente Continuo</h3>
<ul>
<li><strong>USO 1 — Acción en progreso AHORA:</strong> I'm reading a book right now. (Estoy leyendo un libro ahora mismo.)</li>
<li><strong>USO 2 — Situación temporal:</strong> She's staying with her parents this week. (Ella está quedándose con sus padres esta semana.)</li>
<li><strong>USO 3 — Planes o arreglos futuros:</strong> We're meeting tomorrow at 6. (Nos reunimos mañana a las 6.)</li>
</ul>

<h3>Negativo y preguntas</h3>
<ul>
<li>Negativo: Sujeto + am/is/are + <strong>not</strong> + verbo-ing → She <strong>isn't sleeping</strong>.</li>
<li>Pregunta: <strong>Am/Is/Are</strong> + sujeto + verbo-ing? → <strong>Are</strong> you <strong>listening</strong>?</li>
</ul>

<h3>Contraste: Presente Simple vs. Presente Continuo</h3>
<ul>
<li><strong>Presente Simple</strong> → hábitos/rutinas: I <strong>go</strong> to the gym every Monday. (Voy al gimnasio cada lunes.)</li>
<li><strong>Presente Continuo</strong> → ahora/temporal: I <strong>am going</strong> to the gym right now. (Voy al gimnasio ahora mismo.)</li>
</ul>

<h3>Verbos que NO usan el continuo (stative verbs)</h3>
<p>Estos verbos expresan estados, no acciones, y casi nunca van en -ing:</p>
<p><strong>know, like, love, hate, want, need, believe, understand, remember, seem, belong, own, prefer</strong></p>
<p>Correcto: I <strong>know</strong> the answer. (no: I am knowing the answer)</p>`,
    examples: [
      "She is reading a magazine. → Ella está leyendo una revista.",
      "They are playing football in the park. → Ellos están jugando fútbol en el parque.",
      "I'm not working today — it's my day off. → Hoy no trabajo, es mi día libre.",
      "Are you listening to music? → ¿Estás escuchando música?",
      "We're having dinner with my parents on Saturday. → Cenamos con mis padres el sábado.",
    ],
    rules: [
      'Forma: am/is/are + verbo-ing',
      'Se usa para acciones que pasan AHORA MISMO o situaciones temporales',
      'También para planes futuros concretos: We\'re meeting tomorrow',
      'Verbos como know, like, love, want, need NO usan la forma -ing',
      'Contraste: I work (hábito) vs. I\'m working (ahora mismo)',
    ],
  },

  // ===== Unit 4: Going to =====
  {
    id: 'gc-a2-u4',
    unitId: 'a2-u4',
    title: "Going to — planes e intenciones futuras",
    explanation: `<h3>Estructura de "going to"</h3>
<p><strong>Sujeto + am/is/are + going to + verbo base</strong></p>
<ul>
<li>I <strong>am going to</strong> study.</li>
<li>He/She/It <strong>is going to</strong> travel.</li>
<li>You/We/They <strong>are going to</strong> work.</li>
</ul>

<h3>Usos de "going to"</h3>
<ul>
<li><strong>USO 1 — Planes e intenciones:</strong> decisiones que ya tomaste antes del momento de hablar.
  <ul>
  <li>I'm going to study medicine. (Ya decidí estudiar medicina.)</li>
  <li>We're going to visit Paris next year. (Ya tenemos el plan de visitar París.)</li>
  </ul>
</li>
<li><strong>USO 2 — Predicciones basadas en evidencia visible:</strong> cuando ves algo que indica lo que va a pasar.
  <ul>
  <li>Look at those clouds — it's going to rain! (Mira esas nubes, va a llover.)</li>
  <li>Be careful! You're going to fall! (¡Cuidado! ¡Te vas a caer!)</li>
  </ul>
</li>
</ul>

<h3>Negativo e interrogativo</h3>
<ul>
<li><strong>Negativo:</strong> Sujeto + am/is/are + <strong>not</strong> + going to + verbo base
  <ul>
  <li>She <strong>isn't going to</strong> come tonight.</li>
  <li>They <strong>aren't going to</strong> buy a new car.</li>
  </ul>
</li>
<li><strong>Pregunta:</strong> Am/Is/Are + sujeto + going to + verbo base?
  <ul>
  <li><strong>Are</strong> you going to <strong>study</strong> tonight?</li>
  <li><strong>Is</strong> he going to <strong>call</strong> us?</li>
  </ul>
</li>
</ul>

<h3>"Going to" vs. "will"</h3>
<ul>
<li><strong>Going to</strong> → plan o intención previa, decisión ya tomada: I'm going to order pizza tonight. (Ya lo decidí.)</li>
<li><strong>Will</strong> → decisión espontánea en el momento de hablar: The phone is ringing — I'll answer it. (Decido en ese momento.)</li>
</ul>`,
    examples: [
      "I'm going to study English every day. → Voy a estudiar inglés todos los días.",
      "She's going to visit her grandmother this weekend. → Ella va a visitar a su abuela este fin de semana.",
      "It's going to snow tonight. → Esta noche va a nevar.",
      "Are you going to cook dinner? → ¿Vas a cocinar la cena?",
      "They aren't going to move to another city. → Ellos no van a mudarse a otra ciudad.",
    ],
    rules: [
      'Forma: am/is/are + going to + verbo BASE',
      '"Going to" expresa planes ya decididos o intenciones previas',
      'También se usa para predicciones basadas en evidencia visible',
      '"Will" es para decisiones espontáneas; "going to" para planes anteriores',
      'Negativo: isn\'t/aren\'t going to. Pregunta: Are you going to...?',
    ],
  },

  // ===== Unit 5: Comparatives + superlatives =====
  {
    id: 'gc-a2-u5',
    unitId: 'a2-u5',
    title: 'Comparativos y superlativos',
    explanation: `<h3>Adjetivos cortos (1 sílaba o 2 con terminación especial)</h3>
<p>Comparativo: adjetivo + <strong>-er</strong> + than</p>
<p>Superlativo: the + adjetivo + <strong>-est</strong></p>
<ul>
<li>tall → <strong>taller</strong> than → the <strong>tallest</strong></li>
<li>fast → <strong>faster</strong> than → the <strong>fastest</strong></li>
<li>young → <strong>younger</strong> than → the <strong>youngest</strong></li>
</ul>

<h3>Reglas de ortografía (adjetivos cortos)</h3>
<ul>
<li><strong>Terminados en -e:</strong> solo agrega -r/-st → nice → <strong>nicer</strong> → the <strong>nicest</strong></li>
<li><strong>Consonante + vocal + consonante (CVC):</strong> dobla la consonante → big → <strong>bigger</strong> → the <strong>biggest</strong>; hot → <strong>hotter</strong> → the <strong>hottest</strong></li>
<li><strong>Terminados en consonante + -y:</strong> cambia -y a -i + er/est → happy → <strong>happier</strong> → the <strong>happiest</strong>; easy → <strong>easier</strong> → the <strong>easiest</strong></li>
</ul>

<h3>Adjetivos largos (2+ sílabas sin terminación especial, 3+ sílabas)</h3>
<p>Comparativo: <strong>more</strong> + adjetivo + than</p>
<p>Superlativo: the <strong>most</strong> + adjetivo</p>
<ul>
<li>beautiful → <strong>more beautiful</strong> than → the <strong>most beautiful</strong></li>
<li>expensive → <strong>more expensive</strong> than → the <strong>most expensive</strong></li>
<li>interesting → <strong>more interesting</strong> than → the <strong>most interesting</strong></li>
</ul>

<h3>Formas irregulares</h3>
<table>
<tr><th>Adjetivo</th><th>Comparativo</th><th>Superlativo</th></tr>
<tr><td>good</td><td><strong>better</strong> than</td><td>the <strong>best</strong></td></tr>
<tr><td>bad</td><td><strong>worse</strong> than</td><td>the <strong>worst</strong></td></tr>
<tr><td>far</td><td><strong>farther/further</strong> than</td><td>the <strong>farthest/furthest</strong></td></tr>
<tr><td>little</td><td><strong>less</strong> than</td><td>the <strong>least</strong></td></tr>
</table>

<h3>Estructura "as...as" (igualdad)</h3>
<p>Para indicar que dos cosas son iguales: <strong>as + adjetivo + as</strong></p>
<ul>
<li>She is <strong>as tall as</strong> her brother. (Ella es tan alta como su hermano.)</li>
<li>This city is <strong>not as big as</strong> London. (Esta ciudad no es tan grande como Londres.)</li>
</ul>

<h3>Superlativos: in o of</h3>
<ul>
<li>The <strong>in</strong> se usa con grupos o lugares: the tallest building <strong>in</strong> the world, the best student <strong>in</strong> the class.</li>
<li><strong>Of</strong> se usa con grupos específicos: the oldest <strong>of</strong> my three siblings.</li>
</ul>`,
    examples: [
      'Tokyo is bigger than Madrid. → Tokio es más grande que Madrid.',
      'This is the most expensive restaurant in the city. → Este es el restaurante más caro de la ciudad.',
      'She is a better cook than her sister. → Ella cocina mejor que su hermana.',
      'Today is the worst day of my life. → Hoy es el peor día de mi vida.',
      'He is as tall as his father. → Él es tan alto como su padre.',
    ],
    rules: [
      'Adjetivos cortos: agrega -er/-est (tall → taller → tallest)',
      'Adjetivos largos (3+ sílabas): more/most (more beautiful, most interesting)',
      'Irregulares importantes: good → better → best; bad → worse → worst',
      'Comparativo: adjetivo + -er + THAN; Superlativo: THE + adjetivo + -est',
      'Igualdad: as + adjetivo + as (She is as smart as her brother)',
    ],
  },

  // ===== Unit 6: Must/have to/should =====
  {
    id: 'gc-a2-u6',
    unitId: 'a2-u6',
    title: 'Must, have to y should — obligación y consejos',
    explanation: `<h3>MUST — obligación personal / reglas fuertes</h3>
<p>Se usa para expresar obligación que el hablante siente internamente o reglas muy importantes.</p>
<ul>
<li>Forma: Sujeto + <strong>must</strong> + verbo base (igual para todos los sujetos)</li>
<li>You <strong>must</strong> try this cake! (¡Tienes que probar este pastel! — recomendación fuerte)</li>
<li>We <strong>must</strong> be quiet in the library. (Tenemos que estar en silencio en la biblioteca.)</li>
</ul>

<h3>HAVE TO — obligación externa / reglas de otros</h3>
<p>Se usa para obligaciones que vienen de afuera: reglas, leyes, requisitos del trabajo o la sociedad.</p>
<ul>
<li>Forma: Sujeto + <strong>have to</strong> / <strong>has to</strong> (he/she/it) + verbo base</li>
<li>I <strong>have to</strong> wear a uniform at work. (Tengo que usar uniforme en el trabajo — regla del trabajo.)</li>
<li>She <strong>has to</strong> take medicine twice a day. (Ella tiene que tomar medicina dos veces al día — indicación del médico.)</li>
<li>Negativo: <strong>don't/doesn't have to</strong> = no es necesario (pero puedes si quieres)</li>
<li>You <strong>don't have to</strong> pay — it's free! (No tienes que pagar, ¡es gratis!)</li>
<li>Pregunta: <strong>Do/Does</strong> + sujeto + <strong>have to</strong> + verbo base?</li>
</ul>

<h3>MUSTN'T — prohibición</h3>
<p>Se usa para prohibiciones: algo que está <strong>prohibido hacer</strong>.</p>
<ul>
<li>You <strong>mustn't</strong> smoke here. (No debes fumar aquí — está prohibido.)</li>
<li>You <strong>mustn't</strong> run in the hospital. (No debes correr en el hospital.)</li>
</ul>

<h3>Diferencia clave: mustn't vs. don't have to</h3>
<ul>
<li><strong>You mustn't</strong> touch that. → Está <strong>prohibido</strong>. (Don't do it!)</li>
<li><strong>You don't have to</strong> come. → <strong>No es necesario</strong>, pero puedes venir si quieres. (It's optional.)</li>
</ul>

<h3>SHOULD / SHOULDN'T — consejo / recomendación</h3>
<p>Se usa para dar consejos o hacer recomendaciones. Es más suave que "must".</p>
<ul>
<li>Forma: Sujeto + <strong>should</strong> + verbo base (igual para todos los sujetos)</li>
<li>You <strong>should</strong> see a doctor. (Deberías ir al médico — es mi consejo.)</li>
<li>You <strong>shouldn't</strong> eat so much sugar. (No deberías comer tanto azúcar.)</li>
<li>He <strong>should</strong> study more if he wants to pass. (Debería estudiar más.)</li>
</ul>`,
    examples: [
      'You must wear a seatbelt in the car. → Debes ponerte el cinturón de seguridad en el coche.',
      'I have to wake up at 6 for work. → Tengo que despertarme a las 6 para el trabajo.',
      "You don't have to come if you're tired. → No tienes que venir si estás cansado.",
      "You mustn't use your phone during the exam. → No debes usar el teléfono durante el examen.",
      'You should drink more water every day. → Deberías beber más agua cada día.',
    ],
    rules: [
      '"Must" = obligación personal o regla fuerte; no cambia con ningún sujeto',
      '"Have to/has to" = obligación externa (reglas, leyes); "has to" con he/she/it',
      '"Don\'t/doesn\'t have to" = no es necesario (no prohibido)',
      '"Mustn\'t" = está prohibido (¡no lo hagas!)',
      '"Should/shouldn\'t" = consejo o recomendación (más suave que must)',
    ],
  },

  // ===== Unit 7: Object pronouns + possessive pronouns =====
  {
    id: 'gc-a2-u7',
    unitId: 'a2-u7',
    title: 'Pronombres objeto y pronombres posesivos',
    explanation: `<h3>Pronombres de sujeto vs. pronombres de objeto</h3>
<p>Los <strong>pronombres de sujeto</strong> hacen la acción. Los <strong>pronombres de objeto</strong> reciben la acción o van después de preposición.</p>

<table>
<tr><th>Sujeto</th><th>Objeto</th><th>Significado del objeto</th></tr>
<tr><td>I</td><td><strong>me</strong></td><td>me / a mí</td></tr>
<tr><td>you</td><td><strong>you</strong></td><td>te / a ti</td></tr>
<tr><td>he</td><td><strong>him</strong></td><td>lo / le / a él</td></tr>
<tr><td>she</td><td><strong>her</strong></td><td>la / le / a ella</td></tr>
<tr><td>it</td><td><strong>it</strong></td><td>lo / la (cosa)</td></tr>
<tr><td>we</td><td><strong>us</strong></td><td>nos / a nosotros</td></tr>
<tr><td>they</td><td><strong>them</strong></td><td>los/las / a ellos</td></tr>
</table>

<h3>Usos de los pronombres objeto</h3>
<ul>
<li>Después de un verbo: She called <strong>me</strong>. Can you help <strong>us</strong>?</li>
<li>Después de una preposición: This letter is for <strong>him</strong>. Come with <strong>us</strong>.</li>
</ul>

<h3>Adjetivos posesivos vs. pronombres posesivos</h3>
<p>Los <strong>adjetivos posesivos</strong> van antes de un sustantivo. Los <strong>pronombres posesivos</strong> reemplazan al sustantivo.</p>

<table>
<tr><th>Adjetivo posesivo</th><th>Pronombre posesivo</th><th>Significado</th></tr>
<tr><td>my</td><td><strong>mine</strong></td><td>mío/mía</td></tr>
<tr><td>your</td><td><strong>yours</strong></td><td>tuyo/tuya</td></tr>
<tr><td>his</td><td><strong>his</strong></td><td>suyo (de él)</td></tr>
<tr><td>her</td><td><strong>hers</strong></td><td>suyo (de ella)</td></tr>
<tr><td>its</td><td>(its) — raro en pronombre</td><td>suyo (de eso)</td></tr>
<tr><td>our</td><td><strong>ours</strong></td><td>nuestro/nuestra</td></tr>
<tr><td>their</td><td><strong>theirs</strong></td><td>suyo (de ellos)</td></tr>
</table>

<h3>Diferencia clave</h3>
<ul>
<li><strong>Adjetivo posesivo</strong> + sustantivo: This is <strong>my</strong> book. (mi libro)</li>
<li><strong>Pronombre posesivo</strong> (sin sustantivo): This book is <strong>mine</strong>. (Este libro es mío.)</li>
<li>"Whose bag is this?" "It's <strong>hers</strong>." (Es de ella.) — no se repite el sustantivo</li>
</ul>`,
    examples: [
      'Can you help me? → ¿Puedes ayudarme?',
      'I gave him a present for his birthday. → Le di un regalo para su cumpleaños.',
      'That car is ours. → Ese coche es nuestro.',
      "Whose jacket is this? It's hers. → ¿De quién es esta chaqueta? Es de ella.",
      'She sent them an email. → Ella les mandó un correo electrónico.',
    ],
    rules: [
      'Pronombres objeto van después del verbo o de una preposición: help me, for him',
      'I → me, he → him, she → her, we → us, they → them',
      'Adjetivos posesivos (my, your...) van ANTES de un sustantivo: my book',
      'Pronombres posesivos (mine, yours...) REEMPLAZAN al sustantivo: That book is mine',
      '"his" es igual como adjetivo y como pronombre; los demás cambian (my → mine, our → ours)',
    ],
  },

  // ===== Unit 8: First conditional =====
  {
    id: 'gc-a2-u8',
    unitId: 'a2-u8',
    title: 'Primera condicional — If + presente → will',
    explanation: `<h3>Estructura de la primera condicional</h3>
<p><strong>If + presente simple → will + verbo base</strong></p>
<p>Expresa condiciones <strong>reales y posibles</strong> en el presente o futuro, con sus resultados probables.</p>
<ul>
<li>If it <strong>rains</strong>, I <strong>will</strong> stay home. (Si llueve, me quedaré en casa.)</li>
<li>If you <strong>study</strong>, you <strong>will pass</strong> the exam. (Si estudias, aprobarás el examen.)</li>
</ul>

<h3>Orden de las cláusulas</h3>
<p>La cláusula con "if" puede ir al principio o al final. Cuando va al principio, se usa coma:</p>
<ul>
<li><strong>If it rains,</strong> I'll stay home. (coma después de "if")</li>
<li>I'll stay home <strong>if it rains.</strong> (sin coma)</li>
</ul>

<h3>Forma negativa</h3>
<ul>
<li>If she <strong>doesn't study</strong>, she <strong>won't pass</strong>.</li>
<li>If you <strong>don't hurry</strong>, we <strong>will be</strong> late.</li>
</ul>

<h3>Unless = If... not</h3>
<p><strong>Unless</strong> significa "a menos que" o "si no". Es equivalente a "if not":</p>
<ul>
<li><strong>Unless</strong> you study, you <strong>won't pass</strong>. = If you <strong>don't</strong> study, you won't pass.</li>
<li><strong>Unless</strong> it rains, we <strong>will</strong> go to the beach.</li>
</ul>

<h3>Will en la cláusula de resultado</h3>
<p>En la cláusula resultado (sin "if") siempre usamos <strong>will</strong> (no presente simple):</p>
<ul>
<li>Correcto: If he calls, I <strong>will</strong> answer.</li>
<li>Incorrecto: If he calls, I answer. (no se usa presente simple en el resultado)</li>
</ul>

<h3>Usos comunes de la primera condicional</h3>
<ul>
<li><strong>Advertencias:</strong> If you touch that, you'll burn yourself.</li>
<li><strong>Promesas:</strong> If you help me, I'll cook dinner.</li>
<li><strong>Ofertas:</strong> If you're tired, I'll drive.</li>
<li><strong>Predicciones:</strong> If the weather is good, we'll have a picnic.</li>
</ul>`,
    examples: [
      "If you eat too much sugar, you'll feel sick. → Si comes demasiada azúcar, te sentirás mal.",
      "If it doesn't rain, we'll go to the park. → Si no llueve, iremos al parque.",
      "I'll call you if I'm late. → Te llamaré si llego tarde.",
      "Unless you leave now, you'll miss the train. → A menos que salgas ahora, perderás el tren.",
      "If she works hard, she'll get a promotion. → Si trabaja duro, obtendrá un ascenso.",
    ],
    rules: [
      'Estructura: If + presente simple → will + verbo base',
      'En la cláusula de "if" NUNCA uses "will": If it rains... (no "If it will rain")',
      'El orden puede invertirse; si "if" va primero, usa coma: If it rains, I\'ll stay',
      '"Unless" = "if not": Unless you hurry = If you don\'t hurry',
      'Se usa para situaciones reales y posibles con resultados probables',
    ],
  },

  // ===== Unit 9: Adverbs of manner + past continuous =====
  {
    id: 'gc-a2-u9',
    unitId: 'a2-u9',
    title: 'Adverbios de modo y pasado continuo',
    explanation: `<h3>Adverbios de modo</h3>
<p>Los adverbios de modo describen <strong>cómo</strong> se realiza una acción. Modifican al verbo.</p>

<h3>Formación: adjetivo + -ly</h3>
<ul>
<li>quick → <strong>quickly</strong> (rápidamente)</li>
<li>careful → <strong>carefully</strong> (cuidadosamente)</li>
<li>slow → <strong>slowly</strong> (lentamente)</li>
<li>quiet → <strong>quietly</strong> (silenciosamente)</li>
<li>beautiful → <strong>beautifully</strong> (bellamente)</li>
</ul>

<h3>Reglas de ortografía para -ly</h3>
<ul>
<li><strong>Terminados en consonante + -y:</strong> cambia -y a -i + ly → happy → <strong>happily</strong>; angry → <strong>angrily</strong></li>
<li><strong>Terminados en -le:</strong> elimina -e y agrega -y → gentle → <strong>gently</strong>; simple → <strong>simply</strong></li>
<li><strong>Terminados en -ic:</strong> agrega -ally → basic → <strong>basically</strong>; dramatic → <strong>dramatically</strong></li>
</ul>

<h3>Adverbios irregulares</h3>
<ul>
<li>fast → <strong>fast</strong> (no "fastly")</li>
<li>hard → <strong>hard</strong> (no "hardly" — "hardly" significa "casi no")</li>
<li>good → <strong>well</strong></li>
<li>late → <strong>late</strong> (no "lately" — "lately" significa "últimamente")</li>
</ul>

<h3>Posición de los adverbios de modo</h3>
<p>Generalmente van <strong>después del verbo</strong> o <strong>después del objeto</strong>:</p>
<ul>
<li>She sings <strong>beautifully</strong>. (después del verbo)</li>
<li>He finished the test <strong>quickly</strong>. (después del objeto)</li>
</ul>

<h3>Pasado Continuo</h3>
<p><strong>Sujeto + was/were + verbo-ing</strong></p>
<ul>
<li>I/He/She/It + <strong>was</strong> + verbo-ing</li>
<li>You/We/They + <strong>were</strong> + verbo-ing</li>
</ul>

<h3>Uso del Pasado Continuo</h3>
<ul>
<li><strong>Acción en progreso en un momento específico del pasado:</strong> At 8 pm, I <strong>was watching</strong> TV. (A las 8 pm, estaba viendo la tele.)</li>
<li><strong>Acción interrumpida por otra (pasado simple):</strong> I <strong>was reading</strong> when the phone <strong>rang</strong>. (Estaba leyendo cuando sonó el teléfono.)</li>
<li><strong>Dos acciones simultáneas en el pasado (while):</strong> While she <strong>was cooking</strong>, he <strong>was setting</strong> the table. (Mientras ella cocinaba, él ponía la mesa.)</li>
</ul>

<h3>When vs. While con pasado</h3>
<ul>
<li><strong>When</strong> + pasado simple (acción corta que interrumpe): I was sleeping <strong>when</strong> she arrived.</li>
<li><strong>While</strong> + pasado continuo (acción en progreso): <strong>While</strong> I was sleeping, she arrived.</li>
</ul>`,
    examples: [
      'She speaks English fluently. → Ella habla inglés con fluidez.',
      'He works hard every day. → Él trabaja duro todos los días.',
      'I was watching TV when you called. → Estaba viendo la televisión cuando llamaste.',
      'While they were sleeping, it started to rain. → Mientras dormían, empezó a llover.',
      'She ran quickly to catch the bus. → Corrió rápidamente para tomar el autobús.',
    ],
    rules: [
      'Adverbios de modo: adjetivo + -ly (quick → quickly, careful → carefully)',
      'Irregulares: fast → fast, hard → hard, good → well',
      'Los adverbios de modo van después del verbo o del objeto directo',
      'Pasado continuo: was/were + verbo-ing; expresa acción en progreso en el pasado',
      '"When" + pasado simple interrumpe al pasado continuo; "while" + pasado continuo muestra simultaneidad',
    ],
  },
];

export const a2Exercises: GrammarExercise[] = [
  // ===== Unit 1: Past Simple — regular verbs =====
  {
    id: 'ex-a2-u1-1',
    unitId: 'a2-u1',
    type: 'fill-blank',
    question: 'Yesterday, I ___ (walk) to school.',
    correctAnswer: 'walked',
    explanation: 'El pasado simple de verbos regulares se forma agregando -ed: walk → walked.',
  },
  {
    id: 'ex-a2-u1-2',
    unitId: 'a2-u1',
    type: 'fill-blank',
    question: 'She ___ (study) for three hours last night.',
    correctAnswer: 'studied',
    explanation: 'Los verbos terminados en consonante + -y cambian -y por -ied en pasado: study → studied.',
  },
  {
    id: 'ex-a2-u1-3',
    unitId: 'a2-u1',
    type: 'multiple-choice',
    question: 'He ___ his homework before dinner.',
    correctAnswer: 'finished',
    options: ['finish', 'finished', 'finishing', 'finishes'],
    explanation: 'En pasado simple con verbos regulares se usa la forma -ed: finish → finished.',
  },
  {
    id: 'ex-a2-u1-4',
    unitId: 'a2-u1',
    type: 'multiple-choice',
    question: '___ you call your parents last weekend?',
    correctAnswer: 'Did',
    options: ['Did', 'Do', 'Were', 'Have'],
    explanation: 'Las preguntas en pasado simple se forman con "Did + sujeto + verbo base".',
  },
  {
    id: 'ex-a2-u1-5',
    unitId: 'a2-u1',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'They visited Paris last summer.',
    scrambledWords: ['last', 'They', 'Paris', 'visited', 'summer.'],
    explanation: 'Estructura del pasado simple: Sujeto + verbo en pasado (-ed) + complemento + expresión de tiempo.',
  },
  {
    id: 'ex-a2-u1-6',
    unitId: 'a2-u1',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: "She didn't work on Sunday.",
    scrambledWords: ["didn't", 'She', 'Sunday.', 'work', 'on'],
    explanation: 'Negativo en pasado simple: Sujeto + didn\'t + verbo BASE (sin -ed).',
  },

  // ===== Unit 2: Past Simple — irregular verbs + negatives/questions =====
  {
    id: 'ex-a2-u2-1',
    unitId: 'a2-u2',
    type: 'fill-blank',
    question: 'We ___ (go) to the beach last Saturday.',
    correctAnswer: 'went',
    explanation: '"Go" es un verbo irregular. Su forma de pasado simple es "went".',
  },
  {
    id: 'ex-a2-u2-2',
    unitId: 'a2-u2',
    type: 'fill-blank',
    question: 'She ___ (not/take) a taxi. She walked.',
    correctAnswer: "didn't take",
    explanation: 'Negativo de verbos irregulares: didn\'t + verbo BASE (forma original). "Take" no cambia después de "didn\'t".',
  },
  {
    id: 'ex-a2-u2-3',
    unitId: 'a2-u2',
    type: 'multiple-choice',
    question: 'They ___ a great time at the party.',
    correctAnswer: 'had',
    options: ['have', 'had', 'haved', 'has'],
    explanation: '"Have" es irregular. Su forma de pasado simple es "had".',
  },
  {
    id: 'ex-a2-u2-4',
    unitId: 'a2-u2',
    type: 'multiple-choice',
    question: 'Did she ___ the new movie?',
    correctAnswer: 'see',
    options: ['see', 'saw', 'seen', 'sees'],
    explanation: 'Después de "did" siempre se usa el verbo en forma BASE, aunque sea irregular: "see" (no "saw").',
  },
  {
    id: 'ex-a2-u2-5',
    unitId: 'a2-u2',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'Did you buy anything at the market?',
    scrambledWords: ['the', 'Did', 'at', 'anything', 'market?', 'you', 'buy'],
    explanation: 'Preguntas en pasado simple con verbos irregulares: Did + sujeto + verbo BASE.',
  },
  {
    id: 'ex-a2-u2-6',
    unitId: 'a2-u2',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: "He didn't know the answer.",
    scrambledWords: ["didn't", 'He', 'answer.', 'the', 'know'],
    explanation: 'Negativo con verbos irregulares: didn\'t + verbo BASE. "Know" no cambia a "knew" después de "didn\'t".',
  },

  // ===== Unit 3: Present Continuous =====
  {
    id: 'ex-a2-u3-1',
    unitId: 'a2-u3',
    type: 'fill-blank',
    question: 'She ___ (listen) to music right now.',
    correctAnswer: 'is listening',
    explanation: 'Presente continuo: is/am/are + verbo-ing. Con "she" se usa "is listening".',
  },
  {
    id: 'ex-a2-u3-2',
    unitId: 'a2-u3',
    type: 'fill-blank',
    question: 'They ___ (not/watch) TV at the moment.',
    correctAnswer: "aren't watching",
    explanation: 'Negativo del presente continuo con "they": aren\'t + verbo-ing.',
  },
  {
    id: 'ex-a2-u3-3',
    unitId: 'a2-u3',
    type: 'multiple-choice',
    question: 'Look! The baby ___.',
    correctAnswer: 'is sleeping',
    options: ['sleeps', 'is sleeping', 'was sleeping', 'sleep'],
    explanation: '"Look!" indica que la acción ocurre AHORA MISMO. Se usa el presente continuo: is sleeping.',
  },
  {
    id: 'ex-a2-u3-4',
    unitId: 'a2-u3',
    type: 'multiple-choice',
    question: 'I ___ dinner with my family tomorrow evening. (plan)',
    correctAnswer: "I'm having",
    options: ["I'm having", 'I have', 'I will having', 'I am have'],
    explanation: 'El presente continuo también se usa para planes o arreglos futuros concretos.',
  },
  {
    id: 'ex-a2-u3-5',
    unitId: 'a2-u3',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'Are you studying for the exam?',
    scrambledWords: ['for', 'studying', 'Are', 'exam?', 'you', 'the'],
    explanation: 'Pregunta en presente continuo: Are/Is/Am + sujeto + verbo-ing?',
  },
  {
    id: 'ex-a2-u3-6',
    unitId: 'a2-u3',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'He is running in the park.',
    scrambledWords: ['in', 'running', 'He', 'park.', 'the', 'is'],
    explanation: 'Presente continuo afirmativo: Sujeto + is + verbo-ing + complemento.',
  },

  // ===== Unit 4: Going to =====
  {
    id: 'ex-a2-u4-1',
    unitId: 'a2-u4',
    type: 'fill-blank',
    question: "I ___ (going to / visit) my grandparents this weekend.",
    correctAnswer: 'am going to visit',
    explanation: '"Going to" para planes: am/is/are + going to + verbo base. Con "I" se usa "am going to visit".',
  },
  {
    id: 'ex-a2-u4-2',
    unitId: 'a2-u4',
    type: 'fill-blank',
    question: 'Look at those clouds! It ___ (going to / rain).',
    correctAnswer: 'is going to rain',
    explanation: '"Going to" para predicciones basadas en evidencia visible: is going to rain.',
  },
  {
    id: 'ex-a2-u4-3',
    unitId: 'a2-u4',
    type: 'multiple-choice',
    question: 'She ___ study medicine at university.',
    correctAnswer: "is going to",
    options: ["is going to", 'going to', 'will going to', 'are going to'],
    explanation: 'Con "she" se usa "is going to" + verbo base.',
  },
  {
    id: 'ex-a2-u4-4',
    unitId: 'a2-u4',
    type: 'multiple-choice',
    question: '___ they going to move to a new apartment?',
    correctAnswer: 'Are',
    options: ['Is', 'Are', 'Do', 'Will'],
    explanation: 'Pregunta con "going to" y "they": Are + they + going to + verbo base?',
  },
  {
    id: 'ex-a2-u4-5',
    unitId: 'a2-u4',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: "We aren't going to travel this year.",
    scrambledWords: ["aren't", 'We', 'year.', 'travel', 'this', 'going', 'to'],
    explanation: 'Negativo de "going to": am/is/are + not + going to + verbo base.',
  },
  {
    id: 'ex-a2-u4-6',
    unitId: 'a2-u4',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'He is going to start a new job.',
    scrambledWords: ['job.', 'He', 'new', 'going', 'start', 'a', 'is', 'to'],
    explanation: '"Going to" para planes: Sujeto + is + going to + verbo base + complemento.',
  },

  // ===== Unit 5: Comparatives + superlatives =====
  {
    id: 'ex-a2-u5-1',
    unitId: 'a2-u5',
    type: 'fill-blank',
    question: 'My sister is ___ (tall) than me.',
    correctAnswer: 'taller',
    explanation: 'Comparativo de adjetivos cortos: adjetivo + -er + than. tall → taller.',
  },
  {
    id: 'ex-a2-u5-2',
    unitId: 'a2-u5',
    type: 'fill-blank',
    question: 'This is ___ (expensive) restaurant in the city.',
    correctAnswer: 'the most expensive',
    explanation: 'Superlativo de adjetivos largos: the most + adjetivo. "Expensive" tiene 3 sílabas → the most expensive.',
  },
  {
    id: 'ex-a2-u5-3',
    unitId: 'a2-u5',
    type: 'multiple-choice',
    question: 'Today is ___ day of the year!',
    correctAnswer: 'the worst',
    options: ['the worst', 'the baddest', 'worse', 'the most bad'],
    explanation: '"Bad" tiene superlativo irregular: bad → worse → the worst.',
  },
  {
    id: 'ex-a2-u5-4',
    unitId: 'a2-u5',
    type: 'multiple-choice',
    question: 'His new house is ___ his old one.',
    correctAnswer: 'bigger than',
    options: ['bigger than', 'biggest than', 'more big than', 'the biggest'],
    explanation: 'Comparativo de adjetivos cortos CVC (consonante+vocal+consonante): dobla la consonante + -er + than. big → bigger than.',
  },
  {
    id: 'ex-a2-u5-5',
    unitId: 'a2-u5',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'She is the best student in the class.',
    scrambledWords: ['in', 'She', 'best', 'student', 'is', 'the', 'class.', 'the'],
    explanation: 'Superlativo irregular de "good": the best. Se usa "in" con grupos o lugares.',
  },
  {
    id: 'ex-a2-u5-6',
    unitId: 'a2-u5',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'English is more interesting than maths.',
    scrambledWords: ['maths.', 'interesting', 'English', 'more', 'is', 'than'],
    explanation: 'Comparativo de adjetivos largos: more + adjetivo + than. "Interesting" tiene 4 sílabas.',
  },

  // ===== Unit 6: Must/have to/should =====
  {
    id: 'ex-a2-u6-1',
    unitId: 'a2-u6',
    type: 'fill-blank',
    question: 'You ___ smoke in this area. It is forbidden.',
    correctAnswer: "mustn't",
    explanation: '"Mustn\'t" expresa prohibición: algo que está completamente prohibido hacer.',
  },
  {
    id: 'ex-a2-u6-2',
    unitId: 'a2-u6',
    type: 'fill-blank',
    question: 'She ___ wear a uniform at her job. It\'s the company rule.',
    correctAnswer: 'has to',
    explanation: '"Has to" (con she/he/it) expresa obligación externa, como reglas del trabajo.',
  },
  {
    id: 'ex-a2-u6-3',
    unitId: 'a2-u6',
    type: 'multiple-choice',
    question: 'You look tired. You ___ go to bed early tonight.',
    correctAnswer: 'should',
    options: ['should', 'must', "mustn't", "don't have to"],
    explanation: '"Should" se usa para dar consejos o recomendaciones. Es más suave que "must".',
  },
  {
    id: 'ex-a2-u6-4',
    unitId: 'a2-u6',
    type: 'multiple-choice',
    question: 'Entry is free! You ___ pay anything.',
    correctAnswer: "don't have to",
    options: ["don't have to", "mustn't", "shouldn't", "can't"],
    explanation: '"Don\'t have to" significa que no es necesario (pero puedes hacerlo si quieres). "Mustn\'t" significaría que está prohibido.',
  },
  {
    id: 'ex-a2-u6-5',
    unitId: 'a2-u6',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'You should drink more water every day.',
    scrambledWords: ['water', 'drink', 'every', 'You', 'more', 'day.', 'should'],
    explanation: '"Should" + verbo base para dar consejos: You should + verbo base.',
  },
  {
    id: 'ex-a2-u6-6',
    unitId: 'a2-u6',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'He has to work on Saturdays.',
    scrambledWords: ['Saturdays.', 'He', 'work', 'has', 'on', 'to'],
    explanation: '"Has to" con he/she/it para obligación externa. Estructura: has to + verbo base.',
  },

  // ===== Unit 7: Object pronouns + possessive pronouns =====
  {
    id: 'ex-a2-u7-1',
    unitId: 'a2-u7',
    type: 'fill-blank',
    question: 'I called ___ (she) but she didn\'t answer.',
    correctAnswer: 'her',
    explanation: 'Después de un verbo se usa el pronombre objeto: "she" → "her".',
  },
  {
    id: 'ex-a2-u7-2',
    unitId: 'a2-u7',
    type: 'fill-blank',
    question: 'That red bag is mine. Where is ___? (your bag)',
    correctAnswer: 'yours',
    explanation: 'El pronombre posesivo de "your" es "yours". Reemplaza al sustantivo (no necesita "bag" después).',
  },
  {
    id: 'ex-a2-u7-3',
    unitId: 'a2-u7',
    type: 'multiple-choice',
    question: 'My parents gave ___ a wonderful gift.',
    correctAnswer: 'me',
    options: ['I', 'me', 'my', 'mine'],
    explanation: 'Después del verbo "gave" necesitamos un pronombre objeto. "I" → "me".',
  },
  {
    id: 'ex-a2-u7-4',
    unitId: 'a2-u7',
    type: 'multiple-choice',
    question: 'Whose house is that? It\'s ___.',
    correctAnswer: 'theirs',
    options: ['their', 'theirs', 'them', 'they'],
    explanation: 'El pronombre posesivo de "their" es "theirs". No va seguido de sustantivo.',
  },
  {
    id: 'ex-a2-u7-5',
    unitId: 'a2-u7',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'Can you help us with this exercise?',
    scrambledWords: ['exercise?', 'you', 'help', 'this', 'Can', 'with', 'us'],
    explanation: '"Us" es el pronombre objeto de "we". Después de la preposición "with" se usa el pronombre objeto.',
  },
  {
    id: 'ex-a2-u7-6',
    unitId: 'a2-u7',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'This book is mine, not hers.',
    scrambledWords: ['not', 'mine,', 'This', 'hers.', 'is', 'book'],
    explanation: '"Mine" y "hers" son pronombres posesivos: reemplazan al sustantivo y van solos (sin "book" después).',
  },

  // ===== Unit 8: First conditional =====
  {
    id: 'ex-a2-u8-1',
    unitId: 'a2-u8',
    type: 'fill-blank',
    question: 'If it ___ (rain) tomorrow, we will cancel the trip.',
    correctAnswer: 'rains',
    explanation: 'En la cláusula con "if" de la primera condicional se usa el PRESENTE SIMPLE (no "will"): if it rains.',
  },
  {
    id: 'ex-a2-u8-2',
    unitId: 'a2-u8',
    type: 'fill-blank',
    question: 'She will pass the exam if she ___ (study) hard.',
    correctAnswer: 'studies',
    explanation: 'En la cláusula con "if" se usa presente simple. "Study" con "she" toma -ies: studies.',
  },
  {
    id: 'ex-a2-u8-3',
    unitId: 'a2-u8',
    type: 'multiple-choice',
    question: 'If you eat too much, you ___ feel sick.',
    correctAnswer: "will",
    options: ['will', 'would', 'are going to', 'do'],
    explanation: 'En la cláusula de resultado de la primera condicional se usa "will + verbo base".',
  },
  {
    id: 'ex-a2-u8-4',
    unitId: 'a2-u8',
    type: 'multiple-choice',
    question: '___ you hurry, you\'ll miss the bus.',
    correctAnswer: 'Unless',
    options: ['Unless', 'If', 'When', 'While'],
    explanation: '"Unless" = "if not". "Unless you hurry" = "If you don\'t hurry".',
  },
  {
    id: 'ex-a2-u8-5',
    unitId: 'a2-u8',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: "If she calls, I'll answer.",
    scrambledWords: ["I'll", 'If', 'calls,', 'she', 'answer.'],
    explanation: 'Primera condicional: If + presente simple + coma + will + verbo base.',
  },
  {
    id: 'ex-a2-u8-6',
    unitId: 'a2-u8',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: "They won't come if it snows.",
    scrambledWords: ["won't", 'snows.', 'if', 'come', 'it', 'They'],
    explanation: 'Primera condicional negativa: won\'t + verbo base en la cláusula resultado. La cláusula "if" va al final, sin coma.',
  },

  // ===== Unit 9: Adverbs of manner + past continuous =====
  {
    id: 'ex-a2-u9-1',
    unitId: 'a2-u9',
    type: 'fill-blank',
    question: 'She sings very ___ (beautiful).',
    correctAnswer: 'beautifully',
    explanation: 'El adverbio de modo se forma con adjetivo + -ly: beautiful → beautifully.',
  },
  {
    id: 'ex-a2-u9-2',
    unitId: 'a2-u9',
    type: 'fill-blank',
    question: 'At 9 pm last night, I ___ (watch) a documentary.',
    correctAnswer: 'was watching',
    explanation: 'Pasado continuo: was/were + verbo-ing. Con "I" se usa "was watching" para indicar acción en progreso en un momento pasado.',
  },
  {
    id: 'ex-a2-u9-3',
    unitId: 'a2-u9',
    type: 'multiple-choice',
    question: 'He runs very ___.',
    correctAnswer: 'fast',
    options: ['fastly', 'fast', 'faster', 'fastness'],
    explanation: '"Fast" es un adverbio irregular: no se agrega -ly. La forma adverbial es igual al adjetivo: fast.',
  },
  {
    id: 'ex-a2-u9-4',
    unitId: 'a2-u9',
    type: 'multiple-choice',
    question: 'I ___ when the earthquake started.',
    correctAnswer: 'was sleeping',
    options: ['slept', 'was sleeping', 'am sleeping', 'sleep'],
    explanation: 'El pasado continuo (was sleeping) describe la acción que estaba en progreso cuando ocurrió algo (el terremoto).',
  },
  {
    id: 'ex-a2-u9-5',
    unitId: 'a2-u9',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'She was reading when he arrived.',
    scrambledWords: ['reading', 'arrived.', 'was', 'he', 'She', 'when'],
    explanation: 'Pasado continuo + when + pasado simple: la acción continua (was reading) fue interrumpida por otra (arrived).',
  },
  {
    id: 'ex-a2-u9-6',
    unitId: 'a2-u9',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'While they were dancing, I was taking photos.',
    scrambledWords: ['photos.', 'While', 'I', 'dancing,', 'taking', 'they', 'was', 'were'],
    explanation: '"While" + pasado continuo para dos acciones simultáneas en el pasado: While they were dancing, I was taking photos.',
  },
];
