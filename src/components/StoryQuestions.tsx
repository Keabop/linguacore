import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import type { StoryQuestion } from '../lib/db';
import { shuffleQuestion } from '../lib/shuffle';
import { OPTION, OPTION_IDLE } from './exam/QuestionView';

/**
 * Comprehension questions after a story. Each one is answered once: the choice locks, says
 * whether it was right and quotes the sentence of the story that answers it.
 */
export default function StoryQuestions({ questions }: { questions: StoryQuestion[] }) {
    const { t } = useTranslation();
    // New option order each time the story is opened
    const shuffled = useMemo(() => questions.map(shuffleQuestion), [questions]);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const right = shuffled.filter((q, i) => answers[i] === q.correctIndex).length;
    const done = Object.keys(answers).length === shuffled.length;

    return (
        <section aria-labelledby="story-questions-title" className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-7 space-y-6 shadow-[var(--shadow-card)]">
            <div className="space-y-1">
                <h3 id="story-questions-title" className="text-lg font-bold text-[var(--color-on-surface)]">{t('reader.questionsTitle')}</h3>
                <p className="text-sm text-[var(--color-on-surface-muted)]">{t('reader.questionsIntro')}</p>
            </div>

            {shuffled.map((q, i) => {
                const answer = answers[i];
                const answered = answer !== undefined;
                return (
                    <div key={q.question} role="group" aria-labelledby={`story-q-${i}`} className="space-y-3">
                        <p id={`story-q-${i}`} className="font-semibold text-[var(--color-on-surface)]">{i + 1}. {q.question}</p>
                        <div className="grid gap-2">
                            {q.options.map((option, k) => {
                                const isRight = answered && k === q.correctIndex;
                                const isWrongPick = answered && k === answer && k !== q.correctIndex;
                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        // aria-disabled, not disabled: keyboard focus stays on the answer just given
                                        aria-disabled={answered}
                                        aria-pressed={answer === k}
                                        onClick={() => { if (!answered) setAnswers(prev => ({ ...prev, [i]: k })); }}
                                        className={`${OPTION} flex items-center justify-between gap-3 aria-disabled:cursor-default ${
                                            isRight
                                                ? 'border-[var(--color-success)] bg-[color-mix(in_oklch,var(--color-success)_12%,transparent)] text-[var(--color-on-surface)]'
                                                : isWrongPick
                                                    ? 'border-[var(--color-error)] bg-[color-mix(in_oklch,var(--color-error)_10%,transparent)] text-[var(--color-on-surface)]'
                                                    : OPTION_IDLE
                                        }`}
                                    >
                                        <span>{option}</span>
                                        {isRight && <Check className="h-4 w-4 shrink-0 text-[var(--color-success)]" aria-hidden="true" />}
                                        {isWrongPick && <X className="h-4 w-4 shrink-0 text-[var(--color-error)]" aria-hidden="true" />}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Always mounted, so screen readers announce the feedback when it appears */}
                        <p className="text-sm text-[var(--color-on-surface-muted)]" aria-live="polite">
                            {answered && (
                                <>
                                    <span className="font-bold text-[var(--color-on-surface)]">{answer === q.correctIndex ? t('reader.answerRight') : t('reader.answerWrong')}</span>{' '}
                                    {t('reader.answerEvidence')} <q lang="en" className="italic">{q.evidence}</q>
                                </>
                            )}
                        </p>
                    </div>
                );
            })}

            <p className="text-center text-sm font-bold text-[var(--color-on-surface)]" aria-live="polite">
                {done && t('reader.questionsScore', { right, total: shuffled.length })}
            </p>
        </section>
    );
}
