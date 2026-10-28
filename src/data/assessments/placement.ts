// Adaptive placement test, all original: 15 items per level from A1 to C1, in three blocks of
// five (two grammar, one vocabulary, one short reading and one short listening). The engine in
// src/lib/exam/placement.ts picks the blocks. Every grammar and vocabulary item has one
// defensible answer: options that would also fit the sentence are left out. Reading and
// listening items quote the words that answer them in `evidence`. Checked by
// src/data/content.test.ts.
import type { AssessmentQuestion, DialogueLine, ExamLevel } from '../../lib/exam/types';
import type { PlacementBlock } from '../../lib/exam/placement';

type Q = AssessmentQuestion;
type Voice = Omit<DialogueLine, 'text'>;

const line = (voice: Voice, text: string): DialogueLine => ({ ...voice, text });
const ukWoman: Voice = { speaker: 'A', accent: 'UK', gender: 'female' };
const ukMan: Voice = { speaker: 'A', accent: 'UK', gender: 'male' };
const usWoman: Voice = { speaker: 'A', accent: 'US', gender: 'female' };
const usMan: Voice = { speaker: 'A', accent: 'US', gender: 'male' };
const second = (v: Voice): Voice => ({ ...v, speaker: 'B' });

// The answer is always listed first here; the simulator shuffles the options
const grammar = (level: ExamLevel, n: number, text: string, options: string[]): Q => ({
    id: `pl_${level.toLowerCase()}_g${n}`, section: 'use-of-english', task: 'Grammar', level, text, options, correctIndex: 0,
});
const vocab = (level: ExamLevel, n: number, text: string, options: string[]): Q => ({
    id: `pl_${level.toLowerCase()}_v${n}`, section: 'use-of-english', task: 'Vocabulary', level, text, options, correctIndex: 0,
});
const reading = (level: ExamLevel, n: number, passage: string, text: string, options: string[], evidence: string): Q => ({
    id: `pl_${level.toLowerCase()}_r${n}`, section: 'reading', task: 'Reading', level, passage, text, options, correctIndex: 0, evidence,
});
const listening = (level: ExamLevel, n: number, dialogue: DialogueLine[], text: string, options: string[], evidence: string): Q => ({
    id: `pl_${level.toLowerCase()}_l${n}`, section: 'listening', task: 'Listening', level, dialogue, text, options, correctIndex: 0, evidence,
});

// ================================================================ A1

const a1: Q[] = [
    grammar('A1', 1, 'My brother ______ twelve years old.', ['is', 'are', 'has', 'have']),
    grammar('A1', 2, 'There ______ two cats in the garden.', ['are', 'is', 'be', 'am']),
    vocab('A1', 1, "I'm hungry. Can I have a ______, please?", ['sandwich', 'chair', 'shirt', 'window']),
    reading('A1', 1, `Hi Tom,
I'm at the library until five. Your dinner is in the fridge. Please feed the dog at six.
Love, Mum`, 'What must Tom do at six?', ['Feed the dog', 'Eat his dinner', 'Go to the library', 'Call his mum'], 'Please feed the dog at six.'),
    listening('A1', 1, [
        line(usMan, 'Excuse me, how much is this T-shirt?'),
        line(second(ukWoman), "It's twelve dollars. The blue one is fifteen."),
    ], 'How much is the T-shirt the man asks about?', ['$12', '$15', '$20', '$2'], "It's twelve dollars."),

    grammar('A1', 3, "I don't like coffee, but my sister ______ it every morning.", ['drinks', 'drink', 'drinking', 'is drink']),
    grammar('A1', 4, 'Where ______ your parents live?', ['do', 'does', 'are', 'is']),
    vocab('A1', 2, "It's very cold today. Put on your ______.", ['coat', 'shorts', 'sunglasses', 'sandals']),
    reading('A1', 2, `City Swimming Pool
Open Monday to Saturday, 7 am to 9 pm.
Closed on Sundays.
Children under 8 must swim with an adult.`, 'When can you NOT swim at the pool?', ['On Sunday', 'On Saturday morning', 'On Monday evening', 'On Friday at 8 am'], 'Closed on Sundays.'),
    listening('A1', 2, [
        line(ukWoman, 'What time is the train to Leeds?'),
        line(second(ukMan), "At half past three. It's on platform two."),
    ], 'What time does the train leave?', ['At 3:30', 'At 2:30', 'At 3:00', 'At 2:00'], 'At half past three.'),

    grammar('A1', 5, 'This is Anna. ______ bag is red.', ['Her', 'She', 'His', 'Hers']),
    grammar('A1', 6, 'We go to the beach ______ summer.', ['in', 'on', 'at', 'to']),
    vocab('A1', 3, "My mother's sister is my ______.", ['aunt', 'uncle', 'cousin', 'niece']),
    reading('A1', 3, `My name is Lucía. I live in Valencia with my two brothers. I work in a shop near the beach. On weekends I play tennis with my friend Marta.`,
        'Who does Lucía play tennis with?', ['A friend', 'Her brothers', 'Her parents', 'People from the shop'], 'On weekends I play tennis with my friend Marta.'),
    listening('A1', 3, [
        line(usMan, 'Do you have any brothers or sisters?'),
        line(second(usWoman), "Yes, I have one sister. She's a nurse."),
    ], "What is the woman's sister's job?", ['A nurse', 'A teacher', 'A doctor', 'A student'], "She's a nurse."),
];

