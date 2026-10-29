import type { Story } from '../lib/db';
import { a1Stories } from './stories-a1';
import { a2Stories } from './stories-a2';
import { w } from './storyMarkup';

/** Words in the story's text, without the markup. */
function countWords(content: string): number {
    return content.replace(/<[^>]+>/g, ' ').match(/[A-Za-z']+/g)?.length ?? 0;
}

// About 100 words a minute: a learner reading carefully, tapping unknown words
const withReadingStats = (s: Omit<Story, 'wordCount' | 'estimatedMinutes'>): Story => {
    const wordCount = countWords(s.content);
    return { ...s, wordCount, estimatedMinutes: Math.max(1, Math.round(wordCount / 100)) };
};

const stories: Story[] = [
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
        content: `<p>Maria always dreamed of starting her own bakery. After years of ${w('experience')} working in restaurants, she ${w('decide', 'decided')} to take the ${w('challenge')}.</p><p>She had to ${w('develop')} a business plan and find ${w('available')} locations. The ${w('government')} offered ${w('support')} for small businesses. ${w('although')} the first months were difficult, her ${w('community')} ${w('encourage')}d her. ${w('eventually')}, the bakery became ${w('popular')} and ${w('effective')}ly profitable. Her story shows that hard work and ${w('opportunity')} can lead to success.</p>`
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

export const storiesData: Story[] = [...a1Stories, ...a2Stories, ...stories].map(withReadingStats);
