import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import QuestionView from './QuestionView';
import type { AssessmentQuestion, ExamResponse } from '../../lib/exam/types';

function Harness({ question }: { question: AssessmentQuestion }) {
    const [response, setResponse] = useState<ExamResponse | undefined>();
    return <QuestionView question={question} response={response} onChange={setResponse} />;
}

const mc: AssessmentQuestion = { id: 'mc', section: 'reading', level: 'B1', text: 'Main idea?', options: ['One', 'Two', 'Three'], correctIndex: 1 };

describe('QuestionView', () => {
    it('names the radio group and lets Tab reach it once', () => {
        render(<Harness question={mc} />);
        const group = screen.getByRole('radiogroup', { name: 'Main idea?' });
        const radios = screen.getAllByRole('radio');
        expect(group).toBeInTheDocument();
        expect(radios.map(r => r.tabIndex)).toEqual([0, -1, -1]);
    });

    it('moves and chooses with the arrow keys', () => {
        render(<Harness question={mc} />);
        const [first] = screen.getAllByRole('radio');
        fireEvent.keyDown(first, { key: 'ArrowDown' });
        const radios = screen.getAllByRole('radio');
        expect(radios[1]).toHaveAttribute('aria-checked', 'true');
        expect(radios[1]).toHaveFocus();
        expect(radios.map(r => r.tabIndex)).toEqual([-1, 0, -1]);
        fireEvent.keyDown(radios[0], { key: 'ArrowUp' });
        expect(screen.getAllByRole('radio')[2]).toHaveAttribute('aria-checked', 'true');
    });

    it('names the gap with its sentence', () => {
        render(<Harness question={{ id: 'g', kind: 'gap', section: 'listening', level: 'B1', text: 'The tour leaves from the ___ at nine.', answers: ['square'] }} />);
        expect(screen.getByRole('textbox', { name: /The tour leaves from the .*at nine\./ })).toBeInTheDocument();
    });

    it('builds a sentence from the pieces and undoes a piece', () => {
        render(<Harness question={{ id: 'b', kind: 'build-sentence', section: 'use-of-english', level: 'B1', text: 'When?', pieces: ['opens', 'It'], answer: 'It opens' }} />);
        fireEvent.click(screen.getByRole('button', { name: 'It' }));
        fireEvent.click(screen.getByRole('button', { name: 'opens' }));
        const sentence = screen.getByRole('group', { name: 'Tu oración' });
        expect(sentence).toHaveTextContent('It' + 'opens');
        fireEvent.click(screen.getByRole('button', { name: 'Quitar «It»' }));
        expect(sentence).toHaveTextContent('opens');
    });
});
