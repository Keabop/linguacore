export interface DialogueLine {
    speaker: 'A' | 'B';
    accent: 'US' | 'UK';
    gender: 'male' | 'female';
    text: string;
}

export interface AssessmentQuestion {
    id: string;
    section: 'use-of-english' | 'reading' | 'listening';
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
    text: string; // The instruction or question
    dialogue?: DialogueLine[]; // For listening sections
    passage?: string | null; // For reading sections
    options: string[];
    correctIndex: number;
}

export interface WritingPrompt {
    id: string;
    preset: 'toefl' | 'ielts' | 'cambridge';
    prompt: string;
    targetWords: string;
    instructions: string;
}

// 1. Placement Questions dataset
export const placementQuestions: AssessmentQuestion[] = [
    // USE OF ENGLISH (15 questions: 3 per CEFR level)
    {
        id: 'p_uoe_a1_1',
        section: 'use-of-english',
        level: 'A1',
        text: 'She ______ a doctor. She works in a large hospital.',
        options: ['is', 'are', 'be', 'am'],
        correctIndex: 0
    },
    {
        id: 'p_uoe_a1_2',
        section: 'use-of-english',
        level: 'A1',
        text: 'Do you like ______ apples? Yes, I love them.',
        options: ['this', 'that', 'these', 'them'],
        correctIndex: 2
    },
    {
        id: 'p_uoe_a1_3',
        section: 'use-of-english',
        level: 'A1',
        text: 'They ______ go to the cinema on Mondays.',
        options: ['doesn\'t', 'don\'t', 'no', 'isn\'t'],
        correctIndex: 1
    },
    {
        id: 'p_uoe_a2_1',
        section: 'use-of-english',
        level: 'A2',
        text: 'Yesterday, I ______ to the supermarket to buy some milk.',
        options: ['go', 'went', 'gone', 'going'],
        correctIndex: 1
    },
    {
        id: 'p_uoe_a2_2',
        section: 'use-of-english',
        level: 'A2',
        text: 'This laptop is ______ than mine.',
        options: ['more cheap', 'cheaper', 'cheap', 'cheapest'],
        correctIndex: 1
    },
    {
        id: 'p_uoe_a2_3',
        section: 'use-of-english',
        level: 'A2',
        text: 'Have you ______ eaten Japanese food?',
        options: ['never', 'ever', 'yet', 'already'],
        correctIndex: 1
    },
    {
        id: 'p_uoe_b1_1',
        section: 'use-of-english',
        level: 'B1',
        text: 'If I ______ enough money, I would buy a new house.',
        options: ['have', 'had', 'would have', 'will have'],
        correctIndex: 1
    },
    {
        id: 'p_uoe_b1_2',
        section: 'use-of-english',
        level: 'B1',
        text: 'The book ______ was written by Garcia Marquez is very famous.',
        options: ['who', 'which', 'whom', 'whose'],
        correctIndex: 1
    },
    {
        id: 'p_uoe_b1_3',
        section: 'use-of-english',
        level: 'B1',
        text: 'She ______ in London for five years before she moved to Spain.',
        options: ['lived', 'has lived', 'had been living', 'is living'],
        correctIndex: 2
    },
    {
        id: 'p_uoe_b2_1',
        section: 'use-of-english',
        level: 'B2',
        text: 'I suggest ______ a professional before signing the contract.',
        options: ['to consult', 'consulting', 'consult', 'should consult'],
        correctIndex: 1
    },
    {
        id: 'p_uoe_b2_2',
        section: 'use-of-english',
        level: 'B2',
        text: 'By next year, they ______ building the new highway.',
        options: ['will finish', 'will have finished', 'are finishing', 'finished'],
        correctIndex: 1
    },
    {
        id: 'p_uoe_b2_3',
        section: 'use-of-english',
        level: 'B2',
        text: 'Hardly ______ entered the room when the phone started ringing.',
        options: ['I had', 'had I', 'did I', 'was I'],
        correctIndex: 1
    },
    {
        id: 'p_uoe_c1_1',
        section: 'use-of-english',
        level: 'C1',
        text: '______ did I know that my whole life was about to change.',
        options: ['Little', 'Few', 'Seldom', 'Scarcely'],
        correctIndex: 0
    },
    {
        id: 'p_uoe_c1_2',
        section: 'use-of-english',
        level: 'C1',
        text: 'He talked about the event as if he ______ there himself.',
        options: ['were', 'had been', 'was', 'would be'],
        correctIndex: 1
    },
    {
        id: 'p_uoe_c1_3',
        section: 'use-of-english',
        level: 'C1',
        text: 'The CEO demanded that the report ______ submitted immediately.',
        options: ['is', 'was', 'be', 'should be'],
        correctIndex: 2
    },

    // LISTENING (10 questions: 2 per CEFR level)
    {
        id: 'p_lis_a1_1',
        section: 'listening',
        level: 'A1',
        text: 'Where are the speakers going to meet?',
        dialogue: [
            { speaker: 'A', accent: 'US', gender: 'male', text: 'Hi Susan. Are we meeting at the coffee shop or at the park?' },
            { speaker: 'B', accent: 'UK', gender: 'female', text: 'Let\'s meet at the coffee shop. The weather is too cold for the park today.' }
        ],
        options: ['At the park', 'At the coffee shop', 'At the library', 'AtSusan\'s house'],
        correctIndex: 1
    },
    {
        id: 'p_lis_a2_1',
        section: 'listening',
        level: 'A2',
        text: 'What did the man buy for dinner?',
        dialogue: [
            { speaker: 'A', accent: 'US', gender: 'male', text: 'Hello dear. I got some fresh fish and potatoes from the market.' },
            { speaker: 'B', accent: 'UK', gender: 'female', text: 'Perfect. We have salad ready, so we don\'t need chicken.' }
        ],
        options: ['Chicken and salad', 'Fish and potatoes', 'Salad only', 'Beef and vegetables'],
        correctIndex: 1
    },
    {
        id: 'p_lis_b1_1',
        section: 'listening',
        level: 'B1',
        text: 'Why was the meeting postponed?',
        dialogue: [
            { speaker: 'A', accent: 'UK', gender: 'female', text: 'Hi Mark. Did you hear that our marketing briefing got moved to Thursday?' },
            { speaker: 'B', accent: 'US', gender: 'male', text: 'Yes. The director said she was stuck at the airport due to the heavy fog.' }
        ],
        options: ['The director got sick', 'Bad weather delayed the director', 'The office was closed', 'The marketing plan wasn\'t ready'],
        correctIndex: 1
    },
    {
        id: 'p_lis_b2_1',
        section: 'listening',
        level: 'B2',
        text: 'What does the speaker imply about the new software update?',
        dialogue: [
            { speaker: 'A', accent: 'US', gender: 'male', text: 'The new design layout looks modern, but honestly, it takes three clicks more to export standard files.' },
            { speaker: 'B', accent: 'UK', gender: 'female', text: 'Indeed. The technical updates are great, but user-friendliness took a major hit.' }
        ],
        options: ['It is a complete success', 'It is faster to export files now', 'The interface is less efficient for standard tasks', 'It is much easier to use than before'],
        correctIndex: 2
    },
    {
        id: 'p_lis_c1_1',
        section: 'listening',
        level: 'C1',
        text: 'What is the main concern of the speaker regarding renewable energy investments?',
        dialogue: [
            { speaker: 'A', accent: 'UK', gender: 'female', text: 'While government subsidies are soaring, private equity remains hesitant. Capital lockups are far too extensive to attract mid-sized firms.' },
            { speaker: 'B', accent: 'US', gender: 'male', text: 'Quite. Unless liquidity terms become more dynamic, the market will face a significant supply stagnation.' }
        ],
        options: ['Lack of government funding', 'Hesitancy of private investors due to long-term lockups', 'High operational cost of solar energy', 'Unwillingness of mid-sized firms to follow green rules'],
        correctIndex: 1
    }
];

