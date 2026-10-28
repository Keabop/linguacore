// TOEFL iBT Reading (format of January 2026): a first module everyone takes (router), then an
// easier (lower) or harder (upper) second module depending on how the first one went. Each
// module has the exam's three tasks: Complete the Words, Read in Daily Life and an academic
// passage of about 200 words. All texts are original; `evidence` quotes the words that give
// each answer (checked by src/data/content.test.ts).
import type { AssessmentQuestion, ExamLevel, ExamStage } from '../../../lib/exam/types';

type Q = AssessmentQuestion;

const COMPLETE = 'Complete the Words';
const DAILY = 'Read in Daily Life';
const ACADEMIC = 'Read an Academic Passage';

/**
 * Complete the Words: each word marked "*student" loses its second half ("stu[dent]"), as in
 * the exam. The first sentence stays whole so the topic is clear.
 */
function cutWords(text: string): string {
    return text.replace(/\*(\p{L}+)/gu, (_, w: string) => {
        const shown = Math.floor(w.length / 2);
        return `${w.slice(0, shown)}[${w.slice(shown)}]`;
    });
}

function moduleKit(stage: ExamStage) {
    const id = (n: number) => `toefl_r_${stage}_${n}`;
    return {
        complete: (n: number, text: string, level: ExamLevel): Q =>
            ({ id: id(n), section: 'reading', level, stage, task: COMPLETE, kind: 'complete-words', text: cutWords(text) }),
        /** Questions on one text; `name` identifies the text within the module. */
        text: (name: string, passage: string, level: ExamLevel, task: string) =>
            (n: number, text: string, options: string[], correctIndex: number, evidence: string): Q =>
                ({ id: id(n), section: 'reading', level, stage, task, group: `toefl-reading-${stage}-${name}`, passage, text, options, correctIndex, evidence }),
    };
}

// ================================================================ Module 1 (everyone)

const m1 = moduleKit('router');

const M1_EMAIL = `Email: Your study room booking

From: Westfield University Library
To: Priya Shah

Dear Priya,

Your booking for Study Room 4 on Thursday, March 12, from 2:00 to 4:00 p.m. has been moved to Study Room 7 on the second floor. Room 4 is closed that day while new computer screens are installed. Room 7 has the same equipment, but it seats six people instead of eight, so please let us know if your group is larger.

You do not need to do anything to accept the change. If the new room does not suit you, you can cancel online up to two hours before the booking starts.

Library Services`;

const M1_NOTICE = `Notice: Pool closure

The swimming pool will be closed from Monday, November 3, to Friday, November 7, for cleaning and repairs to the heating system. The gym, sauna and fitness classes will run as usual.

Members with a pool-only membership can use the pool at Northgate Recreation Center free of charge during this week by showing their membership card at reception. We apologize for any inconvenience.`;

const M1_PASSAGE = `Why Some Birds Migrate at Night

Many songbirds that are active during the day make their long seasonal journeys at night. For a long time this seemed strange, but researchers have proposed several advantages. First, the air is usually cooler and calmer after sunset, so flying costs less energy and the birds lose less water. Second, flying in darkness may protect small birds from hawks and other predators that hunt by sight during the day.

A third explanation concerns food. A bird that travels at night can spend the daylight hours resting and feeding, which allows it to replace the fat it burns during the flight. Birds that migrate by day would have to stop flying in order to eat.

Navigation at night is not as difficult as it might seem. Experiments in planetariums have shown that young birds learn to recognize the pattern of stars around the North Star, which remains in the same position all night. Many species can also sense the Earth's magnetic field, and they appear to use both systems together. However, bright city lights can confuse migrating birds, and thousands die each year after flying into lit buildings. Some cities now ask the owners of tall buildings to switch off unnecessary lights during the main migration months.`;

const m1Email = m1.text('email', M1_EMAIL, 'B1', DAILY);
const m1Notice = m1.text('notice', M1_NOTICE, 'B1', DAILY);
const m1Passage = m1.text('passage', M1_PASSAGE, 'B2', ACADEMIC);

