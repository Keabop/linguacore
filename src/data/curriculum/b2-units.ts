import type { Unit, GrammarCard } from '../../lib/db';

export const b2Units: Unit[] = [
  {
    id: 'b2-u1',
    level: 'B2',
    unitNumber: 1,
    title: 'What If Things Had Been Different?',
    grammarTopic: 'Third conditional (if + past perfect → would have)',
    theme: 'Regrets, alternate outcomes',
    isAssessment: false,
  },
  {
    id: 'b2-u2',
    level: 'B2',
    unitNumber: 2,
    title: 'Mixing Past and Present Worlds',
    grammarTopic: 'Mixed conditionals',
    theme: 'Complex hypotheticals',
    isAssessment: false,
  },
  {
    id: 'b2-u3',
    level: 'B2',
    unitNumber: 3,
    title: 'I Wish I Could...',
    grammarTopic: 'Wish / if only (present + past)',
    theme: 'Desires, regrets',
    isAssessment: false,
  },
  {
    id: 'b2-u4',
    level: 'B2',
    unitNumber: 4,
    title: 'In Their Own Words',
    grammarTopic: 'Reported speech (advanced: questions, requests, time shifts)',
    theme: 'Interviews, summarizing',
    isAssessment: false,
  },
  {
    id: 'b2-u5',
    level: 'B2',
    unitNumber: 5,
    title: 'Behind the Scenes',
    grammarTopic: 'Passive voice (complex: modals + perfect)',
    theme: 'Academic writing, formal',
    isAssessment: false,
  },
  {
    id: 'b2-u6',
    level: 'B2',
    unitNumber: 6,
    title: 'Getting Things Done',
    grammarTopic: 'Causative (have/get something done)',
    theme: 'Services, delegation',
    isAssessment: false,
  },
  {
    id: 'b2-u7',
    level: 'B2',
    unitNumber: 7,
    title: 'The Art of Adding Detail',
    grammarTopic: 'Relative clauses (non-defining, reduced)',
    theme: 'Formal writing, detail',
    isAssessment: false,
  },
  {
    id: 'b2-u8',
    level: 'B2',
    unitNumber: 8,
    title: 'Painting with Words',
    grammarTopic: 'Participle clauses (-ing/-ed as modifiers)',
    theme: 'Narrative, descriptions',
    isAssessment: false,
  },
  {
    id: 'b2-u9',
    level: 'B2',
    unitNumber: 9,
    title: 'By This Time Tomorrow',
    grammarTopic: 'Future Perfect + Future Continuous',
    theme: 'Plans, predictions',
    isAssessment: false,
  },
  {
    id: 'b2-u10',
    level: 'B2',
    unitNumber: 10,
    title: 'Speaking Like a Native',
    grammarTopic: 'Phrasal verbs (advanced patterns)',
    theme: 'Natural speech, idioms',
    isAssessment: false,
  },
  {
    id: 'b2-u11',
    level: 'B2',
    unitNumber: 11,
    title: 'Making Every Word Count',
    grammarTopic: 'Inversion + cleft sentences (emphasis)',
    theme: 'Formal, persuasive',
    isAssessment: false,
  },
  {
    id: 'b2-u12',
    level: 'B2',
    unitNumber: 12,
    title: 'Once Upon a Complex Time',
    grammarTopic: 'Narrative tenses (all tenses in storytelling)',
    theme: 'Complex stories',
    isAssessment: false,
  },
  {
    id: 'b2-u13',
    level: 'B2',
    unitNumber: 13,
    title: 'Building Bridges Between Ideas',
    grammarTopic: 'Connectors + discourse markers (cohesion)',
    theme: 'Essays, argumentation',
    isAssessment: false,
  },
  {
    id: 'b2-u14',
    level: 'B2',
    unitNumber: 14,
    title: 'B2 Level Assessment',
    grammarTopic: 'All B2 grammar',
    theme: 'Comprehensive review',
    isAssessment: true,
  },
];

