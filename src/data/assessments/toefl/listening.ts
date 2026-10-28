// TOEFL iBT Listening (format of January 2026), adaptive like Reading: a first module for
// everyone (router), then an easier (lower) or harder (upper) one. Each module has the exam's
// four tasks: Listen and Choose a Response, a conversation, an announcement and an academic
// talk. Every recording plays once and its questions appear after it, as in the exam; they
// follow the order of the recording. All scripts are original; `evidence` quotes the words
// that give each answer (checked by src/data/content.test.ts).
import type { AssessmentQuestion, DialogueLine, ExamLevel, ExamStage } from '../../../lib/exam/types';

type Q = AssessmentQuestion;
type Voice = Omit<DialogueLine, 'text'>;

const line = (voice: Voice, text: string): DialogueLine => ({ ...voice, text });

const RESPONSE = 'Listen and Choose a Response';
const CONVERSATION = 'Listen to a Conversation';
const ANNOUNCEMENT = 'Listen to an Announcement';
const TALK = 'Listen to an Academic Talk';

const usWoman: Voice = { speaker: 'A', accent: 'US', gender: 'female' };
const usMan: Voice = { speaker: 'A', accent: 'US', gender: 'male' };
const ukWoman: Voice = { speaker: 'A', accent: 'UK', gender: 'female' };
const ukMan: Voice = { speaker: 'A', accent: 'UK', gender: 'male' };
/** The second speaker of a conversation. */
const second = (v: Voice): Voice => ({ ...v, speaker: 'B' });

function moduleKit(stage: ExamStage) {
    const id = (n: number) => `toefl_l_${stage}_${n}`;
    return {
        /** Choose a Response: one line is heard, and the learner picks the best reply. */
        response: (n: number, voice: Voice, said: string, level: ExamLevel, options: string[], correctIndex: number): Q => ({
            id: id(n), section: 'listening', level, stage, task: RESPONSE, dialogue: [line(voice, said)],
            text: 'Choose the best response.', options, correctIndex, evidence: said,
        }),
        /** Questions on one recording; `name` identifies it within the module. */
        audio: (name: string, task: string, dialogue: DialogueLine[], level: ExamLevel) =>
            (n: number, text: string, options: string[], correctIndex: number, evidence: string): Q => ({
                id: id(n), section: 'listening', level, stage, task, group: `toefl-listening-${stage}-${name}`,
                dialogue, text, options, correctIndex, evidence,
            }),
    };
}

// ================================================================ Module 1 (everyone)

const m1 = moduleKit('router');

const advisor = usMan;
const student = second(usWoman);
const M1_CONVERSATION = [
    line(advisor, 'Hi, come on in. What can I do for you?'),
    line(student, "Hi. I'm thinking about dropping my statistics course, but I'm not sure how it affects my scholarship."),
    line(advisor, 'OK. Your scholarship requires you to take at least twelve credits each semester. How many are you taking now?'),
    line(student, 'Fifteen, and statistics is three of them.'),
    line(advisor, "Then you'd still have twelve, so the scholarship isn't a problem. But can I ask why you want to drop it?"),
    line(student, "I've been working twenty hours a week at the campus café, and I keep falling behind. The last quiz went really badly."),
    line(advisor, "Have you tried the free tutoring at the Learning Center? A lot of students in statistics use it, and it's open until nine."),
    line(student, "I didn't know it stayed open that late. My shifts end at seven, so I could go after work."),
    line(advisor, "Why don't you try it for two weeks? The deadline to drop a course without a grade isn't until the twenty-eighth, so you have time to decide."),
    line(student, "That makes sense. I'll give it a try."),
];

const M1_ANNOUNCEMENT = [
    line(usMan, "Attention, students. Because of this morning's snow, all classes before noon today are cancelled. The university will open at twelve o'clock, and afternoon classes will run as normal. The dining hall in Baker House is open for breakfast as usual, but the sports center will stay closed all day so that staff can clear the paths. Please check your university email for any changes from your individual instructors."),
];

