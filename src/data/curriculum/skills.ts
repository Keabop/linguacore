import type { GrammarSkill } from '../../lib/db';

// ===== A1 SKILLS =====
export const a1Skills: GrammarSkill[] = [
    // Unit 1: Introducing Yourself — Verb 'to be' + pronouns
    {
        id: 'a1-u1-s1',
        unitId: 'a1-u1',
        name: 'Verb "to be" — Affirmative',
        description: 'I am, you are, he/she/it is, we are, they are',
        difficulty: 1,
        grammarTip: "Remember: I AM, you/we/they ARE, he/she/it IS. Contractions: I'm, you're, he's.",
        exercises: [
            { type: 'fill-blank', prompt: 'She ___ a teacher.', answer: 'is', options: ['am', 'is', 'are'], explanation: 'She → is (third person singular)' },
            { type: 'fill-blank', prompt: 'We ___ from Colombia.', answer: 'are', options: ['am', 'is', 'are'], explanation: 'We → are (first person plural)' },
            { type: 'multiple-choice', prompt: 'Which is correct?', answer: 'I am a student.', options: ['I is a student.', 'I am a student.', 'I are a student.'], explanation: 'I always uses "am"' },
            { type: 'fill-blank', prompt: 'They ___ happy today.', answer: 'are', options: ['am', 'is', 'are'], explanation: 'They → are' },
            { type: 'fill-blank', prompt: 'He ___ my friend.', answer: 'is', options: ['am', 'is', 'are'], explanation: 'He → is' },
            { type: 'word-order', prompt: 'Arrange: a / am / I / student', answer: 'I am a student', explanation: 'Subject + verb to be + complement' },
            { type: 'fill-blank', prompt: 'It ___ a beautiful day.', answer: 'is', options: ['am', 'is', 'are'], explanation: 'It → is' },
            { type: 'multiple-choice', prompt: 'Select the correct contraction for "they are"', answer: "they're", options: ["their", "they're", "there"], explanation: "they are → they're" },
        ],
    },
    {
        id: 'a1-u1-s2',
        unitId: 'a1-u1',
        name: 'Verb "to be" — Negative',
        description: "I'm not, you aren't, he/she/it isn't",
        difficulty: 2,
        grammarTip: "Negative: am not (I'm not), is not (isn't), are not (aren't). Never say 'I amn't'.",
        exercises: [
            { type: 'fill-blank', prompt: 'She ___ (not) a doctor.', answer: "isn't", options: ["isn't", "aren't", "am not"], explanation: "She → isn't (is not)" },
            { type: 'fill-blank', prompt: 'We ___ (not) tired.', answer: "aren't", options: ["isn't", "aren't", "am not"], explanation: "We → aren't (are not)" },
            { type: 'fill-blank', prompt: "I ___ (not) from Spain.", answer: "'m not", options: ["'m not", "amn't", "isn't"], explanation: "I → 'm not (am not). 'amn't' does not exist." },
            { type: 'multiple-choice', prompt: 'Which sentence is correct?', answer: "They aren't at home.", options: ["They isn't at home.", "They aren't at home.", "They amn't at home."], explanation: "They → aren't" },
            { type: 'fill-blank', prompt: 'He ___ (not) a student.', answer: "isn't", options: ["isn't", "aren't", "am not"], explanation: "He → isn't" },
            { type: 'fill-blank', prompt: 'It ___ (not) cold today.', answer: "isn't", options: ["isn't", "aren't", "'m not"], explanation: "It → isn't" },
            { type: 'word-order', prompt: 'Arrange: not / they / students / are', answer: 'They are not students', explanation: 'Subject + verb to be + not + complement' },
            { type: 'multiple-choice', prompt: "What is the full form of \"isn't\"?", answer: 'is not', options: ['is not', 'are not', 'am not'], explanation: "isn't = is not" },
        ],
    },
    {
        id: 'a1-u1-s3',
        unitId: 'a1-u1',
        name: 'Verb "to be" — Questions',
        description: 'Am I? Are you? Is he/she/it?',
        difficulty: 3,
        grammarTip: 'For questions, invert the order: "She is happy" → "Is she happy?" Yes/No answers: "Yes, she is." / "No, she isn\'t."',
        exercises: [
            { type: 'word-order', prompt: 'Arrange: you / are / a teacher / ?', answer: 'Are you a teacher?', explanation: 'Verb to be + subject + complement + ?' },
            { type: 'fill-blank', prompt: '___ he from Mexico?', answer: 'Is', options: ['Am', 'Is', 'Are'], explanation: 'He → Is' },
            { type: 'fill-blank', prompt: '___ they happy?', answer: 'Are', options: ['Am', 'Is', 'Are'], explanation: 'They → Are' },
            { type: 'multiple-choice', prompt: 'How do you answer: "Is she a student?"', answer: 'Yes, she is.', options: ['Yes, she is.', 'Yes, she are.', 'Yes, she am.'], explanation: 'Short answer matches the subject: she → is' },
            { type: 'word-order', prompt: 'Arrange: it / is / a cat / ?', answer: 'Is it a cat?', explanation: 'Is + it + complement + ?' },
            { type: 'fill-blank', prompt: '___ I late?', answer: 'Am', options: ['Am', 'Is', 'Are'], explanation: 'I → Am' },
            { type: 'fill-blank', prompt: '___ we ready?', answer: 'Are', options: ['Am', 'Is', 'Are'], explanation: 'We → Are' },
            { type: 'multiple-choice', prompt: 'Which is a correct question?', answer: 'Are they friends?', options: ['They are friends?', 'Are they friends?', 'Is they friends?'], explanation: 'Invert: Are + they + complement?' },
        ],
    },
    // Remaining A1 unit skills will be added in Task 10
];

// ===== A2 SKILLS =====
export const a2Skills: GrammarSkill[] = [];

// ===== B1 SKILLS =====
export const b1Skills: GrammarSkill[] = [];

// ===== B2 SKILLS =====
export const b2Skills: GrammarSkill[] = [];
