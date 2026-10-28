// Cambridge B2 First, all original: Reading and Use of English in seven parts (52 questions:
// parts 1-4 are Use of English, 5-7 Reading) and Listening in four parts (30 questions), then
// Writing and Speaking. Comprehension items quote the words that answer them in `evidence`.
// Checked by src/data/content.test.ts.
import type { AssessmentQuestion, DialogueLine, ExamSpeakingTask, ExamWritingTask } from '../../../lib/exam/types';

type Q = AssessmentQuestion;
type Voice = Omit<DialogueLine, 'text'>;

const line = (voice: Voice, text: string): DialogueLine => ({ ...voice, text });
const ukWoman: Voice = { speaker: 'A', accent: 'UK', gender: 'female' };
const ukMan: Voice = { speaker: 'A', accent: 'UK', gender: 'male' };
const usWoman: Voice = { speaker: 'A', accent: 'US', gender: 'female' };
const usMan: Voice = { speaker: 'A', accent: 'US', gender: 'male' };
const second = (v: Voice): Voice => ({ ...v, speaker: 'B' });

const id = (n: number, section: 'r' | 'l') => `b2_${section}${n}`;

// One paper, "Reading and Use of English". For the scores Cambridge reports, Parts 1 and 5-7
// count as Reading and Parts 2-4 as Use of English; Parts 4, 5 and 6 are worth 2 marks.
const PART = {
    p1: 'Reading and Use of English Part 1: multiple-choice cloze',
    p2: 'Reading and Use of English Part 2: open cloze',
    p3: 'Reading and Use of English Part 3: word formation',
    p4: 'Reading and Use of English Part 4: key word transformation',
    p5: 'Reading and Use of English Part 5: multiple choice',
    p6: 'Reading and Use of English Part 6: gapped text',
    p7: 'Reading and Use of English Part 7: multiple matching',
};

// ================================================================ Use of English

const VINYL = `The Return of Vinyl

In an age when almost any song can be (1) ________ on a phone in seconds, it might seem strange that sales of vinyl records have risen every year for over a decade. Yet many music lovers (2) ________ that listening to a record is a completely different experience. Because you cannot easily skip tracks, you are more (3) ________ to listen to an album from beginning to end, as the artist intended.

Collectors also (4) ________ great value on the large covers, which often feature specially commissioned artwork. Record shops, which many people expected to (5) ________ out of business, have become popular meeting places, and some even (6) ________ live performances by local bands.

Critics point out that records are expensive and easily damaged, and that most buyers still (7) ________ on streaming services for everyday listening. Nevertheless, there is no (8) ________ that the format has found a new generation of fans.`;

const mcCloze = (n: number, options: string[], correctIndex: number): Q => ({
    id: id(n, 'r'), section: 'reading', level: 'B2', task: PART.p1, group: 'b2-uoe-1', sharePage: true, passage: VINYL,
    text: `Which word fits gap ${n}?`, options, correctIndex,
});

const uoe1: Q[] = [
    mcCloze(1, ['flowed', 'streamed', 'run', 'poured'], 1),
    mcCloze(2, ['tell', 'speak', 'claim', 'talk'], 2),
    mcCloze(3, ['likely', 'possible', 'probable', 'sure'], 0),
    mcCloze(4, ['give', 'take', 'make', 'place'], 3),
    mcCloze(5, ['fall', 'go', 'run', 'come'], 1),
    mcCloze(6, ['keep', 'bring', 'host', 'lead'], 2),
    mcCloze(7, ['rely', 'trust', 'insist', 'believe'], 0),
    mcCloze(8, ['sense', 'reason', 'worry', 'doubt'], 3),
];

const LISTS = `Why We Love Lists

Have you (9) ________ wondered why lists are so popular? Whether it is a shopping list or an article (10) ________ the ten places to visit before you die, lists seem to attract our attention. Psychologists believe this is (11) ________ our brains like information that is organised and easy to process. A list also tells us exactly how big a task is, (12) ________ makes us feel more in control.

Interestingly, people who write to-do lists tend to sleep better, (13) ________ to one study. Writing down what needs to be done the (14) ________ day seems to stop people from worrying about it at night. However, lists can also become a problem (15) ________ they grow too long. Experts recommend keeping (16) ________ to no more than five items.`;