export const b2GrammarCards: GrammarCard[] = [
  // ===== Unit 1: Third Conditional =====
  {
    id: 'gc-b2-u1',
    unitId: 'b2-u1',
    title: 'Tercer Condicional (Third Conditional)',
    explanation: `<h3>Formación</h3>
<p><strong>If + past perfect, would have + participio pasado</strong></p>
<ul>
<li><strong>If I had studied</strong>, I <strong>would have passed</strong> the exam.</li>
<li>También se puede invertir el orden: <strong>I would have passed</strong> the exam <strong>if I had studied</strong>. (sin coma)</li>
</ul>
<h3>¿Cuándo se usa?</h3>
<p>El tercer condicional habla de <strong>situaciones hipotéticas en el pasado</strong> — cosas que NO ocurrieron. Expresamos cómo habría sido diferente el resultado si la condición hubiera sido distinta.</p>
<ul>
<li>La situación es <strong>irreal</strong>: no pasó y ya no puede cambiar.</li>
<li>Se usa para hablar de <strong>arrepentimientos</strong>, <strong>reflexiones</strong> y <strong>resultados alternativos</strong>.</li>
</ul>
<h3>Estructura completa</h3>
<ul>
<li><strong>Afirmativo:</strong> If + had + participio, would have + participio</li>
<li><strong>Negativo (condición):</strong> If + hadn't + participio, would have + participio</li>
<li><strong>Negativo (resultado):</strong> If + had + participio, wouldn't have + participio</li>
<li><strong>Pregunta:</strong> Would you have + participio + if + had + participio?</li>
</ul>
<h3>Variaciones con otros modales</h3>
<ul>
<li><strong>could have</strong> (podría haber): If I had known, I could have helped.</li>
<li><strong>might have</strong> (quizá habría): If we had left earlier, we might have arrived on time.</li>
</ul>
<h3>Contracciones</h3>
<p>I'd (= I had / I would) — El contexto aclara cuál es: "If I'd known" (had) vs "I'd have gone" (would). En habla rápida: "I'd've gone" (informal).</p>`,
    examples: [
      'If I had known about the party, I would have gone. → Si hubiera sabido de la fiesta, habría ido.',
      'She wouldn\'t have missed the flight if she had left earlier. → Ella no habría perdido el vuelo si hubiera salido antes.',
      'If they had invested in that company, they could have become millionaires. → Si hubieran invertido en esa empresa, podrían haberse vuelto millonarios.',
      'Would you have accepted the job if they had offered more money? → ¿Habrías aceptado el trabajo si te hubieran ofrecido más dinero?',
    ],
    rules: [
      'El tercer condicional SOLO habla de pasados irreales: cosas que no ocurrieron',
      'La cláusula "if" usa Past Perfect (had + participio); el resultado usa would have + participio',
      'Puedes sustituir "would" por "could" o "might" para matizar posibilidad',
      'No confundas "I\'d" (had) en la cláusula "if" con "I\'d" (would) en el resultado',
    ],
  },

  // ===== Unit 2: Mixed Conditionals =====
  {
    id: 'gc-b2-u2',
    unitId: 'b2-u2',
    title: 'Condicionales Mixtos (Mixed Conditionals)',
    explanation: `<h3>¿Qué son los condicionales mixtos?</h3>
<p>Los condicionales mixtos combinan <strong>diferentes tiempos</strong> en la cláusula "if" y en el resultado. Se mezclan el segundo y tercer condicional cuando la condición y el resultado pertenecen a <strong>tiempos distintos</strong>.</p>
<h3>Tipo 1: Pasado irreal → Presente irreal</h3>
<p><strong>If + past perfect, would + infinitivo</strong></p>
<p>Una acción pasada que no ocurrió afecta una situación presente:</p>
<ul>
<li>"If I had studied medicine, I <strong>would be</strong> a doctor now." (no estudié → no soy doctor ahora)</li>
<li>"If she hadn't moved to Spain, she <strong>wouldn't speak</strong> Spanish." (se mudó → ahora habla español)</li>
</ul>
<h3>Tipo 2: Presente irreal → Pasado irreal</h3>
<p><strong>If + past simple, would have + participio</strong></p>
<p>Una condición permanente o general del presente habría cambiado un resultado pasado:</p>
<ul>
<li>"If I weren't afraid of heights, I <strong>would have gone</strong> skydiving." (tengo miedo → por eso no fui)</li>
<li>"If he spoke French, he <strong>would have gotten</strong> the job in Paris." (no habla francés → no consiguió el trabajo)</li>
</ul>
<h3>Cómo distinguirlos de los condicionales puros</h3>
<ul>
<li><strong>Segundo condicional puro:</strong> If + past simple, would + infinitivo → ambos hablan del presente/futuro hipotético</li>
<li><strong>Tercer condicional puro:</strong> If + past perfect, would have + participio → ambos hablan del pasado hipotético</li>
<li><strong>Mixto:</strong> los tiempos se cruzan entre pasado y presente</li>
</ul>
<h3>Pista clave</h3>
<p>Busca palabras como <strong>"now"</strong>, <strong>"today"</strong> o <strong>"at this moment"</strong> en la oración. Si el resultado incluye una referencia al presente pero la condición es del pasado (o viceversa), es un condicional mixto.</p>`,
    examples: [
      'If I had taken that job, I would be living in London now. → Si hubiera aceptado ese trabajo, estaría viviendo en Londres ahora.',
      'If she weren\'t so shy, she would have spoken at the conference. → Si ella no fuera tan tímida, habría hablado en la conferencia.',
      'If we had saved more money, we wouldn\'t be in debt today. → Si hubiéramos ahorrado más dinero, no estaríamos endeudados hoy.',
      'If he were more organized, he would have finished the project on time. → Si él fuera más organizado, habría terminado el proyecto a tiempo.',
    ],
    rules: [
      'Tipo 1 (pasado → presente): If + past perfect, would + infinitivo (sin "have")',
      'Tipo 2 (presente → pasado): If + past simple, would have + participio',
      'Las palabras "now", "today" o "at this moment" ayudan a identificar el condicional mixto',
      'No mezcles más de dos tiempos: la cláusula if tiene un tiempo y el resultado otro',
    ],
  },

  // ===== Unit 3: Wish / If Only =====
  {
    id: 'gc-b2-u3',
    unitId: 'b2-u3',
    title: 'Wish / If Only (Deseos y arrepentimientos)',
    explanation: `<h3>Estructura general</h3>
<p><strong>Wish</strong> e <strong>if only</strong> se usan para expresar deseos sobre situaciones que no son reales. "If only" es más enfático que "wish".</p>
<h3>Wish / If only + Past Simple → Deseos sobre el PRESENTE</h3>
<p>Para hablar de algo que <strong>quisieras que fuera diferente ahora</strong>:</p>
<ul>
<li>"I wish I <strong>had</strong> more free time." (no tengo suficiente tiempo libre ahora)</li>
<li>"If only I <strong>spoke</strong> Japanese." (no hablo japonés pero quisiera)</li>
<li>Con "to be" se prefiere <strong>were</strong> para todos los sujetos: "I wish I <strong>were</strong> taller."</li>
</ul>
<h3>Wish / If only + Past Perfect → Arrepentimientos sobre el PASADO</h3>
<p>Para hablar de algo que <strong>quisieras que hubiera sido diferente</strong>:</p>
<ul>
<li>"I wish I <strong>had studied</strong> harder." (no estudié lo suficiente y me arrepiento)</li>
<li>"If only we <strong>hadn't sold</strong> the house." (vendimos la casa y nos arrepentimos)</li>
</ul>
<h3>Wish / If only + would → Quejas y deseos de cambio</h3>
<p>Para expresar <strong>frustración o queja</strong> sobre algo que alguien hace (o no hace):</p>
<ul>
<li>"I wish you <strong>would stop</strong> making noise." (me molesta y quiero que pare)</li>
<li>"If only it <strong>would stop</strong> raining." (frustración con el clima)</li>
</ul>
<p><strong>Importante:</strong> NO se usa "wish + would" con el sujeto "I": "I wish I would..." es incorrecto. En su lugar usa "I wish I could...".</p>
<h3>Wish vs Hope</h3>
<ul>
<li><strong>Wish</strong> → situaciones irreales o improbables: "I wish I could fly."</li>
<li><strong>Hope</strong> → situaciones posibles: "I hope I pass the exam."</li>
</ul>`,
    examples: [
      'I wish I had more time to travel. → Desearía tener más tiempo para viajar.',
      'If only I had listened to your advice. → Ojalá hubiera escuchado tu consejo.',
      'She wishes she could speak five languages. → Ella desearía poder hablar cinco idiomas.',
      'I wish you wouldn\'t leave your clothes on the floor. → Desearía que no dejaras tu ropa en el suelo.',
    ],
    rules: [
      'Wish + past simple = deseo sobre el presente (situación irreal ahora)',
      'Wish + past perfect = arrepentimiento sobre el pasado (algo que no ocurrió)',
      'Wish + would = queja o deseo de cambio en el comportamiento de otra persona',
      'No uses "wish + would" con el mismo sujeto: "I wish I would..." es incorrecto; usa "I wish I could..."',
    ],
  },

  // ===== Unit 4: Reported Speech (Advanced) =====
  {
    id: 'gc-b2-u4',
    unitId: 'b2-u4',
    title: 'Estilo Indirecto Avanzado (Reported Speech)',
    explanation: `<h3>Repaso: cambio de tiempos (backshift)</h3>
<p>Cuando el verbo introductorio está en pasado (said, told, asked), los tiempos retroceden:</p>
<ul>
<li>Present Simple → Past Simple: "I work" → He said he <strong>worked</strong></li>
<li>Present Continuous → Past Continuous: "I'm working" → He said he <strong>was working</strong></li>
<li>Past Simple → Past Perfect: "I worked" → He said he <strong>had worked</strong></li>
<li>Present Perfect → Past Perfect: "I have worked" → He said he <strong>had worked</strong></li>
<li>Will → Would: "I will go" → He said he <strong>would go</strong></li>
<li>Can → Could: "I can do it" → He said he <strong>could do it</strong></li>
</ul>
<h3>Reportar preguntas</h3>
<ul>
<li><strong>Yes/No questions:</strong> Se usa <strong>if / whether</strong> + orden de afirmación (sin inversión): "Are you happy?" → She asked me <strong>if I was happy</strong>.</li>
<li><strong>Wh- questions:</strong> Se mantiene la palabra interrogativa + orden afirmativo: "Where do you live?" → He asked me <strong>where I lived</strong>.</li>
<li><strong>Importante:</strong> No se usa signo de interrogación en el estilo indirecto.</li>
</ul>
<h3>Reportar órdenes y peticiones</h3>
<ul>
<li><strong>Órdenes:</strong> told + persona + <strong>to + infinitivo</strong>: "Sit down!" → She told me <strong>to sit down</strong>.</li>
<li><strong>Peticiones:</strong> asked + persona + <strong>to + infinitivo</strong>: "Could you help me?" → He asked me <strong>to help him</strong>.</li>
<li><strong>Negativo:</strong> told/asked + persona + <strong>not to + infinitivo</strong>: "Don't touch it!" → She told me <strong>not to touch it</strong>.</li>
</ul>
<h3>Cambios de referencias temporales y de lugar</h3>
<ul>
<li>today → that day, tonight → that night</li>
<li>yesterday → the day before / the previous day</li>
<li>tomorrow → the next day / the following day</li>
<li>this → that, these → those, here → there</li>
<li>now → then / at that moment, ago → before / earlier</li>
</ul>
<h3>Verbos de reporte avanzados</h3>
<p>En nivel B2, amplía tu repertorio más allá de "said" y "told":</p>
<ul>
<li><strong>suggest</strong> + -ing / that + should: He suggested going out. / He suggested that we should leave.</li>
<li><strong>warn</strong> + not to: She warned me not to walk alone at night.</li>
<li><strong>promise</strong> + to: He promised to call me.</li>
<li><strong>deny</strong> + -ing: She denied stealing the money.</li>
<li><strong>admit</strong> + -ing: He admitted being late.</li>
<li><strong>recommend</strong> + -ing / that: She recommended visiting the museum.</li>
</ul>`,
    examples: [
      'She asked me where I had been the night before. → Ella me preguntó dónde había estado la noche anterior.',
      'He told us not to make any noise during the exam. → Él nos dijo que no hiciéramos ruido durante el examen.',
      'The doctor recommended that I should rest for a week. → El doctor recomendó que descansara por una semana.',
      'She denied having taken the documents from the office. → Ella negó haber tomado los documentos de la oficina.',
    ],
    rules: [
      'En preguntas indirectas el orden es afirmativo: "She asked if I was..." (no "if was I")',
      'Órdenes y peticiones usan "told/asked + persona + to + infinitivo"',
      'Los marcadores de tiempo cambian: today → that day, yesterday → the day before',
      'Usa verbos de reporte variados (suggest, warn, deny, admit) para un inglés más natural',
    ],
  },

  // ===== Unit 5: Passive Voice (Complex) =====
  {
    id: 'gc-b2-u5',
    unitId: 'b2-u5',
    title: 'Voz Pasiva Compleja (Modales + Perfecta)',
    explanation: `<h3>Repaso de la voz pasiva básica</h3>
<p><strong>Sujeto + be + participio pasado</strong> — El foco está en la acción o en quien la recibe, no en quien la realiza.</p>
<h3>Pasiva con verbos modales</h3>
<p><strong>Modal + be + participio pasado</strong></p>
<ul>
<li><strong>can/could:</strong> This problem <strong>can be solved</strong>. / The work <strong>could be finished</strong> by Friday.</li>
<li><strong>must:</strong> The report <strong>must be submitted</strong> before Monday.</li>
<li><strong>should:</strong> Children <strong>should be protected</strong> from violence.</li>
<li><strong>may/might:</strong> The event <strong>might be cancelled</strong> due to weather.</li>
<li><strong>will:</strong> The results <strong>will be announced</strong> tomorrow.</li>
</ul>
<h3>Pasiva con tiempos perfectos</h3>
<p><strong>have/has/had + been + participio pasado</strong></p>
<ul>
<li><strong>Present Perfect Passive:</strong> The bridge <strong>has been repaired</strong>. (Se ha reparado el puente)</li>
<li><strong>Past Perfect Passive:</strong> The letter <strong>had been sent</strong> before I arrived. (La carta ya había sido enviada)</li>
<li><strong>Future Perfect Passive:</strong> The project <strong>will have been completed</strong> by December.</li>
</ul>
<h3>Pasiva con modales perfectos</h3>
<p><strong>Modal + have been + participio pasado</strong></p>
<ul>
<li><strong>should have been:</strong> The email <strong>should have been sent</strong> yesterday. (deberían haberlo enviado)</li>
<li><strong>could have been:</strong> Many lives <strong>could have been saved</strong>. (podrían haberse salvado)</li>
<li><strong>must have been:</strong> The window <strong>must have been broken</strong> during the storm. (debe haber sido roto)</li>
<li><strong>might have been:</strong> The message <strong>might have been deleted</strong>. (podría haber sido eliminado)</li>
</ul>
<h3>Pasiva impersonal (para opiniones y reportes)</h3>
<p>Muy usada en escritura académica y noticias:</p>
<ul>
<li><strong>It is said that...</strong> (Se dice que...): It is said that the company will close.</li>
<li><strong>It is believed/thought/known/reported that...</strong></li>
<li><strong>Sujeto + is said to + infinitivo:</strong> He <strong>is said to be</strong> the best surgeon in the country.</li>
<li><strong>Sujeto + is believed to have + participio:</strong> She <strong>is believed to have left</strong> the country.</li>
</ul>`,
    examples: [
      'The new policy must be approved by the board before it can be implemented. → La nueva política debe ser aprobada por la junta antes de poder implementarse.',
      'The documents should have been reviewed more carefully. → Los documentos deberían haber sido revisados con más cuidado.',
      'It is widely believed that the economy will recover next year. → Se cree ampliamente que la economía se recuperará el próximo año.',
      'The suspect is thought to have fled the country. → Se cree que el sospechoso ha huido del país.',
    ],
    rules: [
      'Pasiva con modal: modal + be + participio (can be done, must be finished)',
      'Pasiva con perfecto: have/has/had + been + participio (has been repaired)',
      'Pasiva con modal perfecto: modal + have been + participio (should have been sent)',
      'La pasiva impersonal (It is said that... / He is said to...) es clave en escritura formal',
    ],
  },

  // ===== Unit 6: Causative =====
  {
    id: 'gc-b2-u6',
    unitId: 'b2-u6',
    title: 'Estructura Causativa (Have/Get Something Done)',
    explanation: `<h3>¿Qué es la estructura causativa?</h3>
<p>Usamos la causativa cuando <strong>otra persona hace algo por nosotros</strong>, generalmente un servicio profesional. No hacemos la acción nosotros mismos, sino que alguien la hace en nuestro nombre.</p>
<h3>Have something done</h3>
<p><strong>have + objeto + participio pasado</strong></p>
<ul>
<li>"I <strong>had my hair cut</strong> yesterday." (alguien me cortó el pelo — un peluquero)</li>
<li>"We <strong>have the house cleaned</strong> every week." (alguien lo limpia por nosotros)</li>
<li>Negativo: "I <strong>didn't have</strong> my car <strong>repaired</strong>."</li>
<li>Pregunta: "<strong>Did you have</strong> your phone <strong>fixed</strong>?"</li>
</ul>
<h3>Conjugación en diferentes tiempos</h3>
<ul>
<li><strong>Presente:</strong> I have my car washed every Saturday.</li>
<li><strong>Pasado:</strong> She had her dress altered last week.</li>
<li><strong>Presente Perfecto:</strong> They have had the roof repaired.</li>
<li><strong>Futuro:</strong> I'm going to have my eyes tested.</li>
<li><strong>Modal:</strong> You should have your teeth checked.</li>
</ul>
<h3>Get something done</h3>
<p><strong>get + objeto + participio pasado</strong> — más informal que "have".</p>
<ul>
<li>"I need to <strong>get my laptop fixed</strong>."</li>
<li>"She <strong>got her nails done</strong> for the wedding."</li>
</ul>
<h3>Have/Get someone do something</h3>
<p>Cuando mencionas <strong>quién</strong> hace la acción:</p>
<ul>
<li><strong>have + persona + infinitivo sin "to":</strong> "I'll <strong>have the plumber check</strong> the pipes."</li>
<li><strong>get + persona + to + infinitivo:</strong> "I'll <strong>get my brother to help</strong> me move."</li>
</ul>
<h3>Significado negativo: experiencias desafortunadas</h3>
<p>La causativa también puede indicar algo malo que te ocurrió:</p>
<ul>
<li>"She <strong>had her wallet stolen</strong> on the subway." (le robaron la cartera — no fue por elección)</li>
<li>"They <strong>got their house broken into</strong> last night."</li>
</ul>`,
    examples: [
      'I had my car serviced at the garage last week. → Hice que revisaran mi coche en el taller la semana pasada.',
      'She needs to get her passport renewed before the trip. → Ella necesita renovar su pasaporte antes del viaje.',
      'We\'re going to have the kitchen remodeled next month. → Vamos a hacer que remodelen la cocina el próximo mes.',
      'He had his phone screen cracked during the concert. → Se le rompió la pantalla del teléfono durante el concierto.',
    ],
    rules: [
      'Have/get + objeto + participio pasado = alguien hace algo por ti (servicio)',
      'Have + persona + infinitivo (sin "to") / Get + persona + to + infinitivo = pedir que alguien haga algo',
      '"Get something done" es más informal que "have something done"',
      'La misma estructura puede indicar experiencias negativas involuntarias: "had my wallet stolen"',
    ],
  },

  // ===== Unit 7: Relative Clauses (Non-defining, Reduced) =====
  {
    id: 'gc-b2-u7',
    unitId: 'b2-u7',
    title: 'Cláusulas Relativas (No-definitorias y Reducidas)',
    explanation: `<h3>Repaso: cláusulas relativas definitorias vs. no-definitorias</h3>
<ul>
<li><strong>Definitorias</strong> (sin comas): identifican de quién/qué hablamos. "The man <strong>who called you</strong> is my boss." (¿cuál hombre? El que te llamó)</li>
<li><strong>No-definitorias</strong> (con comas): añaden información extra. "My boss, <strong>who is very strict</strong>, called a meeting." (ya sabemos quién es; la información es adicional)</li>
</ul>
<h3>Reglas de las cláusulas no-definitorias</h3>
<ul>
<li>Van <strong>entre comas</strong> (o con coma y punto final si están al final).</li>
<li><strong>No se puede usar "that"</strong> — solo who, which, whose, where, when.</li>
<li><strong>No se puede omitir</strong> el pronombre relativo.</li>
<li>Se pueden eliminar sin perder el significado esencial de la oración.</li>
</ul>
<h3>Pronombres relativos en no-definitorias</h3>
<ul>
<li><strong>who</strong> — personas: "My sister, who lives in Berlin, is a doctor."</li>
<li><strong>which</strong> — cosas/ideas: "His new book, which was published in May, became a bestseller."</li>
<li><strong>whose</strong> — posesión: "The director, whose latest film won an award, gave a speech."</li>
<li><strong>where</strong> — lugar: "Tokyo, where the Olympics were held, is an amazing city."</li>
<li><strong>when</strong> — tiempo: "In 2020, when the pandemic started, everything changed."</li>
</ul>
<h3>"Which" para referirse a toda una idea</h3>
<p>"He passed all his exams, <strong>which surprised everyone</strong>." — "which" se refiere al hecho completo de pasar los exámenes.</p>
<h3>Cláusulas relativas reducidas (participiales)</h3>
<p>Se puede acortar una cláusula relativa eliminando el pronombre y el verbo auxiliar:</p>
<ul>
<li><strong>Con -ing (activa):</strong> "The woman <strong>who is standing</strong> there..." → "The woman <strong>standing</strong> there..."</li>
<li><strong>Con -ed/participio (pasiva):</strong> "The report <strong>which was written</strong> by the team..." → "The report <strong>written</strong> by the team..."</li>
<li><strong>Con to + infinitivo:</strong> "He was the first person <strong>who arrived</strong>." → "He was the first person <strong>to arrive</strong>."</li>
</ul>`,
    examples: [
      'The Mona Lisa, which is displayed in the Louvre, attracts millions of visitors. → La Mona Lisa, que se exhibe en el Louvre, atrae a millones de visitantes.',
      'She passed the exam on her first try, which made her parents very proud. → Aprobó el examen en su primer intento, lo cual hizo que sus padres se sintieran muy orgullosos.',
      'The students chosen for the scholarship must maintain a high GPA. → Los estudiantes elegidos para la beca deben mantener un promedio alto.',
      'Anyone wishing to apply should submit their documents before Friday. → Cualquier persona que desee aplicar debe enviar sus documentos antes del viernes.',
    ],
    rules: [
      'Las cláusulas no-definitorias van entre comas y NO permiten "that"',
      '"Which" puede referirse a toda una idea anterior, no solo a un sustantivo',
      'Se puede reducir una relativa eliminando el pronombre + be: "who is running" → "running"',
      'En cláusulas reducidas pasivas se usa el participio solo: "written by..." en vez de "which was written by..."',
    ],
  },

  // ===== Unit 8: Participle Clauses =====
  {
    id: 'gc-b2-u8',
    unitId: 'b2-u8',
    title: 'Cláusulas de Participio (-ing / -ed como modificadores)',
    explanation: `<h3>¿Qué son las cláusulas de participio?</h3>
<p>Son frases que usan un <strong>participio presente (-ing)</strong> o <strong>participio pasado (-ed/irregular)</strong> para reemplazar una cláusula completa. Hacen el texto más compacto y fluido, especialmente en escritura formal y narrativa.</p>
<h3>Participio presente (-ing) → Acciones activas</h3>
<p>El sujeto de la cláusula de participio debe ser el mismo que el de la oración principal:</p>
<ul>
<li><strong>Acciones simultáneas:</strong> "<strong>Walking</strong> through the park, I noticed a strange bird." (= While I was walking...)</li>
<li><strong>Causa/razón:</strong> "<strong>Feeling tired</strong>, she went to bed early." (= Because she felt tired...)</li>
<li><strong>Resultado:</strong> "The storm hit the coast, <strong>causing</strong> widespread damage." (= and it caused...)</li>
</ul>
<h3>Participio pasado (-ed/irregular) → Acciones pasivas</h3>
<ul>
<li><strong>Razón pasiva:</strong> "<strong>Exhausted</strong> from the journey, they fell asleep immediately." (= Because they were exhausted...)</li>
<li><strong>Descripción:</strong> "<strong>Built</strong> in the 15th century, the castle is a major tourist attraction." (= It was built...)</li>
<li><strong>Condición:</strong> "<strong>Given more time</strong>, I could have done a better job." (= If I had been given...)</li>
</ul>
<h3>Having + participio pasado → Acción anterior completada</h3>
<p>Para enfatizar que una acción se completó <strong>antes</strong> que la otra:</p>
<ul>
<li>"<strong>Having finished</strong> her homework, she went out to play." (= After she had finished...)</li>
<li>"<strong>Having been warned</strong> about the traffic, we left early." (= After we had been warned...)</li>
</ul>
<h3>Errores comunes: "dangling participle"</h3>
<p>El sujeto del participio DEBE ser el sujeto de la oración principal:</p>
<ul>
<li><strong>Incorrecto:</strong> "Walking to school, <strong>the rain started</strong>." (¿la lluvia caminaba?)</li>
<li><strong>Correcto:</strong> "Walking to school, <strong>I got caught</strong> in the rain."</li>
</ul>`,
    examples: [
      'Not knowing what to say, he remained silent. → Sin saber qué decir, permaneció en silencio.',
      'Surrounded by mountains, the village looked like a painting. → Rodeado de montañas, el pueblo parecía una pintura.',
      'Having lived abroad for years, she understood different cultures. → Habiendo vivido en el extranjero por años, ella entendía diferentes culturas.',
      'The children ran out of the school, laughing and shouting. → Los niños salieron corriendo de la escuela, riendo y gritando.',
    ],
    rules: [
      'El sujeto del participio debe ser el mismo que el sujeto de la oración principal',
      'Participio -ing = acción activa o simultánea; participio -ed = acción pasiva',
      '"Having + participio" indica que la acción se completó antes que la principal',
      'Evita el "dangling participle": verifica que el sujeto sea lógico para el participio',
    ],
  },

  // ===== Unit 9: Future Perfect + Future Continuous =====
  {
    id: 'gc-b2-u9',
    unitId: 'b2-u9',
    title: 'Futuro Perfecto y Futuro Continuo',
    explanation: `<h3>Future Continuous (Futuro Continuo)</h3>
<p><strong>will be + verbo-ing</strong></p>
<ul>
<li><strong>Acción en progreso en un momento futuro:</strong> "At 8 PM tomorrow, I <strong>will be studying</strong> for my exam." (estaré estudiando)</li>
<li><strong>Planes o arreglos futuros (tono más neutro/cortés):</strong> "I <strong>will be seeing</strong> John at the meeting." (voy a ver a John)</li>
<li><strong>Preguntas corteses sobre planes:</strong> "Will you <strong>be using</strong> the car tonight?" (es más suave que "Will you use...")</li>
</ul>
<h3>Future Perfect (Futuro Perfecto)</h3>
<p><strong>will have + participio pasado</strong></p>
<ul>
<li><strong>Acción completada antes de un momento futuro:</strong> "By next Friday, I <strong>will have finished</strong> the report." (lo habré terminado)</li>
<li><strong>Duración hasta un punto futuro:</strong> "By 2027, she <strong>will have worked</strong> here for ten years."</li>
<li>Negativo: "They <strong>won't have arrived</strong> by noon."</li>
<li>Pregunta: "<strong>Will you have completed</strong> the project by then?"</li>
</ul>
<h3>Future Perfect Continuous</h3>
<p><strong>will have been + verbo-ing</strong></p>
<p>Enfatiza la <strong>duración</strong> de una actividad que continuará hasta un punto futuro:</p>
<ul>
<li>"By December, I <strong>will have been living</strong> here for five years." (enfoque en la duración)</li>
<li>"Next month, they <strong>will have been working</strong> on this project for a year."</li>
</ul>
<h3>Expresiones temporales clave</h3>
<ul>
<li><strong>by</strong> (para): by tomorrow, by next week, by 2030, by the time...</li>
<li><strong>by the time + present simple:</strong> "By the time you arrive, I will have left."</li>
<li><strong>this time tomorrow/next week:</strong> "This time next month, I'll be traveling."</li>
<li><strong>in + período:</strong> "In three years, she will have graduated."</li>
</ul>
<h3>Diferencia clave: Future Continuous vs Future Perfect</h3>
<ul>
<li><strong>Continuous</strong> → acción EN PROGRESO en un momento futuro: "At 6 PM, I'll be cooking."</li>
<li><strong>Perfect</strong> → acción COMPLETADA antes de un momento futuro: "By 6 PM, I'll have cooked dinner."</li>
</ul>`,
    examples: [
      'This time next week, I\'ll be lying on a beach in Cancún. → A esta hora la próxima semana, estaré acostado en una playa en Cancún.',
      'By the end of the year, we will have saved enough money for a house. → Para fin de año, habremos ahorrado suficiente dinero para una casa.',
      'Will you be attending the conference on Thursday? → ¿Asistirás a la conferencia el jueves?',
      'By 2030, scientists will have been researching this disease for over 20 years. → Para 2030, los científicos habrán estado investigando esta enfermedad por más de 20 años.',
    ],
    rules: [
      'Future Continuous (will be + -ing): acción en progreso en un momento futuro',
      'Future Perfect (will have + participio): acción completada antes de un momento futuro',
      'Future Perfect Continuous (will have been + -ing): duración de una actividad hasta un punto futuro',
      '"By", "by the time" y "this time next..." son las expresiones clave para estos tiempos',
    ],
  },

  // ===== Unit 10: Phrasal Verbs (Advanced) =====
  {
    id: 'gc-b2-u10',
    unitId: 'b2-u10',
    title: 'Phrasal Verbs Avanzados (Patrones y uso natural)',
    explanation: `<h3>¿Por qué son importantes los phrasal verbs?</h3>
<p>Los phrasal verbs son esenciales para sonar natural en inglés. En nivel B2, necesitas dominar patrones más complejos y distinguir significados según el contexto.</p>
<h3>Tipos de phrasal verbs</h3>
<ul>
<li><strong>Intransitivos</strong> (sin objeto): "The plane <strong>took off</strong>." / "She <strong>broke down</strong> crying."</li>
<li><strong>Transitivos separables</strong> (el objeto puede ir en medio): "Turn <strong>the music</strong> down." = "Turn down <strong>the music</strong>." Pero con pronombres SIEMPRE en medio: "Turn <strong>it</strong> down." (NO: "Turn down it.")</li>
<li><strong>Transitivos inseparables</strong> (el objeto va después): "I'm looking <strong>after the children</strong>." (NO: "looking the children after")</li>
<li><strong>De tres palabras</strong> (siempre inseparables): "I <strong>look forward to</strong> the trip." / "We've <strong>run out of</strong> milk."</li>
</ul>
<h3>Phrasal verbs con múltiples significados</h3>
<ul>
<li><strong>take off</strong> → 1) despegar (avión), 2) quitarse (ropa), 3) tener éxito repentino: "Her career really took off."</li>
<li><strong>pick up</strong> → 1) recoger algo del suelo, 2) aprender informalmente: "I picked up some Spanish in Mexico.", 3) recoger a alguien: "I'll pick you up at 7."</li>
<li><strong>come across</strong> → 1) encontrar por casualidad: "I came across an old photo.", 2) dar una impresión: "She comes across as confident."</li>
<li><strong>bring up</strong> → 1) criar (niños): "She was brought up in the countryside.", 2) mencionar un tema: "Don't bring up politics at dinner."</li>
<li><strong>work out</strong> → 1) hacer ejercicio, 2) resolver: "I can't work out this puzzle.", 3) resultar bien: "Everything worked out in the end."</li>
</ul>
<h3>Phrasal verbs formales vs. equivalentes de una palabra</h3>
<ul>
<li>put off → postpone (posponer)</li>
<li>find out → discover (descubrir)</li>
<li>carry out → conduct/perform (llevar a cabo)</li>
<li>look into → investigate (investigar)</li>
<li>set up → establish (establecer)</li>
<li>turn down → reject (rechazar)</li>
<li>come up with → devise/propose (idear)</li>
<li>put up with → tolerate (tolerar)</li>
</ul>
<h3>Consejo para aprenderlos</h3>
<p>No intentes memorizar listas largas. Aprende los phrasal verbs <strong>en contexto</strong>, con oraciones completas, y agrúpalos por tema o por la partícula (up, down, out, off).</p>`,
    examples: [
      'I came across an interesting article while browsing the internet. → Me encontré con un artículo interesante mientras navegaba por internet.',
      'The manager turned down my request for a raise. → El gerente rechazó mi solicitud de aumento.',
      'We need to come up with a solution before the deadline. → Necesitamos idear una solución antes de la fecha límite.',
      'I can\'t put up with his constant complaints anymore. → Ya no puedo soportar sus quejas constantes.',
    ],
    rules: [
      'Con pronombres, los phrasal verbs separables SIEMPRE llevan el pronombre en medio: "turn it down" (no "turn down it")',
      'Los phrasal verbs de tres palabras son siempre inseparables: "look forward to", "run out of"',
      'Muchos phrasal verbs tienen múltiples significados según el contexto',
      'En escritura formal, prefiere el equivalente de una palabra: "postpone" en vez de "put off"',
    ],
  },

  // ===== Unit 11: Inversion + Cleft Sentences =====
  {
    id: 'gc-b2-u11',
    unitId: 'b2-u11',
    title: 'Inversión y Oraciones Hendidas (Cleft Sentences)',
    explanation: `<h3>Inversión: ¿Qué es?</h3>
<p>La inversión consiste en poner el <strong>verbo auxiliar antes del sujeto</strong> (como en preguntas) en oraciones afirmativas. Se usa para dar <strong>énfasis</strong> o en lenguaje <strong>formal/literario</strong>.</p>
<h3>Inversión con expresiones negativas al inicio</h3>
<p>Cuando una expresión negativa o restrictiva va al principio, se invierte el sujeto y el auxiliar:</p>
<ul>
<li><strong>Never have I</strong> seen such a beautiful sunset. (Nunca he visto...)</li>
<li><strong>Rarely does she</strong> complain about anything. (Rara vez se queja...)</li>
<li><strong>Not only did he</strong> pass, but he got the highest score. (No solo aprobó...)</li>
<li><strong>Hardly had we</strong> arrived when it started raining. (Apenas habíamos llegado...)</li>
<li><strong>Under no circumstances should you</strong> reveal this information. (Bajo ninguna circunstancia...)</li>
<li><strong>No sooner had she</strong> left than the phone rang. (Tan pronto como se fue...)</li>
<li><strong>Little did they</strong> know what was about to happen. (Poco sabían...)</li>
</ul>
<h3>Otras inversiones comunes</h3>
<ul>
<li><strong>So/Such... that:</strong> "So impressed <strong>was the jury</strong> that they awarded first prize." / "Such was the damage that..."</li>
<li><strong>Only + expresión temporal:</strong> "Only after the meeting <strong>did I realize</strong> my mistake."</li>
<li><strong>Not until:</strong> "Not until she spoke <strong>did I recognize</strong> her."</li>
</ul>
<h3>Oraciones hendidas (Cleft Sentences)</h3>
<p>Se usan para dar <strong>énfasis a una parte específica</strong> de la oración.</p>
<h3>It-cleft: It is/was + elemento enfatizado + that/who</h3>
<ul>
<li>Normal: "John broke the window." → Énfasis en quién: "<strong>It was John who</strong> broke the window."</li>
<li>Normal: "I lost my keys at the park." → Énfasis en dónde: "<strong>It was at the park that</strong> I lost my keys."</li>
</ul>
<h3>What-cleft: What + sujeto + verbo + is/was + elemento enfatizado</h3>
<ul>
<li>"I need a vacation." → "<strong>What I need is</strong> a vacation." (Lo que necesito es...)</li>
<li>"She loves his sense of humor." → "<strong>What she loves is</strong> his sense of humor."</li>
<li>"They did was cancel the event." → "<strong>What they did was</strong> cancel the event."</li>
</ul>
<h3>All-cleft</h3>
<ul>
<li>"<strong>All I want is</strong> some peace and quiet." (Todo lo que quiero es...)</li>
<li>"<strong>All you need to do is</strong> sign here." (Lo único que necesitas hacer es...)</li>
</ul>`,
    examples: [
      'Never have I experienced such a difficult exam. → Nunca he experimentado un examen tan difícil.',
      'Not only did she win the competition, but she also broke the record. → No solo ganó la competencia, sino que también rompió el récord.',
      'It was his attitude that bothered me, not his words. → Fue su actitud lo que me molestó, no sus palabras.',
      'What we need is a completely new approach to the problem. → Lo que necesitamos es un enfoque completamente nuevo del problema.',
    ],
    rules: [
      'Expresiones negativas al inicio requieren inversión: "Never have I...", "Rarely does she..."',
      'It-cleft enfatiza quién, qué, dónde o cuándo: "It was John who..."',
      'What-cleft enfatiza la acción o idea: "What I need is..."',
      'La inversión es formal/literaria — en conversación normal no se usa tanto',
    ],
  },

  // ===== Unit 12: Narrative Tenses =====
  {
    id: 'gc-b2-u12',
    unitId: 'b2-u12',
    title: 'Tiempos Narrativos (Storytelling)',
    explanation: `<h3>¿Qué son los tiempos narrativos?</h3>
<p>Al contar historias en inglés, usamos una combinación de tiempos verbales para crear <strong>profundidad temporal</strong>: establecer la escena, narrar los eventos principales, dar contexto y mostrar resultados.</p>
<h3>Past Simple → Eventos principales de la historia</h3>
<p>Las acciones que hacen avanzar la trama:</p>
<ul>
<li>"She <strong>opened</strong> the door and <strong>walked</strong> into the room."</li>
<li>"He <strong>picked up</strong> the phone and <strong>called</strong> for help."</li>
</ul>
<h3>Past Continuous → Contexto, escena de fondo, acciones en progreso</h3>
<p>Describe lo que estaba ocurriendo cuando algo importante pasó:</p>
<ul>
<li>"The sun <strong>was setting</strong> and birds <strong>were singing</strong> when suddenly..."</li>
<li>"While she <strong>was walking</strong> home, she <strong>heard</strong> a strange noise."</li>
</ul>
<h3>Past Perfect → Eventos anteriores al momento de la narración</h3>
<p>Para explicar lo que ya había ocurrido antes del evento principal:</p>
<ul>
<li>"She realized she <strong>had left</strong> her keys at the office."</li>
<li>"By the time I arrived, everyone <strong>had already gone</strong>."</li>
</ul>
<h3>Past Perfect Continuous → Duración de la acción anterior</h3>
<p>Para enfatizar cuánto tiempo llevaba ocurriendo algo antes del evento principal:</p>
<ul>
<li>"He was exhausted because he <strong>had been running</strong> for hours."</li>
<li>"Her eyes were red — she <strong>had been crying</strong>."</li>
</ul>
<h3>Cómo combinarlos en una narrativa</h3>
<p>Un buen párrafo narrativo mezcla estos tiempos de forma natural:</p>
<p>"It <strong>was</strong> a cold December evening. Snow <strong>had been falling</strong> all day, and the streets <strong>were</strong> empty. Maria <strong>was walking</strong> home from work when she <strong>noticed</strong> a small package on her doorstep. Someone <strong>had left</strong> it there while she <strong>had been</strong> at the office. She <strong>picked</strong> it up and <strong>went</strong> inside."</p>
<h3>Expresiones útiles para narrativas</h3>
<ul>
<li><strong>Secuencia:</strong> then, after that, next, eventually, finally, in the end</li>
<li><strong>Simultaneidad:</strong> while, as, meanwhile, at that moment</li>
<li><strong>Anterioridad:</strong> before, by the time, already, previously</li>
<li><strong>Sorpresa:</strong> suddenly, all of a sudden, unexpectedly, to my surprise</li>
<li><strong>Contraste:</strong> however, although, despite, but then</li>
</ul>`,
    examples: [
      'She had been waiting for over an hour when he finally arrived. → Ella había estado esperando por más de una hora cuando él finalmente llegó.',
      'While I was reading, I heard a loud crash outside — someone had driven into a lamppost. → Mientras leía, escuché un fuerte estruendo afuera — alguien había chocado contra un poste de luz.',
      'By the time the police arrived, the thief had already escaped. → Para cuando llegó la policía, el ladrón ya había escapado.',
      'It was raining heavily. We had been driving for hours and everyone was exhausted. → Estaba lloviendo fuerte. Habíamos estado conduciendo por horas y todos estaban agotados.',
    ],
    rules: [
      'Past Simple para los eventos principales que hacen avanzar la historia',
      'Past Continuous para el contexto, la escena de fondo y acciones en progreso',
      'Past Perfect para eventos que ocurrieron antes del momento narrativo',
      'Combina los cuatro tiempos para crear narrativas con profundidad temporal',
    ],
  },

  // ===== Unit 13: Connectors + Discourse Markers =====
  {
    id: 'gc-b2-u13',
    unitId: 'b2-u13',
    title: 'Conectores y Marcadores Discursivos (Cohesión)',
    explanation: `<h3>¿Por qué son importantes?</h3>
<p>Los conectores y marcadores discursivos son las herramientas que dan <strong>fluidez y coherencia</strong> a tus textos y discursos. En nivel B2, necesitas usarlos para construir argumentos sólidos, contrastar ideas y guiar al lector/oyente.</p>
<h3>Conectores de adición</h3>
<ul>
<li><strong>Furthermore / Moreover / In addition</strong> — formales, para añadir argumentos: "The project is over budget. Furthermore, it's behind schedule."</li>
<li><strong>Besides / What's more</strong> — menos formales: "It's too expensive. Besides, we don't need it."</li>
<li><strong>Not only... but also</strong> — para dar énfasis: "Not only is it cheap, but it's also high quality."</li>
</ul>
<h3>Conectores de contraste</h3>
<ul>
<li><strong>However / Nevertheless / Nonetheless</strong> — contradicen lo anterior: "The weather was terrible. However, we had a great time."</li>
<li><strong>Although / Even though / Despite / In spite of</strong> — concesión: "Although it rained, we went out." / "Despite the rain, we went out."</li>
<li><strong>On the other hand / In contrast / Whereas / While</strong> — comparar dos ideas: "Some agree; on the other hand, others disagree."</li>
</ul>
<h3>Conectores de causa y efecto</h3>
<ul>
<li><strong>Therefore / Consequently / As a result / Thus</strong> — resultado: "He didn't study. Therefore, he failed."</li>
<li><strong>Due to / Owing to / Because of</strong> + sustantivo: "Due to the storm, the flight was cancelled."</li>
<li><strong>Since / As</strong> + cláusula: "Since you're here, let's start."</li>
</ul>
<h3>Conectores de propósito</h3>
<ul>
<li><strong>In order to / So as to</strong> + infinitivo: "She studied hard in order to pass."</li>
<li><strong>So that</strong> + cláusula: "He left early so that he wouldn't miss the train."</li>
</ul>
<h3>Marcadores discursivos para organizar el texto</h3>
<ul>
<li><strong>Introducir:</strong> First of all, To begin with, Firstly</li>
<li><strong>Secuencia:</strong> Secondly, Then, Next, After that, Subsequently</li>
<li><strong>Ejemplificar:</strong> For example, For instance, Such as, In particular</li>
<li><strong>Concluir:</strong> In conclusion, To sum up, All in all, On the whole</li>
<li><strong>Opinión:</strong> In my opinion, As far as I'm concerned, I believe that</li>
<li><strong>Reformular:</strong> In other words, That is to say, What I mean is</li>
</ul>
<h3>Puntuación con conectores</h3>
<ul>
<li><strong>However, Therefore, Moreover</strong> → van con punto y coma o punto antes, y coma después: "It was late; however, we continued."</li>
<li><strong>Although, Despite, Because</strong> → van dentro de la oración sin punto y coma.</li>
</ul>`,
    examples: [
      'Although the experiment failed, the researchers gained valuable insights. → Aunque el experimento falló, los investigadores obtuvieron información valiosa.',
      'The company is expanding rapidly. Consequently, they are hiring over 200 new employees. → La empresa se está expandiendo rápidamente. En consecuencia, están contratando más de 200 nuevos empleados.',
      'In spite of having little experience, she managed to impress the interviewers. → A pesar de tener poca experiencia, logró impresionar a los entrevistadores.',
      'The plan has several advantages; nevertheless, there are some risks we should consider. → El plan tiene varias ventajas; sin embargo, hay algunos riesgos que deberíamos considerar.',
    ],
    rules: [
      '"However", "Therefore" y "Moreover" van con punto y coma antes y coma después en mitad de oración',
      '"Although" y "Despite" se usan diferente: Although + cláusula vs. Despite + sustantivo/-ing',
      'Varía tus conectores: no uses siempre "but" y "because" — prueba con "nevertheless", "due to", "as a result"',
      'Los marcadores de discurso (firstly, in conclusion, for instance) organizan y dan estructura a tus textos',
    ],
  },
];
