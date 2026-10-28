// Cambridge B1 Preliminary (2020 format), all original: Reading in six parts (32 questions)
// and Listening in four parts (25 questions), then Writing and Speaking. Comprehension items
// quote the words that answer them in `evidence`; the cloze parts are answered in the text
// itself. Checked by src/data/content.test.ts.
import type { AssessmentQuestion, DialogueLine, ExamSpeakingTask, ExamWritingTask } from '../../../lib/exam/types';

type Q = AssessmentQuestion;
type Voice = Omit<DialogueLine, 'text'>;

const line = (voice: Voice, text: string): DialogueLine => ({ ...voice, text });
const ukWoman: Voice = { speaker: 'A', accent: 'UK', gender: 'female' };
const ukMan: Voice = { speaker: 'A', accent: 'UK', gender: 'male' };
const usWoman: Voice = { speaker: 'A', accent: 'US', gender: 'female' };
const usMan: Voice = { speaker: 'A', accent: 'US', gender: 'male' };
const second = (v: Voice): Voice => ({ ...v, speaker: 'B' });

const id = (n: number, section: 'r' | 'l') => `b1_${section}${n}`;

// ================================================================ Reading

const READING = {
    p1: 'Reading Part 1: short texts',
    p2: 'Reading Part 2: matching',
    p3: 'Reading Part 3: long text',
    p4: 'Reading Part 4: gapped text',
    p5: 'Reading Part 5: multiple-choice cloze',
    p6: 'Reading Part 6: open cloze',
};

const short = (n: number, passage: string, text: string, options: string[], correctIndex: number, evidence: string): Q => ({
    id: id(n, 'r'), section: 'reading', level: 'B1', task: READING.p1, group: `b1-reading-1-${n}`, passage, text, options, correctIndex, evidence,
});

const part1: Q[] = [
    short(1, `Notice: Swimming pool

Children under 8 must be with an adult in the water at all times.

Lockers take a 1-euro coin, which you get back.`, 'What does the swimming pool notice say?', [
        'Young children can swim alone if an adult is watching them.',
        'You need a coin for a locker, but you do not lose it.',
        'Adults must not bring children under 8 to the pool.',
    ], 1, 'Lockers take a 1-euro coin, which you get back.'),
    short(2, `Text message

Maya, the bakery on Hill Street is closed today, so I've bought the cake from the supermarket instead. Can you pick up the candles on your way? Leo`, 'Why has Leo sent Maya this message?', [
        'to tell her that he could not find a cake anywhere',
        'to ask her to go to the bakery on Hill Street',
        'to ask her to buy something on her way',
    ], 2, 'Can you pick up the candles on your way?'),
    short(3, `Email

From: Tom
To: Sports club members

The tennis courts will be repainted next week, so all matches will be played at the Park Road courts instead. Training on Thursday evening is cancelled, but the Saturday session will go ahead as usual.`, 'What is Tom telling the club members?', [
        'Saturday training will take place as normal.',
        'There will be no tennis at all next week.',
        'Matches have been moved to Thursday evening.',
    ], 0, 'the Saturday session will go ahead as usual'),
    short(4, `Label on a jar

Keep in the fridge after opening and eat within three days. Not suitable for freezing.`, 'What does the label on the jar say?', [
        'You can keep it in the freezer for up to three days.',
        'It must be kept in the fridge even before you open the jar for the first time.',
        'Once it is open, it should be kept cold and eaten soon.',
    ], 2, 'Keep in the fridge after opening and eat within three days.'),
    short(5, `Note on a door

Dear neighbours, I'm having a few friends round on Friday from 8 p.m. I'll try to keep the music down, but if it's too loud, please knock. I'm in flat 4. Sara`, 'What is Sara doing in her note?', [
        'inviting all her neighbours to a party on Friday',
        'asking her neighbours to tell her if there is too much noise',
        'complaining that the music from flat 4 is often far too loud at night',
    ], 1, "if it's too loud, please knock"),
];

