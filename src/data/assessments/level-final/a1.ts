import { bankOf, line, ukWoman, usMan } from './build';
import type { LevelFinalBank } from './index';

const b = bankOf('A1');

const transfer = [
    b.choice('a1-u1', 'My grandparents ______ from a small village near Oaxaca.', ['are', 'is', 'am', 'be']),
    b.gap('a1-u1', 'A: How old is your daughter? B: She ___ six.', ['is']),
    b.choice('a1-u2', 'I want to buy ______ umbrella. Mine is broken.', ['an', 'a', 'these', 'those']),
    b.order('a1-u2', 'What is in the box?', 'These are old photos of my family.', ['old', 'These', 'of my family', 'are', 'photos']),
    b.choice('a1-u3', 'My uncle ______ a small restaurant in the city centre.', ['has', 'have', 'haves', 'is have']),
    b.gap('a1-u3', 'Lucía ___ (study) medicine at the university.', ['studies']),
    b.choice('a1-u4', '______ your sister like horror films?', ['Does', 'Do', 'Is', 'Are']),
    b.order('a1-u4', 'Is your brother late for work?', 'No, he is never late.', ['never', 'he', 'late', 'No,', 'is']),
    b.choice('a1-u5', '______ any good cafés near your office?', ['Are there', 'Is there', 'There are', 'Have']),
    b.gap('a1-u5', 'The calendar is ___ the wall, next to the clock.', ['on']),
    b.choice('a1-u6', 'Excuse me, ______ I sit here?', ['can', 'do', 'am', 'does']),
    b.choice('a1-u7', 'We need ______ eggs for the cake. Can you buy six?', ['some', 'any', 'a', 'much']),
];

const r = b.reading(`Hi Sara,
Welcome to the team! Here is some information for your first week at the shop. We open at nine o'clock from Monday to Friday, and at ten on Saturday. We are closed on Sunday.
Please come at half past eight on Monday, because I want to show you the shop before the customers arrive. There is a small kitchen behind the office. You can make coffee there, but you can't eat in the shop.
Your colleague Ben works with you on Tuesday and Thursday. He is very friendly and he speaks Spanish too. Don't forget your ID card.
See you on Monday!
Martin`);

const reading = [
    r.choice('What time does Sara start on Monday?', ['At 8:30', 'At 9:00', 'At 10:00', 'At 8:00'], 'Please come at half past eight on Monday'),
    r.judge('The shop opens at ten on Saturday.', 'true', 'and at ten on Saturday'),
    r.judge('Sara can eat her lunch in the shop.', 'false', "you can't eat in the shop"),
    r.judge('Ben is from Spain.', 'not-given'),
    r.choice('What must Sara bring?', ['Her ID card', 'Some coffee', 'Her lunch', 'A photo'], "Don't forget your ID card."),
];

const l = b.listening([
    line(ukWoman, 'Good morning, City Sports Centre. How can I help you?'),
    line(usMan, 'Hi. Do you have swimming classes for children?'),
    line(ukWoman, "Yes, we do. There are classes on Tuesday and Thursday at five o'clock."),
    line(usMan, 'My son is seven. Can he join?'),
    line(ukWoman, 'Yes, the Tuesday class is for children from six to nine.'),
    line(usMan, 'Great. How much is it?'),
    line(ukWoman, "It's twenty pounds a month."),
    line(usMan, 'OK. And what does he need?'),
    line(ukWoman, 'A swimming cap and a towel. Oh, and please come ten minutes early on the first day.'),
]);

const listening = [
    l.choice('When are the swimming classes?', ['On Tuesday and Thursday', 'On Monday and Wednesday', 'Every day', 'Only on Saturday'], "There are classes on Tuesday and Thursday at five o'clock."),
    l.choice("How old is the man's son?", ['Seven', 'Six', 'Nine', 'Five'], 'My son is seven.'),
    l.choice('How much are the classes?', ['£20 a month', '£20 a class', '£10 a month', '£5 a class'], "It's twenty pounds a month."),
    l.judge('The boy needs to bring a towel.', 'true', 'A swimming cap and a towel.'),
    l.choice('What must they do on the first day?', ['Arrive ten minutes early', 'Pay for two months', 'Bring a photo', 'Call the centre'], 'please come ten minutes early on the first day'),
];

export const a1Final: LevelFinalBank = { transfer, reading, listening };
