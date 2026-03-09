import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { type Card, type Vocabulary } from '../lib/db';
import { getStory } from '../data';
import { Lightbulb, Check, X, ArrowRight } from 'lucide-react';

interface Props {
    card: Card;
    vocabulary: Vocabulary;
    onResult: (correct: boolean) => void;
}

function extractSentenceWithWord(html: string, word: string): string | null {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const wordLower = word.toLowerCase();
    const match = sentences.find(s => {
        const words = s.toLowerCase().split(/\s+/);
        return words.some(w => w === wordLower || w.startsWith(wordLower) || w.endsWith(wordLower));
    });
    return match ? match + '.' : null;
}

function createCloze(sentence: string, word: string): { before: string; after: string } {
    const regex = new RegExp(`\\b(${word}\\w*)\\b`, 'i');
    const match = sentence.match(regex);
    if (match && match.index !== undefined) {
        const matchedWord = match[0];
        const before = sentence.substring(0, match.index);
        const after = sentence.substring(match.index + matchedWord.length);
        return { before, after };
    }
    return { before: sentence + ' ', after: '' };
}

export default function ClozeReview({ card, vocabulary, onResult }: Props) {
    const { t } = useTranslation();
    const [answer, setAnswer] = useState('');
    const [status, setStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');
    const [usedHint, setUsedHint] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const story = getStory(card.storyId);

    const clozeData = useMemo(() => {
        if (story) {
            const sentence = extractSentenceWithWord(story.content, vocabulary.id);
            if (sentence) {
                return createCloze(sentence, vocabulary.id);
            }
        }
        if (vocabulary.examples.length > 0) {
            return createCloze(vocabulary.examples[0], vocabulary.id);
        }
        return { before: 'The _________ is ', after: 'important.' };
    }, [story, vocabulary]);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim() || status !== 'pending') return;

        const normalized = answer.trim().toLowerCase();
        const target = vocabulary.id.toLowerCase();

        const isCorrect = normalized === target;

        if (isCorrect && !usedHint) {
            setStatus('correct');
            setTimeout(() => onResult(true), 1000);
        } else {
            setStatus(isCorrect ? 'correct' : 'incorrect');
            if (usedHint) {
                setTimeout(() => onResult(false), 1500);
            }
        }
    };

    const handleHint = () => {
        setUsedHint(true);
        setShowHint(true);
    };

    const handleContinue = () => {
        onResult(false);
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="widget text-center"
            >
                <p className="text-xs text-text-muted uppercase tracking-wider mb-4">
                    {t('review.clozeMode')}
                </p>
                <p className="text-xl leading-relaxed text-text">
                    <span className="text-text-secondary">{clozeData.before}</span>
                    <span className="inline-block min-w-[80px] border-b-2 border-primary mx-1 text-primary font-bold">
                        {status !== 'pending' ? vocabulary.id : '________'}
                    </span>
                    <span className="text-text-secondary">{clozeData.after}</span>
                </p>
                <p className="text-sm text-text-muted mt-3">
                    ({vocabulary.translations[0]})
                </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    ref={inputRef}
                    type="text"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder={t('review.fillBlank')}
                    disabled={status !== 'pending'}
                    className={`review-input ${status === 'correct' ? 'correct' : status === 'incorrect' ? 'incorrect' : ''}`}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                />

                {status === 'pending' && (
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={!answer.trim()}
                            className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white py-3 rounded-xl font-bold transition-all active:scale-[0.98]"
                        >
                            {t('review.check')} ↵
                        </button>
                        {!showHint && (
                            <button
                                type="button"
                                onClick={handleHint}
                                className="bg-bg-card hover:bg-bg-card-hover text-text-secondary py-3 px-4 rounded-xl font-medium transition-all text-sm"
                            >
                                <Lightbulb className="w-4 h-4 inline" /> {t('review.hint')}
                            </button>
                        )}
                    </div>
                )}
            </form>

            {showHint && status === 'pending' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-center"
                >
                    <p className="text-sm text-accent-orange">
                        <Lightbulb className="w-4 h-4 inline text-accent-orange" /> {vocabulary.id[0]}{vocabulary.id.slice(1).replace(/./g, '_')}
                    </p>
                </motion.div>
            )}

            {status === 'correct' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <p className="text-lg font-bold text-primary flex items-center justify-center gap-1"><Check className="w-5 h-5" /> {t('review.correct')}</p>
                    {usedHint && (
                        <p className="text-xs text-text-muted mt-1">
                            ({t('review.hint')} → {t('review.again')})
                        </p>
                    )}
                </motion.div>
            )}

            {status === 'incorrect' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-3"
                >
                    <p className="text-lg font-bold text-accent-red flex items-center justify-center gap-1"><X className="w-5 h-5" /> {t('review.incorrect')}</p>
                    <p className="text-sm text-text-secondary">
                        {t('review.correctAnswer')}: <span className="text-primary font-bold">{vocabulary.id}</span>
                    </p>
                    <button
                        onClick={handleContinue}
                        className="bg-bg-card hover:bg-bg-card-hover text-text px-6 py-2.5 rounded-xl font-medium transition-all"
                    >
                        {t('review.continueNext')} <ArrowRight className="w-4 h-4 inline" />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