const module1: Q[] = [
    m1.complete(1, 'Sleep plays an essential role in how the brain stores new information. During *deep sleep, the *brain replays *patterns of activity from the *day, which *helps to strengthen the *connections between nerve cells. *Students who sleep *well after studying *usually remember more *than those who stay up late.', 'B1'),
    m1Email(2, 'Why was the booking changed?', [
        'Room 4 is having new equipment put in.',
        "Priya's group is too large for Room 4.",
        'The library is closed on Thursday.',
        'The booking was longer than two hours.',
    ], 0, 'Room 4 is closed that day while new computer screens are installed'),
    m1Email(3, 'What is true about Study Room 7?', [
        'It is on the ground floor.',
        'It holds fewer people than Room 4.',
        'It has no computer screens.',
        'It is only free until 2:00 p.m.',
    ], 1, 'it seats six people instead of eight'),
    m1Email(4, 'What should Priya do if Room 7 suits her group?', [
        'Reply to the email to confirm the new room.',
        'Cancel the booking online.',
        'Nothing, because the change is automatic.',
        'Ask at the library desk for a key.',
    ], 2, 'You do not need to do anything to accept the change'),
    m1Notice(5, 'Which facility will members be unable to use that week?', [
        'The gym',
        'The sauna',
        'The fitness classes',
        'The swimming pool',
    ], 3, 'The swimming pool will be closed'),
    m1Notice(6, 'What can members with a pool-only membership do?', [
        'Swim at another center without paying.',
        'Ask the gym for part of their membership fee back.',
        'Join fitness classes for free.',
        'Use the sauna instead of the pool.',
    ], 0, 'can use the pool at Northgate Recreation Center free of charge'),
    m1Passage(7, 'According to the passage, why is flying at night less tiring for birds?', [
        'There are fewer birds in the sky.',
        'Birds fly lower after dark.',
        'The air is cooler and calmer.',
        'Winds blow in the direction of travel.',
    ], 2, 'the air is usually cooler and calmer after sunset, so flying costs less energy'),
    m1Passage(8, 'The word "replace" in paragraph 2 is closest in meaning to', [
        'remove',
        'restore',
        'measure',
        'carry',
    ], 1, 'replace the fat it burns'),
    m1Passage(9, 'What does the passage say about birds that migrate during the day?', [
        'They must interrupt their journey to feed.',
        'They are safer from hawks.',
        'They lose less water than night migrants.',
        'They are usually larger species.',
    ], 0, 'Birds that migrate by day would have to stop flying in order to eat'),
    m1Passage(10, 'What did the experiments in planetariums show?', [
        'Birds cannot see stars through clouds.',
        'Older birds teach younger ones to fly.',
        'The North Star moves during the night.',
        'Young birds learn a pattern of stars.',
    ], 3, 'young birds learn to recognize the pattern of stars around the North Star'),
    m1Passage(11, 'Why do some cities ask building owners to switch off lights?', [
        'To save energy during the summer.',
        'To stop birds from flying into buildings.',
        'So that birds can rest on the roofs.',
        'So that residents can sleep better.',
    ], 1, 'thousands die each year after flying into lit buildings'),
];

// ================================================================ Module 2, easier (lower)

const lo = moduleKit('lower');

const LO_CHAT = `Text messages

Sam (4:12 p.m.): Hi! Are we still meeting at the café at 6?

Lucy (4:20 p.m.): Yes, but can we make it 6:30? My bus is late.

Sam (4:21 p.m.): No problem. I'll get a table by the window.

Lucy (4:25 p.m.): Great. Can you order me a hot chocolate? I'll pay you back.`;

const LO_MUSEUM = `City Museum: Opening times and prices

Open Tuesday to Sunday, 10:00 a.m. to 5:00 p.m. Closed on Mondays. On Thursdays the museum stays open until 8:00 p.m.

Adults: $12. Students and over-65s: $8. Children under 12: free.

Free guided tours leave the main hall at 11:00 a.m. and 2:00 p.m. every day. The museum café is on the top floor and closes 30 minutes before the museum.`;

const LO_PASSAGE = `How Camels Survive in the Desert

Camels can live in some of the hottest and driest places on Earth. Many people believe that they store water in their humps, but this is not true. The hump is full of fat. When there is little food, the camel's body uses this fat for energy, and the hump becomes smaller and softer.

Camels are also very good at saving water. They lose very little water in sweat, because their body temperature can rise by several degrees during the day before they start to sweat. At night, when the desert is cold, their temperature falls again.

When a camel finds water, it can drink more than 100 liters in about ten minutes. Most animals would become ill if they drank so much so quickly, but a camel's blood cells can stretch to hold the extra water.

Other features help too. Long eyelashes protect the camel's eyes from sand, and it can close its nostrils during sandstorms. Its wide feet stop it from sinking into soft sand, so it can walk long distances without getting tired.`;

