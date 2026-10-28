// IELTS Academic Writing (Task 1 with its chart, Task 2 essay) and Speaking (parts 1–3).
// The cities and figures of Task 1 are invented for the exercise, as in practice tests.
import type { ExamSpeakingTask, ExamWritingTask } from '../../../lib/exam/types';

export const ieltsWriting: ExamWritingTask[] = [
    {
        id: 'w_ielts_1',
        title: 'Task 1: describe a chart (20 minutes)',
        prompt: 'The line graph shows the percentage of commuters who cycled to work in four cities between 2005 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        targetWords: 'Al menos 150 palabras',
        instructions: 'Escribe un informe objetivo: empieza con una visión general de las tendencias principales, compara las ciudades con cifras concretas y no des opiniones.',
        chart: {
            kind: 'line',
            title: 'Commuters cycling to work (%)',
            unit: '%',
            categories: ['2005', '2010', '2015', '2020', '2025'],
            series: [
                { name: 'Northport', values: [4, 6, 9, 14, 18] },
                { name: 'Eastvale', values: [12, 11, 10, 9, 9] },
                { name: 'Westbridge', values: [2, 3, 3, 7, 12] },
                { name: 'Southam', values: [8, 8, 8, 10, 10] },
            ],
        },
    },
    {
        id: 'w_ielts_2',
        title: 'Task 2: essay (40 minutes)',
        prompt: 'Some people believe that cities should spend money on public transport rather than on building new roads. Others think that new roads are still necessary. Discuss both views and give your own opinion.',
        targetWords: 'Al menos 250 palabras',
        instructions: 'Presenta las dos posturas con razones y ejemplos, da tu opinión con claridad y organiza el texto en párrafos con introducción y conclusión.',
    },
];

export const ieltsSpeaking: ExamSpeakingTask[] = [
    {
        id: 's_ielts_1',
        title: 'Part 1: interview (4–5 minutes)',
        prompt: "Let's talk about where you live. Do you live in a house or an apartment? What do you like most about your neighbourhood? How do people usually travel around your town?",
        instructions: 'Responde cada pregunta con dos o tres oraciones completas, dando razones o ejemplos.',
        timeSeconds: 120,
    },
    {
        id: 's_ielts_2',
        title: 'Part 2: long turn (3–4 minutes)',
        prompt: 'Describe a journey you remember well.',
        cueCard: ['where you went', 'how you travelled', 'who you were with', 'and explain why you remember this journey'],
        instructions: 'Tienes un minuto para preparar notas y luego habla entre uno y dos minutos sin detenerte, cubriendo todos los puntos.',
        timeSeconds: 120,
    },
    {
        id: 's_ielts_3',
        title: 'Part 3: discussion (4–5 minutes)',
        prompt: 'Why do you think some people prefer to travel by car even when public transport is available? How might the way people travel change in the next twenty years?',
        instructions: 'Desarrolla ideas abstractas: compara, especula y justifica tus opiniones con ejemplos.',
        timeSeconds: 120,
    },
];
