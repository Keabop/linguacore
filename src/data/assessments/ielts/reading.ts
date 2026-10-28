// IELTS Academic Reading: three original passages of rising difficulty, 40 questions.
// Every answer can be found in its passage; `evidence` quotes the words that give it
// (not-given items have none by definition). Checked by src/data/content.test.ts.
import type { AssessmentQuestion, ExamLevel, TfngAnswer } from '../../../lib/exam/types';

type Q = AssessmentQuestion;

function passageKit(n: number, passage: string, level: ExamLevel) {
    const base = (id: number) => ({ id: `ielts_r${n}_${id}`, section: 'reading' as const, level, passage, group: `ielts-reading-${n}` });
    return {
        tfng: (id: number, text: string, answer: TfngAnswer, evidence?: string, variant?: 'yes-no'): Q =>
            ({ ...base(id), kind: 'tfng', text, answer, evidence, variant }),
        gap: (id: number, text: string, answers: string[], evidence: string, maxWords = 2): Q =>
            ({ ...base(id), kind: 'gap', text, answers, maxWords, evidence }),
        mc: (id: number, text: string, options: string[], correctIndex: number, evidence: string, fixedOrder = false): Q =>
            ({ ...base(id), text, options, correctIndex, evidence, fixedOrder }),
    };
}

// ---------------------------------------------------------------- Passage 1 (questions 1–13)

const P1 = `Bees on the Rooftops

In the spring of 2008, a hotel in central London installed four beehives on its roof. Guests were sceptical at first, but within a year the kitchen was serving honey produced a few metres above the dining room, and the hotel's marketing department had discovered that bees made an excellent story. The idea spread quickly. By the end of the following decade, the number of registered hives in the city had more than doubled, and similar rooftop projects had appeared in Paris, New York and Tokyo.

The appeal is easy to understand. For businesses, a hive is a visible sign of environmental responsibility that costs relatively little to maintain. For city residents, keeping bees offers a connection with nature that is otherwise hard to find among concrete and traffic. Many urban beekeepers describe the hobby as calming; opening a hive requires slow, careful movements and complete attention, which some compare to meditation.

Starting a colony is not complicated. A beginner needs a hive, a protective suit, a smoker to calm the bees and, of course, the bees themselves, which are usually bought as a small colony in late spring. Most associations recommend visiting the hive about once a week in summer, mainly to check that the queen is healthy and that the colony has enough space to grow. In winter the bees stay inside, clustering together to keep warm, and need little attention apart from occasional checks on their food supply.

Cities can also be surprisingly good places for bees. Parks, gardens, railway embankments and even the plants on balconies provide a wide variety of flowers that bloom at different times of year. In the countryside, by contrast, large farms often grow a single crop over hundreds of hectares, so bees may have plenty of food for a few weeks and very little for the rest of the season. Urban honey is often more varied in flavour as a result, and some studies have found that city colonies produce more honey per hive than those on nearby farms.

However, ecologists have started to question whether the boom is as beneficial as it appears. The honeybee is only one of more than 250 bee species found in Britain, and most of the others are wild, solitary insects that do not live in hives or make honey. These wild bees are far more important for pollinating many native plants, and they compete with honeybees for the same nectar and pollen. A single hive can contain 50,000 workers in summer, so a high density of hives in a small area may leave little food for the wild species that share it. Unlike honeybees, many wild species are active for only a few weeks each year and visit a narrow range of plants, which makes them especially sensitive to competition.

Research carried out in London in 2020 suggested that this concern was justified. The researchers compared the number of hives in different parts of the city with the amount of flowering plants available. In the areas with the most hives, they concluded, there were not enough flowers to support the bees already there, and adding further colonies would increase pressure on wild pollinators. Disease is a second worry: honeybees can carry viruses that spread to other species when insects visit the same flowers.

None of this means that urban beekeeping should stop. Instead, many experts now argue that the priority should be planting rather than adding hives. A company that wants to support pollinators, they suggest, would achieve more by turning a roof into a meadow of native flowers than by placing hives on it. Some beekeeping associations have responded by asking new members to complete a training course before acquiring a colony, and by publishing maps that show where hive numbers are already high.

The hotel that started the trend has adapted too. It still keeps two hives, but the other two have been replaced by planters of lavender, thyme and wild marjoram, which are visited by a wide range of insects. The honey is now sold in smaller quantities, and the hotel's guides explain to visitors that a city friendly to bees is one with plenty of flowers, not simply plenty of hives.`;

const p1 = passageKit(1, P1, 'B2');

