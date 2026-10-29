import { bankOf, line, ukMan, usWoman } from './build';
import type { LevelFinalBank } from './index';

const b = bankOf('B2');

const transfer = [
    b.choice('b2-u1', "If we ______ the earlier train, we wouldn't have missed the start of the wedding.", ['had caught', 'caught', 'would catch', 'have caught']),
    b.choice('b2-u2', "If she weren't so shy, she ______ to the party last night.", ['would have come', 'would come', 'will come', 'had come']),
    b.choice('b2-u3', 'I wish I ______ so much cake last night. I feel awful.', ["hadn't eaten", "didn't eat", "wouldn't eat", "haven't eaten"]),
    b.gap('b2-u3', 'If only I ___ speak Japanese: this trip would be so much easier. (can)', ['could']),
    b.order('b2-u4', 'The receptionist asked us: "Where are you staying?"', 'The receptionist asked us where we were staying.', ['where', 'were', 'The receptionist', 'staying', 'asked us', 'we']),
    b.choice('b2-u5', "The results should ______ by the end of the week, so you'll know before Monday.", ['be announced', 'have announced', 'announce', 'be announcing']),
    b.choice('b2-u6', "I'm not going to fix the roof myself. I'm going to ______.", ['have it repaired', 'have repaired it', 'repair it had', 'get repairing it']),
    b.choice('b2-u7', 'My brother, ______ lives in Berlin, is coming to visit next month.', ['who', 'that', 'which', 'whose']),
    b.choice('b2-u8', '______ by the noise, the dog ran under the table.', ['Frightened', 'Frightening', 'Having frightened', 'To frighten']),
    b.choice('b2-u9', "Don't call me at eight tomorrow: I ______ my driving test then.", ['will be taking', 'will have taken', 'take', 'would take']),
    b.gap('b2-u9', 'By the end of this year, I ___ here for a decade. (work)', ['will have worked', 'will have been working', "'ll have worked", "'ll have been working"], 4),
    b.choice('b2-u10', 'The meeting was ______ because the manager was ill.', ['called off', 'called up', 'called out', 'called back']),
    b.choice('b2-u11', 'Not only ______ late, but he also forgot the tickets.', ['did he arrive', 'he arrived', 'he did arrive', 'arrived he']),
    b.choice('b2-u12', 'I ______ along the beach for an hour when I noticed that my phone was missing.', ['had been walking', 'have been walking', 'am walking', 'walk']),
    b.choice('b2-u13', 'The hotel was expensive. ______, it was worth every penny.', ['Nevertheless', 'Consequently', 'Moreover', 'Otherwise']),
];

const r = b.reading(`When a mid-sized software company in Guadalajara announced that its staff would work four days a week for the same salary, many of its clients assumed it was a publicity stunt. Eighteen months later, the company has not only kept the scheme but extended it to its offices in Bogotá and Lima.
The trial was the idea of the operations director, Lucía Ferrer, who had read about similar experiments in Europe. "Our problem wasn't productivity," she explains. "It was that we kept losing good people. Developers would stay for a year or two, then leave for a competitor offering slightly more money." Rather than entering a bidding war over salaries, Ferrer proposed offering something competitors weren't: time.
The rules were simple. Each team could choose which day to take off, provided that customers could still reach someone from Monday to Friday. Meetings were limited to thirty minutes, and internal messages sent after six in the evening would not be answered until the next morning. Crucially, the company agreed to measure results rather than hours: if a team met its targets, nobody would ask how long it had spent at the desk.
Not everything went smoothly. In the first three months, the support team struggled to cover the phones, and two large clients complained about slower replies. Some employees admitted that they had been working on their day off just to keep up. "We had underestimated how much time we wasted," says Ferrer. "Until we cut the unnecessary meetings, the fifth day was simply squeezed into the other four."
By the end of the first year, however, the numbers told a different story. Staff turnover had fallen from almost 30 per cent to under 10 per cent, sick days were down by a third, and the company had delivered more projects than in any previous year. Recruitment also became easier: a job advertisement that once attracted forty applicants now regularly receives several hundred.
Critics argue that the model cannot easily be copied. A software company, they point out, can measure output in finished projects, whereas a hospital or a school cannot simply close for a day. Even Ferrer concedes that the scheme works best where tasks have clear deadlines. "I wouldn't claim it's a solution for every industry," she says. "But for knowledge work, the question isn't whether people can do their job in four days. It's why we ever assumed they needed five."
Other firms in the region are watching closely. Two banks and a marketing agency have recently started their own trials, although both banks have chosen a more cautious version in which employees work slightly longer hours on the remaining four days.`);

const reading = [
    r.choice('What was the main reason the company introduced the four-day week?', ['To stop experienced staff leaving', 'To attract new clients', 'To reduce office costs', 'To copy a scheme a competitor had launched'], 'It was that we kept losing good people.'),
    r.judge('Teams were free to decide which day they would not work.', 'true', 'Each team could choose which day to take off'),
    r.choice('What went wrong in the first months?', ['Some staff worked on their day off to keep up', 'Productivity fell by a third', 'Several developers resigned', 'The company lost its biggest client'], 'Some employees admitted that they had been working on their day off just to keep up.'),
    r.judge('The company has stopped the scheme in its offices outside Mexico.', 'false', 'extended it to its offices in Bogotá and Lima'),
    r.choice("How are the banks' trials different?", ['Employees work longer hours on the other four days', 'Employees work three days a week', 'Only managers take part', 'Staff accept a lower salary'], 'employees work slightly longer hours on the remaining four days'),
];

const l = b.listening([
    line(usWoman, 'So, have you decided about the Singapore offer?'),
    line(ukMan, "Not yet. On paper it's perfect: a better title, nearly double the salary. But I keep going back and forth."),
    line(usWoman, "What's holding you back? Is it your parents?"),
    line(ukMan, "Partly. My dad's been unwell, and if I'd been offered this two years ago, I'd have said yes without thinking. Now I'm not so sure I want to be twelve hours away."),
    line(usWoman, "Couldn't you negotiate something? Some companies let you come back a few times a year."),
    line(ukMan, "Actually, that's what I asked them yesterday. They said they'd pay for two trips home a year, which helps, but it isn't quite the same as being around."),
    line(usWoman, 'And what about Emma? Would she go with you?'),
    line(ukMan, "She'd love to, funnily enough. Her company has an office there, so she's already asked about a transfer. That's not the issue at all."),
    line(usWoman, 'Then it sounds like it really comes down to your dad.'),
    line(ukMan, "I suppose it does. I've told them I'll give them an answer by Friday, so I've got a few days to talk it through with him."),
]);

const listening = [
    l.choice('What attracts the man to the job?', ['A more senior role and a higher salary', 'Being closer to his family', 'Working with Emma', 'Shorter working hours'], 'a better title, nearly double the salary'),
    l.choice('Why is he less certain than he would have been two years ago?', ["His father's health has got worse", 'He has a new partner', 'His salary has increased', 'He has already lived abroad'], "My dad's been unwell"),
    l.judge('The company has offered to pay for some trips home.', 'true', "They said they'd pay for two trips home a year"),
    l.judge('Emma is reluctant to move to Singapore.', 'false', "She'd love to, funnily enough."),
    l.judge('The man has received a similar offer from another company.', 'not-given'),
];

export const b2Final: LevelFinalBank = { transfer, reading, listening };
