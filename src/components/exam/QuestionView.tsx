import { useId, useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { parseCompleteWords } from '../../lib/exam/grading';
import {
    isMultipleChoice, type AssessmentQuestion, type BuildSentenceQuestion, type CompleteWordsQuestion, type ExamResponse,
    type GapQuestion, type MultipleChoiceQuestion, type TfngAnswer, type TfngQuestion,
} from '../../lib/exam/types';

interface Props {
    question: AssessmentQuestion;
    response: ExamResponse | undefined;
    onChange: (response: ExamResponse) => void;
}

export const OPTION = 'w-full p-4 rounded-[1.25rem] text-left text-sm font-semibold border-2 transition-colors duration-[var(--dur-short)]';
export const OPTION_IDLE = 'border-transparent bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)]';
export const OPTION_ON = 'border-[var(--color-primary)] bg-[var(--color-primary-container)] text-[var(--color-primary)]';
const INPUT = 'rounded-[var(--radius-sm)] border-[1.5px] border-[var(--color-outline-variant)] bg-[var(--color-card)] px-2 py-1 text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none';

/** One exam question of any kind, with its answer controls. */
export default function QuestionView({ question, response, onChange }: Props) {
    if (isMultipleChoice(question)) return <MultipleChoice q={question} value={response as number | undefined} onChange={onChange} />;
    switch (question.kind) {
        case 'tfng': return <TrueFalseNotGiven q={question} value={response as TfngAnswer | undefined} onChange={onChange} />;
        case 'gap': return <Gap q={question} value={(response as string | undefined) ?? ''} onChange={onChange} />;
        case 'complete-words': return <CompleteWords q={question} value={(response as string[] | undefined) ?? []} onChange={onChange} />;
        case 'build-sentence': return <BuildSentence q={question} value={(response as number[] | undefined) ?? []} onChange={onChange} />;
    }
}

/**
 * Radio group keyboard behaviour: Tab reaches the group once (the chosen option, or the first),
 * arrows move and choose, as in a native radio group.
 */
export function useRadioKeys<T>(values: T[], selected: T | undefined, onSelect: (v: T) => void) {
    const refs = useRef<(HTMLButtonElement | null)[]>([]);
    const onKeyDown = (e: KeyboardEvent, i: number) => {
        const step = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[e.key];
        if (!step) return;
        e.preventDefault();
        const next = (i + step + values.length) % values.length;
        onSelect(values[next]);
        refs.current[next]?.focus();
    };
    const tabIndex = (i: number) => ((selected === undefined ? i === 0 : values[i] === selected) ? 0 : -1);
    return { refs, onKeyDown, tabIndex };
}

function MultipleChoice({ q, value, onChange }: { q: MultipleChoiceQuestion; value?: number; onChange: (v: number) => void }) {
    const id = useId();
    const keys = useRadioKeys(q.options.map((_, i) => i), value, onChange);
    return (
        <div className="space-y-4">
            <p id={id} className="text-lg font-bold leading-snug mb-4">{q.text}</p>
            <div className="space-y-3" role="radiogroup" aria-labelledby={id}>
                {q.options.map((opt, i) => (
                    <button
                        key={i}
                        ref={el => { keys.refs.current[i] = el; }}
                        type="button"
                        role="radio"
                        aria-checked={value === i}
                        tabIndex={keys.tabIndex(i)}
                        onKeyDown={e => keys.onKeyDown(e, i)}
                        onClick={() => onChange(i)}
                        className={`${OPTION} ${value === i ? OPTION_ON : OPTION_IDLE}`}
                    >
                        {/* Fixed lists get a letter, unless they carry their own numbering (headings i–viii) */}
                        {q.fixedOrder && !/^[ivx]+\.\s/i.test(opt) && <span className="mr-2 font-mono text-[var(--color-on-surface-muted)]">{String.fromCharCode(65 + i)}</span>}
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

function TrueFalseNotGiven({ q, value, onChange }: { q: TfngQuestion; value?: TfngAnswer; onChange: (v: TfngAnswer) => void }) {
    const labels: Record<TfngAnswer, string> = q.variant === 'yes-no'
        ? { true: 'Yes', false: 'No', 'not-given': 'Not given' }
        : { true: 'True', false: 'False', 'not-given': 'Not given' };
    const { t } = useTranslation();
    const id = useId();
    const values = Object.keys(labels) as TfngAnswer[];
    const keys = useRadioKeys(values, value, onChange);
    return (
        <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-muted)]">
                {q.variant === 'yes-no' ? t('exam.yesNoPrompt') : t('exam.tfngPrompt')}
            </p>
            <p id={id} className="text-lg font-bold leading-snug">{q.text}</p>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-labelledby={id}>
                {values.map((key, i) => (
                    <button
                        key={key}
                        ref={el => { keys.refs.current[i] = el; }}
                        type="button"
                        role="radio"
                        aria-checked={value === key}
                        tabIndex={keys.tabIndex(i)}
                        onKeyDown={e => keys.onKeyDown(e, i)}
                        onClick={() => onChange(key)}
                        className={`${OPTION} text-center ${value === key ? OPTION_ON : OPTION_IDLE}`}
                    >
                        {labels[key]}
                    </button>
                ))}
            </div>
        </div>
    );
}

const WORD_LIMIT = ['', 'ONE WORD', 'TWO WORDS', 'THREE WORDS', 'FOUR WORDS', 'FIVE WORDS'];

/** The exam's wording: "ONE WORD ONLY", "ONE WORD AND/OR A NUMBER", "NO MORE THAN TWO WORDS"… */
export function wordLimitLabel(maxWords: number, allowNumber = false): string {
    const words = WORD_LIMIT[maxWords] ?? `${maxWords} WORDS`;
    if (maxWords === 1) return allowNumber ? 'ONE WORD AND/OR A NUMBER' : 'ONE WORD ONLY';
    return `NO MORE THAN ${words}${allowNumber ? ' AND/OR A NUMBER' : ''}`;
}

function Gap({ q, value, onChange }: { q: GapQuestion; value: string; onChange: (v: string) => void }) {
    const [before, after = ''] = q.text.split('___');
    return (
        <div className="space-y-3">
            {(q.instruction || q.maxWords) && (
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-muted)]">
                    {q.instruction ?? `Write ${wordLimitLabel(q.maxWords!, q.allowNumber)}`}
                </p>
            )}
            <label className="block text-lg font-bold leading-loose">
                {before}
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    className={`${INPUT} mx-1 w-48 font-semibold`}
                />
                {after}
            </label>
        </div>
    );
}

function CompleteWords({ q, value, onChange }: { q: CompleteWordsQuestion; value: string[]; onChange: (v: string[]) => void }) {
    const { t } = useTranslation();
    let gap = -1;
    return (
        <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-muted)]">{t('exam.completeWords')}</p>
            <p className="text-base leading-[2.4] text-[var(--color-on-surface)]">
                {parseCompleteWords(q.text).map((part, i) => {
                    if (typeof part === 'string') return <span key={i}>{part}</span>;
                    const idx = ++gap;
                    return (
                        <span key={i} className="whitespace-nowrap">
                            {part.shown}
                            <input
                                type="text"
                                value={value[idx] ?? ''}
                                maxLength={part.missing.length}
                                onChange={e => {
                                    const next = [...value];
                                    next[idx] = e.target.value.replace(/\s/g, '');
                                    onChange(next);
                                }}
                                autoComplete="off"
                                spellCheck={false}
                                aria-label={t('exam.missingLetters', { start: part.shown, count: part.missing.length })}
                                style={{ width: `calc(${part.missing.length}ch + 1.25rem)` }}
                                className={`${INPUT} inline-block h-8 px-2 py-0 align-baseline font-mono text-[15px] tracking-wide`}
                            />
                        </span>
                    );
                })}
            </p>
        </div>
    );
}

