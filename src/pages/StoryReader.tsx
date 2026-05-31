import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { Vocabulary } from '../lib/db';
import { getStory, getVocab, getVocabMap } from '../data';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useCards } from '../hooks/useCards';
import { toast } from '../lib/toast';
import DOMPurify from 'dompurify';
import LevelBadge from '../components/ui/LevelBadge';
import { useSpeech } from '../hooks/useSpeech';
import { Play, Pause, SkipForward, SkipBack, Mic, Headphones, Trophy } from 'lucide-react';

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
    const speakSentence = useCallback((idx: number) => {
        if (idx < 0 || idx >= sentences.length) {
            setIsPlaying(false);
            setCurrentSentenceIdx(-1);
            return;
        }
        
        window.speechSynthesis.cancel();
        
        const text = sentences[idx];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = playbackRate;
        
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        if (accent === 'US') {
            selectedVoice = voices.find(v => v.lang.includes('US') && v.localService) || 
                            voices.find(v => v.lang.includes('US'));
        } else if (accent === 'UK') {
            selectedVoice = voices.find(v => (v.lang.includes('GB') || v.lang.includes('UK')) && v.localService) || 
                            voices.find(v => (v.lang.includes('GB') || v.lang.includes('UK')));
        } else if (accent === 'AU') {
            selectedVoice = voices.find(v => v.lang.includes('AU') && v.localService) || 
                            voices.find(v => v.lang.includes('AU'));
        }
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.startsWith('en-'));
        }
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.onend = () => {
            setCurrentSentenceIdx(prev => {
                const next = prev + 1;
                if (next < sentences.length) {
                    setTimeout(() => {
                        speakSentence(next);
                    }, 300);
                    return next;
                } else {
                    setIsPlaying(false);
                    return -1;
                }
            });
        };
        
        utterance.onerror = () => {
            setIsPlaying(false);
        };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [sentences, playbackRate, accent]);

    const handlePlayPause = () => {
        if (isListening) {
            stopListening();
        }
        if (isPlaying) {
            window.speechSynthesis.cancel();
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
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        }
        resetTranscript();
        startListening();
    };

    const handleToggleShadowing = () => {
        if (!showShadowing) {
            window.speechSynthesis.cancel();
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
    }, [isWordInDeck, isWordKnown, addedWords, knownWords, currentSentenceIdx, isPlaying, speakSentence, vocabMap, isAIStory]);

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
                className="bg-[var(--color-card)] rounded-[2rem] p-8 text-lg leading-relaxed tracking-wide focus:outline-none shadow-[var(--shadow-card)] transition-all duration-300 pb-48 sm:pb-36 lg:pb-32"
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

            {/* Shadowing practice widget */}
            <AnimatePresence>
                {showShadowing && currentSentenceIdx !== -1 && (
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-[var(--color-card)] rounded-[2rem] p-6 shadow-[var(--shadow-card)] border border-[var(--color-primary)]/10 space-y-5 text-center transition-all duration-300"
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
                                                className={item.match ? 'text-[var(--color-success)]' : 'text-red-400'}
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
                                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                                        : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.4)]'
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
            <button
                onClick={handleComplete}
                className="w-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white font-black py-4 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] active:scale-[0.97] text-base tracking-wide"
            >
                ✓ {t('reader.storyCompleted')}
            </button>

            {/* Floating Audiobook Player Bar */}
            <div className="fixed bottom-6 left-4 right-4 z-[50] max-w-lg mx-auto bg-[var(--color-card)]/90 backdrop-blur-md rounded-[2.5rem] p-4 shadow-[var(--shadow-float)] border border-[var(--color-surface-container-high)] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 pb-8 sm:pb-4">
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
                                setAccent(prev => {
                                    const next = prev === 'US' ? 'UK' : prev === 'UK' ? 'AU' : 'US';
                                    toast.success({
                                        title: 'Acento cambiado',
                                        description: `Acento ajustado a: ${next === 'US' ? 'Inglés Americano' : next === 'UK' ? 'Inglés Británico' : 'Inglés Australiano'}`
                                    });
                                    if (isPlaying && currentSentenceIdx !== -1) {
                                        setTimeout(() => speakSentence(currentSentenceIdx), 50);
                                    }
                                    return next;
                                });
                            }}
                            className="w-14 h-8 rounded-xl bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                            title="Acento del sintetizador"
                        >
                            {accent === 'US' ? '🇺🇸 US' : accent === 'UK' ? '🇬🇧 UK' : '🇦🇺 AU'}
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
                                    ? 'bg-[var(--color-primary)] text-white shadow-md' 
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
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white flex items-center justify-center shadow-md active:scale-95 hover:shadow-lg transition-all cursor-pointer"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white translate-x-0.5" />}
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
