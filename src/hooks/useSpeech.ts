import { useState, useRef, useCallback, useEffect } from 'react';
import { pickVoice } from '../lib/voices';

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
    /** The final text of this session so far (ours, not the browser's). */
    lastFinal?: string;
}

/** The recognition listening right now, whichever component started it. */
let activeRecognition: SpeechRecognitionInstance | null = null;
/** Stops the component that owns it from listening again, so two of them never take the mic back and forth. */
let releaseActive: (() => void) | null = null;

/** Two pieces of what was said, with one space between them. */
function joinSpeech(before: string, after: string): string {
    return [before.trim(), after.trim()].filter(Boolean).join(' ');
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

    // What the learner said in earlier sessions of this recording: the browser ends a session on
    // its own (after a pause, or after each phrase on Android) and it is restarted, keeping the text
    const keptRef = useRef('');
    // The learner still wants to listen: a session the browser ended is started again
    const wantedRef = useRef(false);
    const restartsRef = useRef(0);

    const startSession = useCallback(() => {
        if (!recognitionSupported) return;
        // Only one recognition can listen at a time: one left open by the previous prompt (its stop
        // is still finishing) made the new one start deaf, so it is closed first
        if (activeRecognition && activeRecognition !== recognitionRef.current) releaseActive?.();
        activeRecognition?.abort();
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        // A fresh instance each time: a stopped one doesn't always start again (Chrome on Android)
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        const isCurrent = () => recognitionRef.current === recognition;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            if (!isCurrent()) return;
            restartsRef.current = 0;
            let final = '';
            let interim = '';
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) final += result[0].transcript;
                else interim += result[0].transcript;
            }
            setTranscript(joinSpeech(keptRef.current, final));
            setInterimTranscript(interim);
            recognition.lastFinal = final;
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (!isCurrent()) return;
            // A pause or our own abort is not an error: the session ends and starts again
            if (event.error === 'no-speech' || event.error === 'aborted') return;
            wantedRef.current = false;
            setRecognitionError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            if (!isCurrent()) return;
            keptRef.current = joinSpeech(keptRef.current, recognition.lastFinal ?? '');
            setInterimTranscript('');
            // Ended by the browser while the learner is still speaking: listen again, a few times at most
            if (wantedRef.current && restartsRef.current < 5) {
                restartsRef.current += 1;
                startSession();
                return;
            }
            wantedRef.current = false;
            if (activeRecognition === recognition) activeRecognition = null;
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        activeRecognition = recognition;
        releaseActive = () => {
            wantedRef.current = false;
            recognitionRef.current = null;
            setInterimTranscript('');
            setIsListening(false);
        };
        try {
            recognition.start();
            setIsListening(true);
        } catch {
            wantedRef.current = false;
            setIsListening(false);
        }
    }, [recognitionSupported]);

    // --- Recognition controls ---
    const startListening = useCallback(() => {
        setRecognitionError(null);
        setTranscript('');
        setInterimTranscript('');
        keptRef.current = '';
        restartsRef.current = 0;
        wantedRef.current = true;
        startSession();
    }, [startSession]);

    const stopListening = useCallback(() => {
        wantedRef.current = false;
        try {
            recognitionRef.current?.stop();
        } catch {
            // Already stopped — ignore
        }
        setIsListening(false);
        setInterimTranscript('');
    }, []);

    const resetTranscript = useCallback(() => {
        keptRef.current = '';
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

        const englishVoice = pickVoice(window.speechSynthesis.getVoices(), 'US');
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
            wantedRef.current = false;
            const recognition = recognitionRef.current;
            recognitionRef.current = null;
            recognition?.abort();
            if (activeRecognition === recognition) activeRecognition = null;
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
