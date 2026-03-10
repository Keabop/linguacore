import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Vocabulary } from '../lib/db';
import { getStory, getVocab, getVocabMap } from '../data';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useCards } from '../hooks/useCards';
import { toast } from '../lib/toast';
import DOMPurify from 'dompurify';
import LevelBadge from '../components/ui/LevelBadge';

/** Extract unique word IDs from story HTML content */
function extractKeywords(html: string): string[] {
    const regex = /data-word="([^"]+)"/g;
    const seen = new Set<string>();
    let match;
    while ((match = regex.exec(html)) !== null) {
        seen.add(match[1]);
    }
    return Array.from(seen);
}

export default function StoryReader() {
    const { storyId } = useParams<{ storyId: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const qc = useQueryClient();
    const { addCard, isWordInDeck, isWordKnown, markAsKnown } = useCards();

    const [selectedWord, setSelectedWord] = useState<Vocabulary | null>(null);
    const [wordStatus, setWordStatus] = useState<'none' | 'deck' | 'known'>('none');
    const [addedWords, setAddedWords] = useState<Set<string>>(new Set());
    const [knownWords, setKnownWords] = useState<Set<string>>(new Set());
    const [completed, setCompleted] = useState(false);
    const [wordStatuses, setWordStatuses] = useState<Map<string, 'deck' | 'known' | 'none'>>(new Map());

    const story = storyId ? getStory(storyId) : undefined;

    const keywords = useMemo(() => {
        if (!story) return [];
        return extractKeywords(story.content);
    }, [story]);

    const vocabMap = useMemo(() => {
        if (!keywords.length) return new Map<string, Vocabulary>();
        return getVocabMap(keywords) as Map<string, Vocabulary>;
    }, [keywords]);

    useEffect(() => {
        if (!keywords.length) return;
        const checkStatuses = async () => {
            const statuses = new Map<string, 'deck' | 'known' | 'none'>();
            for (const wordId of keywords) {
                const inDeck = await isWordInDeck(wordId);
                const known = await isWordKnown(wordId);
                if (inDeck || addedWords.has(wordId)) {
                    statuses.set(wordId, 'deck');
                } else if (known || knownWords.has(wordId)) {
                    statuses.set(wordId, 'known');
                } else {
                    statuses.set(wordId, 'none');
                }
            }
            setWordStatuses(statuses);
        };
        checkStatuses();
    }, [keywords, addedWords, knownWords, isWordInDeck, isWordKnown]);

    const handleWordClick = useCallback(async (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const wordId = target.getAttribute('data-word');
        if (!wordId) return;

        const vocab = getVocab(wordId) as Vocabulary | undefined;
        if (vocab) {
            setSelectedWord(vocab);
            const inDeck = await isWordInDeck(wordId);
            const known = await isWordKnown(wordId);
            if (inDeck || addedWords.has(wordId)) {
                setWordStatus('deck');
            } else if (known || knownWords.has(wordId)) {
                setWordStatus('known');
            } else {
                setWordStatus('none');
            }
        }
    }, [isWordInDeck, isWordKnown, addedWords, knownWords]);

    const handleChipClick = useCallback(async (wordId: string) => {
        const vocab = vocabMap?.get(wordId);
        if (vocab) {
            setSelectedWord(vocab);
            const status = wordStatuses.get(wordId) || 'none';
            setWordStatus(status);
        }
    }, [vocabMap, wordStatuses]);

    const handleAddWord = async () => {
        if (!selectedWord || !storyId) return;
        const added = await addCard(selectedWord.id, storyId);
        if (added) {
            setAddedWords(prev => new Set(prev).add(selectedWord.id));
            setWordStatus('deck');
            toast.success({ title: `"${selectedWord.id}" ${t('reader.addedToDeck', 'añadida al mazo')}` });
        }
    };

    const handleMarkKnown = async () => {
        if (!selectedWord) return;
        const marked = await markAsKnown(selectedWord.id);
        if (marked) {
            setKnownWords(prev => new Set(prev).add(selectedWord.id));
            setWordStatus('known');
            toast.info({ title: `"${selectedWord.id}" ${t('reader.markedKnown', 'marcada como conocida')}` });
        }
    };

    const handleComplete = async () => {
        if (!storyId) return;
        // Check if story was already completed to avoid duplicate counts
        let alreadyRead = false;
        if (navigator.onLine) {
            const { data: existingRead } = await supabase
                .from('read_stories')
                .select('id')
                .eq('story_id', storyId)
                .limit(1);
            alreadyRead = (existingRead && existingRead.length > 0) ?? false;
        }
        if (!alreadyRead) {
            const { offlineInsert } = await import('../lib/offlineMutation');
            await offlineInsert('read_stories', {
                user_id: authUser!.id,
                story_id: storyId,
                completed_at: new Date().toISOString(),
                words_added: addedWords.size,
            });
            qc.invalidateQueries({ queryKey: ['readStories'] });
        }
        setCompleted(true);
        toast.success({ title: t('reader.storyCompleted', '¡Cuento completado!'), description: `${addedWords.size} ${t('reader.wordsAdded', 'palabras añadidas')}` });
    };

    useEffect(() => {
        if (!story) return;
        const container = document.getElementById('story-content');
        if (!container) return;
        const wordSpans = container.querySelectorAll('span[data-word]');
        wordSpans.forEach(async (span) => {
            const wordId = span.getAttribute('data-word');
            if (wordId) {
                const inDeck = await isWordInDeck(wordId);
                if (inDeck || addedWords.has(wordId)) {
                    span.classList.add('in-deck');
                }
            }
        });
    }, [story, addedWords, isWordInDeck]);

    if (!story) {
        return <div className="text-center text-text-muted py-8">{t('common.loading')}</div>;
    }

    if (completed) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
            >
                <div className="text-7xl">🎉</div>
                <h2 className="text-2xl font-bold">{t('reader.storyCompleted')}</h2>
                <p className="text-text-secondary">
                    {addedWords.size} {t('reader.wordsAdded')}
                </p>
                <div className="flex gap-3 justify-center pt-4">
                    <button
                        onClick={() => navigate('/learn')}
                        className="bg-bg-card hover:bg-bg-card-hover text-text px-6 py-3 rounded-xl font-medium transition-all"
                    >
                        {t('reader.backToStories')}
                    </button>
                    <button
                        onClick={() => navigate('/review')}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-all"
                    >
                        {t('dashboard.startReview')}
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Story header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-text-muted hover:text-text text-xl">←</button>
                <div className="flex-1">
                    <h2 className="text-xl font-bold">{story.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <LevelBadge level={story.level} size="compact" />
                        <span className="text-xs text-text-muted">
                            {story.estimatedMinutes} {t('reader.minutes')} · {story.wordCount} {t('reader.words')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tap hint */}
            <div className="bg-accent-blue/10 text-accent-blue text-xs py-2 px-4 rounded-lg text-center">
                💡 {t('reader.tapToTranslate')}
            </div>

            {/* Story content */}
            <div
                id="story-content"
                onClick={handleWordClick}
                className="widget !p-7 text-lg leading-relaxed tracking-wide"
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(story.content, {
                        ALLOWED_TAGS: ['p', 'span', 'br'],
                        ALLOWED_ATTR: ['data-word', 'class'],
                    })
                }}
            />

            {/* Key vocabulary zone */}
            {keywords.length > 0 && vocabMap && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="widget space-y-3"
                >
                    <h3 className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                        📚 {t('reader.keyVocabulary')}
                        <span className="text-xs text-text-muted font-normal">({keywords.length})</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {keywords.map((wordId) => {
                            const vocab = vocabMap.get(wordId);
                            const status = wordStatuses.get(wordId) || 'none';
                            if (!vocab) return null;
                            return (
                                <button
                                    key={wordId}
                                    onClick={() => handleChipClick(wordId)}
                                    className={`vocab-chip ${status === 'deck' ? 'in-deck' : status === 'known' ? 'known' : ''}`}
                                >
                                    {status === 'deck' && <span>✓</span>}
                                    {status === 'known' && <span>✓</span>}
                                    <span>{wordId}</span>
                                    <span className="chip-translation">— {vocab.translations[0]}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Complete button */}
            <button
                onClick={handleComplete}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98]"
            >
                ✓ {t('reader.storyCompleted')}
            </button>

            {/* Word popup */}
            <AnimatePresence>
                {selectedWord && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedWord(null)}
                            className="fixed inset-0 bg-black/40 z-[55]"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-4 left-4 right-4 z-[60]"
                        >
                            <div className="widget !shadow-2xl space-y-3 max-w-lg mx-auto max-h-[55vh] overflow-y-auto">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-accent-blue">{selectedWord.id}</h3>
                                        {selectedWord.phonetic && (
                                            <p className="text-sm text-text-muted mt-0.5">{selectedWord.phonetic}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelectedWord(null)}
                                        className="text-text-muted hover:text-text text-xl leading-none p-1"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wider">{t('reader.translation')}</p>
                                    <p className="text-base font-medium">{selectedWord.translations.join(', ')}</p>
                                </div>

                                {selectedWord.examples.length > 0 && (
                                    <div>
                                        <p className="text-xs text-text-muted uppercase tracking-wider">{t('reader.example')}</p>
                                        <p className="text-sm text-text-secondary italic">"{selectedWord.examples[0]}"</p>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-1">
                                    {wordStatus === 'deck' ? (
                                        <div className="flex-1 bg-primary/15 text-primary text-center py-2.5 rounded-xl text-sm font-medium">
                                            ✓ {t('reader.alreadyAdded')}
                                        </div>
                                    ) : wordStatus === 'known' ? (
                                        <div className="flex-1 bg-accent-blue/15 text-accent-blue text-center py-2.5 rounded-xl text-sm font-medium">
                                            ✓ {t('reader.alreadyKnown')}
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleAddWord}
                                                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-medium transition-all active:scale-[0.98] text-sm"
                                            >
                                                + {t('reader.addToDeck')}
                                            </button>
                                            <button
                                                onClick={handleMarkKnown}
                                                className="flex-1 bg-bg-card-hover hover:bg-surface-light text-text py-2.5 rounded-xl font-medium transition-all active:scale-[0.98] text-sm"
                                            >
                                                ✓ {t('reader.alreadyKnown')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
