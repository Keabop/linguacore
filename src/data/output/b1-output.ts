import type { WritingPrompt, SpeakingPrompt } from '../../lib/db';

// ===== B1 Writing Prompts =====
// Units b1-u1 to b1-u11 (b1-u12 is assessment, no output prompts)
// 2 prompts per unit: mix of paragraph-completion, free-writing, error-correction, sentence-construction

export const b1WritingPrompts: WritingPrompt[] = [
  // ===== Unit 1: Present Perfect Simple (experience + unfinished time) =====
  {
    id: 'wp-b1-u1-1',
    unitId: 'b1-u1',
    type: 'paragraph-completion',
    level: 'B1',
    instruction: 'Completa el siguiente párrafo usando el Present Perfect Simple. Usa los verbos entre paréntesis en la forma correcta.',
    sourceText: 'My name is Laura and I love travelling. I ______ (visit) five countries so far. I ______ (be) to Japan, Italy, Brazil, Canada, and Egypt. I ______ (not travel) to Australia yet, but it is on my list. My best friend ______ (come) with me on three of those trips. We ______ (have) amazing experiences together.',
    referenceAnswer: 'My name is Laura and I love travelling. I have visited five countries so far. I have been to Japan, Italy, Brazil, Canada, and Egypt. I have not travelled to Australia yet, but it is on my list. My best friend has come with me on three of those trips. We have had amazing experiences together.',
    targetGrammar: ['have/has + past participle', 'present perfect for experience', 'present perfect with yet/so far'],
  },
  {
    id: 'wp-b1-u1-2',
    unitId: 'b1-u1',
    type: 'free-writing',
    level: 'B1',
    instruction: 'Escribe un párrafo sobre tus experiencias de vida. Menciona al menos 3 cosas que has hecho y 2 cosas que todavía no has hecho pero te gustaría hacer. Usa el Present Perfect Simple.',
    referenceAnswer: 'I have tried many interesting things in my life. I have learned to play the guitar and I have cooked food from different countries. I have also read more than fifty books this year. However, I have never been to Europe and I have not learned to drive yet. I hope I can do these things soon.',
    targetGrammar: ['present perfect for experience', 'have never + past participle', 'have not + past participle + yet'],
    wordLimit: { min: 30, max: 80 },
  },

  // ===== Unit 2: Present Perfect vs Past Simple =====
  {
    id: 'wp-b1-u2-1',
    unitId: 'b1-u2',
    type: 'error-correction',
    level: 'B1',
    instruction: 'El siguiente texto tiene 5 errores en el uso del Present Perfect y Past Simple. Encuentra los errores y reescribe el texto correctamente.',
    errorText: 'I have gone to Paris last summer. It was an amazing trip. I have visited the Eiffel Tower and it was beautiful. Since then, I wanted to go back. My sister already went there three times — she has gone for the first time in 2018. We didn\'t plan our next trip yet.',
    referenceAnswer: 'I went to Paris last summer. It was an amazing trip. I visited the Eiffel Tower and it was beautiful. Since then, I have wanted to go back. My sister has already been there three times — she went for the first time in 2018. We haven\'t planned our next trip yet.',
    targetGrammar: ['past simple with finished time', 'present perfect with since/already/yet', 'present perfect vs past simple contrast'],
  },
  {
    id: 'wp-b1-u2-2',
    unitId: 'b1-u2',
    type: 'free-writing',
    level: 'B1',
    instruction: 'Escribe sobre una noticia reciente que te haya interesado. Explica qué ha pasado recientemente y da detalles sobre lo que ocurrió en un momento específico del pasado. Alterna entre Present Perfect y Past Simple.',
    referenceAnswer: 'Scientists have recently discovered a new species of bird in the Amazon. They found it last month during an expedition. The team has published their findings in a scientific journal. They observed the bird for three weeks before they identified it as a new species. This discovery has attracted a lot of attention from researchers around the world.',
    targetGrammar: ['present perfect for recent events', 'past simple for specific past moments', 'present perfect vs past simple alternation'],
    wordLimit: { min: 30, max: 80 },
  },

  // ===== Unit 3: Present Perfect Continuous =====
  {
    id: 'wp-b1-u3-1',
    unitId: 'b1-u3',
    type: 'paragraph-completion',
    level: 'B1',
    instruction: 'Completa el párrafo usando el Present Perfect Continuous con los verbos entre paréntesis. Presta atención a las expresiones de duración.',
    sourceText: 'Things have been busy lately. My brother ______ (study) for his exams for three weeks now. He looks very tired. My mom ______ (cook) all morning because we have guests tonight. I ______ (try) to help her, but she says I get in the way. Meanwhile, my dad ______ (fix) the car since 10 a.m. We ______ (plan) a family vacation, but we still can\'t agree on a destination.',
    referenceAnswer: 'Things have been busy lately. My brother has been studying for his exams for three weeks now. He looks very tired. My mom has been cooking all morning because we have guests tonight. I have been trying to help her, but she says I get in the way. Meanwhile, my dad has been fixing the car since 10 a.m. We have been planning a family vacation, but we still can\'t agree on a destination.',
    targetGrammar: ['have/has been + -ing', 'present perfect continuous with for/since', 'present perfect continuous for ongoing actions'],
  },
  {
    id: 'wp-b1-u3-2',
    unitId: 'b1-u3',
    type: 'sentence-construction',
    level: 'B1',
    instruction: 'Traduce las siguientes oraciones al inglés usando el Present Perfect Continuous. Presta atención a las expresiones de tiempo.',
    sourceText: '1. He estado aprendiendo inglés durante dos años.\n2. Ella ha estado trabajando en ese proyecto desde enero.\n3. Hemos estado esperando el autobús por media hora.\n4. ¿Cuánto tiempo has estado viviendo aquí?\n5. Ellos no han estado durmiendo bien últimamente.',
    referenceAnswer: '1. I have been learning English for two years.\n2. She has been working on that project since January.\n3. We have been waiting for the bus for half an hour.\n4. How long have you been living here?\n5. They have not been sleeping well lately.',
    targetGrammar: ['have/has been + -ing', 'for + duration', 'since + point in time', 'how long + present perfect continuous'],
  },

  // ===== Unit 4: Past Perfect =====
  {
    id: 'wp-b1-u4-1',
    unitId: 'b1-u4',
    type: 'error-correction',
    level: 'B1',
    instruction: 'Este texto narrativo contiene 5 errores con el Past Perfect y el Past Simple. Identifica los errores y reescribe el texto correctamente.',
    errorText: 'When I arrived at the station, the train already left. I was upset because I have bought the ticket the day before. I called my friend and she told me she has been waiting for an hour. By the time I finally got there, she already ate lunch without me. I felt bad because I have promised to be on time.',
    referenceAnswer: 'When I arrived at the station, the train had already left. I was upset because I had bought the ticket the day before. I called my friend and she told me she had been waiting for an hour. By the time I finally got there, she had already eaten lunch without me. I felt bad because I had promised to be on time.',
    targetGrammar: ['past perfect for earlier past action', 'had + past participle', 'by the time + past perfect'],
  },
  {
    id: 'wp-b1-u4-2',
    unitId: 'b1-u4',
    type: 'free-writing',
    level: 'B1',
    instruction: 'Escribe una historia corta sobre un día en el que todo salió mal. Usa el Past Perfect para mostrar lo que había pasado antes de los eventos principales. Incluye al menos 3 oraciones con Past Perfect.',
    referenceAnswer: 'Last Monday was a terrible day. When I woke up, I realized that I had forgotten to set my alarm. I rushed to get ready, but I discovered that my sister had used all the hot water. When I got to school, the teacher told me that the class had already started an exam. I had not studied because I had thought the exam was next week. By lunchtime, I had already had four pieces of bad luck.',
    targetGrammar: ['past perfect for sequence of events', 'had + past participle before past simple', 'narrative use of past perfect'],
    wordLimit: { min: 30, max: 80 },
  },

  // ===== Unit 5: Used to / Would (past habits) =====
  {
    id: 'wp-b1-u5-1',
    unitId: 'b1-u5',
    type: 'paragraph-completion',
    level: 'B1',
    instruction: 'Completa el párrafo sobre recuerdos de la infancia. Usa "used to" o "would" según corresponda. Recuerda: "would" solo se usa con acciones repetidas, no con estados.',
    sourceText: 'When I was a child, life was very different. I ______ (live) in a small town near the mountains. Every summer, my family ______ (go) camping by the lake. My grandfather ______ (tell) us stories around the campfire. I ______ (be) afraid of the dark, so I ______ (sleep) with a flashlight. My brother and I ______ (play) in the forest every day. I ______ (not like) vegetables, but now I eat them all the time.',
    referenceAnswer: 'When I was a child, life was very different. I used to live in a small town near the mountains. Every summer, my family would go camping by the lake. My grandfather would tell us stories around the campfire. I used to be afraid of the dark, so I would sleep with a flashlight. My brother and I would play in the forest every day. I didn\'t use to like vegetables, but now I eat them all the time.',
    targetGrammar: ['used to + base form for states', 'would + base form for repeated actions', 'didn\'t use to for negative past habits'],
  },
  {
    id: 'wp-b1-u5-2',
    unitId: 'b1-u5',
    type: 'free-writing',
    level: 'B1',
    instruction: 'Escribe sobre cómo era tu vida hace 5 o 10 años y cómo ha cambiado. Usa "used to" para describir estados y hábitos pasados, y "would" para acciones que repetías frecuentemente.',
    referenceAnswer: 'Five years ago, my life was completely different. I used to live with my parents in a different city. I used to be very shy and I didn\'t use to talk much. Every weekend, I would go to the park with my friends. We would play football for hours. I used to love comic books and I would read a new one every week. Now I live alone and I am much more confident.',
    targetGrammar: ['used to for past states', 'would for repeated past actions', 'contrast between past and present'],
    wordLimit: { min: 30, max: 80 },
  },

  // ===== Unit 6: Passive Voice (present + past) =====
  {
    id: 'wp-b1-u6-1',
    unitId: 'b1-u6',
    type: 'sentence-construction',
    level: 'B1',
    instruction: 'Transforma las siguientes oraciones activas a voz pasiva. Mantén el mismo tiempo verbal (presente o pasado).',
    sourceText: '1. Millones de personas hablan el inglés en todo el mundo.\n2. Alexander Fleming descubrió la penicilina en 1928.\n3. Los estudiantes hacen los exámenes cada semestre.\n4. Alguien robó mi bicicleta ayer.\n5. La empresa fabrica estos productos en China.',
    referenceAnswer: '1. English is spoken by millions of people around the world.\n2. Penicillin was discovered by Alexander Fleming in 1928.\n3. Exams are taken by the students every semester.\n4. My bicycle was stolen yesterday.\n5. These products are manufactured in China.',
    targetGrammar: ['is/are + past participle (present passive)', 'was/were + past participle (past passive)', 'by + agent'],
  },
  {
    id: 'wp-b1-u6-2',
    unitId: 'b1-u6',
    type: 'free-writing',
    level: 'B1',
    instruction: 'Describe cómo se hace algo (una comida, un producto, o un proceso que conozcas). Escribe usando la voz pasiva tanto en presente como en pasado. Por ejemplo: cómo se hace el chocolate, cómo se construyó un edificio famoso, etc.',
    referenceAnswer: 'Chocolate is made from cacao beans. First, the beans are collected from cacao trees in tropical countries. Then, they are dried in the sun for several days. After that, the beans are roasted and ground into a paste. Sugar and milk are added to the paste. The mixture is heated and poured into moulds. Finally, the chocolate is packaged and sold in shops. This process was developed hundreds of years ago by the Aztecs.',
    targetGrammar: ['present passive for processes', 'past passive for historical facts', 'passive without agent'],
    wordLimit: { min: 30, max: 80 },
  },

  // ===== Unit 7: Second Conditional =====
  {
    id: 'wp-b1-u7-1',
    unitId: 'b1-u7',
    type: 'error-correction',
    level: 'B1',
    instruction: 'Este texto tiene 5 errores en el uso del Second Conditional. Encuentra los errores y reescribe el texto correctamente.',
    errorText: 'If I will win the lottery, I would buy a big house. I would also travel around the world. If I am rich, I would help many people. My mom says that if she will have more free time, she would learn to paint. If we would live near the beach, we would swim every day. Life would be amazing if everything will be free.',
    referenceAnswer: 'If I won the lottery, I would buy a big house. I would also travel around the world. If I were rich, I would help many people. My mom says that if she had more free time, she would learn to paint. If we lived near the beach, we would swim every day. Life would be amazing if everything were free.',
    targetGrammar: ['if + past simple, would + base form', 'if I were (subjunctive)', 'second conditional for unreal present/future'],
  },
  {
    id: 'wp-b1-u7-2',
    unitId: 'b1-u7',
    type: 'free-writing',
    level: 'B1',
    instruction: 'Imagina que pudieras cambiar tres cosas de tu vida o del mundo. Escribe qué harías y por qué, usando el Second Conditional. Incluye al menos 4 oraciones condicionales.',
    referenceAnswer: 'If I could change the world, I would do several things. First, if everyone had access to clean water, many diseases would disappear. Second, if I were the president, I would invest more money in education. Third, if people used less plastic, the oceans would be cleaner. Finally, if I had more time, I would volunteer at an animal shelter every week.',
    targetGrammar: ['if + past simple, would + base form', 'second conditional for hypothetical situations', 'if I were/could'],
    wordLimit: { min: 30, max: 80 },
  },

  // ===== Unit 8: Reported Speech (basic) =====
  {
    id: 'wp-b1-u8-1',
    unitId: 'b1-u8',
    type: 'sentence-construction',
    level: 'B1',
    instruction: 'Convierte las siguientes oraciones de estilo directo a estilo indirecto (reported speech). Aplica los cambios necesarios en el tiempo verbal.',
    sourceText: '1. "Estoy cansada" — Ella dijo que...\n2. "Iremos al cine mañana" — Ellos dijeron que...\n3. "He terminado mi tarea" — Él me dijo que...\n4. "No me gusta este restaurante" — Ella dijo que...\n5. "Puedo ayudarte con el proyecto" — Mi amigo me dijo que...',
    referenceAnswer: '1. She said that she was tired.\n2. They said that they would go to the cinema the next day.\n3. He told me that he had finished his homework.\n4. She said that she didn\'t like that restaurant.\n5. My friend told me that he could help me with the project.',
    targetGrammar: ['said/told + that clause', 'tense backshift in reported speech', 'pronoun and time changes in reported speech'],
  },
  {
    id: 'wp-b1-u8-2',
    unitId: 'b1-u8',
    type: 'paragraph-completion',
    level: 'B1',
    instruction: 'Lee la conversación original y completa el resumen en estilo indirecto. Aplica los cambios de tiempo verbal necesarios.',
    sourceText: 'Original conversation:\nTom: "I am going to move to London next month."\nSarah: "That\'s exciting! I have always wanted to visit London."\nTom: "You can stay at my place when you visit."\nSarah: "I will definitely come in the summer."\n\nSummary:\nTom told Sarah that he ______ to London the following month. Sarah said that it ______ exciting and that she ______ always ______ to visit London. Tom told her that she ______ at his place when she ______. Sarah replied that she ______ definitely ______ in the summer.',
    referenceAnswer: 'Tom told Sarah that he was going to move to London the following month. Sarah said that it was exciting and that she had always wanted to visit London. Tom told her that she could stay at his place when she visited. Sarah replied that she would definitely come in the summer.',
    targetGrammar: ['reported speech tense backshift', 'time expression changes', 'said vs told usage'],
  },

  // ===== Unit 9: Relative Clauses (who/which/that/where) =====
  {
    id: 'wp-b1-u9-1',
    unitId: 'b1-u9',
    type: 'sentence-construction',
    level: 'B1',
    instruction: 'Combina cada par de oraciones en una sola oración usando un pronombre relativo (who, which, that, where). Traduce al inglés.',
    sourceText: '1. Esta es la profesora. Ella me enseñó matemáticas.\n2. Compré un libro. El libro es muy interesante.\n3. Ese es el restaurante. Cenamos allí la semana pasada.\n4. Conozco a una chica. Su padre es médico.\n5. Vi la película. Tú me recomendaste esa película.',
    referenceAnswer: '1. This is the teacher who taught me mathematics.\n2. I bought a book which/that is very interesting.\n3. That is the restaurant where we had dinner last week.\n4. I know a girl whose father is a doctor.\n5. I saw the film (that/which) you recommended to me.',
    targetGrammar: ['who for people', 'which/that for things', 'where for places', 'whose for possession'],
  },
  {
    id: 'wp-b1-u9-2',
    unitId: 'b1-u9',
    type: 'free-writing',
    level: 'B1',
    instruction: 'Describe a 3 personas importantes en tu vida y un lugar que sea especial para ti. Usa cláusulas relativas con who, which, that, y where en cada descripción.',
    referenceAnswer: 'My mother is the person who has always supported me in everything. She is someone that I can always count on. My best friend, who I have known since primary school, is the person that makes me laugh the most. My English teacher is someone who inspired me to learn languages. The park where I go every weekend is a place that helps me relax. It is a beautiful space which is full of trees and flowers.',
    targetGrammar: ['defining relative clauses', 'who/which/that/where in context', 'relative clauses for descriptions'],
    wordLimit: { min: 30, max: 80 },
  },

  // ===== Unit 10: Gerunds vs Infinitives =====
  {
    id: 'wp-b1-u10-1',
    unitId: 'b1-u10',
    type: 'error-correction',
    level: 'B1',
    instruction: 'Este texto tiene 6 errores en el uso de gerundios e infinitivos. Encuentra los errores y reescribe el texto correctamente.',
    errorText: 'I really enjoy to play football on weekends. Last year, I decided joining a local team. At first, I avoided to talk to the other players because I was shy. But they encouraged me being more open. Now I look forward to go to practice every week. I don\'t mind to train in the rain, and I hope winning a trophy someday.',
    referenceAnswer: 'I really enjoy playing football on weekends. Last year, I decided to join a local team. At first, I avoided talking to the other players because I was shy. But they encouraged me to be more open. Now I look forward to going to practice every week. I don\'t mind training in the rain, and I hope to win a trophy someday.',
    targetGrammar: ['enjoy/avoid/mind + gerund', 'decide/hope/encourage + infinitive', 'look forward to + gerund'],
  },
  {
    id: 'wp-b1-u10-2',
    unitId: 'b1-u10',
    type: 'free-writing',
    level: 'B1',
    instruction: 'Escribe sobre tus gustos, metas y hábitos. Incluye al menos 3 verbos seguidos de gerundio (enjoy, avoid, mind, keep, suggest...) y 3 verbos seguidos de infinitivo (want, decide, plan, hope, need...).',
    referenceAnswer: 'I enjoy reading novels before going to sleep. I also like cooking new recipes on weekends. I avoid eating too much sugar because I want to stay healthy. I have decided to learn a new language this year. I plan to travel to Canada next summer. I need to save more money, so I keep working extra hours. I don\'t mind waking up early if I have something fun to do.',
    targetGrammar: ['verb + gerund patterns', 'verb + infinitive patterns', 'gerund vs infinitive distinctions'],
    wordLimit: { min: 30, max: 80 },
  },

  // ===== Unit 11: Modal verbs (might/could/would) + too/enough =====
  {
    id: 'wp-b1-u11-1',
    unitId: 'b1-u11',
    type: 'paragraph-completion',
    level: 'B1',
    instruction: 'Completa el párrafo usando los modales might, could, o would y las expresiones too o enough según el contexto.',
    sourceText: 'I\'m thinking about my future career. I ______ become a doctor, but I\'m not sure yet. My parents think I ______ be a good lawyer because I enjoy debating. If I had more time, I ______ study both subjects. The problem is that medicine ______ be ______ difficult for me — I\'m not good ______ at science. On the other hand, I ______ not be old ______ to make this decision yet. I ______ wait a year before choosing.',
    referenceAnswer: 'I\'m thinking about my future career. I might become a doctor, but I\'m not sure yet. My parents think I could be a good lawyer because I enjoy debating. If I had more time, I would study both subjects. The problem is that medicine might be too difficult for me — I\'m not good enough at science. On the other hand, I might not be old enough to make this decision yet. I could wait a year before choosing.',
    targetGrammar: ['might for possibility', 'could for ability/suggestion', 'would for hypothetical', 'too + adjective', 'adjective + enough'],
  },
  {
    id: 'wp-b1-u11-2',
    unitId: 'b1-u11',
    type: 'free-writing',
    level: 'B1',
    instruction: 'Escribe sobre un problema o decisión difícil que tengas actualmente. Especula sobre las posibilidades usando might/could/would y usa too/enough para evaluar las opciones.',
    referenceAnswer: 'I need to decide if I should change jobs. My current job might not be challenging enough for me. I could apply to a bigger company, but I might not have enough experience. The new job could be too stressful, and the office might be too far from my house. If the salary were good enough, I would accept the position. I might talk to my friends about it — they could give me some advice.',
    targetGrammar: ['might/could for speculation', 'would for hypothetical outcomes', 'too/enough for evaluation'],
    wordLimit: { min: 30, max: 80 },
  },
];

