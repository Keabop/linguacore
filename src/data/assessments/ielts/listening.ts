// IELTS Listening: four original recordings (social and academic, dialogue and monologue),
// 40 questions. As in the exam, each part is played once for all its questions, the questions
// follow the order of the recording, and multiple-choice options are mentioned and ruled out
// in the script. `evidence` quotes the words that give each answer (checked by content.test.ts).
import type { AssessmentQuestion, DialogueLine, ExamLevel } from '../../../lib/exam/types';

type Q = AssessmentQuestion;
type Voice = Omit<DialogueLine, 'text'>;

const line = (voice: Voice, text: string): DialogueLine => ({ ...voice, text });

/** Every gap of a part shares one instruction, as in the exam. */
type GapRule = { maxWords: number; allowNumber: boolean };
const ONE_WORD_OR_NUMBER: GapRule = { maxWords: 1, allowNumber: true };
const ONE_WORD: GapRule = { maxWords: 1, allowNumber: false };

function partKit(n: number, dialogue: DialogueLine[], level: ExamLevel, rule: GapRule) {
    const base = (id: number) => ({ id: `ielts_l${n}_${id}`, section: 'listening' as const, level, dialogue, group: `ielts-listening-${n}` });
    return {
        gap: (id: number, text: string, answers: string[], evidence: string): Q =>
            ({ ...base(id), kind: 'gap', text, answers, ...rule, evidence }),
        mc: (id: number, text: string, options: string[], correctIndex: number, evidence: string): Q =>
            ({ ...base(id), text, options, correctIndex, evidence }),
    };
}

// ---------------------------------------------------------------- Part 1: booking a course (1–10)

const reception: Voice = { speaker: 'A', accent: 'UK', gender: 'female' };
const caller: Voice = { speaker: 'B', accent: 'US', gender: 'male' };

const PART1 = [
    line(reception, 'Good morning, Riverside Arts Centre. How can I help you?'),
    line(caller, "Hi, I'm calling about the evening pottery classes. Are there still places available?"),
    line(reception, "Yes, we have a few left for the spring term. Can I take some details? What's your name?"),
    line(caller, "It's Daniel Hargreaves."),
    line(reception, 'Could you spell your surname for me?'),
    line(caller, 'Sure. H, A, R, G, R, E, A, V, E, S.'),
    line(reception, "Thank you. And what's the best phone number to reach you on?"),
    line(caller, "It's oh seven nine four six, three eight one, two oh five."),
    line(reception, 'Great. The course runs on either Tuesday or Thursday evenings. Which would you prefer?'),
    line(caller, 'Thursday would be better. I play football on Tuesdays.'),
    line(reception, 'Thursday it is, then. Classes start at seven and finish at nine.'),
    line(caller, 'And how much does the course cost?'),
    line(reception, 'The full price is ninety-five pounds for ten weeks, but members pay seventy.'),
    line(caller, "I'm not a member, so ninety-five, then. Does that include materials?"),
    line(reception, "Clay and glazes are included, but you'll need to bring an apron."),
    line(caller, 'No problem. Where exactly are the classes held?'),
    line(reception, 'In the Studio, which is on the second floor, next to the library.'),
    line(caller, 'And when is the first class?'),
    line(reception, 'The term starts on the fourteenth of March.'),
    line(caller, 'Is there anywhere to park nearby?'),
    line(reception, "There's a car park behind the building. It's free after six in the evening."),
    line(caller, 'Perfect. How do I pay?'),
    line(reception, 'You can pay online or in person at reception. If you pay online, use the reference P, O, T, one, two.'),
    line(caller, "I'll do it online, then. Thanks very much."),
];

const p1 = partKit(1, PART1, 'B1', ONE_WORD_OR_NUMBER);