const openCloze = (n: number, answers: string[]): Q => ({
    id: id(n, 'r'), section: 'use-of-english', level: 'B2', task: PART.p2, group: 'b2-uoe-2', sharePage: true, passage: LISTS,
    kind: 'gap', text: `Gap ${n}: ___`, answers, maxWords: 1,
});

const uoe2: Q[] = [
    openCloze(9, ['ever', 'never']),
    openCloze(10, ['about', 'on', 'with', 'listing']),
    openCloze(11, ['because']),
    openCloze(12, ['which']),
    openCloze(13, ['according']),
    openCloze(14, ['next', 'following']),
    openCloze(15, ['if', 'when', 'once']),
    openCloze(16, ['them', 'lists']),
];

const GAMING = `A Career in Games

Many young people dream of a career in video games, but few realise how (17) ________ (COMPETE) the industry is. Every year, thousands of (18) ________ (APPLY) send their work to the same few studios. Technical skills are important, but employers also look for (19) ________ (CREATE) and the ability to work in a team.

One (20) ________ (SUCCESS) designer told us that her first game was a complete (21) ________ (FAIL). 'Nobody bought it,' she said, 'but I learned more from that than from anything else.' Her advice to beginners is to build a (22) ________ (COLLECT) of small projects. 'It doesn't matter if they're (23) ________ (PERFECT),' she explained. 'What matters is showing that you can finish things.' Working in games is rarely (24) ________ (RELAX), but she says it is the most rewarding job she can imagine.`;

const formation = (n: number, stem: string, answer: string): Q => ({
    id: id(n, 'r'), section: 'use-of-english', level: 'B2', task: PART.p3, group: 'b2-uoe-3', sharePage: true, passage: GAMING,
    kind: 'gap', text: `Gap ${n} (${stem}): ___`, answers: [answer], maxWords: 1,
});

const uoe3: Q[] = [
    formation(17, 'COMPETE', 'competitive'),
    formation(18, 'APPLY', 'applicants'),
    formation(19, 'CREATE', 'creativity'),
    formation(20, 'SUCCESS', 'successful'),
    formation(21, 'FAIL', 'failure'),
    formation(22, 'COLLECT', 'collection'),
    formation(23, 'PERFECT', 'imperfect'),
    formation(24, 'RELAX', 'relaxing'),
];

/** Key word transformation: two to five words, including the word given. */
const transform = (n: number, original: string, keyWord: string, frame: string, answers: string[]): Q => ({
    id: id(n, 'r'), section: 'use-of-english', level: 'B2', task: PART.p4, marks: 2,
    kind: 'gap', text: `${original} (${keyWord}) → ${frame}`, answers, maxWords: 5,
    instruction: 'Write between TWO and FIVE words, including the word given. Do not change the word given.',
});

const uoe4: Q[] = [
    transform(25, "I haven't been to the cinema for six months.", 'LAST', 'The ___ to the cinema was six months ago.', ['last time I went', 'last time that I went']),
    transform(26, "It's possible that Sarah forgot about the meeting.", 'MIGHT', 'Sarah ___ about the meeting.', ['might have forgotten', "might've forgotten"]),
    transform(27, '"Don\'t touch the paintings," the guide said to us.', 'TOLD', 'The guide ___ the paintings.', ['told us not to touch']),
    transform(28, "I'd prefer you not to smoke in the house.", 'RATHER', "I'd ___ smoke in the house.", ["rather you didn't", 'rather you did not']),
    transform(29, 'They cancelled the concert because of the storm.', 'CALLED', 'The concert ___ because of the storm.', ['was called off']),
    transform(30, 'Tom regrets not studying harder at school.', 'WISHES', 'Tom ___ harder at school.', ['wishes he had studied', "wishes he'd studied", 'wishes that he had studied', "wishes that he'd studied"]),
];

// ================================================================ Reading