const COURSES = `Summer courses

A  Coastal Photography: two weekends by the sea, learning to photograph landscapes and wildlife. Bring your own camera. Suitable for complete beginners.

B  Cook Like a Local: evening classes on Tuesdays and Thursdays for six weeks. Learn to prepare simple dishes from around the world using fresh, cheap ingredients. All equipment is provided.

C  Digital Art Lab: a one-week course for teenagers aged 13 to 17 who want to create cartoons on a tablet. Tablets are provided. Some drawing experience is needed.

D  Mountain Skills: five days in the hills learning to read maps and plan routes. You must be fit enough to walk 15 kilometres a day. You sleep in tents.

E  Guitar in a Week: daily morning lessons for beginners. Guitars can be borrowed. By Friday you'll play three songs in a small concert for friends and family.

F  Weekend Bread School: a Saturday and Sunday course at a local bakery. You'll learn to make different types of bread and take home everything you bake.

G  Wildlife Volunteers: spend two weeks helping scientists count birds and protect nests on a small island. Accommodation and meals are included. Minimum age 18.

H  Stage Confidence: short evening workshops for adults who want to feel more confident when speaking in public, using drama games. No acting experience is necessary.`;

const COURSE_NAMES = ['Coastal Photography', 'Cook Like a Local', 'Digital Art Lab', 'Mountain Skills', 'Guitar in a Week', 'Weekend Bread School', 'Wildlife Volunteers', 'Stage Confidence'];

const match = (n: number, text: string, correctIndex: number, evidence: string): Q => ({
    id: id(n, 'r'), section: 'reading', level: 'B1', task: READING.p2, group: 'b1-reading-2', sharePage: true, passage: COURSES,
    text, options: COURSE_NAMES, correctIndex, fixedOrder: true, evidence,
});

const part2: Q[] = [
    match(6, 'Daniel is 16. He loves drawing and wants to learn to make his own cartoons using technology.', 2, 'create cartoons on a tablet'),
    match(7, 'Ana works during the day. She wants to learn to cook cheap meals in the evenings without buying any special equipment.', 1, 'All equipment is provided'),
    match(8, 'Mark is 25. He wants to spend time outdoors doing something useful for nature, with somewhere to stay included.', 6, 'Accommodation and meals are included'),
    match(9, 'Lucy has never played an instrument. She would like to learn quickly and perform for her family at the end.', 4, "you'll play three songs in a small concert for friends and family"),
    match(10, 'Peter gets nervous when he gives presentations at work and wants to practise speaking in front of others after work.', 7, 'feel more confident when speaking in public'),
];

const ZOO = `A Year with the Animals

Hannah Clarke, 19, writes about the year she spent as a volunteer at the city zoo.

When I finished school, I didn't feel ready to go to university. Most of my friends were starting courses straight away, and my parents were worried that I would waste a year. But I had always loved animals, so when I saw an advert for volunteers at the city zoo, I applied immediately.

On my first day, I was disappointed. I had imagined feeding lions and playing with baby monkeys, but instead I spent eight hours cleaning out the reptile house. My supervisor, Mr Okoro, explained that every keeper starts this way. 'If you can't keep an animal's home clean,' he said, 'you can't look after the animal.' I didn't believe him at the time, but I understand now that he was right.

After three months, I was allowed to help with the meerkats. They are small, noisy and very curious, and I loved them immediately. My job was to hide their food around the enclosure so that they had to search for it, just as they would in the wild. Visitors often asked me questions while I worked, and I discovered that I really enjoyed explaining the animals' behaviour to them.

The hardest part of the year came in the winter, when one of the older meerkats became ill. The vets did everything they could, but she died a few weeks later. I was surprised by how upset I felt, but the other keepers were very kind and told me that it never gets easier.

By the end of the year, I knew exactly what I wanted to do. I have just started a degree in animal biology, and I still work at the zoo every Saturday. My parents now say that the year was the best decision I ever made, although they didn't think so at the beginning!`;

const long = (n: number, text: string, options: string[], correctIndex: number, evidence: string): Q => ({
    id: id(n, 'r'), section: 'reading', level: 'B1', task: READING.p3, group: 'b1-reading-3', passage: ZOO, text, options, correctIndex, evidence,
});