const part1: Q[] = [
    p1.gap(1, 'Name: Daniel ___', ['Hargreaves'], 'H, A, R, G, R, E, A, V, E, S'),
    p1.gap(2, 'Phone number: ___', ['07946 381 205', '07946381205'], 'oh seven nine four six, three eight one, two oh five'),
    p1.gap(3, 'Day of classes: ___', ['Thursday'], 'Thursday would be better'),
    p1.gap(4, 'Time: 7 p.m. to ___ p.m.', ['9', 'nine'], 'finish at nine'),
    p1.gap(5, 'Course fee for non-members: £___', ['95', 'ninety-five'], 'The full price is ninety-five pounds'),
    p1.gap(6, 'Students must bring their own ___', ['apron'], "you'll need to bring an apron"),
    p1.gap(7, 'Location: the Studio, second floor, next to the ___', ['library'], 'next to the library'),
    p1.gap(8, 'First class: ___ March', ['14', '14th', 'fourteenth'], 'the fourteenth of March'),
    p1.gap(9, 'Car park: free after ___ p.m.', ['6', 'six'], 'free after six in the evening'),
    p1.gap(10, 'Reference for online payment: ___', ['POT12'], 'use the reference P, O, T, one, two'),
];

// ---------------------------------------------------------------- Part 2: a museum welcome talk (11–20)

const guide: Voice = { speaker: 'A', accent: 'UK', gender: 'male' };

const PART2 = [
    line(guide, "Good morning, everyone, and welcome to the Harbour Science Museum. My name is Tom, and I'll tell you a little about the building and today's programme before you start exploring."),
    line(guide, 'The museum opened three years ago in an old warehouse. Many visitors assume it was a coal store, because of the dark marks on the walls, but in fact it was a warehouse for storing tea.'),
    line(guide, 'When the architects designed the conversion, the wooden floors were too damaged to save, so they had to be replaced. However, the architects decided to keep the original brick walls and the iron columns.'),
    line(guide, 'The ground floor is devoted to energy, and the most popular exhibit is the wind tunnel, where you can test model turbines. You don\'t need to pay anything extra for it, but places must be booked at the information desk.'),
    line(guide, "On the first floor you'll find our space gallery and the planetarium. Children under five aren't allowed into the planetarium. That's not because of the price or the length of the show; it's because the show is quite dark and loud. There's a soft play area for them right next door."),
    line(guide, 'The top floor houses our temporary exhibition, which at the moment is about the science of food. Entry is not included in the general ticket; it costs an extra four pounds.'),
    line(guide, 'A few practical points. Lockers are available in the basement for bags and coats. They take a one-pound coin, which you get back when you return the key.'),
    line(guide, "The café on the ground floor serves hot meals until two o'clock, and after that only sandwiches and cakes. If you'd prefer to eat your own food, there's a picnic room beside the main entrance."),
    line(guide, "Finally, at three o'clock today one of our scientists will give a demonstration on the science of sound in the lecture theatre. It's free, but seats are limited, so I'd recommend arriving ten minutes early. Right, enjoy your visit."),
];

const p2 = partKit(2, PART2, 'B1', ONE_WORD_OR_NUMBER);

const part2: Q[] = [
    p2.mc(11, 'What was the building used for before it became a museum?', ['Storing coal', 'Storing tea', 'Making cotton', 'Milling grain'], 1, 'it was a warehouse for storing tea'),
    p2.mc(12, 'What did the architects keep from the original building?', [
        'The wooden floors',
        'The brick walls and iron columns',
        'The original roof',
        'The loading cranes',
    ], 1, 'keep the original brick walls and the iron columns'),
    p2.mc(13, 'What must visitors do to use the wind tunnel?', [
        'Pay an extra fee',
        'Book at the information desk',
        'Bring their own model turbine',
        'Arrive before midday',
    ], 1, 'places must be booked at the information desk'),
    p2.mc(14, 'Why are children under five not allowed into the planetarium?', [
        'The tickets are too expensive.',
        'The show is too long.',
        'The show is dark and loud.',
        'The seats are too high.',
    ], 2, 'the show is quite dark and loud'),
    p2.mc(15, 'What does the guide say about the food exhibition?', [
        'It is included in the general ticket.',
        'It costs extra to enter.',
        'It opens next month.',
        'It is in the basement.',
    ], 1, 'it costs an extra four pounds'),
    p2.gap(16, 'Lockers in the basement take a one-pound ___.', ['coin'], 'They take a one-pound coin'),
    p2.gap(17, "Hot meals are served in the café until ___ o'clock.", ['2', 'two'], "hot meals until two o'clock"),
    p2.gap(18, 'Visitors can eat their own food in the ___ room.', ['picnic'], "there's a picnic room"),
    p2.gap(19, "Today's demonstration is about the science of ___.", ['sound'], 'the science of sound'),
    p2.gap(20, 'Visitors should arrive ___ minutes early for the demonstration.', ['10', 'ten'], 'arriving ten minutes early'),
];