const passage1: Q[] = [
    p1.tfng(1, "The hotel's guests were immediately enthusiastic about the hives.", 'false', 'Guests were sceptical at first'),
    p1.tfng(2, 'Rooftop beehive projects were later started in other major cities.', 'true', 'similar rooftop projects had appeared in Paris, New York and Tokyo'),
    p1.tfng(3, 'Some beekeepers find working with bees relaxing.', 'true', 'Many urban beekeepers describe the hobby as calming'),
    p1.tfng(4, 'Urban honey is usually more expensive than honey from farms.', 'not-given'),
    p1.tfng(5, 'Most bee species in Britain live in hives.', 'false', 'most of the others are wild, solitary insects that do not live in hives'),
    p1.tfng(6, "The 2020 study found that the number of wild bees in London had fallen.", 'not-given'),
    p1.gap(7, 'On large farms, bees may have plenty of food for only a few ___.', ['weeks'], 'plenty of food for a few weeks'),
    p1.gap(8, 'In summer, a single hive can contain as many as 50,000 ___.', ['workers'], '50,000 workers'),
    p1.gap(9, 'Honeybees can pass ___ to other species at the flowers they share.', ['viruses'], 'honeybees can carry viruses'),
    p1.gap(10, 'Some associations ask new members to complete a ___ before getting a colony.', ['training course', 'course'], 'complete a training course'),
    p1.mc(11, 'According to the writer, why can cities be good places for honeybees?', [
        'City flowers bloom at many different times of year.',
        'Cities are warmer than the countryside.',
        'Farmers use chemicals that harm bees.',
        'Urban bees are protected by law.',
    ], 0, 'a wide variety of flowers that bloom at different times of year'),
    p1.mc(12, 'What do many experts now advise companies that want to help pollinators?', [
        'Keep fewer but larger hives',
        'Grow native flowers on their roofs',
        'Buy honey from local beekeepers',
        'Move their hives to the countryside',
    ], 1, 'turning a roof into a meadow of native flowers'),
    p1.mc(13, 'What is the main purpose of the final paragraph?', [
        'To show that the original hotel has changed its approach',
        'To criticise the hotel for continuing to keep bees',
        'To explain how lavender honey is produced',
        'To argue that hotels should stop selling honey',
    ], 0, 'The hotel that started the trend has adapted too'),
];

// ---------------------------------------------------------------- Passage 2 (questions 14–26)

const P2 = `Reading the Climate in Ice

A  Deep beneath the surface of Antarctica lies one of the most detailed records of the Earth's past climate. Every year, snow falls on the ice sheet and is gradually pressed down by the layers that follow. Over thousands of years it turns into solid ice, and in the coldest and driest regions the process continues almost undisturbed. By drilling down through the ice and extracting long cylinders, known as cores, scientists can read this record layer by layer, much as a geologist reads the strata in a cliff. The ice sheet covering Antarctica holds about 90 per cent of all the ice on Earth, and in places it is more than four kilometres thick.

B  The most valuable information is contained in tiny bubbles of air. As snow becomes ice, air from the atmosphere is trapped between the grains, and when the ice finally seals, these bubbles become samples of the air that existed at that time. Analysing them allows researchers to measure past concentrations of carbon dioxide and methane directly, rather than estimating them from indirect evidence. The ice itself provides another clue: the ratio of different forms of oxygen and hydrogen in the frozen water reflects the temperature at which the snow originally fell. Because the gases are measured directly, ice cores have become one of the most trusted sources of information about the atmosphere before modern instruments existed.

C  Extracting a core is a slow and demanding operation. Drilling teams typically work in temperatures far below freezing, and a single project may take several summer seasons to reach the bottom of an ice sheet more than three kilometres thick. Each section of core, usually about three metres long, must be handled with great care, since cracks can allow modern air to contaminate the ancient samples. The sections are then stored at around minus 30°C and transported in refrigerated containers to laboratories, where they are cut into smaller pieces for analysis. Drillers must also keep the borehole filled with a special fluid, since the pressure of the surrounding ice would otherwise slowly close it.

D  Dating the layers presents its own challenges. Near the surface, individual years can often be counted, because summer and winter snow differ in texture and chemistry. Deeper down, however, the weight of the ice above squeezes the layers until they become too thin to distinguish. There, scientists rely on reference points such as layers of volcanic ash, which can be linked to eruptions whose dates are known from other sources, and on computer models of how ice flows and compresses. By combining these methods, researchers can usually date ice that is hundreds of thousands of years old to within a few thousand years.

E  The results have transformed our understanding of the climate system. The longest continuous record yet recovered, from a site called Dome C, covers about 800,000 years and shows eight complete cycles of ice ages and warmer periods. Throughout this period, carbon dioxide levels and temperature rose and fell together, and carbon dioxide never exceeded about 300 parts per million. Today's level, above 420 parts per million, is therefore outside anything the record contains. The record also shows that the change from a cold period to a warm one could happen relatively quickly, over a few thousand years, while the return to glacial conditions was usually much slower. Cores from Greenland, which cover a shorter period, add a more detailed view of the last 100,000 years and show that the climate of that time was far less stable than today's.

F  Researchers are now searching for even older ice. Computer models suggest that ice up to 1.5 million years old may survive in a few places where the ice sheet has remained stable and the bedrock is cold enough to prevent melting at the base. Such a core could explain a puzzling change that took place around a million years ago, when the regular rhythm of ice ages slowed from roughly 41,000 years to about 100,000 years. A European project began drilling at one promising location in 2021, with the aim of reaching the oldest layers within a few seasons. If the project succeeds, sections of the core will be shipped to laboratories in several countries, so that different teams can check one another's results.`;

