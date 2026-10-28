import { useTranslation } from 'react-i18next';
import type { ExamWritingTask } from '../../lib/exam/types';
import { OPTION, OPTION_IDLE, OPTION_ON, useRadioKeys } from './QuestionView';

type Choice = NonNullable<ExamWritingTask['choices']>[number];

/** Cambridge Writing Part 2: the tasks to choose from, as a radio group like the exam's options. */
export default function TaskChoice({ choices, value, onChange, hintId }: {
    choices: Choice[];
    value: string | undefined;
    onChange: (id: string) => void;
    /** Element that explains why the task can't be sent yet. */
    hintId: string;
}) {
    const { t } = useTranslation();
    const ids = choices.map(c => c.id);
    const keys = useRadioKeys(ids, value, onChange);
    return (
        <div role="radiogroup" aria-label={t('simulator.chooseTask')} aria-describedby={value ? undefined : hintId} className="grid gap-2">
            {choices.map((choice, i) => (
                <button
                    key={choice.id}
                    ref={el => { keys.refs.current[i] = el; }}
                    type="button"
                    role="radio"
                    aria-checked={value === choice.id}
                    tabIndex={keys.tabIndex(i)}
                    onKeyDown={e => keys.onKeyDown(e, i)}
                    onClick={() => onChange(choice.id)}
                    className={`${OPTION} font-normal ${value === choice.id ? OPTION_ON : OPTION_IDLE}`}
                >
                    <span className="block text-xs font-black uppercase tracking-wider text-[var(--color-primary)]">{choice.label}</span>
                    <span className="leading-relaxed text-[var(--color-on-surface)]">{choice.prompt}</span>
                </button>
            ))}
        </div>
    );
}