// 2. Official Exam Prompts
export const writingPrompts: WritingPrompt[] = [
    {
        id: 'w_toefl_1',
        preset: 'toefl',
        prompt: 'Do you agree or disagree with the following statement? "With the rise of remote workspaces, working in physical offices will become completely obsolete in the next decade." Use specific reasons and examples to support your answer.',
        targetWords: '200-250 words',
        instructions: 'Escribe de manera académica estructurada. Argumenta de forma persuasiva usando párrafos de introducción, desarrollo y conclusión.'
    },
    {
        id: 'w_ielts_1',
        preset: 'ielts',
        prompt: 'You are writing a proposal to your department director suggesting a transition to a 4-day workweek. Write an official proposal outlining the benefits to team productivity, cost reductions, and employee well-being, as well as a mitigation plan for client coverage.',
        targetWords: '180-220 words',
        instructions: 'Escribe de manera formal y corporativa. Utiliza conectores avanzados de transición y vocabulario especializado de negocios.'
    },
    {
        id: 'w_cambridge_1',
        preset: 'cambridge',
        prompt: 'Write an essay discussing whether technology has made modern communication more or less meaningful. You should discuss issues such as speed, superficiality, and global connectivity.',
        targetWords: '190-240 words',
        instructions: 'Escribe un ensayo equilibrado. Argumenta de forma lógica evaluando las ventajas y desventajas utilizando oraciones complejas y precisas.'
    }
];
