import type { Unit, GrammarCard, GrammarExercise } from '../../lib/db';

export const b1Units: Unit[] = [
  {
    id: 'b1-u1',
    level: 'B1',
    unitNumber: 1,
    title: 'Life Experiences',
    grammarTopic: 'Present Perfect Simple (experience + unfinished time)',
    theme: 'Life experiences, achievements',
    isAssessment: false,
  },
  {
    id: 'b1-u2',
    level: 'B1',
    unitNumber: 2,
    title: 'Recent News',
    grammarTopic: 'Present Perfect vs Past Simple',
    theme: 'News, recent events',
    isAssessment: false,
  },
  {
    id: 'b1-u3',
    level: 'B1',
    unitNumber: 3,
    title: 'How Long Has It Been?',
    grammarTopic: 'Present Perfect Continuous',
    theme: 'Duration, ongoing situations',
    isAssessment: false,
  },
  {
    id: 'b1-u4',
    level: 'B1',
    unitNumber: 4,
    title: 'Before It Happened',
    grammarTopic: 'Past Perfect',
    theme: 'Storytelling, sequences',
    isAssessment: false,
  },
  {
    id: 'b1-u5',
    level: 'B1',
    unitNumber: 5,
    title: 'Back in the Day',
    grammarTopic: 'Used to + would (past habits)',
    theme: 'Childhood, changes over time',
    isAssessment: false,
  },
  {
    id: 'b1-u6',
    level: 'B1',
    unitNumber: 6,
    title: 'How Things Are Made',
    grammarTopic: 'Passive voice (present + past)',
    theme: 'Processes, news, descriptions',
    isAssessment: false,
  },
  {
    id: 'b1-u7',
    level: 'B1',
    unitNumber: 7,
    title: 'Dream Scenarios',
    grammarTopic: 'Second conditional (if + past → would)',
    theme: 'Hypotheticals, dreams',
    isAssessment: false,
  },
  {
    id: 'b1-u8',
    level: 'B1',
    unitNumber: 8,
    title: 'What Did They Say?',
    grammarTopic: 'Reported speech (basic: said/told)',
    theme: 'Retelling conversations, news',
    isAssessment: false,
  },
  {
    id: 'b1-u9',
    level: 'B1',
    unitNumber: 9,
    title: 'Describing the World',
    grammarTopic: 'Relative clauses (who/which/that/where)',
    theme: 'Defining people and things',
    isAssessment: false,
  },
  {
    id: 'b1-u10',
    level: 'B1',
    unitNumber: 10,
    title: 'Likes and Goals',
    grammarTopic: 'Gerunds vs infinitives',
    theme: 'Opinions, preferences, habits',
    isAssessment: false,
  },
  {
    id: 'b1-u11',
    level: 'B1',
    unitNumber: 11,
    title: 'Possibilities and Limits',
    grammarTopic: 'Modal verbs: might/could/would + too/enough',
    theme: 'Speculation, evaluating',
    isAssessment: false,
  },
  {
    id: 'b1-u12',
    level: 'B1',
    unitNumber: 12,
    title: 'B1 Level Assessment',
    grammarTopic: 'All B1 grammar',
    theme: 'Comprehensive review',
    isAssessment: true,
  },
];