const M1_TALK = [
    line(ukWoman, 'Today I want to talk about one of the most reliable findings in the psychology of memory: the spacing effect. In the 1880s, the German researcher Hermann Ebbinghaus tested his own memory using lists of nonsense syllables.'),
    line(ukWoman, 'He found that he needed fewer total repetitions to learn a list when he spread his practice over several days than when he repeated it many times in one sitting. Since then, the effect has been confirmed in hundreds of studies, with everything from vocabulary to medical procedures.'),
    line(ukWoman, 'So why does spacing work? One explanation is that when we return to material after a gap, we have partly forgotten it, and the effort of recalling it strengthens the memory more than easy repetition does.'),
    line(ukWoman, "Interestingly, students often prefer cramming, because repeating something many times in a row makes it feel familiar, and that feeling is easily mistaken for learning. In one study, students who crammed predicted they would do better on a test than students who spaced their study. In fact, they did worse."),
];

const m1Conversation = m1.audio('conversation', CONVERSATION, M1_CONVERSATION, 'B1');
const m1Announcement = m1.audio('announcement', ANNOUNCEMENT, M1_ANNOUNCEMENT, 'B1');
const m1Talk = m1.audio('talk', TALK, M1_TALK, 'B2');

const module1: Q[] = [
    m1.response(1, usWoman, 'Do you know if the bookstore is still open?', 'B1', [
        'I think it closes at six.',
        'Yes, I read it last week.',
        "It's on the second shelf.",
        "No, I don't have a book.",
    ], 0),
    m1.response(2, ukMan, "I can't make it to the study group tonight.", 'B1', [
        'Yes, the study group is much larger this year.',
        "That's a shame. Shall I send you the notes?",
        'I made it myself.',
        'Tonight works for me too.',
    ], 1),
    m1.response(3, usWoman, "Why don't we take the train instead of driving?", 'B1', [
        'Because the train was late.',
        "I've never driven a train.",
        "Good idea. We won't have to find parking.",
        'Yes, the driver on the train was very friendly.',
    ], 2),
    m1.response(4, usMan, 'Has Professor Lee posted the grades yet?', 'B1', [
        'She teaches biology on Mondays and Wednesdays.',
        'Yes, I posted the letter.',
        'I hope the test is easy.',
        "Not yet. She said they'd be up by Friday.",
    ], 3),
    m1.response(5, ukWoman, 'Would you mind if I opened the window?', 'B2', [
        "Not at all. It's a bit warm in here.",
        "Yes, it's open.",
        "I didn't open it.",
        'The window faces the garden.',
    ], 0),
    m1Conversation(6, 'Why does the student go to see the advisor?', [
        'To ask whether she can work fewer hours at the campus café.',
        'To ask if dropping a course affects her scholarship.',
        'To sign up for tutoring.',
        'To complain about a quiz.',
    ], 1, 'how it affects my scholarship'),
    m1Conversation(7, 'Why is the student falling behind in her course?', [
        'She has too many credits.',
        'The course is not taught well.',
        'She works many hours a week.',
        'She missed the first quiz.',
    ], 2, 'working twenty hours a week at the campus café'),
    m1Conversation(8, 'What will the student probably do next?', [
        'Drop the statistics course today.',
        'Ask her manager for fewer shifts.',
        'Retake the last quiz.',
        'Go to tutoring after her shifts.',
    ], 3, 'I could go after work'),
    m1Announcement(9, 'Why are morning classes cancelled?', [
        'Because of the snow.',
        'Because of a power cut.',
        'Because of a staff meeting.',
        'Because of repairs to the paths.',
    ], 0, "Because of this morning's snow"),
    m1Announcement(10, 'What will be closed all day?', [
        'The dining hall',
        'The sports center',
        'The library',
        'The whole university',
    ], 1, 'the sports center will stay closed all day'),
    m1Talk(11, 'What is the talk mainly about?', [
        'The life of a German scientist',
        'How to learn nonsense syllables',
        'A memory effect of spreading out practice',
        'Why students prefer to study alone',
    ], 2, 'the spacing effect'),
    m1Talk(12, 'What did Ebbinghaus find?', [
        'He forgot the lists more quickly whenever he practiced late at night.',
        'Nonsense syllables were easier than real words.',
        'One long session was the most efficient.',
        'He needed fewer repetitions when practice was spread over days.',
    ], 3, 'he needed fewer total repetitions to learn a list when he spread his practice over several days'),
    m1Talk(13, 'According to the professor, why does spacing work?', [
        'Recalling partly forgotten material strengthens memory.',
        'Students are less tired after a break.',
        'Repetition in a row makes material familiar.',
        'Short sessions are easier to plan.',
    ], 0, 'the effort of recalling it strengthens the memory'),
    m1Talk(14, 'What does the professor say about the students who crammed in one study?', [
        'They studied for longer.',
        'They expected to do better than they did.',
        'They enjoyed studying more.',
        'They did as well as the students who spaced their study.',
    ], 1, 'students who crammed predicted they would do better on a test'),
];

