import { useCallback, useEffect, useRef, useState } from 'react';
import type { CEFRLevel } from '../lib/database.types';
import { keepForOffline, type AudioEntry } from '../lib/audioKey';
import { sentenceTimeoutMs } from '../lib/assessmentSpeech';
import { SPEECH_RATE, pickVoice, type Accent } from '../lib/voices';

/** Pause between sentences read with the browser's voices. */
const SENTENCE_GAP_MS = 350;

interface Options {
    sentences: string[];
    level: CEFRLevel;
    accent: Accent;
    /** The story's recording (US accent), with the second at which each sentence starts. */
    audio?: AudioEntry;
}

/**
 * Reads a story aloud and says which sentence is being read. With a recording, the sentence
 * follows the audio's clock; otherwise the browser reads one sentence at a time, and a sentence
 * whose end is never signalled moves on after its time limit, so the highlight never freezes.
 * `rate` multiplies the level's speed (A1 slower, see SPEECH_RATE).
 */
export function useStoryPlayback({ sentences, level, accent, audio }: Options) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [rate, setRate] = useState(1);
    // A recording that failed to play falls back to the browser's voices for this story
    const [audioFailed, setAudioFailed] = useState(false);

    const starts = audio?.sentences;
    const useFile = !!audio && !!starts && starts.length === sentences.length && accent === 'US' && !audioFailed;

    const audioRef = useRef<HTMLAudioElement | null>(null);
    // Each spoken sentence gets a token; callbacks of an older one are ignored
    const tokenRef = useRef(0);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    const stopSpeech = useCallback(() => {
        tokenRef.current++;
        clearTimers();
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    }, []);

    const speakFrom = useCallback((index: number) => {
        stopSpeech();
        if (index >= sentences.length || !window.speechSynthesis) {
            setIsPlaying(false);
            setCurrentIndex(-1);
            return;
        }
        const token = tokenRef.current;
        const effective = SPEECH_RATE[level] * rate;
        const text = sentences[index];
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = pickVoice(window.speechSynthesis.getVoices(), accent);
        utterance.lang = voice?.lang ?? (accent === 'US' ? 'en-US' : accent === 'UK' ? 'en-GB' : 'en-AU');
        if (voice) utterance.voice = voice;
        utterance.rate = effective;

        let settled = false;
        const next = () => {
            if (settled || token !== tokenRef.current) return;
            settled = true;
            clearTimers();
            timersRef.current.push(setTimeout(() => { if (token === tokenRef.current) speakFrom(index + 1); }, SENTENCE_GAP_MS));
        };
        utterance.onend = next;
        utterance.onerror = next;
        timersRef.current.push(setTimeout(() => {
            if (settled || token !== tokenRef.current) return;
            window.speechSynthesis.cancel();
            next();
        }, sentenceTimeoutMs(text) / effective));

        setCurrentIndex(index);
        window.speechSynthesis.speak(utterance);
    }, [sentences, level, rate, accent, stopSpeech]);

    // The recording plays while this is true; a pause or leaving turns it off, so a late
    // failure of play() (AbortError) is not taken for a broken file
    const wantsFileRef = useRef(false);
    const indexRef = useRef(-1);
    // A file that fails, at the start or halfway (network gone), hands over to the browser
    const fallbackRef = useRef<(from: number) => void>(() => {});
    fallbackRef.current = (from: number) => {
        if (!wantsFileRef.current) return;
        wantsFileRef.current = false;
        audioRef.current?.pause();
        setAudioFailed(true);
        speakFrom(Math.max(0, from));
    };

    const getAudio = useCallback(() => {
        if (!audio) return null;
        if (audioRef.current?.dataset.src === audio.src) return audioRef.current;
        audioRef.current?.pause();
        const el = new Audio(audio.src);
        el.dataset.src = audio.src;
        el.preservesPitch = true;
        el.addEventListener('timeupdate', () => {
            const t = el.currentTime + 0.05;
            let i = 0;
            while (i + 1 < (starts?.length ?? 0) && starts![i + 1] <= t) i++;
            indexRef.current = i;
            setCurrentIndex(i);
        });
        el.addEventListener('ended', () => {
            wantsFileRef.current = false;
            setIsPlaying(false);
            setCurrentIndex(-1);
        });
        el.addEventListener('error', () => fallbackRef.current(indexRef.current));
        audioRef.current = el;
        keepForOffline(audio.src);
        return el;
    }, [audio, starts]);

    const playFrom = useCallback((index: number) => {
        const from = Math.max(0, index);
        setIsPlaying(true);
        if (!useFile) {
            speakFrom(from);
            return;
        }
        const el = getAudio()!;
        el.playbackRate = rate;
        el.currentTime = starts![from] ?? 0;
        indexRef.current = from;
        setCurrentIndex(from);
        wantsFileRef.current = true;
        el.play().catch((e: unknown) => {
            // A pause before playback began is not a failure
            if ((e as { name?: string })?.name === 'AbortError') return;
            // No Ogg Opus or no network: the browser reads the story instead
            fallbackRef.current(from);
        });
    }, [useFile, getAudio, rate, starts, speakFrom]);

    const pause = useCallback(() => {
        wantsFileRef.current = false;
        setIsPlaying(false);
        audioRef.current?.pause();
        stopSpeech();
    }, [stopSpeech]);

    const toggle = useCallback(() => {
        if (isPlaying) pause();
        else playFrom(currentIndex === -1 ? 0 : currentIndex);
    }, [isPlaying, pause, playFrom, currentIndex]);

    /** Goes to a sentence; keeps reading from there if it was reading. */
    const seek = useCallback((index: number) => {
        if (index < 0 || index >= sentences.length) return;
        if (isPlaying) playFrom(index);
        else setCurrentIndex(index);
    }, [isPlaying, playFrom, sentences.length]);

    // A new speed applies at once; a new accent may switch between the recording and the
    // browser's voices, from the sentence being read
    const lastAccent = useRef(accent);
    useEffect(() => {
        const accentChanged = lastAccent.current !== accent;
        lastAccent.current = accent;
        if (audioRef.current) audioRef.current.playbackRate = rate;
        if (!isPlaying || currentIndex === -1) return;
        if (useFile) {
            if (accentChanged) {
                stopSpeech();
                playFrom(currentIndex);
            }
        } else {
            audioRef.current?.pause();
            speakFrom(currentIndex);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rate, accent]);

    // Leaving the story stops it
    useEffect(() => () => {
        wantsFileRef.current = false;
        audioRef.current?.pause();
        tokenRef.current++;
        clearTimers();
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    }, []);

    return { isPlaying, currentIndex, rate, setRate, toggle, pause, seek, usingRecording: useFile };
}
