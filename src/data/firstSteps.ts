// «Primeros pasos», the unit 0: for whoever starts from zero, before unit 1 and without grammar.
// Five short lessons of phrases, each heard, translated and practiced by listening and meaning.
// Optional: it never locks unit 1 nor the A1 exam (cerebro/producto/plan-principiante-desde-cero.md).
import type { Pair } from '../lib/comprehension';

export interface FirstStepsLesson {
    id: string;
    title: string;
    intro: string;
    items: Pair[];
    tip?: string;
    /** How the practice asks: the sounds lesson is only listened to. */
    practice: { meaning: number; listen: number };
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
            { en: 'My name is Rosa.', es: 'Me llamo Rosa.' },
            { en: 'What is your name?', es: '¿Cómo te llamas?' },
            { en: 'Nice to meet you.', es: 'Mucho gusto.' },
            { en: 'How are you?', es: '¿Cómo estás?' },
            { en: 'I am fine, thank you.', es: 'Estoy bien, gracias.' },
            { en: 'Goodbye!', es: '¡Adiós!' },
            { en: 'See you tomorrow!', es: '¡Nos vemos mañana!' },
        ],
        tip: 'En inglés «Good night» sólo se usa para despedirse. Para saludar en la noche se dice «Good evening».',
        practice: { meaning: 3, listen: 3 },
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
    },
    {
        id: 'sounds',
        title: 'Cómo suena el inglés',
        intro: 'En inglés las letras no siempre suenan como en español. Escucha cada palabra y fíjate en la letra marcada.',
        items: [
            { en: 'house', es: 'casa. La «h» suena como una «j» suave.' },
            { en: 'hello', es: 'hola. La «h» otra vez suena como «j» suave.' },
            { en: 'yes', es: 'sí. La «y» suena como en español.' },
            { en: 'job', es: 'trabajo. La «j» suena como «y» fuerte.' },
            { en: 'water', es: 'agua. La «w» suena como «u».' },
            { en: 'three', es: 'tres. La «th» suena con la lengua entre los dientes.' },
            { en: 'see', es: 'ver. La doble «e» suena como una «i» larga.' },
            { en: 'food', es: 'comida. La doble «o» suena como una «u» larga.' },
            { en: 'know', es: 'saber. La «k» del principio no suena.' },
            { en: 'hour', es: 'hora. Aquí la «h» no suena.' },
        ],
        tip: 'No te preocupes si al principio suena raro: escuchar y repetir muchas veces es lo que más ayuda.',
        practice: { meaning: 0, listen: 5 },
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
    },
];