const p2 = passageKit(2, P2, 'B2');

// Matching headings: one shared list, kept in its printed order
const HEADINGS = [
    'i. A record built up over thousands of years',
    'ii. Air from the distant past',
    'iii. Careful work in extreme conditions',
    'iv. Working out the age of deep ice',
    'v. What the longest record reveals',
    'vi. The search for an even older record',
    'vii. Why some ice sheets are melting faster',
    'viii. The rising cost of polar research',
];
const heading = (id: number, paragraph: string, correctIndex: number, evidence: string) =>
    p2.mc(id, `Choose the correct heading for paragraph ${paragraph}.`, HEADINGS, correctIndex, evidence, true);

const passage2: Q[] = [
    heading(14, 'A', 0, 'Over thousands of years it turns into solid ice'),
    heading(15, 'B', 1, 'these bubbles become samples of the air that existed at that time'),
    heading(16, 'C', 2, 'Drilling teams typically work in temperatures far below freezing'),
    heading(17, 'D', 3, 'Dating the layers presents its own challenges'),
    heading(18, 'E', 4, 'The longest continuous record yet recovered'),
    heading(19, 'F', 5, 'Researchers are now searching for even older ice'),
    p2.gap(20, 'Air bubbles allow direct measurement of past levels of carbon dioxide and ___.', ['methane'], 'carbon dioxide and methane directly', 1),
    p2.gap(21, 'Sections of core are stored at around minus ___ °C.', ['30', 'thirty'], 'stored at around minus 30°C', 1),
    p2.gap(22, 'Near the surface, summer and winter snow differ in texture and ___.', ['chemistry'], 'differ in texture and chemistry', 1),
    p2.gap(23, 'Deep layers can be dated using layers of volcanic ___.', ['ash'], 'layers of volcanic ash', 1),
    p2.mc(24, 'What does the Dome C record show about carbon dioxide?', [
        'It stayed below about 300 parts per million.',
        'It rose steadily over 800,000 years.',
        'It was highest during the ice ages.',
        'It changed independently of temperature.',
    ], 0, 'carbon dioxide never exceeded about 300 parts per million'),
    p2.mc(25, 'Why might ice 1.5 million years old survive in some places?', [
        'The ice there is unusually thin.',
        'The ice sheet is stable and the bedrock is cold.',
        'Layers of volcanic ash protect the ice.',
        'Earlier drilling teams left the ice untouched.',
    ], 1, 'the ice sheet has remained stable and the bedrock is cold enough'),
    p2.mc(26, 'What change took place around a million years ago?', [
        'The ice ages came to an end.',
        'The cycles of ice ages became longer.',
        'Carbon dioxide rose above 300 parts per million.',
        'Antarctica was first covered by ice.',
    ], 1, 'slowed from roughly 41,000 years to about 100,000 years'),
];

// ---------------------------------------------------------------- Passage 3 (questions 27–40)