// ===== B1 Speaking Prompts =====
// 1 read-aloud + 1 oral-response per unit

export const b1SpeakingPrompts: SpeakingPrompt[] = [
  // ===== Unit 1: Present Perfect Simple =====
  {
    id: 'sp-b1-u1-1',
    unitId: 'b1-u1',
    type: 'read-aloud',
    level: 'B1',
    instruction: 'Lee el siguiente texto en voz alta. Presta atención a la pronunciación de las contracciones del Present Perfect (I\'ve, she\'s, they\'ve).',
    targetText: 'I\'ve visited many countries in my life. My sister has lived in three different cities since she finished university. We\'ve always loved travelling, and we haven\'t stopped exploring new places.',
  },
  {
    id: 'sp-b1-u1-2',
    unitId: 'b1-u1',
    type: 'oral-response',
    level: 'B1',
    instruction: 'Responde en voz alta usando el Present Perfect: ¿Cuáles son tres experiencias interesantes que has tenido en tu vida? Usa expresiones como "I have visited...", "I have tried...", "I have never...".',
    targetGrammar: ['present perfect for life experiences', 'have/has + past participle', 'ever/never/already'],
  },

  // ===== Unit 2: Present Perfect vs Past Simple =====
  {
    id: 'sp-b1-u2-1',
    unitId: 'b1-u2',
    type: 'read-aloud',
    level: 'B1',
    instruction: 'Lee el siguiente texto en voz alta. Nota la diferencia de entonación entre las oraciones en Present Perfect y Past Simple.',
    targetText: 'I have been to London twice. The first time, I went in 2019 and stayed for a week. I visited Buckingham Palace and saw the Thames. Since then, I have wanted to go back every year.',
  },
  {
    id: 'sp-b1-u2-2',
    unitId: 'b1-u2',
    type: 'oral-response',
    level: 'B1',
    instruction: 'Responde en voz alta: Cuéntame sobre un viaje o actividad reciente. Primero di algo general usando Present Perfect (ej: "I have recently visited...") y luego da detalles específicos usando Past Simple (ej: "I went there on...", "I saw...").',
    targetGrammar: ['present perfect for general experience', 'past simple for specific details', 'time expressions'],
  },

  // ===== Unit 3: Present Perfect Continuous =====
  {
    id: 'sp-b1-u3-1',
    unitId: 'b1-u3',
    type: 'read-aloud',
    level: 'B1',
    instruction: 'Lee el texto en voz alta. Practica la pronunciación fluida de "have been" + verbo -ing.',
    targetText: 'I have been studying English for three years now. Recently, I have been watching more films in English to improve my listening. My friend has been helping me with pronunciation, and I have been feeling more confident every day.',
  },
  {
    id: 'sp-b1-u3-2',
    unitId: 'b1-u3',
    type: 'oral-response',
    level: 'B1',
    instruction: 'Responde en voz alta: ¿Qué actividades has estado haciendo últimamente para mejorar tu inglés o para alcanzar alguna meta personal? Usa el Present Perfect Continuous con "for" y "since".',
    targetGrammar: ['have been + -ing', 'for + duration', 'since + point in time', 'recently/lately'],
  },

  // ===== Unit 4: Past Perfect =====
  {
    id: 'sp-b1-u4-1',
    unitId: 'b1-u4',
    type: 'read-aloud',
    level: 'B1',
    instruction: 'Lee el siguiente relato en voz alta. Presta especial atención a la pronunciación de "had" en las formas del Past Perfect.',
    targetText: 'When I arrived at the cinema, the film had already started. I was disappointed because I had been looking forward to it all week. My friends had saved me a seat, but I had missed the first twenty minutes.',
  },
  {
    id: 'sp-b1-u4-2',
    unitId: 'b1-u4',
    type: 'oral-response',
    level: 'B1',
    instruction: 'Responde en voz alta: Cuéntame sobre un momento en que llegaste tarde a algún lugar o evento. ¿Qué había pasado antes de que llegaras? Usa el Past Perfect para describir las acciones anteriores.',
    targetGrammar: ['had + past participle', 'past perfect for earlier events', 'when/by the time + past perfect'],
  },

  // ===== Unit 5: Used to / Would =====
  {
    id: 'sp-b1-u5-1',
    unitId: 'b1-u5',
    type: 'read-aloud',
    level: 'B1',
    instruction: 'Lee el texto en voz alta. Nota la pronunciación natural de "used to" (/juːst tə/) y "would" en contextos de hábitos pasados.',
    targetText: 'When I was a child, I used to believe in fairy tales. I would spend hours reading adventure books. My grandmother used to live next door, and she would bake cookies for us every Sunday afternoon.',
  },
  {
    id: 'sp-b1-u5-2',
    unitId: 'b1-u5',
    type: 'oral-response',
    level: 'B1',
    instruction: 'Responde en voz alta: ¿Cómo era tu vida cuando eras niño/a? Habla sobre al menos 3 hábitos o costumbres que tenías. Usa "used to" para estados y "would" para acciones repetidas.',
    targetGrammar: ['used to + base form', 'would + base form for repeated actions', 'past habits and states'],
  },

  // ===== Unit 6: Passive Voice =====
  {
    id: 'sp-b1-u6-1',
    unitId: 'b1-u6',
    type: 'read-aloud',
    level: 'B1',
    instruction: 'Lee el texto en voz alta. Practica la entonación de las oraciones en voz pasiva, enfatizando el objeto (lo que recibe la acción).',
    targetText: 'The Eiffel Tower was built in 1889 for the World Exhibition. It is visited by millions of tourists every year. The tower is made of iron and was designed by Gustave Eiffel. It was originally criticized by many Parisians.',
  },
  {
    id: 'sp-b1-u6-2',
    unitId: 'b1-u6',
    type: 'oral-response',
    level: 'B1',
    instruction: 'Responde en voz alta: Describe un monumento o edificio famoso usando la voz pasiva. Di cuándo fue construido, por quién fue diseñado, y cómo es utilizado hoy en día.',
    targetGrammar: ['was/were + past participle', 'is/are + past participle', 'by + agent in passive'],
  },

  // ===== Unit 7: Second Conditional =====
  {
    id: 'sp-b1-u7-1',
    unitId: 'b1-u7',
    type: 'read-aloud',
    level: 'B1',
    instruction: 'Lee el texto en voz alta. Practica la entonación ascendente en la cláusula con "if" y descendente en la cláusula con "would".',
    targetText: 'If I had a million dollars, I would travel around the world. If I could live anywhere, I would choose a house by the sea. Life would be so different if we didn\'t have to work every day.',
  },
  {
    id: 'sp-b1-u7-2',
    unitId: 'b1-u7',
    type: 'oral-response',
    level: 'B1',
    instruction: 'Responde en voz alta: Si pudieras tener cualquier superpoder, ¿cuál elegirías y qué harías con él? Usa el Second Conditional (If I could/had..., I would...) para dar al menos 3 ideas.',
    targetGrammar: ['if + past simple, would + base form', 'if I could/had', 'second conditional for imaginary situations'],
  },

  // ===== Unit 8: Reported Speech =====
  {
    id: 'sp-b1-u8-1',
    unitId: 'b1-u8',
    type: 'read-aloud',
    level: 'B1',
    instruction: 'Lee el texto en voz alta. Practica las transiciones naturales entre el narrador y el estilo indirecto.',
    targetText: 'My teacher told me that I had improved a lot this semester. She said that my writing was much better and that I should keep practising. She also mentioned that the exam would be in two weeks.',
  },
  {
    id: 'sp-b1-u8-2',
    unitId: 'b1-u8',
    type: 'oral-response',
    level: 'B1',
    instruction: 'Responde en voz alta: Piensa en una conversación importante que tuviste recientemente. Cuéntame lo que la otra persona dijo, usando reported speech (He/She said that..., He/She told me that...).',
    targetGrammar: ['said/told + that clause', 'tense backshift', 'reported speech for retelling'],
  },

  // ===== Unit 9: Relative Clauses =====
  {
    id: 'sp-b1-u9-1',
    unitId: 'b1-u9',
    type: 'read-aloud',
    level: 'B1',
    instruction: 'Lee el texto en voz alta. Practica la fluidez al leer oraciones largas con cláusulas relativas. No hagas pausas innecesarias dentro de la cláusula relativa.',
    targetText: 'The woman who lives next door is a famous author. She writes novels that have been translated into many languages. The bookshop where I buy her books is the one which is located on the main street.',
  },
  {
    id: 'sp-b1-u9-2',
    unitId: 'b1-u9',
    type: 'oral-response',
    level: 'B1',
    instruction: 'Responde en voz alta: Describe tu barrio o tu ciudad. Menciona personas, lugares y cosas usando cláusulas relativas (the place where..., the people who..., the thing that...).',
    targetGrammar: ['who for people', 'which/that for things', 'where for places', 'defining relative clauses'],
  },

  // ===== Unit 10: Gerunds vs Infinitives =====
  {
    id: 'sp-b1-u10-1',
    unitId: 'b1-u10',
    type: 'read-aloud',
    level: 'B1',
    instruction: 'Lee el texto en voz alta. Nota cómo los gerundios y los infinitivos se usan naturalmente después de diferentes verbos.',
    targetText: 'I really enjoy spending time outdoors. I decided to start running last year, and now I love going to the park every morning. I want to run a marathon someday, but I avoid pushing myself too hard.',
  },
  {
    id: 'sp-b1-u10-2',
    unitId: 'b1-u10',
    type: 'oral-response',
    level: 'B1',
    instruction: 'Responde en voz alta: ¿Qué actividades disfrutas hacer, qué evitas hacer, y qué has decidido empezar a hacer? Usa verbos seguidos de gerundio (enjoy, avoid, keep) e infinitivo (decide, want, plan).',
    targetGrammar: ['verb + gerund', 'verb + infinitive', 'gerund vs infinitive after specific verbs'],
  },

  // ===== Unit 11: Modal verbs + too/enough =====
  {
    id: 'sp-b1-u11-1',
    unitId: 'b1-u11',
    type: 'read-aloud',
    level: 'B1',
    instruction: 'Lee el texto en voz alta. Practica la pronunciación natural de los modales might, could y would, y las expresiones con too y enough.',
    targetText: 'I might go to university next year, but I\'m not sure. I could study abroad, but it might be too expensive. If I saved enough money, I would definitely go. I\'m not old enough to make this decision alone, so my parents could help me choose.',
  },
  {
    id: 'sp-b1-u11-2',
    unitId: 'b1-u11',
    type: 'oral-response',
    level: 'B1',
    instruction: 'Responde en voz alta: Habla sobre tus planes para el futuro y las posibilidades que tienes. ¿Qué podrías hacer? ¿Qué podría pasar? Usa might, could y would, y evalúa opciones con too/enough.',
    targetGrammar: ['might/could for possibility', 'would for hypothetical', 'too + adjective', 'adjective + enough'],
  },
];
