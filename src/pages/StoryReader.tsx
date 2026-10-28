import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { Vocabulary } from '../lib/db';
import { getStory, getVocab, getVocabMap } from '../data';
import { useAuth } from '../lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useCards } from '../hooks/useCards';
import { toast } from '../lib/toast';
import DOMPurify from 'dompurify';
import LevelBadge from '../components/ui/LevelBadge';
import { useSpeech } from '../hooks/useSpeech';
import { Play, Pause, SkipForward, SkipBack, Mic, Headphones, Trophy, Lightbulb, BookOpen, Check } from 'lucide-react';
import BackButton from '../components/ui/BackButton';
import PlantCircle from '../components/garden/PlantCircle';
import { useGardenPlant } from '../hooks/useGardenPlant';
import type { ReadStoryRow } from '../lib/database.types';
import { useDialogKeys } from '../hooks/useDialogKeys';

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

export default function StoryReader() {
    const { species } = useGardenPlant();
    const { storyId } = useParams<{ storyId: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user: authUser } = useAuth();
    const qc = useQueryClient();
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

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSentenceIdx, setCurrentSentenceIdx] = useState(-1);
    const [playbackRate, setPlaybackRate] = useState(1); // 0.75, 1, 1.25
    const [accent, setAccent] = useState<'US' | 'UK' | 'AU'>('US');
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const [showShadowing, setShowShadowing] = useState(false);
    const [comparedWords, setComparedWords] = useState<{ word: string; match: boolean }[]>([]);
    const [shadowingScore, setShadowingScore] = useState(0);
    const [hasPracticed, setHasPracticed] = useState(false);

    // Stable refs for play state synchronization
    const isPlayingRef = useRef(false);
    const ignoreNextEndRef = useRef(false);

    // Cache of English-only voices, keyed by accent region
    const cachedVoicesRef = useRef<Record<string, SpeechSynthesisVoice | null>>({});
    const [voicesReady, setVoicesReady] = useState(false);
    const hasShownVoiceWarning = useRef(false);

    // Eagerly load and cache English voices on mount
    useEffect(() => {
        // Known English voice name fragments (Windows, Chrome, macOS, Android)
        const KNOWN_EN_NAMES = [
            'david', 'zira', 'mark', 'hazel', 'susan', 'george', 'james',  // Windows
            'google us', 'google uk', 'google english',                      // Chrome
            'samantha', 'alex', 'daniel', 'karen', 'moira', 'tessa',       // macOS
            'english',                                                       // generic
        ];

        const norm = (s: string) => s.toLowerCase().replace(/_/g, '-');
        const nameNorm = (s: string) => s.toLowerCase();

        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            if (allVoices.length === 0) return;

            console.log('[Voxie TTS] ALL system voices:', allVoices.map(v => `${v.name} (${v.lang}) local=${v.localService}`));

            // Strategy 1: Filter by lang code
            let englishVoices = allVoices.filter(v => norm(v.lang).startsWith('en'));

            // Strategy 2: If no lang-based match, search by known English voice names
            if (englishVoices.length === 0) {
                console.warn('[Voxie TTS] No voices with en-* lang code. Searching by name...');
                englishVoices = allVoices.filter(v =>
                    KNOWN_EN_NAMES.some(name => nameNorm(v.name).includes(name))
                );
            }

            console.log('[Voxie TTS] English voices found:', englishVoices.length, englishVoices.map(v => `${v.name} (${v.lang})`));

            if (englishVoices.length === 0 && !hasShownVoiceWarning.current) {
                hasShownVoiceWarning.current = true;
                // Show user-friendly instructions
                toast.error({
                    title: 'No se encontraron voces en inglés',
                    description: 'Tu sistema no tiene voces en inglés instaladas. Ve a Configuración → Hora e idioma → Voz → Agregar voces → Inglés (Estados Unidos). Luego reinicia el navegador.',
                });
            }

            const findBest = (region: string, altRegion?: string) => {
                // Priority 1: exact lang match, prefer local
                const exactLocal = englishVoices.find(v => norm(v.lang) === `en-${region}` && v.localService);
                if (exactLocal) return exactLocal;
                // Priority 2: exact lang match
                const exact = englishVoices.find(v => norm(v.lang) === `en-${region}`);
                if (exact) return exact;
                // Priority 3: alt region
                if (altRegion) {
                    const alt = englishVoices.find(v => norm(v.lang) === `en-${altRegion}`);
                    if (alt) return alt;
                }
                // Priority 4: any voice with region in name
                const byName = englishVoices.find(v => nameNorm(v.name).includes(region));
                if (byName) return byName;
                // Priority 5: any English voice
                return englishVoices[0] || null;
            };

            cachedVoicesRef.current = {
                US: findBest('us'),
                UK: findBest('gb', 'uk'),
                AU: findBest('au'),
            };

            const usVoice = cachedVoicesRef.current.US;
            const ukVoice = cachedVoicesRef.current.UK;
            const auVoice = cachedVoicesRef.current.AU;
            console.log(`[Voxie TTS] Cached → US: ${usVoice?.name ?? 'NONE'} | UK: ${ukVoice?.name ?? 'NONE'} | AU: ${auVoice?.name ?? 'NONE'}`);

            setVoicesReady(true);
        };

        // Voices may already be loaded
        loadVoices();

        // Chrome loads voices asynchronously, sometimes with delay
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        // Chrome sometimes needs a nudge - retry a few times
        const retries = [100, 500, 1500, 3000];
        const timers = retries.map(ms => setTimeout(loadVoices, ms));

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
            timers.forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    // Check static data first, then fallback to AI story from navigation state
    const aiStory = (location.state as any)?.aiStory;
    const staticStory = storyId ? getStory(storyId) : undefined;
    const story = staticStory ?? (aiStory ? { ...aiStory, level: aiStory.level as any } : undefined);
    const isAIStory = !staticStory && !!aiStory;

    // Keyed on the text: an AI story is a new object on every render
    const storyContent = story?.content;
    const keywords = useMemo(() => (storyContent ? extractKeywords(storyContent) : []), [storyContent]);

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

    // What the learner had saved before this reading, checked once per story
    useEffect(() => {
        if (!keywords.length) return;
        let cancelled = false;
        Promise.all(keywords.map(async (wordId): Promise<[string, WordStatus]> => {
            if (await isWordInDeck(wordId)) return [wordId, 'deck'];
            if (await isWordKnown(wordId)) return [wordId, 'known'];
            return [wordId, 'none'];
        })).then(entries => { if (!cancelled) setSavedStatuses(new Map(entries)); });
        return () => { cancelled = true; };
    }, [keywords, isWordInDeck, isWordKnown]);

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

    // --- HTML Sentence Wrapping ---
    const { processedHTML, sentences } = useMemo(() => {
        if (!story) return { processedHTML: '', sentences: [] };
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(story.content, 'text/html');
        const paragraphs = Array.from(doc.querySelectorAll('p'));
        
        let sentenceCounter = 0;
        const sentencesText: string[] = [];
        
        paragraphs.forEach(p => {
            const text = p.innerHTML;
            const parts = text.split(/(?<=[.!?])\s+/);
            
            const wrappedParts = parts.map(part => {
                if (!part.trim()) return '';
                const cleanTextForSpeech = part.replace(/<[^>]*>/g, '').trim();
                sentencesText.push(cleanTextForSpeech);
                const currentIdx = sentenceCounter++;
                return `<span class="story-sentence transition-all duration-300 rounded px-0.5 cursor-pointer hover:bg-[var(--color-primary)]/5" data-sentence-idx="${currentIdx}">${part}</span>`;
            });
            
            p.innerHTML = wrappedParts.join(' ');
        });
        
        return {
            processedHTML: doc.body.innerHTML,
            sentences: sentencesText
        };
    }, [story]);

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

    // --- Speech Synthesis Control ---
    const cancelSpeech = useCallback(() => {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            ignoreNextEndRef.current = true;
            window.speechSynthesis.cancel();
        }
    }, []);

    const speakSentence = useCallback((idx: number) => {
        if (idx < 0 || idx >= sentences.length) {
            setIsPlaying(false);
            setCurrentSentenceIdx(-1);
            return;
        }

        // Cancel any in-progress speech
        cancelSpeech();

        const text = sentences[idx];
        const utterance = new SpeechSynthesisUtterance(text);

        // CRITICAL: Set lang FIRST, before voice, to force English phonetics
        const langTag = accent === 'US' ? 'en-US' : accent === 'UK' ? 'en-GB' : 'en-AU';
        utterance.lang = langTag;
        utterance.rate = playbackRate;

        // Use pre-cached English voice for this accent
        const voice = cachedVoicesRef.current[accent] ?? null;
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang; // sync lang with actual voice
            console.log(`[Voxie TTS] Speaking with: ${voice.name} (${voice.lang})`);
        } else {
            console.warn(`[Voxie TTS] No cached voice for ${accent}, using lang tag: ${langTag}`);
        }

        utterance.onend = () => {
            if (ignoreNextEndRef.current) {
                ignoreNextEndRef.current = false;
                return;
            }
            if (!isPlayingRef.current) return;

            setCurrentSentenceIdx(prev => {
                const next = prev + 1;
                if (next < sentences.length) {
                    setTimeout(() => {
                        if (isPlayingRef.current) {
                            speakSentence(next);
                        }
                    }, 350);
                    return next;
                } else {
                    setIsPlaying(false);
                    return -1;
                }
            });
        };

        utterance.onerror = (e) => {
            if (ignoreNextEndRef.current) {
                ignoreNextEndRef.current = false;
                return;
            }
            console.error('[Voxie TTS] Speech error:', e);
            setIsPlaying(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [sentences, playbackRate, accent, voicesReady, cancelSpeech]);

    // Re-speak current sentence when accent or rate changes mid-playback
    useEffect(() => {
        if (isPlaying && currentSentenceIdx !== -1) {
            speakSentence(currentSentenceIdx);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accent, playbackRate]);

    const handlePlayPause = () => {
        if (isListening) {
            stopListening();
        }
        if (isPlaying) {
            cancelSpeech();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            const startIdx = currentSentenceIdx === -1 ? 0 : currentSentenceIdx;
            setCurrentSentenceIdx(startIdx);
            speakSentence(startIdx);
        }
    };

    const handlePrevSentence = () => {
        if (currentSentenceIdx > 0) {
            const prev = currentSentenceIdx - 1;
            setCurrentSentenceIdx(prev);
            if (isPlaying) {
                speakSentence(prev);
            }
        }
    };

    const handleNextSentence = () => {
        if (currentSentenceIdx < sentences.length - 1) {
            const next = currentSentenceIdx + 1;
            setCurrentSentenceIdx(next);
            if (isPlaying) {
                speakSentence(next);
            }
        }
    };

    // --- Shadowing Handlers ---
    const handleStartShadowing = () => {
        if (isPlaying) {
            cancelSpeech();
            setIsPlaying(false);
        }
        resetTranscript();
        startListening();
    };

    const handleToggleShadowing = () => {
        if (!showShadowing && isPlaying) {
            cancelSpeech();
            setIsPlaying(false);
        }
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const handleWordClick = useCallback(async (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        
        // Check if sentence span was clicked to jump index
        const sentenceElement = target.closest('.story-sentence');
        if (sentenceElement) {
            const sIdx = parseInt(sentenceElement.getAttribute('data-sentence-idx') || '-1', 10);
            if (sIdx !== -1 && sIdx !== currentSentenceIdx) {
                setCurrentSentenceIdx(sIdx);
                if (isPlaying) {
                    speakSentence(sIdx);
                }
            }
        }

        const wordId = target.getAttribute('data-word');
        if (!wordId) return;

        const vocab = (isAIStory ? vocabMap.get(wordId) : getVocab(wordId)) as Vocabulary | undefined;
        if (vocab) setSelectedWord(vocab);
    }, [currentSentenceIdx, isPlaying, speakSentence, vocabMap, isAIStory]);

    const handleChipClick = useCallback((wordId: string) => {
        const vocab = vocabMap?.get(wordId);
        if (vocab) setSelectedWord(vocab);
    }, [vocabMap]);

    // Marking only records the choice; it can be changed until the story is completed
    const chooseForWord = (choice: 'deck' | 'known') => {
        if (!selectedWord) return;
        const id = selectedWord.id;
        const without = (set: Set<string>) => { const next = new Set(set); next.delete(id); return next; };
        setAddedWords(prev => (choice === 'deck' ? new Set(prev).add(id) : without(prev)));
        setKnownWords(prev => (choice === 'known' ? new Set(prev).add(id) : without(prev)));
    };

    // Every key word must be marked first: the ones left are listed so the learner can finish
    const unmarkedWords = keywords.filter(id => vocabMap.has(id) && wordStatuses.get(id) === 'none');

    const handleComplete = async () => {
        if (!storyId || !savedStatuses || !authUser) return;
        if (unmarkedWords.length) {
            setMissingWords(unmarkedWords);
            return;
        }
        // Only the words chosen in this reading, never ones that were already saved
        const unsaved = (ids: Set<string>) => [...ids].filter(id => savedStatuses.get(id) === 'none');
        setSaving(true);
        try {
            await saveStoryWords(storyId, unsaved(addedWords), unsaved(knownWords));
            const { offlineInsert } = await import('../lib/offlineMutation');
            const read = {
                user_id: authUser.id,
                story_id: storyId,
                completed_at: new Date().toISOString(),
                words_added: addedWords.size,
            };
            // Read once per story: a story read before keeps its first record
            await offlineInsert('read_stories', read, { onConflict: 'user_id,story_id', ignoreDuplicates: true });
            // Shown as read right away, offline too, so the lesson that sent here can go on
            qc.setQueryData<ReadStoryRow[]>(['readStories', authUser.id], prev =>
                prev?.some(r => r.story_id === storyId) ? prev : [...(prev ?? []), { id: -1, ...read } as ReadStoryRow]);
            qc.invalidateQueries({ queryKey: ['readStories'] });
            setCompleted(true);
        } catch {
            toast.error({ title: t('reader.saveFailed') });
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
    }, [wordStatuses, processedHTML]);

    if (!story) {
        return (
            <div className="text-center py-16 space-y-6">
                <p className="text-[var(--color-on-surface-muted)] text-lg">{t('reader.storyNotFound', 'Historia no encontrada')}</p>
                <button
                    onClick={() => navigate('/learn')}
                    className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-8 py-3.5 rounded-full font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97]"
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
                    <PlantCircle species={species} size="lg" height={44} />
                    <h2 className="text-3xl font-black tracking-tight">{t('reader.storyCompleted')}</h2>
                    <p className="text-[var(--color-on-surface-muted)] text-base">
                        {addedWords.size} {t('reader.wordsAdded')}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center pt-6">
                        {returnTo && (
                            <button
                                onClick={() => navigate(returnTo)}
                                className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-7 py-3.5 rounded-full font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97]"
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
                                className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-7 py-3.5 rounded-full font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97]"
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
        <div className="space-y-8">
            {/* Story header */}
            <div className="flex items-center gap-4">
                <BackButton to={returnTo ?? '/learn'} />
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
                <Lightbulb className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />{t('reader.tapToTranslate')}
            </div>

            {/* Story content */}
            <div
                id="story-content"
                role="document"
                tabIndex={0}
                onClick={handleWordClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWordClick(e as any); }}
                className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-8 text-lg leading-relaxed tracking-wide focus:outline-none shadow-[var(--shadow-card)] transition-all duration-300 pb-48 sm:pb-36 lg:pb-32"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(processedHTML, {
                        ALLOWED_TAGS: ['p', 'span', 'br'],
                        ALLOWED_ATTR: ['data-word', 'class', 'data-sentence-idx'],
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
                            <span className="font-bold text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-1.5">
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
                            <p className="text-[10px] text-[var(--color-on-surface-muted)] uppercase tracking-wider">Oración objetivo:</p>
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
                                <p className="text-[9.5px] text-[var(--color-on-surface-muted)] uppercase tracking-wider">Lo que escuchó la IA:</p>
                                <p className="text-xs text-[var(--color-on-surface)] leading-relaxed italic">
                                    "{transcript}"
                                </p>
                            </div>
                        )}
                    </m.div>
                )}
            </AnimatePresence>

            {/* Complete button */}
            <div className="space-y-2">
                <p className="text-center text-xs font-semibold text-[var(--color-on-surface-muted)]" aria-live="polite">
                    {unmarkedWords.length
                        ? t('reader.wordsLeft', { count: unmarkedWords.length })
                        : t('reader.allWordsMarked')}
                </p>
                <button
                    onClick={handleComplete}
                    disabled={!savedStatuses || saving}
                    className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)] font-black py-4 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97] text-base tracking-wide disabled:opacity-60 disabled:pointer-events-none"
                >
                    <Check className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />{t('reader.storyCompleted')}
                </button>
            </div>

            {/* Words still to mark: tapping one opens its card */}
            <AnimatePresence>
                {missingWords && (
                    <>
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMissingWords(null)}
                            className="fixed inset-0 bg-[color-mix(in_oklch,var(--color-level-ink)_40%,transparent)] z-[55]"
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
                            className="fixed bottom-4 left-4 right-4 z-[60]"
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
                                <button
                                    onClick={() => setMissingWords(null)}
                                    autoFocus
                                    className="w-full rounded-full border-[1.5px] border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface)] hover:border-[var(--color-on-surface-muted)] py-3 font-bold text-sm"
                                >
                                    {t('common.close')}
                                </button>
                            </div>
                        </m.div>
                    </>
                )}
            </AnimatePresence>

            {/* Floating Audiobook Player Bar */}
            <div className="fixed bottom-6 left-4 right-4 z-[50] max-w-lg mx-auto bg-[var(--color-card)]/90 rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-float)] border border-[var(--color-surface-container-high)] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 pb-8 sm:pb-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-wider">Modo Audiolibro</p>
                        <p className="text-xs text-[var(--color-on-surface)] truncate font-medium">
                            {currentSentenceIdx !== -1 ? sentences[currentSentenceIdx] : 'Selecciona una oración para comenzar'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Accent Selector */}
                        <button
                            onClick={() => {
                                const next = accent === 'US' ? 'UK' : accent === 'UK' ? 'AU' : 'US';
                                setAccent(next);
                                toast.success({
                                    title: 'Acento cambiado',
                                    description: `Acento ajustado a: ${next === 'US' ? 'Inglés Americano' : next === 'UK' ? 'Inglés Británico' : 'Inglés Australiano'}`
                                });
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
                            className="fixed inset-0 bg-[color-mix(in_oklch,var(--color-level-ink)_40%,transparent)] z-[55]"
                        />
                        <m.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-4 left-4 right-4 z-[60]"
                        >
                            <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] p-7 shadow-[var(--shadow-float)] space-y-4 max-w-lg mx-auto max-h-[55vh] overflow-y-auto">
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
                                                {wordStatus === 'deck' ? <Check className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" /> : '+ '}{t('reader.addToDeck')}
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
                                                <Check className="inline w-4 h-4 -mt-0.5 mr-1" aria-hidden="true" />{t('reader.alreadyKnown')}
                                            </button>
                                        </>
                                    )}
                                </div>
                                {!selectedIsSaved && wordStatus !== 'none' && (
                                    <p className="text-center text-xs text-[var(--color-on-surface-muted)]">{t('reader.savedOnComplete')}</p>
                                )}
                            </div>
                        </m.div>
                    </>
                )}
            </AnimatePresence>
        </div>
        </LazyMotion>
    );
}