// ================================================================ A2

const a2: Q[] = [
    grammar('A2', 1, "I ______ my keys yesterday, so I couldn't open the door.", ['lost', 'lose', 'have lost', 'was losing']),
    grammar('A2', 2, 'She is ______ student in her class.', ['the tallest', 'taller', 'the most tall', 'more tall']),
    vocab('A2', 1, "The shop is ______ on Sundays, so we can't buy bread today.", ['closed', 'open', 'busy', 'cheap']),
    reading('A2', 1, `Hi Sam,
Thanks for inviting me to your party on Saturday. I'd love to come, but I'm working until eight. Is it OK if I arrive late? I can bring some drinks.
See you,
Jo`, 'Why will Jo arrive late at the party?', ['Jo has to work', 'Jo has to buy drinks first', "Jo doesn't like parties", 'Jo is going on holiday'], "I'm working until eight."),
    listening('A2', 1, [
        line(ukWoman, 'Shall we go to the cinema tonight?'),
        line(second(ukMan), "I'd love to, but I've got an exam tomorrow. How about Friday?"),
        line(ukWoman, "Friday's fine."),
    ], 'When are they going to the cinema?', ['On Friday', 'Tonight', 'Tomorrow', 'On Saturday'], "Friday's fine."),

    grammar('A2', 3, 'I ______ TV when you called me last night.', ['was watching', 'were watching', 'am watching', 'watching']),
    grammar('A2', 4, 'At my school, wearing a uniform is a rule, so we ______ wear one.', ['have to', 'has to', "don't have to", "can't"]),
    vocab('A2', 2, "Can you ______ me your pen? I'll give it back in a minute.", ['lend', 'borrow', 'rent', 'keep']),
    reading('A2', 2, `Hillside Museum
Tickets: £8 for adults, £4 for students.
Children under 12 go free.
On the first Monday of every month, entry is free for everyone.`, 'How much does a student pay on a normal Tuesday?', ['£4', '£8', 'Nothing', '£12'], '£4 for students'),
    listening('A2', 2, [
        line(usMan, "Hello, I'd like to book a table for four people at eight o'clock."),
        line(second(usWoman), "I'm sorry, we're full at eight. We have a table at half past eight."),
        line(usMan, "That's fine, thank you."),
    ], 'What time is the table booked for?', ['8:30', '8:00', '4:00', '4:30'], 'We have a table at half past eight.'),

    grammar('A2', 5, "I haven't finished my homework ______.", ['yet', 'already', 'ever', 'just']),
    grammar('A2', 6, "There isn't ______ milk in the fridge.", ['any', 'some', 'many', 'a']),
    vocab('A2', 3, 'I need to ______ some money from the cash machine.', ['take out', 'take off', 'put on', 'give up']),
    reading('A2', 3, `Last summer, Paula went camping in the mountains with her cousins. On the second day it rained all afternoon, so they stayed in the tent and played cards. The next morning the sun came out and they climbed to the top of the hill.`,
        'What did Paula and her cousins do while it was raining?', ['They played cards in the tent', 'They climbed to the top of the hill', 'They went home early', 'They swam in a lake'], 'so they stayed in the tent and played cards'),
    listening('A2', 3, [
        line(ukWoman, 'How was your weekend?'),
        line(second(ukMan), 'Not great. I wanted to go to the beach, but my car broke down, so I spent Saturday at the garage.'),
    ], "Why didn't the man go to the beach?", ['His car broke down', 'The weather was bad', 'He had to work', 'He was ill'], 'my car broke down'),
];

// ================================================================ B1

