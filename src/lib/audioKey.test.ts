import { describe, expect, it } from 'vitest';
import { audioKey, dialogueKey } from './audioKey';
import { storyParagraphs, storySentences, wrapStorySentences } from './storySentences';
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

    it('does not end a sentence after a title such as "Dr."', () => {
        expect(storySentences('<p>Dr. Patel smiled. Ms. Kim and Mr. Ruiz came. They sold items. Then they left.</p>'))
            .toEqual(['Dr. Patel smiled.', 'Ms. Kim and Mr. Ruiz came.', 'They sold items.', 'Then they left.']);
    });
});

describe('wrapStorySentences', () => {
    const wrap = (html: string, i: number) => `<span data-i="${i}">${html}</span>`;

    it('keeps what is outside the paragraphs and numbers sentences as storySentences does', () => {
        const content = '<h2>Title</h2><p class="intro">One. Two!</p><p>Three?</p>';
        expect(wrapStorySentences(content, wrap)).toBe('<h2>Title</h2><p class="intro"><span data-i="0">One.</span> <span data-i="1">Two!</span></p><p><span data-i="2">Three?</span></p>');
        expect(storySentences(content)).toEqual(['One.', 'Two!', 'Three?']);
    });

    it('reads a text without paragraphs as one paragraph', () => {
        expect(storySentences('Hi there. Bye.')).toEqual(['Hi there.', 'Bye.']);
        expect(wrapStorySentences('Hi there. Bye.', wrap)).toBe('<p><span data-i="0">Hi there.</span> <span data-i="1">Bye.</span></p>');
    });
});