const LOST = `Learning to Get Lost

Travel writer Clara Ruiz on what she gained by putting her phone away.

When I first started travelling, I carried a paper map, a phrasebook and a great deal of anxiety. I spent most of my first trip abroad convinced that I was about to take a wrong turn and end up somewhere dangerous. Twenty years later, I have a phone that tells me exactly where I am, how long it will take to reach my hotel and which café nearby has the best reviews. I should feel more relaxed than ever. Strangely, I don't.

The problem, I have come to realise, is not that navigation apps are unreliable. On the contrary, they work almost too well. Because the app always knows the fastest route, I rarely have a reason to look up from the screen. I arrive at famous squares and museums without having noticed anything on the way. A friend of mine, a geographer, calls this 'tunnel travel': moving efficiently from one point to another while the city itself passes by unseen.

There is some research to support her view. In one experiment, volunteers were asked to find their way around an unfamiliar town, some with a navigation app and some with a paper map. Afterwards, those who had used the app were much worse at drawing a map of the area from memory, and they remembered fewer of the buildings they had passed. The researchers suggested that when we simply follow instructions, the parts of the brain responsible for building mental maps are less active.

None of this means we should throw our phones away. Last year, in a village in northern Portugal, my app guided me down a mountain road in a storm, and I was extremely grateful for it. But I have started to experiment. On my first day in a new city, I now leave my phone in the hotel and walk without a plan for a couple of hours. Occasionally this ends in frustration. More often, it leads me to places no algorithm would have recommended: a tiny bookshop run by a retired sailor, a street festival I would never have heard about, a bench with a view that I still think about.

Getting lost, I have discovered, is a skill that needs practice. At first, the uncertainty made me nervous, and I kept wanting to check where I was. After a few days, the feeling changed into something closer to curiosity. I started asking people for directions, which led to conversations I would never otherwise have had. One woman in Naples walked ten minutes out of her way to show me a street and then insisted on introducing me to her cousin, who owned a restaurant.

I am not suggesting that everyone should abandon technology when they travel. But I do think it is worth asking what we lose when we are never uncertain about where we are. The most memorable moments of my journeys have rarely been the ones I planned.`;

const longText = (n: number, text: string, options: string[], correctIndex: number, evidence: string): Q => ({
    id: id(n, 'r'), section: 'reading', level: 'B2', task: PART.p5, group: 'b2-reading-5', passage: LOST, marks: 2, text, options, correctIndex, evidence,
});

const r5: Q[] = [
    longText(31, 'What does the writer say about how she feels when she travels today?', [
        'She is less anxious than she expected to be.',
        'She misses carrying a paper map with her.',
        'She is surprised that she does not feel calmer.',
        'She worries more than before that her phone will suddenly stop working.',
    ], 2, "I should feel more relaxed than ever. Strangely, I don't."),
    longText(32, "What does the writer's friend mean by 'tunnel travel'?", [
        'reaching places quickly without noticing what is around you',
        'travelling underground in large cities to save time',
        'following exactly the same route on every trip',
        'visiting only the places that are famous',
    ], 0, 'moving efficiently from one point to another while the city itself passes by unseen'),
    longText(33, 'What did the experiment described in the third paragraph show?', [
        'People who used paper maps got lost more often.',
        'Most people prefer using apps to paper maps when they are in a new town.',
        'Using an app makes people walk more slowly.',
        'App users remembered less about the area they had walked through.',
    ], 3, 'they remembered fewer of the buildings they had passed'),
    longText(34, 'Why does the writer mention her trip to Portugal?', [
        'to describe a time when she got completely lost',
        'to show that navigation apps can be very useful',
        'to explain why she now avoids mountain roads',
        'to suggest that apps work badly in small villages',
    ], 1, 'I was extremely grateful for it'),
    longText(35, 'What does the writer say about walking without a plan?', [
        'It usually ends in frustration.',
        'She only does it in small towns where it is impossible to get really lost.',
        'It often takes her to places she would not have found otherwise.',
        'She does it for the whole of her first day.',
    ], 2, 'it leads me to places no algorithm would have recommended'),
    longText(36, 'How did the writer\'s feelings about being lost change?', [
        'She became more nervous as time went on.',
        'Her nervousness turned into curiosity.',
        'She learned to check her position more often.',
        'She realised she preferred to travel with friends.',
    ], 1, 'the feeling changed into something closer to curiosity'),
];

const SEEDS = `The Woman Who Saves Seeds

In a quiet laboratory outside the city, Dr Amira Hassan keeps one of the most unusual collections in the country. It is not made up of paintings or ancient coins, but of seeds. (37) ________

Hassan started collecting seeds twenty years ago, after visiting farms in the region where she grew up. She noticed that many farmers had stopped growing the traditional crops their grandparents had planted. (38) ________ Hassan realised that if nobody kept the seeds, these varieties could disappear forever.

At first, she stored them in her kitchen. (39) ________ Today the collection contains more than eight thousand types of plants, kept at minus eighteen degrees in a specially built freezer room.

Keeping seeds frozen is only part of the work. Every few years, each variety has to be planted and grown again, because even frozen seeds slowly lose their ability to germinate. (40) ________ Volunteers spend every summer looking after hundreds of small plots of beans, wheat and tomatoes.

The value of the collection became clear three years ago, when a disease destroyed much of the region's main wheat crop. (41) ________ Within two seasons, farmers had a variety that could resist the disease, thanks to genes from a type of wheat Hassan had collected from a single elderly farmer.

Hassan is now training a team to take over when she retires. (42) ________ 'A seed is a promise,' she says. 'Somebody has to keep it.'`;