// ================================================================ Module 2, easier (lower)

const lo = moduleKit('lower');

const librarian = ukWoman;
const borrower = second(usMan);
const LO_CONVERSATION = [
    line(borrower, "Excuse me, I'm looking for a book for my history class, but the computer says it's checked out."),
    line(librarian, 'Let me see. Yes, someone has it until next Monday. Would you like me to reserve it for you?'),
    line(borrower, 'Yes, please. But my essay is due on Friday.'),
    line(librarian, 'In that case, you could use the online version. We have an electronic copy that you can read on the library website.'),
    line(borrower, 'Oh, great. Do I need a password?'),
    line(librarian, 'Just your student number and the password you use for your university email.'),
    line(borrower, 'Perfect. Thanks so much.'),
];

const LO_ANNOUNCEMENT = [
    line(usWoman, "Good afternoon, shoppers. The store will close in fifteen minutes, at eight o'clock. Please bring your items to the checkouts at the front of the store. Today only, all fruit and vegetables are half price. Thank you for shopping with us, and we'll see you tomorrow from seven in the morning."),
];

const LO_TALK = [
    line(ukMan, "Today we're going to look at why leaves change color in the autumn. Leaves are green because they contain chlorophyll, which plants use to make food from sunlight."),
    line(ukMan, "But leaves also contain yellow and orange pigments. In summer we can't see them, because there is so much green. In autumn, the days get shorter and colder, and trees stop making chlorophyll. As the green disappears, the yellow and orange pigments can finally be seen."),
    line(ukMan, 'Red is different. Some trees, like many maples, actually produce new red pigment in the autumn. Scientists think the red may protect the leaf from strong sunlight while the tree takes useful materials back from the leaf before it falls.'),
];

const loConversation = lo.audio('conversation', CONVERSATION, LO_CONVERSATION, 'A2');
const loAnnouncement = lo.audio('announcement', ANNOUNCEMENT, LO_ANNOUNCEMENT, 'A2');
const loTalk = lo.audio('talk', TALK, LO_TALK, 'B1');

const lowerModule: Q[] = [
    lo.response(1, usMan, 'What time does the next bus leave?', 'A2', [
        "It's a blue bus.",
        'In about ten minutes.',
        'I left it at home.',
        'Yes, it does.',
    ], 1),
    lo.response(2, usWoman, 'Can you help me carry these boxes?', 'A2', [
        "They're very nice boxes.",
        'I carried them yesterday.',
        'Sure. Where do they go?',
        "No, it isn't heavy.",
    ], 2),
    lo.response(3, ukWoman, 'I love your new jacket!', 'A2', [
        "You're welcome.",
        "I'm sorry to hear that.",
        "Yes, it's the jacket I wore yesterday.",
        'Thanks, I got it on sale.',
    ], 3),
    lo.response(4, usMan, "Are you coming to Tom's party on Saturday?", 'A2', [
        "I'd like to, but I have to work.",
        'It was a great party.',
        'On Saturday morning.',
        'Tom lives near the station, I think.',
    ], 0),
    lo.response(5, usWoman, 'Where did you put the car keys?', 'A2', [
        'I put the car in the garage.',
        "They're on the kitchen table.",
        'Yes, I did.',
        'I usually drive to work.',
    ], 1),
    loConversation(6, 'What problem does the student have?', [
        'He lost a library book.',
        'He cannot find the history section.',
        'The book he needs is checked out.',
        'The library closes early on Friday.',
    ], 2, "the computer says it's checked out"),
    loConversation(7, "When is the student's essay due?", [
        'On Monday',
        'On Saturday',
        'Next week',
        'On Friday',
    ], 3, 'my essay is due on Friday'),
    loConversation(8, 'What does the student need to read the online copy?', [
        'His student number and email password',
        'A new library card',
        'A password from the librarian',
        'A computer in the library',
    ], 0, 'your student number and the password you use for your university email'),
    loAnnouncement(9, 'What time will the store close?', [
        "At seven o'clock",
        "At eight o'clock",
        'At a quarter to eight',
        'At a quarter past eight',
    ], 1, "at eight o'clock"),
    loAnnouncement(10, 'What is cheaper today?', [
        'Bread',
        'Drinks',
        'Fruit and vegetables',
        'Everything in the store',
    ], 2, 'all fruit and vegetables are half price'),
    loTalk(11, 'Why are leaves green in summer?', [
        'They are full of water.',
        'They get a lot of sunlight.',
        'They have no other colors.',
        'They contain chlorophyll.',
    ], 3, 'Leaves are green because they contain chlorophyll'),
    loTalk(12, 'Why can\'t we see the yellow and orange pigments in summer?', [
        'There is too much green.',
        'Trees make them only in autumn.',
        'The sunlight is too strong.',
        'They are inside the branches.',
    ], 0, "In summer we can't see them, because there is so much green"),
    loTalk(13, 'What is different about the color red?', [
        'All trees have it in summer.',
        'Some trees only start producing it in autumn.',
        'It appears only after the leaf falls.',
        'It comes from the chlorophyll.',
    ], 1, 'actually produce new red pigment in the autumn'),
];

