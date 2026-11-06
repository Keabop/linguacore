import { useEffect, useState } from 'react';
import { englishVoices } from '../lib/voices';

/** Some browsers never fire `voiceschanged` when they have no voices: past this, none means none. */
export const VOICES_WAIT_MS = 1500;

/**
 * Whether the browser has English voices. `ready` turns true once the voices load or the wait is over,
 * so a missing voice is only reported when it is really missing; `supported` is false when the
 * browser can't read aloud at all, and then installing a voice won't help.
 */
export function useEnglishVoices(): { ready: boolean; hasEnglish: boolean; supported: boolean } {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => (supported ? englishVoices(window.speechSynthesis.getVoices()) : []));
    // Any voice at all means the list has loaded: a phone with only Spanish voices has no English
    // one to wait for
    const [loaded, setLoaded] = useState(() => supported && window.speechSynthesis.getVoices().length > 0);
    const [waited, setWaited] = useState(!supported);

    useEffect(() => {
        if (!supported) return;
        const load = () => {
            const all = window.speechSynthesis.getVoices();
            setVoices(englishVoices(all));
            if (all.length) setLoaded(true);
        };
        load();
        window.speechSynthesis.addEventListener('voiceschanged', load);
        const timer = setTimeout(() => {
            load();
            setWaited(true);
        }, VOICES_WAIT_MS);
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', load);
            clearTimeout(timer);
        };
    }, [supported]);

    return { ready: waited || loaded, hasEnglish: voices.length > 0, supported };
}