const part3: Q[] = [
    long(11, 'Why did Hannah apply to work at the zoo?', [
        'Some of her friends were doing the same.',
        'Her parents thought it was a good idea.',
        'She had always been interested in animals.',
        'She wanted to earn some money before starting her university course.',
    ], 2, 'I had always loved animals'),
    long(12, 'How did Hannah feel on her first day?', [
        'disappointed that the work was not what she expected',
        'nervous about meeting her supervisor',
        'tired after feeding the lions all morning',
        'worried that she would make a mistake with the animals on her first day',
    ], 0, 'On my first day, I was disappointed'),
    long(13, "What does Hannah say about Mr Okoro's advice?", [
        'She has given the same advice to new volunteers.',
        'She thinks it is only true for reptiles.',
        'She found it hard to understand what he meant.',
        'She did not agree with it then, but she does now.',
    ], 3, "I didn't believe him at the time, but I understand now that he was right"),
    long(14, 'What did Hannah discover while she was working with the meerkats?', [
        'She liked talking to visitors about the animals.',
        'Meerkats prefer to be fed by hand.',
        'She was better at hiding food than the other keepers.',
        'Most visitors were not interested in the meerkats.',
    ], 0, "I really enjoyed explaining the animals' behaviour to them"),
    long(15, "What do Hannah's parents think about her year now?", [
        'They wish she had gone straight to university.',
        'They believe it was a very good choice.',
        'They want her to work at the zoo full-time.',
        'They were never worried about her plan.',
    ], 1, 'the year was the best decision I ever made'),
];

const BIKES = `The Bicycle Library

In the small town of Fenwick, people can borrow a bicycle in the same way that they borrow a book. The Bicycle Library opened two years ago in an old shop next to the train station. (16) ________

The idea came from a local teacher, Rosa Mills. She noticed that many of her students walked long distances to school because their families could not afford bikes. (17) ________ Within a month, she had collected more than forty.

Borrowing a bike is simple. You show your library card, choose a bike and take it home for up to two weeks. (18) ________ If something breaks, volunteers repair it for free every Saturday morning.

The library has become popular with adults as well as children. (19) ________ Some people use the bikes to get to work, while others simply ride along the river at weekends.

Rosa now hopes that other towns will copy the idea. (20) ________ 'All you need,' she says, 'is some space, a few volunteers and lots of old bikes.'`;

const BIKE_SENTENCES = [
    'She asked people in the town to give her the bicycles they no longer used.',
    'Since then, it has lent bikes to more than three hundred people.',
    'After that, you can borrow it again if nobody else is waiting for it.',
    'In fact, more than half of its members are now over thirty.',
    'She has already been invited to speak in two nearby cities.',
    'Most of the bikes were brand new when the library opened.',
    'Most of the students preferred to take the bus.',
    'The town council paid for all the new bikes.',
];

const gapped = (n: number, correctIndex: number, evidence: string): Q => ({
    id: id(n, 'r'), section: 'reading', level: 'B1', task: READING.p4, group: 'b1-reading-4', sharePage: true, passage: BIKES,
    text: `Which sentence fits gap ${n}?`, options: BIKE_SENTENCES, correctIndex, fixedOrder: true, evidence,
});

const part4: Q[] = [
    gapped(16, 1, 'The Bicycle Library opened two years ago'),
    gapped(17, 0, 'Within a month, she had collected more than forty.'),
    gapped(18, 2, 'take it home for up to two weeks'),
    gapped(19, 3, 'The library has become popular with adults as well as children.'),
    gapped(20, 4, 'Rosa now hopes that other towns will copy the idea.'),
];

const JUGGLING = `Learning to Juggle

Juggling is a skill that almost anyone can (21) ________ with a little patience. Most beginners start with three soft balls, because they are easier to (22) ________ than rings or clubs. At first, it is a good idea to practise over a bed, so that you don't have to (23) ________ down every time you drop a ball.

Experts say that practising for ten minutes a day works (24) ________ than practising for an hour once a week. Juggling is also good for your brain: (25) ________ to one study, people who learned to juggle improved their concentration. So why not (26) ________ it a try?`;

const cloze = (n: number, options: string[], correctIndex: number): Q => ({
    id: id(n, 'r'), section: 'reading', level: 'B1', task: READING.p5, group: 'b1-reading-5', sharePage: true, passage: JUGGLING,
    text: `Which word fits gap ${n}?`, options, correctIndex,
});