function BuildSentence({ q, value, onChange }: { q: BuildSentenceQuestion; value: number[]; onChange: (v: number[]) => void }) {
    const { t } = useTranslation();
    const remaining = q.pieces.map((_, i) => i).filter(i => !value.includes(i));
    const sentenceRef = useRef<HTMLDivElement>(null);
    const poolRef = useRef<HTMLDivElement>(null);
    // The tapped piece disappears; focus moves to its neighbour instead of the page
    const refocus = (group: HTMLDivElement | null, position: number) => requestAnimationFrame(() => {
        const buttons = group?.querySelectorAll('button');
        if (buttons?.length) buttons[Math.min(position, buttons.length - 1)].focus();
        else (group === poolRef.current ? sentenceRef.current : poolRef.current)?.querySelector('button')?.focus();
    });
    return (
        <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-muted)]">{t('exam.buildSentence')}</p>
            <p className="text-lg font-bold leading-snug">{q.text}</p>
            <div ref={sentenceRef} role="group" aria-label={t('exam.yourSentence')} className="min-h-14 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-outline-variant)] p-3 flex flex-wrap gap-2">
                {value.length === 0 && <span className="text-sm text-[var(--color-on-surface-muted)] self-center">{t('exam.tapPieces')}</span>}
                {value.map((pieceIdx, pos) => (
                    <button key={pos} type="button" onClick={() => { onChange(value.filter((_, k) => k !== pos)); refocus(sentenceRef.current, pos); }} className="rounded-full bg-[var(--color-primary-container)] text-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold" aria-label={t('exam.removePiece', { piece: q.pieces[pieceIdx] })}>
                        {q.pieces[pieceIdx]}
                    </button>
                ))}
            </div>
            <div ref={poolRef} role="group" aria-label={t('exam.availablePieces')} className="flex flex-wrap gap-2">
                {remaining.map((i, pos) => (
                    <button key={i} type="button" onClick={() => { onChange([...value, i]); refocus(poolRef.current, pos); }} className="rounded-full bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)] px-3 py-1.5 text-sm font-semibold">
                        {q.pieces[i]}
                    </button>
                ))}
            </div>
        </div>
    );
}
