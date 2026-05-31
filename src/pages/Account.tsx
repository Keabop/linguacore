import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings, Flame, Layers, RotateCcw, BookOpen, Crown, Lock, Palette, Check, Download, Upload, Briefcase, Wand2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useTheme, type ProTheme } from '../lib/ThemeContext';
import { useCards } from '../hooks/useCards';
import { useLevelProgression } from '../hooks/useLevelProgression';
import { useTier } from '../hooks/useTier';
import LevelBadge from '../components/ui/LevelBadge';
import SettingsModal from '../components/SettingsModal';
import type { ReadStoryRow, CardRow } from '../lib/database.types';
import { generateCareerDeck } from '../lib/ai';
import { getVocab } from '../data';
import { toast } from '../lib/toast';

const themes: { id: ProTheme; name: string; color: string; isPro: boolean }[] = [
    { id: 'purple',     name: 'Fluid Scholar', color: '#702AE1', isPro: false },
    { id: 'ocean',      name: 'Ocean',         color: '#0891B2', isPro: true },
    { id: 'forest',     name: 'Forest',        color: '#16A34A', isPro: true },
    { id: 'midnight',   name: 'Midnight',      color: '#818CF8', isPro: true },
    { id: 'royal-gold', name: 'Royal Gold',    color: '#D97706', isPro: true },
];