const part5: Q[] = [
    cloze(21, ['learn', 'teach', 'know', 'pass'], 0),
    cloze(22, ['join', 'win', 'catch', 'reach'], 2),
    cloze(23, ['lie', 'bend', 'fall', 'sit'], 1),
    cloze(24, ['further', 'greater', 'higher', 'better'], 3),
    cloze(25, ['thanks', 'according', 'due', 'owing'], 1),
    cloze(26, ['make', 'take', 'give', 'have'], 2),
];

const GARDEN = `My Grandmother's Garden

Every summer when I was a child, I spent two weeks (27) ________ my grandmother's house in the country. Her garden was full (28) ________ vegetables, flowers and fruit trees. She taught me (29) ________ to plant seeds and how much water each plant needed.

We often got up early (30) ________ that we could pick strawberries before it got too hot. Although she is ninety now, she still works in the garden (31) ________ day. I hope I will have a garden like hers (32) ________ I am older.`;

const open = (n: number, answers: string[]): Q => ({
    id: id(n, 'r'), section: 'reading', level: 'B1', task: READING.p6, group: 'b1-reading-6', sharePage: true, passage: GARDEN,
    kind: 'gap', text: `Gap ${n}: ___`, answers, maxWords: 1,
});

const part6: Q[] = [
    open(27, ['at', 'in']),
    open(28, ['of']),
    open(29, ['how', 'when', 'where']),
    open(30, ['so']),
    open(31, ['every', 'each']),
    open(32, ['when', 'once']),
];

// ================================================================ Listening (played twice)

const LISTENING = {
    p1: 'Listening Part 1: short extracts',
    p2: 'Listening Part 2: short conversations',
    p3: 'Listening Part 3: notes',
    p4: 'Listening Part 4: interview',
};

/** Parts 1 and 2: one short recording per question. */
const clip = (n: number, task: string, dialogue: DialogueLine[], text: string, options: string[], correctIndex: number, evidence: string): Q => ({
    id: id(n, 'l'), section: 'listening', level: 'B1', task, group: `b1-listening-clip-${n}`, dialogue, text, options, correctIndex, evidence,
});

const lp1: Q[] = [
    clip(1, LISTENING.p1, [
        line(ukWoman, "Shall we meet outside the cinema at seven? The film starts at quarter past."),
        line(second(ukMan), "Actually, I checked online. They've changed it. It starts at half past seven now, because of the late show."),
        line(ukWoman, "Oh, good. Then let's meet at quarter past and get some popcorn first."),
    ], 'What time does the film start?', ['7:00', '7:15', '7:30'], 2, 'It starts at half past seven now'),
    clip(2, LISTENING.p1, [
        line(usWoman, "I wanted to get Sam a football shirt for his birthday, but they're so expensive."),
        line(second(usMan), 'What about a book? He loves reading about space.'),
        line(usWoman, "He's got loads of those. I'll get him a cap instead. He lost his last one on holiday."),
    ], 'What will the woman buy for Sam?', ['a football shirt', 'a book about space', 'a cap'], 2, "I'll get him a cap instead"),
    clip(3, LISTENING.p1, [
        line(ukMan, "Have you seen my phone? I thought I'd left it in the car."),
        line(second(ukWoman), 'No, I looked there when I got the shopping out. Did you have it in the garden?'),
        line(ukMan, "No, I haven't been outside today. Oh, I remember. It's on the shelf in the bathroom. I was listening to music while I cleaned."),
    ], 'Where is the man\'s phone?', ['in the car', 'in the garden behind the house', 'in the bathroom'], 2, "It's on the shelf in the bathroom"),
    clip(4, LISTENING.p1, [
        line(ukWoman, "Today's rain will clear overnight, and tomorrow morning will be bright and sunny. Unfortunately, strong winds will arrive in the afternoon, so if you're planning a picnic, have it early. It'll stay dry until Thursday."),
    ], 'What will the weather be like tomorrow afternoon?', ['rainy', 'windy', 'sunny and calm'], 1, 'strong winds will arrive in the afternoon'),
    clip(5, LISTENING.p1, [
        line(usWoman, "I was going to drive to the conference, but my car's at the garage."),
        line(second(usMan), "There's a train every hour, isn't there?"),
        line(usWoman, "There is, but it's really expensive. My colleague Ben is going too, so he's giving me a lift."),
    ], 'How will the woman travel to the conference?', ['in her own car', 'on the train that leaves every hour', "in a colleague's car"], 2, "he's giving me a lift"),
    clip(6, LISTENING.p1, [
        line(ukMan, "For Friday's trip to the castle, you don't need any money, because lunch is included. Please wear comfortable shoes, and bring a waterproof jacket, because we'll be outside most of the day. You won't need your notebooks."),
    ], 'What do the students need to bring on the school trip?', ['money for lunch', 'a waterproof jacket', 'a notebook'], 1, 'bring a waterproof jacket'),
    clip(7, LISTENING.p1, [
        line(usWoman, 'I used to do gymnastics, but I hurt my back last year.'),
        line(second(usMan), 'So did you stop doing sport?'),
        line(usWoman, "No, my doctor said swimming would be good for me, so I go to the pool three times a week. I'd like to try tennis next year, though."),
    ], 'Which sport does the woman do now?', ['gymnastics', 'swimming', 'tennis'], 1, 'so I go to the pool three times a week'),
];

