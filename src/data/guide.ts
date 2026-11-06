// «Cómo aprender con Voxie»: the guide for whoever arrives without knowing where to start. What
// Voxie is, where to begin, how a level and a unit work, the daily goal, each tool, how to study
// (with a week plan by the time one has) and what to write in the notebook. The numbers come from
// the app itself (units, pass marks, freezes); nothing here is a measured result.
import type { CEFRLevel } from '../lib/db';

export type GuideLanguage = 'es' | 'en';
export type ChapterId = 'what' | 'start' | 'path' | 'day' | 'tools' | 'method' | 'notebook';
export type StepKey = 'grammar' | 'story' | 'vocab' | 'exercises' | 'output' | 'checkpoint';
export type ToolKey = 'stories' | 'review' | 'lab' | 'tutor' | 'practice' | 'simulator' | 'notebook' | 'glossary';
export type PlanMinutes = 10 | 20 | 40;

/** A freeze is earned every 7 days of streak, 2 at most (supabase/migrations/…_daily_goal_and_freezes.sql). */
export const FREEZE_EVERY_DAYS = 7;
export const FREEZE_MAX = 2;

/** Each plan sets the daily goal the learner can adopt with one tap. */
export const PLAN_GOAL: Record<PlanMinutes, 1 | 2 | 3> = { 10: 1, 20: 2, 40: 3 };
export const PLAN_MINUTES: PlanMinutes[] = [10, 20, 40];

/** Where each tool lives; the notebook opens its panel and the glossary has no page of its own. */
export const TOOL_PATHS: Record<ToolKey, string | null> = {
    stories: '/learn', review: '/review', lab: '/review/lab', tutor: '/chat',
    practice: '/practice', simulator: '/review/simulator', notebook: null, glossary: null,
};

export interface PassMarks { exercises: number; writing: number; speaking: number; checkpoint: number; exam: number; tries: number }

export interface ExampleNote { place: string; quote?: string; lines: string[] }

export interface GuideText {
    title: string;
    lead: string;
    contents: string;
    chapters: Record<ChapterId, string>;
    what: { body: string[]; stages: Record<CEFRLevel, string> };
    start: { body: string; options: { title: string; body: string; action: string; to: string }[] };
    path: {
        body: string;
        level: (units: number) => string;
        stepsTitle: string;
        steps: Record<StepKey, { name: string; body: string }>;
        rulesTitle: string;
        rules: (p: PassMarks) => string[];
    };
    day: {
        body: string;
        countsTitle: string;
        counts: string[];
        streakTitle: string;
        streak: string[];
    };
    tools: { body: string; open: string; when: string; items: Record<ToolKey, { name: string; body: string; when: string }>; openNotebook: string };
    method: {
        body: string;
        principles: { title: string; body: string }[];
        planTitle: string;
        planLead: string;
        planLabel: string;
        minutes: (n: PlanMinutes) => string;
        plans: Record<PlanMinutes, { summary: string; days: { day: string; items: string[] }[] }>;
        useGoal: (goal: number) => string;
        isGoal: (goal: number) => string;
        goalSaved: string;
        goalError: string;
    };
    notebook: {
        body: string;
        whatTitle: string;
        items: { title: string; body: string; example: ExampleNote }[];
        howTitle: string;
        how: string[];
        exampleLabel: string;
    };
    end: { title: string; body: string; action: string };
}