export default function Account() {
    const { t } = useTranslation();
    const { user: authUser } = useAuth();
    const { totalCards } = useCards();
    const { user, progressInfo } = useLevelProgression();
    const { isPro, isFree } = useTier();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const { proTheme, setProTheme } = useTheme();
    const qc = useQueryClient();

    const [importText, setImportText] = useState('');
    const [importing, setImporting] = useState(false);
    const [showImportArea, setShowImportArea] = useState(false);
    const [profession, setProfession] = useState('');
    const [generatingDeck, setGeneratingDeck] = useState(false);

    const handleExportFSRS = async () => {
        try {
            const { data: cardsData, error } = await supabase
                .from('cards')
                .select('*');
            if (error) throw error;
            
            let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // Add BOM for Excel compatibility
            csvContent += 'Word,Translation,CEFR Level,State,Reps,Last Review\n';
            
            const typedCards = (cardsData || []) as CardRow[];
            
            for (const card of typedCards) {
                const vocab = getVocab(card.word_id);
                const word = card.word_id;
                const translation = vocab?.translations ? vocab.translations.join('; ') : 'Palabra personalizada';
                const level = vocab?.cefrLevel || 'B2';
                const state = card.state === 0 ? 'New' : card.state === 1 ? 'Learning' : card.state === 2 ? 'Review' : 'Relearning';
                const reps = card.reps;
                const lastReview = card.last_review ? new Date(card.last_review).toISOString().split('T')[0] : 'Never';
                
                const row = `"${word}","${translation}","${level}","${state}",${reps},"${lastReview}"`;
                csvContent += row + '\n';
            }
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `voxie_fsrs_deck_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success({
                title: 'Exportación completada',
                description: 'El mazo FSRS se ha descargado correctamente en formato CSV.'
            });
        } catch (err: any) {
            console.error('Failed to export CSV:', err);
            toast.error({
                title: 'Error de exportación',
                description: err.message || 'No se pudo exportar el mazo en CSV.'
            });
        }
    };

    const parseCSV = (csvText: string) => {
        const lines: string[][] = [];
        let currentLine: string[] = [];
        let currentCell = '';
        let inQuotes = false;

        const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (inQuotes) {
                if (char === '"') {
                    if (i + 1 < text.length && text[i + 1] === '"') {
                        currentCell += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    currentCell += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    currentLine.push(currentCell.trim());
                    currentCell = '';
                } else if (char === '\n') {
                    currentLine.push(currentCell.trim());
                    lines.push(currentLine);
                    currentLine = [];
                    currentCell = '';
                } else {
                    currentCell += char;
                }
            }
        }
        if (currentCell !== '' || currentLine.length > 0) {
            currentLine.push(currentCell.trim());
            lines.push(currentLine);
        }

        if (lines.length === 0) return [];

        const firstLine = lines[0].map(h => h.toLowerCase().trim());
        const headerKeywords = ['word', 'term', 'front', 'vocab', 'concept', 'palabra', 'english'];
        const otherKeywords = ['state', 'reps', 'last review', 'last_review'];
        const allKeywords = [...headerKeywords, ...otherKeywords];

        const hasHeader = firstLine.some(cell => allKeywords.some(kw => cell.includes(kw)));

        let wordIdx = -1;
        let stateIdx = -1;
        let repsIdx = -1;
        let lastReviewIdx = -1;

        if (hasHeader) {
            for (const kw of headerKeywords) {
                wordIdx = firstLine.findIndex(h => h.includes(kw));
                if (wordIdx !== -1) break;
            }
            stateIdx = firstLine.findIndex(h => h.includes('state'));
            repsIdx = firstLine.findIndex(h => h.includes('reps'));
            lastReviewIdx = firstLine.findIndex(h => h.includes('last review') || h.includes('last_review'));
        }

        if (wordIdx === -1) {
            wordIdx = 0;
        }

        const startIndex = hasHeader ? 1 : 0;
        if (lines.length <= startIndex) return [];

        const parsed: Array<{
            word: string;
            state: number;
            reps: number;
            lastReview: string | null;
        }> = [];

        for (let i = startIndex; i < lines.length; i++) {
            const row = lines[i];
            if (row.length <= wordIdx || !row[wordIdx]) continue;

            const word = row[wordIdx].toLowerCase().replace(/^"|"$/g, '').trim();
            if (!word) continue;

            let state = 0;
            if (stateIdx !== -1 && row[stateIdx]) {
                const rawState = row[stateIdx].replace(/^"|"$/g, '').trim().toLowerCase();
                if (rawState === 'learning') state = 1;
                else if (rawState === 'review') state = 2;
                else if (rawState === 'relearning') state = 3;
            }

            let reps = 0;
            if (repsIdx !== -1 && row[repsIdx]) {
                const parsedReps = parseInt(row[repsIdx].replace(/^"|"$/g, '').trim(), 10);
                if (!isNaN(parsedReps)) reps = parsedReps;
            }

            let lastReview: string | null = null;
            if (lastReviewIdx !== -1 && row[lastReviewIdx]) {
                const rawLastReview = row[lastReviewIdx].replace(/^"|"$/g, '').trim();
                if (rawLastReview && rawLastReview.toLowerCase() !== 'never') {
                    try {
                        const dateVal = new Date(rawLastReview);
                        if (!isNaN(dateVal.getTime())) {
                            lastReview = dateVal.toISOString();
                        }
                    } catch {
                        // ignore
                    }
                }
            }

            parsed.push({ word, state, reps, lastReview });
        }

        return parsed;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (text) {
                handleImportWords(text);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleImportWords = async (text: string) => {
        if (!text.trim() || !authUser?.id) return;
        
        const lowercaseText = text.toLowerCase();
        const firstLine = lowercaseText.split('\n')[0] || '';
        const csvKeywords = ['word', 'term', 'front', 'vocab', 'concept', 'palabra', 'english', 'state', 'reps', 'last review', 'last_review'];
        const firstLineCells = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const isCSV = firstLineCells.some(cell => csvKeywords.some(kw => cell.includes(kw))) || (firstLine.includes(',') && text.trim().includes('\n'));
        
        setImporting(true);
        try {
            let importedCount = 0;
            if (isCSV) {
                const parsedRecords = parseCSV(text);
                if (parsedRecords.length === 0) {
                    toast.error({
                        title: 'Error de formato',
                        description: 'No se encontraron registros válidos en el CSV.'
                    });
                    setImporting(false);
                    return;
                }
                
                for (const record of parsedRecords) {
                    const wordClean = record.word;
                    const { error: kwError } = await supabase
                        .from('known_words')
                        .upsert({ 
                            user_id: authUser.id, 
                            word_id: wordClean,
                            known_at: record.lastReview || new Date().toISOString()
                        });
                    
                    if (kwError) {
                        console.error(`Failed to insert into known_words: ${wordClean}`, kwError);
                        continue;
                    }

                    const stability = record.state > 0 ? 2 * record.reps : 0;
                    const { error: cardError } = await supabase
                        .from('cards')
                        .upsert({
                            user_id: authUser.id,
                            word_id: wordClean,
                            story_id: 'imported',
                            state: record.state,
                            due: record.lastReview || new Date().toISOString(),
                            stability,
                            difficulty: 0,
                            elapsed_days: 0,
                            scheduled_days: 0,
                            reps: record.reps,
                            lapses: 0,
                            last_review: record.lastReview,
                        }, { onConflict: 'user_id,word_id' });
                    
                    if (cardError) {
                        console.error(`Failed to insert into cards: ${wordClean}`, cardError);
                        continue;
                    }
                    
                    importedCount++;
                }
            } else {
                const rawWords = text.split(/[,;\n]+/).map(w => w.trim()).filter(Boolean);
                if (rawWords.length === 0) {
                    setImporting(false);
                    return;
                }
                
                for (const word of rawWords) {
                    const wordClean = word.toLowerCase();
                    
                    const { error: kwError } = await supabase
                        .from('known_words')
                        .upsert({ 
                            user_id: authUser.id, 
                            word_id: wordClean,
                            known_at: new Date().toISOString()
                        });
                    
                    if (kwError) {
                        console.error(`Failed to insert into known_words: ${wordClean}`, kwError);
                        continue;
                    }
                        
                    const { error: cardError } = await supabase
                        .from('cards')
                        .upsert({
                            user_id: authUser.id,
                            word_id: wordClean,
                            story_id: 'imported',
                            state: 0,
                            due: new Date().toISOString(),
                            stability: 0,
                            difficulty: 0,
                            elapsed_days: 0,
                            scheduled_days: 0,
                            reps: 0,
                            lapses: 0,
                            last_review: null,
                        }, { onConflict: 'user_id,word_id' });
                    
                    if (cardError) {
                        console.error(`Failed to insert into cards: ${wordClean}`, cardError);
                        continue;
                    }
                    
                    importedCount++;
                }
            }
            
            toast.success({
                title: 'Importación exitosa',
                description: `Se han agregado e inicializado en FSRS ${importedCount} palabras.`
            });
            
            setImportText('');
            setShowImportArea(false);
            
            qc.invalidateQueries({ queryKey: ['knownWordsCount', authUser?.id] });
            qc.invalidateQueries({ queryKey: ['cards', authUser?.id] });
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err: any) {
            console.error('Import failed:', err);
            toast.error({
                title: 'Error de importación',
                description: err.message || 'Ocurrió un error inesperado al importar las palabras.'
            });
        } finally {
            setImporting(false);
        }
    };

    const handleCreateCareerDeck = async (prof: string) => {
        if (!authUser?.id) return;
        
        const cleanProf = prof.trim();
        const hasLetter = /\p{L}/u.test(cleanProf);
        if (cleanProf.length < 3 || !hasLetter) {
            toast.warning({
                title: 'Entrada no válida',
                description: 'Por favor, introduce una profesión válida de al menos 3 caracteres.'
            });
            return;
        }
        
        setGeneratingDeck(true);
        try {
            const level = progressInfo?.currentLevel || 'A1';
            const words = await generateCareerDeck(cleanProf, level);
            
            if (!words || words.length === 0) {
                throw new Error('La profesión ingresada no es válida o no es coherente para extraer vocabulario técnico.');
            }
            
            let addedCount = 0;
            const storyId = `career-${cleanProf.toLowerCase().replace(/\s+/g, '-')}`;
            
            for (const item of words) {
                const wordClean = item.word.toLowerCase();
                
                const { error: kwError } = await supabase
                    .from('known_words')
                    .upsert({ 
                        user_id: authUser.id, 
                        word_id: wordClean,
                        known_at: new Date().toISOString()
                    });
                    
                if (kwError) {
                    console.error(`Failed to insert known word ${wordClean}`, kwError);
                    continue;
                }
                
                const { error: cardError } = await supabase
                    .from('cards')
                    .upsert({
                        user_id: authUser.id,
                        word_id: wordClean,
                        story_id: storyId,
                        state: 0,
                        due: new Date().toISOString(),
                        stability: 0,
                        difficulty: 0,
                        elapsed_days: 0,
                        scheduled_days: 0,
                        reps: 0,
                        lapses: 0,
                        last_review: null,
                    }, { onConflict: 'user_id,word_id' });
                
                if (cardError) {
                    console.error(`Failed to insert card ${wordClean}`, cardError);
                    continue;
                }
                
                addedCount++;
            }
            
            toast.success({
                title: `Mazo de ${cleanProf} listo`,
                description: `Se han generado e importado ${addedCount} palabras profesionales nivel ${level}.`
            });
            
            setProfession('');
            
            qc.invalidateQueries({ queryKey: ['knownWordsCount', authUser?.id] });
            qc.invalidateQueries({ queryKey: ['cards', authUser?.id] });
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err: any) {
            console.error('Failed to generate career deck:', err);
            toast.error({
                title: 'Error de generación',
                description: err.message || 'No se pudo contactar con el servicio de IA o la clave de API no está configurada.'
            });
        } finally {
            setGeneratingDeck(false);
        }
    };

    const { data: readStories } = useQuery({
        queryKey: ['readStories', authUser?.id],
        queryFn: async () => {
            const { data } = await supabase.from('read_stories').select('*');
            return (data ?? []) as ReadStoryRow[];
        },
        enabled: !!authUser?.id,
    });

    const { data: cards } = useQuery({
        queryKey: ['cards', authUser?.id],
        queryFn: async () => {
            const { data } = await supabase.from('cards').select('*');
            return (data ?? []) as CardRow[];
        },
        enabled: !!authUser?.id,
    });

    const { data: knownCount } = useQuery({
        queryKey: ['knownWordsCount', authUser?.id],
        queryFn: async () => {
            const { count } = await supabase.from('known_words').select('*', { count: 'exact', head: true });
            return count ?? 0;
        },
        enabled: !!authUser?.id,
    });

    const totalReviews = cards?.reduce((sum, c) => sum + c.reps, 0) ?? 0;
    const avgRetention = (() => {
        if (!cards || cards.length === 0) return 0;
        const reviewed = cards.filter(c => c.reps > 0);
        if (reviewed.length === 0) return 0;
        const correct = reviewed.reduce((s, c) => s + (c.reps - c.lapses), 0);
        const total = reviewed.reduce((s, c) => s + c.reps, 0);
        return total > 0 ? Math.round((correct / total) * 100) : 0;
    })();

    // Activity heatmap data (last 35 days) — Pro only
    const activityData = (() => {
        if (!readStories && !cards) return [];
        const days: { date: string; count: number }[] = [];
        for (let i = 34; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000);
            const ds = d.toISOString().split('T')[0];
            let count = 0;
            readStories?.forEach(r => {
                if (r.completed_at?.split('T')[0] === ds) count++;
            });
            cards?.forEach(c => {
                if (c.last_review && c.last_review.split('T')[0] === ds) count++;
            });
            days.push({ date: ds, count });
        }
        return days;
    })();

    const maxActivity = Math.max(...activityData.map(d => d.count), 1);

    if (!user) return null;

    const initial = authUser?.email?.charAt(0).toUpperCase() ?? '?';

    return (
        <>
            <div className="space-y-8">
                {/* ===== Profile Header ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center text-2xl font-black text-white shadow-[var(--shadow-elevated)]">
                            {initial}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-[var(--color-on-surface)]">{authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0]}</h1>
                            <p className="text-sm text-[var(--color-on-surface-muted)]">{authUser?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <LevelBadge level={progressInfo?.currentLevel ?? 'A1'} size="compact" />
                                {isPro && (
                                    <span className="text-xs bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white px-3 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-[var(--shadow-card)]">
                                        <Crown className="w-3 h-3" /> Pro
                                    </span>
                                )}
                                {isFree && (
                                    <span className="text-xs bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] px-3 py-0.5 rounded-full font-medium">
                                        {t('account.planFree')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-2.5 rounded-full bg-[var(--color-card)] shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
                        aria-label={t('settings.title')}
                    >
                        <Settings className="w-5 h-5 text-[var(--color-on-surface-muted)]" />
                    </button>
                </motion.div>

                {/* ===== Basic Stats (all users) ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                    <StatCard icon={<Flame className="w-5 h-5" />} value={user.streak} label={t('dashboard.streak')} color="text-[var(--color-warning)]" />
                    <StatCard icon={<Layers className="w-5 h-5" />} value={(totalCards ?? 0) + (knownCount ?? 0)} label={t('dashboard.wordsLearned')} color="text-[var(--color-level-a1)]" />
                    <StatCard icon={<BookOpen className="w-5 h-5" />} value={readStories?.length ?? 0} label={t('dashboard.storiesRead')} color="text-[var(--color-primary)]" />
                    <StatCard icon={<RotateCcw className="w-5 h-5" />} value={totalReviews} label={t('stats.totalReviews')} color="text-[var(--color-primary)]" />
                </motion.div>

                {/* ===== Gestión de Mazos de Vocabulario ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="bg-[var(--color-card)] rounded-[2rem] p-6 shadow-[var(--shadow-card)] space-y-6 text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold tracking-tight text-[var(--color-on-surface)]">
                                Herramientas de Vocabulario y Mazos
                            </h2>
                            <p className="text-xs text-[var(--color-on-surface-muted)]">
                                Exporta tu progreso, importa listas de palabras personalizadas o genera mazos profesionales con Inteligencia Artificial.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* SECCIÓN EXPORTAR */}
                        <div className="bg-[var(--color-surface-container-low)] p-5 rounded-2xl flex flex-col justify-between space-y-4 border border-[var(--color-surface-container)]">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-on-surface)]">
                                    <Download className="w-4 h-4 text-[var(--color-primary)]" />
                                    <span>Exportar Mazo FSRS</span>
                                </div>
                                <p className="text-[10px] text-[var(--color-on-surface-muted)] leading-relaxed">
                                    Descarga un archivo CSV compatible con Excel y Anki que contiene tu vocabulario, nivel CEFR y estadísticas de repetición espaciada.
                                </p>
                            </div>
                            <button
                                onClick={handleExportFSRS}
                                className="w-full flex items-center justify-center gap-2 bg-[var(--color-surface-container-highest)] hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-on-surface)] text-xs font-bold py-3 px-4 rounded-xl shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                Exportar en CSV
                            </button>
                        </div>

                        {/* SECCIÓN IMPORTAR */}
                        <div className="bg-[var(--color-surface-container-low)] p-5 rounded-2xl flex flex-col justify-between space-y-4 border border-[var(--color-surface-container)]">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-on-surface)]">
                                    <Upload className="w-4 h-4 text-[var(--color-primary)]" />
                                    <span>Importar Vocabulario</span>
                                </div>
                                <p className="text-[10px] text-[var(--color-on-surface-muted)] leading-relaxed">
                                    Agrega vocabulario de forma masiva subiendo archivos CSV de otras aplicaciones (como Anki o Quizlet) o pegando una lista de palabras en inglés separadas por comas.
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    id="csv-file-input"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    disabled={importing}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="csv-file-input"
                                    className={`w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
                                        importing ? 'opacity-50 pointer-events-none' : ''
                                    }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    Subir archivo CSV
                                </label>
                                
                                <button
                                    onClick={() => setShowImportArea(!showImportArea)}
                                    className="w-full flex items-center justify-center gap-2 bg-[var(--color-surface-container-highest)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] text-xs font-bold py-3 px-4 rounded-xl shadow-[var(--shadow-card)] transition-all duration-300 cursor-pointer"
                                >
                                    {showImportArea ? (
                                        <>
                                            <ChevronUp className="w-4 h-4" />
                                            Ocultar Panel
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            Pegar texto plano
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* SECCIÓN IA CAREER DECK */}
                        <div className="bg-[var(--color-surface-container-low)] p-5 rounded-2xl flex flex-col justify-between space-y-4 border border-[var(--color-surface-container)]">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-on-surface)]">
                                    <Briefcase className="w-4 h-4 text-[var(--color-primary)]" />
                                    <span>Mazo Profesional IA</span>
                                </div>
                                <p className="text-[10px] text-[var(--color-on-surface-muted)] leading-relaxed">
                                    Genera instantáneamente 15 términos profesionales de alto impacto y ejemplos prácticos basados en tu carrera o industria.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={profession}
                                    onChange={(e) => setProfession(e.target.value)}
                                    placeholder="ej: Software Engineer, Doctor..."
                                    className="flex-1 min-w-0 bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-xs px-3 py-2.5 rounded-xl border border-[var(--color-surface-container-high)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                                    disabled={generatingDeck}
                                />
                                <button
                                    onClick={() => handleCreateCareerDeck(profession)}
                                    disabled={generatingDeck || !profession.trim()}
                                    className="flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white text-xs font-bold p-3 rounded-xl disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5 shadow-[var(--shadow-card)] transition-all cursor-pointer"
                                    title="Generar mazo profesional"
                                >
                                    {generatingDeck ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PANEL DE IMPORTACIÓN DESPLEGADO */}
                    {showImportArea && (
                        <div className="bg-[var(--color-surface-container-low)] p-5 rounded-2xl space-y-3 border border-[var(--color-surface-container-high)]">
                            <span className="text-xs font-bold block text-[var(--color-on-surface)]">
                                Introduce tus palabras:
                            </span>
                            <textarea
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder="Separadas por comas o saltos de línea, ej:&#10;challenge, outcome, achieve, step-by-step"
                                className="w-full h-24 bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-xs p-3 rounded-xl border border-[var(--color-surface-container-high)] focus:outline-none focus:border-[var(--color-primary)] transition-all resize-none"
                                disabled={importing}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setImportText('');
                                        setShowImportArea(false);
                                    }}
                                    className="px-4 py-2 rounded-xl text-xs text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-container-high)] transition-all cursor-pointer"
                                    disabled={importing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleImportWords(importText)}
                                    disabled={importing || !importText.trim()}
                                    className="flex items-center gap-2 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white text-xs font-bold px-5 py-2 rounded-xl disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5 shadow-[var(--shadow-card)] transition-all cursor-pointer"
                                >
                                    {importing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Confirmar Importación
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* ===== Level Progress ===== */}
                {progressInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-[var(--color-card)] rounded-[2rem] p-6 shadow-[var(--shadow-card)]"
                    >
                        <div className="text-sm font-bold text-[var(--color-on-surface-muted)] mb-4">{t('progress.currentLevel')}</div>
                        <div className="flex items-center gap-4">
                            <LevelBadge level={progressInfo.currentLevel} size="default" />
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-[var(--color-on-surface-muted)] font-medium">{progressInfo.unitsCompleted}/{progressInfo.unitsTotal} {t('progress.unitsCompleted').toLowerCase()}</span>
                                    <span className="text-[var(--color-on-surface-muted)] font-bold">{progressInfo.overallPercent}%</span>
                                </div>
                                <div className="h-2.5 bg-[var(--color-surface-container-highest)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] rounded-full transition-all duration-500"
                                        style={{ width: `${progressInfo.overallPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ===== Apariencia y Colores ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="bg-[var(--color-card)] rounded-[2rem] p-6 shadow-[var(--shadow-card)] space-y-4 text-left"
                >
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-[var(--color-primary)]" />
                        <h2 className="text-sm font-bold text-[var(--color-on-surface-muted)]">Apariencia y Colores</h2>
                    </div>
                    
                    <div className="space-y-1">
                        <span className="text-xs font-bold block">Gama de Colores de Marca</span>
                        <span className="text-[10px] block text-[var(--color-on-surface-muted)]">
                            Personaliza los colores de interfaz de tu Fluid Scholar. Desbloquea estéticas exclusivas con tu suscripción Pro.
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                        {themes.map((theme) => {
                            const isSelected = proTheme === theme.id;
                            const progressLocked = theme.isPro && !isPro;

                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => {
                                        if (!progressLocked) setProTheme(theme.id);
                                    }}
                                    disabled={progressLocked}
                                    className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all relative ${
                                        isSelected
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                            : 'border-[var(--color-surface-container)] bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)]/40'
                                    } ${progressLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    {/* Circle Color Accent Indicator */}
                                    <span 
                                        style={{ backgroundColor: theme.color }}
                                        className="h-4 w-4 rounded-full border border-white shrink-0 block" 
                                    />

                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-bold block truncate">{theme.name}</span>
                                        <span className="text-[9px] block text-[var(--color-on-surface-muted)] truncate">
                                            {theme.isPro ? (
                                                <span className="inline-flex items-center gap-0.5">
                                                    <Crown className="h-2.5 w-2.5 text-amber-500 fill-amber-500 shrink-0" /> Exclusivo Pro
                                                </span>
                                            ) : 'Gratuito'}
                                        </span>
                                    </div>

                                    {isSelected && (
                                        <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white">
                                            <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />
                                        </span>
                                    )}

                                    {progressLocked && (
                                        <span className="absolute top-2 right-2 text-[var(--color-on-surface-muted)]">
                                            <Lock className="h-3.5 w-3.5" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ===== Pro Stats: Activity Heatmap ===== */}
                {isPro ? (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[var(--color-card)] rounded-[2rem] p-6 shadow-[var(--shadow-card)]"
                    >
                        <div className="text-sm font-bold text-[var(--color-on-surface-muted)] mb-4">{t('stats.activity')}</div>
                        <div className="grid grid-cols-7 gap-2">
                            {activityData.map((day) => {
                                const intensity = day.count > 0 ? Math.max(0.2, day.count / maxActivity) : 0;
                                return (
                                    <div
                                        key={day.date}
                                        className="aspect-square rounded-lg transition-colors"
                                        style={{
                                            backgroundColor: day.count > 0
                                                ? `rgba(34, 197, 94, ${0.15 + intensity * 0.65})`
                                                : 'rgba(255, 255, 255, 0.03)',
                                        }}
                                        title={`${day.date}: ${day.count} ${t('stats.activities')}`}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] text-[var(--color-on-surface-muted)]">
                            <span>{t('stats.lessActive')}</span>
                            <div className="flex gap-1">
                                {[0, 0.2, 0.4, 0.7, 1].map((op, i) => (
                                    <div
                                        key={i}
                                        className="w-2.5 h-2.5 rounded-md"
                                        style={{ backgroundColor: op > 0 ? `rgba(34, 197, 94, ${0.15 + op * 0.65})` : 'rgba(255,255,255,0.03)' }}
                                    />
                                ))}
                            </div>
                            <span>{t('stats.moreActive')}</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[var(--color-surface-container)] rounded-[2rem] p-6 shadow-[var(--shadow-card)]"
                    >
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shadow-[var(--shadow-card)]">
                                <Lock className="w-5 h-5 text-[var(--color-primary)]" />
                            </div>
                            <p className="text-sm text-[var(--color-on-surface-muted)]">{t('account.proStats')}</p>
                            <Link
                                to="/pricing"
                                className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
                            >
                                {t('account.upgradeToPro')}
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* ===== Pro Stats: Vocabulary Breakdown ===== */}
                {isPro && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-[var(--color-card)] rounded-[2rem] p-6 shadow-[var(--shadow-card)]"
                    >
                        <div className="text-sm font-bold text-[var(--color-on-surface-muted)] mb-4">{t('stats.vocabulary')}</div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--color-on-surface-muted)]">{t('stats.inDeck')}</span>
                                <span className="text-sm font-bold text-accent-blue">{totalCards}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--color-on-surface-muted)]">{t('stats.knownWords')}</span>
                                <span className="text-sm font-bold text-[var(--color-primary)]">{knownCount ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--color-on-surface-muted)]">{t('stats.avgRetention')}</span>
                                <span className="text-sm font-bold text-accent-purple">{avgRetention}%</span>
                            </div>
                            <div className="bg-[var(--color-surface-container)] rounded-2xl px-4 py-3 flex items-center justify-between mt-2">
                                <span className="text-sm font-semibold">{t('stats.total')}</span>
                                <span className="text-sm font-bold text-[var(--color-on-surface)]">{(totalCards ?? 0) + (knownCount ?? 0)}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
    );
}

function StatCard({ icon, value, label, color }: {
    icon: React.ReactNode; value: number | string; label: string; color: string;
}) {
    return (
        <div className="bg-[var(--color-card)] rounded-[2rem] p-5 text-center shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
            <div className={`flex justify-center ${color}`}>{icon}</div>
            <p className={`text-2xl font-black tracking-tight mt-1 ${color}`}>{value}</p>
            <p className="text-[10px] text-[var(--color-on-surface-muted)] mt-0.5">{label}</p>
        </div>
    );
}