const lp2: Q[] = [
    clip(8, LISTENING.p2, [
        line(ukMan, 'So, was the concert as good as you hoped?'),
        line(second(ukWoman), "The band were brilliant, honestly. It's just a shame the sound was so bad where we were standing. I could hardly hear the singer."),
    ], 'What did the woman think of the concert?', [
        'The band played badly.',
        'The music was hard to hear from where she was.',
        'The tickets for the concert were much too expensive.',
    ], 1, 'I could hardly hear the singer'),
    clip(9, LISTENING.p2, [
        line(usWoman, "How's the new job going?"),
        line(second(usMan), "Well, the people are friendly and the work's interesting. The only thing is the journey. It takes me nearly two hours a day, so I'm already looking at flats closer to the office."),
    ], 'How does the man feel about his new job?', [
        'He is unhappy about how long it takes to get there.',
        'He finds his new colleagues unfriendly and hard to talk to.',
        'He thinks the work is boring.',
    ], 0, 'It takes me nearly two hours a day'),
    clip(10, LISTENING.p2, [
        line(ukWoman, 'I think we should do our project on recycling. Although everyone does that, I suppose.'),
        line(second(ukMan), 'True. What about food waste in the school canteen? We could interview the cooks.'),
        line(ukWoman, "That's much more original. And we'd have real information. Let's do that."),
    ], 'What do the students decide to do for their project?', [
        'write about recycling',
        'study food waste at their school',
        'interview people in a supermarket',
    ], 1, 'What about food waste in the school canteen?'),
    clip(11, LISTENING.p2, [
        line(usMan, 'How was Portugal?'),
        line(second(usWoman), 'Lovely, apart from the first day. The hotel had given our room to someone else, so we had to stay somewhere else for a night. After that, everything was perfect: the weather, the beaches, the food.'),
    ], 'What problem did the woman have on holiday?', [
        'The weather was bad for most of the week they were there.',
        'Her hotel room was not available at first.',
        'The food made her feel ill.',
    ], 1, 'The hotel had given our room to someone else'),
    clip(12, LISTENING.p2, [
        line(ukMan, 'We lost three one.'),
        line(second(ukWoman), 'Oh no. Did you play badly?'),
        line(ukMan, "No, I actually played really well, and I scored our goal. I'm annoyed because the coach is moving me to a different team next season, and all my friends are staying here."),
    ], 'Why is the young man upset?', [
        'His team lost the match.',
        'He did not score a goal.',
        'He will not play with his friends next season.',
    ], 2, 'all my friends are staying here'),
    clip(13, LISTENING.p2, [
        line(usWoman, 'Have you watched the new detective series yet?'),
        line(second(usMan), "I've seen four episodes. The story's clever, but it's so slow. Half of each episode is people walking around in the rain. I'll probably finish it, though. I want to know who did it."),
    ], 'What does the man say about the series?', [
        'It is too slow.',
        'The story is confusing.',
        'He has stopped watching it.',
    ], 0, "it's so slow"),
];

