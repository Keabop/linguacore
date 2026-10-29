import { useEffect, useState } from 'react';
import { englishVoices } from '../lib/voices';

/** Some browsers never fire `voiceschanged` when they have no voices: past this, none means none. */
export const VOICES_WAIT_MS = 1500;

/**
 * Whether the browser has English voices. `ready` turns true once they load or the wait is over,
 * so a missing voice is only reported when it is really missing; `supported` is false when the
 * browser can't read aloud at all, and then installing a voice won't help.
 */
export function useEnglishVoices(): { ready: boolean; hasEnglish: boolean; supported: boolean } {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => (supported ? englishVoices(window.speechSynthesis.getVoices()) : []));
    const [waited, setWaited] = useState(!supported);

    useEffect(() => {
        if (!supported) return;
        const load = () => setVoices(englishVoices(window.speechSynthesis.getVoices()));
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

    return { ready: waited || voices.length > 0, hasEnglish: voices.length > 0, supported };
}
