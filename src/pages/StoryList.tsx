import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db, type CEFRLevel } from '../lib/db';
import { Lock, Check, Clock, Sparkles, Loader2, X } from 'lucide-react';
import { getStoryMesh, StoryIcon } from '../lib/storyVisuals';
import { generateStory } from '../lib/ai';
import LevelBadge from '../components/ui/LevelBadge';

export default function StoryList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const stories = useLiveQuery(() => db.stories.toArray());
    const user = useLiveQuery(() => db.users.toCollection().first());
    const readStories = useLiveQuery(() => db.readStories.toArray());
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    if (!stories || !user) return null;

    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

    const handleGenerateStory = async () => {
        setAiLoading(true);
        setAiError(null);
        try {
            const knownWords = (await db.knownWords.toArray()).map(w => w.wordId);
            const result = await generateStory(
                user.currentLevel,
                knownWords,
                aiTopic || undefined
            );

            // Save story to Dexie
            await db.stories.add({
                id: result.id,
                level: result.level as CEFRLevel,
                title: result.title,
                content: result.content,
                wordCount: result.wordCount,
                estimatedMinutes: result.estimatedMinutes,
            });

            // Save new vocabulary words
            for (const vocab of result.vocabulary) {
                const exists = await db.vocabulary.get(vocab.id);
                if (!exists) {
                    await db.vocabulary.add({
                        id: vocab.id,
                        translations: vocab.translations,
                        cefrLevel: vocab.cefrLevel as CEFRLevel,
                        examples: vocab.examples,
                        phonetic: vocab.phonetic,
                    });
                }
            }

            setShowAIModal(false);
            setAiTopic('');
            navigate(`/learn/${result.id}`);
        } catch (err: any) {
            setAiError(err.message || t('common.error'));
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="space-y-14">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-extrabold leading-tight">{t('nav.learn')}</h1>
                        <p className="text-text-secondary leading-relaxed">{t('storyList.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => setShowAIModal(true)}
                        className="bg-gradient-to-r from-accent-blue to-primary text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <Sparkles className="w-4 h-4" /> {t('storyList.generateAI')}
                    </button>
                </div>
            </motion.div>

            {/* AI Story Generation Modal */}
            <AnimatePresence>
                {showAIModal && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="widget border-primary/30 space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" /> {t('storyList.aiTitle')}
                                </h3>
                                <button onClick={() => setShowAIModal(false)} className="text-text-muted hover:text-text">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-text-muted leading-relaxed">
                                {t('storyList.aiDescription', { level: user.currentLevel })}
                            </p>
                            <input
                                type="text"
                                value={aiTopic}
                                onChange={e => setAiTopic(e.target.value)}
                                placeholder={t('storyList.aiTopicPlaceholder')}
                                className="w-full bg-bg-app border border-border rounded-xl px-5 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                                disabled={aiLoading}
                            />
                            {aiError && (
                                <p className="text-xs text-accent-red bg-accent-red/10 px-4 py-2 rounded-lg">{aiError}</p>
                            )}
                            <button
                                onClick={handleGenerateStory}
                                disabled={aiLoading}
                                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {aiLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> {t('storyList.aiGenerating')}</>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> {t('storyList.aiGenerate')}</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {levels.map((level, li) => {
                const isUnlocked = user.unlockedLevels.includes(level);
                const levelStories = stories.filter(s => s.level === level);
                if (levelStories.length === 0) return null;

                return (
                    <motion.div
                        key={level}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: li * 0.08 }}
                        className="space-y-6"
                    >
                        {/* Level header */}
                        <div className="flex items-center gap-3">
                            <LevelBadge level={level} size="default" />
                            {!isUnlocked && (
                                <span className="text-text-muted text-sm flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" /> {t('storyList.locked')}
                                </span>
                            )}
                        </div>

                        {/* Story grid — 2 columns */}
                        <div className={`grid grid-cols-2 gap-5 ${!isUnlocked ? 'opacity-40 pointer-events-none' : ''}`}>
                            {levelStories.map((story, si) => {
                                const isRead = readStories?.some(r => r.storyId === story.id);

                                return (
                                    <motion.div
                                        key={story.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: li * 0.08 + si * 0.04 }}
                                        onClick={() => isUnlocked && navigate(`/learn/${story.id}`)}
                                        className="story-card"
                                    >
                                        {/* Mesh gradient banner with SVG icon */}
                                        <div
                                            className="story-card-banner relative flex items-center justify-center overflow-hidden"
                                            style={{ background: getStoryMesh(story.id) }}
                                        >
                                            {/* Decorative icon */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <StoryIcon storyId={story.id} />
                                            </div>

                                            {/* AI / Read badge */}
                                            {story.id.startsWith('ai-') && (
                                                <span className="absolute top-3 left-3 text-xs bg-primary/80 text-white px-2.5 py-1 rounded-full font-medium backdrop-blur-sm flex items-center gap-1 z-10">
                                                    <Sparkles className="w-3 h-3" /> AI
                                                </span>
                                            )}
                                            {isRead && (
                                                <span className="absolute top-3 right-3 text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium backdrop-blur-sm flex items-center gap-1 z-10">
                                                    <Check className="w-3 h-3" /> {t('storyList.read')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <div className="story-card-body space-y-2.5">
                                            <h3 className="font-bold text-sm line-clamp-2 leading-snug">{story.title}</h3>
                                            <div className="flex items-center gap-2.5 text-xs text-text-muted">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {story.estimatedMinutes} min</span>
                                                <span>·</span>
                                                <span>{story.wordCount} {t('reader.words')}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
