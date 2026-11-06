// «Primeros pasos», the unit 0: for whoever starts from zero, before unit 1 and without grammar.
// Five short lessons: phrases and a short dialogue, all heard and translated; words for the review;
// practice by listening, meaning and building sentences; and phrases to say aloud.
// Optional: it never locks unit 1 nor the A1 exam (cerebro/producto/plan-principiante-desde-cero.md).
import type { GuidedSentence, Pair } from '../lib/comprehension';

/** A line of a lesson's dialogue, said by one of two people. */
export interface DialogueLine {
    who: string;
    en: string;
    es: string;
}

export interface FirstStepsLesson {
    id: string;
    title: string;
    intro: string;
    /** `note`: what to notice in how it sounds, shown apart from what it means. */
    items: Pair[];
    tip?: string;
    /** How the practice asks: the sounds lesson is only listened to. */
    practice: { meaning: number; listen: number };
    /** The phrases in use, as two people would say them. */
    dialogue: DialogueLine[];
    /** Words of the A1 deck this lesson teaches, to add to the review. */
    words: string[];
    /** Sentences to write: built from their words, or one word typed into the gap. */
    writing: GuidedSentence[];
    /** Said aloud at the end, optional (no microphone, or not the place to speak). */
    repeat: string[];
}

/** Stored as a unit of its own: no list of units of A1 includes it, so nothing counts it. */
export const FIRST_STEPS_UNIT = 'a1-u0';

