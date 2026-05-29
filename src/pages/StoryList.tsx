import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import type { CEFRLevel } from '../lib/db';
import type { ReadStoryRow, KnownWordRow } from '../lib/database.types';
import { allStories } from '../data';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useTier } from '../hooks/useTier';
import { useUsageLimits } from '../hooks/useUsageLimits';
import { UsageBadge } from '../components/UsageBadge';
import { Lock, Check, Clock, Sparkles, Loader2, X } from 'lucide-react';
import { getStoryMesh, StoryIcon } from '../lib/storyVisuals';
import { generateStory } from '../lib/ai';
import LevelBadge from '../components/ui/LevelBadge';
import { SpotlightCard } from '../components/reactbits';

export default function StoryList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const stories = allStories;
    const { user } = useLevelProgression();
    const { user: authUser } = useAuth();
    const qc = useQueryClient();
    const { isFree } = useTier();
    const { data: usage } = useUsageLimits();
    const storyUsage = usage?.limits['story-generator'];
    const storyLimitReached = isFree && storyUsage && !storyUsage.allowed;
    const { data: readStories } = useQuery({
        queryKey: ['readStories', authUser?.id],
        queryFn: async () => {
            const { data } = await supabase.from('read_stories').select('*');
            return (data ?? []) as ReadStoryRow[];
        },
        enabled: !!authUser?.id,
    });
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    if (!user) return null;

    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

    const handleGenerateStory = async () => {
        setAiLoading(true);
        setAiError(null);
        try {
            const { data: knownWordsData } = await supabase.from('known_words').select('word_id');
            const knownWords = ((knownWordsData ?? []) as Pick<KnownWordRow, 'word_id'>[]).map(w => w.word_id);
            const result = await generateStory(
                user.currentLevel,
                knownWords,
                aiTopic || undefined
            );

            setShowAIModal(false);
            setAiTopic('');
            qc.invalidateQueries({ queryKey: ['usage-limits'] });
            navigate(`/learn/${result.id}`, { state: { aiStory: result } });
        } catch (err: any) {
            setAiError(err.message || t('common.error'));
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="space-y-14">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight leading-none">{t('nav.learn')}</h1>
                        <p className="text-[var(--color-on-surface-muted)] leading-relaxed text-sm">{t('storyList.subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isFree && storyUsage && (
                            <UsageBadge remaining={storyUsage.remaining} limit={storyUsage.limit} label="historias esta semana" />
                        )}
                        {storyLimitReached ? (
                            <div className="text-right space-y-1.5 bg-[var(--color-surface-container-low)] rounded-2xl px-4 py-3">
                                <p className="text-xs text-[var(--color-on-surface-muted)] flex items-center gap-1.5 font-medium">
                                    <Lock className="w-3 h-3" /> Ya generaste tu historia de esta semana
                                </p>
                                <Link to="/pricing" className="text-[10px] text-[var(--color-primary)] font-bold hover:underline">
                                    Se reinicia el lunes — o desbloquea con Pro
                                </Link>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAIModal(true)}
                                className="btn-primary flex items-center gap-2.5 px-6 py-3 active:scale-95"
                            >
                                <Sparkles className="w-4 h-4" /> {t('storyList.generateAI')}
                            </button>
                        )}
                    </div>
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
                        <div className="widget space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black tracking-tight flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center shadow-sm">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    {t('storyList.aiTitle')}
                                </h3>
                                <button onClick={() => setShowAIModal(false)} className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-container-high)] transition-colors duration-200">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">
                                {t('storyList.aiDescription', { level: user.currentLevel })}
                            </p>
                            <input
                                type="text"
                                value={aiTopic}
                                onChange={e => setAiTopic(e.target.value)}
                                placeholder={t('storyList.aiTopicPlaceholder')}
                                className="input-soft w-full"
                                disabled={aiLoading}
                            />
                            {aiError && (
                                <p className="text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 px-5 py-3 rounded-2xl font-medium">{aiError}</p>
                            )}
                            <button
                                onClick={handleGenerateStory}
                                disabled={aiLoading}
                                className="btn-primary w-full py-3.5 disabled:opacity-50 flex items-center justify-center gap-2.5"
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
                        className="space-y-8"
                    >
                        {/* Level header */}
                        <div className="flex items-center gap-3">
                            <LevelBadge level={level} size="default" />
                            {!isUnlocked && (
                                <span className="text-[var(--color-on-surface-muted)] text-xs flex items-center gap-1.5 bg-[var(--color-surface-container)] px-3 py-1.5 rounded-full font-bold">
                                    <Lock className="w-3 h-3" /> {t('storyList.locked')}
                                </span>
                            )}
                        </div>

                        {/* Story grid */}
                        <div className={`grid grid-cols-2 gap-6 md:gap-8 ${!isUnlocked ? 'opacity-40 pointer-events-none' : ''}`}>
                            {levelStories.map((story, si) => {
                                const isRead = readStories?.some(r => r.story_id === story.id);

                                return (
                                    <motion.div
                                        key={story.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: li * 0.08 + si * 0.04 }}
                                        style={{ perspective: '800px' }}
                                    >
                                        <motion.div
                                            whileHover={{ rotateX: -3, rotateY: 5, scale: 1.02 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            onClick={() => isUnlocked && navigate(`/learn/${story.id}`)}
                                        >
                                            <SpotlightCard
                                                className="story-card"
                                                spotlightColor="rgba(112, 42, 225, 0.12)"
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
                                                        <span className="absolute top-3 left-3 text-[10px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white px-3 py-1 rounded-full font-bold shadow-md flex items-center gap-1 z-10">
                                                            <Sparkles className="w-3 h-3" /> AI
                                                        </span>
                                                    )}
                                                    {isRead && (
                                                        <span className="absolute top-3 right-3 text-[10px] bg-[var(--color-success)]/80 text-white px-3 py-1 rounded-full font-bold backdrop-blur-sm flex items-center gap-1 z-10 shadow-sm">
                                                            <Check className="w-3 h-3" /> {t('storyList.read')}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Body */}
                                                <div className="story-card-body space-y-3">
                                                    <h3 className="font-black text-sm line-clamp-2 leading-snug tracking-tight">{story.title}</h3>
                                                    <div className="flex items-center gap-3 text-xs text-[var(--color-on-surface-muted)] font-medium">
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3 h-3" /> {story.estimatedMinutes} min
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-[var(--color-on-surface-muted)]/30" />
                                                        <span>{story.wordCount} {t('reader.words')}</span>
                                                    </div>
                                                </div>
                                            </SpotlightCard>
                                        </motion.div>
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