const P3 = `Too Many Options?

In a now famous experiment carried out in a Californian supermarket at the turn of the century, two psychologists set up a tasting table offering samples of jam. On some days the table displayed 24 varieties; on others, only six. The larger display attracted more interest, with 60 per cent of passing shoppers stopping, compared with 40 per cent for the smaller one, but when it came to buying, the pattern reversed. Around 30 per cent of those who had visited the small display went on to purchase a jar, whereas only 3 per cent of those who had faced 24 options did so.

The study became one of the most widely cited findings in behavioural science, and the phenomenon it appeared to demonstrate acquired a name: choice overload. The idea that people are made less decisive, and perhaps less happy, by an abundance of options was soon applied far beyond jam. Writers used it to explain why employees failed to join pension schemes with dozens of investment funds, and why people using dating apps, with hundreds of potential partners, seemed to struggle to commit to any of them. Retailers, for their part, began to question the long-standing assumption that a wider range always sells more.

Yet the effect has proved surprisingly difficult to pin down. When researchers attempted to repeat the original findings, many failed to observe any difference between large and small selections, and some found the opposite: that more choice led to more purchases. In 2010 a team led by Benjamin Scheibehenne combined the results of 50 such experiments in a single statistical analysis and concluded that, on average, the effect of the number of options was close to zero. In my view, it would be a mistake to read this as proof that choice overload is a myth. A more reasonable interpretation is that it occurs only under particular conditions, and that the original studies happened to create them.

Later work has helped to identify what those conditions are. A second analysis, published five years after the first, found that overload was most likely when the decision was complex, when people were unsure what they wanted, when the options were difficult to compare, and when the task required them to reach a decision quickly. When shoppers already have a clear preference, such as a favourite brand of coffee, a large range poses little difficulty, because they can simply search for what they know. It is the uncertain chooser, faced with many similar alternatives and no obvious way of telling them apart, who is most likely to give up. In practice, this means that the same supermarket shelf can overwhelm one shopper and suit another perfectly well.

This more nuanced picture has practical implications, although I suspect they are less dramatic than some business consultants claim. Reducing the number of products on a shelf is not, in itself, a reliable way to increase sales. What appears to help is making the choice easier to navigate: grouping options into a small number of clear categories, describing them in terms that customers understand, or offering a sensible default that people can accept if they do not wish to decide. Pension schemes that automatically enrol employees in a well-chosen fund, while allowing them to change it, have been notably successful at increasing participation.

There is also a question that the original experiment could not address: whether people who choose from a larger range end up more or less satisfied with what they select. Some studies suggest that a wide selection raises expectations, so that a good outcome feels disappointing when people imagine that a better one was available. Others have found that experienced choosers, who know what they are looking for, are happier with more options. Researchers have also noticed that people who expect to explain their decision to others tend to find large selections harder, presumably because every rejected option is one they might have to justify. It seems likely that both are true for different people, which is perhaps the most important lesson of the whole debate: the effect of choice depends less on the number of options than on the person doing the choosing.`;

const p3 = passageKit(3, P3, 'C1');
const view = (id: number, text: string, answer: TfngAnswer, evidence?: string) => p3.tfng(id, text, answer, evidence, 'yes-no');

const passage3: Q[] = [
    view(27, 'The 2010 analysis proves that choice overload does not exist.', 'false', 'it would be a mistake to read this as proof that choice overload is a myth'),
    view(28, 'Reducing the number of products is a dependable way for shops to sell more.', 'false', 'is not, in itself, a reliable way to increase sales'),
    view(29, 'Some business consultants exaggerate the practical lessons of research on choice.', 'true', 'less dramatic than some business consultants claim'),
    view(30, 'Dating apps should limit the number of profiles they show their users.', 'not-given'),
    view(31, 'How much people are affected by choice depends mainly on the individual.', 'true', 'depends less on the number of options than on the person doing the choosing'),
    p3.mc(32, 'In the jam experiment, which display led to more purchases?', [
        'The display with 24 varieties',
        'The display with six varieties',
        'Both displays equally',
        'The larger display on most days',
    ], 1, 'Around 30 per cent of those who had visited the small display went on to purchase a jar'),
    p3.mc(33, 'What did many attempts to repeat the jam study find?', [
        'The same strong effect as the original',
        'No difference, or the opposite effect',
        'An effect that appeared only in online shops',
        'A preference for smaller supermarkets',
    ], 1, 'many failed to observe any difference between large and small selections'),
    p3.mc(34, 'According to the fourth paragraph, when is a large range least likely to cause problems?', [
        'When shoppers already know what they want',
        'When the options are very similar',
        'When the decision has to be made quickly',
        'When the products are expensive',
    ], 0, 'When shoppers already have a clear preference'),
    p3.mc(35, 'Why does the writer mention pension schemes in the fifth paragraph?', [
        'To show that a sensible default can help people decide',
        'To show that employees distrust pension funds',
        'To criticise schemes that enrol people automatically',
        'To prove that fewer funds increase participation',
    ], 0, 'Pension schemes that automatically enrol employees in a well-chosen fund'),
    p3.gap(36, 'In the original experiment, 60 per cent of passing shoppers stopped at the ___ display.', ['larger'], 'The larger display attracted more interest'),
    p3.gap(37, 'The tendency to become less decisive when facing many options was named ___.', ['choice overload'], 'acquired a name: choice overload'),
    p3.gap(38, "Scheibehenne's team combined the results of ___ experiments.", ['50', 'fifty'], 'combined the results of 50 such experiments'),
    p3.gap(39, 'Overload is more likely when the options are difficult to ___.', ['compare'], 'when the options were difficult to compare'),
    p3.gap(40, 'A wide selection may raise people\'s ___, so that a good result feels disappointing.', ['expectations'], 'a wide selection raises expectations'),
];

export const ieltsReading: Q[] = [...passage1, ...passage2, ...passage3];