const b1: Q[] = [
    grammar('B1', 1, "If it ______ tomorrow, we'll stay at home.", ['rains', 'will rain', 'rained', 'would rain']),
    grammar('B1', 2, "I've been learning English ______ I was ten.", ['since', 'for', 'from', 'during']),
    vocab('B1', 1, "The concert didn't happen at all because the singer was ill: it was ______.", ['cancelled', 'booked', 'crowded', 'recorded']),
    reading('B1', 1, `When Daniel moved to Dublin for work, he expected the hardest part to be the language. In fact, his English was good enough from the start. What he found difficult was the weather: the short, grey winter days made him tired and homesick. A colleague suggested joining a running club, and after a few weeks of early-morning runs with the group, Daniel says he felt much more at home.`,
        'What helped Daniel feel better in Dublin?', ['Running with a group', 'Improving his English', 'Moving to a sunnier city', 'Going home for the winter'],
        'after a few weeks of early-morning runs with the group, Daniel says he felt much more at home'),
    listening('B1', 1, [
        line(usMan, 'Did you manage to get tickets for the match?'),
        line(second(usWoman), "Only for Sunday. Saturday was sold out, and to be honest, the Sunday seats aren't great. We're right behind a pillar."),
    ], 'What is the problem with the tickets?', ['The seats have a poor view', 'They were very expensive', 'They are for Saturday', "They haven't arrived yet"], "We're right behind a pillar."),

    grammar('B1', 3, 'The man ______ car was stolen called the police.', ['whose', 'who', 'which', 'whom']),
    grammar('B1', 4, 'He asked me where ______.', ['I lived', 'did I live', 'do I live', 'lived I']),
    vocab('B1', 2, "She's very ______: she always tells the truth, even when it's difficult.", ['honest', 'generous', 'patient', 'shy']),
    reading('B1', 2, `I booked the Seaview Hotel because of the photos online, and the rooms really are as bright and spacious as they look. Breakfast, however, was disappointing: the same cold buffet every day, with nothing cooked. The staff were friendly, though, and the location, two minutes from the beach, is hard to beat.`,
        'What did the writer NOT like about the hotel?', ['The breakfast', 'The rooms', 'The staff', 'The location'], 'Breakfast, however, was disappointing'),
    listening('B1', 2, [
        line(ukWoman, "I'm thinking of taking the train to Madrid instead of flying."),
        line(second(ukMan), 'Really? It takes longer.'),
        line(ukWoman, "Only an hour more, and you don't have to be at the station two hours early. Plus you can work on the train."),
    ], 'Which reason for taking the train does the woman give?', ['She can work during the journey', 'It is much cheaper than flying', 'It is faster than flying', 'She is afraid of flying'], 'Plus you can work on the train.'),

    grammar('B1', 5, 'This bridge ______ in 1890.', ['was built', 'built', 'has built', 'is building']),
    grammar('B1', 6, "I'm not used to ______ up so early.", ['getting', 'get', 'got', 'have got']),
    vocab('B1', 3, "I can't ______ my phone's password, so I'll have to reset it.", ['remember', 'remind', 'forget', 'notice']),
    reading('B1', 3, `Dear members,
Because of the repairs to the roof, the sports hall will be closed from 3 to 17 May. Classes will continue as normal, but they will take place in the school gym on Park Road. The swimming pool is not affected by the repairs and will keep its usual timetable.`,
        'What will happen to the classes in May?', ['They will move to another building', 'They will be cancelled for two weeks', 'They will take place in the pool', 'They will start later in the day'],
        'they will take place in the school gym on Park Road'),
    listening('B1', 3, [
        line(usMan, "How's the new job going?"),
        line(second(usWoman), "The work itself is interesting, and the pay is better than before. What I'm struggling with is the journey. It's an hour and a half each way."),
    ], 'What does the woman find difficult about her new job?', ['The journey', 'The type of work', 'The salary', 'Her colleagues'], "What I'm struggling with is the journey."),
];

// ================================================================ B2

