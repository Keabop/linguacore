import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Vocabulary } from '../lib/db';
import { levelOfId, useLevelContent } from '../data/levels';
import PageLoader from '../components/PageLoader';
import { prefetchVocabulary, useVocabulary } from '../data/vocabulary/load';
import StoryQuestions from '../components/StoryQuestions';
import { useAuth } from '../lib/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isLimitReached, translateStory } from '../lib/ai';
import { useRecordActivity } from '../hooks/useRecordActivity';
import { useCards } from '../hooks/useCards';
import { notice } from '../lib/notice';
import DOMPurify from 'dompurify';
import LevelBadge from '../components/ui/LevelBadge';
import { useSpeech } from '../hooks/useSpeech';
import { Play, Pause, SkipForward, SkipBack, Mic, Headphones, Trophy, Lightbulb, BookOpen, Check, Languages } from 'lucide-react';
import BackButton from '../components/ui/BackButton';
import PlantCircle from '../components/garden/PlantCircle';
import { useGardenPlant } from '../hooks/useGardenPlant';
import type { ReadStoryRow } from '../lib/database.types';
import { useDialogKeys } from '../hooks/useDialogKeys';
import { useStoryPlayback } from '../hooks/useStoryPlayback';
import { storySentences, wrapStorySentences } from '../lib/storySentences';
import { audioFor, storyKey } from '../lib/audioKey';
import { SPEECH_RATE, type Accent } from '../lib/voices';
import NoEnglishVoices from '../components/ui/NoEnglishVoices';
import { saveGuestStory } from '../lib/guestTrial';
import { useNoteContext } from '../components/notebook/NotebookContext';
import { escapeHtml } from '../lib/glossify';
import SpeakButton from '../components/ui/SpeakButton';
import { soundsLike } from '../lib/soundsLike';

const SPANISH_KEY = 'voxie-story-spanish';

/** The learner's last choice of showing the Spanish under each sentence; null if never chosen. */
function readSpanishChoice(): boolean | null {
    try {
        const stored = localStorage.getItem(SPANISH_KEY);
        return stored === null ? null : stored === 'on';
    } catch {
        return null;
    }
}

/** How long the word card shows the choice before closing: enough to see it was taken. */
const WORD_CARD_CLOSE_MS = 1100;

type WordStatus = 'deck' | 'known' | 'none';

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

interface StoryReaderProps {
    /** The trial story a visitor reads without an account (`/probar`). */
    trialStoryId?: string;
}