const es: GuideText = {
    title: 'Cómo aprender con Voxie',
    lead: 'Todo lo que necesitas para empezar y avanzar, en el orden en que lo vas a usar.',
    contents: 'En esta guía',
    chapters: {
        what: 'Qué es Voxie',
        start: 'Por dónde empiezo',
        path: 'Tu camino',
        day: 'Tu día en Voxie',
        tools: 'Tus herramientas',
        method: 'Cómo estudiar',
        notebook: 'Qué anotar en tu libreta',
    },
    what: {
        body: [
            'Voxie te lleva del inglés desde cero hasta el nivel B2, el que piden muchos trabajos y exámenes. Aprendes con unidades cortas, cuentos con audio, un tutor con IA y repasos que vuelven justo cuando estás por olvidar.',
            'Tu avance se ve como un jardín: cada nivel es una etapa de tu planta, cada unidad que terminas es una planta nueva y estudiar cada día es regarlo.',
        ],
        stages: {
            A1: 'Lo básico: saludar, presentarte, hablar de ti y de tu día.',
            A2: 'Pláticas sencillas: compras, viajes, planes y lo que hiciste ayer.',
            B1: 'Te defiendes en el trabajo y de viaje: cuentas experiencias y das tu opinión.',
            B2: 'Hablas con soltura de casi cualquier tema y entiendes textos largos.',
            
        },
    },
    start: {
        body: 'Elige según lo que sabes hoy. Las dos opciones llevan al mismo lugar: la unidad 1 de tu ruta.',
        options: [
            {
                title: 'Nunca he estudiado inglés',
                body: 'Empieza por Primeros pasos: cinco lecciones cortas, sin gramática, con saludos, números, colores y días, los sonidos del inglés y frases útiles. Todo con audio y en español.',
                action: 'Ir a Primeros pasos',
                to: '/primeros-pasos',
            },
            {
                title: 'Ya sé algo de inglés',
                body: 'Haz el test de nivelación del Simulador para saber dónde estás. Luego sigue tu ruta: lo que ya sabes lo pasarás rápido y te servirá de repaso.',
                action: 'Ir al Simulador',
                to: '/review/simulator',
            },
        ],
    },
    path: {
        body: 'Tu ruta tiene cuatro niveles. Cada uno es una serie de unidades que se abren en orden y termina con un examen.',
        level: units => `${units} unidades y un examen`,
        stepsTitle: 'Los seis pasos de una unidad',
        steps: {
            grammar: { name: 'Gramática', body: 'La regla de la unidad explicada en español, con ejemplos que puedes oír. Las palabras subrayadas con puntos se explican al tocarlas.' },
            story: { name: 'Historia', body: 'Los cuentos de la unidad, que usan esa regla. Toca cualquier palabra para ver qué significa ahí; en A1 cada oración trae su traducción.' },
            vocab: { name: 'Vocabulario', body: 'Las palabras clave de la unidad, con audio y pronunciación. Van a tu repaso.' },
            exercises: { name: 'Ejercicios', body: 'Completar, ordenar, elegir y entender lo que oyes.' },
            output: { name: 'Escritura y habla', body: 'Escribes unas frases y lees o contestas en voz alta. La IA te corrige a tu nivel. Si no puedes hablar en ese momento, deja el habla para después.' },
            checkpoint: { name: 'Checkpoint', body: 'La prueba final de la unidad. Al aprobarla, tu planta crece.' },
        },
        rulesTitle: 'Para avanzar',
        rules: p => [
            `Necesitas ${p.exercises}% en ejercicios y en escritura, ${p.speaking}% en habla y ${p.checkpoint}% en el checkpoint.`,
            `Si no llegas, Voxie te muestra la regla y lo que fallaste, y lo intentas otra vez. Después del intento ${p.tries} puedes seguir, salvo en el checkpoint.`,
            `El examen de fin de nivel se abre al terminar todas las unidades. Con ${p.exam}% o más abres el siguiente nivel.`,
            'El habla que dejaste para después la tienes que terminar antes del examen.',
        ],
    },
    day: {
        body: 'Cada día tienes una meta de 1 a 3 actividades. Son las gotas de tu inicio: llénalas y tu jardín queda regado.',
        countsTitle: 'Cuenta como una actividad',
        counts: ['Un paso de una unidad', 'Un cuento leído', 'Cada 10 tarjetas de repaso', 'Cada 5 mensajes al tutor'],
        streakTitle: 'Tu racha',
        streak: [
            'Cuenta los días seguidos en que estudias.',
            `Cada ${FREEZE_EVERY_DAYS} días de racha ganas un congelador; puedes tener hasta ${FREEZE_MAX}. Si un día no estudias, se gasta solo y tu racha sigue.`,
            'Tu meta la cambias en Configuración o con tu plan, en «Cómo estudiar».',
        ],
    },
    tools: {
        body: 'Además de tu ruta, Voxie tiene herramientas para practicar a tu ritmo. Están en el menú.',
        open: 'Abrir',
        when: 'Cuándo',
        openNotebook: 'Abrir la libreta',
        items: {
            review: {
                name: 'Repasar',
                body: 'Tarjetas de palabras y de gramática que vuelven justo antes de que las olvides. Dices qué tan bien te acordaste y Voxie decide cuándo mostrártela otra vez.',
                when: 'Todos los días, antes que nada.',
            },
            stories: {
                name: 'Cuentos',
                body: 'Historias de tu nivel con audio. Cada palabra que tocas puede ir a tu repaso.',
                when: 'Cuando termines el paso del día y quieras más.',
            },
            lab: {
                name: 'Laboratorio de errores',
                body: 'Tus errores de escritura y habla convertidos en práctica: ves el error, armas la frase correcta y te pones a prueba.',
                when: 'Cuando tu inicio te avise que tienes errores por repasar.',
            },
            tutor: {
                name: 'Tutor IA',
                body: 'Una conversación en inglés a tu nivel, con correcciones. El plan gratis tiene un límite de mensajes al día.',
                when: 'Al terminar una unidad, para usar lo que aprendiste.',
            },
            practice: {
                name: 'Práctica',
                body: 'Escritura y habla libres, con la corrección de la IA y tu historial.',
                when: 'Cuando quieras escribir o hablar de lo que tú elijas.',
            },
            simulator: {
                name: 'Simulador',
                body: 'El test de nivelación y simulacros de TOEFL, IELTS y Cambridge B1 y B2.',
                when: 'Al empezar, para saber tu nivel, y antes de un examen real.',
            },
            notebook: {
                name: 'Libreta',
                body: 'Tus notas, siempre a la mano: en computadora en la barra lateral (Alt + N) y en celular en la bolita del borde.',
                when: 'Siempre que algo valga la pena recordarlo.',
            },
            glossary: {
                name: 'Glosario',
                body: 'Las palabras de gramática subrayadas con puntos (sujeto, verbo, participio) se explican al tocarlas.',
                when: 'Cuando una explicación use una palabra que no conoces.',
            },
        },
    },
    method: {
        body: 'Voxie hace el plan; tú pones la constancia. Esto es lo que más ayuda:',
        principles: [
            { title: 'Poco y diario', body: 'Diez minutos todos los días rinden más que una hora el domingo: recuerdas mejor lo que repasas en días distintos.' },
            { title: 'Primero el repaso', body: 'Las tarjetas que Voxie te pide hoy son las que estás a punto de olvidar. Repasarlas a tiempo las fija.' },
            { title: 'Escucha todo y dilo en voz alta', body: 'Toca la bocina antes de leer una frase y repítela. Tu oído aprende antes que tu boca.' },
            { title: 'El español es apoyo, no muleta', body: 'En A1 lee con «Ver en español». Desde A2, lee primero sin traducción y ábrela sólo para comprobar.' },
            { title: 'Equivócate sin miedo', body: 'Escribe y habla aunque no estés seguro. Cada error que la IA marca va a tu laboratorio, y lo que fallas es lo que mejor aprendes.' },
            { title: 'No avances sin entender', body: 'Si no pasas un ejercicio, lee el repaso que te muestra Voxie antes de intentarlo otra vez.' },
        ],
        planTitle: 'Tu plan',
        planLead: '¿Cuánto tiempo tienes al día? Elige y te armamos tu semana.',
        planLabel: 'Tiempo al día',
        minutes: n => `${n} min`,
        plans: {
            10: {
                summary: 'Un paso de tu unidad cada día. Así cierras una unidad por semana.',
                days: [
                    { day: 'Lunes', items: ['Repaso', 'Gramática'] },
                    { day: 'Martes', items: ['Repaso', 'Historia'] },
                    { day: 'Miércoles', items: ['Repaso', 'Vocabulario'] },
                    { day: 'Jueves', items: ['Repaso', 'Ejercicios'] },
                    { day: 'Viernes', items: ['Repaso', 'Escritura y habla'] },
                    { day: 'Sábado', items: ['Repaso', 'Checkpoint'] },
                    { day: 'Domingo', items: ['Repaso', 'Relee tu libreta'] },
                ],
            },
            20: {
                summary: 'Un paso de tu unidad y algo para usar el inglés: un cuento, el tutor o tu laboratorio. Una unidad por semana, con más práctica.',
                days: [
                    { day: 'Lunes', items: ['Repaso', 'Gramática', 'Un cuento'] },
                    { day: 'Martes', items: ['Repaso', 'Historia', 'Anota la regla en tu libreta'] },
                    { day: 'Miércoles', items: ['Repaso', 'Vocabulario', 'Un cuento'] },
                    { day: 'Jueves', items: ['Repaso', 'Ejercicios', 'Laboratorio de errores'] },
                    { day: 'Viernes', items: ['Repaso', 'Escritura y habla', '5 mensajes al tutor'] },
                    { day: 'Sábado', items: ['Repaso', 'Checkpoint', 'Un cuento'] },
                    { day: 'Domingo', items: ['Repaso', 'Relee tu libreta'] },
                ],
            },
            40: {
                summary: 'Dos pasos al día y práctica libre. Cierras una unidad cada tres días: dos por semana.',
                days: [
                    { day: 'Lunes', items: ['Repaso', 'Gramática', 'Historia', '5 mensajes al tutor'] },
                    { day: 'Martes', items: ['Repaso', 'Vocabulario', 'Ejercicios', 'Un cuento'] },
                    { day: 'Miércoles', items: ['Repaso', 'Escritura y habla', 'Checkpoint', 'Laboratorio de errores'] },
                    { day: 'Jueves', items: ['Repaso', 'Gramática', 'Historia', 'Un cuento'] },
                    { day: 'Viernes', items: ['Repaso', 'Vocabulario', 'Ejercicios', '5 mensajes al tutor'] },
                    { day: 'Sábado', items: ['Repaso', 'Escritura y habla', 'Checkpoint', 'Práctica libre'] },
                    { day: 'Domingo', items: ['Repaso', 'Relee tu libreta', 'Un cuento'] },
                ],
            },
        },
        useGoal: goal => `Usar esta meta: ${goal} ${goal === 1 ? 'actividad' : 'actividades'} al día`,
        isGoal: goal => `Es tu meta: ${goal} ${goal === 1 ? 'actividad' : 'actividades'} al día`,
        goalSaved: 'Listo. Tu meta del inicio ya cambió.',
        goalError: 'No se pudo guardar tu meta. Inténtalo otra vez.',
    },
    notebook: {
        body: 'Tu libreta guarda lo que escribes y el lugar donde lo escribiste. Escribir con tus palabras te obliga a entender, y lo que entiendes no se te olvida.',
        whatTitle: 'Lo que vale la pena anotar',
        exampleLabel: 'Ejemplo de nota',
        items: [
            {
                title: 'La regla, con tus palabras',
                body: 'No copies la explicación: resúmela como se la contarías a alguien.',
                example: { place: 'Unidad 1 · Gramática', lines: ['• I am, you are, he/she/it is', '• Con «I» siempre va «am»'] },
            },
            {
                title: 'Un ejemplo tuyo',
                body: 'Una frase de tu vida con la regla nueva. Es la que vas a recordar.',
                example: { place: 'Unidad 3 · Gramática', lines: ['I work in Irapuato. I start at eight.', 'Trabajo en Irapuato. Entro a las ocho.'] },
            },
            {
                title: 'Lo que repites mal',
                body: 'Si un error te sale dos veces, anótalo junto con la forma correcta.',
                example: { place: 'Laboratorio de errores', quote: 'She have a car.', lines: ['Con he, she e it va «has», no «have».', 'She has a car.'] },
            },
            {
                title: 'Frases que vas a usar',
                body: 'Las que te sirven en tu trabajo o en tu día, aunque todavía no entiendas toda su gramática.',
                example: { place: 'Tutor IA', lines: ['Could you send me the file? = ¿Me puedes mandar el archivo?'] },
            },
            {
                title: 'Tus dudas',
                body: 'Lo que no te quedó claro, para preguntárselo al tutor.',
                example: { place: 'Unidad 4 · Historia', quote: 'Does she like coffee?', lines: ['¿Cuándo va «does» y cuándo «do»? Preguntarle al tutor.'] },
            },
        ],
        howTitle: 'Cómo anotar rápido',
        how: [
            'Selecciona un texto de cualquier pantalla y toca «Anotar»: se guarda como cita.',
            'En una palabra del glosario, toca «Guardar en la libreta».',
            'Una vez por semana, relee tus notas. Es el mejor repaso de gramática que hay.',
        ],
    },
    end: {
        title: 'Empieza hoy',
        body: 'No necesitas entenderlo todo para empezar. Elige tu plan, haz tu primer paso y vuelve mañana.',
        action: 'Ir a mi ruta',
    },
};