const b2: Q[] = [
    grammar('B2', 1, 'I wish I ______ more time to travel when I was younger.', ['had had', 'would have', 'have had', 'will have']),
    grammar('B2', 2, 'By the time we arrived, the film ______.', ['had already started', 'has already started', 'already starts', 'will already start']),
    vocab('B2', 1, 'When sales fell, the company had to ______ 200 workers.', ['lay off', 'put off', 'call off', 'take off']),
    reading('B2', 1, `For years, the advice to students was simple: reread your notes until they stick. Research now suggests that this feels productive but achieves surprisingly little. Rereading makes material look familiar, and familiarity is easily mistaken for understanding. Testing yourself, by contrast, feels slow and frustrating, precisely because it exposes what you have not yet learned. Yet it is this struggle to recall information that makes it last.`,
        'According to the text, why is rereading misleading?', ['It creates a false sense of understanding', 'It takes up too much of the time available for study', 'It is slow and frustrating', 'It makes information harder to recall later'],
        'familiarity is easily mistaken for understanding'),
    listening('B2', 1, [
        line(ukWoman, "I thought the presentation went well, didn't you?"),
        line(second(ukMan), "The content was solid. I just felt we rushed the last part. Nobody had time to ask questions, and that's usually where we win people over."),
    ], 'What does the man think went wrong?', ['There was no time for questions', 'The content was weak', 'It started late', "The audience wasn't interested in the topic"], 'Nobody had time to ask questions'),

    grammar('B2', 3, 'She denied ______ the money.', ['taking', 'to take', 'take', 'to have took']),
    grammar('B2', 4, 'The flat needs ______ before we move in.', ['painting', 'to paint', 'paint', 'be painted']),
    vocab('B2', 2, 'Her argument was so ______ that nobody in the meeting could disagree.', ['convincing', 'convinced', 'conscious', 'considerable']),
    reading('B2', 2, `The town council's plan to turn the old railway line into a cycle path has divided residents. Supporters point to the health benefits and the likely boost to local cafés. Opponents, many of whom live alongside the route, are less worried about cyclists than about the loss of the trees that currently screen their gardens from view. The council has promised to replant, but critics note that new trees would take decades to grow to the same height.`,
        'What worries the residents who oppose the plan most?', ['Losing the trees that give them privacy', 'The number of cyclists using the path', 'Noise from the cafés near the route', 'The cost of the project to the town'],
        'about the loss of the trees that currently screen their gardens from view'),
    listening('B2', 2, [
        line(usMan, 'Are you still planning to go freelance?'),
        line(second(usWoman), "I was, but I've decided to wait a year. It's not that I doubt I'd find clients. It's that I want some savings behind me first."),
    ], 'Why has the woman decided to wait?', ['She wants to save money first', "She isn't sure she would find clients", 'Her company offered her a pay rise', 'She wants to finish a course'], 'I want some savings behind me first'),

    grammar('B2', 5, "You ______ have told me about the meeting! I didn't know anything about it.", ['should', 'must', 'need', 'ought']),
    grammar('B2', 6, 'The report ______ by the time the manager arrives tomorrow.', ['will have been finished', 'will be finishing', 'has been finished', 'is finishing']),
    vocab('B2', 3, "The decision is ______: once you sign, you can't change your mind.", ['irreversible', 'inevitable', 'invaluable', 'irrelevant']),
    reading('B2', 3, `When the small bakery on Mill Street announced it would stop selling bread on Mondays, regulars feared it was about to close. The owner, Ruth Ellis, insists the opposite is true. Business is good, she says, but she and her two staff had been working seven days a week for three years. "Closing one day isn't a sign we're struggling," she explained. "It's what allows us to keep going."`,
        'Why has the bakery stopped selling bread on Mondays?', ['So that the owner and staff can rest', 'Because it is about to close', 'Because Monday sales were poor', 'Because the owner is retiring'],
        'she and her two staff had been working seven days a week for three years'),
    listening('B2', 3, [
        line(ukWoman, 'Have you read the reviews of the new restaurant?'),
        line(second(ukMan), 'Mixed. Everyone raves about the food, but several people said they waited ages for a table, even with a booking.'),
    ], 'What do the reviews criticise?', ['Long waits for a table', 'The quality of the food', 'The high prices on the menu', 'Rude and unhelpful staff'], 'they waited ages for a table, even with a booking'),
];

// ================================================================ C1