const SEED_SENTENCES = [
    'Scientists searched the collection and found an old variety that the disease could not harm.',
    'Instead, they were buying modern seeds that produced larger harvests.',
    'This means the laboratory also needs a large garden.',
    'Each packet is labelled with the name of the farmer who gave it and the place where it grew.',
    'She is confident the collection will continue long after she has gone.',
    'As the number of packets grew, she persuaded the university to give her a room.',
    'The farmers were paid well for the seeds they had saved.',
];

const gap = (n: number, correctIndex: number, evidence: string): Q => ({
    id: id(n, 'r'), section: 'reading', level: 'B2', task: PART.p6, group: 'b2-reading-6', sharePage: true, passage: SEEDS, marks: 2,
    text: `Which sentence fits gap ${n}?`, options: SEED_SENTENCES, correctIndex, fixedOrder: true, evidence,
});

const r6: Q[] = [
    gap(37, 3, 'It is not made up of paintings or ancient coins, but of seeds.'),
    gap(38, 1, 'had stopped growing the traditional crops their grandparents had planted'),
    gap(39, 5, 'At first, she stored them in her kitchen.'),
    gap(40, 2, 'Volunteers spend every summer looking after hundreds of small plots'),
    gap(41, 0, 'farmers had a variety that could resist the disease'),
    gap(42, 4, 'Hassan is now training a team to take over when she retires.'),
];

const LEARNERS = `Never Too Late: four adults who learned something new

A  Pilar, who learned to swim at 40
I grew up in a city far from the sea, and nobody in my family could swim. For years I made excuses whenever friends suggested a beach holiday. When my daughter started lessons, I finally admitted I was embarrassed. The teacher put me in a class with three other adults, which helped enormously; we laughed at our mistakes together. It took me six months to swim a length without stopping. Now I go to the pool before work twice a week, and I've even booked a holiday by the sea.

B  Kenji, who learned the piano at 55
I had always regretted giving up the piano as a boy, so when I retired I bought a second-hand one and found a teacher online. The first months were humbling: my fingers simply refused to do what my brain told them. What kept me going was setting small, specific goals, such as learning one short piece a month. I practise for twenty minutes every morning, and I've recently started playing for residents at a care home, which terrifies and delights me in equal measure.

C  Fatima, who learned car mechanics at 32
After my car broke down for the third time and the garage charged me a fortune, I signed up for an evening course in basic mechanics. I was the only woman in the group, and at first some of the men assumed I'd come with my husband. That annoyed me, but it also made me determined. The course was hands-on from day one, which suited me because I learn by doing. I now service my own car and help friends with theirs, and I've saved a lot of money.

D  Owen, who learned Italian at 47
I started learning Italian because my son married an Italian woman, and I wanted to talk to her family. I tried apps first, but I found it hard to stay motivated on my own. Joining a conversation group at the local library made all the difference, because I had to turn up and speak every week. My progress has been slower than I hoped, and grammar still confuses me, but last summer I managed a whole dinner with my son's in-laws without a translator.`;

const PEOPLE = ['Pilar', 'Kenji', 'Fatima', 'Owen'];

const who = (n: number, text: string, correctIndex: number, evidence: string): Q => ({
    id: id(n, 'r'), section: 'reading', level: 'B2', task: PART.p7, group: 'b2-reading-7', sharePage: true, passage: LEARNERS,
    text: `Which person ${text}`, options: PEOPLE, correctIndex, fixedOrder: true, evidence,
});

