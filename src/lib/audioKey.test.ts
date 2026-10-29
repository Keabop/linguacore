import { describe, expect, it } from 'vitest';
import { audioKey, dialogueKey } from './audioKey';
import { storyParagraphs, storySentences } from './storySentences';
import type { DialogueLine } from './exam/types';

const lines: DialogueLine[] = [
    { speaker: 'A', accent: 'US', gender: 'female', text: 'Hi.' },
    { speaker: 'B', accent: 'UK', gender: 'male', text: 'Hello.' },
];

describe('audioKey', () => {
    it('is stable and eight hex digits long', () => {
        expect(audioKey(['a', 'b'])).toBe(audioKey(['a', 'b']));
        expect(audioKey(['a', 'b'])).toMatch(/^[0-9a-f]{8}$/);
    });

    it('changes with one letter, the speaker or the speed', () => {
        const base = dialogueKey(lines, 1);
        expect(dialogueKey([lines[0], { ...lines[1], text: 'Hellp.' }], 1)).not.toBe(base);
        expect(dialogueKey([lines[0], { ...lines[1], gender: 'female' }], 1)).not.toBe(base);
        expect(dialogueKey(lines, 0.9)).not.toBe(base);
    });
});

describe('storySentences', () => {
    const content = '<p>I <span data-word="wake">wake</span> up. Then I eat!</p><p>Tom &amp; I walk. Is it far?</p>';

    it('splits each paragraph into sentences and keeps the markup apart from the spoken text', () => {
        expect(storySentences(content)).toEqual(['I wake up.', 'Then I eat!', 'Tom & I walk.', 'Is it far?']);
        expect(storyParagraphs(content)[0][0].html).toBe('I <span data-word="wake">wake</span> up.');
    });
});