// ================================================================ Module 2, harder (upper)

const up = moduleKit('upper');

const professor = ukMan;
const researcher = second(usWoman);
const UP_CONVERSATION = [
    line(researcher, "Professor Grant, do you have a minute? It's about my research proposal."),
    line(professor, "Of course. You were planning to study how social media affects local elections, weren't you?"),
    line(researcher, "That's right. But I've realized that the data I wanted, private messages between campaign staff, isn't something I can actually get hold of."),
    line(professor, 'No, that would raise serious privacy issues. What are you thinking of instead?'),
    line(researcher, 'I could look at public posts by candidates and compare how often they mention local issues and national ones.'),
    line(professor, "That's much more feasible. My only concern is that it's quite a broad comparison. You might narrow it to a single region, or a single election."),
    line(researcher, "I was worried it would be too small then."),
    line(professor, 'Depth matters more than size at this stage. A careful analysis of one election will teach you more than a quick look at twenty.'),
    line(researcher, "OK. I'll focus on last year's city council election."),
];

const UP_ANNOUNCEMENT = [
    line(usWoman, "Good morning, everyone. I'd like to remind all graduate students that applications for this year's travel grants close this Friday at five p.m. The grants cover up to eight hundred dollars toward conference travel, but please note that, unlike in previous years, you must now be presenting your own work at the conference to qualify; simply attending is no longer enough. Applications submitted after the deadline won't be considered, so if you're still waiting for a letter from your supervisor, I'd strongly suggest contacting them today."),
];

const UP_TALK = [
    line(usMan, "In 1968, the ecologist Garrett Hardin published an essay called The Tragedy of the Commons. His argument went like this: imagine a pasture open to all herders. Each herder gains the full benefit of adding one more animal, while the cost of overgrazing is shared by everyone. So each person, acting rationally, keeps adding animals, until the pasture is destroyed."),
    line(usMan, 'Hardin concluded that shared resources must either be divided into private property or controlled by the government. This became enormously influential, but the political scientist Elinor Ostrom challenged it with evidence.'),
    line(usMan, 'She studied fisheries, forests and irrigation systems around the world, and found many communities that had managed shared resources successfully for centuries, without privatizing them and without outside control.'),
    line(usMan, "What these communities had in common were clear rules about who could use the resource, ways of monitoring each other, and penalties that started small and increased for repeated violations. Ostrom's work earned her the Nobel Prize in economics in 2009; she was the first woman to receive it."),
    line(usMan, "The broader lesson is that Hardin's tragedy isn't inevitable. It describes what happens when there are no rules, not what must happen whenever a resource is shared."),
];

const upConversation = up.audio('conversation', CONVERSATION, UP_CONVERSATION, 'B2');
const upAnnouncement = up.audio('announcement', ANNOUNCEMENT, UP_ANNOUNCEMENT, 'B2');
const upTalk = up.audio('talk', TALK, UP_TALK, 'C1');