const r7: Q[] = [
    who(43, 'felt embarrassed about not having the skill?', 0, 'I finally admitted I was embarrassed'),
    who(44, "was motivated by a relative's marriage?", 3, 'my son married an Italian woman'),
    who(45, 'says that laughing at their mistakes with others made learning easier?', 0, 'we laughed at our mistakes together'),
    who(46, 'decided to learn after an expensive experience?', 2, 'the garage charged me a fortune'),
    who(47, 'sets themselves small targets?', 1, 'setting small, specific goals'),
    who(48, "reacted to other people's assumptions with determination?", 2, 'it also made me determined'),
    who(49, 'now performs for other people?', 1, 'playing for residents at a care home'),
    who(50, 'found it difficult to study alone?', 3, 'I found it hard to stay motivated on my own'),
    who(51, 'learns best through practical activity?', 2, 'I learn by doing'),
    who(52, 'admits that their progress has been slower than expected?', 3, 'My progress has been slower than I hoped'),
];

// ================================================================ Listening (played twice)

const LISTENING = {
    p1: 'Listening Part 1: short extracts',
    p2: 'Listening Part 2: sentence completion',
    p3: 'Listening Part 3: multiple matching',
    p4: 'Listening Part 4: interview',
};

const extract = (n: number, dialogue: DialogueLine[], text: string, options: string[], correctIndex: number, evidence: string): Q => ({
    id: id(n, 'l'), section: 'listening', level: 'B2', task: LISTENING.p1, group: `b2-listening-clip-${n}`, dialogue, text, options, correctIndex, evidence,
});

const lp1: Q[] = [
    extract(1, [
        line(ukWoman, "I'd done cookery classes before, so I knew most of the techniques already. And the kitchen was a bit cramped, to be honest. But the chef had worked all over the world, and the stories she told about where each dish came from were fascinating. That's what I'll remember."),
    ], 'What did the woman like most about the cookery course?', [
        'learning new techniques she had not seen before',
        "the chef's stories about each dish",
        'the modern kitchen',
    ], 1, 'the stories she told about where each dish came from were fascinating'),
    extract(2, [
        line(usMan, "The acting was superb, wasn't it?"),
        line(second(usWoman), "Mostly. I thought the lead was a bit wooden. But that ending! I didn't see it coming at all."),
        line(usMan, 'Nor did I. Brilliant twist.'),
    ], 'What do the two friends agree about?', [
        'The acting was excellent throughout.',
        'The ending was surprising.',
        'The film was too long.',
    ], 1, "I didn't see it coming at all"),
    extract(3, [
        line(ukMan, "When I started, I loved the idea of saving lives. The reality is that ninety-nine per cent of the time you're telling children not to run. I still think it's an important job, but I'm looking for something with more variety."),
    ], 'How does the man feel about his job as a lifeguard now?', [
        'He wants to do something less repetitive.',
        'He finds it too dangerous.',
        'He no longer thinks that the work he does is important.',
    ], 0, "I'm looking for something with more variety"),
    extract(4, [
        line(usWoman, "The campus was gorgeous and the course looked great on paper. But when I talked to current students, they said they hardly ever saw their lecturers. It was all online. I need face-to-face teaching, so I crossed it off my list."),
    ], 'Why did the student decide not to apply to the university?', [
        'She did not like the campus.',
        'The course content did not match what she wanted to study.',
        'There would be too little contact with teachers.',
    ], 2, 'they hardly ever saw their lecturers'),
    extract(5, [
        line(ukMan, "Tonight we're looking at why so many of us find it impossible to switch off from work emails, and what happens to our sleep, our relationships and our health when we can't. We'll also hear from a company that has banned emails after six p.m."),
    ], 'What is tonight\'s programme mainly about?', [
        'the effects of not being able to stop working',
        'how to write clearer emails at work',
        'companies that let their staff choose flexible working hours',
    ], 0, 'find it impossible to switch off from work emails'),
    extract(6, [
        line(usMan, "Hello, I've got a reservation for this weekend under the name Patel. I'm not cancelling, don't worry. I just wanted to check whether the room has a bath rather than a shower. My son's got a cast on his leg, you see."),
    ], 'Why is the man calling the hotel?', [
        'to cancel his booking for the weekend',
        'to book an extra bed for his son',
        'to ask about the bathroom in his room',
    ], 2, 'whether the room has a bath rather than a shower'),
    extract(7, [
        line(ukMan, 'That meeting was a waste of time again. Two hours and we didn\'t decide anything.'),
        line(second(ukWoman), "I know. Maybe next time we should send everyone the questions beforehand, so people come prepared. It's not that we need fewer meetings. We just need better ones."),
    ], 'What does the woman suggest?', [
        'sharing the questions before the meeting',
        'having fewer meetings',
        'holding meetings at a different time of day',
    ], 0, 'send everyone the questions beforehand'),
    extract(8, [
        line(usWoman, "Everyone told me it would change my life. It didn't, but it's a good read: well written and funny in places. I just think the author makes the same point about twenty times."),
    ], 'What is the woman\'s opinion of the book?', [
        'It changed the way she thinks.',
        'It is badly written.',
        'It is enjoyable but repetitive.',
    ], 2, 'the author makes the same point about twenty times'),
];

