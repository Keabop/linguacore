import type { Story } from '../lib/db';

function w(word: string): string {
    return `<span data-word="${word}">${word}</span>`;
}

export const storiesData: Story[] = [
    // ===== A1 STORIES (10) =====
    {
        id: "a1-001", level: "A1", unitId: "a1-u3", title: "My Morning Routine", wordCount: 45, estimatedMinutes: 2,
        content: `<p>I ${w('wake')} up at 7 AM every day. First, I ${w('brush')} my ${w('teeth')} and wash my face. Then I ${w('eat')} ${w('breakfast')} with my ${w('family')}.</p><p>I ${w('drink')} ${w('coffee')} and ${w('read')} the news. After that, I ${w('walk')} to ${w('school')}. I ${w('like')} mornings because they are quiet.</p>`
    },
    {
        id: "a1-002", level: "A1", unitId: "a1-u1", title: "My Family", wordCount: 50, estimatedMinutes: 2,
        content: `<p>My ${w('family')} is ${w('small')}. I have a ${w('mother')}, a ${w('father')}, and a ${w('sister')}. My ${w('brother')} lives in another city.</p><p>My mother ${w('work')}s at a hospital. My father is a teacher. We ${w('love')} each other very much. On weekends, we ${w('eat')} ${w('food')} ${w('together')} and ${w('play')} games.</p>`
    },
    {
        id: "a1-003", level: "A1", unitId: "a1-u4", title: "My Best Friend", wordCount: 48, estimatedMinutes: 2,
        content: `<p>My best ${w('friend')} is Ana. She is very ${w('happy')} and kind. We ${w('go')} to ${w('school')} together every day.</p><p>Ana ${w('like')}s to ${w('read')} ${w('book')}s and ${w('play')} music. I ${w('like')} to ${w('run')} and ${w('play')} sports. We are ${w('different')}, but we are ${w('good')} friends.</p>`
    },
    {
        id: "a1-004", level: "A1", title: "A Rainy Day", wordCount: 46, estimatedMinutes: 2,
        content: `<p>Today the ${w('weather')} is ${w('bad')}. It is ${w('cold')} and there is ${w('rain')}. I cannot ${w('go')} outside to ${w('play')}.</p><p>I stay in my ${w('house')} and ${w('read')} a ${w('book')}. My ${w('cat')} ${w('sleep')}s on the sofa. I ${w('drink')} ${w('hot')} chocolate. ${w('rain')}y days can be nice too.</p>`
    },
    {
        id: "a1-005", level: "A1", unitId: "a1-u7", title: "At the Store", wordCount: 50, estimatedMinutes: 2,
        content: `<p>I ${w('go')} to the store to ${w('buy')} ${w('food')}. I ${w('need')} ${w('water')}, bread, and fruits. The store is ${w('big')} and has many things.</p><p>I ${w('see')} my ${w('friend')} Carlos at the store. He ${w('want')}s to ${w('buy')} a new ${w('book')}. We ${w('walk')} home together. I ${w('like')} going shopping.</p>`
    },
    {
        id: "a1-006", level: "A1", title: "My Pets", wordCount: 48, estimatedMinutes: 2,
        content: `<p>I have two pets. My ${w('dog')} is ${w('big')} and ${w('happy')}. His name is Max. My ${w('cat')} is ${w('small')} and she ${w('sleep')}s a lot.</p><p>Every morning, I ${w('walk')} my ${w('dog')} in the park. He ${w('like')}s to ${w('run')} and ${w('play')}. My ${w('cat')} stays at ${w('house')} and watches from the window.</p>`
    },
    {
        id: "a1-007", level: "A1", unitId: "a1-u6", title: "Learning English", wordCount: 44, estimatedMinutes: 2,
        content: `<p>I ${w('want')} to ${w('read')} and ${w('write')} in English. It is not ${w('easy')}, but I ${w('like')} it. I study every day after ${w('school')}.</p><p>My teacher is very ${w('good')}. She ${w('help')}s me a lot. I ${w('know')} many words now. I am ${w('happy')} with my progress.</p>`
    },
    {
        id: "a1-008", level: "A1", unitId: "a1-u5", title: "The Park", wordCount: 46, estimatedMinutes: 2,
        content: `<p>The park is near my ${w('house')}. It is very ${w('big')} and ${w('beautiful')}. I ${w('go')} there with my ${w('family')} on ${w('sun')}ny days.</p><p>Children ${w('play')} on the grass. People ${w('walk')} their ${w('dog')}s. I ${w('like')} to sit and ${w('read')} under a tree. The park makes me ${w('happy')}.</p>`
    },
    {
        id: "a1-009", level: "A1", unitId: "a1-u2", title: "My Room", wordCount: 44, estimatedMinutes: 2,
        content: `<p>My room is ${w('small')} but I ${w('like')} it. I have a bed, a desk, and a ${w('book')}shelf. My ${w('cat')} ${w('sleep')}s on my bed.</p><p>I ${w('read')} and ${w('write')} at my desk. I have many ${w('book')}s. At night, I ${w('close')} the window and ${w('sleep')}. My room is my ${w('favorite')} place.</p>`
    },
    {
        id: "a1-010", level: "A1", title: "Dinner Time", wordCount: 48, estimatedMinutes: 2,
        content: `<p>Every evening, my ${w('family')} eats dinner together. My ${w('mother')} cooks ${w('good')} ${w('food')}. Tonight we ${w('eat')} chicken and ${w('vegetables')}.</p><p>I ${w('help')} my mother in the kitchen. My ${w('father')} and ${w('brother')} set the table. We talk about our day. I ${w('love')} dinner time with my ${w('family')}.</p>`
    },

    // ===== A2 STORIES (10) =====
    {
        id: "a2-001", level: "A2", unitId: "a2-u5", title: "A Trip to the Market", wordCount: 60, estimatedMinutes: 3,
        content: `<p>Last Saturday, I ${w('decided')} to ${w('visit')} the local ${w('market')}. The ${w('vegetables')} looked ${w('fresh')} and ${w('colorful')}. I ${w('choose')} tomatoes, peppers, and lettuce.</p><p>An old woman was selling ${w('beautiful')} flowers. I ${w('decided')} to ${w('buy')} some for my ${w('mother')}. She was ${w('surprised')} and ${w('happy')} when I gave them to her.</p>`
    },
    {
        id: "a2-002", level: "A2", unitId: "a2-u1", title: "My First Day at Work", wordCount: 65, estimatedMinutes: 3,
        content: `<p>I ${w('remember')} my first day at work. I was ${w('worried')} and ${w('excited')} at the same time. I woke up early and got ${w('ready')} ${w('quickly')}.</p><p>My ${w('neighbor')} drove me to the office. Everyone was ${w('friendly')}. My boss ${w('explain')}ed my tasks ${w('carefully')}. By the end of the day, I felt more confident. It was an ${w('important')} day for me.</p>`
    },
    {
        id: "a2-003", level: "A2", unitId: "a2-u7", title: "Cooking with Grandma", wordCount: 62, estimatedMinutes: 3,
        content: `<p>${w('during')} the holidays, I ${w('visit')} my grandmother. She has a special ${w('recipe')} for chocolate cake. We ${w('prepare')} it ${w('together')} every year.</p><p>First, we mix the flour and sugar ${w('carefully')}. Then we add eggs and chocolate. While we wait, she tells me stories about her life. Cooking with grandma is my ${w('favorite')} ${w('experience')}.</p>`
    },
    {
        id: "a2-004", level: "A2", unitId: "a2-u3", title: "The New Student", wordCount: 58, estimatedMinutes: 3,
        content: `<p>A new student ${w('arrive')}d at our school today. Her name is Sofia and she is from Brazil. She speaks Portuguese and is learning English.</p><p>At first, she was quiet and looked ${w('worried')}. I ${w('decided')} to talk to her. We ${w('already')} have many things in common. Now we are ${w('friend')}s and we ${w('practice')} English ${w('together')}.</p>`
    },
    {
        id: "a2-005", level: "A2", unitId: "a2-u2", title: "A Weekend in the Country", wordCount: 64, estimatedMinutes: 3,
        content: `<p>Last weekend, my family ${w('travel')}ed to a small town in the country. The ${w('weather')} was ${w('beautiful')} and the air was ${w('fresh')}.</p><p>We ${w('visit')}ed a farm and saw many animals. I ${w('enjoy')}ed feeding the horses. In the evening, we ate at a local restaurant. The ${w('food')} was ${w('different')} from the city, but very ${w('good')}. I want to go back soon.</p>`
    },
    {
        id: "a2-006", level: "A2", unitId: "a2-u8", title: "Learning to Cook", wordCount: 60, estimatedMinutes: 3,
        content: `<p>I ${w('decided')} to learn how to cook. I ${w('usually')} eat at restaurants, but it is expensive. My ${w('friend')} gave me an easy ${w('recipe')} for pasta.</p><p>I went to the ${w('market')} and bought all the ingredients. I followed the instructions ${w('carefully')}. The result was not perfect, but it tasted ${w('good')}. I want to ${w('improve')} and ${w('practice')} more.</p>`
    },
    {
        id: "a2-007", level: "A2", unitId: "a2-u9", title: "The Lost Dog", wordCount: 62, estimatedMinutes: 3,
        content: `<p>While I was ${w('walk')}ing in the park, I found a lost ${w('dog')}. He was ${w('small')} and ${w('scared')}. I ${w('decided')} to ${w('help')} him find his owner.</p><p>I took him to the ${w('neighbor')}hood and asked people. ${w('eventually')}, an old man recognized the ${w('dog')}. He was so ${w('happy')} and grateful. ${w('sometimes')}, ${w('small')} actions make a ${w('big')} ${w('different')}.</p>`
    },
    {
        id: "a2-008", level: "A2", unitId: "a2-u6", title: "My Healthy Habits", wordCount: 58, estimatedMinutes: 3,
        content: `<p>This year, I ${w('decided')} to live a more ${w('healthy')} life. I ${w('wake')} up early and ${w('drink')} ${w('water')} before ${w('breakfast')}.</p><p>I ${w('usually')} ${w('eat')} ${w('fresh')} fruits and ${w('vegetables')}. I also ${w('run')} three times a week. ${w('sometimes')} it is hard, but I feel much better. My ${w('friend')}s say I look more ${w('happy')} and full of energy.</p>`
    },
    {
        id: "a2-009", level: "A2", unitId: "a2-u4", title: "The Music Festival", wordCount: 60, estimatedMinutes: 3,
        content: `<p>Last month, I went to a music festival with my ${w('friend')}s. It was ${w('exciting')} and ${w('colorful')}. Many bands played ${w('different')} types of music.</p><p>We ${w('enjoy')}ed dancing and singing ${w('together')}. I was ${w('surprised')} by how ${w('good')} some new bands were. We ${w('spend')} the whole day there. It was an ${w('experience')} I will ${w('always')} ${w('remember')}.</p>`
    },
    {
        id: "a2-010", level: "A2", title: "Moving to a New City", wordCount: 64, estimatedMinutes: 3,
        content: `<p>Next month, I am ${w('leave')}ing my hometown. I ${w('decided')} to move to a new city for ${w('work')}. It is ${w('exciting')} but also a little scary.</p><p>I will miss my ${w('family')} and ${w('friend')}s. But I think this ${w('change')} is ${w('important')} for my future. My ${w('mother')} says I should be brave. I ${w('understand')} that new ${w('experience')}s help us grow.</p>`
    },

    // ===== B1 STORIES (11) =====
    {
        id: "b1-001", level: "B1", unitId: "b1-u2", title: "Climate Change Concerns", wordCount: 80, estimatedMinutes: 4,
        content: `<p>Scientists ${w('warn')} that ${w('global')} temperatures are ${w('rising')} at an ${w('alarming')} rate. The ${w('environment')} is changing faster than expected. ${w('government')}s must ${w('implement')} ${w('sustainable')} policies to ${w('prevent')} further damage.</p><p>${w('research')} shows that ${w('technology')} can help us find ${w('solution')}s. ${w('although')} the ${w('challenge')} is ${w('significant')}, many countries are ${w('already')} taking action. It is ${w('necessary')} for ${w('community')}es to work ${w('together')} to protect our planet.</p>`
    },
    {
        id: "b1-002", level: "B1", unitId: "b1-u3", title: "The Digital Revolution", wordCount: 85, estimatedMinutes: 4,
        content: `<p>${w('technology')} has changed how we live, work, and communicate. The internet has created new ${w('opportunity')} for education and business. ${w('recently')}, remote work has become ${w('popular')} around the world.</p><p>${w('although')} ${w('technology')} has many ${w('benefit')}s, there are also ${w('challenge')}s. People ${w('struggle')} with screen addiction and digital privacy. We must ${w('consider')} how to use ${w('technology')} ${w('responsible')}. ${w('therefore')}, we ${w('require')} better digital education for everyone.</p>`
    },
    {
        id: "b1-003", level: "B1", unitId: "b1-u1", title: "Volunteering Abroad", wordCount: 82, estimatedMinutes: 4,
        content: `<p>Last summer, I had the ${w('opportunity')} to volunteer in a ${w('community')} project in Peru. The ${w('experience')} was ${w('significant')} and changed my perspective on life.</p><p>I helped build a school for children who had no access to education. The ${w('challenge')} was ${w('significant')}, but the ${w('community')} ${w('support')}ed us. I ${w('develop')}ed new skills and made friends from ${w('different')} countries. I ${w('recommend')} volunteering to everyone; it is an ${w('effective')} way to grow as a person.</p>`
    },
    {
        id: "b1-004", level: "B1", unitId: "b1-u8", title: "The Importance of Reading", wordCount: 78, estimatedMinutes: 4,
        content: `<p>${w('research')} shows that reading has ${w('significant')} ${w('benefit')}s for the brain. Reading ${w('improve')}s vocabulary, memory, and critical thinking. Teachers ${w('encourage')} students to read at least 30 minutes daily.</p><p>In the digital age, many people prefer videos over books. ${w('although')} videos are ${w('available')} and ${w('popular')}, reading provides a deeper ${w('experience')}. ${w('consider')}ing these ${w('advantage')}s, schools should ${w('implement')} more reading programs.</p>`
    },
    {
        id: "b1-005", level: "B1", unitId: "b1-u4", title: "Starting a Small Business", wordCount: 84, estimatedMinutes: 4,
        content: `<p>Maria always dreamed of starting her own bakery. After years of ${w('experience')} working in restaurants, she ${w('decided')} to take the ${w('challenge')}.</p><p>She had to ${w('develop')} a business plan and find ${w('available')} locations. The ${w('government')} offered ${w('support')} for small businesses. ${w('although')} the first months were difficult, her ${w('community')} ${w('encourage')}d her. ${w('eventually')}, the bakery became ${w('popular')} and ${w('effective')}ly profitable. Her story shows that hard work and ${w('opportunity')} can lead to success.</p>`
    },
    {
        id: "b1-006", level: "B1", unitId: "b1-u11", title: "Mental Health Awareness", wordCount: 80, estimatedMinutes: 4,
        content: `<p>Mental health is an ${w('important')} topic that ${w('require')}s more ${w('discussion')}. ${w('recently')}, experts ${w('warn')} that stress and anxiety are on the ${w('increase')}. Society must ${w('consider')} mental health as seriously as physical health.</p><p>${w('research')} shows that exercise, good ${w('sleep')}, and social connections ${w('effectively')} ${w('prevent')} mental health problems. ${w('therefore')}, organizations should ${w('implement')} wellness programs. We are all ${w('responsible')} for creating a ${w('supportive')} ${w('environment')}.</p>`
    },
    {
        id: "b1-007", level: "B1", unitId: "b1-u6", title: "Sustainable Living", wordCount: 82, estimatedMinutes: 4,
        content: `<p>Living ${w('sustainable')} is no longer optional. The ${w('global')} ${w('environment')} ${w('require')}s that we change our daily habits. Simple actions can make a ${w('significant')} ${w('different')}.</p><p>${w('consider')} using public transport, reducing waste, and buying local products. These changes ${w('benefit')} both individuals and ${w('community')}es. ${w('research')} shows that ${w('sustainable')} choices also save money. ${w('although')} it may seem like a ${w('small')} effort, ${w('together')} we can ${w('achieve')} ${w('alarming')}ly positive results for our planet.</p>`
    },
    {
        id: "b1-008", level: "B1", unitId: "b1-u10", title: "The Future of Education", wordCount: 86, estimatedMinutes: 4,
        content: `<p>Education is changing ${w('rapidly')}. ${w('technology')} has opened new ${w('opportunity')}es for learning. Online courses are now ${w('available')} to millions of students worldwide.</p><p>${w('although')} traditional classrooms are still ${w('important')}, digital tools ${w('increase')} access to knowledge. ${w('government')}s should ${w('support')} both systems. The ${w('challenge')} is to ${w('implement')} ${w('effective')} programs that ${w('develop')} critical thinking. ${w('eventually')}, the most ${w('successful')} education systems will combine ${w('technology')} and human ${w('influence')} to ${w('achieve')} the best results.</p>`
    },
    {
        id: "b1-009", level: "B1", unitId: "b1-u9", title: "Cultural Exchange", wordCount: 78, estimatedMinutes: 4,
        content: `<p>Cultural exchange programs are an ${w('effective')} way to ${w('understand')} ${w('different')} societies. Students who ${w('travel')} abroad ${w('develop')} empathy and new perspectives.</p><p>I ${w('recently')} participated in an exchange program in Canada. The ${w('experience')} was ${w('significant')}. I learned about ${w('different')} traditions and improved my English. The ${w('influence')} of living in another culture is profound. I ${w('recommend')} this ${w('opportunity')} to anyone looking to grow personally and professionally.</p>`
    },
    {
        id: "b1-010", level: "B1", unitId: "b1-u5", title: "Healthy Eating in Modern Life", wordCount: 84, estimatedMinutes: 4,
        content: `<p>In modern life, eating ${w('healthy')} has become a ${w('challenge')}. Fast food is ${w('available')} everywhere and ${w('popular')} among young people. ${w('although')} it is convenient, it can cause ${w('significant')} health problems.</p><p>Nutritionists ${w('recommend')} cooking at home with ${w('fresh')} ingredients. ${w('research')} shows that a balanced diet can ${w('prevent')} many diseases. It is ${w('necessary')} to ${w('develop')} good eating habits early. ${w('therefore')}, schools should ${w('implement')} nutrition education as part of their programs.</p>`
    },
    {
        id: "b1-011", level: "B1", unitId: "b1-u7", title: "If I Could Change the World", wordCount: 84, estimatedMinutes: 4,
        content: `<p>If I had unlimited resources, I would ${w('develop')} free education programs for every ${w('community')}. If ${w('government')}s ${w('support')}ed creative ideas more, people would have better ${w('opportunity')}es to ${w('achieve')} their dreams.</p><p>If we ${w('consider')}ed the ${w('environment')} in every decision, the world would be a ${w('sustainable')} place. ${w('although')} these are just hypothetical scenarios, they ${w('encourage')} us to think differently. ${w('research')} shows that imagination is an ${w('effective')} way to find real ${w('solution')}s. If everyone contributed, the ${w('challenge')} would become ${w('significant')}ly smaller.</p>`
    },

    // ===== B2 STORIES (13) =====
    {
        id: "b2-001", level: "B2", unitId: "b2-u1", title: "The Road Not Taken", wordCount: 96, estimatedMinutes: 5,
        content: `<p>After graduating, James received two job offers. He chose the corporate position instead of the ${w('research')} one. If he had ${w('pursue')}d the ${w('research')} path, he would have discovered his passion earlier.</p><p>If he had not been so ${w('reluctant')} to take risks, he would have ${w('acknowledge')}d his true interests sooner. ${w('nevertheless')}, the ${w('consequence')} of his decision was not entirely negative. ${w('despite')} the initial ${w('obstacle')}, he ${w('ultimately')} found his way back to ${w('research')}. The ${w('experience')} gave him a ${w('profound')} ${w('perspective')} on life choices.</p>`
    },
    {
        id: "b2-002", level: "B2", unitId: "b2-u2", title: "Between Two Realities", wordCount: 98, estimatedMinutes: 5,
        content: `<p>If Elena had studied abroad, she would now be working at an international firm. She ${w('speculate')}s about this often. If she were more ${w('spontaneous')}, she would have taken that ${w('opportunity')} when it was ${w('available')}.</p><p>Her colleague, who did move overseas, says the ${w('experience')} was ${w('fundamental')} to her career. If Elena hadn't ${w('hesitate')}d, she wouldn't be feeling this ${w('reluctant')} about her current path. ${w('nevertheless')}, she ${w('acknowledge')}s that her choices led to a ${w('genuine')} connection with her local ${w('community')}. Sometimes the ${w('perspective')} we ${w('neglect')} is the one closest to home.</p>`
    },
    {
        id: "b2-003", level: "B2", unitId: "b2-u3", title: "Letters Never Sent", wordCount: 94, estimatedMinutes: 5,
        content: `<p>I wish I had told my grandfather how much his stories meant to me. If only I had ${w('acknowledge')}d his ${w('influence')} while he was alive. I wish I could go back and ${w('convey')} my gratitude in person.</p><p>If only people didn't ${w('neglect')} the ${w('genuine')} connections that matter most. I wish our society weren't so ${w('excessive')}ly focused on ${w('contemporary')} distractions. ${w('nevertheless')}, his ${w('profound')} wisdom ${w('gradually')} ${w('reveal')}ed itself in my own choices. I wish everyone could ${w('perceive')} the value of listening before it's too late.</p>`
    },
    {
        id: "b2-004", level: "B2", unitId: "b2-u4", title: "The Interview", wordCount: 96, estimatedMinutes: 5,
        content: `<p>The journalist asked the scientist what had motivated her ${w('research')}. Dr. Patel explained that she had always been fascinated by ${w('phenomenon')} in nature. She mentioned that her team had ${w('recently')} made a ${w('substantial')} breakthrough.</p><p>When asked whether the discovery would be ${w('controversial')}, she replied that some people might ${w('interpret')} the findings differently. She ${w('emphasize')}d that it was ${w('fundamental')} to ${w('distinguish')} between facts and opinions. The reporter wondered if the ${w('government')} would ${w('acknowledge')} the ${w('insight')}s. Dr. Patel said she hoped they wouldn't ${w('undermine')} the ${w('research')}'s ${w('significance')}.</p>`
    },
    {
        id: "b2-005", level: "B2", unitId: "b2-u5", title: "The Forgotten Masterpiece", wordCount: 94, estimatedMinutes: 5,
        content: `<p>A painting that had been ${w('neglect')}ed for decades was ${w('recently')} discovered in a London warehouse. The artwork is believed to have been created by a ${w('contemporary')} of Monet. It must have been stored there ${w('deliberately')}.</p><p>The canvas has been carefully ${w('restore')}d by experts. The painting's colors, which had been ${w('gradually')} fading, have now been ${w('reveal')}ed in their original beauty. It is expected to ${w('undergo')} ${w('thorough')} analysis before being displayed. The discovery has been described as ${w('enormous')} by critics. ${w('furthermore')}, its ${w('significance')} could ${w('resolve')} long-standing debates about the artist's ${w('influence')}.</p>`
    },
    {
        id: "b2-006", level: "B2", unitId: "b2-u6", title: "A Day of Errands", wordCount: 92, estimatedMinutes: 5,
        content: `<p>Yesterday was incredibly busy. I had my laptop ${w('repair')}ed at the electronics shop and got my suit dry-cleaned for the ${w('interview')}. I also had the plumber fix the kitchen sink, which had been leaking for weeks.</p><p>After getting my car ${w('service')}d, I had my hair cut at the new salon downtown. I need to get these documents ${w('translate')}d before Friday. ${w('furthermore')}, I should have my eyes ${w('test')}ed soon — I've been ${w('neglect')}ing that for months. Getting everything done in one day felt like a ${w('substantial')} ${w('achieve')}ment, but it was ${w('ultimately')} worth the effort.</p>`
    },
    {
        id: "b2-007", level: "B2", unitId: "b2-u7", title: "The City That Never Sleeps", wordCount: 98, estimatedMinutes: 5,
        content: `<p>New York, which attracts millions of visitors every year, is often called the city that never sleeps. Times Square, where ${w('enormous')} billboards light up the night, remains one of the most photographed places on Earth.</p><p>Central Park, which covers over 800 acres, provides a ${w('genuine')} escape from the ${w('contemporary')} urban chaos. The Statue of Liberty, which was a gift from France, continues to symbolize freedom. Broadway, where ${w('sophisticated')} performances take place nightly, offers an ${w('experience')} unlike any other. The city's subway, which is one of the oldest in the world, ${w('demonstrate')}s both the ${w('challenge')}s and the ${w('phenomenon')} of modern infrastructure.</p>`
    },
    {
        id: "b2-008", level: "B2", unitId: "b2-u8", title: "Through the Window", wordCount: 96, estimatedMinutes: 5,
        content: `<p>Sitting by the window, Clara watched the rain fall on the empty street. ${w('overwhelm')}ed by memories, she picked up the old photograph. Not knowing what to expect, she opened the letter her grandmother had left behind.</p><p>Written in faded ink, the words ${w('reveal')}ed a family secret kept for decades. Having read every line ${w('carefully')}, Clara felt a ${w('profound')} sense of understanding. Raised in a small village, her grandmother had faced ${w('enormous')} ${w('obstacle')}s. ${w('determine')}d to find answers, Clara ${w('resolve')}d to visit that village. Walking out into the rain, she felt the weight of the past ${w('gradually')} lifting from her shoulders.</p>`
    },
    {
        id: "b2-009", level: "B2", unitId: "b2-u9", title: "Countdown", wordCount: 94, estimatedMinutes: 5,
        content: `<p>By this time next year, the new space station will have been ${w('complete')}d. Scientists will have been working on it for over a decade. The team will have ${w('undergo')}ne ${w('thorough')} training before the launch date.</p><p>By 2030, thousands of people will have ${w('visit')}ed space as tourists. Researchers will have been studying the effects of zero gravity for years. The station will have ${w('integrate')}d ${w('sophisticated')} ${w('technology')} from twelve countries. ${w('furthermore')}, it will have become a ${w('fundamental')} ${w('research')} hub. This ${w('phenomenon')} will have ${w('demonstrate')}d that international ${w('compromise')} can ${w('achieve')} ${w('substantial')} results for humanity.</p>`
    },
    {
        id: "b2-010", level: "B2", unitId: "b2-u10", title: "Lost in Translation", wordCount: 96, estimatedMinutes: 5,
        content: `<p>When Tom moved to Japan, he had to ${w('figure-out')} how everything worked from scratch. He couldn't ${w('keep-up')} with conversations at first and often ${w('mix-up')} similar-sounding words. His colleagues would ${w('point-out')} his mistakes ${w('genuine')}ly trying to help.</p><p>He ${w('gradually')} ${w('pick-up')} the language by talking to locals daily. He had to ${w('put-up')} with many embarrassing moments, but he never gave up. He learned to ${w('look-into')} the cultural meaning behind phrases. ${w('eventually')}, he ${w('come-across')} as fluent to strangers. Looking back, he ${w('acknowledge')}s that the ${w('struggle')} helped him ${w('grow-up')} in unexpected ways.</p>`
    },
    {
        id: "b2-011", level: "B2", unitId: "b2-u11", title: "The Power of Words", wordCount: 94, estimatedMinutes: 5,
        content: `<p>Rarely have words had such a ${w('profound')} impact on society as they do today. Never before has ${w('widespread')} access to information been so ${w('fundamental')} to democracy. Not only does language shape our ${w('perspective')}, but it also ${w('determine')}s how we ${w('perceive')} reality.</p><p>It was the invention of the printing press that ${w('ultimately')} ${w('demonstrate')}d the ${w('enormous')} power of the written word. What makes language truly ${w('sophisticated')} is its ability to ${w('convey')} complex emotions. Seldom do we ${w('acknowledge')} how ${w('deliberately')} words can be used to ${w('undermine')} or ${w('support')} ${w('controversial')} ideas. Only through ${w('thorough')} education can we learn to ${w('distinguish')} truth from manipulation.</p>`
    },
    {
        id: "b2-012", level: "B2", unitId: "b2-u12", title: "The Last Summer", wordCount: 98, estimatedMinutes: 5,
        content: `<p>The summer of 2019 had been unlike any other. By August, the group of friends had been meeting every weekend at the old lighthouse. They had already ${w('acknowledge')}d that everything was about to change — university was calling them to ${w('different')} cities.</p><p>On the final night, they had gathered around a bonfire. The waves were crashing against the rocks as stars ${w('gradually')} filled the sky. Someone had brought a guitar and was playing ${w('softly')}. They had been sharing stories for hours when Ana ${w('reveal')}ed she was moving abroad. A ${w('profound')} silence fell. It was a ${w('genuine')} moment they would never ${w('forget')} — the ${w('inevitable')} end of an era that had ${w('fundamental')}ly shaped who they were.</p>`
    },
    {
        id: "b2-013", level: "B2", unitId: "b2-u13", title: "Two Sides of the Coin", wordCount: 98, estimatedMinutes: 5,
        content: `<p>Social media has ${w('widespread')} ${w('influence')} on modern life. On the one hand, it enables ${w('genuine')} connections across borders. On the other hand, it can ${w('undermine')} mental health. ${w('furthermore')}, its impact on privacy is a ${w('controversial')} topic that ${w('require')}s ${w('thorough')} ${w('discussion')}.</p><p>${w('moreover')}, while some argue that platforms ${w('demonstrate')} the power of free speech, others ${w('emphasize')} the ${w('tendency')} toward misinformation. ${w('despite')} these concerns, ${w('nevertheless')}, the ${w('benefit')}s remain ${w('substantial')}. In conclusion, it is ${w('fundamental')} to ${w('integrate')} digital literacy into education. ${w('ultimately')}, the ${w('challenge')} lies in finding a ${w('compromise')} between innovation and ${w('responsible')} usage.</p>`
    },
];
