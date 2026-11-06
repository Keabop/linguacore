import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStoryPlayback } from './useStoryPlayback';
import { sentenceTimeoutMs } from '../lib/assessmentSpeech';
import { SPEECH_RATE } from '../lib/voices';

const sentences = ['I wake up early.', 'Then I eat breakfast.', 'After that I walk to school.'];
const voice = { name: 'Microsoft Zira', lang: 'en-US', localService: true, default: false, voiceURI: 'z' } as SpeechSynthesisVoice;

/** The <audio> the hook creates, driven by the test. */
class FakeAudio {
    static last: FakeAudio;
    currentTime = 0;
    playbackRate = 1;
    preservesPitch = false;
    dataset: Record<string, string> = {};
    listeners: Record<string, () => void> = {};
    constructor(public src: string) { FakeAudio.last = this; }
    addEventListener(type: string, fn: () => void) { this.listeners[type] = fn; }
    static playResult: () => Promise<void> = () => Promise.resolve();
    play() { return FakeAudio.playResult(); }
    // A real pause fires one more timeupdate
    pause() { this.listeners.timeupdate?.(); }
    at(seconds: number) {
        this.currentTime = seconds;
        this.listeners.timeupdate?.();
    }
}

type FakeUtterance = { text: string; onend?: () => void; onerror?: () => void };
let spoken: FakeUtterance[];

beforeEach(() => {
    vi.useFakeTimers();
    spoken = [];
    FakeAudio.playResult = () => Promise.resolve();
    vi.stubGlobal('Audio', FakeAudio);
    vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; constructor(t: string) { this.text = t; } });
    vi.stubGlobal('speechSynthesis', { getVoices: () => [voice], speak: (u: FakeUtterance) => spoken.push(u), cancel: vi.fn() });
});
afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

describe('useStoryPlayback with a recording', () => {
    const audio = { src: '/audio/abcdef12.ogg', sentences: [0, 2, 3.9] };

    it("follows the audio's clock to highlight each sentence", () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US', audio }));
        act(() => result.current.toggle());
        expect(result.current.usingRecording).toBe(true);
        act(() => FakeAudio.last.at(0.3));
        expect(result.current.currentIndex).toBe(0);
        act(() => FakeAudio.last.at(2.1));
        expect(result.current.currentIndex).toBe(1);
        act(() => FakeAudio.last.at(4.0));
        expect(result.current.currentIndex).toBe(2);
        expect(spoken).toEqual([]);
    });

    it('jumps to the start of a tapped sentence', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US', audio }));
        act(() => result.current.toggle());
        act(() => result.current.seek(2));
        expect(FakeAudio.last.currentTime).toBe(3.9);
    });

    it('stays quiet when paused before the recording starts (AbortError is not a failure)', async () => {
        FakeAudio.playResult = () => Promise.reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US', audio }));
        act(() => result.current.toggle());
        act(() => result.current.pause());
        await act(async () => { await Promise.resolve(); });
        expect(spoken).toEqual([]);
        expect(result.current.isPlaying).toBe(false);
        expect(result.current.usingRecording).toBe(true);
    });

    it('hands over to the browser from the current sentence when the file fails halfway', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US', audio }));
        act(() => result.current.toggle());
        act(() => FakeAudio.last.at(2.1));
        act(() => FakeAudio.last.listeners.error?.());
        expect(result.current.usingRecording).toBe(false);
        expect(spoken.map(u => u.text)).toEqual([sentences[1]]);
    });

    it('uses the browser for an accent the recording does not have', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'AU', audio }));
        act(() => result.current.toggle());
        expect(result.current.usingRecording).toBe(false);
        expect(spoken.map(u => u.text)).toEqual([sentences[0]]);
    });
});