const PILOT = [
    line(usWoman, "Hi, everyone. I'm Sofia, and for the last eight years I've worked as a hot-air balloon pilot. People often ask how I got into it. Actually, I trained as an accountant, and I only tried ballooning because my sister bought me a flight as a birthday present. By the time we landed, I'd decided to change careers."),
    line(usWoman, "Getting a licence takes longer than most people think. You need at least sixteen hours of flying with an instructor, and you have to pass written exams in weather and navigation. The weather is by far the most important part of the job. We can only fly when the winds are light, which usually means the first few hours after sunrise or just before sunset. In summer, that means getting up at four in the morning."),
    line(usWoman, "A typical flight lasts about an hour, but the whole day takes much longer, because the balloon has to be prepared, and afterwards it has to be packed away. That's done by my ground crew, who follow the balloon in a van and meet us wherever we land. Landing is the part passengers find most exciting, because we can't choose exactly where we'll come down. Farmers are usually very friendly about it, especially if we give them a bottle of champagne, which is an old ballooning tradition."),
    line(usWoman, "The thing I love most is the silence. Once the burner is off, you can hear dogs barking and people talking on the ground below. My advice to anyone who wants to try it is to book a flight in autumn, when the colours are at their best."),
];

const complete = (n: number, text: string, answers: string[], evidence: string): Q => ({
    id: id(n, 'l'), section: 'listening', level: 'B2', task: LISTENING.p2, group: 'b2-listening-2', dialogue: PILOT,
    kind: 'gap', text, answers, maxWords: 3, allowNumber: true, evidence,
});

const lp2: Q[] = [
    complete(9, 'Before becoming a pilot, Sofia worked as an ___.', ['accountant'], 'I trained as an accountant'),
    complete(10, 'She first went up in a balloon because her ___ gave her a flight.', ['sister'], 'my sister bought me a flight'),
    complete(11, 'You need at least ___ hours of flying with an instructor.', ['sixteen', '16'], 'at least sixteen hours of flying'),
    complete(12, 'The written exams are about weather and ___.', ['navigation'], 'written exams in weather and navigation'),
    complete(13, 'Balloons can only fly when the ___ are light.', ['winds', 'wind'], 'when the winds are light'),
    complete(14, 'In summer, Sofia gets up at ___ in the morning.', ['four', '4', "four o'clock", "4 o'clock"], 'getting up at four in the morning'),
    complete(15, 'The balloon is followed in a van by the ___.', ['ground crew', 'crew'], 'my ground crew, who follow the balloon in a van'),
    complete(16, 'Passengers find the ___ the most exciting part.', ['landing'], 'Landing is the part passengers find most exciting'),
    complete(17, 'Farmers are traditionally given a bottle of ___.', ['champagne'], 'a bottle of champagne'),
    complete(18, 'Sofia recommends booking a flight in ___.', ['autumn', 'the autumn', 'fall'], 'book a flight in autumn'),
];

const SPEAKERS = [
    line(ukWoman, "Speaker one. I'd been an office manager for ten years, and I was good at it. But I'd started getting headaches every afternoon, and my doctor said it was stress. I didn't want to wait until something worse happened, so I left. Now I teach yoga, and I've never felt better."),
    line(second(usMan), "Speaker two. Everyone assumed I left the bank for the money, because my new employer pays a bit more. Honestly, that had nothing to do with it. I spent my whole day looking at spreadsheets, and I missed using my imagination. Designing websites gives me that."),
    line(usWoman, "Speaker three. My old job was in the city centre, and the commute was over an hour each way. When a position came up at the hospital in my own town, I applied straight away. The work's quite similar, but now I walk to work and I get home in time to see my kids."),
    line(second(ukMan), "Speaker four. I used to work in a sports shop, which was fine, but I'd always wanted to do something that made a real difference. I volunteered at a homeless shelter at weekends, and in the end they offered me a full-time job. I earn less, but I go home feeling useful."),
    line(ukWoman, "Speaker five. The factory announced it was shutting down at the end of the year, so all of us had to find something new. I'd always enjoyed gardening, so I retrained as a landscape gardener. I'm outside all day now, whatever the weather, and I love it."),
];

