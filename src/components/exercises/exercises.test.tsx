import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { MotionGlobalConfig } from 'framer-motion';
import type { GrammarExercise } from '../../lib/db';
import FillBlankExercise from './FillBlankExercise';
import MultipleChoiceExercise from './MultipleChoiceExercise';
import WordOrderExercise from './WordOrderExercise';
import ExerciseRunner from './ExerciseRunner';

const fill: GrammarExercise = { id: 'f1', unitId: 'a1-u4', type: 'fill-blank', question: "I ___ like coffee.", correctAnswer: "don't", explanation: 'Negativo con I.' };
const choice: GrammarExercise = { id: 'm1', unitId: 'a1-u1', type: 'multiple-choice', question: 'She ___ a teacher.', correctAnswer: 'is', options: ['am', 'is', 'are'], explanation: 'Con she, is.' };
const order: GrammarExercise = { id: 'w1', unitId: 'a1-u1', type: 'word-order', question: 'Ordena:', correctAnswer: 'They are my friends.', scrambledWords: ['friends.', 'are', 'They', 'my'], explanation: 'Sujeto + verbo.' };

// jsdom never finishes exit animations: without this, the leaving element stays in the page
beforeAll(() => { MotionGlobalConfig.skipAnimations = true; });
afterAll(() => { MotionGlobalConfig.skipAnimations = false; });

const typeAndCheck = (text: string) => {
    fireEvent.change(screen.getByRole('textbox'), { target: { value: text } });
    fireEvent.click(screen.getByRole('button', { name: /Comprobar/ }));
};

describe('FillBlankExercise', () => {
    it('accepts the answer written out in full and reports it right', () => {
        const onAnswer = vi.fn();
        render(<FillBlankExercise exercise={fill} onAnswer={onAnswer} />);
        typeAndCheck('do not');
        expect(screen.getByText(/¡Correcto!/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
        expect(onAnswer).toHaveBeenCalledWith(true);
    });

    it('accepts the curly apostrophe of a phone keyboard', () => {
        render(<FillBlankExercise exercise={fill} onAnswer={vi.fn()} />);
        typeAndCheck('don’t');
        expect(screen.getByText(/¡Correcto!/)).toBeInTheDocument();
    });

    it('marks a wrong answer and shows the right one in the blank', () => {
        const onAnswer = vi.fn();
        render(<FillBlankExercise exercise={fill} onAnswer={onAnswer} />);
        typeAndCheck('doesn’t');
        expect(screen.getByText(/Incorrecto/)).toBeInTheDocument();
        expect(screen.getAllByText("don't").length).toBeGreaterThan(0);
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
        expect(onAnswer).toHaveBeenCalledWith(false);
    });

    it('does nothing with an empty answer', () => {
        render(<FillBlankExercise exercise={fill} onAnswer={vi.fn()} />);
        typeAndCheck('   ');
        expect(screen.queryByText(/Correcto|Incorrecto/)).toBeNull();
    });
});

describe('MultipleChoiceExercise', () => {
    it('reports the chosen option and locks the others', () => {
        const onAnswer = vi.fn();
        render(<MultipleChoiceExercise exercise={choice} onAnswer={onAnswer} />);
        fireEvent.click(screen.getByRole('button', { name: 'am' }));
        expect(screen.getByText(/Incorrecto/)).toBeInTheDocument();
        // A second choice after answering changes nothing
        fireEvent.click(screen.getByRole('button', { name: 'is' }));
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
        expect(onAnswer).toHaveBeenCalledExactlyOnceWith(false);
    });

    it('accepts the right option', () => {
        render(<MultipleChoiceExercise exercise={choice} onAnswer={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'is' }));
        expect(screen.getByText(/¡Correcto!/)).toBeInTheDocument();
    });
});

describe('WordOrderExercise', () => {
    // A tapped word leaves its row with an exit animation, which ends on the next frame
    const frame = () => act(() => new Promise(r => setTimeout(r, 30)));
    const place = async (...words: string[]) => {
        for (const w of words) {
            fireEvent.click(screen.getByRole('button', { name: w }));
            await frame();
        }
    };

    it('accepts the words placed in order', async () => {
        render(<WordOrderExercise exercise={order} onAnswer={vi.fn()} />);
        await place('They', 'are', 'my', 'friends.');
        fireEvent.click(screen.getByRole('button', { name: /Comprobar/ }));
        expect(screen.getByText(/¡Correcto!/)).toBeInTheDocument();
    });

    it('rejects another order, and a placed word can go back', async () => {
        render(<WordOrderExercise exercise={order} onAnswer={vi.fn()} />);
        await place('are', 'They');
        // Tapping a placed word returns it to the pool
        await place('are');
        // Now "They", then a wrong order: "They my are friends."
        await place('my', 'are', 'friends.');
        fireEvent.click(screen.getByRole('button', { name: /Comprobar/ }));
        expect(screen.getByText(/Incorrecto/)).toBeInTheDocument();
    });
});

describe('ExerciseRunner', () => {
    const wait = (ms: number) => act(() => new Promise(r => setTimeout(r, ms)));
    const answer = async (option: string) => {
        fireEvent.click(screen.getByRole('button', { name: option }));
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
        await wait(400);
    };

    it('goes through every exercise and gives the score of the right answers', async () => {
        const onComplete = vi.fn();
        render(<ExerciseRunner exercises={[choice, { ...choice, id: 'm2' }]} onComplete={onComplete} />);
        expect(screen.getByText('1 de 2')).toBeInTheDocument();
        await answer('is');
        expect(screen.getByText('2 de 2')).toBeInTheDocument();
        await answer('am');
        expect(screen.getByText('Puntuación: 50%')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Finalizar/ }));
        expect(onComplete).toHaveBeenCalledWith(50);
    });

    it('counts a double tap on "next" once, without skipping an exercise or going past the last', async () => {
        render(<ExerciseRunner exercises={[choice, { ...choice, id: 'm2' }, { ...choice, id: 'm3' }]} onComplete={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'is' }));
        const next = screen.getByRole('button', { name: /Siguiente/ });
        fireEvent.click(next);
        fireEvent.click(next);
        await wait(400);
        expect(screen.getByText('2 de 3')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'is' }));
        const again = screen.getByRole('button', { name: /Siguiente/ });
        fireEvent.click(again);
        fireEvent.click(again);
        await wait(400);
        expect(screen.getByText('3 de 3')).toBeInTheDocument();
    });
});