const FESTIVAL = [
    line(ukWoman, "Hello and welcome to What's On. This week I'm talking about the Riverside Arts Festival, which runs from the second to the ninth of August. The festival takes place in Victoria Park, and this year there will be three stages instead of two."),
    line(ukWoman, "The main stage will have concerts every evening, starting at seven o'clock. On the second stage there will be comedy shows, and the third stage is for theatre, including a new play written by local schoolchildren."),
    line(ukWoman, "If you're interested in art, don't miss the painting workshop on Saturday morning. You don't need any experience, and all materials are free, but you must book a place on the festival website."),
    line(ukWoman, "Tickets for the whole week cost forty pounds, or you can buy a ticket for one day for eight pounds. Children under twelve go in free. And finally, the organisers are asking everyone to come by bike or on foot, because there won't be any parking near the park this year."),
];

const note = (n: number, text: string, answers: string[], evidence: string): Q => ({
    id: id(n, 'l'), section: 'listening', level: 'B1', task: LISTENING.p3, group: 'b1-listening-3', dialogue: FESTIVAL,
    kind: 'gap', text, answers, maxWords: 1, allowNumber: true, evidence,
});

const lp3: Q[] = [
    note(14, 'The festival takes place in ___ Park.', ['Victoria'], 'takes place in Victoria Park'),
    note(15, 'This year there will be ___ stages.', ['three', '3'], 'there will be three stages'),
    note(16, "Concerts on the main stage start at ___ o'clock.", ['seven', '7'], "starting at seven o'clock"),
    note(17, 'The third stage is for ___.', ['theatre', 'theater'], 'the third stage is for theatre'),
    note(18, 'To join the painting workshop, book a place on the festival ___.', ['website'], 'book a place on the festival website'),
    note(19, 'A ticket for one day costs £___.', ['eight', '8'], 'a ticket for one day for eight pounds'),
];

const host = ukWoman;
const chef = second(usMan);
const INTERVIEW = [
    line(host, 'My guest today is Marco Ruiz, who at nineteen runs one of the most popular food stalls in the city market. Marco, how did it all start?'),
    line(chef, "Well, I wasn't a good student, to be honest. The only lesson I really enjoyed was cooking, and my teacher said I had a natural talent. That gave me the confidence to try."),
    line(host, 'And why a market stall rather than a restaurant?'),
    line(chef, "Mainly because it's cheap. Renting a restaurant would cost thousands every month, but a stall costs less than a hundred pounds a week. I wanted to see if people liked my food before spending lots of money."),
    line(host, 'What do you sell?'),
    line(chef, "Tacos, mostly, using my grandmother's recipes from Mexico. I change the fillings every week, depending on which vegetables are cheapest at the market."),
    line(host, "What's the hardest thing about the job?"),
    line(chef, "People think it's the cooking, but it's actually the early mornings. I'm at the market by five to buy ingredients. I go to bed at nine most nights, which my friends find hilarious."),
    line(host, "And what's next for you?"),
    line(chef, "I'd love to open a small café one day, but not yet. First I want to do a business course, because I've realised I don't know enough about money."),
];

const ask = (n: number, text: string, options: string[], correctIndex: number, evidence: string): Q => ({
    id: id(n, 'l'), section: 'listening', level: 'B1', task: LISTENING.p4, group: 'b1-listening-4', dialogue: INTERVIEW, text, options, correctIndex, evidence,
});

const lp4: Q[] = [
    ask(20, 'What made Marco decide to become a cook?', [
        'his good results at school',
        "his teacher's encouragement",
        "his grandmother's advice",
    ], 1, 'my teacher said I had a natural talent'),
    ask(21, 'Why did Marco choose a market stall?', [
        'It was much cheaper than a restaurant.',
        'He could not find a restaurant to rent.',
        'His family already had a stall there.',
    ], 0, 'a stall costs less than a hundred pounds a week'),
    ask(22, 'What does Marco say about the food he sells?', [
        'He invents all the recipes he uses himself, without any help.',
        'He only cooks with meat.',
        'The fillings change from week to week.',
    ], 2, 'I change the fillings every week'),
    ask(23, 'What does Marco find most difficult about his job?', [
        'cooking for so many people',
        'getting up very early',
        'dealing with difficult customers',
    ], 1, "it's actually the early mornings"),
    ask(24, "How do Marco's friends react to his daily routine?", [
        'They find it funny.',
        'They are worried about him.',
        'They would like to join him.',
    ], 0, 'which my friends find hilarious'),
    ask(25, 'What does Marco plan to do next?', [
        'open a café as soon as possible',
        'go and live in Mexico',
        'study business',
    ], 2, 'First I want to do a business course'),
];

