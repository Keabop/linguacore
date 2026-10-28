// TOEFL iBT Writing and Speaking (format of January 2026), all original. Writing opens with
// ten Build a Sentence items (scored with the questions, as part of Writing), then the email
// and the academic discussion. Speaking has seven Listen and Repeat sentences, heard once and
// never shown, and a four-question interview.
import type { AssessmentQuestion, ExamLevel, ExamSpeakingTask, ExamWritingTask } from '../../../lib/exam/types';

const BUILD = 'Build a Sentence';

/**
 * Build a Sentence: a classmate's line and the chunks of the reply, listed out of order. Each
 * set of chunks is written so that only one order is grammatical, since the answer is checked
 * against a single sentence; the tests can only check that the chunks make up that sentence.
 */
const build = (n: number, said: string, pieces: string[], answer: string, level: ExamLevel): AssessmentQuestion => ({
    id: `toefl_w_build_${n}`, section: 'use-of-english', level, task: BUILD, kind: 'build-sentence',
    text: `Your classmate says: "${said}"`, pieces, answer,
});

export const toeflBuildSentence: AssessmentQuestion[] = [
    build(1, 'What did you think of the lecture?', ['than', 'much', 'It was', 'I expected', 'interesting', 'more'], 'It was much more interesting than I expected.', 'B1'),
    build(2, 'Where is the conference being held this year?', ['in', 'being', 'science building', 'It is', 'the new', 'held'], 'It is being held in the new science building.', 'B1'),
    build(3, 'Have you finished the reading for Thursday?', ['it tonight', 'am planning', 'Not yet,', 'to finish', 'but I'], 'Not yet, but I am planning to finish it tonight.', 'B1'),
    build(4, 'Do you know when the library closes?', ['it closes', 'what', 'I have', 'time', 'no idea'], 'I have no idea what time it closes.', 'B1'),
    build(5, 'Why did you choose to study engineering?', ['work', 'figuring out', 'I have', 'how things', 'always enjoyed'], 'I have always enjoyed figuring out how things work.', 'B2'),
    build(6, 'Does the professor accept late assignments?', ['accept any', 'she', 'late work', 'She told us', 'would not'], 'She told us she would not accept any late work.', 'B2'),
    build(7, 'How was your trip to the coast?', ['had to', 'so bad', 'early', 'The weather was', 'come home', 'that we'], 'The weather was so bad that we had to come home early.', 'B2'),
    build(8, 'Is the new café on campus any good?', ['are', 'The coffee is great,', 'although', 'rather high', 'the prices'], 'The coffee is great, although the prices are rather high.', 'B2'),
    build(9, "Who is going to present our group's findings?", ['happy', 'she', 'to do it', 'Maria said', 'would be'], 'Maria said she would be happy to do it.', 'B2'),
    build(10, 'Should we meet before the exam to review?', ['free', 'which day', 'That', 'you are', 'depends on'], 'That depends on which day you are free.', 'B2'),
];

export const toeflWriting: ExamWritingTask[] = [
    {
        id: 'w_toefl_email',
        title: 'Write an Email (7 minutes)',
        prompt: 'You recently joined a volunteer program at a local animal shelter, but the schedule you were given clashes with one of your classes. Write an email to the volunteer coordinator, Ms. Rivera. In your email, do the following:',
        points: [
            'Explain the problem with your schedule.',
            'Suggest a different time when you could help.',
            'Ask a question about the volunteer work.',
        ],
        targetWords: 'Unas 120 a 150 palabras',
        instructions: 'Escribe un email cortés y claro que cubra los tres puntos, con saludo y despedida. Cuentan la organización, la variedad del vocabulario y la corrección.',
    },
    {
        id: 'w_toefl_discussion',
        title: 'Write for an Academic Discussion (10 minutes)',
        prompt: "Your professor is teaching a class on education. Write a post responding to the professor's question. In your response, express and support your opinion and make a contribution to the discussion in your own words.",
        discussion: [
            {
                author: 'Dr. Okafor',
                role: 'professor',
                text: 'This week we have been looking at how technology is changing classrooms. Some people argue that students learn better when they take notes by hand, while others believe laptops and tablets make note-taking more effective. Which do you think is better for students, and why?',
            },
            {
                author: 'Hana',
                role: 'student',
                text: "I prefer typing my notes. I can write much faster on a laptop, so I don't miss important points, and later I can search my notes or reorganize them before an exam.",
            },
            {
                author: 'Leo',
                role: 'student',
                text: "I think handwriting is better. When I write by hand I can't copy every word, so I have to think about what the professor means and summarize it. That helps me remember the ideas.",
            },
        ],
        targetWords: 'Al menos 100 palabras',
        instructions: 'Da tu opinión con razones y un ejemplo. Aporta una idea propia que no repita las de Hana y Leo, aunque puedes mencionarlas.',
    },
];

const REPEAT = [
    'Welcome to the city museum.',
    'Please leave your bags at the front desk.',
    'Our guided tours start every hour from the main entrance.',
    'The café is on the second floor, next to the gift shop.',
    "Photography is allowed in most rooms, but please don't use a flash.",
    "If you'd like to see the new exhibition, you'll need a separate ticket.",
    "Before you leave, we'd be grateful if you could fill in a short survey about your visit.",
];

const INTERVIEW = [
    'Thank you for taking part in our study about how people spend their free time. To begin, what do you usually do on the weekend?',
    'Do you prefer to spend your free time alone or with other people? Why?',
    'Some people say that smartphones have made free time less relaxing. Do you agree or disagree?',
    'In the future, do you think people will have more free time or less? Explain your view.',
];

export const toeflSpeaking: ExamSpeakingTask[] = [
    ...REPEAT.map((prompt, i): ExamSpeakingTask => ({
        id: `s_toefl_repeat_${i + 1}`,
        title: `Listen and Repeat (${i + 1} of ${REPEAT.length})`,
        prompt,
        listenOnly: true,
        instructions: 'Eres guía en un museo y practicas lo que dirás a los visitantes. Escucha la oración una sola vez y repítela exactamente igual.',
        // Longer sentences get a little more time, as in the exam (8–12 seconds)
        timeSeconds: prompt.split(' ').length > 10 ? 12 : 8,
    })),
    ...INTERVIEW.map((prompt, i): ExamSpeakingTask => ({
        id: `s_toefl_interview_${i + 1}`,
        title: `Take an Interview (${i + 1} of ${INTERVIEW.length})`,
        prompt,
        instructions: 'Responde de forma natural durante unos 45 segundos, con razones y ejemplos. No hay tiempo de preparación.',
        timeSeconds: 45,
    })),
];