const en: GuideText = {
    title: 'How to learn with Voxie',
    lead: 'Everything you need to start and keep going, in the order you will use it.',
    contents: 'In this guide',
    chapters: {
        what: 'What Voxie is',
        start: 'Where to start',
        path: 'Your path',
        day: 'Your day in Voxie',
        tools: 'Your tools',
        method: 'How to study',
        notebook: 'What to write in your notebook',
    },
    what: {
        body: [
            'Voxie takes you from zero English up to level B2, the one many jobs and exams ask for. You learn with short units, stories with audio, an AI tutor and reviews that come back just as you are about to forget.',
            'Your progress shows as a garden: each level is a stage of your plant, each unit you finish is a new plant and studying every day waters it.',
        ],
        stages: {
            A1: 'The basics: greeting, introducing yourself, talking about you and your day.',
            A2: 'Simple conversations: shopping, travel, plans and what you did yesterday.',
            B1: 'You get by at work and when travelling: you tell experiences and give your opinion.',
            B2: 'You talk with ease about almost any topic and understand long texts.',
            
        },
    },
    start: {
        body: 'Choose by what you know today. Both lead to the same place: unit 1 of your path.',
        options: [
            {
                title: 'I have never studied English',
                body: 'Start with First steps: five short lessons without grammar, with greetings, numbers, colors and days, the sounds of English and useful phrases. All with audio and in Spanish.',
                action: 'Go to First steps',
                to: '/primeros-pasos',
            },
            {
                title: 'I already know some English',
                body: 'Take the placement test in the Simulator to see where you are. Then follow your path: what you already know will go fast and work as review.',
                action: 'Go to the Simulator',
                to: '/review/simulator',
            },
        ],
    },
    path: {
        body: 'Your path has four levels. Each one is a series of units that open in order and ends with an exam.',
        level: units => `${units} units and an exam`,
        stepsTitle: 'The six steps of a unit',
        steps: {
            grammar: { name: 'Grammar', body: 'The unit\'s rule explained in Spanish, with examples you can hear. Words with a dotted underline explain themselves when tapped.' },
            story: { name: 'Story', body: 'The unit\'s stories, which use that rule. Tap any word to see what it means there; in A1 each sentence comes with its translation.' },
            vocab: { name: 'Vocabulary', body: 'The unit\'s key words, with audio and pronunciation. They go to your review.' },
            exercises: { name: 'Exercises', body: 'Fill in, put in order, choose and understand what you hear.' },
            output: { name: 'Writing and speaking', body: 'You write a few sentences and read or answer aloud. The AI corrects you at your level. If you can\'t speak right then, leave speaking for later.' },
            checkpoint: { name: 'Checkpoint', body: 'The unit\'s final test. When you pass it, your plant grows.' },
        },
        rulesTitle: 'To move on',
        rules: p => [
            `You need ${p.exercises}% in exercises and writing, ${p.speaking}% in speaking and ${p.checkpoint}% in the checkpoint.`,
            `If you fall short, Voxie shows you the rule and what you missed, and you try again. After try ${p.tries} you can move on, except in the checkpoint.`,
            `The end-of-level exam opens when every unit is done. With ${p.exam}% or more you open the next level.`,
            'Speaking you left for later must be finished before the exam.',
        ],
    },
    day: {
        body: 'Every day you have a goal of 1 to 3 activities. They are the drops on your home screen: fill them and your garden is watered.',
        countsTitle: 'One activity is',
        counts: ['A step of a unit', 'A story read', 'Every 10 review cards', 'Every 5 messages to the tutor'],
        streakTitle: 'Your streak',
        streak: [
            'It counts the days in a row you study.',
            `Every ${FREEZE_EVERY_DAYS} days of streak you earn a freeze; you can hold up to ${FREEZE_MAX}. If you miss a day, one is spent on its own and your streak goes on.`,
            'Change your goal in Settings or with your plan, in «How to study».',
        ],
    },
    tools: {
        body: 'Besides your path, Voxie has tools to practise at your own pace. They are in the menu.',
        open: 'Open',
        when: 'When',
        openNotebook: 'Open the notebook',
        items: {
            review: {
                name: 'Review',
                body: 'Word and grammar cards that come back just before you forget them. You say how well you remembered and Voxie decides when to show it again.',
                when: 'Every day, before anything else.',
            },
            stories: {
                name: 'Stories',
                body: 'Stories at your level with audio. Every word you tap can go to your review.',
                when: 'When you finish the day\'s step and want more.',
            },
            lab: {
                name: 'Error lab',
                body: 'Your writing and speaking mistakes turned into practice: you see the mistake, build the right sentence and test yourself.',
                when: 'When your home screen says you have mistakes to review.',
            },
            tutor: {
                name: 'AI tutor',
                body: 'A conversation in English at your level, with corrections. The free plan has a daily message limit.',
                when: 'After a unit, to use what you learned.',
            },
            practice: {
                name: 'Practice',
                body: 'Free writing and speaking, with the AI\'s correction and your history.',
                when: 'When you want to write or talk about what you choose.',
            },
            simulator: {
                name: 'Simulator',
                body: 'The placement test and TOEFL, IELTS and Cambridge B1 and B2 mock exams.',
                when: 'At the start, to learn your level, and before a real exam.',
            },
            notebook: {
                name: 'Notebook',
                body: 'Your notes, always at hand: on a computer in the sidebar (Alt + N) and on a phone in the bubble at the edge.',
                when: 'Whenever something is worth remembering.',
            },
            glossary: {
                name: 'Glossary',
                body: 'Grammar words with a dotted underline (subject, verb, participle) explain themselves when tapped.',
                when: 'When an explanation uses a word you don\'t know.',
            },
        },
    },
    method: {
        body: 'Voxie makes the plan; you bring the habit. This is what helps most:',
        principles: [
            { title: 'A little, every day', body: 'Ten minutes every day go further than an hour on Sunday: you remember better what you review on different days.' },
            { title: 'Review first', body: 'The cards Voxie asks for today are the ones you are about to forget. Reviewing them on time makes them stick.' },
            { title: 'Hear everything and say it aloud', body: 'Tap the speaker before reading a sentence and repeat it. Your ear learns before your mouth.' },
            { title: 'Spanish is support, not a crutch', body: 'In A1 read with «Show Spanish». From A2, read without the translation first and open it only to check.' },
            { title: 'Make mistakes without fear', body: 'Write and speak even if you are not sure. Every mistake the AI marks goes to your lab, and what you get wrong is what you learn best.' },
            { title: 'Don\'t move on without understanding', body: 'If you don\'t pass an exercise, read the review Voxie shows you before trying again.' },
        ],
        planTitle: 'Your plan',
        planLead: 'How much time do you have a day? Choose and we\'ll set up your week.',
        planLabel: 'Time a day',
        minutes: n => `${n} min`,
        plans: {
            10: {
                summary: 'One step of your unit each day. That way you close a unit a week.',
                days: [
                    { day: 'Monday', items: ['Review', 'Grammar'] },
                    { day: 'Tuesday', items: ['Review', 'Story'] },
                    { day: 'Wednesday', items: ['Review', 'Vocabulary'] },
                    { day: 'Thursday', items: ['Review', 'Exercises'] },
                    { day: 'Friday', items: ['Review', 'Writing and speaking'] },
                    { day: 'Saturday', items: ['Review', 'Checkpoint'] },
                    { day: 'Sunday', items: ['Review', 'Reread your notebook'] },
                ],
            },
            20: {
                summary: 'One step of your unit and something to use English: a story, the tutor or your lab. A unit a week, with more practice.',
                days: [
                    { day: 'Monday', items: ['Review', 'Grammar', 'A story'] },
                    { day: 'Tuesday', items: ['Review', 'Story', 'Write the rule in your notebook'] },
                    { day: 'Wednesday', items: ['Review', 'Vocabulary', 'A story'] },
                    { day: 'Thursday', items: ['Review', 'Exercises', 'Error lab'] },
                    { day: 'Friday', items: ['Review', 'Writing and speaking', '5 messages to the tutor'] },
                    { day: 'Saturday', items: ['Review', 'Checkpoint', 'A story'] },
                    { day: 'Sunday', items: ['Review', 'Reread your notebook'] },
                ],
            },
            40: {
                summary: 'Two steps a day and free practice. You close a unit every three days: two a week.',
                days: [
                    { day: 'Monday', items: ['Review', 'Grammar', 'Story', '5 messages to the tutor'] },
                    { day: 'Tuesday', items: ['Review', 'Vocabulary', 'Exercises', 'A story'] },
                    { day: 'Wednesday', items: ['Review', 'Writing and speaking', 'Checkpoint', 'Error lab'] },
                    { day: 'Thursday', items: ['Review', 'Grammar', 'Story', 'A story'] },
                    { day: 'Friday', items: ['Review', 'Vocabulary', 'Exercises', '5 messages to the tutor'] },
                    { day: 'Saturday', items: ['Review', 'Writing and speaking', 'Checkpoint', 'Free practice'] },
                    { day: 'Sunday', items: ['Review', 'Reread your notebook', 'A story'] },
                ],
            },
        },
        useGoal: goal => `Use this goal: ${goal} ${goal === 1 ? 'activity' : 'activities'} a day`,
        isGoal: goal => `It's your goal: ${goal} ${goal === 1 ? 'activity' : 'activities'} a day`,
        goalSaved: 'Done. Your home screen goal has changed.',
        goalError: 'Your goal could not be saved. Try again.',
    },
    notebook: {
        body: 'Your notebook keeps what you write and where you wrote it. Writing in your own words makes you understand, and what you understand stays.',
        whatTitle: 'What is worth writing down',
        exampleLabel: 'Example note',
        items: [
            {
                title: 'The rule, in your words',
                body: 'Don\'t copy the explanation: sum it up as you would tell someone.',
                example: { place: 'Unit 1 · Grammar', lines: ['• I am, you are, he/she/it is', '• With «I» it\'s always «am»'] },
            },
            {
                title: 'An example of yours',
                body: 'A sentence from your life with the new rule. It\'s the one you will remember.',
                example: { place: 'Unit 3 · Grammar', lines: ['I work in Irapuato. I start at eight.'] },
            },
            {
                title: 'What you keep getting wrong',
                body: 'If a mistake shows up twice, write it down with the right form.',
                example: { place: 'Error lab', quote: 'She have a car.', lines: ['With he, she and it it\'s «has», not «have».', 'She has a car.'] },
            },
            {
                title: 'Phrases you will use',
                body: 'The ones that help at work or in your day, even if you don\'t understand all their grammar yet.',
                example: { place: 'AI tutor', lines: ['Could you send me the file?'] },
            },
            {
                title: 'Your questions',
                body: 'What wasn\'t clear, to ask the tutor.',
                example: { place: 'Unit 4 · Story', quote: 'Does she like coffee?', lines: ['When is it «does» and when «do»? Ask the tutor.'] },
            },
        ],
        howTitle: 'How to take notes fast',
        how: [
            'Select text on any screen and tap «Note it»: it\'s saved as a quote.',
            'On a glossary word, tap «Save to notebook».',
            'Once a week, reread your notes. It\'s the best grammar review there is.',
        ],
    },
    end: {
        title: 'Start today',
        body: 'You don\'t need to understand everything to start. Choose your plan, take your first step and come back tomorrow.',
        action: 'Go to my path',
    },
};

export const guideText: Record<GuideLanguage, GuideText> = { es, en };

export const CHAPTERS: ChapterId[] = ['what', 'start', 'path', 'day', 'tools', 'method', 'notebook'];
export const STEP_ORDER: StepKey[] = ['grammar', 'story', 'vocab', 'exercises', 'output', 'checkpoint'];
export const TOOL_ORDER: ToolKey[] = ['review', 'stories', 'lab', 'tutor', 'practice', 'simulator', 'notebook', 'glossary'];

export const guideLanguage = (language: string | undefined): GuideLanguage => (language?.startsWith('en') ? 'en' : 'es');
