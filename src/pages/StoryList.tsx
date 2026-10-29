import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import type { CEFRLevel } from '../lib/db';
import type { ReadStoryRow, KnownWordRow } from '../lib/database.types';
import { storiesData as allStories } from '../data/stories';
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

export const storyDetails: Record<string, { spanishTitle: string; description: string }> = {
    'a1-001': { spanishTitle: 'Mi Rutina Diaria', description: 'La mañana de una trabajadora, desde que se despierta hasta que vuelve a casa.' },
    'a1-002': { spanishTitle: 'Mi Familia', description: 'Lucía presenta a su familia: quién es quién y a qué se dedica cada uno.' },
    'a1-011': { spanishTitle: 'El Nuevo Vecino', description: 'Mei llega al edificio y se presenta a Tom, su nuevo vecino.' },
    'a1-009': { spanishTitle: 'Mi Habitación', description: 'Un cuarto pequeño y lo que hay en él, cosa por cosa.' },
    'a1-012': { spanishTitle: '¿De Quién Es Esta Bolsa?', description: 'Una bolsa olvidada en clase y las pistas para encontrar a su dueño.' },
    'a1-010': { spanishTitle: 'La Hora de la Cena', description: 'Quién cocina, quién pone la mesa y de qué habla una familia cada noche.' },
    'a1-003': { spanishTitle: 'Mi Mejor Amigo', description: 'Dos amigos muy distintos: los deportes, la música y el cine de los viernes.' },
    'a1-006': { spanishTitle: 'Mis Mascotas', description: 'Un perro, una gata y un pájaro que canta cada mañana.' },
    'a1-008': { spanishTitle: 'El Parque', description: 'Qué hay en el parque y dónde está cada cosa.' },
    'a1-013': { spanishTitle: 'Una Casa junto al Mar', description: 'La casa de los abuelos, cuarto por cuarto, con el mar al fondo.' },
    'a1-007': { spanishTitle: 'Aprender Inglés', description: 'Rosa cuenta lo que ya puede hacer en inglés y lo que todavía le cuesta.' },
    'a1-004': { spanishTitle: 'Un Día Lluvioso', description: 'Un sábado de lluvia en casa: un pastel, un juego y un final al sol.' },
    'a1-005': { spanishTitle: 'En la Tienda', description: 'Sam hace la compra con su lista y descubre que no trae dinero.' },
    'a1-014': { spanishTitle: 'Un Pícnic en el Parque', description: 'Tres amigos, la comida que trae cada uno y un pastel para compartir.' },
    // A2
    'a2-002': { spanishTitle: 'Mi Primer Día de Trabajo', description: 'Nervios, un tren tarde y un compañero que ayuda en el primer día.' },
    'a2-011': { spanishTitle: 'Un Fin de Semana Tranquilo', description: 'Sin fiesta: series, bici, una barbacoa y una novela nueva.' },
    'a2-005': { spanishTitle: 'Un Fin de Semana en el Campo', description: 'Un pueblo junto al lago, un castillo y una tarde perdidos en el monte.' },
    'a2-012': { spanishTitle: 'Perdida en Lisboa', description: 'Un primer viaje al extranjero, una bolsa olvidada en el tranvía y una nueva amiga.' },
    'a2-004': { spanishTitle: 'La Nueva Alumna', description: 'El primer día de Sofia en clase, contado mientras sucede.' },
    'a2-013': { spanishTitle: 'Un Sábado por la Mañana', description: 'Qué está haciendo cada miembro de la familia García ahora mismo.' },
    'a2-009': { spanishTitle: 'El Festival de Música', description: 'Los planes para el primer festival sin padres: boletos, tienda de campaña y lluvia.' },
    'a2-010': { spanishTitle: 'Mudarse a una Nueva Ciudad', description: 'Un trabajo nuevo en Monterrey y todo lo que hay que preparar antes de irse.' },
    'a2-001': { spanishTitle: 'Un Viaje al Mercado', description: 'El mercado viejo frente al nuevo: precios, ambiente y el peor queso del año.' },
    'a2-014': { spanishTitle: 'Dos Ciudades', description: 'Madrid contra Valencia: dos primos discuten cuál es mejor.' },
    'a2-008': { spanishTitle: 'Mis Hábitos Saludables', description: 'Comida, ejercicio y sueño: los cambios que mejoraron una vida.' },
    'a2-015': { spanishTitle: 'En el Médico', description: 'Un dolor de estómago, las reglas de la doctora y un partido el sábado.' },
    'a2-003': { spanishTitle: 'Cocinando con la Abuela', description: 'Una receta de pastel de manzana que pasa de madre a hija y a nieta.' },
    'a2-016': { spanishTitle: 'El Regalo de Cumpleaños', description: 'Un regalo sin dinero: un libro con la historia de una amistad.' },
    'a2-006': { spanishTitle: 'Aprendiendo a Cocinar', description: 'Las reglas del chef y lo que pasará si la cena sale mal.' },
    'a2-017': { spanishTitle: 'Si Llueve Mañana', description: 'Una feria escolar sobre el plástico y qué harán si hay tormenta.' },
    'a2-007': { spanishTitle: 'El Perro Perdido', description: 'Una noche de lluvia, un perro mojado y la búsqueda de su familia.' },
    'a2-018': { spanishTitle: 'La Noche del Apagón', description: 'Dos hermanos solos en casa, sin luz, y un vecino con historias.' },
    // B1
    'b1-001': { spanishTitle: 'Veintitrés Países', description: 'Una escritora de viajes cuenta lo que ha vivido desde su primer pasaporte.' },
    'b1-002': { spanishTitle: 'Un Año de Primeras Veces', description: 'A los 72, un abuelo recién jubilado se atreve con todo lo que nunca hizo.' },
    'b1-003': { spanishTitle: 'La Noche de la Tormenta', description: 'Una tormenta golpea Veracruz: rescates, daños y una investigación.' },
    'b1-004': { spanishTitle: 'Buenas Noticias, por Fin', description: 'Una periodista busca historias felices: un niño valiente, una perra perdida y una bailarina.' },
    'b1-005': { spanishTitle: 'De Vuelta al Gimnasio', description: 'El diario de seis semanas para vencer el estrés con ejercicio y descanso.' },
    'b1-006': { spanishTitle: 'La Larga Recuperación', description: 'Un futbolista con la pierna rota y los meses que tarda en volver.' },
    'b1-007': { spanishTitle: 'La Cabaña Vacía', description: 'Un café tibio, pasos arriba y una mochila ajena en una cabaña del bosque.' },
    'b1-008': { spanishTitle: 'El Cuadro Desaparecido', description: 'Una detective investiga el robo de un retrato sin dejar rastro.' },
    'b1-009': { spanishTitle: 'El Pueblo de mi Abuela', description: 'Velas, apodos y una escuela de un solo salón en la sierra de Oaxaca.' },
    'b1-010': { spanishTitle: 'Cuando Papá Era Niño', description: 'Una caja de fotos viejas y cómo era la vida en los ochenta.' },
    'b1-011': { spanishTitle: 'Del Campo a la Playera', description: 'Cómo se hace una playera de algodón, paso a paso, en una fábrica.' },
    'b1-012': { spanishTitle: 'El Taller de Chocolate', description: 'La receta familiar de una tía de Oaxaca, del cacao a la tablilla.' },
    'b1-013': { spanishTitle: '¿Qué Harías Tú?', description: 'Si ganaras la lotería: las respuestas de una clase de inglés.' },
    'b1-014': { spanishTitle: 'La Cartera', description: 'Una cartera llena de dinero en el camión y una decisión difícil.' },
    'b1-015': { spanishTitle: 'El Chat del Grupo', description: 'Un malentendido, mucho chisme y una amiga que guardaba un secreto.' },
    'b1-016': { spanishTitle: 'La Queja del Cliente', description: 'Una llamada furiosa, un paquete perdido y la paciencia que lo arregla.' },
    'b1-017': { spanishTitle: 'Un Pueblo junto al Mar', description: 'Puerto Escondido contado por quien vive ahí: olas, tortugas y cambios.' },
    'b1-018': { spanishTitle: 'La Isla del Fin del Mundo', description: 'Un mes en Chiloé, entre lluvia, iglesias de madera y ballenas.' },
    'b1-019': { spanishTitle: 'Elegir una Carrera', description: 'Un año sin rumbo, una conferencia sobre el mar y una beca.' },
    'b1-020': { spanishTitle: 'Nunca Es Tarde para Aprender', description: 'Una madre de 55 años empieza la universidad para estudiar literatura.' },
    'b1-021': { spanishTitle: 'Subir la Montaña', description: 'Permisos, guía y entrenamiento para intentar el Pico de Orizaba.' },
    'b1-022': { spanishTitle: 'Las Reglas de la Casa', description: 'Cuatro compañeros de departamento y las reglas que los salvan.' },
    // B2
    'b2-001': { spanishTitle: 'El Vuelo Perdido', description: 'Un nado de más, un avión que falla y el encuentro que cambió una vida.' },
    'b2-002': { spanishTitle: 'El Río', description: 'Un río que parecía tranquilo, un pescador y la lección de un verano.' },
    'b2-003': { spanishTitle: 'El Trabajo que Rechacé', description: 'Londres o quedarse: lo que habría sido y lo que fue.' },
    'b2-004': { spanishTitle: 'Empezar de Nuevo a los Cincuenta', description: 'Una despedida injusta y una panadería que nace de un pastel.' },
    'b2-005': { spanishTitle: 'Cartas a mi Yo de Doce Años', description: 'Una tarea de psicología: lo que ojalá alguien nos hubiera dicho.' },
    'b2-006': { spanishTitle: 'Ojalá Hubiera Dicho Algo', description: 'Una conversación en la cocina que un nieto lamenta no haber escuchado.' },
    'b2-007': { spanishTitle: 'La Entrevista que Salió Mal', description: 'Una pregunta mal interpretada, un actor enojado y la verdad en la prensa.' },
    'b2-008': { spanishTitle: 'Lo que Decían los Vecinos', description: 'Una familia nueva en un pueblo donde todos hablan de todos.' },
    'b2-009': { spanishTitle: 'El Misterio del Pueblo Enfermo', description: 'Científicos investigan por qué medio pueblo se enfermó a la vez.' },
    'b2-010': { spanishTitle: 'Cómo se Hace un Teléfono', description: 'Minas, fábricas y datos: el largo viaje del teléfono en tu bolsillo.' },
    'b2-011': { spanishTitle: 'La Casa que Se Defendía', description: 'Una primera casa, una hipoteca y una avería tras otra.' },
    'b2-012': { spanishTitle: 'Un Sábado Muy Ocupado', description: 'Mandados con una abuela de 84: farmacia, plomero y galletas.' },
    'b2-013': { spanishTitle: 'La Pintora que No Fue Famosa', description: 'Trescientos cuadros escondidos y una exposición después de su muerte.' },
    'b2-014': { spanishTitle: 'La Canción que No Muere', description: 'La historia de «Cielito Lindo» y de su autor olvidado.' },
    'b2-015': { spanishTitle: 'Amanecer en la Montaña', description: 'Una subida a oscuras y una vista que valió madrugar.' },
    'b2-016': { spanishTitle: 'La Librería Antigua', description: 'Una puerta verde en Puebla, un librero sabio y un gato llamado Borges.' },
    'b2-017': { spanishTitle: 'Una Carta a 2045', description: 'Lo que una estudiante de 16 años imagina del mundo en veinte años.' },
    'b2-018': { spanishTitle: 'La Ciudad en Diez Años', description: 'El plan «Ciudad 2035»: árboles, transporte limpio y un río vivo.' },
    'b2-019': { spanishTitle: 'El Experimento del Departamento', description: 'Cuatro desconocidos, un apagón de dos días y una amistad inesperada.' },
    'b2-020': { spanishTitle: 'Un Negocio con la Abuela', description: 'Salsas caseras, frascos de vidrio y lo que se aprende cocinando juntos.' },
    'b2-021': { spanishTitle: 'La Elección Estudiantil', description: 'Dos candidatos, una encuesta sobre tareas y una escuela dividida.' },
    'b2-022': { spanishTitle: '¿Prohibir los Coches en el Centro?', description: 'Un ensayo de opinión sobre el debate que divide a la ciudad.' },
    'b2-023': { spanishTitle: 'La Casita junto al Lago', description: 'Dos hermanas heredan una casa abandonada y un secreto familiar.' },
    'b2-024': { spanishTitle: 'El Turno de Noche', description: 'Un guardia, un hospital vacío y algo escondido en la sala de niños.' },
    'b2-025': { spanishTitle: '¿Llegó el Trabajo en Casa para Quedarse?', description: 'Un ensayo sobre las ventajas y los costos del trabajo remoto.' },
    'b2-026': { spanishTitle: 'Turismo: ¿Bendición o Maldición?', description: 'Un ensayo sobre lo que el turismo da y quita en lugares como Tulum.' },
};