const REASONS = [
    'I wanted to work closer to home.',
    'I needed a more creative job.',
    'I was offered a much higher salary.',
    'I wanted to help other people.',
    'My health was suffering.',
    'I wanted to work outdoors.',
    'My workplace was closing down.',
    'I wanted to travel more.',
];

const speaker = (n: number, s: number, correctIndex: number, evidence: string): Q => ({
    id: id(n, 'l'), section: 'listening', level: 'B2', task: LISTENING.p3, group: 'b2-listening-3', dialogue: SPEAKERS,
    text: `Why did speaker ${s} change jobs?`, options: REASONS, correctIndex, fixedOrder: true, evidence,
});

const lp3: Q[] = [
    speaker(19, 1, 4, 'my doctor said it was stress'),
    speaker(20, 2, 1, 'I missed using my imagination'),
    speaker(21, 3, 0, 'now I walk to work'),
    speaker(22, 4, 3, 'something that made a real difference'),
    speaker(23, 5, 6, 'The factory announced it was shutting down'),
];

const presenter = ukMan;
const sailor = second(usWoman);
const VOYAGE = [
    line(presenter, "Nadia, you've just become one of the youngest people to sail around the world alone. Where did the idea come from?"),
    line(sailor, "People expect me to say I grew up on boats, but I didn't. I only learned to sail at university, because a friend needed someone to make up the numbers in a race. What really started it was a book I read about a woman who'd done the trip in the 1980s. I thought, if she could do it with the equipment she had, why couldn't I?"),
    line(presenter, 'How did you prepare?'),
    line(sailor, "The sailing skills were the easy part, in a way. What I hadn't expected was how much time I'd spend raising money. I wrote to over two hundred companies, and most of them didn't reply. In the end, a small family firm that makes sails paid for most of it."),
    line(presenter, 'What was the hardest moment at sea?'),
    line(sailor, "Everybody asks about the storms, and yes, there were some frightening nights. But the worst moment was actually in the Pacific, when there was no wind at all for nine days. I just sat there, going nowhere, and I started to doubt whether I'd ever finish."),
    line(presenter, 'How did you cope with being alone for so long?'),
    line(sailor, "I recorded a short video every day for my followers, and reading their messages made me feel that hundreds of people were on the boat with me."),
    line(presenter, 'And how does it feel to be back?'),
    line(sailor, "Strange, honestly. Supermarkets are overwhelming, there's too much choice. And I keep waking up at three in the morning to check the wind."),
    line(presenter, "What's next?"),
    line(sailor, "I want to help other young women get into sailing, because there are still very few of us. I'm setting up a scheme that gives free lessons to teenagers who've never been on a boat."),
];

const interview = (n: number, text: string, options: string[], correctIndex: number, evidence: string): Q => ({
    id: id(n, 'l'), section: 'listening', level: 'B2', task: LISTENING.p4, group: 'b2-listening-4', dialogue: VOYAGE, text, options, correctIndex, evidence,
});

const lp4: Q[] = [
    interview(24, 'How did Nadia become interested in sailing around the world?', [
        'She grew up on boats with her family.',
        "She read about another sailor's voyage.",
        'She won a race while she was at university.',
    ], 1, "a book I read about a woman who'd done the trip"),
    interview(25, 'What surprised Nadia while she was preparing for the trip?', [
        'how much effort it took to find money',
        'how difficult the sailing skills were',
        'how many companies wanted to help her',
    ], 0, "how much time I'd spend raising money"),
    interview(26, 'What was the worst part of the voyage for Nadia?', [
        'the storms at night',
        'an injury in the Pacific',
        'a long period without any wind',
    ], 2, 'no wind at all for nine days'),
    interview(27, 'What helped Nadia feel less alone at sea?', [
        'phoning her family every evening',
        'contact with the people who followed her trip',
        'listening to music and podcasts for many hours every day',
    ], 1, 'reading their messages made me feel that hundreds of people were on the boat with me'),
    interview(28, 'What does Nadia find difficult since coming home?', [
        'dealing with so much choice in shops',
        'talking to journalists about the trip',
        'living with other people again',
    ], 0, 'Supermarkets are overwhelming'),
    interview(29, 'What habit from the voyage does Nadia still have?', [
        'eating very small meals',
        'recording a short video for her followers every day',
        'waking up at night to check the weather',
    ], 2, 'I keep waking up at three in the morning to check the wind'),
    interview(30, 'What does Nadia plan to do next?', [
        'help young women start sailing',
        'sail around the world again',
        'write a book about her trip',
    ], 0, 'I want to help other young women get into sailing'),
];

