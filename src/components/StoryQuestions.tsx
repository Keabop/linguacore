import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import type { StoryQuestion, StoryTranslation } from '../lib/db';
import { shuffle } from '../lib/shuffle';
import { OPTION, OPTION_IDLE } from './exam/QuestionView';

interface ShownQuestion extends StoryQuestion {
    /** The Spanish, when the story has it: the question, each option in the shown order, the quoted sentence. */
    es?: { question: string; options: string[]; evidence?: string };
}

/** The Spanish of the story sentence a question quotes. */
function evidenceSpanish(evidence: string, sentences: string[], translation: StoryTranslation): string | undefined {
    const i = sentences.findIndex(s => s.includes(evidence) || evidence.includes(s));
    return i >= 0 ? translation.sentences[i] : undefined;
}

/**
 * Comprehension questions after a story. Each one is answered once: the choice locks, says
 * whether it was right and quotes the sentence of the story that answers it. With the Spanish
 * shown, each question, option and quote carries its translation under it.
 */
export default function StoryQuestions({ questions, translation, sentences = [], showSpanish = false }: {
    questions: StoryQuestion[];
    translation?: StoryTranslation;
    sentences?: string[];
    showSpanish?: boolean;
}) {
    const { t } = useTranslation();
    // New option order each time the story is opened; the Spanish options follow the same order
    const shuffled = useMemo<ShownQuestion[]>(() => questions.map((q, n) => {
        const order = shuffle(q.options.map((_, i) => i));
        const es = translation?.questions?.[n];
        return {
            ...q,
            options: order.map(i => q.options[i]),
            correctIndex: order.indexOf(q.correctIndex),
            es: es && {
                question: es.question,
                options: order.map(i => es.options[i]),
                evidence: translation && evidenceSpanish(q.evidence, sentences, translation),
            },
        };
    }), [questions, translation, sentences]);
    const spanish = showSpanish && !!translation;
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const right = shuffled.filter((q, i) => answers[i] === q.correctIndex).length;
    const done = Object.keys(answers).length === shuffled.length;

    return (
        <section aria-labelledby="story-questions-title" className="app-sheet p-7 space-y-6">
            <div className="space-y-1">
                <h3 id="story-questions-title" className="text-lg font-bold text-[var(--color-on-surface)]">{t('reader.questionsTitle')}</h3>
                <p className="text-sm text-[var(--color-on-surface-muted)]">{t('reader.questionsIntro')}</p>
            </div>

            {shuffled.map((q, i) => {
                const answer = answers[i];
                const answered = answer !== undefined;
                return (
                    <div key={q.question} role="group" aria-labelledby={`story-q-${i}`} className="space-y-3">
                        <p id={`story-q-${i}`} className="font-semibold text-[var(--color-on-surface)]">
                            {i + 1}. <span lang="en">{q.question}</span>
                            {spanish && q.es && <span className="story-question-es">{q.es.question}</span>}
                        </p>
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
                                        <span>
                                            <span lang="en">{option}</span>
                                            {spanish && q.es && <span className="story-option-es">{q.es.options[k]}</span>}
                                        </span>
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
                                    {/* The quote in Spanish too, whatever the toggle: an answer in English alone explains nothing to whoever starts */}
                                    {q.es?.evidence && <span className="story-question-es">{q.es.evidence}</span>}
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
