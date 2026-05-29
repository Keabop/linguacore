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
import { Lock, Check, Clock, Sparkles, Loader2, X, Search, Compass, Eye } from 'lucide-react';
import { StoryIcon } from '../lib/storyVisuals';
import { generateStory } from '../lib/ai';
import { SpotlightCard } from '../components/reactbits';

const storyDetails: Record<string, { spanishTitle: string; description: string }> = {
    'a1-001': { spanishTitle: 'Mi Rutina Diaria', description: 'Una mirada sencilla a las actividades de la mañana.' },
    'a1-002': { spanishTitle: 'Mi Familia', description: 'Aprende vocabulario sobre los miembros de la familia y actividades de fin de semana.' },
    'a1-003': { spanishTitle: 'Mi Mejor Amigo', description: 'Una historia sobre la amistad, pasatiempos y diferencias personales.' },
    'a1-004': { spanishTitle: 'Un Día Lluvioso', description: 'Disfruta de una tarde tranquila en casa durante un día de lluvia.' },
    'a1-005': { spanishTitle: 'En la Tienda', description: 'Vocabulario útil para hacer compras en el supermercado.' },
    'a1-006': { spanishTitle: 'Mis Mascotas', description: 'Conoce a Max el perro y a un gato muy dormilón.' },
    'a1-007': { spanishTitle: 'Aprender Inglés', description: 'La emocionante aventura de aprender un nuevo idioma día a día.' },
    'a1-008': { spanishTitle: 'El Parque', description: 'Actividades al aire libre con la familia en un día soleado.' },
    'a1-009': { spanishTitle: 'Mi Habitación', description: 'Descripción de un espacio personal favorito y acogedor.' },
    'a1-010': { spanishTitle: 'La Hora de la Cena', description: 'Compartiendo momentos y comida deliciosa en familia.' },
    // A2
    'a2-001': { spanishTitle: 'Un Viaje al Mercado', description: 'Comprando vegetales frescos y flores hermosas en el mercado local.' },
    'a2-002': { spanishTitle: 'Mi Primer Día de Trabajo', description: 'Superando los nervios y conociendo nuevos compañeros en la oficina.' },
    'a2-003': { spanishTitle: 'Cocinando con la Abuela', description: 'Aprende recetas familiares y vocabulario de cocina tradicional.' },
    'a2-004': { spanishTitle: 'Una Visita a la Biblioteca', description: 'Descubriendo novelas clásicas y un rincón de estudio perfecto.' },
    'a2-005': { spanishTitle: 'Una Caminata de Fin de Semana', description: 'Subiendo la montaña para apreciar la naturaleza y el aire fresco.' },
    'a2-006': { spanishTitle: 'El Festival del Fuego', description: 'Una noche mágica llena de luces, chispas y tradiciones ancestrales.' },
    'a2-007': { spanishTitle: 'Un Paseo por la Ciudad', description: 'Descubriendo monumentos históricos y museos interesantes.' },
    'a2-008': { spanishTitle: 'El Concierto de Música', description: 'Disfrutando de ritmos modernos e instrumentos en vivo con amigos.' },
    'a2-009': { spanishTitle: 'Visitando al Veterinario', description: 'Cuidando a un cachorro travieso que necesita una vacuna.' },
    'a2-010': { spanishTitle: 'El Día de Campo', description: 'Un almuerzo relajante junto al lago con actividades divertidas.' },
    // B1
    'b1-001': { spanishTitle: 'El Primer Vuelo Solo', description: 'La historia de superación de un joven piloto en su primera gran aventura.' },
    'b1-002': { spanishTitle: 'El Secreto del Faro', description: 'Misterios y leyendas marinas en un antiguo faro de la costa norte.' },
    'b1-003': { spanishTitle: 'Un Nuevo Emprendimiento', description: 'Estrategias, desafíos y éxitos al fundar una pequeña cafetería.' },
    'b1-004': { spanishTitle: 'La Búsqueda del Tesoro', description: 'Pistas olvidadas y mapas antiguos revelados en una buhardilla.' },
    'b1-005': { spanishTitle: 'El Ecosistema Urbano', description: 'Una investigación científica sobre cómo conviven plantas y animales en la gran ciudad.' },
    'b1-006': { spanishTitle: 'La Primera Obra de Teatro', description: 'Nervios tras bambalinas, ensayos rigorosos y el aplauso final.' },
    'b1-007': { spanishTitle: 'El Arte Moderno', description: 'Debates intelectuales y apreciación estética en la galería nacional.' },
    'b1-008': { spanishTitle: 'El Gran Invento', description: 'La perseverancia de un inventor para crear una fuente de energía limpia.' },
    'b1-009': { spanishTitle: 'El Maratón Anual', description: 'Superación física y preparación mental para correr 42 kilómetros.' },
    'b1-010': { spanishTitle: 'La Receta Secreta', description: 'Un concurso de cocina donde el ingrediente principal es el amor familiar.' },
    // B2
    'b2-001': { spanishTitle: 'Inteligencia Artificial', description: 'Un ensayo filosófico y técnico sobre el futuro de los algoritmos y la conciencia.' },
    'b2-002': { spanishTitle: 'El Misterio del Manuscrito', description: 'Una intriga histórica para descifrar un texto medieval encriptado.' },
    'b2-003': { spanishTitle: 'Turismo Sostenible', description: 'Cómo viajar por el mundo minimizando el impacto ecológico y apoyando economías locales.' },
    'b2-004': { spanishTitle: 'El Debate Científico', description: 'Una discusión académica sobre los límites éticos de la ingeniería genética.' },
    'b2-005': { spanishTitle: 'La Revolución Industrial', description: 'Análisis socioeconómico del impacto de las máquinas de vapor en las ciudades antiguas.' },
    'b2-006': { spanishTitle: 'El Proyecto Arquitectónico', description: 'El diseño conceptual de un rascacielos sostenible que purifica el aire.' },
    'b2-007': { spanishTitle: 'Economía Circular', description: 'Redefiniendo el consumo mediante el reciclaje avanzado y la manufactura verde.' },
    'b2-008': { spanishTitle: 'El Gran Telescopio', description: 'Descubriendo exoplanetas habitables en las profundidades del cosmos.' },
    'b2-009': { spanishTitle: 'La Psicología del Éxito', description: 'Un estudio de los hábitos cognitivos que definen a las personas exitosas.' },
    'b2-010': { spanishTitle: 'El Futuro de la Energía', description: 'Una comparativa entre la fusión nuclear, la energía solar y los biocombustibles.' },
};