export default function StoryReader({ trialStoryId }: StoryReaderProps = {}) {
    const { species } = useGardenPlant();
    const params = useParams<{ storyId: string }>();
    const storyId = trialStoryId ?? params.storyId;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user: authUser } = useAuth();
    // A visitor's marks stay in this browser until they create an account (lib/guestTrial)
    const guest = !authUser;
    const qc = useQueryClient();
    const recordActivity = useRecordActivity();
    const { isWordInDeck, isWordKnown, saveStoryWords } = useCards();

    const [selectedWord, setSelectedWord] = useState<Vocabulary | null>(null);
    // Words marked in this reading; they are saved together when the story is completed
    const [addedWords, setAddedWords] = useState<Set<string>>(new Set());
    const [knownWords, setKnownWords] = useState<Set<string>>(new Set());
    const [completed, setCompleted] = useState(false);
    // Words already saved before this reading (null while they load)
    const [savedStatuses, setSavedStatuses] = useState<Map<string, WordStatus> | null>(null);
    // Words still unmarked when the learner tried to complete the story
    const [missingWords, setMissingWords] = useState<string[] | null>(null);
    const missingDialogRef = useDialogKeys(missingWords !== null, () => setMissingWords(null));
    const [saving, setSaving] = useState(false);
    // A lesson that sent the learner here gets them back once the story is done
    const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;

    // --- Audiobook and Speech States ---
    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeech();

    const [accent, setAccent] = useState<Accent>('US');

    const [showShadowing, setShowShadowing] = useState(false);
    const [comparedWords, setComparedWords] = useState<{ word: string; match: boolean }[]>([]);
    const [shadowingScore, setShadowingScore] = useState(0);
    const [hasPracticed, setHasPracticed] = useState(false);

    // Check static data first, then fallback to AI story from navigation state
    const aiStory = (location.state as any)?.aiStory;
    // A static story's level is downloaded on its own; AI stories ("ai-…") come in the navigation state
    const storyLevel = levelOfId(storyId);
    const levelContent = useLevelContent(storyLevel);
    // Most of a story's words are of its level: that deck downloads alongside the text
    useEffect(() => prefetchVocabulary(storyLevel), [storyLevel]);
    const staticStory = levelContent?.stories.find(s => s.id === storyId);
    const story = staticStory ?? (aiStory ? { ...aiStory, level: aiStory.level as any } : undefined);
    const isAIStory = !staticStory && !!aiStory;
    // Notes written while reading belong to the story
    useNoteContext(story && storyId ? { key: `story:${storyId}`, label: story.title, path: location.pathname } : null);

    // Keyed on the text: an AI story is a new object on every render
    const storyContent = story?.content;
    const keywords = useMemo(() => (storyContent ? extractKeywords(storyContent) : []), [storyContent]);

    // The decks of a static story's words (an AI story brings its own cards)
    const vocabulary = useVocabulary(isAIStory ? [] : keywords);
    const vocabMap = useMemo(() => {
        if (!keywords.length) return new Map<string, Vocabulary>();
        if (isAIStory && aiStory?.vocabulary) {
            const map = new Map<string, Vocabulary>();
            for (const v of aiStory.vocabulary) {
                map.set(v.id, v as Vocabulary);
            }
            return map;
        }
        return vocabulary?.map(keywords) ?? new Map<string, Vocabulary>();
    }, [keywords, isAIStory, aiStory, vocabulary]);

    // What the learner had saved before this reading, checked once per story
    useEffect(() => {
        if (!keywords.length) return;
        if (guest) {
            setSavedStatuses(new Map(keywords.map(id => [id, 'none'])));
            return;
        }
        let cancelled = false;
        Promise.all(keywords.map(async (wordId): Promise<[string, WordStatus]> => {
            if (await isWordInDeck(wordId)) return [wordId, 'deck'];
            if (await isWordKnown(wordId)) return [wordId, 'known'];
            return [wordId, 'none'];
        })).then(entries => { if (!cancelled) setSavedStatuses(new Map(entries)); });
        return () => { cancelled = true; };
    }, [keywords, isWordInDeck, isWordKnown, guest]);

    // Saved status, or the choice made in this reading
    const wordStatuses = useMemo(() => {
        const statuses = new Map<string, WordStatus>();
        for (const wordId of keywords) {
            const saved = savedStatuses?.get(wordId) ?? 'none';
            statuses.set(wordId, saved !== 'none' ? saved : addedWords.has(wordId) ? 'deck' : knownWords.has(wordId) ? 'known' : 'none');
        }
        return statuses;
    }, [keywords, savedStatuses, addedWords, knownWords]);
    const wordStatus = selectedWord ? wordStatuses.get(selectedWord.id) ?? 'none' : 'none';
    const selectedIsSaved = !!selectedWord && (savedStatuses?.get(selectedWord.id) ?? 'none') !== 'none';

    // The Spanish of each sentence, written by hand in A1 and A2. Shown by default in A1, where
    // whoever starts from zero reads; the learner's choice is remembered
    // B1 and B2 have theirs from the AI, once per story (cached on the server), and only when asked
    // for in that story: the remembered choice alone never spends one of the day's translations
    const [spanishChoice, setSpanishChoice] = useState(readSpanishChoice);
    const translatedByAI = !!staticStory && !staticStory.translation && !!authUser && (staticStory.level === 'B1' || staticStory.level === 'B2');
    const [askedAIFor, setAskedAIFor] = useState<string | null>(null);
    const aiTranslation = useQuery({
        queryKey: ['story-translation', staticStory?.id],
        queryFn: () => translateStory(staticStory!.id),
        enabled: translatedByAI && askedAIFor === staticStory?.id,
        staleTime: Infinity,
        gcTime: Infinity,
        // The day's limit stays reached until tomorrow: asking again only spends the wait
        retry: (failures, error) => failures < 1 && !isLimitReached(error),
    });
    // Only a translation that lines up with today's sentences and questions: an old one (the story was
    // edited since) would show the wrong Spanish under a sentence
    const fetchedTranslation = staticStory?.translation ?? aiTranslation.data;
    const translation = fetchedTranslation && storyContent
        && fetchedTranslation.sentences.length === storySentences(storyContent).length
        && (fetchedTranslation.questions?.length ?? 0) === (story?.questions?.length ?? 0)
        ? fetchedTranslation : undefined;
    const showSpanish = !!translation && (spanishChoice ?? story?.level === 'A1');
    const waitingForAI = translatedByAI && !translation && askedAIFor === staticStory?.id && !aiTranslation.isError;
    const toggleSpanish = () => {
        let next: boolean;
        if (translatedByAI && !translation) {
            // Asked for while the AI one loads: pressing again turns it off
            next = !waitingForAI;
            setAskedAIFor(next ? staticStory!.id : null);
        } else {
            next = !showSpanish;
        }
        setSpanishChoice(next);
        try { localStorage.setItem(SPANISH_KEY, next ? 'on' : 'off'); } catch { /* not kept */ }
    };

    // --- Sentences: the same split the recording was cut with (src/lib/storySentences.ts) ---
    // Keyed on the text too, so the sentences (and the shadowing effect below) don't change every render
    const { processedHTML, sentences } = useMemo(() => {
        if (!storyContent) return { processedHTML: '', sentences: [] as string[] };
        const html = wrapStorySentences(storyContent, (part, i) => {
            const spanish = showSpanish && translation?.sentences[i];
            return `<span class="story-sentence transition-all duration-300 rounded px-0.5 cursor-pointer hover:bg-[var(--color-primary)]/5" data-sentence-idx="${i}">${part}</span>`
                + (spanish ? `<span class="story-sentence-es" data-sentence-idx="${i}">${escapeHtml(spanish)}</span>` : '');
        });
        return { processedHTML: html, sentences: storySentences(storyContent) };
    }, [storyContent, showSpanish, translation]);

    // Static stories have a recording (npm run content:audio); AI stories use the browser's voices
    const recording = useMemo(
        () => (staticStory ? audioFor(storyKey(sentences, SPEECH_RATE[staticStory.level])) : undefined),
        [staticStory, sentences],
    );
    const playback = useStoryPlayback({ sentences, level: story?.level ?? 'A1', accent, audio: recording });
    const { isPlaying, currentIndex: currentSentenceIdx, rate: playbackRate, setRate: setPlaybackRate, seek: seekSentence } = playback;

    // --- Sentence Highlighting and Auto-Scroll ---
    useEffect(() => {
        const allSpans = document.querySelectorAll('.story-sentence');
        allSpans.forEach(span => {
            span.classList.remove('bg-[var(--color-primary)]/10', 'text-[var(--color-primary)]', 'font-semibold', 'border-b-2', 'border-[var(--color-primary)]');
        });
        
        if (currentSentenceIdx !== -1) {
            const activeSpan = document.querySelector(`.story-sentence[data-sentence-idx="${currentSentenceIdx}"]`);
            if (activeSpan) {
                activeSpan.classList.add('bg-[var(--color-primary)]/10', 'text-[var(--color-primary)]', 'font-semibold', 'border-b-2', 'border-[var(--color-primary)]');
                activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentSentenceIdx]);

    const handlePlayPause = () => {
        if (isListening) stopListening();
        playback.toggle();
    };
    const handlePrevSentence = () => playback.seek(currentSentenceIdx - 1);
    const handleNextSentence = () => playback.seek(currentSentenceIdx + 1);

    // --- Shadowing Handlers ---
    const handleStartShadowing = () => {
        playback.pause();
        resetTranscript();
        startListening();
    };

    const handleToggleShadowing = () => {
        if (!showShadowing) playback.pause();
        setShowShadowing(!showShadowing);
        setComparedWords([]);
        setHasPracticed(false);
        resetTranscript();
    };

    useEffect(() => {
        if (!transcript || currentSentenceIdx === -1) return;
        
        const target = sentences[currentSentenceIdx];
        const cleanWord = (w: string) => w.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();
        
        const targetWords = target.split(/\s+/).filter(Boolean);
        const transcriptWords = transcript.split(/\s+/).map(cleanWord).filter(Boolean);
        
        let matchCount = 0;
        const compared = targetWords.map(word => {
            const cleaned = cleanWord(word);
            const match = transcriptWords.includes(cleaned);
            if (match) matchCount++;
            return { word, match };
        });
        
        setComparedWords(compared);
        setShadowingScore(Math.round((matchCount / targetWords.length) * 100));
        setHasPracticed(true);
    }, [transcript, currentSentenceIdx, sentences]);

    // Where the open card's word was tapped: its sentence and what it means there
    const [wordPlace, setWordPlace] = useState<{ sentence: number; gloss: string | null } | null>(null);

    const handleWordClick = useCallback(async (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        
        // Check if sentence span was clicked to jump index
        const sentenceElement = target.closest('.story-sentence');
        if (sentenceElement) {
            const sIdx = parseInt(sentenceElement.getAttribute('data-sentence-idx') || '-1', 10);
            if (sIdx !== -1 && sIdx !== currentSentenceIdx) seekSentence(sIdx);
        }

        const wordId = target.getAttribute('data-word');
        if (!wordId) return;

        const vocab = (isAIStory ? vocabMap.get(wordId) : vocabulary?.get(wordId)) as Vocabulary | undefined;
        const sentence = parseInt(sentenceElement?.getAttribute('data-sentence-idx') ?? '-1', 10);
        setWordPlace(sentence >= 0 ? { sentence, gloss: target.getAttribute('data-gloss') } : null);
        if (vocab) setSelectedWord(vocab);
    }, [currentSentenceIdx, seekSentence, vocabMap, isAIStory, vocabulary]);

    const handleChipClick = useCallback((wordId: string) => {
        const vocab = vocabMap?.get(wordId);
        setWordPlace(null);
        if (vocab) setSelectedWord(vocab);
    }, [vocabMap]);

    // The card confirms the choice for a moment and then closes by itself
    const [justChose, setJustChose] = useState<'deck' | 'known' | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => {
        setJustChose(null);
        return () => clearTimeout(closeTimer.current);
    }, [selectedWord]);

    // Marking only records the choice; it can be changed until the story is completed
    const chooseForWord = (choice: 'deck' | 'known') => {
        if (!selectedWord) return;
        const id = selectedWord.id;
        const without = (set: Set<string>) => { const next = new Set(set); next.delete(id); return next; };
        setAddedWords(prev => (choice === 'deck' ? new Set(prev).add(id) : without(prev)));
        setKnownWords(prev => (choice === 'known' ? new Set(prev).add(id) : without(prev)));
        setJustChose(choice);
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setSelectedWord(null), WORD_CARD_CLOSE_MS);
    };

    // Every key word must be marked first: the ones left are listed so the learner can finish
    const unmarkedWords = keywords.filter(id => vocabMap.has(id) && wordStatuses.get(id) === 'none');

    // `marked`: the words left, all marked at once from the sheet, so one tap finishes the story
    const handleComplete = async (marked?: { choice: 'deck' | 'known'; ids: string[] }) => {
        if (!storyId || !savedStatuses) return;
        const deck = marked?.choice === 'deck' ? new Set([...addedWords, ...marked.ids]) : addedWords;
        const known = marked?.choice === 'known' ? new Set([...knownWords, ...marked.ids]) : knownWords;
        if (marked) {
            setAddedWords(deck);
            setKnownWords(known);
            setMissingWords(null);
        } else if (unmarkedWords.length) {
            setMissingWords(unmarkedWords);
            return;
        }
        if (!authUser) {
            saveGuestStory(storyId, [...deck], [...known]);
            setCompleted(true);
            return;
        }
        // Only the words chosen in this reading, never ones that were already saved
        const unsaved = (ids: Set<string>) => [...ids].filter(id => savedStatuses.get(id) === 'none');
        setSaving(true);
        try {
            await saveStoryWords(storyId, unsaved(deck), unsaved(known));
            const { offlineInsert } = await import('../lib/offlineMutation');
            const read = {
                user_id: authUser.id,
                story_id: storyId,
                completed_at: new Date().toISOString(),
                words_added: deck.size,
            };
            // Read once per story: a story read before keeps its first record, and only the first reading counts as study
            const firstReading = !qc.getQueryData<ReadStoryRow[]>(['readStories', authUser.id])?.some(r => r.story_id === storyId);
            await offlineInsert('read_stories', read, { onConflict: 'user_id,story_id', ignoreDuplicates: true });
            // Shown as read right away, offline too, so the lesson that sent here can go on
            qc.setQueryData<ReadStoryRow[]>(['readStories', authUser.id], prev =>
                prev?.some(r => r.story_id === storyId) ? prev : [...(prev ?? []), { id: -1, ...read } as ReadStoryRow]);
            qc.invalidateQueries({ queryKey: ['readStories'] });
            if (firstReading) void recordActivity('story');
            setCompleted(true);
        } catch {
            notice.error({ title: t('reader.saveFailed') });
        } finally {
            setSaving(false);
        }
    };

    // Words in the text show whether they are in the deck
    useEffect(() => {
        const container = document.getElementById('story-content');
        container?.querySelectorAll('span[data-word]').forEach(span => {
            span.classList.toggle('in-deck', wordStatuses.get(span.getAttribute('data-word') ?? '') === 'deck');
        });
    // `vocabulary`: the text only appears once the decks are in, and must be marked then too
    }, [wordStatuses, processedHTML, vocabulary]);

    // Waits for the story's level and its words' decks, so a tapped word always has its card
    if ((!story && storyLevel && !levelContent) || (story && !isAIStory && !vocabulary)) return <PageLoader />;

    if (!story) {
        return (
            <div className="text-center py-16 space-y-6">
                <p className="text-[var(--color-on-surface-muted)] text-lg">{t('reader.storyNotFound', 'Historia no encontrada')}</p>
                <button
                    onClick={() => navigate('/learn')}
                    className="btn-primary px-8 py-3.5"
                >
                    {t('reader.backToStories', 'Volver a historias')}
                </button>
            </div>
        );
    }

    if (completed && guest) {
        return (
            <LazyMotion features={domAnimation}>
                <m.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="app-specimen mx-auto my-6">
                    <PlantCircle species={species} size="lg" height={44} />
                    <h2 className="text-3xl font-black tracking-tight">{t('reader.storyCompleted')}</h2>
                    <p className="text-[var(--color-on-surface-muted)] text-base max-w-md mx-auto">
                        {t('trial.saveWords', { count: addedWords.size })}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center pt-6">
                        <button onClick={() => navigate('/auth')} className="btn-primary px-7 py-3.5 text-sm">
                            {t('trial.createAccount')}
                        </button>
                        <button
                            onClick={() => navigate('/probar/nivel')}
                            className="rounded-full border-[1.5px] border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface)] hover:border-[var(--color-on-surface-muted)] px-7 py-3.5 font-bold transition-colors duration-300"
                        >
                            {t('trial.tryPlacement')}
                        </button>
                    </div>
                </m.div>
            </LazyMotion>
        );
    }

    if (completed) {
        return (
            <LazyMotion features={domAnimation}>
                <m.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="app-specimen mx-auto my-6"
                >
                    <PlantCircle species={species} size="lg" height={44} />
                    <h2 className="text-3xl font-black tracking-tight">{t('reader.storyCompleted')}</h2>
                    <p className="text-[var(--color-on-surface-muted)] text-base">
                        {addedWords.size} {t('reader.wordsAdded')}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center pt-6">
                        {returnTo && (
                            <button
                                onClick={() => navigate(returnTo)}
                                className="btn-primary px-7 py-3.5"
                            >
                                {t('reader.backToLesson')}
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/learn')}
                            className="rounded-full border-[1.5px] border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface)] hover:border-[var(--color-on-surface-muted)] px-7 py-3.5 font-bold transition-colors duration-300"
                        >
                            {t('reader.backToStories')}
                        </button>
                        {!returnTo && (
                            <button
                                onClick={() => navigate('/review')}
                                className="btn-primary px-7 py-3.5"
                            >
                                {t('dashboard.startReview')}
                            </button>
                        )}
                    </div>
                </m.div>
            </LazyMotion>
        );
    }

    return (
        <LazyMotion features={domAnimation}>
        {/* The bottom room keeps the last button above the floating player */}
        <div className="space-y-8 pb-44">
            {/* Story header */}
            <div className="flex items-center gap-4">
                <BackButton to={guest ? '/' : returnTo ?? '/learn'} />
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

            {/* Tap hint, and the Spanish of every sentence for whoever needs it */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[12rem] bg-[var(--color-primary)]/8 text-[var(--color-primary)] text-xs py-3 px-5 rounded-full text-center shadow-[var(--shadow-card)]">
                    <Lightbulb className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />{t(translation ? 'reader.tapToTranslateSentence' : 'reader.tapToTranslate')}
                </div>
                {(translation || translatedByAI) && (
                    <button
                        type="button"
                        onClick={toggleSpanish}
                        aria-pressed={showSpanish || waitingForAI}
                        aria-busy={aiTranslation.isFetching}
                        className="story-spanish-toggle"
                    >
                        <Languages className="w-4 h-4" aria-hidden="true" />
                        {aiTranslation.isFetching ? t('reader.translating') : t('reader.showSpanish')}
                    </button>
                )}
                {askedAIFor === staticStory?.id && aiTranslation.isError && (
                    <p role="alert" className="w-full text-xs text-[var(--color-error)]">
                        {t(isLimitReached(aiTranslation.error) ? 'reader.translateLimit' : 'reader.translateFailed')}
                    </p>
                )}
            </div>

            {/* Story content */}
            <div
                id="story-content"
                role="document"
                tabIndex={0}
                onClick={handleWordClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWordClick(e as any); }}
                className={`app-sheet p-8 text-lg leading-relaxed tracking-wide focus:outline-none transition-all duration-300 pb-48 sm:pb-36 lg:pb-32 ${showSpanish ? 'story-bilingual' : ''}`}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(processedHTML, {
                        ALLOWED_TAGS: ['p', 'span', 'br'],
                        ALLOWED_ATTR: ['data-word', 'data-gloss', 'class', 'data-sentence-idx'],
                    })
                }}
            />

            {/* Key vocabulary zone */}
            {keywords.length > 0 && vocabMap && (
                <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-7 space-y-4 shadow-[var(--shadow-card)]"
                >
                    <h3 className="text-sm font-bold text-[var(--color-on-surface-muted)] flex items-center gap-2">
                        <BookOpen className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />{t('reader.keyVocabulary')}
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
                                    {status === 'deck' && <Check className="w-3 h-3" aria-hidden="true" />}
                                    {status === 'known' && <Check className="w-3 h-3" aria-hidden="true" />}
                                    <span>{wordId}</span>
                                    <span className="chip-translation">— {vocab.translations[0]}</span>
                                </button>
                            );
                        })}
                    </div>
                </m.div>
            )}

            {/* Shadowing practice widget */}
            <AnimatePresence>
                {showShadowing && currentSentenceIdx !== -1 && (
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)] border border-[var(--color-primary)]/10 space-y-5 text-center transition-all duration-300"
                    >
                        <div className="flex justify-between items-center text-xs shrink-0">
                            <span className="font-bold text-[var(--color-primary)] flex items-center gap-1.5">
                                <Headphones className="w-4 h-4" /> Práctica de Shadowing (Pro)
                            </span>
                            <button
                                onClick={handleToggleShadowing}
                                className="text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-all font-bold text-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            <p className="text-[10px] text-[var(--color-on-surface-muted)]">Oración objetivo:</p>
                            <div className="bg-[var(--color-surface-container-low)] p-4 rounded-2xl">
                                {comparedWords.length > 0 ? (
                                    <div className="flex flex-wrap gap-x-1.5 gap-y-1 justify-center text-base font-extrabold leading-relaxed">
                                        {comparedWords.map((item, idx) => (
                                            <span
                                                key={idx}
                                                className={item.match ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}
                                            >
                                                {item.word}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-base font-bold text-[var(--color-on-surface)] leading-relaxed italic">
                                        "{sentences[currentSentenceIdx]}"
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-4">
                            {isListening ? (
                                <div className="flex items-center gap-1.5 h-8 justify-center">
                                    {[...Array(6)].map((_, i) => (
                                        <m.div
                                            key={i}
                                            animate={{ 
                                                scaleY: [1, 2.8, 0.8, 2.2, 1],
                                                backgroundColor: ['var(--color-primary)', 'var(--color-primary-container)', 'var(--color-primary)']
                                            }}
                                            transition={{ 
                                                repeat: Infinity, 
                                                duration: 0.8, 
                                                delay: i * 0.12,
                                                ease: "easeInOut"
                                            }}
                                            className="w-1.5 bg-[var(--color-primary)] rounded-full h-4 origin-center"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-6 text-xs text-[var(--color-on-surface-muted)] flex items-center justify-center gap-1.5">
                                    {hasPracticed ? (
                                        shadowingScore === 100 ? (
                                            <span className="text-[var(--color-success)] font-bold flex items-center gap-1">
                                                <Trophy className="w-4 h-4 fill-[var(--color-success)]/10" /> ¡Pronunciación Perfecta! 100% de acierto
                                            </span>
                                        ) : (
                                            <span className="font-semibold text-[var(--color-on-surface)]">
                                                Puntuación: {shadowingScore}% de coincidencia
                                            </span>
                                        )
                                    ) : (
                                        'Presiona el micrófono y lee la oración en voz alta'
                                    )}
                                </div>
                            )}
                            
                            <button
                                onClick={isListening ? stopListening : handleStartShadowing}
                                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer ${
                                    isListening 
                                        ? 'bg-[var(--color-error)] hover:bg-[var(--color-error)] text-[var(--color-on-error)] animate-pulse' 
                                        : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-[var(--color-on-primary)]'
                                }`}
                            >
                                <Mic className="w-6 h-6" />
                            </button>
                        </div>

                        {transcript && (
                            <div className="space-y-1.5 text-left bg-[var(--color-surface-container)]/30 p-3.5 rounded-2xl">
                                <p className="text-[9.5px] text-[var(--color-on-surface-muted)]">Lo que escuchó la IA:</p>
                                <p className="text-xs text-[var(--color-on-surface)] leading-relaxed italic">
                                    "{transcript}"
                                </p>
                            </div>
                        )}
                    </m.div>
                )}
            </AnimatePresence>

            {/* Comprehension questions, answered while reading (completing the story ends the reading) */}
            {!!story.questions?.length && <StoryQuestions questions={story.questions} translation={translation} sentences={sentences} showSpanish={showSpanish} />}

            {/* Complete button */}
            <div className="space-y-2">
                <p className="text-center text-xs font-semibold text-[var(--color-on-surface-muted)]" aria-live="polite">
                    {unmarkedWords.length
                        ? t('reader.wordsLeft', { count: unmarkedWords.length })
                        : t('reader.allWordsMarked')}
                </p>
                <button
                    onClick={() => void handleComplete()}
                    disabled={!savedStatuses || saving}
                    className="btn-primary w-full py-4 text-base tracking-wide disabled:opacity-60 disabled:pointer-events-none"
                >
                    <Check className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />{t('reader.storyCompleted')}
                </button>
            </div>

            {/* Words still to mark: tapping one opens its card. On the body, so the backdrop covers the sidebar too */}
            {createPortal(<AnimatePresence>
                {missingWords && (
                    <>
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMissingWords(null)}
                            className="fixed inset-0 bg-[color-mix(in_oklch,var(--color-level-ink)_40%,transparent)] z-[70]"
                        />
                        <m.div
                            ref={missingDialogRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="missing-words-title"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-4 left-4 right-4 z-[75]"
                        >
                            <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-7 shadow-[var(--shadow-float)] space-y-4 max-w-lg mx-auto max-h-[60vh] overflow-y-auto">
                                <h3 id="missing-words-title" className="text-lg font-black tracking-tight">{t('reader.missingTitle', { count: missingWords.length })}</h3>
                                <p className="text-sm text-[var(--color-on-surface-muted)]">{t('reader.missingHint')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {missingWords.filter(id => wordStatuses.get(id) === 'none').map(id => (
                                        <button
                                            key={id}
                                            onClick={() => { setMissingWords(null); handleChipClick(id); }}
                                            className="vocab-chip"
                                        >
                                            <span>{id}</span>
                                            <span className="chip-translation">— {vocabMap.get(id)?.translations[0]}</span>
                                        </button>
                                    ))}
                                </div>
                                {/* Every word left with one tap: whoever starts from zero would otherwise open each one */}
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <button
                                        onClick={() => void handleComplete({ choice: 'deck', ids: missingWords })}
                                        disabled={saving}
                                        autoFocus
                                        className="btn-primary py-3 text-sm"
                                    >
                                        {t('reader.addAllAndFinish')}
                                    </button>
                                    <button
                                        onClick={() => void handleComplete({ choice: 'known', ids: missingWords })}
                                        disabled={saving}
                                        className="btn-secondary py-3 text-sm"
                                    >
                                        {t('reader.knowAllAndFinish')}
                                    </button>
                                </div>
                                <button
                                    onClick={() => setMissingWords(null)}
                                    className="w-full rounded-full border-[1.5px] border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface)] hover:border-[var(--color-on-surface-muted)] py-3 font-bold text-sm"
                                >
                                    {t('common.close')}
                                </button>
                            </div>
                        </m.div>
                    </>
                )}
            </AnimatePresence>, document.body)}

            {/* Floating Audiobook Player Bar */}
            <div className="fixed bottom-6 left-4 right-4 z-[50] max-w-lg mx-auto bg-[var(--color-card)]/90 rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-float)] border border-[var(--color-surface-container-high)] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 pb-8 sm:pb-4">
                {!playback.usingRecording && <NoEnglishVoices />}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[var(--color-primary)] font-bold">Modo Audiolibro</p>
                        <p className="text-xs text-[var(--color-on-surface)] truncate font-medium">
                            {currentSentenceIdx !== -1 ? sentences[currentSentenceIdx] : 'Selecciona una oración para comenzar'}
                        </p>
                        {/* A tapped sentence says what it means, also with the Spanish hidden in the text */}
                        {currentSentenceIdx !== -1 && translation?.sentences[currentSentenceIdx] && (
                            <p className="text-xs text-[var(--color-on-surface-muted)] line-clamp-2" lang="es">
                                {translation.sentences[currentSentenceIdx]}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Accent Selector */}
                        <button
                            onClick={() => {
                                const next = accent === 'US' ? 'UK' : accent === 'UK' ? 'AU' : 'US';
                                setAccent(next);
                            }}
                            className="w-14 h-8 rounded-xl bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                            title="Acento del sintetizador"
                        >
                            {accent}
                        </button>

                        <button
                            onClick={() => {
                                setPlaybackRate(prev => prev === 0.75 ? 1 : prev === 1 ? 1.25 : 0.75);
                            }}
                            className="w-8 h-8 rounded-xl bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] text-[10px] font-black transition-all cursor-pointer"
                            title="Velocidad de reproducción"
                        >
                            {playbackRate}x
                        </button>
                        <button
                            onClick={handleToggleShadowing}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                showShadowing 
                                    ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md' 
                                    : 'bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]'
                            }`}
                            title="Practicar Shadowing"
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={handlePrevSentence}
                        disabled={currentSentenceIdx <= 0}
                        className="p-2.5 rounded-full bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>
                    
                    <button
                        onClick={handlePlayPause}
                        className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center shadow-md active:scale-95 hover:shadow-lg transition-all cursor-pointer"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
                    </button>
                    
                    <button
                        onClick={handleNextSentence}
                        disabled={currentSentenceIdx === -1 || currentSentenceIdx >= sentences.length - 1}
                        className="p-2.5 rounded-full bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Word popup, on the body like the list above */}
            {createPortal(<AnimatePresence>
                {selectedWord && (
                    <>
                        {/* Backdrop */}
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedWord(null)}
                            className="fixed inset-0 bg-[color-mix(in_oklch,var(--color-level-ink)_40%,transparent)] z-[70]"
                        />
                        <m.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-4 left-4 right-4 z-[75]"
                        >
                            <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-7 shadow-[var(--shadow-float)] space-y-4 max-w-lg mx-auto max-h-[55vh] overflow-y-auto">
                                <div className="flex justify-between items-start gap-3">
                                    <SpeakButton text={selectedWord.id} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-black tracking-tight text-accent-blue">{selectedWord.id}</h3>
                                        {selectedWord.phonetic && (
                                            <p className="text-sm text-[var(--color-on-surface-muted)] mt-0.5">{selectedWord.phonetic}</p>
                                        )}
                                        {/* Whoever starts can't read IPA yet: the sound in Spanish letters */}
                                        {selectedWord.cefrLevel === 'A1' && selectedWord.phonetic && (
                                            <p className="sounds-like">{t('audio.soundsLike')} <b>{soundsLike(selectedWord.phonetic)}</b></p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelectedWord(null)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)] transition-all duration-300 text-lg leading-none"
                                    >
                                        ×
                                    </button>
                                </div>

                                {wordPlace?.gloss && (
                                    <div className="bg-[var(--color-primary-container)] rounded-2xl p-4">
                                        <p className="text-xs text-[var(--color-on-surface-muted)] mb-1">{t('reader.meansHere')}</p>
                                        <p className="text-base font-bold">{wordPlace.gloss}</p>
                                    </div>
                                )}
                                <div className="bg-[var(--color-surface-container)] rounded-2xl p-4">
                                    <p className="text-xs text-[var(--color-on-surface-muted)] mb-1">{t('reader.translation')}</p>
                                    <p className="text-base font-bold">{selectedWord.translations.join(', ')}</p>
                                </div>
                                {/* The dictionary meaning can mislead in a phrase: the whole sentence, in Spanish */}
                                {wordPlace && translation?.sentences[wordPlace.sentence] && (
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4">
                                        <p className="text-xs text-[var(--color-on-surface-muted)] mb-1">{t('reader.inThisSentence')}</p>
                                        <p className="text-sm" lang="en">{sentences[wordPlace.sentence]}</p>
                                        <p className="text-sm text-[var(--color-on-surface-muted)] mt-1">{translation.sentences[wordPlace.sentence]}</p>
                                    </div>
                                )}

                                {selectedWord.examples.length > 0 && (
                                    <div className="bg-[var(--color-surface-container)] rounded-2xl p-4">
                                        <p className="text-xs text-[var(--color-on-surface-muted)] mb-1">{t('reader.example')}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="flex-1 text-sm text-[var(--color-on-surface-muted)] italic" lang="en">"{selectedWord.examples[0]}"</p>
                                            <SpeakButton text={selectedWord.examples[0]} />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    {selectedIsSaved && wordStatus === 'deck' ? (
                                        <div className="flex-1 bg-[var(--color-primary)]/12 text-[var(--color-primary)] text-center py-3 rounded-full text-sm font-bold">
                                            <Check className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />{t('reader.alreadyAdded')}
                                        </div>
                                    ) : selectedIsSaved && wordStatus === 'known' ? (
                                        <div className="flex-1 bg-accent-blue/12 text-accent-blue text-center py-3 rounded-full text-sm font-bold">
                                            <Check className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />{t('reader.alreadyKnown')}
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => chooseForWord('deck')}
                                                aria-pressed={wordStatus === 'deck'}
                                                // Until saved words are known, a choice could repeat one
                                                disabled={!savedStatuses}
                                                className={`flex-1 py-3 rounded-full font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] text-sm ${
                                                    wordStatus === 'deck'
                                                        ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:shadow-[var(--shadow-elevated)]'
                                                        : 'rounded-full border-[1.5px] border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface)] hover:border-[var(--color-on-surface-muted)]'
                                                }`}
                                            >
                                                {wordStatus === 'deck' ? <ChoiceCheck pop={justChose === 'deck'} /> : '+ '}{t('reader.addToDeck')}
                                            </button>
                                            <button
                                                onClick={() => chooseForWord('known')}
                                                aria-pressed={wordStatus === 'known'}
                                                disabled={!savedStatuses}
                                                className={`flex-1 py-3 rounded-full font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] text-sm ${
                                                    wordStatus === 'known'
                                                        ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:shadow-[var(--shadow-elevated)]'
                                                        : 'rounded-full border-[1.5px] border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface)] hover:border-[var(--color-on-surface-muted)]'
                                                }`}
                                            >
                                                {wordStatus === 'known' ? <ChoiceCheck pop={justChose === 'known'} /> : <Check className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />}{t('reader.alreadyKnown')}
                                            </button>
                                        </>
                                    )}
                                </div>
                                {justChose ? (
                                    <m.p
                                        role="status"
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center text-sm font-bold text-[var(--color-primary)]"
                                    >
                                        <Check className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />
                                        {t(justChose === 'deck' ? 'reader.addedFeedback' : 'reader.knownFeedback')}
                                    </m.p>
                                ) : !selectedIsSaved && wordStatus !== 'none' && (
                                    <p className="text-center text-xs text-[var(--color-on-surface-muted)]">{t('reader.savedOnComplete')}</p>
                                )}
                            </div>
                        </m.div>
                    </>
                )}
            </AnimatePresence>, document.body)}
        </div>
        </LazyMotion>
    );
}

/** The check of the option just chosen grows in, so the tap reads as taken. */
function ChoiceCheck({ pop }: { pop: boolean }) {
    return (
        <m.span
            className="inline-block -mt-0.5 mr-1 align-middle"
            initial={pop ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        >
            <Check className="w-4 h-4" aria-hidden="true" />
        </m.span>
    );
}