// ---------------------------------------------------------------- Part 3: students plan a report (21–30)

const maya: Voice = { speaker: 'A', accent: 'UK', gender: 'female' };
const leo: Voice = { speaker: 'B', accent: 'US', gender: 'male' };

const PART3 = [
    line(maya, 'Leo, have you had a chance to look at the survey results for our project on reusable coffee cups?'),
    line(leo, "I have. I expected about half of the people to say they own a reusable cup, but it was far more than that: nearly seventy per cent."),
    line(maya, "Yes, but only about a quarter of them actually bring it to campus regularly. That's the gap we need to explain."),
    line(leo, 'The most common reason people gave was simply forgetting it at home.'),
    line(maya, "Right, and the second was that the cups are awkward to carry between lectures. I think that's the more interesting finding. Not because more people mentioned it, but because it's something the university could actually do something about."),
    line(leo, 'Like providing somewhere to wash and store cups on campus?'),
    line(maya, 'Exactly. Some universities in Scotland have introduced a cup library, where you borrow a cup at one café and return it at any other.'),
    line(leo, "I read about that. The cafés were happy to join, and students liked the design of the cups. The problem was that a lot of cups were never returned, so they started charging a small deposit."),
    line(maya, 'We should mention that in the discussion section. Now, our tutor said the methodology section was too short.'),
    line(leo, 'I think we need to explain why we used an online questionnaire rather than interviews.'),
    line(maya, "It wasn't really about cost, and the tutor didn't ask for it. Mainly, we wanted a large sample. We got three hundred and twelve responses, which we couldn't have managed with interviews."),
    line(leo, "And the sample size isn't the weakness, then. The weakness is that people who care about the environment were probably more likely to fill it in."),
    line(maya, 'True. We should admit that as a limitation. What about the price discount? The campus cafés give twenty pence off if you bring your own cup.'),
    line(leo, "Our data suggests that isn't enough to change behaviour. Most respondents said they'd need at least fifty pence."),
    line(maya, "I'm not sure we can recommend a bigger discount, though. The cafés would lose money."),
    line(leo, 'Fair point. So, instead, we recommend a charge on disposable cups. That worked well in a trial in Wales.'),
    line(maya, "Good idea. Let's divide up the writing. I'll do the literature review if you take the results."),
    line(leo, "Fine. And let's aim to have a full draft ready by next Friday, so the tutor can look at it before the deadline."),
];

const p3 = partKit(3, PART3, 'B2', ONE_WORD);

const part3: Q[] = [
    p3.mc(21, 'What proportion of respondents said they own a reusable cup?', ['About a quarter', 'About half', 'Nearly seventy per cent', 'Over ninety per cent'], 2, 'nearly seventy per cent'),
    p3.mc(22, 'Why does Maya find the second reason the more interesting finding?', [
        'It was the reason given most often.',
        'The university could do something about it.',
        'It surprised their tutor.',
        'It was connected to the price of coffee.',
    ], 1, "it's something the university could actually do something about"),
    p3.mc(23, 'What problem did the cup library in Scotland have?', [
        'Cafés refused to take part.',
        'Students disliked the design of the cups.',
        'Many cups were never returned.',
        'The deposit was too expensive.',
    ], 2, 'a lot of cups were never returned'),
    p3.mc(24, 'Why did the students use an online questionnaire?', [
        'It cost less than interviews.',
        'Their tutor asked for it.',
        'They wanted a large sample.',
        'Interviews were not allowed.',
    ], 2, 'we wanted a large sample'),
    p3.mc(25, 'Which limitation do they agree to mention?', [
        'The sample was too small.',
        'Some questions were unclear.',
        'People who care about the environment were more likely to respond.',
        'The survey took too long to complete.',
    ], 2, 'people who care about the environment were probably more likely to fill it in'),
    p3.mc(26, 'What will the students recommend?', [
        'A larger discount for reusable cups',
        'A charge on disposable cups',
        'Free reusable cups for every student',
        'Closing some campus cafés',
    ], 1, 'we recommend a charge on disposable cups'),
    p3.gap(27, 'A charge on disposable cups worked well in a trial in ___.', ['Wales'], 'a trial in Wales'),
    p3.gap(28, 'Maya will write the ___ review.', ['literature'], "I'll do the literature review"),
    p3.gap(29, 'Leo will write the section on the ___.', ['results'], 'if you take the results'),
    p3.gap(30, 'The full draft should be ready by next ___.', ['Friday'], 'a full draft ready by next Friday'),
];

