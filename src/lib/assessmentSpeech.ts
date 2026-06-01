import { DialogueLine } from '../data/assessments/cefr-questions';

let activeUtterance: SpeechSynthesisUtterance | null = null;
let currentLineIndex = 0;

export function stopDialogueSpeech() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    activeUtterance = null;
    currentLineIndex = 0;
}

export function playDialogueSpeech(
    lines: DialogueLine[],
    onLineStart: (index: number) => void,
    onComplete: () => void
) {
    if (!window.speechSynthesis) {
        onComplete();
        return;
    }

    stopDialogueSpeech();
    const voices = window.speechSynthesis.getVoices();

    const speakLine = (index: number) => {
        if (index >= lines.length) {
            onComplete();
            return;
        }

        currentLineIndex = index;
        const line = lines[index];
        onLineStart(index);

        const utterance = new SpeechSynthesisUtterance(line.text);
        activeUtterance = utterance;

        // Try to pick a natural voice matching accent and gender
        const targetLang = line.accent === 'US' ? 'en-US' : 'en-GB';
        
        let chosenVoice = voices.find(v => {
            const nameLower = v.name.toLowerCase();
            const matchesLang = v.lang.startsWith(targetLang);
            const matchesGender = line.gender === 'female' 
                ? (nameLower.includes('female') || nameLower.includes('zira') || nameLower.includes('samantha') || nameLower.includes('hazel'))
                : (nameLower.includes('male') || nameLower.includes('david') || nameLower.includes('george') || nameLower.includes('mark'));
            return matchesLang && matchesGender;
        });

        // Fallbacks
        if (!chosenVoice) {
            chosenVoice = voices.find(v => v.lang.startsWith(targetLang));
        }
        if (!chosenVoice) {
            chosenVoice = voices.find(v => v.lang.startsWith('en'));
        }

        if (chosenVoice) {
            utterance.voice = chosenVoice;
        }

        // Adjust speed slightly to test comprehension
        utterance.rate = index % 2 === 0 ? 0.95 : 0.90;

        utterance.onend = () => {
            if (activeUtterance === utterance) {
                setTimeout(() => speakLine(index + 1), 600);
            }
        };

        utterance.onerror = () => {
            if (activeUtterance === utterance) {
                speakLine(index + 1);
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    // Chrome/Safari voice loading safeguard
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            playDialogueSpeech(lines, onLineStart, onComplete);
        };
        // Fallback timeout in case voiceschanged does not fire
        setTimeout(() => {
            if (window.speechSynthesis.getVoices().length === 0) {
                speakLine(0);
            }
        }, 300);
    } else {
        speakLine(0);
    }
}