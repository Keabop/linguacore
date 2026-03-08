import type { WritingPrompt, SpeakingPrompt } from '../../lib/db';

// ===== B2 Writing Prompts =====
// Units b2-u1 to b2-u13 (b2-u14 is assessment, no output prompts)
// 2 prompts per unit: heavy on free-writing and paragraph-completion
// Error texts have subtle/complex errors

export const b2WritingPrompts: WritingPrompt[] = [
  // ===== Unit 1: Third Conditional =====
  {
    id: 'wp-b2-u1-1',
    unitId: 'b2-u1',
    type: 'error-correction',
    level: 'B2',
    instruction: 'El siguiente texto contiene 5 errores sutiles en el uso del Third Conditional. Algunos involucran la forma verbal y otros el uso inadecuado del condicional. Encuentra y corrige todos los errores.',
    errorText: 'Looking back, I realize many things could have been different. If I would have studied harder at school, I would have got a scholarship. If my parents hadn\'t moved to the city, I would never meet my best friend. I sometimes think that if I had taken that job in Berlin, my life will have been completely different. If I wouldn\'t have been so afraid, I would have travelled alone. Things would have turned out better if I would have listened to my teacher\'s advice.',
    referenceAnswer: 'Looking back, I realize many things could have been different. If I had studied harder at school, I would have got a scholarship. If my parents hadn\'t moved to the city, I would never have met my best friend. I sometimes think that if I had taken that job in Berlin, my life would have been completely different. If I hadn\'t been so afraid, I would have travelled alone. Things would have turned out better if I had listened to my teacher\'s advice.',
    targetGrammar: ['if + past perfect, would have + past participle', 'no would in if-clause', 'third conditional for unreal past'],
  },
  {
    id: 'wp-b2-u1-2',
    unitId: 'b2-u1',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Reflexiona sobre un momento decisivo en tu vida (o en la historia). Escribe sobre cómo las cosas habrían sido diferentes si algo hubiera (o no hubiera) ocurrido. Usa el Third Conditional en al menos 5 oraciones.',
    referenceAnswer: 'If I had chosen a different university, I would never have discovered my passion for linguistics. I would have studied engineering if my father had had his way, and I probably wouldn\'t have met the people who changed my perspective on life. If I hadn\'t attended that particular lecture in my first year, I wouldn\'t have realized that language was my true calling. My career path would have been completely different if I hadn\'t taken that risk. Looking back, if I had played it safe, I would have missed out on so many opportunities that have shaped who I am today.',
    targetGrammar: ['if + past perfect, would have + past participle', 'third conditional for reflection', 'could have / might have alternatives'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 2: Mixed Conditionals =====
  {
    id: 'wp-b2-u2-1',
    unitId: 'b2-u2',
    type: 'paragraph-completion',
    level: 'B2',
    instruction: 'Completa el siguiente párrafo usando condicionales mixtos. Decide en cada caso si la condición es pasada con resultado presente, o presente con resultado pasado.',
    sourceText: 'My life is full of "what ifs." If I ______ (study) medicine instead of art, I ______ (be) a doctor now. But then again, if I ______ (not be) so creative, I ______ (not choose) art in the first place. If my Spanish ______ (be) better, I ______ (apply) for that job in Madrid last year. And if I ______ (accept) that scholarship in 2020, I ______ (live) in Paris right now. Sometimes I think that if I ______ (be) a more decisive person, I ______ (not miss) so many opportunities in the past.',
    referenceAnswer: 'My life is full of "what ifs." If I had studied medicine instead of art, I would be a doctor now. But then again, if I weren\'t so creative, I wouldn\'t have chosen art in the first place. If my Spanish were better, I would have applied for that job in Madrid last year. And if I had accepted that scholarship in 2020, I would be living in Paris right now. Sometimes I think that if I were a more decisive person, I wouldn\'t have missed so many opportunities in the past.',
    targetGrammar: ['if + past perfect, would + base form (past→present)', 'if + past simple, would have + past participle (present→past)', 'mixed conditional structures'],
  },
  {
    id: 'wp-b2-u2-2',
    unitId: 'b2-u2',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe sobre cómo decisiones pasadas afectan tu presente, y cómo tu personalidad actual habría cambiado decisiones del pasado. Usa al menos 3 condicionales mixtos de ambos tipos (pasado→presente y presente→pasado).',
    referenceAnswer: 'If I had grown up in a bilingual household, I would speak English fluently now instead of still struggling with certain expressions. On the other hand, if I weren\'t such a perfectionist, I probably wouldn\'t have spent so many hours practising last year. If I had travelled more during my twenties, I would be a more open-minded person today. Conversely, if I were less cautious by nature, I would have taken that risky business opportunity when it came up. These mixed reflections show how our past choices and present character are deeply intertwined.',
    targetGrammar: ['mixed conditional past→present', 'mixed conditional present→past', 'if + past perfect, would + base form', 'if + past simple, would have + past participle'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 3: Wish / If only =====
  {
    id: 'wp-b2-u3-1',
    unitId: 'b2-u3',
    type: 'error-correction',
    level: 'B2',
    instruction: 'Este texto tiene 5 errores sutiles en el uso de wish / if only. Los errores incluyen tiempos verbales incorrectos y confusiones entre deseos presentes y pasados. Encuentra y corrige los errores.',
    errorText: 'There are so many things I wish were different. I wish I can speak more languages — it would open so many doors. If only I didn\'t waste so much time last year, I would be further ahead now. My colleague wishes he didn\'t take that job last month, but it\'s too late now. I wish the weather will be better tomorrow for our trip. If only I was more confident when I was younger, things might have been different.',
    referenceAnswer: 'There are so many things I wish were different. I wish I could speak more languages — it would open so many doors. If only I hadn\'t wasted so much time last year, I would be further ahead now. My colleague wishes he hadn\'t taken that job last month, but it\'s too late now. I wish the weather would be better tomorrow for our trip. If only I had been more confident when I was younger, things might have been different.',
    targetGrammar: ['wish + past simple (present wishes)', 'wish + past perfect (past regrets)', 'wish + would (future wishes/complaints)', 'if only + past perfect'],
  },
  {
    id: 'wp-b2-u3-2',
    unitId: 'b2-u3',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe sobre tus arrepentimientos del pasado, deseos para el presente y esperanzas para el futuro. Usa "I wish" e "If only" con los tres tiempos: pasado (wish + past perfect), presente (wish + past simple) y futuro (wish + would).',
    referenceAnswer: 'If only I had paid more attention in school — I wish I had taken my studies more seriously. Looking at my present situation, I wish I had a better work-life balance. I wish I weren\'t so busy all the time; if only I could find more hours in the day. As for the future, I wish my company would offer more flexible working options. If only the government would invest more in public transport. I sometimes wish I could go back and change certain decisions, but I know that those experiences have shaped who I am.',
    targetGrammar: ['wish + past perfect for regrets', 'wish + past simple for present desires', 'wish + would for complaints/future', 'if only for emphasis'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 4: Reported Speech (advanced) =====
  {
    id: 'wp-b2-u4-1',
    unitId: 'b2-u4',
    type: 'paragraph-completion',
    level: 'B2',
    instruction: 'Transforma esta entrevista en un resumen en estilo indirecto avanzado. Incluye preguntas indirectas, peticiones y cambios temporales complejos.',
    sourceText: 'Interview with Dr. Elena Ruiz:\nJournalist: "How long have you been researching climate change?"\nDr. Ruiz: "I have been working in this field for over fifteen years."\nJournalist: "What do you think will happen in the next decade?"\nDr. Ruiz: "Temperatures will continue to rise unless we take immediate action."\nJournalist: "Could you explain your latest findings to our readers?"\nDr. Ruiz: "Don\'t ignore the data — it speaks for itself."\n\nSummary:\nThe journalist asked Dr. Ruiz ______. She replied that ______. When asked ______, she warned that ______. The journalist requested that ______. Dr. Ruiz urged readers ______.',
    referenceAnswer: 'The journalist asked Dr. Ruiz how long she had been researching climate change. She replied that she had been working in that field for over fifteen years. When asked what she thought would happen in the next decade, she warned that temperatures would continue to rise unless they took immediate action. The journalist requested that she explain her latest findings to their readers. Dr. Ruiz urged readers not to ignore the data, stating that it spoke for itself.',
    targetGrammar: ['reported questions with if/whether', 'reported requests and commands', 'advanced tense backshift', 'reporting verbs: warned, urged, requested'],
  },
  {
    id: 'wp-b2-u4-2',
    unitId: 'b2-u4',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe el resumen de una conversación larga o debate que hayas presenciado o visto en las noticias. Usa verbos de reporte variados (claimed, denied, insisted, admitted, warned, suggested, urged) y estilo indirecto avanzado con preguntas, peticiones y órdenes.',
    referenceAnswer: 'During the debate, the first candidate claimed that the economy had improved significantly under his leadership. His opponent denied this, insisting that unemployment had actually risen over the past year. She warned that the situation would deteriorate if no action were taken. The moderator asked both candidates whether they would support the new education reform. The first candidate admitted that he had not read the full proposal yet, while his opponent urged voters not to trust someone who hadn\'t done their homework. She suggested that they hold another debate focused exclusively on education policy.',
    targetGrammar: ['varied reporting verbs', 'reported questions', 'reported commands and requests', 'advanced tense backshift with modals'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 5: Passive Voice (complex: modals + perfect) =====
  {
    id: 'wp-b2-u5-1',
    unitId: 'b2-u5',
    type: 'sentence-construction',
    level: 'B2',
    instruction: 'Transforma las siguientes oraciones a voz pasiva compleja. Incluye pasivas con modales y tiempos perfectos.',
    sourceText: '1. Alguien debería haber informado a los estudiantes sobre el cambio.\n2. La empresa podría lanzar el nuevo producto el próximo mes.\n3. Alguien ha estado reparando la carretera durante semanas.\n4. El comité debe aprobar el presupuesto antes del viernes.\n5. Se dice que el director ha renunciado.\n6. La gente cree que la empresa está en problemas financieros.',
    referenceAnswer: '1. The students should have been informed about the change.\n2. The new product could be launched next month.\n3. The road has been being repaired for weeks.\n4. The budget must be approved by the committee before Friday.\n5. The director is said to have resigned.\n6. The company is believed to be in financial trouble.',
    targetGrammar: ['modal + be + past participle', 'should have been + past participle', 'subject + is said/believed + to have + past participle', 'impersonal passive'],
  },
  {
    id: 'wp-b2-u5-2',
    unitId: 'b2-u5',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe un texto formal sobre un problema social o medioambiental. Usa la voz pasiva compleja (con modales, tiempos perfectos y construcciones impersonales como "It is believed that..." / "...is said to...") para darle un tono académico.',
    referenceAnswer: 'It is widely acknowledged that climate change must be addressed urgently. According to recent reports, global temperatures are believed to have risen by 1.2 degrees since pre-industrial times. Immediate action should have been taken decades ago, but significant measures could still be implemented. Renewable energy sources are said to be the most promising solution. It has been suggested that governments should invest more heavily in sustainable technologies. Much more research needs to be conducted, and stronger policies must be enforced if catastrophic consequences are to be avoided.',
    targetGrammar: ['impersonal passive (it is believed/said)', 'modal passive (must be addressed)', 'perfect passive (should have been taken)', 'formal academic register'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 6: Causative (have/get something done) =====
  {
    id: 'wp-b2-u6-1',
    unitId: 'b2-u6',
    type: 'error-correction',
    level: 'B2',
    instruction: 'Este texto tiene 5 errores sutiles en el uso del causativo (have/get something done). Incluye errores en el orden de las palabras, la forma verbal y confusiones entre voz activa y causativa. Corrige los errores.',
    errorText: 'Last week was exhausting. I had my car to repair at the garage — it cost a fortune. Then I got my hair to cut at that new salon downtown. My sister had painted her house by a professional last month, and it looks fantastic. I need to have fixed my laptop soon because it keeps crashing. We also got installed a new security system — I feel much safer now.',
    referenceAnswer: 'Last week was exhausting. I had my car repaired at the garage — it cost a fortune. Then I got my hair cut at that new salon downtown. My sister had her house painted by a professional last month, and it looks fantastic. I need to have my laptop fixed soon because it keeps crashing. We also got a new security system installed — I feel much safer now.',
    targetGrammar: ['have + object + past participle', 'get + object + past participle', 'causative word order', 'causative with different tenses'],
  },
  {
    id: 'wp-b2-u6-2',
    unitId: 'b2-u6',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe sobre servicios que has contratado, que necesitas contratar, o que te gustaría contratar. Usa la estructura causativa (have/get something done) en al menos 5 oraciones con diferentes tiempos verbales (presente, pasado, futuro, con modales).',
    referenceAnswer: 'I recently had my apartment redecorated by an interior designer, and it looks completely different now. Last month, I also got my teeth checked at a new dental clinic. Next week, I\'m going to have my suit dry-cleaned for my friend\'s wedding. I should get my eyes tested soon because I\'ve been getting headaches. My parents had their garden redesigned last summer, and they couldn\'t be happier with the result. I wish I could afford to have my meals prepared by a personal chef every day.',
    targetGrammar: ['have/get + object + past participle', 'causative in past/present/future', 'causative with modals', 'causative vs active voice'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 7: Relative Clauses (non-defining, reduced) =====
  {
    id: 'wp-b2-u7-1',
    unitId: 'b2-u7',
    type: 'paragraph-completion',
    level: 'B2',
    instruction: 'Completa el texto insertando cláusulas relativas no restrictivas (non-defining) y reducidas donde se indica. Usa comas correctamente.',
    sourceText: 'The Louvre Museum, ______ (ubicado en París), is one of the most visited museums in the world. The Mona Lisa, ______ (que fue pintada por Leonardo da Vinci), attracts millions of visitors each year. Many tourists, ______ (que viajan desde países lejanos), wait in long queues just to see it. The museum\'s glass pyramid, ______ (que fue diseñada por I.M. Pei), has become an iconic landmark. Visitors ______ (que buscan una experiencia más tranquila) often come on weekday mornings.',
    referenceAnswer: 'The Louvre Museum, located in Paris, is one of the most visited museums in the world. The Mona Lisa, which was painted by Leonardo da Vinci, attracts millions of visitors each year. Many tourists, who travel from faraway countries, wait in long queues just to see it. The museum\'s glass pyramid, which was designed by I.M. Pei, has become an iconic landmark. Visitors looking for a quieter experience often come on weekday mornings.',
    targetGrammar: ['non-defining relative clauses with commas', 'reduced relative clauses (participle)', 'which/who in non-defining clauses'],
  },
  {
    id: 'wp-b2-u7-2',
    unitId: 'b2-u7',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe una descripción detallada de tu ciudad o un lugar que hayas visitado. Usa al menos 3 cláusulas relativas no restrictivas (con comas) y 2 cláusulas relativas reducidas (participio presente o pasado).',
    referenceAnswer: 'Barcelona, which is situated on the Mediterranean coast, is one of Spain\'s most vibrant cities. The Sagrada Familia, designed by Antoni Gaudi, dominates the city\'s skyline with its extraordinary towers. La Rambla, which stretches from Placa de Catalunya to the harbour, is always packed with tourists and street performers. The local cuisine, influenced by both Spanish and Catalan traditions, offers an incredible variety of flavours. People living in Barcelona enjoy a wonderful climate, with warm summers and mild winters. The Gothic Quarter, which dates back to medieval times, contains narrow streets filled with history and charm.',
    targetGrammar: ['non-defining relative clauses', 'reduced relative clauses with -ing', 'reduced relative clauses with -ed/past participle', 'formal descriptive writing'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 8: Participle Clauses =====
  {
    id: 'wp-b2-u8-1',
    unitId: 'b2-u8',
    type: 'sentence-construction',
    level: 'B2',
    instruction: 'Reescribe las siguientes oraciones usando cláusulas de participio (-ing/-ed) para hacer el texto más conciso y sofisticado. Traduce al inglés.',
    sourceText: '1. Como no sabía qué hacer, decidí pedir consejo. (participio presente)\n2. La carta, que fue escrita en el siglo XVIII, fue encontrada en el ático. (participio pasado)\n3. Mientras caminaba por el parque, noté un pájaro extraño. (participio presente)\n4. Como había terminado sus deberes, salió a jugar. (participio perfecto)\n5. El hombre, que estaba sentado en la esquina, parecía nervioso. (participio presente)',
    referenceAnswer: '1. Not knowing what to do, I decided to ask for advice.\n2. The letter, written in the 18th century, was found in the attic.\n3. Walking through the park, I noticed a strange bird.\n4. Having finished his homework, he went out to play.\n5. The man sitting in the corner looked nervous.',
    targetGrammar: ['present participle clause (-ing)', 'past participle clause (-ed)', 'perfect participle clause (having + past participle)', 'participle clauses as modifiers'],
  },
  {
    id: 'wp-b2-u8-2',
    unitId: 'b2-u8',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe una narrativa breve (una anécdota o un momento memorable). Usa al menos 4 cláusulas de participio de diferentes tipos: presente (-ing), pasado (-ed), y perfecto (having + past participle) para crear un estilo literario más sofisticado.',
    referenceAnswer: 'Standing at the edge of the cliff, I watched the sun slowly dip below the horizon. The sky, painted in shades of orange and gold, was the most beautiful thing I had ever seen. Exhausted from the long hike, I sat down on a rock and took a deep breath. Having reached the summit after six hours of climbing, I felt an overwhelming sense of accomplishment. A cool breeze, blowing gently from the valley below, refreshed my tired body. Not wanting the moment to end, I stayed there until the first stars appeared, feeling completely at peace with the world.',
    targetGrammar: ['present participle for simultaneous actions', 'past participle for descriptions', 'perfect participle for completed prior actions', 'literary narrative style'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 9: Future Perfect + Future Continuous =====
  {
    id: 'wp-b2-u9-1',
    unitId: 'b2-u9',
    type: 'error-correction',
    level: 'B2',
    instruction: 'Este texto tiene 5 errores sutiles en el uso del Future Perfect y Future Continuous. Algunos errores involucran confusiones entre ambos tiempos y otros son errores de forma. Encuentra y corrige los errores.',
    errorText: 'By this time next year, I will be graduated from university. I will have been working on my thesis for two months by then, so I hope it goes well. At 8 p.m. tonight, I will have studied in the library — come and find me there. By the time you arrive, I will be finishing all my work, so we can go out. In ten years, I will have been living here for twenty years and I will still be love this city.',
    referenceAnswer: 'By this time next year, I will have graduated from university. I will have been working on my thesis for two months by then, so I hope it goes well. At 8 p.m. tonight, I will be studying in the library — come and find me there. By the time you arrive, I will have finished all my work, so we can go out. In ten years, I will have been living here for twenty years and I will still be loving this city.',
    targetGrammar: ['will have + past participle (future perfect)', 'will be + -ing (future continuous)', 'by + time expression + future perfect', 'at + time + future continuous'],
  },
  {
    id: 'wp-b2-u9-2',
    unitId: 'b2-u9',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe sobre cómo imaginas tu vida dentro de 5, 10 y 20 años. Usa el Future Perfect para logros completados y el Future Continuous para acciones en progreso en momentos específicos del futuro.',
    referenceAnswer: 'In five years, I will have completed my master\'s degree and will probably be working in an international company. At that point, I will be gaining experience in my field and building professional connections. By the time I turn thirty-five, I will have travelled to at least twenty countries and will have learned a third language. I imagine that at that stage of my life, I will be living abroad, perhaps in a European city. In twenty years, I will have been working for nearly two decades. I hope that by then I will have saved enough to buy a house, and I will be enjoying a comfortable life with my family.',
    targetGrammar: ['future perfect for completed achievements', 'future continuous for ongoing situations', 'by + time + future perfect', 'at that point + future continuous'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 10: Phrasal Verbs (advanced patterns) =====
  {
    id: 'wp-b2-u10-1',
    unitId: 'b2-u10',
    type: 'paragraph-completion',
    level: 'B2',
    instruction: 'Completa el texto con los phrasal verbs correctos de la lista. Conjúgalos en el tiempo apropiado según el contexto. Phrasal verbs: come up with, get along with, put up with, look into, turn down, break down, run out of, carry out.',
    sourceText: 'Last month at work, everything went wrong. Our main computer system ______ during a crucial meeting, and we ______ time to fix it before the deadline. My manager asked me to ______ the problem, so I spent three days trying to find a solution. I eventually ______ a creative fix, but my boss ______ my proposal without even reading it. I find it hard to ______ that kind of attitude. Fortunately, I ______ most of my colleagues, so they supported me. In the end, the IT team ______ a full system update over the weekend.',
    referenceAnswer: 'Last month at work, everything went wrong. Our main computer system broke down during a crucial meeting, and we ran out of time to fix it before the deadline. My manager asked me to look into the problem, so I spent three days trying to find a solution. I eventually came up with a creative fix, but my boss turned down my proposal without even reading it. I find it hard to put up with that kind of attitude. Fortunately, I get along with most of my colleagues, so they supported me. In the end, the IT team carried out a full system update over the weekend.',
    targetGrammar: ['separable phrasal verbs', 'inseparable phrasal verbs', 'three-word phrasal verbs', 'phrasal verbs in context'],
  },
  {
    id: 'wp-b2-u10-2',
    unitId: 'b2-u10',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe una anécdota o historia usando al menos 8 phrasal verbs avanzados de forma natural. Intenta incluir verbos separables, inseparables y de tres palabras. Evita los phrasal verbs más básicos (get up, wake up).',
    referenceAnswer: 'I had been putting off cleaning my apartment for weeks when my friend called to say she was dropping by that evening. I had to figure out how to tidy everything in two hours. First, I threw away all the old newspapers that had been piling up on the table. Then I came across some old photos I had been looking for. I almost got carried away going through them, but I pulled myself together and got back to work. I managed to sort out the kitchen and set up the living room just in time. When my friend showed up, she pointed out that I had left a pile of clothes on the bathroom floor. I just laughed it off.',
    targetGrammar: ['phrasal verbs in natural narrative', 'separable/inseparable usage', 'three-word phrasal verbs', 'idiomatic phrasal verb use'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 11: Inversion + Cleft Sentences =====
  {
    id: 'wp-b2-u11-1',
    unitId: 'b2-u11',
    type: 'sentence-construction',
    level: 'B2',
    instruction: 'Reescribe las siguientes oraciones usando inversión o cleft sentences para dar énfasis. Sigue las indicaciones entre paréntesis.',
    sourceText: '1. Nunca había visto una puesta de sol tan hermosa. (inversión con Never)\n2. El profesor me ayudó a entender el problema. (cleft con It was... who)\n3. No solo aprobó el examen, sino que también obtuvo la mejor nota. (inversión con Not only)\n4. Me di cuenta de la importancia de la educación en ese momento. (cleft con It was... that)\n5. Apenas había llegado cuando empezó a llover. (inversión con Hardly... when)\n6. Lo que realmente necesitamos es más tiempo. (cleft con What)',
    referenceAnswer: '1. Never had I seen such a beautiful sunset.\n2. It was the teacher who helped me understand the problem.\n3. Not only did she pass the exam, but she also got the highest mark.\n4. It was at that moment that I realized the importance of education.\n5. Hardly had I arrived when it started to rain.\n6. What we really need is more time.',
    targetGrammar: ['inversion with negative adverbials', 'cleft sentences with It was...who/that', 'Not only...but also with inversion', 'What-cleft sentences'],
  },
  {
    id: 'wp-b2-u11-2',
    unitId: 'b2-u11',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe un texto persuasivo sobre un tema que te apasione (educación, tecnología, medio ambiente, etc.). Usa al menos 3 estructuras de inversión y 3 cleft sentences para enfatizar tus argumentos más importantes.',
    referenceAnswer: 'It is education that holds the key to a better future for all of society. Never before have we had such powerful tools for learning at our fingertips. What we need is a fundamental shift in how we think about teaching. Not only should education be accessible to everyone, but it should also be adapted to individual learning styles. It was the invention of the internet that truly revolutionized how knowledge is shared. Rarely do governments invest enough in training teachers, and this is where change must begin. What concerns me most is the growing inequality in educational opportunities. Only through collective effort can we build a system that truly works for everyone.',
    targetGrammar: ['inversion for emphasis in formal writing', 'It was/is...that/who cleft sentences', 'What-cleft for focus', 'persuasive writing with emphasis structures'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 12: Narrative Tenses (all tenses in storytelling) =====
  {
    id: 'wp-b2-u12-1',
    unitId: 'b2-u12',
    type: 'error-correction',
    level: 'B2',
    instruction: 'Esta narrativa tiene 6 errores sutiles en el uso de los tiempos narrativos (past simple, past continuous, past perfect, past perfect continuous). Los errores involucran el uso incorrecto de tiempos para secuencias, acciones en progreso y eventos anteriores. Corrige los errores.',
    errorText: 'The day of the concert finally arrived. I was waiting for this moment for months. As I was walking to the venue, my phone rang. It was my friend who told me she couldn\'t come because she was losing her ticket. By the time I got there, the doors already opened and people streamed in. I was finding my seat quickly and sat down. The lights dimmed, and the singer walked on stage. She was singing for about twenty minutes when the power suddenly went out. Everyone has been shocked.',
    referenceAnswer: 'The day of the concert finally arrived. I had been waiting for this moment for months. As I was walking to the venue, my phone rang. It was my friend who told me she couldn\'t come because she had lost her ticket. By the time I got there, the doors had already opened and people were streaming in. I found my seat quickly and sat down. The lights dimmed, and the singer walked on stage. She had been singing for about twenty minutes when the power suddenly went out. Everyone was shocked.',
    targetGrammar: ['past perfect for earlier events', 'past continuous for background actions', 'past perfect continuous for duration before past event', 'past simple for main narrative events'],
  },
  {
    id: 'wp-b2-u12-2',
    unitId: 'b2-u12',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe una historia corta con un giro inesperado. Usa todos los tiempos narrativos: past simple para los eventos principales, past continuous para el contexto, past perfect para información previa, y past perfect continuous para acciones prolongadas antes del evento principal.',
    referenceAnswer: 'The rain had been falling steadily all morning, and the streets were glistening under the grey sky. Sarah was hurrying to the train station because she was already running late. She had arranged to meet her sister at noon, and it was already half past eleven. As she was crossing the road, she noticed an old man sitting on a bench. He had been waiting there for hours, she could tell, because his clothes were completely soaked. She stopped and asked him if he needed help. He looked up and smiled — it was her grandfather, who had disappeared ten years earlier. He had been living in a small village and had finally decided to come home. Sarah had imagined this moment countless times, but she had never expected it to happen like this.',
    targetGrammar: ['past simple for narrative events', 'past continuous for atmosphere', 'past perfect for backstory', 'past perfect continuous for extended prior actions'],
    wordLimit: { min: 50, max: 120 },
  },

  // ===== Unit 13: Connectors + Discourse Markers =====
  {
    id: 'wp-b2-u13-1',
    unitId: 'b2-u13',
    type: 'paragraph-completion',
    level: 'B2',
    instruction: 'Completa el ensayo argumentativo insertando los conectores y marcadores discursivos más apropiados de la lista. Cada conector se usa una sola vez. Conectores: Furthermore, Nevertheless, In addition, On the other hand, As a result, In conclusion, Despite, Moreover, Whereas, To begin with.',
    sourceText: 'Social media has transformed modern communication. ______, it has made it easier than ever to stay in touch with friends and family across the world. ______, it allows people to share information instantly. ______, social media has significant drawbacks. ______ its many benefits, it can be addictive and harmful to mental health. ______, studies show that excessive use leads to anxiety and depression. ______ young people are particularly vulnerable, adults are not immune to these effects. ______, the spread of misinformation is a serious concern. ______, many people continue to use these platforms daily because they find them indispensable. ______, social media is a double-edged sword that must be used responsibly.',
    referenceAnswer: 'Social media has transformed modern communication. To begin with, it has made it easier than ever to stay in touch with friends and family across the world. Furthermore, it allows people to share information instantly. On the other hand, social media has significant drawbacks. Despite its many benefits, it can be addictive and harmful to mental health. Moreover, studies show that excessive use leads to anxiety and depression. Whereas young people are particularly vulnerable, adults are not immune to these effects. In addition, the spread of misinformation is a serious concern. Nevertheless, many people continue to use these platforms daily because they find them indispensable. In conclusion, social media is a double-edged sword that must be used responsibly.',
    targetGrammar: ['contrast connectors', 'addition connectors', 'concession connectors', 'conclusion markers', 'discourse organization'],
  },
  {
    id: 'wp-b2-u13-2',
    unitId: 'b2-u13',
    type: 'free-writing',
    level: 'B2',
    instruction: 'Escribe un ensayo corto argumentativo sobre un tema controvertido (ej: trabajo remoto, inteligencia artificial, redes sociales). Organiza tu texto con conectores avanzados de adición (furthermore, moreover), contraste (however, nevertheless, on the other hand), causa-efecto (as a result, consequently), y conclusión (in conclusion, to sum up).',
    referenceAnswer: 'The debate over whether artificial intelligence will replace human workers is one of the most pressing issues of our time. To begin with, it is undeniable that AI has already transformed many industries. Furthermore, automation has increased efficiency in manufacturing and data analysis. However, this progress comes at a cost. As a result of these technological advances, many traditional jobs have disappeared. On the other hand, new roles have emerged that did not exist a decade ago. Nevertheless, the transition is not smooth for everyone. Moreover, there are serious ethical concerns regarding bias in AI algorithms. Despite these challenges, it would be unrealistic to halt technological progress. Consequently, the focus should be on education and retraining programmes. In conclusion, rather than fearing AI, we should learn to work alongside it while ensuring that no one is left behind.',
    targetGrammar: ['addition markers', 'contrast markers', 'cause-effect connectors', 'concession expressions', 'essay structure and cohesion'],
    wordLimit: { min: 50, max: 120 },
  },
];

// ===== B2 Speaking Prompts =====
// 1 read-aloud + 1 oral-response per unit
// Read-aloud texts are longer (2-3 sentences with complex structures)
// Oral responses require longer, more nuanced answers

export const b2SpeakingPrompts: SpeakingPrompt[] = [
  // ===== Unit 1: Third Conditional =====
  {
    id: 'sp-b2-u1-1',
    unitId: 'b2-u1',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee el siguiente texto en voz alta. Presta atención a la pronunciación fluida de las formas contraídas (would\'ve, hadn\'t) y a la entonación natural de las oraciones condicionales largas.',
    targetText: 'If I had known about the traffic jam, I would\'ve taken a different route and arrived on time. My boss wouldn\'t have been so annoyed if I hadn\'t missed the beginning of the meeting. Things would certainly have turned out differently if I had simply checked the traffic report that morning.',
  },
  {
    id: 'sp-b2-u1-2',
    unitId: 'b2-u1',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Piensa en una decisión importante que tomaste en el pasado. ¿Qué habría sido diferente si hubieras tomado otra decisión? Explica las consecuencias usando el Third Conditional. Da una respuesta detallada con al menos 4-5 oraciones.',
    targetGrammar: ['if + past perfect, would have + past participle', 'third conditional for past reflection', 'could have / might have variations'],
  },

  // ===== Unit 2: Mixed Conditionals =====
  {
    id: 'sp-b2-u2-1',
    unitId: 'b2-u2',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee el texto en voz alta. Nota cómo los condicionales mixtos conectan el pasado con el presente y viceversa. Mantén un ritmo natural en las oraciones largas.',
    targetText: 'If I had accepted that scholarship in Japan, I would be fluent in Japanese now. On the other hand, if I weren\'t such a cautious person, I would have moved abroad years ago without hesitation. It\'s strange how our past decisions and present personality are so deeply connected.',
  },
  {
    id: 'sp-b2-u2-2',
    unitId: 'b2-u2',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: ¿Cómo sería tu presente si hubieras tomado decisiones diferentes en el pasado? Y al revés: ¿cómo habrían cambiado tus decisiones pasadas si tu personalidad fuera diferente? Usa condicionales mixtos de ambos tipos en tu respuesta.',
    targetGrammar: ['if + past perfect, would + base form (past→present)', 'if + past simple, would have + past participle (present→past)', 'mixed conditional reflection'],
  },

  // ===== Unit 3: Wish / If only =====
  {
    id: 'sp-b2-u3-1',
    unitId: 'b2-u3',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee el texto en voz alta. Transmite la emoción de arrepentimiento y deseo a través de tu entonación. Presta atención a la pronunciación de "if only" con énfasis natural.',
    targetText: 'I wish I had spent more time with my grandparents before they passed away. If only I had realized how precious those moments were. Now I wish I could turn back time, but all I can do is cherish the memories. I sometimes wish people would appreciate what they have before it\'s gone.',
  },
  {
    id: 'sp-b2-u3-2',
    unitId: 'b2-u3',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Habla sobre tres cosas — un arrepentimiento del pasado (wish + past perfect), algo que desearías que fuera diferente ahora (wish + past simple), y algo que te gustaría que cambiara en el futuro (wish + would). Explica cada uno con detalle.',
    targetGrammar: ['wish + past perfect for regrets', 'wish + past simple for present', 'wish + would for future/complaints', 'if only for emphasis'],
  },

  // ===== Unit 4: Reported Speech (advanced) =====
  {
    id: 'sp-b2-u4-1',
    unitId: 'b2-u4',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee el siguiente resumen de una entrevista en voz alta. Practica las transiciones fluidas entre los diferentes verbos de reporte y los cambios de tiempo verbal.',
    targetText: 'The scientist explained that she had been researching the topic for over a decade. She claimed that the results would revolutionize the field. When the journalist asked whether the findings had been peer-reviewed, she insisted that all the data had been thoroughly verified and urged the public not to dismiss the evidence.',
  },
  {
    id: 'sp-b2-u4-2',
    unitId: 'b2-u4',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Resume una conversación importante o un debate que hayas visto recientemente (en la televisión, en clase, o con amigos). Usa verbos de reporte variados como claimed, insisted, denied, warned, admitted, suggested y aplica los cambios de tiempo verbal correctos.',
    targetGrammar: ['varied reporting verbs', 'reported questions', 'tense backshift', 'reported commands and suggestions'],
  },

  // ===== Unit 5: Passive Voice (complex) =====
  {
    id: 'sp-b2-u5-1',
    unitId: 'b2-u5',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee el siguiente texto académico en voz alta. Practica el tono formal de la voz pasiva compleja y las construcciones impersonales. Mantén un ritmo pausado y claro.',
    targetText: 'It has been widely acknowledged that urgent action must be taken to address the climate crisis. Several innovative solutions are believed to have been developed in recent years, but they should have been implemented much sooner. It is estimated that the global temperature could be reduced significantly if these measures were to be adopted worldwide.',
  },
  {
    id: 'sp-b2-u5-2',
    unitId: 'b2-u5',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Habla sobre un avance científico o una noticia importante usando la voz pasiva compleja. Incluye construcciones impersonales (It is said that..., It is believed to...) y pasivas con modales (should be done, must be addressed). Da una respuesta de al menos 5-6 oraciones.',
    targetGrammar: ['impersonal passive constructions', 'modal passive', 'perfect passive', 'formal academic speaking'],
  },

  // ===== Unit 6: Causative =====
  {
    id: 'sp-b2-u6-1',
    unitId: 'b2-u6',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee el texto en voz alta. Nota la estructura causativa en diferentes tiempos verbales y practica la pronunciación natural de estas construcciones.',
    targetText: 'Last month I had my entire apartment repainted by professionals, and I also got the plumbing fixed while I was at it. I need to have my car serviced before the long drive next week. My neighbour is having a new kitchen installed, and she\'s also getting her garden redesigned by a landscape architect.',
  },
  {
    id: 'sp-b2-u6-2',
    unitId: 'b2-u6',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Habla sobre servicios que has usado, que necesitas usar, o que te gustaría usar. Describe al menos 4-5 situaciones usando la estructura causativa (have/get something done) en diferentes tiempos verbales y con modales.',
    targetGrammar: ['have + object + past participle', 'get + object + past participle', 'causative in different tenses', 'causative with modals'],
  },

  // ===== Unit 7: Relative Clauses (non-defining, reduced) =====
  {
    id: 'sp-b2-u7-1',
    unitId: 'b2-u7',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee el texto en voz alta. Haz pausas naturales antes y después de las cláusulas relativas no restrictivas (marcadas por comas). Practica las cláusulas reducidas con fluidez.',
    targetText: 'The Amazon rainforest, which covers approximately 5.5 million square kilometres, is often referred to as the lungs of the Earth. Indigenous communities, living in these areas for thousands of years, possess invaluable knowledge about biodiversity. The river itself, considered the largest by volume in the world, supports an ecosystem that scientists are still working to fully understand.',
  },
  {
    id: 'sp-b2-u7-2',
    unitId: 'b2-u7',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Describe un lugar fascinante (real o imaginario) con mucho detalle. Usa cláusulas relativas no restrictivas para agregar información adicional y cláusulas reducidas para hacer tu descripción más sofisticada. Habla durante al menos 30 segundos.',
    targetGrammar: ['non-defining relative clauses', 'reduced relative clauses (-ing/-ed)', 'descriptive fluency', 'complex sentence structures'],
  },

  // ===== Unit 8: Participle Clauses =====
  {
    id: 'sp-b2-u8-1',
    unitId: 'b2-u8',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee la siguiente narrativa en voz alta. Practica la fluidez al leer cláusulas de participio al inicio de las oraciones, manteniendo un tono literario y expresivo.',
    targetText: 'Having waited for over an hour in the freezing cold, the passengers were relieved when the train finally arrived. Exhausted from the long journey, many of them fell asleep almost immediately. Looking out of the window at the passing countryside, I found myself lost in thought, thinking about the new life that awaited me in the city.',
  },
  {
    id: 'sp-b2-u8-2',
    unitId: 'b2-u8',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Narra un momento memorable o dramático de tu vida como si fuera una historia literaria. Usa cláusulas de participio (presente, pasado y perfecto) para describir acciones simultáneas, contexto y eventos anteriores. Intenta que tu narración suene sofisticada y fluida.',
    targetGrammar: ['present participle clauses', 'past participle clauses', 'perfect participle clauses', 'literary narrative speaking'],
  },

  // ===== Unit 9: Future Perfect + Future Continuous =====
  {
    id: 'sp-b2-u9-1',
    unitId: 'b2-u9',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee el texto en voz alta. Presta atención a la pronunciación clara de "will have" y "will be" en las estructuras del Future Perfect y Future Continuous.',
    targetText: 'By the end of this decade, scientists will have made significant breakthroughs in renewable energy. Many countries will be transitioning to fully electric transport systems. By 2050, experts predict that we will have transformed the way we generate and consume energy, and the majority of the population will be living in smart, sustainable cities.',
  },
  {
    id: 'sp-b2-u9-2',
    unitId: 'b2-u9',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Haz predicciones detalladas sobre el mundo en el año 2050. ¿Qué habremos logrado para entonces? ¿Qué estaremos haciendo? Usa el Future Perfect para logros completados y el Future Continuous para situaciones en progreso.',
    targetGrammar: ['will have + past participle', 'will be + -ing', 'by + future time + future perfect', 'predictions with future tenses'],
  },

  // ===== Unit 10: Phrasal Verbs (advanced) =====
  {
    id: 'sp-b2-u10-1',
    unitId: 'b2-u10',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee el texto en voz alta. Los phrasal verbs deben sonar naturales y fluidos, como parte integral de las oraciones. Evita hacer pausas entre el verbo y la partícula.',
    targetText: 'When my computer broke down last week, I had to figure out how to fix it on my own. I came across a helpful tutorial online and managed to sort out the problem in a couple of hours. I had been putting off dealing with the issue for weeks, so I was relieved when it finally worked out.',
  },
  {
    id: 'sp-b2-u10-2',
    unitId: 'b2-u10',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Cuenta una anécdota sobre un problema que tuviste y cómo lo resolviste. Usa al menos 6 phrasal verbs avanzados de forma natural (come up with, figure out, deal with, sort out, put off, turn out, look into, run into, etc.).',
    targetGrammar: ['advanced phrasal verbs in narrative', 'natural phrasal verb usage', 'separable and inseparable patterns', 'fluent spoken English'],
  },

  // ===== Unit 11: Inversion + Cleft Sentences =====
  {
    id: 'sp-b2-u11-1',
    unitId: 'b2-u11',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee el texto persuasivo en voz alta. Enfatiza las palabras clave en las estructuras de inversión y cleft sentences. Usa un tono formal y convincente, como si estuvieras dando un discurso.',
    targetText: 'Never before have we faced such a critical moment in human history. It is our collective responsibility that will determine the future of this planet. Not only must we reduce our carbon emissions, but we must also invest in sustainable technologies. What we need now is decisive action, not empty promises. Rarely has the need for global cooperation been so urgent.',
  },
  {
    id: 'sp-b2-u11-2',
    unitId: 'b2-u11',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Da un mini discurso persuasivo de al menos 30 segundos sobre un tema que te importe. Usa inversión (Never have I..., Not only...but also, Rarely do we...) y cleft sentences (It is...that, What we need is...) para enfatizar tus puntos principales.',
    targetGrammar: ['inversion with negative adverbs', 'cleft sentences for emphasis', 'formal persuasive speaking', 'emphasis structures in oral discourse'],
  },

  // ===== Unit 12: Narrative Tenses (all tenses) =====
  {
    id: 'sp-b2-u12-1',
    unitId: 'b2-u12',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee la siguiente narrativa en voz alta. Varía tu tono y ritmo según los tiempos verbales: más lento para el contexto (past continuous), más directo para los eventos (past simple), y con un tono reflexivo para los antecedentes (past perfect).',
    targetText: 'The storm had been building all afternoon, and dark clouds were gathering on the horizon. Sarah was sitting by the window, thinking about the letter she had received that morning. She had been waiting for news for weeks, and now that it had finally arrived, she didn\'t know how to feel. Suddenly, the phone rang. It was the call that would change everything.',
  },
  {
    id: 'sp-b2-u12-2',
    unitId: 'b2-u12',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Narra una historia (real o inventada) que tenga un giro inesperado. Usa todos los tiempos narrativos de forma natural: past simple para los eventos principales, past continuous para el contexto y las acciones en progreso, past perfect para lo que había ocurrido antes, y past perfect continuous para acciones prolongadas previas. Habla durante al menos 45 segundos.',
    targetGrammar: ['past simple for main events', 'past continuous for background', 'past perfect for prior events', 'past perfect continuous for extended prior actions'],
  },

  // ===== Unit 13: Connectors + Discourse Markers =====
  {
    id: 'sp-b2-u13-1',
    unitId: 'b2-u13',
    type: 'read-aloud',
    level: 'B2',
    instruction: 'Lee el ensayo argumentativo en voz alta. Haz pausas naturales después de cada conector discursivo y varía tu entonación para marcar las transiciones entre ideas.',
    targetText: 'To begin with, technology has undeniably improved our quality of life. Furthermore, it has created millions of jobs worldwide. However, we must also consider the negative consequences. As a result of automation, many traditional occupations have disappeared. Nevertheless, it would be short-sighted to reject progress altogether. In conclusion, what we need is a balanced approach that embraces innovation while protecting those most vulnerable to change.',
  },
  {
    id: 'sp-b2-u13-2',
    unitId: 'b2-u13',
    type: 'oral-response',
    level: 'B2',
    instruction: 'Responde en voz alta: Presenta un argumento estructurado sobre un tema polémico. Organiza tu discurso usando conectores avanzados: empieza con "To begin with", agrega ideas con "Furthermore/Moreover", presenta contraargumentos con "However/Nevertheless/On the other hand", muestra consecuencias con "As a result/Consequently", y cierra con "In conclusion/To sum up". Habla durante al menos 45 segundos.',
    targetGrammar: ['addition connectors in speech', 'contrast connectors', 'cause-effect markers', 'conclusion markers', 'structured oral argumentation'],
  },
];
