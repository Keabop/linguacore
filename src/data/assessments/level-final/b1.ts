import { bankOf, line, ukWoman, usMan } from './build';
import type { LevelFinalBank } from './index';

const b = bankOf('B1');

const transfer = [
    b.choice('b1-u1', '______ you ever tried Korean food?', ['Have', 'Did', 'Are', 'Do']),
    b.choice('b1-u2', 'I ______ my wallet yesterday, but luckily someone handed it in.', ['lost', 'have lost', 'had lost', 'was losing']),
    b.gap('b1-u3', "She's out of breath because she ___ for an hour. (run)", ['has been running', "'s been running"], 3),
    b.choice('b1-u4', 'By the time I arrived at the party, most of the guests ______ home.', ['had gone', 'have gone', 'are going', 'go']),
    b.choice('b1-u5', 'My grandfather ______ smoke, but he stopped twenty years ago.', ['used to', 'use to', 'is used to', 'was used to']),
    b.gap('b1-u6', 'This bridge ___ in 1910. (build)', ['was built'], 2),
    b.choice('b1-u6', 'Millions of emails ______ every minute.', ['are sent', 'send', 'are sending', 'sending']),
    b.choice('b1-u7', 'If I ______ more free time, I would learn to play the guitar.', ['had', 'have', 'will have', 'would have']),
    b.order('b1-u8', 'Ana: "I\'m tired." What did Ana say?', 'Ana said that she was tired.', ['she', 'Ana said', 'tired.', 'that', 'was']),
    b.choice('b1-u9', "That's the restaurant ______ we had our first date.", ['where', 'which', 'who', 'what']),
    b.choice('b1-u10', "I'm thinking of ______ a new job.", ['looking for', 'to look for', 'look for', 'looked for']),
    b.choice('b1-u11', "I can't reach the top shelf. I'm not tall ______.", ['enough', 'too', 'very', 'so']),
];

const r = b.reading(`When Rosa Medina retired from teaching three years ago, she expected to spend her mornings reading the newspaper and looking after her grandchildren. Instead, she has turned an empty car park in the centre of Monterrey into one of the city's most popular community gardens.
The idea came to her almost by accident. "I used to walk past that car park every day," she explains. "It had been closed for years and people were throwing rubbish over the fence. One morning I thought: if this were my garden, I wouldn't let it look like this." She wrote to the city council, and to her surprise, they agreed to lend her the land for five years, as long as the neighbours looked after it.
The first months were hard. Only six people came to the first meeting, and the soil was so poor that most of the vegetables they planted died. "We nearly gave up," Rosa admits. Things changed when a local university offered to help. Students tested the soil and showed the volunteers how to make compost from kitchen waste. By the second summer, the garden was producing tomatoes, chillies and beans, and more than forty families had joined.
Today the garden is open to everyone on weekday afternoons and all day on Saturday. Each family that joins gets a small plot, and in exchange they spend two hours a month on shared jobs such as watering and cleaning the paths. Any food left over is given to a nearby shelter.
For Rosa, though, the vegetables are not the most important part. "Before the garden, I had lived on this street for twenty years without knowing most of my neighbours," she says. "Now we celebrate birthdays together. The garden has given us a reason to talk." The council has recently asked her to advise other neighbourhoods that want to start similar projects.`);

const reading = [
    r.choice('What did Rosa expect to do after she retired?', ['Read the paper and look after her grandchildren', 'Teach at a university', 'Grow vegetables to sell', 'Work for the city council'], 'she expected to spend her mornings reading the newspaper and looking after her grandchildren'),
    r.judge('The council gave Rosa the land for as long as she wanted.', 'false', 'they agreed to lend her the land for five years'),
    r.choice('Why did most of the first vegetables die?', ['The soil was poor', 'Nobody watered them', 'People took them', 'It was too cold'], 'the soil was so poor that most of the vegetables they planted died'),
    r.judge('Families who join must help in the garden for two hours a month.', 'true', 'they spend two hours a month on shared jobs'),
    r.choice('What does Rosa value most about the garden?', ['It has brought the neighbours together', 'It produces cheap food', 'It gives food to a shelter', 'It has made her well known'], 'The garden has given us a reason to talk.'),
];

const l = b.listening([
    line(ukWoman, 'My guest today is Daniel Ortiz, who cycles forty kilometres to work and back every day. Daniel, why did you start?'),
    line(usMan, 'Honestly, it was not for my health. Two years ago the train fares went up again, and I worked out I was spending nearly a third of my salary on travel.'),
    line(ukWoman, "Forty kilometres sounds like a lot. Wasn't it hard at the beginning?"),
    line(usMan, 'Terrible! For the first month I only cycled on Mondays and Fridays, and I took the train the rest of the week. My legs hurt all the time.'),
    line(ukWoman, 'And what about the weather?'),
    line(usMan, "That's what people always ask about. I've got good waterproof clothes, so rain doesn't bother me. Ice is different, though. If the roads are icy, I work from home."),
    line(ukWoman, 'Has cycling changed anything else in your life?'),
    line(usMan, "I sleep much better, and I've lost about eight kilos. But the biggest surprise is that I actually arrive at work in a better mood than when I used to take the train."),
]);

const listening = [
    l.choice('Why did Daniel start cycling to work?', ['The train had become too expensive', 'His doctor told him to', 'He wanted to lose weight', 'His train stopped running'], 'the train fares went up again'),
    l.choice('How often did he cycle in the first month?', ['Twice a week', 'Every day', 'Once a week', 'Three times a week'], 'I only cycled on Mondays and Fridays'),
    l.judge('Daniel does not cycle when the roads are icy.', 'true', 'If the roads are icy, I work from home.'),
    l.judge("Some of Daniel's colleagues have started cycling too.", 'not-given'),
    l.choice('What surprised Daniel most?', ['He is in a better mood at work', 'He sleeps better', 'He has lost weight', 'He saves a lot of money'], 'the biggest surprise is that I actually arrive at work in a better mood'),
];

export const b1Final: LevelFinalBank = { transfer, reading, listening };
