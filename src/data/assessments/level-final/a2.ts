import { bankOf, line, ukMan, usWoman } from './build';
import type { LevelFinalBank } from './index';

const b = bankOf('A2');

const transfer = [
    b.gap('a2-u1', 'We ___ (travel) to Guadalajara by bus last month.', ['travelled', 'traveled']),
    b.choice('a2-u1', 'The film ______ at nine and finished at eleven.', ['started', 'starts', 'start', 'starting']),
    b.choice('a2-u2', '______ you see the football match on Sunday?', ['Did', 'Do', 'Were', 'Have']),
    b.order('a2-u2', 'Why are you so hungry?', "I didn't have breakfast this morning.", ['breakfast', "didn't", 'this morning', 'I', 'have']),
    b.choice('a2-u3', 'Shh! The baby ______, so please talk quietly.', ['is sleeping', 'sleeps', 'sleep', 'slept']),
    b.choice('a2-u4', 'Look at those dark clouds. It ______ rain.', ['is going to', 'goes to', 'is going', 'going to']),
    b.gap('a2-u5', 'This is ___ (bad) restaurant in town. Never eat here!', ['the worst'], 2),
    b.choice('a2-u5', 'My new phone is ______ than my old one, but it was also more expensive.', ['faster', 'more fast', 'fastest', 'the fastest']),
    b.choice('a2-u6', 'You look very tired. You ______ go to bed early tonight.', ['should', 'must not', "don't have to", "can't"]),
    b.choice('a2-u7', "This isn't my bag. I think it's ______.", ['hers', 'her', 'she', "she's"]),
    b.gap('a2-u8', "If you ___ (leave) now, you'll catch the last train.", ['leave']),
    b.choice('a2-u9', 'I ______ a shower when the phone rang.', ['was having', 'were having', 'am having', 'have']),
];

const r = b.reading(`Last year my family and I moved from Puebla to Vancouver because my mother got a new job there. At first, I didn't like it at all. The city was much bigger than Puebla, it rained almost every day, and I didn't know anyone at my new school. My English was not very good, so I was quiet in class and I usually ate my lunch alone.
Everything changed in October. My teacher, Mr Carter, asked me to help with the school's Day of the Dead festival because I knew a lot about it. I showed my classmates how to make paper flowers, and my dad cooked tamales for everyone. After that, people started talking to me in the corridors, and two girls from the festival, Maya and Jen, became my best friends.
Now I'm studying for my exams, and next summer I'm going to work at a summer camp for kids. I still miss my grandparents and the food from home, but I don't think I want to go back.`);

const reading = [
    r.choice('Why did the family move to Vancouver?', ['The mother got a new job there', 'The writer wanted to learn English', 'The grandparents lived there', 'The weather was better'], 'because my mother got a new job there'),
    r.judge('In the first weeks, the writer often had lunch with classmates.', 'false', 'I usually ate my lunch alone'),
    r.choice('How did the writer help with the festival?', ['By teaching classmates to make paper flowers', 'By cooking tamales', 'By singing a song', 'By making a poster'], 'I showed my classmates how to make paper flowers'),
    r.judge('Maya and Jen are in the same class as the writer.', 'not-given'),
    r.choice('What is the writer going to do next summer?', ['Work at a camp for children', 'Visit the grandparents in Puebla', 'Move back to Mexico', 'Take an English course'], "next summer I'm going to work at a summer camp for kids"),
];

const l = b.listening([
    line(usWoman, 'Hi Sam! Are you doing anything on Saturday?'),
    line(ukMan, 'Not really. I was going to clean my flat, but that can wait. Why?'),
    line(usWoman, "There's a food market in Riverside Park. I went last year and it was brilliant."),
    line(ukMan, 'Sounds good. What time does it open?'),
    line(usWoman, 'At eleven, but it gets really busy, so I want to get there early. Shall we meet at the station at half past ten?'),
    line(ukMan, 'Half past ten is fine. Is it expensive?'),
    line(usWoman, "Not really. Most dishes cost about five pounds. And if it's sunny, we can sit by the river."),
    line(ukMan, 'And if it rains?'),
    line(usWoman, "Then we'll go to the cinema instead. There's a new comedy on."),
]);

const listening = [
    l.choice('What was Sam going to do on Saturday?', ['Clean his flat', 'Go to the cinema', 'Work', 'Visit his family'], 'I was going to clean my flat'),
    l.choice('What time are they meeting?', ['At 10:30', 'At 11:00', 'At 10:00', 'At 11:30'], 'Half past ten is fine.'),
    l.judge('The woman has been to the food market before.', 'true', 'I went last year and it was brilliant.'),
    l.choice('How much do most dishes cost?', ['About £5', 'About £15', 'About £10', 'Less than £2'], 'Most dishes cost about five pounds.'),
    l.choice('What will they do if it rains?', ['Go to the cinema', 'Stay at home', 'Eat at the station', 'Sit by the river'], "Then we'll go to the cinema instead."),
];

export const a2Final: LevelFinalBank = { transfer, reading, listening };