const c1: Q[] = [
    grammar('C1', 1, 'Not only ______ late, but he also forgot the documents.', ['did he arrive', 'he arrived', 'arrived he', 'he did arrive']),
    grammar('C1', 2, 'Had I known about the delay, I ______ a later train.', ['would have caught', 'would catch', 'will have caught', 'had caught']),
    vocab('C1', 1, "The minister's speech was deliberately ______, so that nobody could accuse her of making a promise.", ['vague', 'blunt', 'concise', 'candid']),
    reading('C1', 1, `Much of the enthusiasm for "smart cities" rests on the assumption that more data leads to better decisions. Sensors can tell planners exactly how many cars pass a junction each hour, but they cannot tell them whether the junction ought to exist at all. The danger, critics argue, is not that cities collect information, but that what can be measured quietly comes to define what matters. Problems that leave no digital trace, such as loneliness among elderly residents, risk being overlooked simply because no dashboard displays them.`,
        "What is the critics' main point?", ['What is easy to measure may push aside what matters', 'Cities collect far too much data about their residents', 'The sensors used in cities are often inaccurate', 'Planners tend to ignore the data that they collect'],
        'what can be measured quietly comes to define what matters'),
    listening('C1', 1, [
        line(usMan, 'So, are you for or against the four-day week?'),
        line(second(usWoman), "In principle I'm all for it. My reservation is practical: unless clients adjust their expectations, we'll just end up cramming five days of calls into four and calling it progress."),
    ], "What is the woman's reservation about the four-day week?", ['Work may be squeezed rather than reduced', 'Staff would end up earning less money', 'She is against the idea in principle', 'Clients will refuse to work with them'],
        "we'll just end up cramming five days of calls into four"),

    grammar('C1', 3, '______ the circumstances, the team did remarkably well.', ['Given', 'Giving', 'To give', 'Gave']),
    grammar('C1', 4, 'So ______ was the storm that the ferry was cancelled.', ['severe', 'severely', 'severity', 'more severe']),
    vocab('C1', 2, 'The evidence ______ suggests that the drug works, but more trials are needed.', ['tentatively', 'adamantly', 'conclusively', 'flatly']),
    reading('C1', 2, `Translators of poetry face a choice that has no perfect solution. A version that keeps the original's rhyme and rhythm must often bend its meaning; one that is faithful to every word tends to read like a dictionary entry. The most admired translators, according to the essay, do not try to avoid this loss but decide in advance which element of the poem they are prepared to sacrifice, and are open with readers about that choice.`,
        'What, according to the essay, distinguishes the best translators?', ['They choose openly what to give up', 'They keep both the meaning and the form', 'They translate every word faithfully', 'They avoid poems that rhyme'],
        'decide in advance which element of the poem they are prepared to sacrifice'),
    listening('C1', 2, [
        line(ukWoman, 'Your new book is quite a departure from the earlier ones.'),
        line(second(ukMan), "It is, though less deliberately than people assume. I didn't set out to change direction; the story simply refused to be told in the old way, and I eventually stopped fighting it."),
    ], 'How does the writer explain the change in his new book?', ['The story itself demanded it', 'He wanted to reach new readers', 'His publisher asked him for something different', 'He had grown tired of his old style'],
        'the story simply refused to be told in the old way'),

    grammar('C1', 5, 'If I had accepted that job, I ______ in Paris now.', ['would be living', 'would have lived', 'will live', 'had lived']),
    grammar('C1', 6, 'She is said ______ the company in 2010.', ['to have founded', 'to found', 'having founded', 'that she founded']),
    vocab('C1', 3, 'Her apology seemed ______: she was clearly only sorry that she had been caught.', ['insincere', 'inconsistent', 'insensitive', 'ineffective']),
    reading('C1', 3, `When the museum removed the glass barrier in front of its most famous painting, conservators were alarmed. Yet visitor behaviour changed in an unexpected way: people stood further back, spent longer in front of the work and were noticeably quieter. The director's explanation is that the barrier had turned the painting into an object to be photographed through, rather than looked at. Without it, visitors seemed to sense a responsibility that no sign had ever managed to instil.`,
        'What happened after the barrier was removed?', ['Visitors treated the painting with more care', 'The painting was damaged by visitors', 'Visitors took more photographs of the painting', 'The museum put up new warning signs'],
        'people stood further back, spent longer in front of the work and were noticeably quieter'),
    listening('C1', 3, [
        line(usMan, 'The survey shows record levels of satisfaction with the new service.'),
        line(second(usWoman), "I'd be cautious. Only people who already use the service were asked. Those who gave up on it after the first week aren't in the figures at all."),
    ], 'Why does the woman doubt the survey results?', ['It leaves out people who stopped using the service', 'Too few people answered it', 'Its questions were badly written', 'It was carried out too early'],
        "Those who gave up on it after the first week aren't in the figures at all."),
];

/** Blocks of five, in the order each level's items are listed. */
function blocks(level: ExamLevel, items: Q[]): PlacementBlock[] {
    return [0, 1, 2].map(i => ({ id: `pl_${level.toLowerCase()}_b${i + 1}`, level, questions: items.slice(i * 5, i * 5 + 5) }));
}

export const placementBlocks: PlacementBlock[] = [
    ...blocks('A1', a1), ...blocks('A2', a2), ...blocks('B1', b1), ...blocks('B2', b2), ...blocks('C1', c1),
];

export const placementQuestions: Q[] = placementBlocks.flatMap(b => b.questions);