describe('useStoryPlayback with the browser voices', () => {
    it('moves on when a sentence ends, at the speed of the level', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US' }));
        act(() => result.current.toggle());
        expect((spoken[0] as unknown as { rate: number }).rate).toBe(SPEECH_RATE.A1);
        act(() => { spoken[0].onend?.(); vi.advanceTimersByTime(400); });
        expect(result.current.currentIndex).toBe(1);
    });

    it('moves on after the time limit when the browser never signals the end', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'B1', accent: 'US' }));
        act(() => result.current.toggle());
        act(() => { vi.advanceTimersByTime(sentenceTimeoutMs(sentences[0]) + 400); });
        expect(result.current.currentIndex).toBe(1);
    });

    it('never skips two sentences when the end arrives after the time limit', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'B1', accent: 'US' }));
        act(() => result.current.toggle());
        const first = spoken[0];
        act(() => { vi.advanceTimersByTime(sentenceTimeoutMs(sentences[0]) + 400); });
        act(() => { first.onend?.(); vi.advanceTimersByTime(400); });
        expect(result.current.currentIndex).toBe(1);
    });
});

describe('useStoryPlayback, a tapped sentence', () => {
    it('with the browser voices, says that sentence alone and stops', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US' }));
        act(() => result.current.playSentence(1));
        expect(spoken.map(u => u.text)).toEqual([sentences[1]]);
        act(() => { spoken[0].onend?.(); vi.advanceTimersByTime(400); });
        expect(spoken).toHaveLength(1);
        expect(result.current.isPlaying).toBe(false);
        expect(result.current.currentIndex).toBe(1);
    });

    const audio = { src: '/audio/abcdef12.ogg', sentences: [0, 2, 3.9] };

    it('with a recording, plays from its start and stops where the next one begins', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US', audio }));
        act(() => result.current.playSentence(1));
        expect(FakeAudio.last.currentTime).toBe(2);
        act(() => FakeAudio.last.at(3.0));
        expect(result.current.isPlaying).toBe(true);
        act(() => FakeAudio.last.at(4.0));
        expect(result.current.isPlaying).toBe(false);
        // The timeupdate of the pause, already in the next sentence, moves nothing
        expect(result.current.currentIndex).toBe(1);
    });

    it('with a recording, stops on time between two timeupdates', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US', audio }));
        act(() => result.current.playSentence(1));
        act(() => FakeAudio.last.at(3.5));
        act(() => { vi.advanceTimersByTime(390); });
        expect(result.current.isPlaying).toBe(true);
        act(() => { vi.advanceTimersByTime(20); });
        expect(result.current.isPlaying).toBe(false);
        expect(result.current.currentIndex).toBe(1);
    });

    it('with a recording, keeps the last sentence highlighted when it ends', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US', audio }));
        act(() => result.current.playSentence(2));
        act(() => FakeAudio.last.listeners.ended?.());
        expect(result.current.isPlaying).toBe(false);
        expect(result.current.currentIndex).toBe(2);
    });

    it('another sentence tapped while one plays alone is also heard alone', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US', audio }));
        act(() => result.current.playSentence(0));
        act(() => result.current.playSentence(2));
        act(() => FakeAudio.last.at(4.0));
        expect(result.current.isPlaying).toBe(true);
        expect(result.current.currentIndex).toBe(2);
    });

    it('with the browser voices, the next sentence asked for while one plays alone plays alone', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US' }));
        act(() => result.current.playSentence(0));
        act(() => result.current.seek(1));
        expect(spoken.at(-1)?.text).toBe(sentences[1]);
        act(() => { spoken.at(-1)?.onend?.(); vi.advanceTimersByTime(400); });
        expect(spoken.at(-1)?.text).toBe(sentences[1]);
        expect(result.current.isPlaying).toBe(false);
        expect(result.current.currentIndex).toBe(1);
    });

    it('while the story is being read, goes on reading from the tapped sentence', () => {
        const { result } = renderHook(() => useStoryPlayback({ sentences, level: 'A1', accent: 'US' }));
        act(() => result.current.toggle());
        act(() => result.current.playSentence(1));
        act(() => { spoken[1].onend?.(); vi.advanceTimersByTime(400); });
        expect(result.current.currentIndex).toBe(2);
        expect(result.current.isPlaying).toBe(true);
    });
});
