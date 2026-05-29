import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
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
    const location = useLocation();
    const { user: authUser } = useAuth();
    const qc = useQueryClient();
    const { addCard, isWordInDeck, isWordKnown, markAsKnown } = useCards();

    const [selectedWord, setSelectedWord] = useState<Vocabulary | null>(null);
    const [wordStatus, setWordStatus] = useState<'none' | 'deck' | 'known'>('none');
    const [addedWords, setAddedWords] = useState<Set<string>>(new Set());
    const [knownWords, setKnownWords] = useState<Set<string>>(new Set());
    const [completed, setCompleted] = useState(false);
    const [wordStatuses, setWordStatuses] = useState<Map<string, 'deck' | 'known' | 'none'>>(new Map());

    // Check static data first, then fallback to AI story from navigation state
    const aiStory = (location.state as any)?.aiStory;
    const staticStory = storyId ? getStory(storyId) : undefined;
    const story = staticStory ?? (aiStory ? { ...aiStory, level: aiStory.level as any } : undefined);
    const isAIStory = !staticStory && !!aiStory;

    const keywords = useMemo(() => {
        if (!story) return [];
        return extractKeywords(story.content);
    }, [story]);

    const vocabMap = useMemo(() => {
        if (!keywords.length) return new Map<string, Vocabulary>();
        if (isAIStory && aiStory?.vocabulary) {
            const map = new Map<string, Vocabulary>();
            for (const v of aiStory.vocabulary) {
                map.set(v.id, v as Vocabulary);
            }
            return map;
        }
        return getVocabMap(keywords) as Map<string, Vocabulary>;
    }, [keywords, isAIStory, aiStory]);

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

        const vocab = (isAIStory ? vocabMap.get(wordId) : getVocab(wordId)) as Vocabulary | undefined;
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
        }
    };

    const handleMarkKnown = async () => {
        if (!selectedWord) return;
        const marked = await markAsKnown(selectedWord.id);
        if (marked) {
            setKnownWords(prev => new Set(prev).add(selectedWord.id));
            setWordStatus('known');
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
        return (
            <div className="text-center py-16 space-y-6">
                <p className="text-[var(--color-on-surface-muted)] text-lg">{t('reader.storyNotFound', 'Historia no encontrada')}</p>
                <button
                    onClick={() => navigate('/learn')}
                    className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97]"
                >
                    {t('reader.backToStories', 'Volver a historias')}
                </button>
            </div>
        );
    }

    if (completed) {
        return (
            <LazyMotion features={domAnimation}>
                <m.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 space-y-6"
                >
                    <div className="text-7xl">🎉</div>
                    <h2 className="text-3xl font-black tracking-tight">{t('reader.storyCompleted')}</h2>
                    <p className="text-[var(--color-on-surface-muted)] text-base">
                        {addedWords.size} {t('reader.wordsAdded')}
                    </p>
                    <div className="flex gap-4 justify-center pt-6">
                        <button
                            onClick={() => navigate('/learn')}
                            className="bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] px-7 py-3.5 rounded-full font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
                        >
                            {t('reader.backToStories')}
                        </button>
                        <button
                            onClick={() => navigate('/review')}
                            className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white px-7 py-3.5 rounded-full font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97]"
                        >
                            {t('dashboard.startReview')}
                        </button>
                    </div>
                </m.div>
            </LazyMotion>
        );
    }

    return (
        <LazyMotion features={domAnimation}>
        <div className="space-y-8">
            {/* Story header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] hover:shadow-[var(--shadow-card)] transition-all duration-300 text-xl"
                >
                    ←
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-black tracking-tight">{story.title}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                        <LevelBadge level={story.level} size="compact" />
                        <span className="text-xs text-[var(--color-on-surface-muted)]">
                            {story.estimatedMinutes} {t('reader.minutes')} · {story.wordCount} {t('reader.words')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tap hint */}
            <div className="bg-[var(--color-primary)]/8 text-[var(--color-primary)] text-xs py-3 px-5 rounded-full text-center shadow-[var(--shadow-card)]">
                💡 {t('reader.tapToTranslate')}
            </div>

            {/* Story content */}
            <div
                id="story-content"
                role="document"
                tabIndex={0}
                onClick={handleWordClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWordClick(e as any); }}
                className="bg-[var(--color-card)] rounded-[2rem] p-8 text-lg leading-relaxed tracking-wide focus:outline-none shadow-[var(--shadow-card)] transition-all duration-300"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(story.content, {
                        ALLOWED_TAGS: ['p', 'span', 'br'],
                        ALLOWED_ATTR: ['data-word', 'class'],
                    })
                }}
            />

            {/* Key vocabulary zone */}
            {keywords.length > 0 && vocabMap && (
                <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[var(--color-card)] rounded-[2rem] p-7 space-y-4 shadow-[var(--shadow-card)]"
                >
                    <h3 className="text-sm font-bold text-[var(--color-on-surface-muted)] flex items-center gap-2">
                        📚 {t('reader.keyVocabulary')}
                        <span className="text-xs text-[var(--color-on-surface-muted)] font-normal">({keywords.length})</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
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
                </m.div>
            )}

            {/* Complete button */}
            <button
                onClick={handleComplete}
                className="w-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white font-black py-4 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97] text-base tracking-wide"
            >
                ✓ {t('reader.storyCompleted')}
            </button>

            {/* Word popup */}
            <AnimatePresence>
                {selectedWord && (
                    <>
                        {/* Backdrop */}
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedWord(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
                        />
                        <m.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-4 left-4 right-4 z-[60]"
                        >
                            <div className="bg-[var(--color-card)] rounded-[2rem] p-7 shadow-[var(--shadow-float)] space-y-4 max-w-lg mx-auto max-h-[55vh] overflow-y-auto">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight text-accent-blue">{selectedWord.id}</h3>
                                        {selectedWord.phonetic && (
                                            <p className="text-sm text-[var(--color-on-surface-muted)] mt-0.5">{selectedWord.phonetic}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelectedWord(null)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] transition-all duration-300 text-lg leading-none"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="bg-[var(--color-surface-container)] rounded-2xl p-4">
                                    <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider mb-1">{t('reader.translation')}</p>
                                    <p className="text-base font-bold">{selectedWord.translations.join(', ')}</p>
                                </div>

                                {selectedWord.examples.length > 0 && (
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4">
                                        <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider mb-1">{t('reader.example')}</p>
                                        <p className="text-sm text-[var(--color-on-surface-muted)] italic">"{selectedWord.examples[0]}"</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    {wordStatus === 'deck' ? (
                                        <div className="flex-1 bg-[var(--color-primary)]/12 text-[var(--color-primary)] text-center py-3 rounded-full text-sm font-bold">
                                            ✓ {t('reader.alreadyAdded')}
                                        </div>
                                    ) : wordStatus === 'known' ? (
                                        <div className="flex-1 bg-accent-blue/12 text-accent-blue text-center py-3 rounded-full text-sm font-bold">
                                            ✓ {t('reader.alreadyKnown')}
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleAddWord}
                                                className="flex-1 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white py-3 rounded-full font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97] text-sm"
                                            >
                                                + {t('reader.addToDeck')}
                                            </button>
                                            <button
                                                onClick={handleMarkKnown}
                                                className="flex-1 bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] py-3 rounded-full font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] text-sm"
                                            >
                                                ✓ {t('reader.alreadyKnown')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </m.div>
                    </>
                )}
            </AnimatePresence>
        </div>
        </LazyMotion>
    );
}