export const b1GrammarCards: GrammarCard[] = [
  // ===== Unit 1: Present Perfect Simple =====
  {
    id: 'gc-b1-u1',
    unitId: 'b1-u1',
    title: 'Present Perfect Simple',
    explanation: `<h3>Formación</h3>
<p><strong>have/has + participio pasado</strong></p>
<ul>
<li><strong>I/You/We/They have</strong> + participio → I have seen</li>
<li><strong>He/She/It has</strong> + participio → She has eaten</li>
<li>Contracción: I've, you've, we've, they've, he's, she's, it's</li>
<li>Negativo: haven't / hasn't + participio</li>
<li>Pregunta: Have/Has + sujeto + participio?</li>
</ul>
<h3>Usos principales</h3>
<ul>
<li><strong>Experiencias de vida</strong> (ever/never): "Have you ever been to Japan?"</li>
<li><strong>Períodos de tiempo no terminados</strong> (today, this week, this year): "I've read three books this month."</li>
<li><strong>Acción reciente con resultado presente</strong>: "She's broken her leg." (por eso no puede caminar)</li>
</ul>
<h3>Adverbios clave</h3>
<ul>
<li><strong>ever</strong> (alguna vez) — en preguntas: Have you ever tried...?</li>
<li><strong>never</strong> (nunca) — en afirmativas: I've never seen that film.</li>
<li><strong>already</strong> (ya) — indica antes de lo esperado: I've already finished.</li>
<li><strong>yet</strong> (aún/todavía) — en negativas y preguntas: Have you eaten yet? / I haven't eaten yet.</li>
<li><strong>just</strong> (acabar de) — acción muy reciente: She's just arrived.</li>
<li><strong>recently / lately</strong> (recientemente) — con estado continuo: I've been busy lately.</li>
</ul>
<h3>Participios irregulares esenciales</h3>
<ul>
<li>go → gone, be → been, have → had, see → seen, take → taken</li>
<li>make → made, write → written, speak → spoken, give → given</li>
<li>know → known, do → done, get → got/gotten, eat → eaten</li>
<li>drink → drunk, read → read, think → thought, buy → bought</li>
<li>come → come, become → become, run → run, put → put</li>
</ul>`,
    examples: [
      'I have never been to Australia. → Nunca he estado en Australia.',
      'She has already finished her homework. → Ella ya terminó su tarea.',
      'Have you ever tried sushi? → ¿Alguna vez has probado el sushi?',
      'He has just called me. → Él acaba de llamarme.',
      "We haven't eaten yet. → Todavía no hemos comido.",
    ],
    rules: [
      'Usa have con I/you/we/they y has con he/she/it',
      'El participio pasado es la tercera columna de los verbos irregulares (go → went → gone)',
      '"Ever/never" van entre have/has y el participio en experiencias',
      '"Yet" va al final de la oración en negativos y preguntas',
      '"Already" va entre have/has y el participio en afirmativas',
    ],
  },

  // ===== Unit 2: Present Perfect vs Past Simple =====
  {
    id: 'gc-b1-u2',
    unitId: 'b1-u2',
    title: 'Present Perfect vs Pasado Simple',
    explanation: `<h3>La diferencia clave</h3>
<p>Ambos hablan del pasado, pero con enfoques distintos:</p>
<ul>
<li><strong>Present Perfect</strong> → el MOMENTO no importa o no se menciona; hay conexión con el presente</li>
<li><strong>Past Simple</strong> → el MOMENTO sí se menciona o se entiende; acción completa, sin relación con el presente</li>
</ul>
<h3>Palabras que indican cuál usar</h3>
<table>
<tr><td><strong>Present Perfect</strong></td><td><strong>Past Simple</strong></td></tr>
<tr><td>today, this week, this year</td><td>yesterday, last week, last year</td></tr>
<tr><td>ever, never, already, yet, just</td><td>ago, in 2019, in January</td></tr>
<tr><td>recently, lately, so far</td><td>when I was young, at that time</td></tr>
</table>
<h3>Contraste con ejemplos</h3>
<ul>
<li>"I've been to Paris." (experiencia, sin fecha específica) vs. "I went to Paris in 2019." (momento específico)</li>
<li>"She's lost her keys." (problema presente ahora) vs. "She lost her keys yesterday." (hecho pasado completo)</li>
</ul>
<h3>Error común en hispanohablantes</h3>
<p>En español, muchas regiones usan el pretérito indefinido para todo ("Fui", "Comí"), por eso tendemos a usar siempre Past Simple en inglés. Recuerda: si el tiempo NO está especificado o si hay conexión con el presente, usa Present Perfect.</p>`,
    examples: [
      'I have seen that film. → He visto esa película. (en algún momento de mi vida)',
      'I saw that film on Friday. → Vi esa película el viernes. (momento específico)',
      'Have you heard the news? → ¿Has escuchado las noticias? (relevante ahora)',
      'She worked here for ten years. → Ella trabajó aquí por diez años. (ya no trabaja aquí)',
      "We haven't decided yet. → Todavía no hemos decidido. (el proceso sigue)",
    ],
    rules: [
      'Si se menciona CUÁNDO, usa Past Simple: "I went last week"',
      'Si el tiempo es abierto o irrelevante, usa Present Perfect: "I have been there"',
      'Present Perfect conecta el pasado con el presente; Past Simple no',
      'Con "ago", "last", "yesterday", "in [year]" → siempre Past Simple',
      'Con "today", "this week", "ever", "just", "already", "yet" → Present Perfect',
    ],
  },

  // ===== Unit 3: Present Perfect Continuous =====
  {
    id: 'gc-b1-u3',
    unitId: 'b1-u3',
    title: 'Present Perfect Continuous',
    explanation: `<h3>Formación</h3>
<p><strong>have/has + been + verbo-ing</strong></p>
<ul>
<li>I/You/We/They have been working → He estado trabajando</li>
<li>He/She/It has been working → Ha estado trabajando</li>
<li>Negativo: haven't/hasn't been + verbo-ing</li>
<li>Pregunta: Have/Has + sujeto + been + verbo-ing?</li>
</ul>
<h3>Usos</h3>
<ul>
<li><strong>Actividad que empezó en el pasado y CONTINÚA ahora</strong>: "I've been studying for three hours." (sigo estudiando)</li>
<li><strong>Actividad reciente con resultado visible en el presente</strong>: "She's been crying." (se nota en sus ojos)</li>
</ul>
<h3>For vs Since</h3>
<ul>
<li><strong>for</strong> + período de tiempo: for two hours, for a week, for years</li>
<li><strong>since</strong> + punto de inicio: since 2020, since Monday, since I was a child</li>
</ul>
<h3>Present Perfect Simple vs Continuous</h3>
<ul>
<li><strong>Simple</strong> → enfoque en el RESULTADO o número de veces: "I've written three emails." (están terminados)</li>
<li><strong>Continuous</strong> → enfoque en la DURACIÓN o el proceso: "I've been writing emails all morning." (actividad)</li>
</ul>
<h3>Verbos no usados en forma continua (estativos)</h3>
<p>know, believe, love, hate, want, need, seem, understand, remember, belong, own, contain — con estos verbos usa Present Perfect Simple.</p>`,
    examples: [
      "I've been waiting for you for an hour. → Llevo una hora esperándote.",
      "She's been working here since 2021. → Ella ha estado trabajando aquí desde 2021.",
      "They've been arguing all day. → Han estado discutiendo todo el día.",
      "He's been running — look at his shirt! → Ha estado corriendo — ¡mira su camiseta!",
      'How long have you been learning English? → ¿Cuánto tiempo llevas aprendiendo inglés?',
    ],
    rules: [
      'Estructura: have/has + been + verbo-ing',
      'Usa "for" con duración (for 2 hours) y "since" con punto de inicio (since Monday)',
      'Verbos estativos (know, love, believe) NO se usan en forma continua',
      'El enfoque es en la DURACIÓN o el proceso, no en el resultado',
      'La actividad puede haber terminado justo antes (resultado visible ahora)',
    ],
  },

  // ===== Unit 4: Past Perfect =====
  {
    id: 'gc-b1-u4',
    unitId: 'b1-u4',
    title: 'Pasado Perfecto (Past Perfect)',
    explanation: `<h3>Formación</h3>
<p><strong>had + participio pasado</strong> (igual para todos los sujetos)</p>
<ul>
<li>I/you/he/she/we/they <strong>had</strong> + participio</li>
<li>Contracción: I'd, you'd, he'd, she'd, we'd, they'd</li>
<li>Negativo: hadn't + participio</li>
<li>Pregunta: Had + sujeto + participio?</li>
</ul>
<h3>Uso principal: el "pasado del pasado"</h3>
<p>Se usa para indicar que una acción ocurrió <strong>antes que otra acción pasada</strong>. Cuando contamos dos cosas del pasado y queremos aclarar cuál sucedió primero.</p>
<h3>Marcadores de tiempo comunes</h3>
<ul>
<li><strong>before</strong>: She had eaten before he arrived.</li>
<li><strong>after</strong>: After I had finished work, I went home.</li>
<li><strong>when</strong>: When I arrived, the film had already started.</li>
<li><strong>by the time</strong>: By the time he called, she had left.</li>
<li><strong>already, just, never, still</strong> también se usan con Past Perfect.</li>
</ul>
<h3>Past Perfect vs Past Simple</h3>
<ul>
<li>"She ate after he arrived." → Las dos acciones están en Past Simple; la secuencia se entiende por "after".</li>
<li>"She had eaten before he arrived." → Past Perfect enfatiza que comer ocurrió primero.</li>
<li>En narrativa, el Past Perfect se usa para dar contexto de fondo a la historia.</li>
</ul>`,
    examples: [
      'By the time I arrived, the party had already finished. → Cuando llegué, la fiesta ya había terminado.',
      'She had never seen snow before that winter. → Ella nunca había visto nieve antes de ese invierno.',
      'He was tired because he had worked all night. → Estaba cansado porque había trabajado toda la noche.',
      'I realized I had left my keys at home. → Me di cuenta de que había dejado mis llaves en casa.',
      "After they had discussed it, they made a decision. → Después de haberlo discutido, tomaron una decisión.",
    ],
    rules: [
      'Estructura: had + participio pasado (igual para todos los sujetos)',
      'Expresa la acción más antigua cuando hay dos acciones en el pasado',
      '"By the time", "before", "when", "after" son señales de que puede necesitarse Past Perfect',
      'En narrativa, clarifica la secuencia de eventos',
      'No es necesario si "before" o "after" ya indican la secuencia claramente',
    ],
  },

  // ===== Unit 5: Used to + would =====
  {
    id: 'gc-b1-u5',
    unitId: 'b1-u5',
    title: 'Used to + Would (hábitos del pasado)',
    explanation: `<h3>USED TO — hábitos y estados del pasado</h3>
<p>Se usa para hablar de <strong>hábitos o estados que existían en el pasado pero ya NO ocurren</strong>.</p>
<ul>
<li>Afirmativo: Sujeto + <strong>used to</strong> + verbo base: I used to play football.</li>
<li>Negativo: Sujeto + <strong>didn't use to</strong> + verbo base: I didn't use to like vegetables.</li>
<li>Pregunta: <strong>Did</strong> + sujeto + <strong>use to</strong> + verbo base? (¡sin "d" final!): Did you use to live here?</li>
</ul>
<p>"Used to" funciona tanto para <strong>acciones repetidas</strong> como para <strong>estados</strong>:</p>
<ul>
<li>I used to play tennis. ✓ (hábito)</li>
<li>I used to have a dog. ✓ (estado pasado)</li>
</ul>
<h3>WOULD — acciones repetidas del pasado</h3>
<p>Se usa para hablar de <strong>acciones repetidas o rutinas del pasado</strong>, pero NO de estados.</p>
<ul>
<li>When I was a child, I <strong>would</strong> wake up early every day. ✓</li>
<li>I <strong>would have</strong> a dog. ✗ (no se puede con estados)</li>
</ul>
<h3>Diferencias clave</h3>
<ul>
<li><strong>Used to</strong>: hábitos Y estados del pasado</li>
<li><strong>Would</strong>: solo acciones repetidas, NO estados</li>
<li>Verbos de estado con would: have, be, know, love, belong, want — NO se usan con "would" para pasado habitual</li>
</ul>
<h3>Used to vs Past Simple</h3>
<p>El Past Simple describe un evento único; "used to" enfatiza que era un hábito o estado continuo que ya cambió: "I played tennis yesterday." (una vez) vs. "I used to play tennis." (rutina pasada)</p>`,
    examples: [
      'I used to walk to school when I was young. → Solía caminar a la escuela cuando era joven.',
      'She used to have long hair. → Ella solía tener el cabello largo.',
      "He didn't use to like coffee, but now he drinks it every day. → Antes no le gustaba el café, pero ahora lo bebe cada día.",
      'Did you use to play any sports? → ¿Solías practicar algún deporte?',
      'On weekends, we would visit my grandparents and they would cook big meals. → Los fines de semana, visitábamos a mis abuelos y cocinaban comidas abundantes.',
    ],
    rules: [
      '"Used to" expresa hábitos o estados pasados que ya no ocurren',
      'En preguntas y negativo con "did": "Did you use to...?" (sin "d" final en "use")',
      '"Would" solo se usa para acciones repetidas, NO para estados (love, have, be)',
      'Ambos implican que la situación ya cambió o terminó',
      'Si el hábito pasado se menciona sin énfasis especial, también puede usarse Past Simple',
    ],
  },

  // ===== Unit 6: Passive voice =====
  {
    id: 'gc-b1-u6',
    unitId: 'b1-u6',
    title: 'Voz Pasiva (presente y pasado)',
    explanation: `<h3>Estructura básica</h3>
<ul>
<li><strong>Presente Pasivo</strong>: am/is/are + participio pasado</li>
<li><strong>Pasado Pasivo</strong>: was/were + participio pasado</li>
</ul>
<h3>Presente pasivo</h3>
<ul>
<li>The report <strong>is written</strong> every week. → El informe se escribe cada semana.</li>
<li>Cars <strong>are made</strong> in this factory. → Los coches se fabrican en esta fábrica.</li>
</ul>
<h3>Pasado pasivo</h3>
<ul>
<li>The letter <strong>was sent</strong> yesterday. → La carta fue enviada ayer.</li>
<li>The windows <strong>were broken</strong> during the storm. → Las ventanas fueron rotas durante la tormenta.</li>
</ul>
<h3>Cuándo usar la voz pasiva</h3>
<ul>
<li>El agente (quien hace la acción) es <strong>desconocido</strong>: "My bike was stolen."</li>
<li>El agente es <strong>irrelevante o evidente</strong>: "The criminal was arrested." (por la policía, se entiende)</li>
<li>Para dar <strong>énfasis al objeto</strong> en lugar del sujeto</li>
<li>Textos formales, científicos, noticias y descripciones de procesos</li>
</ul>
<h3>El agente: by + persona/cosa</h3>
<p>Si el agente es importante, se añade <strong>by + agente</strong> al final:</p>
<ul>
<li>"The Mona Lisa was painted by Leonardo da Vinci."</li>
</ul>
<h3>Transformación activa → pasiva</h3>
<p>Activa: "They sell coffee here." → Pasiva: "Coffee is sold here."</p>
<p>El objeto de la activa se convierte en sujeto de la pasiva. El verbo cambia a be + participio.</p>`,
    examples: [
      'English is spoken all over the world. → El inglés se habla en todo el mundo.',
      'The film was directed by Christopher Nolan. → La película fue dirigida por Christopher Nolan.',
      'The windows are cleaned every Friday. → Las ventanas se limpian cada viernes.',
      'Three people were injured in the accident. → Tres personas resultaron heridas en el accidente.',
      'Rice is grown in many Asian countries. → El arroz se cultiva en muchos países asiáticos.',
    ],
    rules: [
      'Presente pasivo: am/is/are + participio pasado',
      'Pasado pasivo: was/were + participio pasado',
      'El sujeto de la pasiva recibe la acción (no la realiza)',
      'Usa "by + agente" cuando el agente es importante o interesante',
      'Muy común en noticias, ciencia, procesos y lenguaje formal',
    ],
  },

  // ===== Unit 7: Second conditional =====
  {
    id: 'gc-b1-u7',
    unitId: 'b1-u7',
    title: 'Segunda Condicional (Second Conditional)',
    explanation: `<h3>Estructura</h3>
<p><strong>If + pasado simple → would + verbo base</strong></p>
<ul>
<li>If I <strong>had</strong> more time, I <strong>would travel</strong> more.</li>
<li>She <strong>would be</strong> happier if she <strong>lived</strong> near the sea.</li>
</ul>
<h3>Significado</h3>
<p>Expresa situaciones <strong>imaginarias, hipotéticas o improbables</strong> en el presente o futuro. La condición es contraria a la realidad actual.</p>
<ul>
<li>"If I were rich, I would buy a house." → No soy rico, es solo una fantasía.</li>
<li>"If I lived in Spain, I would speak Spanish every day." → No vivo en España.</li>
</ul>
<h3>Primera vs Segunda Condicional</h3>
<ul>
<li><strong>Primera</strong> (real/posible): If it rains, I will take an umbrella. (puede pasar)</li>
<li><strong>Segunda</strong> (imaginaria/improbable): If it rained every day, I would move. (hipotético)</li>
</ul>
<h3>Were para todos los sujetos</h3>
<p>En inglés formal y correcto, se usa <strong>were</strong> para todos los sujetos (no "was") en la cláusula con "if":</p>
<ul>
<li>If I <strong>were</strong> you, I would apologize. (no "If I was you")</li>
<li>If she <strong>were</strong> here, she would know what to do.</li>
</ul>
<h3>Variaciones con could y might</h3>
<ul>
<li><strong>could</strong> en lugar de "would": "If I had more money, I could buy a car." (posibilidad/capacidad)</li>
<li><strong>might</strong> en lugar de "would": "If I won, I might quit my job." (posibilidad menos segura)</li>
</ul>`,
    examples: [
      'If I had more money, I would travel the world. → Si tuviera más dinero, viajaría por el mundo.',
      "If she were taller, she could be a model. → Si fuera más alta, podría ser modelo.",
      'What would you do if you lost your job? → ¿Qué harías si perdieras tu trabajo?',
      'I would call you if I had your number. → Te llamaría si tuviera tu número.',
      'If we lived closer, we would see each other more often. → Si viviéramos más cerca, nos veríamos más seguido.',
    ],
    rules: [
      'Estructura: If + pasado simple, would + verbo base',
      'Expresa situaciones imaginarias o contrarias a la realidad actual',
      'En inglés formal, usa "were" para todos los sujetos (If I were...)',
      'Puedes usar "could" o "might" en lugar de "would" para matices diferentes',
      'El orden de las cláusulas puede invertirse: "I would travel more if I had time."',
    ],
  },

  // ===== Unit 8: Reported speech =====
  {
    id: 'gc-b1-u8',
    unitId: 'b1-u8',
    title: 'Estilo Indirecto (Reported Speech)',
    explanation: `<h3>Verbos de reporte principales</h3>
<ul>
<li><strong>said</strong>: He said (that) he was tired. (no lleva objeto personal)</li>
<li><strong>told</strong>: She told me (that) she was leaving. (lleva objeto personal obligatorio)</li>
<li><strong>asked</strong>: He asked if I was okay. (para preguntas)</li>
</ul>
<h3>Retroceso de tiempos verbales (backshift)</h3>
<table>
<tr><td><strong>Estilo directo</strong></td><td><strong>Estilo indirecto</strong></td></tr>
<tr><td>am/is/are (Present Simple)</td><td>was/were (Past Simple)</td></tr>
<tr><td>do/does (Present Simple)</td><td>did (Past Simple)</td></tr>
<tr><td>will</td><td>would</td></tr>
<tr><td>can</td><td>could</td></tr>
<tr><td>Present Perfect (have/has + pp)</td><td>Past Perfect (had + pp)</td></tr>
<tr><td>Past Simple</td><td>Past Perfect (had + pp)</td></tr>
</table>
<h3>Cambios de pronombres</h3>
<ul>
<li>"I" → he/she según quién habló</li>
<li>"we" → they</li>
<li>"my" → his/her, "our" → their</li>
</ul>
<h3>Cambios de expresiones de tiempo y lugar</h3>
<ul>
<li>now → then, today → that day, here → there</li>
<li>tomorrow → the next day / the following day</li>
<li>yesterday → the day before / the previous day</li>
<li>this week → that week, last year → the previous year</li>
</ul>
<h3>Preguntas en estilo indirecto</h3>
<p>Orden normal (sujeto + verbo), NO inversión: "Are you okay?" → He asked if I was okay.</p>`,
    examples: [
      '"I love this city," she said. → She said (that) she loved that city.',
      '"I will call you," he promised. → He promised (that) he would call me.',
      '"We have finished," they said. → They said (that) they had finished.',
      '"Are you coming?" she asked. → She asked if I was coming.',
      '"I can help you," Tom told Ana. → Tom told Ana (that) he could help her.',
    ],
    rules: [
      '"Said" no lleva objeto personal; "told" siempre lleva objeto: told me/him/her/us/them',
      'Los tiempos verbales retroceden un paso hacia el pasado',
      'Los pronombres cambian según el nuevo contexto del hablante',
      'Las expresiones de tiempo y lugar también cambian (now→then, here→there)',
      'En preguntas indirectas el orden es normal: asked if/whether + sujeto + verbo',
    ],
  },

  // ===== Unit 9: Relative clauses =====
  {
    id: 'gc-b1-u9',
    unitId: 'b1-u9',
    title: 'Cláusulas Relativas (Relative Clauses)',
    explanation: `<h3>Pronombres relativos</h3>
<ul>
<li><strong>who</strong> → para personas: "The man who called me is my uncle."</li>
<li><strong>which</strong> → para cosas o animales: "The car which broke down is mine."</li>
<li><strong>that</strong> → para personas o cosas (uso más informal): "The book that I read was amazing."</li>
<li><strong>where</strong> → para lugares: "The city where I was born is beautiful."</li>
<li><strong>whose</strong> → para posesión: "The girl whose phone was stolen is upset."</li>
<li><strong>when</strong> → para tiempo: "The day when we met was rainy."</li>
</ul>
<h3>Cláusulas relativas definitorias (defining)</h3>
<p>Dan información <strong>esencial</strong> para identificar al sujeto. Sin ellas, la oración pierde sentido o cambia.</p>
<ul>
<li>"The woman who works here is my sister." → (no todas las mujeres, solo la que trabaja aquí)</li>
<li>NO llevan comas.</li>
</ul>
<h3>Omisión del pronombre relativo</h3>
<p>Cuando el pronombre relativo es el <strong>objeto</strong> de la cláusula (no el sujeto), se puede omitir:</p>
<ul>
<li>"The book (that) I read was amazing." → "that" es objeto (yo leí el libro), se puede quitar.</li>
<li>"The man who called me..." → "who" es sujeto (él llamó), NO se puede quitar.</li>
</ul>
<h3>That vs Which</h3>
<ul>
<li>En cláusulas definitorias, "that" es común y más informal.</li>
<li>En cláusulas no definitorias (con coma), se usa "which", nunca "that".</li>
</ul>`,
    examples: [
      'The person who helped me was very kind. → La persona que me ayudó fue muy amable.',
      "I need a computer which doesn't crash. → Necesito una computadora que no se cuelgue.",
      'That is the restaurant where we had our first date. → Ese es el restaurante donde tuvimos nuestra primera cita.',
      'Do you know the student whose essay won the prize? → ¿Conoces al estudiante cuyo ensayo ganó el premio?',
      'The film (that) I watched last night was incredible. → La película que vi anoche fue increíble.',
    ],
    rules: [
      '"Who" para personas, "which" para cosas, "where" para lugares, "whose" para posesión',
      '"That" puede reemplazar a "who" o "which" en cláusulas definitorias',
      'Las cláusulas definitorias no llevan comas y dan información esencial',
      'El pronombre relativo puede omitirse cuando es el objeto de la cláusula',
      'No se puede omitir cuando el pronombre es el sujeto de la cláusula',
    ],
  },

  // ===== Unit 10: Gerunds vs infinitives =====
  {
    id: 'gc-b1-u10',
    unitId: 'b1-u10',
    title: 'Gerundio vs Infinitivo',
    explanation: `<h3>El gerundio (verbo + -ing)</h3>
<p>Se usa como sustantivo o después de ciertos verbos y preposiciones.</p>
<ul>
<li><strong>Como sujeto</strong>: Swimming is great exercise.</li>
<li><strong>Después de preposiciones</strong>: She's good at cooking. / I'm interested in learning.</li>
<li><strong>Después de estos verbos</strong>: enjoy, avoid, finish, suggest, consider, keep, mind, deny, miss, practice, risk, stop (= dejar de), imagine, admit, delay</li>
</ul>
<h3>El infinitivo (to + verbo)</h3>
<p>Se usa después de ciertos verbos, adjetivos y para expresar propósito.</p>
<ul>
<li><strong>Para expresar propósito</strong>: I went to the gym to exercise.</li>
<li><strong>Después de adjetivos</strong>: It's difficult to understand. / I'm happy to help.</li>
<li><strong>Después de estos verbos</strong>: want, need, hope, decide, plan, agree, offer, refuse, forget (to do), remember (to do), manage, seem, appear, expect, promise, learn, would like</li>
</ul>
<h3>Verbos con ambas formas (distinto significado)</h3>
<ul>
<li><strong>stop</strong>: "I stopped smoking." (dejé de fumar) vs. "I stopped to smoke." (paré para fumar)</li>
<li><strong>remember</strong>: "I remembered calling." (recuerdo haber llamado) vs. "I remembered to call." (no olvidé llamar)</li>
<li><strong>forget</strong>: "I'll never forget meeting you." (el recuerdo del encuentro) vs. "I forgot to call." (olvidé hacer la llamada)</li>
<li><strong>try</strong>: "I tried opening the window." (intenté como experimento) vs. "I tried to open it." (intenté pero fue difícil)</li>
<li><strong>regret</strong>: "I regret saying that." (me arrepiento de haber dicho) vs. "I regret to say..." (lamento informarle)</li>
</ul>`,
    examples: [
      'I enjoy listening to music. → Me gusta escuchar música. (enjoy + gerundio)',
      'She decided to study abroad. → Ella decidió estudiar en el extranjero. (decide + infinitivo)',
      'He stopped smoking last year. → Él dejó de fumar el año pasado. (stop + gerundio = dejar de)',
      'He stopped to smoke outside. → Paró para fumar afuera. (stop + infinitivo = parar con el propósito de)',
      'I forgot to buy milk. → Olvidé comprar leche. (forgot + infinitivo = tarea no completada)',
    ],
    rules: [
      'Después de preposiciones, siempre usa gerundio: "good at swimming", "interested in learning"',
      'Los verbos "enjoy, avoid, finish, keep, mind, miss, practice, risk" van seguidos de gerundio',
      'Los verbos "want, need, decide, hope, plan, agree, refuse, manage" van seguidos de infinitivo',
      'Algunos verbos cambian de significado con gerundio vs. infinitivo: stop, remember, forget, try',
      '"It is + adjetivo + infinitivo": It is easy to learn, it is worth trying',
    ],
  },

  // ===== Unit 11: Modals + too/enough =====
  {
    id: 'gc-b1-u11',
    unitId: 'b1-u11',
    title: 'Verbos Modales (might/could/would) + too/enough',
    explanation: `<h3>MIGHT — posibilidad incierta</h3>
<ul>
<li>Expresa posibilidad o incertidumbre: "It might rain tomorrow." (quizás llueva, no estoy seguro)</li>
<li>Más incierto que "should" o "must"</li>
<li>Forma: might + verbo base (igual para todos los sujetos)</li>
</ul>
<h3>COULD — posibilidad / sugerencia / petición formal</h3>
<ul>
<li>Posibilidad: "The keys could be under the sofa." (puede que estén ahí)</li>
<li>Sugerencia: "You could take a taxi." (tienes esa opción)</li>
<li>Petición educada: "Could you help me, please?"</li>
</ul>
<h3>WOULD — condicional / petición educada / hábito pasado</h3>
<ul>
<li>Condicional: "I would travel more if I had money."</li>
<li>Petición educada: "Would you like some tea?"</li>
<li>Hábito pasado (con contexto): "When I was young, I would read every night."</li>
</ul>
<h3>Escala de deducción / probabilidad</h3>
<ul>
<li><strong>must</strong> → casi certeza: "She must be tired." (estoy casi seguro)</li>
<li><strong>should</strong> → bastante probable: "He should be home by now."</li>
<li><strong>might / could</strong> → posible: "They might be late."</li>
<li><strong>can't</strong> → imposible: "That can't be right."</li>
</ul>
<h3>TOO — exceso (negativo)</h3>
<p><strong>too + adjetivo/adverbio</strong>: más de lo deseable o necesario.</p>
<ul>
<li>"This coffee is too hot (to drink)." → Tan caliente que no se puede beber.</li>
<li>"He speaks too quickly for me to understand." → Tan rápido que no entiendo.</li>
</ul>
<h3>ENOUGH — suficiente</h3>
<p>Posición: <strong>adjetivo/adverbio + enough</strong> o <strong>enough + sustantivo</strong>.</p>
<ul>
<li>"She is tall enough to reach the shelf." → Suficientemente alta.</li>
<li>"We don't have enough time." → No tenemos suficiente tiempo.</li>
<li>"He isn't old enough to drive." → No es lo suficientemente mayor.</li>
</ul>`,
    examples: [
      'It might snow tonight. → Puede que nieve esta noche.',
      'You could take the bus instead. → Podrías tomar el autobús en cambio.',
      'Would you mind closing the window? → ¿Te importaría cerrar la ventana?',
      "She's too tired to go out. → Está demasiado cansada para salir.",
      "He isn't confident enough to give a speech. → No tiene suficiente confianza para dar un discurso.",
    ],
    rules: [
      '"Might" expresa posibilidad incierta; más débil que "must" o "should"',
      '"Could" tiene múltiples usos: posibilidad, sugerencia y petición educada',
      '"Would" se usa para condicionales, peticiones educadas y hábitos pasados',
      '"Too" siempre expresa exceso negativo: too + adjetivo/adverbio',
      '"Enough" va DESPUÉS del adjetivo/adverbio pero ANTES del sustantivo',
    ],
  },
];

