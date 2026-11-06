import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
let skippedBefore: boolean | undefined;
beforeAll(() => { skippedBefore = MotionGlobalConfig.skipAnimations; MotionGlobalConfig.skipAnimations = true; });
afterAll(() => { MotionGlobalConfig.skipAnimations = skippedBefore; });

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
        // The sentence now reads with the answer in its blank
        expect(screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === "I don't like coffee.")).toBeInTheDocument();
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
    // A tapped word moves rows; the copy leaving its old row is gone once its exit animation ends
    const place = async (...words: string[]) => {
        for (const w of words) {
            fireEvent.click(screen.getAllByRole('button', { name: w }).at(-1)!);
            await waitFor(() => expect(screen.getAllByRole('button', { name: w })).toHaveLength(1));
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
    // The runner moves on after a short delay and an exit animation: room for a busy machine
    const SLOW = { timeout: 3000 };
    const answer = (option: string) => {
        fireEvent.click(screen.getByRole('button', { name: option }));
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    };

    it('goes through every exercise and gives the score of the right answers', async () => {
        const onComplete = vi.fn();
        render(<ExerciseRunner exercises={[choice, { ...choice, id: 'm2' }]} onComplete={onComplete} />);
        expect(screen.getByText('1 de 2')).toBeInTheDocument();
        answer('is');
        await screen.findByText('2 de 2', {}, SLOW);
        answer('am');
        await screen.findByText('Puntuación: 50%', {}, SLOW);
        fireEvent.click(screen.getByRole('button', { name: /Finalizar/ }));
        expect(onComplete).toHaveBeenCalledWith(50, [{ ...choice, id: 'm2' }]);
    });

    it('says to try again when no answer was right', async () => {
        const onComplete = vi.fn();
        render(<ExerciseRunner exercises={[choice]} onComplete={onComplete} />);
        answer('am');
        await screen.findByText('Puntuación: 0%', {}, SLOW);
        expect(screen.getByText(/al menos una respuesta correcta/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Volver a intentarlo' }));
        expect(onComplete).toHaveBeenCalledWith(0, [choice]);
    });

    it('under the pass mark leads to the review', async () => {
        render(<ExerciseRunner exercises={[choice]} passScore={75} onComplete={vi.fn()} />);
        answer('am');
        expect(await screen.findByRole('button', { name: 'Ver qué repasar' }, SLOW)).toBeInTheDocument();
    });

    it('counts a double tap on "next" once, without skipping an exercise or going past the last', async () => {
        render(<ExerciseRunner exercises={[choice, { ...choice, id: 'm2' }, { ...choice, id: 'm3' }]} onComplete={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'is' }));
        const next = screen.getByRole('button', { name: /Siguiente/ });
        fireEvent.click(next);
        fireEvent.click(next);
        await screen.findByText('2 de 3', {}, SLOW);

        fireEvent.click(screen.getByRole('button', { name: 'is' }));
        const again = screen.getByRole('button', { name: /Siguiente/ });
        fireEvent.click(again);
        fireEvent.click(again);
        await screen.findByText('3 de 3', {}, SLOW);
        expect(screen.queryByText('Puntuación', { exact: false })).toBeNull();
    });
});

describe('comprehension exercises', () => {
    const meaning: GrammarExercise = { id: 'c1', unitId: 'a1-u1', type: 'meaning-choice', question: 'I am a student.', correctAnswer: 'Yo soy estudiante.', options: ['Yo soy estudiante.', 'Ella es maestra.', 'Estamos cansados.'], explanation: '«I am a student» = «Yo soy estudiante».' };
    const listen: GrammarExercise = { ...meaning, id: 'c2', type: 'listen-choice', correctAnswer: 'I am a student.', options: ['I am a student.', 'She is a teacher.', 'We are tired.'] };

    it('asks what an English sentence means, with the options in Spanish', () => {
        const onAnswer = vi.fn();
        render(<MultipleChoiceExercise exercise={meaning} onAnswer={onAnswer} />);
        expect(screen.getByText('¿Qué significa?')).toBeInTheDocument();
        expect(screen.getByText('I am a student.')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Yo soy estudiante.' }));
        fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
        expect(onAnswer).toHaveBeenCalledWith(true);
    });

    it('hides the sentence of a listening exercise until it is answered (or there is no voice to hear it)', () => {
        render(<MultipleChoiceExercise exercise={listen} onAnswer={vi.fn()} />);
        // jsdom has no speech synthesis: the sentence shows so it can still be answered
        expect(screen.getByText('Elige la oración')).toBeInTheDocument();
        expect(screen.getAllByText('I am a student.').length).toBeGreaterThan(0);
    });
});