// ---------------------------------------------------------------- Part 4: lecture on urban heat islands (31–40)

const lecturer: Voice = { speaker: 'A', accent: 'US', gender: 'female' };

const PART4 = [
    line(lecturer, "Today I'm going to talk about a phenomenon known as the urban heat island: the tendency of cities to be warmer than the surrounding countryside. On a calm summer night, the centre of a large city can be as much as ten degrees warmer than nearby farmland."),
    line(lecturer, 'There are several causes. The first is the materials cities are built from. Asphalt and concrete absorb heat during the day and release it slowly, which is why the difference is greatest after sunset rather than at midday.'),
    line(lecturer, 'The second is the lack of vegetation. Trees and other plants cool the air through a process called evapotranspiration, in which water evaporates from their leaves, and in dense urban areas there is simply less of it.'),
    line(lecturer, 'Third, the shape of streets matters. Narrow streets between tall buildings trap heat and block the wind, creating what researchers call urban canyons. Finally, there is waste heat from human activity: air conditioners, vehicles and factories all release heat directly into the air.'),
    line(lecturer, 'The consequences are serious. Higher temperatures increase demand for electricity, mainly for cooling, which in turn produces more waste heat. They also worsen air quality, because heat speeds up the chemical reactions that create ground-level ozone.'),
    line(lecturer, 'Most importantly, heat is a risk to health. During the European heatwave of 2003, the death rate in cities was far higher than in rural areas, and elderly people living alone were especially vulnerable.'),
    line(lecturer, 'So what can be done? One of the simplest measures is to make surfaces more reflective. Painting roofs white, for example, can reduce the temperature inside a building by several degrees. Another is to plant more trees, which provide shade as well as cooling the air.'),
    line(lecturer, 'Some cities have created green roofs, covered in plants, which also absorb rainwater and reduce flooding. Water itself can help: fountains and restored rivers cool their surroundings. However, these solutions need careful planning. In very dry cities, watering large areas of grass may not be sustainable, so planners there tend to prefer shade structures instead.'),
];

const p4 = partKit(4, PART4, 'C1', ONE_WORD_OR_NUMBER);

const part4: Q[] = [
    p4.gap(31, 'On calm summer nights, city centres can be up to ___ degrees warmer than farmland.', ['10', 'ten'], 'as much as ten degrees warmer'),
    p4.gap(32, 'The temperature difference is greatest after ___.', ['sunset'], 'the difference is greatest after sunset'),
    p4.gap(33, 'Plants cool the air through a process called ___.', ['evapotranspiration'], 'a process called evapotranspiration'),
    p4.gap(34, 'Narrow streets between tall buildings create urban ___.', ['canyons'], 'urban canyons'),
    p4.gap(35, 'Waste heat comes from air conditioners, vehicles and ___.', ['factories'], 'air conditioners, vehicles and factories'),
    p4.gap(36, 'Higher temperatures raise demand for electricity, mainly for ___.', ['cooling'], 'mainly for cooling'),
    p4.gap(37, 'Heat speeds up reactions that create ground-level ___.', ['ozone'], 'ground-level ozone'),
    p4.gap(38, 'In 2003, elderly people living ___ were especially vulnerable.', ['alone'], 'elderly people living alone'),
    p4.gap(39, 'Painting roofs ___ can lower the temperature inside buildings.', ['white'], 'Painting roofs white'),
    p4.gap(40, 'Green roofs also absorb rainwater and reduce ___.', ['flooding'], 'reduce flooding'),
];

export const ieltsListening: Q[] = [...part1, ...part2, ...part3, ...part4];
