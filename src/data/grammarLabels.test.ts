import { describe, expect, it } from 'vitest';
import { a1Skills } from './curriculum/skills/a1';
import { a2Skills } from './curriculum/skills/a2';
import { skillPrompt } from './grammarLabels';

describe('skillPrompt', () => {
    it('gives every A1 and A2 instruction in Spanish, and leaves the English sentences as they are', () => {
        for (const skill of [...a1Skills, ...a2Skills]) {
            for (const { prompt } of skill.exercises) {
                const instruction = !prompt.includes('___') && /^(Which|Where|Arrange|How|What|Select|A teacher|You hold|You point|The -ed)\b/.test(prompt);
                if (instruction) expect(skillPrompt(prompt, skill.unitId), prompt).not.toBe(prompt);
                else expect(skillPrompt(prompt, skill.unitId)).toBe(prompt);
            }
        }
    });

    it('keeps the quoted English inside the Spanish', () => {
        expect(skillPrompt('How is -ed pronounced in "walked"?', 'a2-u1')).toBe('¿Cómo suena la -ed en «walked»?');
        expect(skillPrompt('Arrange: a / am / I / student', 'a1-u1')).toBe('Ordena: a / am / I / student');
    });

    it('leaves B1 and B2 in English', () => {
        expect(skillPrompt('Which is correct?', 'b1-u3')).toBe('Which is correct?');
    });
});