const CEFR_COLORS: Record<string, string> = {
    A1: '#60A5FA',
    A2: '#4ADE80',
    B1: '#FBBF24',
    B2: '#F87171',
};

const normalizeText = (text: string) => 
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<'Todos' | CEFRLevel>('Todos');

    if (!user) return null;

    const filterLevels: ('Todos' | CEFRLevel)[] = ['Todos', 'A1', 'A2', 'B1', 'B2'];

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

    const filteredStories = stories.filter((story) => {
        const matchesLevel = selectedLevel === 'Todos' || story.level === selectedLevel;

        const details = storyDetails[story.id] || { spanishTitle: '', description: '' };
        const title = story.title || '';
        const spanishTitle = details.spanishTitle || '';
        const description = details.description || (story as any).description || '';

        const normalizedQuery = normalizeText(searchQuery);
        const matchesSearch = 
            normalizeText(title).includes(normalizedQuery) ||
            normalizeText(spanishTitle).includes(normalizedQuery) ||
            normalizeText(description).includes(normalizedQuery);

        return matchesLevel && matchesSearch;
    });

    const readStoryIds = new Set(readStories?.map(r => r.story_id) ?? []);

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
                                className="btn-primary flex items-center gap-2.5 px-6 py-3 active:scale-95 cursor-pointer"
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
                                <button onClick={() => setShowAIModal(false)} className="w-8 h-8 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-container-high)] transition-colors duration-200 cursor-pointer">
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
                                className="btn-primary w-full py-3.5 disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
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

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-4"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* Search Input */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-muted)]">
                            <Search className="h-4 w-4" />
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por título, palabra clave o descripción..."
                            className="w-full h-11 pl-11 pr-4 bg-[var(--color-surface-container)] focus:bg-[var(--color-surface-container-high)] border border-transparent rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder:text-[var(--color-on-surface-muted)]/50 text-[var(--color-on-surface)]"
                        />
                    </div>

                    {/* Level filters pills */}
                    <div id="level-filters" className="flex flex-wrap gap-2 md:justify-end">
                        {filterLevels.map((lvl) => {
                            const isActive = selectedLevel === lvl;
                            const pillColor = CEFR_COLORS[lvl] || 'var(--color-primary)';

                            return (
                                <button
                                    key={lvl}
                                    onClick={() => setSelectedLevel(lvl)}
                                    style={isActive ? { 
                                        backgroundColor: pillColor, 
                                        color: '#fff', 
                                        boxShadow: `0 0 0 2px var(--color-background), 0 0 0 4px ${lvl === 'Todos' ? 'var(--color-primary)' : pillColor}` 
                                    } : {}}
                                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer ${
                                        !isActive
                                            ? 'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]'
                                            : ''
                                    }`}
                                >
                                    {lvl === 'Todos' ? 'Todos los niveles' : `CEFR ${lvl}`}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Unified Story Grid */}
            <AnimatePresence mode="popLayout">
                {filteredStories.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
                    >
                        {filteredStories.map((story) => {
                            const isUnlocked = user.unlockedLevels.includes(story.level);
                            const isRead = readStoryIds.has(story.id);
                            const storyProgress = isRead ? 100 : 0;
                            const levelColor = CEFR_COLORS[story.level] || '#702AE1';

                            const details = storyDetails[story.id] || { 
                                spanishTitle: 'Historia Personalizada', 
                                description: 'Una historia adaptada a tu nivel y vocabulario para practicar lectura comprensiva.' 
                            };
                            const hasCustomIcon = story.id in storyDetails;

                            return (
                                <motion.div
                                    key={story.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    whileHover={{ y: -6 }}
                                    onClick={() => isUnlocked && navigate(`/learn/${story.id}`)}
                                >
                                    <SpotlightCard
                                        className={`rounded-[2rem] overflow-hidden flex flex-col h-full cursor-pointer relative bg-[var(--color-card)] text-[var(--color-on-surface)] shadow-[var(--shadow-card)] transition-all duration-300 ${!isUnlocked ? 'opacity-40 pointer-events-none' : ''}`}
                                        spotlightColor="rgba(112, 42, 225, 0.12)"
                                    >
                                        {/* 4px CEFR level color band at the top */}
                                        <div style={{ backgroundColor: levelColor }} className="h-1 w-full shrink-0" />

                                        {/* Floating AI / Read Badges */}
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                                            {story.id.startsWith('ai-') && (
                                                <span className="text-[9px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-0.5">
                                                    <Sparkles className="w-2.5 h-2.5" /> AI
                                                </span>
                                            )}
                                            {isRead && (
                                                <span className="text-[9px] bg-[var(--color-success)] text-white px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-0.5">
                                                    <Check className="w-2.5 h-2.5" /> {t('storyList.read')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-6 flex flex-col flex-1 gap-4 text-left">
                                            {/* Level Badge and Word Count */}
                                            <div className="flex justify-between items-center text-[10px] font-mono text-[var(--color-on-surface-muted)]">
                                                <span 
                                                    style={{ color: levelColor, backgroundColor: `${levelColor}15` }} 
                                                    className="px-3 py-1 text-[10px] font-extrabold rounded-full font-display"
                                                >
                                                    Nivel {story.level}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1 font-medium">
                                                        <Clock className="w-2.5 h-2.5" /> {story.estimatedMinutes} min
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-[var(--color-on-surface-muted)]/35" />
                                                    <span>{story.wordCount} palabras</span>
                                                </div>
                                            </div>

                                            {/* Story Title & Spanish Translation */}
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center shrink-0">
                                                    {hasCustomIcon ? (
                                                        <StoryIcon storyId={story.id} className="h-5 w-5 text-[var(--color-primary)]" />
                                                    ) : (
                                                        <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
                                                    )}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h3 className="font-extrabold text-base leading-tight text-[var(--color-on-surface)] line-clamp-1">{story.title}</h3>
                                                    <p className="text-[10px] italic text-[var(--color-on-surface-muted)]/85 line-clamp-1">
                                                        {details.spanishTitle}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-xs line-clamp-2 leading-relaxed flex-1 text-[var(--color-on-surface-muted)]">
                                                {details.description}
                                            </p>

                                            {/* Progress bloom */}
                                            <div className="pt-3 border-t border-[var(--color-surface-container-highest)]/20 space-y-1">
                                                <div className="flex justify-between items-center text-[10px] font-bold">
                                                    <span className="text-[var(--color-on-surface-muted)]">Tu progreso</span>
                                                    <span className="text-[var(--color-primary)]">{storyProgress}%</span>
                                                </div>
                                                <div className="progress-bloom">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${storyProgress}%` }}
                                                        className="progress-bloom-fill"
                                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button 
                                                onClick={() => isUnlocked && navigate(`/learn/${story.id}`)}
                                                className={`w-full mt-2 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                                                    storyProgress === 100
                                                        ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20'
                                                        : 'bg-[var(--color-surface-container-highest)] text-[var(--color-primary)] hover:bg-[var(--color-surface-container-high)]'
                                                }`}
                                            >
                                                <Eye className="h-4 w-4" />
                                                {storyProgress === 100 ? 'Releer historia' : storyProgress > 0 ? 'Continuar leyendo' : 'Empezar lectura'}
                                            </button>
                                        </div>
                                    </SpotlightCard>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <div className="text-center py-20 space-y-3 bg-[var(--color-surface-container-low)] rounded-[2rem] p-8 shadow-sm">
                        <Compass className="h-12 w-12 text-[var(--color-outline)] mx-auto animate-pulse" />
                        <p className="text-sm font-bold text-[var(--color-on-surface)]">No se encontraron historias</p>
                        <p className="text-xs text-[var(--color-on-surface-muted)]">Inténtalo buscando con otras palabras clave o niveles de filtro.</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