const loChat = lo.text('chat', LO_CHAT, 'A2', DAILY);
const loMuseum = lo.text('museum', LO_MUSEUM, 'B1', DAILY);
const loPassage = lo.text('passage', LO_PASSAGE, 'B1', ACADEMIC);

const lowerModule: Q[] = [
    lo.complete(1, 'Many families in the town keep a small garden behind their house. In *spring, they *plant tomatoes, beans *and herbs. The *plants need water *every day when the *weather is *hot. In *summer, the families *share the vegetables *with their neighbors.', 'A2'),
    loChat(2, 'Why does Lucy want to meet later?', [
        'She has to finish work.',
        'Her bus is late.',
        'The café opens at 6:30.',
        'Sam asked her to.',
    ], 1, 'My bus is late'),
    loChat(3, 'What does Lucy ask Sam to do?', [
        'Lend her money for the bus.',
        'Find a table outside.',
        'Order a drink for her.',
        'Meet her at the bus stop.',
    ], 2, 'Can you order me a hot chocolate?'),
    loMuseum(4, 'When can visitors go to the museum in the evening?', [
        'On Thursdays',
        'On Mondays',
        'On Sundays',
        'Every day except Monday',
    ], 0, 'On Thursdays the museum stays open until 8:00 p.m.'),
    loMuseum(5, 'How much is a ticket for a university student?', [
        '$12',
        'Nothing',
        '$4',
        '$8',
    ], 3, 'Students and over-65s: $8'),
    loMuseum(6, 'What time does the café close on a Saturday?', [
        '5:00 p.m.',
        '4:30 p.m.',
        '7:30 p.m.',
        '2:00 p.m.',
    ], 1, 'closes 30 minutes before the museum'),
    loPassage(7, 'What is inside a camel\'s hump?', [
        'Water',
        'Muscle',
        'Fat',
        'Air',
    ], 2, 'The hump is full of fat'),
    loPassage(8, 'Why does a camel lose little water through sweat?', [
        'Its body can get hotter before it sweats.',
        'It rests in the shade during the hottest part of the day.',
        'It only walks at night.',
        'Its thick fur keeps the heat out.',
    ], 0, 'their body temperature can rise by several degrees during the day before they start to sweat'),
    loPassage(9, 'What happens when a camel drinks a lot of water quickly?', [
        'It becomes ill.',
        'Its hump fills up with the extra water.',
        'It stops eating for a week.',
        'Its blood cells stretch to hold the water.',
    ], 3, "a camel's blood cells can stretch to hold the extra water"),
    loPassage(10, 'How does a camel protect itself in a sandstorm?', [
        'It lies down behind a rock.',
        'It can close its nostrils.',
        'It walks faster.',
        'It drinks more water.',
    ], 1, 'it can close its nostrils during sandstorms'),
    loPassage(11, 'Why can camels walk a long way on soft sand?', [
        'Their wide feet keep them from sinking.',
        'They carry very little weight.',
        'Their long legs help them run.',
        'They stop to rest every hour.',
    ], 0, 'Its wide feet stop it from sinking into soft sand'),
];

// ================================================================ Module 2, harder (upper)

const up = moduleKit('upper');

const UP_POST = `Post from the Riverside Community Garden page

Thank you to everyone who came to Saturday's planting day! Thanks to 40 volunteers, all 300 trees are now in the ground along the river path.

A quick reminder: the young trees will need watering twice a week until the autumn rains begin. We've set up a watering schedule on our website, so if you can spare half an hour, please sign up for a slot.

And if you borrowed one of our spades, please return it to the shed by Friday. We're running short.`;

const UP_NOTICE = `Notice to residents: Changes to recycling collection

Starting April 1, recycling will be collected every two weeks instead of weekly. To make up for this, every household will receive a second recycling bin free of charge during March.

Glass must no longer be placed in recycling bins; instead, it can be taken to one of the twelve glass drop-off sites across the city, which are listed on the city website.

Residents who believe they will produce more recycling than two bins can hold may apply for a third bin, although applications from households of fewer than five people are unlikely to be approved.`;