export const CEFR_COLORS: Record<string, string> = {
    A1: 'var(--color-level-a1)',
    A2: 'var(--color-level-a2)',
    B1: 'var(--color-level-b1)',
    B2: 'var(--color-level-b2)',
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
    const readStoryIds = useMemo(() => new Set(readStories?.map(r => r.story_id) ?? []), [readStories]);

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
                                    <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shadow-sm">
                                        <Sparkles className="w-4 h-4 text-[var(--color-on-primary)]" />
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
                                        color: 'var(--color-level-ink)', 
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
                            const levelColor = CEFR_COLORS[story.level] || 'var(--color-primary)';

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
                                    whileHover={{ y: -2 }}
                                    onClick={() => isUnlocked && navigate(`/learn/${story.id}`)}
                                >
                                    <div
                                        className={`rounded-[var(--radius-lg)] overflow-hidden flex flex-col h-full cursor-pointer relative bg-[var(--color-card)] text-[var(--color-on-surface)] shadow-[var(--shadow-card)] transition-all duration-300 ${!isUnlocked ? 'opacity-40 pointer-events-none' : ''}`}
                                    >
                                        {/* Two leaves in the level colour, growing out of the corner */}
                                        <svg
                                            viewBox="0 0 120 120"
                                            aria-hidden="true"
                                            className="story-card-leaves pointer-events-none absolute -right-3 top-14 h-28 w-28"
                                            style={{ color: levelColor }}
                                        >
                                            <path d="M120 106C96 94 78 72 66 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".45" />
                                            <path d="M94 88C72 90 58 74 58 54c20 0 34 14 36 34Z" fill="currentColor" opacity=".3" />
                                            <path d="M77 62c2-20 18-34 40-34-2 20-18 33-40 34ZM66 40c-9-12-8-27 2-38 9 11 9 26-2 38Z" fill="currentColor" opacity=".4" />
                                        </svg>

                                        {/* Floating AI / Read Badges */}
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                                            {story.id.startsWith('ai-') && (
                                                <span className="text-[9px] bg-[var(--color-primary)] text-[var(--color-on-primary)] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-0.5">
                                                    <Sparkles className="w-2.5 h-2.5" /> AI
                                                </span>
                                            )}
                                            {isRead && (
                                                <span className="text-[9px] bg-[var(--color-success)] text-[var(--color-on-primary)] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-0.5">
                                                    <Check className="w-2.5 h-2.5" /> {t('storyList.read')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-7 flex flex-col flex-1 gap-5 text-left">
                                            {/* Level Badge and Word Count */}
                                            <div className="flex justify-between items-center text-xs font-mono text-[var(--color-on-surface-muted)]">
                                                <span 
                                                    style={{ color: 'var(--color-level-ink)', backgroundColor: levelColor }} 
                                                    className="px-3.5 py-1.5 text-xs font-extrabold rounded-full font-display"
                                                >
                                                    Nivel {story.level}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1 font-medium">
                                                        <Clock className="w-3 h-3" /> {story.estimatedMinutes} min
                                                    </span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-on-surface-muted)]/35" />
                                                    <span>{story.wordCount} palabras</span>
                                                </div>
                                            </div>

                                            {/* Story Title & Spanish Translation */}
                                            <div className="flex items-start gap-3.5">
                                                <div
                                                    className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
                                                    style={{ backgroundColor: `color-mix(in oklch, ${levelColor} 22%, var(--color-card))` }}
                                                >
                                                    {hasCustomIcon ? (
                                                        <StoryIcon storyId={story.id} className="h-6 w-6 text-[var(--color-primary)]" />
                                                    ) : (
                                                        <Sparkles className="h-6 w-6 text-[var(--color-primary)]" />
                                                    )}
                                                </div>
                                                <div className="space-y-0.5 min-w-0 flex-1">
                                                    <h3 className="font-extrabold text-[17.5px] leading-tight text-[var(--color-on-surface)] line-clamp-1">{story.title}</h3>
                                                    <p className="text-xs italic text-[var(--color-on-surface-muted)]/85 line-clamp-1">
                                                        {details.spanishTitle}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-[13.5px] line-clamp-2 leading-relaxed flex-1 text-[var(--color-on-surface-muted)]">
                                                {details.description}
                                            </p>

                                            {/* Progress bloom */}
                                            <div className="pt-3 border-t border-[var(--color-surface-container-highest)]/20 space-y-1">
                                                <div className="flex justify-between items-center text-xs font-bold">
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

                                            {/* Action Visual Indicator (entire card is clickable) */}
                                            <div 
                                                className={`w-full mt-2 py-3 rounded-full text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-200 ${
                                                    storyProgress === 100
                                                        ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20'
                                                        : 'bg-[var(--color-surface-container-highest)] text-[var(--color-primary)] hover:bg-[var(--color-surface-container-high)]'
                                                }`}
                                            >
                                                <Eye className="h-4 w-4" />
                                                {storyProgress === 100 ? 'Releer historia' : storyProgress > 0 ? 'Continuar leyendo' : 'Empezar lectura'}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <div className="text-center py-20 space-y-3 bg-[var(--color-surface-container-low)] rounded-[var(--radius-lg)] p-8 shadow-sm">
                        <Compass className="h-12 w-12 text-[var(--color-outline)] mx-auto" />
                        <p className="text-sm font-bold text-[var(--color-on-surface)]">No se encontraron historias</p>
                        <p className="text-xs text-[var(--color-on-surface-muted)]">Inténtalo buscando con otras palabras clave o niveles de filtro.</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
