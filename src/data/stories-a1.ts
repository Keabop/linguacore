// A1 stories: two per unit, about 150 words, written with the unit's grammar and the words of
// the A1 deck. The tappable words are the unit's key words; every story ends with three
// comprehension questions that quote the sentence that answers them. Checked by
// src/data/content.test.ts.
import type { Story } from '../lib/db';
import { w } from './storyMarkup';

type A1Story = Omit<Story, 'wordCount' | 'estimatedMinutes'>;

export const a1Stories: A1Story[] = [
    // ---------------------------------------------------------------- Unit 1: Introducing yourself
    {
        id: 'a1-002', level: 'A1', unitId: 'a1-u1', title: 'My Family',
        content: `<p>Hello! My ${w('name')} is Lucía. I am twenty-four ${w('year', 'years')} ${w('old')} and I am ${w('from')} Mexico. I live in a small apartment in Puebla with my ${w('family')}.</p><p>My ${w('mother')} is a ${w('nurse')}. She is very kind and a little ${w('shy')}. My ${w('father')} is an ${w('engineer')}. He is tall and very funny. I have one ${w('brother')} and one ${w('sister')}. My brother, Pablo, is a ${w('student')}. He is nineteen. My sister, Ana, is a ${w('teacher')} at a big school. She is married. Her ${w('husband')} is from Chile, and his name is Diego. They have a ${w('baby')}. Her name is Sofía, and she is very cute.</p><p>And me? I am a waitress in a nice restaurant. I am happy with my job and my family. On Sundays, my grandparents come to our apartment for lunch. It is my favorite day of the week.</p>`,
        questions: [
            { question: 'What is Lucía\'s job?', options: ['She is a waitress.', 'She is a nurse.', 'She is a teacher.'], correctIndex: 0, evidence: 'I am a waitress in a nice restaurant.' },
            { question: 'Who is Diego?', options: ['Ana\'s husband', 'Lucía\'s brother', 'Lucía\'s father'], correctIndex: 0, evidence: 'Her husband is from Chile, and his name is Diego.' },
            { question: 'Why is Sunday Lucía\'s favorite day?', options: ['Her grandparents come for lunch.', 'She doesn\'t work.', 'She visits Chile.'], correctIndex: 0, evidence: 'On Sundays, my grandparents come to our apartment for lunch.' },
        ],
    },
    {
        id: 'a1-011', level: 'A1', unitId: 'a1-u1', title: 'The New Neighbor',
        content: `<p>It is Saturday morning. Someone is at the door. It is a young ${w('woman')} with a big smile.</p><p>"${w('hello', 'Hello')}! I am your new ${w('neighbor')}. My name is Mei. I am from China, but I live here now, in apartment number six."</p><p>"${w('hi', 'Hi')}, Mei! ${w('nice', 'Nice')} to ${w('meet')} you. I am Tom. Come in, please!"</p><p>Mei is a ${w('scientist')}. She works in a big hospital in the city. She is thirty years old and she is not married. She speaks Chinese, English and a little Spanish. "Spanish is a beautiful ${w('language')}," she says, "but it is difficult for me."</p><p>Tom is a ${w('musician')}. He plays the guitar in a band. "Are you ${w('happy')} here?" he asks. "Yes, I am," Mei ${w('answer', 'answers')}. "But I don't have ${w('friend', 'friends')} in the city."</p><p>"Now you have one!" Tom says. "And my ${w('cousin')} Sara lives in apartment number two. She is very funny. ${w('welcome', 'Welcome')} to the building, Mei!"</p>`,
        questions: [
            { question: 'Where does Mei work?', options: ['In a hospital', 'In a school', 'In a band'], correctIndex: 0, evidence: 'She works in a big hospital in the city.' },
            { question: 'Which language is difficult for Mei?', options: ['Spanish', 'English', 'Chinese'], correctIndex: 0, evidence: '"Spanish is a beautiful language," she says, "but it is difficult for me."' },
            { question: 'Who lives in flat number two?', options: ['Tom\'s cousin', 'Mei', 'Tom'], correctIndex: 0, evidence: 'And my cousin Sara lives in apartment number two.' },
        ],
    },

    // ---------------------------------------------------------------- Unit 2: Things around me
    {
        id: 'a1-009', level: 'A1', unitId: 'a1-u2', title: 'My Room',
        content: `<p>This is my room. It is ${w('small')}, but I love it. The walls are white and the door is ${w('blue')}.</p><p>Near the window there is a ${w('desk')}. On the desk there is a ${w('computer')}, a radio and a ${w('notebook')}. This notebook is for my English ${w('class')}. I write new ${w('word', 'words')} in it every day. My ${w('pen', 'pens')} and ${w('pencil', 'pencils')} are in a red ${w('box')}.</p><p>That ${w('picture')} on the wall is a photo of my family at the beach. Under the picture there is a ${w('clock')}. It is an old clock, and it is a gift from my grandmother.</p><p>My ${w('clothes')} are in a big box under the bed. My favorite thing is a ${w('green')} jacket. It is long and very warm.</p><p>And that black thing on the chair? It is my bag. It is always ${w('heavy')}, because my books are in it!</p>`,
        questions: [
            { question: 'What color is the door?', options: ['Blue', 'White', 'Green'], correctIndex: 0, evidence: 'The walls are white and the door is blue.' },
            { question: 'Who is the clock a gift from?', options: ['The grandmother', 'The mother', 'A friend'], correctIndex: 0, evidence: 'It is an old clock, and it is a gift from my grandmother.' },
            { question: 'Why is the bag heavy?', options: ['The books are in it.', 'The clothes are in it.', 'The computer is in it.'], correctIndex: 0, evidence: 'It is always heavy, because my books are in it!' },
        ],
    },
    {
        id: 'a1-012', level: 'A1', unitId: 'a1-u2', title: 'Whose Bag Is This?',
        content: `<p>It is the end of the English ${w('lesson')}. The teacher, Mr. Hall, has a ${w('bag')} in his hand.</p><p>"Is this your bag, Carla?"</p><p>"No, it isn't. My bag is ${w('black')}. That bag is ${w('brown')}."</p><p>Mr. Hall opens the bag. In the bag there is a ${w('book')}, a ${w('dictionary')}, an ${w('umbrella')} and a ${w('bottle')} of water. There is also a small ${w('box')}.</p><p>"What is in the box?" asks Carla.</p><p>Mr. Hall opens it. In the box there is a ${w('key')} and a ${w('card')}. The card says: "Happy birthday, Leo!"</p><p>"It's Leo's bag!" says Carla. "Today is his birthday."</p><p>Leo is at the door of the ${w('classroom')}. "Yes! That is my bag. Thank you!" Then he looks at the umbrella. "But that is not my umbrella. My umbrella is ${w('yellow')}."</p><p>Mr. Hall smiles. "Oh, that umbrella is mine. I put it in the wrong bag. Sorry!"</p>`,
        questions: [
            { question: 'What color is Carla\'s bag?', options: ['Black', 'Brown', 'Yellow'], correctIndex: 0, evidence: 'My bag is black.' },
            { question: 'How does Carla know it is Leo\'s bag?', options: ['A birthday card says his name.', 'His name is on the book.', 'Leo tells her.'], correctIndex: 0, evidence: 'The card says: "Happy birthday, Leo!"' },
            { question: 'Whose umbrella is in the bag?', options: ['Mr. Hall\'s', 'Leo\'s', 'Carla\'s'], correctIndex: 0, evidence: 'Oh, that umbrella is mine.' },
        ],
    },

    // ---------------------------------------------------------------- Unit 3: My daily life
    {
        id: 'a1-001', level: 'A1', unitId: 'a1-u3', title: 'My Morning Routine',
        content: `<p>I ${w('wake')} up at six ${w("o'clock")} from ${w('Monday')} to Friday. I am not happy in the ${w('morning')}! First, I take a ${w('shower')}. Then I ${w('brush')} my ${w('tooth', 'teeth')} and I ${w('wash')} my face.</p><p>At half past six, I make ${w('breakfast')}. I ${w('drink')} a cup of coffee and I eat bread with butter. My husband doesn't eat breakfast. He only drinks tea.</p><p>I ${w('leave')} home at seven and I take the ${w('bus')} to work. The bus is always full, so I read a book on my phone. I ${w('arrive')} at the office at eight. I ${w('work')} in a bank in the city center.</p><p>I have ${w('lunch')} with my friends at one o'clock. We eat salad or soup. After work, I go to the gym. I get home at seven in the ${w('evening')}, and we eat ${w('dinner')} together. I go to bed at ten. I am always tired!</p>`,
        questions: [
            { question: 'What does the writer do first after waking up?', options: ['Takes a shower', 'Makes breakfast', 'Brushes her teeth'], correctIndex: 0, evidence: 'First, I take a shower.' },
            { question: 'How does she go to work?', options: ['By bus', 'By car', 'On foot'], correctIndex: 0, evidence: 'I leave home at seven and I take the bus to work.' },
            { question: 'Where does she go after work?', options: ['To the gym', 'To a restaurant', 'To the bank'], correctIndex: 0, evidence: 'After work, I go to the gym.' },
        ],
    },
    {
        id: 'a1-010', level: 'A1', unitId: 'a1-u3', title: 'Dinner Time',
        content: `<p>Every ${w('evening')}, my family ${w('eat', 'eats')} ${w('dinner')} together. It is our favorite ${w('time')} of the ${w('day')}.</p><p>My dad ${w('finish', 'finishes')} work at five and he cooks dinner. He usually makes rice, chicken and vegetables. On ${w('Friday', 'Fridays')}, we have pizza. My mom ${w('get', 'gets')} home at six. She is a doctor, and she is always ${w('busy')}. My brother and I set the table.</p><p>We sit at the table at half past seven. We talk about our day. My brother talks about football, my mom talks about the hospital and I talk about my friends at school. My dad listens and smiles.</p><p>After dinner, I ${w('wash')} the dishes and my brother cleans the table. Then we watch TV for an ${w('hour')}. At ten o'clock, my mom says, "Bedtime!" We say good night and go to bed. ${w('tomorrow', 'Tomorrow')} is a new day.</p>`,
        questions: [
            { question: 'Who cooks dinner?', options: ['The dad', 'The mom', 'The brother'], correctIndex: 0, evidence: 'My dad finishes work at five and he cooks dinner.' },
            { question: 'What do they eat on Fridays?', options: ['Pizza', 'Chicken and rice', 'Soup'], correctIndex: 0, evidence: 'On Fridays, we have pizza.' },
            { question: 'What does the writer do after dinner?', options: ['Washes the dishes', 'Cleans the table', 'Goes to bed'], correctIndex: 0, evidence: 'After dinner, I wash the dishes and my brother cleans the table.' },
        ],
    },

    // ---------------------------------------------------------------- Unit 4: What do you like?
    {
        id: 'a1-003', level: 'A1', unitId: 'a1-u4', title: 'My Best Friend',
        content: `<p>My best friend is Jake. We are very different, but we are always together.</p><p>Jake ${w('love', 'loves')} ${w('sport', 'sports')}. He plays ${w('soccer')} on Saturdays and ${w('basketball')} on Sundays. He is on the school ${w('team')}. I don't ${w('like')} sports. I like ${w('music')} and ${w('art')}. I play the ${w('guitar')} and I paint pictures of animals.</p><p>Does Jake like music? Yes, he does, but he doesn't play an instrument. He ${w('usually')} listens to music in his room. I don't watch soccer on ${w('TV')}, but I ${w('often')} go to his games. He ${w('never')} comes to my art classes, but he ${w('always')} looks at my pictures.</p><p>We both ${w('enjoy')} ${w('movie', 'movies')}. On Friday evenings, we go to the cinema and eat a lot of popcorn. Jake likes funny movies. I like stories about animals. One week we watch a funny movie, and the next week an animal movie. That is fair!</p>`,
        questions: [
            { question: 'What sport does Jake play on Sundays?', options: ['Basketball', 'Soccer', 'Tennis'], correctIndex: 0, evidence: 'He plays soccer on Saturdays and basketball on Sundays.' },
            { question: 'Does Jake play an instrument?', options: ['No, he doesn\'t.', 'Yes, the guitar.', 'Yes, the piano.'], correctIndex: 0, evidence: 'Yes, he does, but he doesn\'t play an instrument.' },
            { question: 'What do they do on Friday evenings?', options: ['They go to the cinema.', 'They play soccer.', 'They paint pictures.'], correctIndex: 0, evidence: 'On Friday evenings, we go to the cinema and eat a lot of popcorn.' },
        ],
    },
    {
        id: 'a1-006', level: 'A1', unitId: 'a1-u4', title: 'My Pets',
        content: `<p>I have three ${w('pet', 'pets')}: a ${w('dog')}, a ${w('cat')} and a ${w('bird')}. I ${w('love')} animals!</p><p>My dog's name is Max. He is big and brown. He loves walks in the park and he ${w('enjoy', 'enjoys')} playing with a ball. He ${w('always')} sleeps near my bed. Max doesn't like baths!</p><p>My cat is Luna. She is small and white. Luna doesn't ${w('like')} Max very much. She ${w('usually')} sleeps on the sofa all day. In the evening, she sits at the window and looks at the birds in the garden. Do cats like birds? Yes, they do, but not in a good way!</p><p>My bird, Kiwi, is green and yellow. He lives in a big cage in the kitchen. He ${w('sing', 'sings')} every morning. My mom says Kiwi is the ${w('best')} clock in the house.</p><p>What is my ${w('favorite')} pet? I don't know. I love them all, but they are often a lot of work!</p>`,
        questions: [
            { question: 'What doesn\'t Max like?', options: ['Baths', 'Walks', 'Balls'], correctIndex: 0, evidence: 'Max doesn\'t like baths!' },
            { question: 'Where does Luna usually sleep?', options: ['On the sofa', 'Near the bed', 'In the kitchen'], correctIndex: 0, evidence: 'She usually sleeps on the sofa all day.' },
            { question: 'Why does the mom say Kiwi is the best clock?', options: ['He sings every morning.', 'He lives in the kitchen.', 'He is green and yellow.'], correctIndex: 0, evidence: 'He sings every morning.' },
        ],
    },

    // ---------------------------------------------------------------- Unit 5: Where is it?
    {
        id: 'a1-008', level: 'A1', unitId: 'a1-u5', title: 'The Park',
        content: `<p>There is a big ${w('park')} near my ${w('house')}. I go there every Sunday with my family.</p><p>In the ${w('middle')} of the park, there is a small river. There are birds on the water and there are old ${w('tree', 'trees')} near it. ${w('between', 'Between')} the river and the ${w('street')}, there is a cafe. We sit ${w('outside')} and drink hot chocolate there.</p><p>${w('behind', 'Behind')} the cafe, there is a tennis club and a ${w('pool')}. The pool is ${w('closed')} in winter. Near the pool, there is a play area for children. My little brother loves it. He climbs everything!</p><p>There aren't any shops in the park, but there is a ${w('library')} ${w('near')} the river. It is a ${w('quiet')} ${w('place')}, and I read there on rainy days.</p><p>There are many ${w('flower', 'flowers')} in spring. In the summer, there are concerts on the ${w('grass')}. The park is my favorite place in the city.</p>`,
        questions: [
            { question: 'What is in the middle of the park?', options: ['A small river', 'A cafe', 'A pool'], correctIndex: 0, evidence: 'In the middle of the park, there is a small river.' },
            { question: 'Where is the play area for children?', options: ['Near the pool', 'Behind the library', 'In the middle of the park'], correctIndex: 0, evidence: 'Near the pool, there is a play area for children.' },
            { question: 'When does the writer go to the library?', options: ['On rainy days', 'Every Sunday', 'In the summer'], correctIndex: 0, evidence: 'It is a quiet place, and I read there on rainy days.' },
        ],
    },
    {
        id: 'a1-013', level: 'A1', unitId: 'a1-u5', title: 'A House by the Sea',
        content: `<p>My grandparents have a ${w('house')} near the ${w('sea')}. It is old, but it is beautiful.</p><p>The house has two floors. Downstairs, there is a big ${w('kitchen')}, a ${w('living room')} and a ${w('bathroom')}. In the living room, there is a blue ${w('sofa')} and there are many pictures on the ${w('wall', 'walls')}. There is a big ${w('window')}, and from the sofa you can see the sea.</p><p>Upstairs, there are three ${w('bedroom', 'bedrooms')}. My bedroom is small. There is a bed, a chair and a ${w('shelf')} with old books. ${w('under', 'Under')} the bed, there is a box of toys from my mom's childhood.</p><p>There isn't a TV in the house, but there is a radio in the kitchen. My grandfather listens to the news there every morning.</p><p>In front of the house, there is a ${w('garden')} with a big ${w('tree')}. ${w('behind', 'Behind')} the house, there is a small path to the beach. In summer, we swim every day.</p>`,
        questions: [
            { question: 'What can you see from the sofa?', options: ['The sea', 'The garden', 'The kitchen'], correctIndex: 0, evidence: 'There is a big window, and from the sofa you can see the sea.' },
            { question: 'What is under the bed?', options: ['A box of toys', 'Old books', 'A radio'], correctIndex: 0, evidence: 'Under the bed, there is a box of toys from my mom\'s childhood.' },
            { question: 'Where is the path to the beach?', options: ['Behind the house', 'In front of the house', 'Next to the kitchen'], correctIndex: 0, evidence: 'Behind the house, there is a small path to the beach.' },
        ],
    },

    // ---------------------------------------------------------------- Unit 6: I can do it!
    {
        id: 'a1-007', level: 'A1', unitId: 'a1-u6', title: 'Learning English',
        content: `<p>My name is Rosa. I am forty years old and I am learning English. It is not ${w('easy')}, but I love it!</p><p>I can read short stories now, and I can write emails to my friends in Canada. I can understand the teacher when she speaks slowly. But I can't understand English songs. The singers are too ${w('fast')}!</p><p>My teacher, Mrs. Hill, says: "${w('listen', 'Listen')} to English every day. ${w('practice', 'Practice')} with a friend. Don't be shy, and ${w('try')} again!" So every morning, I listen to the radio in English in the car. On Tuesdays, I practice with my friend Laura. She can speak English very ${w('well')}.</p><p>My son is ten. He can speak English, French and Spanish. He ${w('help', 'helps')} me with my homework. Some days it is ${w('difficult')}, but he is a good teacher.</p><p>Next year, I want to travel to Canada. I can't wait!</p>`,
        questions: [
            { question: 'What can\'t Rosa understand?', options: ['English songs', 'Her teacher', 'Short stories'], correctIndex: 0, evidence: 'But I can\'t understand English songs.' },
            { question: 'When does Rosa practice with Laura?', options: ['On Tuesdays', 'Every morning', 'On weekends'], correctIndex: 0, evidence: 'On Tuesdays, I practice with my friend Laura.' },
            { question: 'Who helps Rosa with her homework?', options: ['Her son', 'Mrs. Hill', 'Laura'], correctIndex: 0, evidence: 'He helps me with my homework.' },
        ],
    },
    {
        id: 'a1-004', level: 'A1', unitId: 'a1-u6', title: 'A Rainy Day',
        content: `<p>It is Saturday, but the ${w('weather')} is terrible. It is ${w('cold')} and ${w('rainy')}, and there are big gray ${w('cloud', 'clouds')} in the ${w('sky')}. We can't go to the beach today.</p><p>"What can we do?" asks my little sister, Emma.</p><p>"We can ${w('cook')}!" says Mom. "Wash your hands and come to the kitchen."</p><p>Emma can't cook, but she can help. Mom says, "Open the box of eggs, please. Now, ${w('give')} me the milk. ${w('stop', 'Stop')}! Don't drop the bowl!" We make a big chocolate cake.</p><p>Then Dad says, "Let's play a game. ${w('sit', 'Sit')} on the floor, close your eyes and listen." He makes animal sounds, and we guess the animals. Emma can make a very good cat sound!</p><p>At five o'clock, the ${w('rain')} stops. The ${w('sun')} comes out, and it is ${w('warm')}. We ${w('run')} to the park and ${w('jump')} in the water on the path. It is a wonderful day after all.</p>`,
        questions: [
            { question: 'Why can\'t they go to the beach?', options: ['The weather is terrible.', 'Emma is sick.', 'The car is broken.'], correctIndex: 0, evidence: 'It is Saturday, but the weather is terrible.' },
            { question: 'What do they make in the kitchen?', options: ['A chocolate cake', 'Pizza', 'Soup'], correctIndex: 0, evidence: 'We make a big chocolate cake.' },
            { question: 'What happens at five o\'clock?', options: ['The rain stops.', 'Dad comes home.', 'They go to bed.'], correctIndex: 0, evidence: 'At five o\'clock, the rain stops.' },
        ],
    },

    // ---------------------------------------------------------------- Unit 7: At the market
    {
        id: 'a1-005', level: 'A1', unitId: 'a1-u7', title: 'At the Store',
        content: `<p>It is Friday afternoon, and Sam is at the ${w('supermarket')} with his ${w('list')}.</p><p>"We need some ${w('bread')}, some ${w('milk')} and six ${w('egg', 'eggs')}," he reads. "And we need some ${w('fruit')} for breakfast."</p><p>He takes some ${w('apple', 'apples')} and some ${w('banana', 'bananas')}. Then he looks at the ${w('cheese')}. There isn't any cheese from Mexico today, so he takes a small piece of French cheese. It is very ${w('expensive')}!</p><p>"Do we have any ${w('rice')} at home?" he thinks. He calls his wife. "Yes, we have a lot of rice," she says. "But we don't have any ${w('coffee')}. And ${w('buy')} some ${w('chocolate')}, please!"</p><p>Finally, Sam pays. "That's thirty-five ${w('dollar', 'dollars')}," says the woman. Sam doesn't have any money in his ${w('pocket')}! But he has his ${w('credit card')}. "Can I ${w('pay')} by card?" he asks. "Of course," the woman says with a smile.</p>`,
        questions: [
            { question: 'Why does Sam buy French cheese?', options: ['There isn\'t any cheese from Mexico.', 'It is cheap.', 'His wife likes it.'], correctIndex: 0, evidence: 'There isn\'t any cheese from Mexico today, so he takes a small piece of French cheese.' },
            { question: 'What don\'t they have at home?', options: ['Coffee', 'Rice', 'Tea'], correctIndex: 0, evidence: 'But we don\'t have any coffee.' },
            { question: 'How does Sam want to pay?', options: ['By card', 'With cash', 'With his phone'], correctIndex: 0, evidence: 'Can I pay by card?' },
        ],
    },
    {
        id: 'a1-014', level: 'A1', unitId: 'a1-u7', title: 'A Picnic in the Park',
        content: `<p>It is a sunny Sunday, and Nadia and her friends want to have a picnic in the park. Everyone brings some ${w('food')}.</p><p>Nadia makes ${w('sandwich', 'sandwiches')} with ${w('chicken')} and ${w('tomato', 'tomatoes')}. Her friend Omar brings a big ${w('salad')} and some ${w('grape', 'grapes')}. Lily can't cook, so she buys a ${w('cake')} at the bakery. It has a lot of ${w('sugar')} and ${w('cream')}, and it looks ${w('delicious')}.</p><p>"Is there any ${w('water')}?" asks Omar. "We have ${w('juice')} and ${w('tea')}, but there isn't any water," says Nadia. </p><p>"No problem," says Lily. "There is a small store near the park. How ${w('much')} is a bottle of water there?" "Only one dollar," says Omar, and he goes to buy three bottles.</p><p>They sit on the grass under a big tree. They are very ${w('hungry')}, and they eat almost everything! Only one ${w('piece')} of cake is on the plate. "Let's ${w('share')} it," says Nadia, and she cuts it into three. It is a perfect day.</p>`,
        questions: [
            { question: 'Why does Lily buy a cake?', options: ['She can\'t cook.', 'She likes sugar.', 'It is her birthday.'], correctIndex: 0, evidence: 'Lily can\'t cook, so she buys a cake at the bakery.' },
            { question: 'What drink don\'t they have?', options: ['Water', 'Juice', 'Tea'], correctIndex: 0, evidence: 'We have juice and tea, but there isn\'t any water' },
            { question: 'What do they do with the last piece of cake?', options: ['They share it.', 'Nadia eats it.', 'They take it home.'], correctIndex: 0, evidence: '"Let\'s share it," says Nadia, and she cuts it into three.' },
        ],
    },
];