const UP_PASSAGE = `The Puzzle of Ice Age Megafauna

Around 50,000 years ago, the Earth was home to many enormous mammals, including mammoths, giant ground sloths and woolly rhinoceroses. Within roughly 40,000 years, most of these species had vanished. Scientists have long disagreed about the cause.

One hypothesis blames climate. As the last ice age ended, vast grasslands gave way to forests and wetlands, and animals adapted to cold, open landscapes may have lost much of their habitat. Critics point out, however, that these species had already survived several earlier warm periods without disappearing.

A rival hypothesis holds humans responsible. In several regions, extinctions followed soon after people arrived. In Australia, for instance, large animals disappeared within a few thousand years of human settlement, a period during which the climate was relatively stable. Hunting need not have been intensive to have this effect: because large mammals reproduce slowly, even a modest increase in deaths could have pushed populations into decline.

Increasingly, researchers favor a combination of the two. In this view, a changing climate weakened populations that human hunters then finished off, which would explain why the pattern of extinction differs so markedly from one continent to another.`;

const upPost = up.text('post', UP_POST, 'B2', DAILY);
const upNotice = up.text('notice', UP_NOTICE, 'B2', DAILY);
const upPassage = up.text('passage', UP_PASSAGE, 'C1', ACADEMIC);

const upperModule: Q[] = [
    up.complete(1, 'Economists have long debated why some inventions spread rapidly while others are ignored for decades. One *influential explanation *points to the *role of networks: a *technology becomes *attractive only when *enough other people *already use it. The fax machine, for *example, was of *little *value to its first owners.', 'C1'),
    upPost(2, 'What is the main purpose of the post?', [
        'To announce a second planting day.',
        'To complain about damaged trees.',
        'To thank volunteers and ask for more help.',
        'To sell tools to garden members.',
    ], 2, "Thank you to everyone who came to Saturday's planting day"),
    upPost(3, 'What does the writer suggest about the spades?', [
        'Some of them have not been returned.',
        'They were damaged during the planting day.',
        'Volunteers should bring their own next time.',
        'They are kept on the river path.',
    ], 0, "We're running short"),
    upNotice(4, 'Why is every household being given a second bin?', [
        'Glass now needs a separate bin.',
        'Households are producing more recycling.',
        'The old bins are being replaced.',
        'Recycling will be collected less often.',
    ], 3, 'To make up for this, every household will receive a second recycling bin'),
    upNotice(5, 'What should residents do with glass starting April 1?', [
        'Put it in the second bin.',
        'Take it to a drop-off site.',
        'Leave it next to the bins.',
        'Ask the city to collect it.',
    ], 1, 'it can be taken to one of the twelve glass drop-off sites'),
    upNotice(6, 'What can be inferred about a household of three people that asks for a third bin?', [
        'It will receive the bin in March.',
        'It will have to pay for the bin.',
        'It will probably not be given one.',
        'It must apply on the council website.',
    ], 2, 'applications from households of fewer than five people are unlikely to be approved'),
    upPassage(7, 'According to paragraph 2, what weakens the climate hypothesis?', [
        'The animals had survived earlier warm periods.',
        'Forests could not replace the grasslands.',
        'The ice age ended too quickly.',
        'Wetlands provided more food than the grasslands they replaced.',
    ], 0, 'these species had already survived several earlier warm periods without disappearing'),
    upPassage(8, 'Why does the author mention Australia?', [
        'To show that people arrived there late.',
        'To give an example of a region where the climate changed quickly.',
        'To show that hunting there was intensive.',
        'To show that extinctions happened while the climate changed little.',
    ], 3, 'a period during which the climate was relatively stable'),
    upPassage(9, 'Why could even limited hunting have caused extinctions?', [
        'Hunters chose the youngest animals.',
        'Large mammals replace their losses slowly.',
        'Large mammals were easy to find.',
        'Hunting spread diseases among herds.',
    ], 1, 'because large mammals reproduce slowly'),
    upPassage(10, 'The word "modest" in paragraph 3 is closest in meaning to', [
        'sudden',
        'humble',
        'small',
        'lasting',
    ], 2, 'even a modest increase in deaths'),
    upPassage(11, 'Which view do many researchers now hold?', [
        'Climate change alone explains the extinctions.',
        'Hunting alone explains the extinctions.',
        'The extinctions followed the same pattern everywhere.',
        'Climate change and hunting worked together.',
    ], 3, 'researchers favor a combination of the two'),
];

export const toeflReading: Q[] = [...module1, ...lowerModule, ...upperModule];