const upperModule: Q[] = [
    up.response(1, ukMan, 'I was under the impression the deadline had been extended.', 'B2', [
        "I'm glad the presentation made a good impression.",
        'Yes, I extended my visa.',
        'It was, but only for the first draft.',
        'No, the line was too long.',
    ], 2),
    up.response(2, usWoman, "You wouldn't happen to have a spare charger, would you?", 'B2', [
        "It hasn't happened yet.",
        'I usually charge mine overnight.',
        "Sorry, I couldn't spare any time for it this afternoon.",
        'I do, actually. What kind of phone do you have?',
    ], 3),
    up.response(3, usMan, "Didn't you say you'd already booked the venue?", 'B2', [
        "I thought I had, but the payment didn't go through.",
        "Yes, I'll say it again.",
        "No, I'd rather stay in and read a book this weekend.",
        'The venue is very spacious.',
    ], 0),
    up.response(4, ukWoman, "I'm not sure the data really supports that conclusion.", 'B2', [
        "I'm sure it will arrive soon.",
        'Fair point. Maybe we need a larger sample.',
        'Yes, I support that team too.',
        'The conclusion is on the last page of the report.',
    ], 1),
    up.response(5, usMan, "How come the lab's been locked all week?", 'B2', [
        'By bus, mostly.',
        "It's been a long week.",
        "They're replacing the ventilation system.",
        'The key is usually on the hook by the door.',
    ], 2),
    upConversation(6, 'What problem does the student have with her original plan?', [
        'Her professor rejected the topic.',
        'The election has not happened yet.',
        'She has too little time to finish it.',
        'She cannot obtain the data she needed.',
    ], 3, "isn't something I can actually get hold of"),
    upConversation(7, "What is the professor's concern about the new plan?", [
        'It covers too much.',
        'It raises privacy issues.',
        'It relies on private messages.',
        'It ignores national issues.',
    ], 0, "it's quite a broad comparison"),
    upConversation(8, 'What does the professor imply about the size of a study?', [
        'Larger studies are always more reliable.',
        'A narrow, careful study can be more valuable.',
        'Small studies are only suitable for beginners.',
        'The number of elections should be at least twenty.',
    ], 1, 'Depth matters more than size at this stage'),
    upAnnouncement(9, 'What has changed about the travel grants this year?', [
        'They cover more than eight hundred dollars.',
        'Undergraduates can now apply.',
        'Students must present their own work at the conference.',
        'Applications close earlier in the week.',
    ], 2, 'you must now be presenting your own work at the conference to qualify'),
    upAnnouncement(10, 'Why does the speaker suggest contacting supervisors today?', [
        'Supervisors must approve the conference.',
        'Supervisors will be away on Friday.',
        'Letters must be sent by post.',
        'Late applications will not be accepted.',
    ], 3, "Applications submitted after the deadline won't be considered"),
    upTalk(11, "According to Hardin, why does a shared pasture end up destroyed?", [
        'Each herder gains from adding animals while the cost is shared.',
        'Governments fail to protect common land from overgrazing by herders.',
        'Herders do not understand overgrazing.',
        'Private owners take the best land.',
    ], 0, 'Each herder gains the full benefit of adding one more animal'),
    upTalk(12, "What did Ostrom's research show?", [
        'Most shared resources were eventually privatized.',
        'Some communities managed shared resources well on their own.',
        'Fisheries needed more outside control than forests.',
        "Hardin's model applied in every region she studied.",
    ], 1, 'without privatizing them and without outside control'),
    upTalk(13, 'Which feature of the successful communities does the professor mention?', [
        'A single leader who made all decisions',
        'Large fines from the first violation',
        'Penalties that grew with repeated violations',
        'Open access for anyone who needed the resource',
    ], 2, 'penalties that started small and increased for repeated violations'),
    upTalk(14, "What is the professor's main point about Hardin's argument?", [
        'It was wrong about how herders behave.',
        'It applies only to pastures.',
        'It was proved correct by Ostrom\'s research on fisheries and forests.',
        'It describes what happens without rules, not what must happen.',
    ], 3, "Hardin's tragedy isn't inevitable"),
];

export const toeflListening: Q[] = [...module1, ...lowerModule, ...upperModule];