export const cambridgeB1Questions: Q[] = [...part1, ...part2, ...part3, ...part4, ...part5, ...part6, ...lp1, ...lp2, ...lp3, ...lp4];

// ================================================================ Writing and Speaking

export const cambridgeB1Writing: ExamWritingTask[] = [
    {
        id: 'w_b1_email',
        title: 'Writing Part 1: email (about 100 words)',
        prompt: "Read this email from your English-speaking friend, Alex, and the notes you have made. Write your email to Alex using all the notes.\n\n\"Hi! I'm visiting your town next month for three days and I'd love to see you! What's the best way to get from the airport to the city centre? What should I visit while I'm there? I'd also like to try some local food. Any ideas? Alex\"",
        points: [
            'Great! Say when you are free.',
            'Explain the best way to get from the airport.',
            'Suggest two places to visit.',
            'Recommend a local dish and where to eat it.',
        ],
        targetWords: 'Unas 100 palabras',
        instructions: 'Responde a Alex con un tono amistoso y cubre las cuatro notas.',
    },
    {
        id: 'w_b1_choice',
        title: 'Writing Part 2: article or story (about 100 words)',
        prompt: 'Choose one of these questions and answer it.',
        choices: [
            {
                id: 'article',
                label: 'Article',
                prompt: 'You see this notice in an English-language magazine. "Articles wanted! My favourite place to relax. Where is it? What do you do there? Why do you like it so much? Write an article answering these questions."',
            },
            {
                id: 'story',
                label: 'Story',
                prompt: 'Your English teacher has asked you to write a story. Your story must begin with this sentence: "When I opened the door, I couldn\'t believe my eyes."',
            },
        ],
        targetWords: 'Unas 100 palabras',
        instructions: 'Elige una de las dos tareas. Organiza tus ideas en párrafos y usa vocabulario variado.',
    },
];

export const cambridgeB1Speaking: ExamSpeakingTask[] = [
    {
        id: 's_b1_p1',
        title: 'Speaking Part 1: interview (2 to 3 minutes)',
        prompt: 'What do you usually do at the weekend? Tell me about your best friend. What did you do last summer?',
        instructions: 'Responde cada pregunta con dos o tres oraciones y da algún detalle o razón.',
        timeSeconds: 120,
    },
    {
        id: 's_b1_p2',
        title: 'Speaking Part 2: describing a photograph (1 minute)',
        prompt: 'Describe the photograph: say who you can see, where they are, what they are doing and how you think they feel.',
        cueCard: [
            'A family of four sitting on a blanket in a park',
            'Sandwiches, fruit and a football next to them',
            'A small dog running near some trees',
            'Grey clouds in the sky behind them',
        ],
        instructions: 'En el examen verías una foto; aquí la tienes descrita. Imagínala y descríbela durante un minuto sin detenerte.',
        timeSeconds: 60,
    },
    {
        id: 's_b1_p3',
        title: 'Speaking Part 3: making a decision (2 to 3 minutes)',
        prompt: 'A friend is moving to another country. Here are some things you could give as a leaving present: a photo album, a cookbook of local dishes, a plant, a T-shirt from your town and a guidebook. Talk about each idea and decide which would be the best present.',
        instructions: 'En el examen lo hablarías con otra persona. Comenta las ventajas de cada opción y termina con una decisión razonada.',
        timeSeconds: 150,
    },
    {
        id: 's_b1_p4',
        title: 'Speaking Part 4: discussion (3 minutes)',
        prompt: 'Is it important to keep in touch with friends who live far away? Is it better to give people presents or experiences? Why?',
        instructions: 'Da tu opinión con razones y ejemplos de tu vida.',
        timeSeconds: 180,
    },
];