export const b1Exercises: GrammarExercise[] = [
  // ===== Unit 1: Present Perfect Simple =====
  {
    id: 'ex-b1-u1-1',
    unitId: 'b1-u1',
    type: 'fill-blank',
    question: 'I ___ never ___ (be) to Japan.',
    correctAnswer: 'have ... been',
    explanation: 'El Present Perfect con "never" se forma con have/has + participio pasado. El participio de "be" es "been".',
  },
  {
    id: 'ex-b1-u1-2',
    unitId: 'b1-u1',
    type: 'fill-blank',
    question: 'She ___ already ___ (finish) the report.',
    correctAnswer: 'has ... finished',
    explanation: 'Con "she" se usa "has". "Already" indica que algo ocurrió antes de lo esperado. "Finished" es el participio de "finish".',
  },
  {
    id: 'ex-b1-u1-3',
    unitId: 'b1-u1',
    type: 'multiple-choice',
    question: 'They ___ just ___ the news about the earthquake.',
    correctAnswer: 'have heard',
    options: ['heard', 'have heard', 'had heard', 'are hearing'],
    explanation: '"Just" con Present Perfect indica una acción muy reciente. Se usa have + participio con "they".',
  },
  {
    id: 'ex-b1-u1-4',
    unitId: 'b1-u1',
    type: 'multiple-choice',
    question: '___you ever ___ sushi?',
    correctAnswer: 'Have ... tried',
    options: ['Have ... tried', 'Did ... try', 'Do ... try', 'Were ... trying'],
    explanation: 'Las preguntas sobre experiencias de vida usan Present Perfect: Have + sujeto + ever + participio.',
  },
  {
    id: 'ex-b1-u1-5',
    unitId: 'b1-u1',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'Have you ever tried sushi?',
    scrambledWords: ['tried', 'Have', 'ever', 'you', 'sushi?'],
    explanation: 'Pregunta de experiencia: Have + sujeto + ever + participio + complemento?',
  },
  {
    id: 'ex-b1-u1-6',
    unitId: 'b1-u1',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: "I haven't seen her yet.",
    scrambledWords: ["haven't", 'I', 'her', 'yet.', 'seen'],
    explanation: '"Yet" va al final en oraciones negativas con Present Perfect.',
  },

  // ===== Unit 2: Present Perfect vs Past Simple =====
  {
    id: 'ex-b1-u2-1',
    unitId: 'b1-u2',
    type: 'fill-blank',
    question: 'I ___ (visit) Paris twice in my life.',
    correctAnswer: 'have visited',
    explanation: '"Twice in my life" es una experiencia sin tiempo específico → Present Perfect.',
  },
  {
    id: 'ex-b1-u2-2',
    unitId: 'b1-u2',
    type: 'fill-blank',
    question: 'She ___ (graduate) from university last June.',
    correctAnswer: 'graduated',
    explanation: '"Last June" es un tiempo específico pasado → Past Simple.',
  },
  {
    id: 'ex-b1-u2-3',
    unitId: 'b1-u2',
    type: 'multiple-choice',
    question: 'I ___ my keys. I cannot find them anywhere!',
    correctAnswer: "have lost",
    options: ['lost', 'have lost', 'was losing', 'had lost'],
    explanation: 'La pérdida tiene consecuencia en el presente (no los encuentro ahora) → Present Perfect.',
  },
  {
    id: 'ex-b1-u2-4',
    unitId: 'b1-u2',
    type: 'multiple-choice',
    question: 'When ___ you ___ that news?',
    correctAnswer: 'did ... hear',
    options: ['did ... hear', 'have ... heard', 'do ... hear', 'had ... heard'],
    explanation: '"When" pregunta por un momento específico pasado → Past Simple.',
  },
  {
    id: 'ex-b1-u2-5',
    unitId: 'b1-u2',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'He went to London two years ago.',
    scrambledWords: ['years', 'He', 'two', 'London', 'ago.', 'went', 'to'],
    explanation: '"Ago" indica un tiempo específico pasado → Past Simple.',
  },
  {
    id: 'ex-b1-u2-6',
    unitId: 'b1-u2',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'Have you read any good books this month?',
    scrambledWords: ['good', 'Have', 'month?', 'read', 'any', 'this', 'books', 'you'],
    explanation: '"This month" es un período no terminado → Present Perfect.',
  },

  // ===== Unit 3: Present Perfect Continuous =====
  {
    id: 'ex-b1-u3-1',
    unitId: 'b1-u3',
    type: 'fill-blank',
    question: 'I ___ (study) for this exam all week.',
    correctAnswer: 'have been studying',
    explanation: 'Actividad que empezó en el pasado y continúa ahora → Present Perfect Continuous: have been + verbo-ing.',
  },
  {
    id: 'ex-b1-u3-2',
    unitId: 'b1-u3',
    type: 'fill-blank',
    question: 'She ___ (work) at that company since 2019.',
    correctAnswer: 'has been working',
    explanation: '"Since 2019" indica el punto de inicio de una actividad continua → Present Perfect Continuous con "has".',
  },
  {
    id: 'ex-b1-u3-3',
    unitId: 'b1-u3',
    type: 'multiple-choice',
    question: 'He looks exhausted. He ___ all day.',
    correctAnswer: 'has been running',
    options: ['has run', 'has been running', 'ran', 'runs'],
    explanation: 'El resultado visible (cansancio) de una actividad reciente → Present Perfect Continuous.',
  },
  {
    id: 'ex-b1-u3-4',
    unitId: 'b1-u3',
    type: 'multiple-choice',
    question: 'How long ___ you ___ here?',
    correctAnswer: 'have ... been waiting',
    options: ['have ... waited', 'have ... been waiting', 'did ... wait', 'are ... waiting'],
    explanation: '"How long" con situación actual → Present Perfect Continuous: have + been + verbo-ing.',
  },
  {
    id: 'ex-b1-u3-5',
    unitId: 'b1-u3',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: "They've been living here for five years.",
    scrambledWords: ["They've", 'here', 'for', 'five', 'been', 'living', 'years.'],
    explanation: 'Present Perfect Continuous + "for" + período: They\'ve been living here for five years.',
  },
  {
    id: 'ex-b1-u3-6',
    unitId: 'b1-u3',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'Has she been crying again?',
    scrambledWords: ['Has', 'again?', 'been', 'she', 'crying'],
    explanation: 'Pregunta en Present Perfect Continuous: Has + sujeto + been + verbo-ing?',
  },

  // ===== Unit 4: Past Perfect =====
  {
    id: 'ex-b1-u4-1',
    unitId: 'b1-u4',
    type: 'fill-blank',
    question: 'By the time I arrived, the meeting ___ (already / end).',
    correctAnswer: 'had already ended',
    explanation: '"By the time I arrived" indica que la reunión terminó ANTES de mi llegada → Past Perfect: had + participio.',
  },
  {
    id: 'ex-b1-u4-2',
    unitId: 'b1-u4',
    type: 'fill-blank',
    question: 'She felt sick because she ___ (eat) too much.',
    correctAnswer: 'had eaten',
    explanation: 'Comer ocurrió antes de sentirse enferma → Past Perfect para la acción anterior.',
  },
  {
    id: 'ex-b1-u4-3',
    unitId: 'b1-u4',
    type: 'multiple-choice',
    question: 'When we got to the cinema, the film ___.',
    correctAnswer: 'had already started',
    options: ['already started', 'had already started', 'has already started', 'was already starting'],
    explanation: 'La película empezó antes de llegar al cine → Past Perfect para la acción más antigua.',
  },
  {
    id: 'ex-b1-u4-4',
    unitId: 'b1-u4',
    type: 'multiple-choice',
    question: 'He ___ never ___ a horse before that day.',
    correctAnswer: 'had ... ridden',
    options: ['has ... ridden', 'had ... ridden', 'was ... riding', 'did ... ride'],
    explanation: '"Before that day" sitúa la experiencia en un pasado anterior a otro pasado → Past Perfect.',
  },
  {
    id: 'ex-b1-u4-5',
    unitId: 'b1-u4',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'She had already left when I called.',
    scrambledWords: ['when', 'had', 'She', 'I', 'left', 'already', 'called.'],
    explanation: 'Past Perfect: She had already left → ocurrió antes de que yo llamara.',
  },
  {
    id: 'ex-b1-u4-6',
    unitId: 'b1-u4',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: "I realized I had forgotten my passport.",
    scrambledWords: ['my', 'had', 'I', 'passport.', 'I', 'realized', 'forgotten'],
    explanation: 'Olvidar el pasaporte ocurrió antes de darse cuenta → Past Perfect.',
  },

  // ===== Unit 5: Used to + would =====
  {
    id: 'ex-b1-u5-1',
    unitId: 'b1-u5',
    type: 'fill-blank',
    question: 'When I was a child, I ___ (use to) love comic books.',
    correctAnswer: 'used to',
    explanation: '"Used to" expresa un estado o hábito del pasado que ya no existe.',
  },
  {
    id: 'ex-b1-u5-2',
    unitId: 'b1-u5',
    type: 'fill-blank',
    question: '___ you use to play video games when you were young?',
    correctAnswer: 'Did',
    explanation: 'En preguntas, se usa "Did + sujeto + use to" (sin "d" final en "use"). El auxiliar "Did" hace el trabajo.',
  },
  {
    id: 'ex-b1-u5-3',
    unitId: 'b1-u5',
    type: 'multiple-choice',
    question: 'Every summer, we ___ go camping in the mountains.',
    correctAnswer: 'would',
    options: ['used to', 'would', 'both are correct'],
    explanation: 'Para acciones repetidas del pasado (no estados), tanto "used to" como "would" son correctos. "Would" es también válido aquí.',
  },
  {
    id: 'ex-b1-u5-4',
    unitId: 'b1-u5',
    type: 'multiple-choice',
    question: 'He ___ a beard, but he shaved it off last year.',
    correctAnswer: 'used to have',
    options: ['would have', 'used to have', 'had used to have', 'was having'],
    explanation: '"Have a beard" es un estado (no una acción), por lo que solo se puede usar "used to", no "would".',
  },
  {
    id: 'ex-b1-u5-5',
    unitId: 'b1-u5',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'She used to live in the countryside.',
    scrambledWords: ['in', 'used', 'the', 'She', 'live', 'to', 'countryside.'],
    explanation: '"Used to" + verbo base para estados o hábitos pasados.',
  },
  {
    id: 'ex-b1-u5-6',
    unitId: 'b1-u5',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'My father would read us stories every night.',
    scrambledWords: ['every', 'stories', 'My', 'would', 'night.', 'us', 'read', 'father'],
    explanation: '"Would" para acciones repetidas del pasado. Correcto con verbos de acción como "read".',
  },

  // ===== Unit 6: Passive voice =====
  {
    id: 'ex-b1-u6-1',
    unitId: 'b1-u6',
    type: 'fill-blank',
    question: 'English ___ (speak) all over the world.',
    correctAnswer: 'is spoken',
    explanation: 'Presente pasivo: is/are + participio. Con "English" (singular) → "is spoken".',
  },
  {
    id: 'ex-b1-u6-2',
    unitId: 'b1-u6',
    type: 'fill-blank',
    question: 'The pyramids ___ (build) thousands of years ago.',
    correctAnswer: 'were built',
    explanation: 'Pasado pasivo: was/were + participio. "Thousands of years ago" indica pasado; "pyramids" (plural) → "were built".',
  },
  {
    id: 'ex-b1-u6-3',
    unitId: 'b1-u6',
    type: 'multiple-choice',
    question: 'A new hospital ___ in our city last year.',
    correctAnswer: 'was built',
    options: ['was built', 'is built', 'built', 'has built'],
    explanation: '"Last year" indica tiempo pasado específico → pasado pasivo: was built.',
  },
  {
    id: 'ex-b1-u6-4',
    unitId: 'b1-u6',
    type: 'multiple-choice',
    question: 'This type of car ___ in Germany.',
    correctAnswer: 'is made',
    options: ['makes', 'is made', 'was made', 'made'],
    explanation: 'Hecho general presente → presente pasivo: is/are + participio.',
  },
  {
    id: 'ex-b1-u6-5',
    unitId: 'b1-u6',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'The letter was written by my grandfather.',
    scrambledWords: ['was', 'The', 'grandfather.', 'written', 'my', 'letter', 'by'],
    explanation: 'Pasado pasivo: was + participio + by + agente.',
  },
  {
    id: 'ex-b1-u6-6',
    unitId: 'b1-u6',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'These products are sold in over fifty countries.',
    scrambledWords: ['in', 'over', 'products', 'countries.', 'These', 'are', 'fifty', 'sold'],
    explanation: 'Presente pasivo plural: are + participio.',
  },

  // ===== Unit 7: Second conditional =====
  {
    id: 'ex-b1-u7-1',
    unitId: 'b1-u7',
    type: 'fill-blank',
    question: 'If I ___ (have) more free time, I would learn to play the guitar.',
    correctAnswer: 'had',
    explanation: 'Segunda condicional: If + pasado simple → would. No tengo más tiempo libre (situación hipotética).',
  },
  {
    id: 'ex-b1-u7-2',
    unitId: 'b1-u7',
    type: 'fill-blank',
    question: 'She would travel more if she ___ (not be) afraid of flying.',
    correctAnswer: "weren't",
    explanation: 'Segunda condicional negativa. En inglés formal, "were" para todos los sujetos: weren\'t.',
  },
  {
    id: 'ex-b1-u7-3',
    unitId: 'b1-u7',
    type: 'multiple-choice',
    question: 'What ___ you do if you ___ the lottery?',
    correctAnswer: 'would ... won',
    options: ['will ... win', 'would ... won', 'would ... win', 'will ... won'],
    explanation: 'Segunda condicional: would + verbo base en la pregunta y pasado simple en la condición con "if".',
  },
  {
    id: 'ex-b1-u7-4',
    unitId: 'b1-u7',
    type: 'multiple-choice',
    question: 'If I ___ you, I would talk to her directly.',
    correctAnswer: 'were',
    options: ['am', 'was', 'were', 'be'],
    explanation: '"If I were you" es la expresión estándar de segunda condicional. "Were" se usa para todos los sujetos en inglés formal.',
  },
  {
    id: 'ex-b1-u7-5',
    unitId: 'b1-u7',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'If I were rich, I would buy a big house.',
    scrambledWords: ['I', 'a', 'If', 'buy', 'big', 'rich,', 'would', 'I', 'house.', 'were'],
    explanation: 'Segunda condicional: If + were (sujeto) + adjetivo, sujeto + would + verbo base.',
  },
  {
    id: 'ex-b1-u7-6',
    unitId: 'b1-u7',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'She would feel better if she exercised more.',
    scrambledWords: ['if', 'feel', 'exercised', 'She', 'would', 'more.', 'better', 'she'],
    explanation: 'Segunda condicional: would + verbo base ... if + pasado simple.',
  },

  // ===== Unit 8: Reported speech =====
  {
    id: 'ex-b1-u8-1',
    unitId: 'b1-u8',
    type: 'fill-blank',
    question: '"I am tired," she said. → She said that she ___ tired.',
    correctAnswer: 'was',
    explanation: 'Retroceso de tiempos: "am/is" → "was" en estilo indirecto.',
  },
  {
    id: 'ex-b1-u8-2',
    unitId: 'b1-u8',
    type: 'fill-blank',
    question: '"I will help you," he said. → He said that he ___ help me.',
    correctAnswer: 'would',
    explanation: '"Will" retrocede a "would" en estilo indirecto.',
  },
  {
    id: 'ex-b1-u8-3',
    unitId: 'b1-u8',
    type: 'multiple-choice',
    question: '"We have finished the project," they said. → They said that they ___ the project.',
    correctAnswer: 'had finished',
    options: ['have finished', 'had finished', 'finished', 'were finishing'],
    explanation: 'Present Perfect (have finished) retrocede a Past Perfect (had finished) en estilo indirecto.',
  },
  {
    id: 'ex-b1-u8-4',
    unitId: 'b1-u8',
    type: 'multiple-choice',
    question: '"I can swim very well," Ana told us. → Ana told us that she ___ swim very well.',
    correctAnswer: 'could',
    options: ['can', 'could', 'would', 'should'],
    explanation: '"Can" retrocede a "could" en estilo indirecto.',
  },
  {
    id: 'ex-b1-u8-5',
    unitId: 'b1-u8',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'He told me that he was leaving the next day.',
    scrambledWords: ['the', 'told', 'He', 'that', 'leaving', 'next', 'me', 'was', 'day.', 'he'],
    explanation: '"Told + objeto + that": retroceso de "is leaving" → "was leaving"; "tomorrow" → "the next day".',
  },
  {
    id: 'ex-b1-u8-6',
    unitId: 'b1-u8',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'She asked if I had seen her keys.',
    scrambledWords: ['had', 'if', 'keys.', 'asked', 'I', 'she', 'seen', 'She', 'her'],
    explanation: 'Pregunta indirecta con "if": orden normal sujeto + verbo. "Have you seen" → "if I had seen".',
  },

  // ===== Unit 9: Relative clauses =====
  {
    id: 'ex-b1-u9-1',
    unitId: 'b1-u9',
    type: 'fill-blank',
    question: 'The man ___ helped me was very kind.',
    correctAnswer: 'who',
    explanation: '"Who" se usa para personas cuando el pronombre es sujeto de la cláusula relativa.',
  },
  {
    id: 'ex-b1-u9-2',
    unitId: 'b1-u9',
    type: 'fill-blank',
    question: 'This is the restaurant ___ we had our first date.',
    correctAnswer: 'where',
    explanation: '"Where" se usa para lugares en cláusulas relativas.',
  },
  {
    id: 'ex-b1-u9-3',
    unitId: 'b1-u9',
    type: 'multiple-choice',
    question: 'Do you know the girl ___ brother plays for the national team?',
    correctAnswer: 'whose',
    options: ['who', 'which', 'whose', 'that'],
    explanation: '"Whose" expresa posesión: el hermano de la chica. "The girl whose brother..."',
  },
  {
    id: 'ex-b1-u9-4',
    unitId: 'b1-u9',
    type: 'multiple-choice',
    question: "That's the film ___ won three Oscar awards.",
    correctAnswer: 'that',
    options: ['who', 'which', 'that', 'both which and that are correct'],
    explanation: '"That" y "which" se pueden usar para cosas. "Both which and that are correct" también es una respuesta válida aquí, pero "that" es más común en cláusulas definitorias.',
  },
  {
    id: 'ex-b1-u9-5',
    unitId: 'b1-u9',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'The book that I read last week was fantastic.',
    scrambledWords: ['read', 'I', 'book', 'fantastic.', 'The', 'was', 'week', 'last', 'that'],
    explanation: 'Cláusula relativa con "that" como objeto: The book that I read (yo leí el libro).',
  },
  {
    id: 'ex-b1-u9-6',
    unitId: 'b1-u9',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'She works for a company which makes electric cars.',
    scrambledWords: ['makes', 'She', 'a', 'electric', 'works', 'which', 'cars.', 'for', 'company'],
    explanation: '"Which" para cosas (the company). La cláusula relativa da información esencial.',
  },

  // ===== Unit 10: Gerunds vs infinitives =====
  {
    id: 'ex-b1-u10-1',
    unitId: 'b1-u10',
    type: 'fill-blank',
    question: 'I enjoy ___ (cook) for my family on weekends.',
    correctAnswer: 'cooking',
    explanation: '"Enjoy" siempre va seguido de gerundio (-ing): enjoy cooking.',
  },
  {
    id: 'ex-b1-u10-2',
    unitId: 'b1-u10',
    type: 'fill-blank',
    question: 'She decided ___ (apply) for the job.',
    correctAnswer: 'to apply',
    explanation: '"Decide" va seguido de infinitivo (to + verbo base): decided to apply.',
  },
  {
    id: 'ex-b1-u10-3',
    unitId: 'b1-u10',
    type: 'multiple-choice',
    question: 'He stopped ___ when the phone rang.',
    correctAnswer: 'working',
    options: ['working', 'to work', 'work'],
    explanation: '"Stopped working" = dejó de trabajar (gerundio). "Stopped to work" significaría "paró para trabajar", cambiaría el sentido.',
  },
  {
    id: 'ex-b1-u10-4',
    unitId: 'b1-u10',
    type: 'multiple-choice',
    question: "Don't forget ___ the lights before you leave.",
    correctAnswer: 'to turn off',
    options: ['turning off', 'to turn off', 'turn off'],
    explanation: '"Forget + infinitivo" = olvidar hacer algo (tarea pendiente). "Forget + gerundio" = no recordar haber hecho algo.',
  },
  {
    id: 'ex-b1-u10-5',
    unitId: 'b1-u10',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'I am interested in learning a new language.',
    scrambledWords: ['I', 'a', 'am', 'language.', 'learning', 'in', 'new', 'interested'],
    explanation: 'Después de preposición ("in") siempre va gerundio: interested in learning.',
  },
  {
    id: 'ex-b1-u10-6',
    unitId: 'b1-u10',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'She managed to finish the project on time.',
    scrambledWords: ['the', 'finish', 'She', 'on', 'to', 'managed', 'project', 'time.'],
    explanation: '"Manage" va seguido de infinitivo: managed to finish.',
  },

  // ===== Unit 11: Modals + too/enough =====
  {
    id: 'ex-b1-u11-1',
    unitId: 'b1-u11',
    type: 'fill-blank',
    question: 'Look at those clouds. It ___ rain later.',
    correctAnswer: 'might',
    explanation: '"Might" expresa posibilidad incierta en el futuro. No estoy seguro de que llueva.',
  },
  {
    id: 'ex-b1-u11-2',
    unitId: 'b1-u11',
    type: 'fill-blank',
    question: "This coffee is ___ hot for me to drink.",
    correctAnswer: 'too',
    explanation: '"Too" expresa exceso negativo: tan caliente que no puedo beberlo.',
  },
  {
    id: 'ex-b1-u11-3',
    unitId: 'b1-u11',
    type: 'multiple-choice',
    question: "She isn't ___ to drive a car.",
    correctAnswer: 'old enough',
    options: ['enough old', 'old enough', 'too old', 'enough age'],
    explanation: 'Con adjetivos, "enough" va DESPUÉS: old enough. "Enough" después del adjetivo.',
  },
  {
    id: 'ex-b1-u11-4',
    unitId: 'b1-u11',
    type: 'multiple-choice',
    question: 'I am not sure where he is. He ___ be at the gym.',
    correctAnswer: 'could',
    options: ['must', 'could', "can't", 'would'],
    explanation: '"Could" para posibilidad o deducción incierta: quizás esté en el gimnasio.',
  },
  {
    id: 'ex-b1-u11-5',
    unitId: 'b1-u11',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: 'The bag is too heavy for me to carry.',
    scrambledWords: ['me', 'for', 'carry.', 'is', 'heavy', 'to', 'too', 'The', 'bag'],
    explanation: '"Too + adjetivo + for + sujeto + to + infinitivo" expresa exceso que impide la acción.',
  },
  {
    id: 'ex-b1-u11-6',
    unitId: 'b1-u11',
    type: 'word-order',
    question: 'Ordena las palabras para formar una oración correcta:',
    correctAnswer: "We don't have enough money to go on holiday.",
    scrambledWords: ["don't", 'on', 'holiday.', 'enough', 'have', 'We', 'money', 'go', 'to'],
    explanation: '"Enough + sustantivo": enough money. "Not enough" expresa insuficiencia.',
  },
];
