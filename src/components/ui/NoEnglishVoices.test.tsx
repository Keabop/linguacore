import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NoEnglishVoices from './NoEnglishVoices';
import { VOICES_WAIT_MS } from '../../hooks/useEnglishVoices';

const voice = (name: string, lang: string) => ({ name, lang, localService: true, default: false, voiceURI: name }) as SpeechSynthesisVoice;

function mockVoices(voices: SpeechSynthesisVoice[]) {
    Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: { getVoices: () => voices, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    });
}

describe('NoEnglishVoices', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('explains how to install a voice once the browser shows it has no English one', () => {
        mockVoices([voice('Helena', 'es-ES')]);
        render(<NoEnglishVoices />);
        expect(screen.queryByRole('status')).toBeNull();
        act(() => { vi.advanceTimersByTime(VOICES_WAIT_MS); });
        expect(screen.getByRole('status')).toHaveTextContent('Windows');
    });

    it('stays hidden when there is an English voice', () => {
        mockVoices([voice('Microsoft Zira', 'en-US')]);
        render(<NoEnglishVoices />);
        act(() => { vi.advanceTimersByTime(VOICES_WAIT_MS); });
        expect(screen.queryByRole('status')).toBeNull();
    });
});