export const cambridgeB2Questions: Q[] = [...uoe1, ...uoe2, ...uoe3, ...uoe4, ...r5, ...r6, ...r7, ...lp1, ...lp2, ...lp3, ...lp4];

// ================================================================ Writing and Speaking

export const cambridgeB2Writing: ExamWritingTask[] = [
    {
        id: 'w_b2_essay',
        title: 'Writing Part 1: essay (140 to 190 words)',
        prompt: 'In your English class you have been talking about technology and education. Now your English teacher has asked you to write an essay. Write an essay using all the notes and give reasons for your point of view.\n\n"Should schools ban mobile phones?"',
        points: ['learning', 'safety', 'your own idea'],
        targetWords: 'Entre 140 y 190 palabras',
        instructions: 'Ensayo obligatorio: desarrolla los tres puntos de las notas (el tercero es una idea tuya) y da una conclusión clara.',
    },
    {
        id: 'w_b2_choice',
        title: 'Writing Part 2: email, review or report (140 to 190 words)',
        prompt: 'Choose one of these questions and answer it.',
        choices: [
            {
                id: 'email',
                label: 'Email',
                prompt: 'You have received this email from your English-speaking friend, Sam. "I\'m thinking of getting a part-time job while I study. Do you think it\'s a good idea? What kind of job should I look for?" Write your email.',
            },
            {
                id: 'review',
                label: 'Review',
                prompt: 'You see this announcement on an English-language website. "Reviews wanted! Tell us about a TV series you would recommend to people learning English. What is it about? Why is it good for learners?" Write your review.',
            },
            {
                id: 'report',
                label: 'Report',
                prompt: "The director of your language school wants to improve the school's social activities. Write a report describing the activities the school offers now and recommending how they could be improved.",
            },
        ],
        targetWords: 'Entre 140 y 190 palabras',
        instructions: 'Elige una de las tres tareas y usa el registro y la estructura propios de ese tipo de texto.',
    },
];

export const cambridgeB2Speaking: ExamSpeakingTask[] = [
    {
        id: 's_b2_p1',
        title: 'Speaking Part 1: interview (2 minutes)',
        prompt: 'Where did you grow up? What do you enjoy most about learning English? If you could live anywhere in the world, where would it be, and why?',
        instructions: 'Responde con naturalidad, ampliando cada respuesta con razones o ejemplos.',
        timeSeconds: 120,
    },
    {
        id: 's_b2_p2',
        title: 'Speaking Part 2: comparing photographs (1 minute)',
        prompt: 'Compare the two photographs and say why people might choose to eat in these different ways.',
        cueCard: [
            'Photo A: a family cooking dinner together in a busy kitchen',
            'Photo B: a young man eating alone at a fast-food counter',
        ],
        instructions: 'En el examen verías dos fotos; aquí están descritas. Compáralas y responde a la pregunta durante un minuto.',
        timeSeconds: 60,
    },
    {
        id: 's_b2_p3',
        title: 'Speaking Part 3: collaborative task (3 minutes)',
        prompt: 'Here are some ways a town could encourage people to be healthier: more cycle lanes, free sports facilities, healthier food in schools, banning cars from the centre and longer opening hours for parks. Talk about how effective each idea would be, then decide which one would make the biggest difference.',
        instructions: 'En el examen lo hablarías con otra persona. Evalúa las opciones, compáralas y llega a una decisión razonada.',
        timeSeconds: 180,
    },
    {
        id: 's_b2_p4',
        title: 'Speaking Part 4: discussion (4 minutes)',
        prompt: "Some people say it is the government's job to make people healthier. Do you agree? Is it easier to live a healthy life now than it was fifty years ago?",
        instructions: 'Desarrolla tus ideas, considera otros puntos de vista y justifica tu opinión.',
        timeSeconds: 180,
    },
];
