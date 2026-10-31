import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GrammarReview from './GrammarReview';
import type { GrammarSkill, SkillCard } from '../lib/db';

const card = { id: 'c1', skillId: 's1', unitId: 'a1-u4' } as SkillCard;

const choiceSkill: GrammarSkill = {
    id: 's1', unitId: 'a1-u4', name: 'Do / does', description: '', difficulty: 1, grammarTip: '',
    exercises: ['q1', 'q2', 'q3'].map(id => ({ type: 'multiple-choice' as const, prompt: `${id}: ___ she work here?`, answer: 'Does', options: ['Does', 'Do', 'Is'], explanation: 'he/she/it: does.' })),
};
const writtenSkill: GrammarSkill = {
    ...choiceSkill,
    exercises: [{ type: 'word-order', prompt: 'Order: Sundays / on / work / We / don\'t', answer: "We don't work on Sundays", explanation: 'Negativo.' }],
};

const submit = (text: string) => {
    const box = screen.getByRole('textbox');
    fireEvent.change(box, { target: { value: text } });
    fireEvent.keyDown(box, { key: 'Enter' });
};

describe('GrammarReview', () => {
    it('counts a double tap on "next" once, without skipping a question', () => {
        render(<GrammarReview skillCard={card} skill={choiceSkill} depth="mini_quiz" onComplete={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Does' }));
        const next = screen.getByRole('button', { name: 'Siguiente' });
        fireEvent.click(next);
        fireEvent.click(next);
        expect(screen.getByText('2/3')).toBeInTheDocument();
    });

    it('never goes past the last question on a double tap', () => {
        render(<GrammarReview skillCard={card} skill={{ ...choiceSkill, exercises: choiceSkill.exercises.slice(0, 2) }} depth="mini_quiz" onComplete={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Does' }));
        const next = screen.getByRole('button', { name: 'Siguiente' });
        fireEvent.click(next);
        fireEvent.click(next);
        expect(screen.getByText('2/2')).toBeInTheDocument();
    });

    it('accepts a typed answer with a curly apostrophe, a written-out contraction or a final period', () => {
        for (const answer of ['We don’t work on Sundays', 'We do not work on Sundays', 'we don\'t work on sundays.']) {
            const { unmount } = render(<GrammarReview skillCard={card} skill={writtenSkill} depth="mini_quiz" onComplete={vi.fn()} />);
            submit(answer);
            expect(screen.getByText('¡Correcto!'), answer).toBeInTheDocument();
            unmount();
        }
    });

    it('still rejects a wrong typed answer', () => {
        render(<GrammarReview skillCard={card} skill={writtenSkill} depth="mini_quiz" onComplete={vi.fn()} />);
        submit('We doesn\'t work on Sundays');
        expect(screen.getByText('Incorrecto')).toBeInTheDocument();
    });
});
