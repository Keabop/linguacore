import i18n from '../../i18n/config';
import type { Unit } from '../../lib/db';

// A1 and A2 units in Spanish: whoever starts can't read «Introducing Yourself» yet. B1 and B2
// keep their English names, as their learners do. Exams take their title from the interface.
const SPANISH: Record<string, { title: string; topic: string }> = {
    'a1-u1': { title: 'Preséntate', topic: 'El verbo «to be» (ser, estar) y los pronombres' },
    'a1-u2': { title: 'Las cosas a mi alrededor', topic: 'Artículos (a, an, the) y this / that' },
    'a1-u3': { title: 'Mi día a día', topic: 'Presente simple: lo que haces' },
    'a1-u4': { title: '¿Qué te gusta?', topic: 'Presente simple: negar y preguntar, y qué tan seguido' },
    'a1-u5': { title: '¿Dónde está?', topic: 'There is / there are (hay) y dónde están las cosas' },
    'a1-u6': { title: '¡Sí puedo!', topic: "Can / can't (poder) y dar indicaciones" },
    'a1-u7': { title: 'En el mercado', topic: 'Lo que se cuenta y lo que no, con some / any' },
    'a2-u1': { title: '¿Qué hiciste ayer?', topic: 'Pasado simple: verbos regulares' },
    'a2-u2': { title: 'Historias de viaje', topic: 'Pasado simple: verbos irregulares, negar y preguntar' },
    'a2-u3': { title: '¿Qué estás haciendo?', topic: 'Presente continuo: ahora y de costumbre' },
    'a2-u4': { title: 'Mis planes', topic: 'Going to: planes a futuro' },
    'a2-u5': { title: 'Más grande, mejor, el mejor', topic: 'Comparar: más que y el más' },
    'a2-u6': { title: 'Reglas y consejos', topic: 'Must, have to y should: obligación y consejo' },
    'a2-u7': { title: 'Para ti, de mí', topic: 'Pronombres de objeto y posesivos' },
    'a2-u8': { title: '¿Qué va a pasar?', topic: 'Primer condicional: if + presente → will' },
    'a2-u9': { title: 'Contar historias', topic: 'Adverbios de modo (cómo se hace algo) y pasado continuo' },
};

const spanish = (unit: Pick<Unit, 'id'>) => (i18n.language?.startsWith('en') ? undefined : SPANISH[unit.id]);

/** The unit's name in the interface's language when it has one. */
export const unitTitle = (unit: Pick<Unit, 'id' | 'title'>): string => spanish(unit)?.title ?? unit.title;

/** What the unit's grammar is about, in the interface's language when it has one. */
export const unitTopic = (unit: Pick<Unit, 'id' | 'grammarTopic'>): string => spanish(unit)?.topic ?? unit.grammarTopic;
