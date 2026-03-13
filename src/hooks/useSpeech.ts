import { useState, useRef, useCallback, useEffect } from 'react';

// Browser compatibility types
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition: new () => SpeechRecognitionInstance;
    }
}

export interface UseSpeechReturn {
    // Speech Recognition (STT)
    isListening: boolean;
    transcript: string;
    interimTranscript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    recognitionSupported: boolean;
    recognitionError: string | null;

    // Speech Synthesis (TTS)
    speak: (text: string, rate?: number) => void;
    isSpeaking: boolean;
    cancelSpeech: () => void;
    synthesisSupported: boolean;
}

export function useSpeech(): UseSpeechReturn {
    // --- Recognition state ---
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [recognitionError, setRecognitionError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

    // --- Synthesis state ---
    const [isSpeaking, setIsSpeaking] = useState(false);

    // --- Feature detection ---
    const recognitionSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    const synthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // --- Initialize recognition ---
    const getRecognition = useCallback(() => {
        if (recognitionRef.current) return recognitionRef.current;
        if (!recognitionSupported) return null;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let final = '';
            let interim = '';

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }

            setTranscript(final);
            setInterimTranscript(interim);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            // 'no-speech' and 'aborted' are not real errors
            if (event.error === 'no-speech' || event.error === 'aborted') return;
            setRecognitionError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
        };

        recognitionRef.current = recognition;
        return recognition;
    }, [recognitionSupported]);

    // --- Recognition controls ---
    const startListening = useCallback(() => {
        const recognition = getRecognition();
        if (!recognition) return;

        setRecognitionError(null);
        setTranscript('');
        setInterimTranscript('');

        try {
            recognition.start();
            setIsListening(true);
        } catch {
            // Already started — ignore
        }
    }, [getRecognition]);

    const stopListening = useCallback(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        try {
            recognition.stop();
        } catch {
            // Already stopped — ignore
        }
        setIsListening(false);
        setInterimTranscript('');
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    // --- Synthesis controls ---
    const speak = useCallback((text: string, rate: number = 1) => {
        if (!synthesisSupported) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = rate;

        // Try to pick an English voice
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => v.lang.startsWith('en-') && v.localService) ||
            voices.find(v => v.lang.startsWith('en-'));
        if (englishVoice) utterance.voice = englishVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [synthesisSupported]);

    const cancelSpeech = useCallback(() => {
        if (!synthesisSupported) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [synthesisSupported]);

    // --- Cleanup ---
    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
            if (synthesisSupported) window.speechSynthesis.cancel();
        };
    }, [synthesisSupported]);

    return {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        recognitionSupported,
        recognitionError,
        speak,
        isSpeaking,
        cancelSpeech,
        synthesisSupported,
    };
}