export const firstStepsLessons: FirstStepsLesson[] = [
    {
        id: 'greetings',
        title: 'Saludar y presentarte',
        intro: 'Lo primero que se dice al conocer a alguien. Toca la bocina, escucha y repítelo en voz alta.',
        items: [
            { en: 'Hello!', es: '¡Hola!' },
            { en: 'Good morning!', es: '¡Buenos días!' },
            { en: 'Good afternoon!', es: '¡Buenas tardes!' },
            { en: 'Good night!', es: '¡Buenas noches! (al despedirte)' },
            { en: 'Good evening!', es: '¡Buenas noches! (al saludar)' },
            { en: 'My name is Rosa.', es: 'Me llamo Rosa.' },
            { en: 'What is your name?', es: '¿Cómo te llamas?' },
            { en: 'Nice to meet you.', es: 'Mucho gusto.' },
            { en: 'How are you?', es: '¿Cómo estás?' },
            { en: 'I am fine, thank you.', es: 'Estoy bien, gracias.' },
            { en: 'Goodbye!', es: '¡Adiós!' },
            { en: 'See you tomorrow!', es: '¡Nos vemos mañana!' },
        ],
        tip: 'En inglés hay dos «buenas noches»: «Good evening» para saludar y «Good night» sólo para despedirse.',
        practice: { meaning: 3, listen: 3 },
        dialogue: [
            { who: 'Ana', en: 'Hello! Good morning.', es: '¡Hola! Buenos días.' },
            { who: 'Tom', en: 'Good morning! How are you?', es: '¡Buenos días! ¿Cómo estás?' },
            { who: 'Ana', en: 'I am fine, thank you. My name is Ana.', es: 'Estoy bien, gracias. Me llamo Ana.' },
            { who: 'Tom', en: 'Nice to meet you, Ana. My name is Tom.', es: 'Mucho gusto, Ana. Me llamo Tom.' },
            { who: 'Ana', en: 'Nice to meet you, Tom. See you tomorrow!', es: 'Mucho gusto, Tom. ¡Nos vemos mañana!' },
            { who: 'Tom', en: 'Goodbye!', es: '¡Adiós!' },
        ],
        words: ['hello', 'good morning', 'good afternoon', 'good night', 'name', 'nice', 'meet', 'fine', 'thanks', 'tomorrow'],
        writing: [
            { en: 'My name is Rosa.', es: 'Me llamo Rosa.' },
            { en: 'Nice to meet you.', es: 'Mucho gusto.', blank: 'meet' },
            { en: 'How are you?', es: '¿Cómo estás?' },
        ],
        repeat: ['Hello!', 'My name is Rosa.', 'Nice to meet you.'],
    },
    {
        id: 'numbers',
        title: 'Los números del 0 al 20',
        intro: 'Para decir tu edad, un precio o tu teléfono. Escucha cada número y cuéntalos en voz alta.',
        items: [
            { en: 'zero', es: '0, cero' }, { en: 'one', es: '1, uno' }, { en: 'two', es: '2, dos' },
            { en: 'three', es: '3, tres' }, { en: 'four', es: '4, cuatro' }, { en: 'five', es: '5, cinco' },
            { en: 'six', es: '6, seis' }, { en: 'seven', es: '7, siete' }, { en: 'eight', es: '8, ocho' },
            { en: 'nine', es: '9, nueve' }, { en: 'ten', es: '10, diez' }, { en: 'eleven', es: '11, once' },
            { en: 'twelve', es: '12, doce' }, { en: 'thirteen', es: '13, trece' }, { en: 'fourteen', es: '14, catorce' },
            { en: 'fifteen', es: '15, quince' }, { en: 'sixteen', es: '16, dieciséis' }, { en: 'seventeen', es: '17, diecisiete' },
            { en: 'eighteen', es: '18, dieciocho' }, { en: 'nineteen', es: '19, diecinueve' }, { en: 'twenty', es: '20, veinte' },
        ],
        tip: 'Del 13 al 19 terminan en «-teen». Fíjate en la diferencia: «thirteen» (13) y «thirty» (30).',
        practice: { meaning: 3, listen: 3 },
        dialogue: [
            { who: 'Luis', en: 'What is your phone number?', es: '¿Cuál es tu número de teléfono?' },
            { who: 'Rosa', en: 'It is five, five, three, two, one, eight.', es: 'Es cinco, cinco, tres, dos, uno, ocho.' },
            { who: 'Luis', en: 'Thank you. How old are you?', es: 'Gracias. ¿Cuántos años tienes?' },
            { who: 'Rosa', en: 'I am fifty-six. And you?', es: 'Tengo cincuenta y seis. ¿Y tú?' },
            { who: 'Luis', en: 'I am twenty.', es: 'Tengo veinte.' },
        ],
        words: ['number', 'phone', 'age'],
        writing: [
            { en: 'I am twenty.', es: 'Tengo veinte años.' },
            { en: 'What is your phone number?', es: '¿Cuál es tu número de teléfono?', blank: 'number' },
            { en: 'How old are you?', es: '¿Cuántos años tienes?' },
        ],
        repeat: ['one, two, three', 'I am twenty.', 'fifteen'],
    },
    {
        id: 'colors-days',
        title: 'Colores y días de la semana',
        intro: 'Palabras que vas a ver en todas partes. Los días en inglés siempre empiezan con mayúscula.',
        items: [
            { en: 'red', es: 'rojo' }, { en: 'blue', es: 'azul' }, { en: 'green', es: 'verde' },
            { en: 'yellow', es: 'amarillo' }, { en: 'white', es: 'blanco' }, { en: 'black', es: 'negro' },
            { en: 'orange', es: 'naranja' }, { en: 'brown', es: 'café' },
            { en: 'Monday', es: 'lunes' }, { en: 'Tuesday', es: 'martes' }, { en: 'Wednesday', es: 'miércoles' },
            { en: 'Thursday', es: 'jueves' }, { en: 'Friday', es: 'viernes' }, { en: 'Saturday', es: 'sábado' },
            { en: 'Sunday', es: 'domingo' },
        ],
        tip: '«Wednesday» se escribe con una «d» que no suena: se dice «uénsdei».',
        practice: { meaning: 3, listen: 3 },
        dialogue: [
            { who: 'Ana', en: 'What day is it today?', es: '¿Qué día es hoy?' },
            { who: 'Tom', en: 'It is Monday.', es: 'Es lunes.' },
            { who: 'Ana', en: 'My English class is on Friday.', es: 'Mi clase de inglés es el viernes.' },
            { who: 'Tom', en: 'I like your bag. It is blue.', es: 'Me gusta tu bolsa. Es azul.' },
            { who: 'Ana', en: 'Thank you! Blue is my favorite color.', es: '¡Gracias! El azul es mi color favorito.' },
        ],
        words: ['red', 'blue', 'green', 'yellow', 'white', 'black', 'orange', 'brown', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'day', 'week', 'color'],
        writing: [
            { en: 'It is Monday.', es: 'Es lunes.' },
            { en: 'Blue is my favorite color.', es: 'El azul es mi color favorito.', blank: 'color' },
            { en: 'The car is red.', es: 'El coche es rojo.' },
        ],
        repeat: ['Monday', 'Wednesday', 'It is blue.'],
    },
    {
        id: 'sounds',
        title: 'Cómo suena el inglés',
        intro: 'En inglés las letras no siempre suenan como en español. Escucha cada palabra y fíjate en la letra marcada.',
        items: [
            { en: 'house', es: 'casa', note: 'La «h» suena como una «j» suave.' },
            { en: 'hello', es: 'hola', note: 'La «h» otra vez suena como «j» suave.' },
            { en: 'yes', es: 'sí', note: 'La «y» suena como en español.' },
            { en: 'job', es: 'trabajo', note: 'La «j» suena como «y» fuerte, como en «yo».' },
            { en: 'water', es: 'agua', note: 'La «w» suena como «u».' },
            { en: 'three', es: 'tres', note: 'La «th» suena con la lengua entre los dientes.' },
            { en: 'see', es: 'ver', note: 'La doble «e» suena como una «i» larga.' },
            { en: 'food', es: 'comida', note: 'La doble «o» suena como una «u» larga.' },
            { en: 'know', es: 'saber', note: 'La «k» del principio no suena.' },
            { en: 'hour', es: 'hora', note: 'Aquí la «h» no suena.' },
        ],
        tip: 'No te preocupes si al principio suena raro: escuchar y repetir muchas veces es lo que más ayuda.',
        practice: { meaning: 0, listen: 5 },
        dialogue: [
            { who: 'Ana', en: 'Hello! This is my house.', es: '¡Hola! Esta es mi casa.' },
            { who: 'Tom', en: 'Nice house! Water, please.', es: '¡Qué bonita casa! Agua, por favor.' },
            { who: 'Ana', en: 'Yes. The food is ready in one hour.', es: 'Sí. La comida está lista en una hora.' },
            { who: 'Tom', en: 'Thank you! See you!', es: '¡Gracias! ¡Nos vemos!' },
        ],
        words: ['house', 'water', 'food', 'hour', 'job', 'know', 'see', 'yes'],
        writing: [
            { en: 'This is my house.', es: 'Esta es mi casa.' },
            { en: 'Water, please.', es: 'Agua, por favor.', blank: 'Water' },
        ],
        repeat: ['house', 'three', 'water'],
    },
    {
        id: 'survival',
        title: 'Frases para salir del paso',
        intro: 'Con estas frases puedes pedir ayuda, dar las gracias y decir que no entendiste.',
        items: [
            { en: 'Please.', es: 'Por favor.' },
            { en: 'Thank you.', es: 'Gracias.' },
            { en: 'Sorry.', es: 'Perdón.' },
            { en: 'Excuse me.', es: 'Disculpe.' },
            { en: 'Yes.', es: 'Sí.' },
            { en: 'No.', es: 'No.' },
            { en: "I don't understand.", es: 'No entiendo.' },
            { en: 'Can you repeat, please?', es: '¿Puede repetirlo, por favor?' },
            { en: 'Slowly, please.', es: 'Más despacio, por favor.' },
            { en: "I don't speak English.", es: 'No hablo inglés.' },
            { en: 'How much is it?', es: '¿Cuánto cuesta?' },
            { en: 'Where is the bathroom?', es: '¿Dónde está el baño?' },
        ],
        tip: 'Si no entiendes algo, «Can you repeat, please?» y «Slowly, please» te salvan en cualquier lugar.',
        practice: { meaning: 3, listen: 3 },
        dialogue: [
            { who: 'Rosa', en: 'Excuse me. Where is the bathroom?', es: 'Disculpe. ¿Dónde está el baño?' },
            { who: 'Tom', en: 'It is over there, on the left.', es: 'Está allá, a la izquierda.' },
            { who: 'Rosa', en: "Sorry, I don't understand. Slowly, please.", es: 'Perdón, no entiendo. Más despacio, por favor.' },
            { who: 'Tom', en: 'Over there. On the left.', es: 'Allá. A la izquierda.' },
            { who: 'Rosa', en: 'Thank you!', es: '¡Gracias!' },
        ],
        words: ['please', 'sorry', 'thanks', 'bathroom', 'repeat', 'speak', 'help', 'slow'],
        writing: [
            { en: "I don't understand.", es: 'No entiendo.' },
            { en: 'Can you repeat, please?', es: '¿Puede repetirlo, por favor?', blank: 'repeat' },
            { en: 'Where is the bathroom?', es: '¿Dónde está el baño?' },
        ],
        repeat: ['Thank you.', "I don't understand.", 'Can you repeat, please?'],
    },
];

/** Every word of the lessons' phrases and dialogues, in lower case, for their pronunciation. */
export function firstStepsWords(): string[] {
    const texts = firstStepsLessons.flatMap(l => [...l.items.map(i => i.en), ...l.dialogue.map(d => d.en)]);
    return [...new Set(texts.flatMap(text => text.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean)))].sort();
}
