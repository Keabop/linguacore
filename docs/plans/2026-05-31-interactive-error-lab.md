# Interactive Error Lab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a fully interactive, gamified "Laboratorio de Errores" (*ErrorLab*) in Voxie (LinguaCore), giving Pro users an engaging 3-step study flow (Analysis, Scrambled Sentence Builder, and Multiple-Choice Quiz) to review their collected language errors, integrated under `/review/lab`.

**Architecture:** 
1. **Route Registration**: Add `/review/lab` as a protected lazy route under `Layout` in `App.tsx`.
2. **Component Structure**:
   - `ErrorLab.tsx` handles state machines for: active card index, active sub-step (0: Analysis, 1: Build, 2: Quiz), scrambled word buttons, and quiz options.
   - **Step 1 (Analysis)**: Double-card presentation contrasting original and corrected sentences with dynamic explanations.
   - **Step 2 (Sentence Builder)**: Word scrambling and tap-ordering interactive logic.
   - **Step 3 (Smart Quiz)**: Multi-choice selection with error distractor logic, which calls `reviewErrorCard(card, Rating.Good)` upon success.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase, Lucide React, Vitest.

---

### Task 1: Register ErrorLab Protected Route in App.tsx

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/ErrorLab.tsx` (scaffold)

**Step 1: Create a basic scaffold for `ErrorLab.tsx`**
Create `src/pages/ErrorLab.tsx` with a basic default export:
```typescript
import { useTranslation } from 'react-i18next';

export default function ErrorLab() {
    const { t } = useTranslation();
    return (
        <div className="py-8">
            <h1 className="text-2xl font-black">Laboratorio de Errores</h1>
        </div>
    );
}
```

**Step 2: Register dynamic lazy import and route in `src/App.tsx`**
Open `src/App.tsx`:
- Import the lazy route (around line 43):
```typescript
const ErrorLab = lazyRetry(() => import('./pages/ErrorLab'));
```
- Register the route inside Layout routes (around line 83):
```typescript
                    <Route path="/review" element={<ReviewSession />} />
                    <Route path="/review/lab" element={<SafeRoute><ErrorLab /></SafeRoute>} />
```

**Step 3: Run build check**
Run: `npm run build`
Expected: SUCCESS

**Step 4: Commit**
```bash
git add src/App.tsx src/pages/ErrorLab.tsx
git commit -m "feat: register ErrorLab page scaffold and protected route in App.tsx"
```

---

### Task 2: Implement the Interactive 3-Step Minigame logic in ErrorLab.tsx

**Files:**
- Modify: `src/pages/ErrorLab.tsx`

**Step 1: Write complete gamified component structure**
Implement `ErrorLab.tsx` using `useErrorCards` to query cards, manage scrambled words states, and handle quiz generations:
```typescript
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useErrorCards } from '../hooks/useErrorCards';
import { useAuth } from '../lib/AuthContext';
import { ArrowLeft, Sparkles, BookOpen, Check, X, AlertCircle, RefreshCw, Trophy } from 'lucide-react';
import { Rating } from '../lib/fsrs';

export default function ErrorLab() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { dueErrorCards, reviewErrorCard } = useErrorCards();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [step, setStep] = useState<0 | 1 | 2>(0); // 0: Analysis, 1: Build, 2: Quiz
    const [sessionCompleted, setSessionCompleted] = useState(false);

    // Step 2: Sentence Builder States
    const [scrambledWords, setScrambledWords] = useState<{ id: string; word: string; selected: boolean }[]>([]);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [builderStatus, setBuilderStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');

    // Step 3: Quiz States
    const [quizOptions, setQuizOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [quizStatus, setQuizStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');

    const currentCard = dueErrorCards[currentIndex];

    // Helper to shuffle array
    const shuffleArray = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

    // Initialize Step 2 Scrambled Words
    useEffect(() => {
        if (!currentCard || step !== 1) return;
        const words = currentCard.correctedSentence
            .replace(/[.!?]/g, '')
            .split(/\s+/)
            .filter(Boolean);
        
        setScrambledWords(shuffleArray(words).map((w, idx) => ({
            id: `${w}-${idx}`,
            word: w,
            selected: false
        })));
        setSelectedWords([]);
        setBuilderStatus('pending');
    }, [currentCard, step]);

    // Initialize Step 3 Quiz Options
    useEffect(() => {
        if (!currentCard || step !== 2) return;
        const correct = currentCard.correctedSentence;
        const incorrect = currentCard.originalSentence;
        
        // Build a distractor by slightly modifying the corrected sentence
        const words = correct.split(' ');
        const distractor = words.length > 2
            ? [...words.slice(0, -1), words[words.length - 1] === '?' ? '!' : 'too'].join(' ')
            : correct + ' instead';

        setQuizOptions(shuffleArray([correct, incorrect, distractor]));
        setSelectedOption(null);
        setQuizStatus('pending');
    }, [currentCard, step]);

    // Handle Word Tapping in Sentence Builder
    const handleTapScrambled = (id: string, word: string) => {
        if (builderStatus !== 'pending') return;
        setScrambledWords(prev => prev.map(item => item.id === id ? { ...item, selected: true } : item));
        setSelectedWords(prev => [...prev, word]);
    };

    const handleRemoveSelected = (word: string, scrambledId: string) => {
        if (builderStatus !== 'pending') return;
        setSelectedWords(prev => prev.filter((_, i) => i !== prev.indexOf(word)));
        setScrambledWords(prev => prev.map(item => item.id === scrambledId ? { ...item, selected: false } : item));
    };

    const checkBuilderAnswer = () => {
        if (!currentCard) return;
        const targetClean = currentCard.correctedSentence.replace(/[.!?]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
        const userClean = selectedWords.join(' ').toLowerCase().replace(/\s+/g, ' ').trim();

        if (userClean === targetClean) {
            setBuilderStatus('correct');
            setTimeout(() => setStep(2), 1500);
        } else {
            setBuilderStatus('incorrect');
        }
    };

    const resetBuilder = () => {
        if (!currentCard) return;
        const words = currentCard.correctedSentence
            .replace(/[.!?]/g, '')
            .split(/\s+/)
            .filter(Boolean);
        setScrambledWords(shuffleArray(words).map((w, idx) => ({
            id: `${w}-${idx}`,
            word: w,
            selected: false
        })));
        setSelectedWords([]);
        setBuilderStatus('pending');
    };

    // Handle Quiz Submission
    const handleSelectOption = async (option: string) => {
        if (quizStatus !== 'pending' || !currentCard) return;
        setSelectedOption(option);
        
        const isCorrect = option === currentCard.correctedSentence;
        
        if (isCorrect) {
            setQuizStatus('correct');
            await reviewErrorCard(currentCard, Rating.Good);
            setTimeout(() => {
                if (currentIndex + 1 < dueErrorCards.length) {
                    setCurrentIndex(prev => prev + 1);
                    setStep(0);
                } else {
                    setSessionCompleted(true);
                }
            }, 1800);
        } else {
            setQuizStatus('incorrect');
            await reviewErrorCard(currentCard, Rating.Again);
        }
    };

    // Empty state
    if (dueErrorCards.length === 0 && !sessionCompleted) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 max-w-md mx-auto">
                <style>{`.floating-bar { display: none !important; }`}</style>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight">Laboratorio despejado</h2>
                    <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">
                        ¡Excelente! No tienes errores pendientes por repasar en este momento. Sigue platicando con tu Tutor de IA y leyendo historias para recopilar nuevos conocimientos.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="btn-primary px-8 py-3.5 text-sm"
                >
                    Volver al Dashboard
                </button>
            </div>
        );
    }

    if (sessionCompleted) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 max-w-md mx-auto animate-pulse">
                <style>{`.floating-bar { display: none !important; }`}</style>
                <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-[var(--color-success)]" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight">¡Misión Cumplida!</h2>
                    <p className="text-sm text-[var(--color-on-surface-muted)] leading-relaxed">
                        Has completado con éxito todos los entrenamientos de tus errores acumulados. Tu capacidad de redacción y comprensión ha mejorado notablemente.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="btn-primary px-8 py-3.5 text-sm"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-full overflow-hidden flex flex-col min-w-0">
            <style>{`.floating-bar { display: none !important; }`}</style>
            
            {/* Header */}
            <div className="flex justify-between items-center text-sm shrink-0">
                <button
                    onClick={() => navigate('/')}
                    className="text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-colors flex items-center gap-1.5"
                >
                    <ArrowLeft className="w-4 h-4" /> Salir del Lab
                </button>
                <span className="font-bold text-[var(--color-primary)]">
                    Foco Semanal · Tarjeta {currentIndex + 1} de {dueErrorCards.length}
                </span>
            </div>

            {/* Stepper indicator */}
            <div className="flex gap-2">
                {[0, 1, 2].map((s) => (
                    <div
                        key={s}
                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            s === step 
                                ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)]' 
                                : s < step 
                                    ? 'bg-[var(--color-success)]' 
                                    : 'bg-[var(--color-surface-container)]'
                        }`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 0 && currentCard && (
                    <motion.div
                        key="analysis"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="widget space-y-4 !py-8">
                            <p className="text-[10px] text-accent-red font-bold uppercase tracking-wider">Tu oración original</p>
                            <p className="text-base line-through text-red-500/80">{currentCard.originalSentence}</p>
                        </div>

                        <div className="widget space-y-4 !py-8 bg-gradient-to-br from-green-500/5 to-[var(--color-success)]/10 border-l-4 border-[var(--color-success)]">
                            <p className="text-[10px] text-[var(--color-success)] font-bold uppercase tracking-wider">Oración correcta</p>
                            <p className="text-lg font-bold text-[var(--color-on-surface)]">{currentCard.correctedSentence}</p>
                        </div>

                        <div className="widget space-y-3">
                            <h4 className="text-xs font-bold text-[var(--color-on-surface-muted)] uppercase tracking-wider flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-[var(--color-primary)]" /> Explicación del Tutor
                            </h4>
                            <p className="text-sm leading-relaxed text-[var(--color-on-surface)]">{currentCard.explanation}</p>
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            className="btn-primary w-full py-4 text-sm font-bold active:scale-98"
                        >
                            Comenzar Reconstrucción
                        </button>
                    </motion.div>
                )}

                {step === 1 && currentCard && (
                    <motion.div
                        key="build"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="widget space-y-4 text-center">
                            <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider">Fase 2: Sentence Builder</p>
                            <h3 className="text-sm text-[var(--color-on-surface-muted)]">Reordena las fichas para formar la oración corregida</h3>
                            
                            {/* Selected words slot */}
                            <div className="min-h-[60px] p-3 rounded-2xl bg-[var(--color-surface-container-low)] flex flex-wrap gap-2 justify-center items-center">
                                {selectedWords.map((word, idx) => {
                                    // Find matching scrambled word ID
                                    const match = scrambledWords.find(item => item.word === word && item.selected);
                                    return (
                                        <button
                                            key={`${word}-${idx}`}
                                            onClick={() => match && handleRemoveSelected(word, match.id)}
                                            className="px-3 py-1.5 text-xs font-semibold bg-[var(--color-primary)] text-white rounded-xl shadow-md active:scale-95"
                                        >
                                            {word}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Scrambled word buttons */}
                        <div className="flex flex-wrap gap-2.5 justify-center">
                            {scrambledWords.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleTapScrambled(item.id, item.word)}
                                    disabled={item.selected || builderStatus !== 'pending'}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 ${
                                        item.selected 
                                            ? 'opacity-30 bg-[var(--color-surface-container)] text-[var(--color-on-surface-muted)] cursor-not-allowed' 
                                            : 'bg-[var(--color-card)] hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface)] active:scale-95 cursor-pointer'
                                    }`}
                                >
                                    {item.word}
                                </button>
                            ))}
                        </div>

                        {builderStatus === 'correct' && (
                            <div className="text-center text-[var(--color-success)] font-bold text-sm flex items-center justify-center gap-1.5 animate-pulse">
                                <Check className="w-5 h-5" /> ¡Excelente orden! Avanzando al Quiz de validación...
                            </div>
                        )}

                        {builderStatus === 'incorrect' && (
                            <div className="text-center space-y-3">
                                <p className="text-accent-red font-bold text-xs flex items-center justify-center gap-1.5">
                                    <X className="w-4 h-4" /> La secuencia no coincide. ¡Intenta de nuevo!
                                </p>
                                <button
                                    onClick={resetBuilder}
                                    className="px-4 py-2 rounded-full bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] text-[10px] font-bold transition-all"
                                >
                                    <RefreshCw className="w-3 h-3 inline mr-1" /> Reestablecer fichas
                                </button>
                            </div>
                        )}

                        {builderStatus === 'pending' && (
                            <button
                                onClick={checkBuilderAnswer}
                                disabled={selectedWords.length === 0}
                                className="btn-primary w-full py-4 text-sm font-bold disabled:opacity-40 active:scale-98"
                            >
                                Verificar secuencia
                            </button>
                        )}
                    </motion.div>
                )}

                {step === 2 && currentCard && (
                    <motion.div
                        key="quiz"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="widget text-center space-y-2">
                            <p className="text-xs text-[var(--color-on-surface-muted)] uppercase tracking-wider">Fase 3: Smart Quiz</p>
                            <h3 className="text-base font-bold text-[var(--color-on-surface)]">¿Cuál es la oración gramaticalmente correcta?</h3>
                        </div>

                        <div className="space-y-3">
                            {quizOptions.map((option) => {
                                const isSelected = selectedOption === option;
                                const isCorrect = option === currentCard.correctedSentence;

                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleSelectOption(option)}
                                        disabled={quizStatus !== 'pending'}
                                        className={`w-full p-4 rounded-[1.5rem] text-left text-xs font-semibold shadow-sm transition-all duration-300 relative border-2 flex items-center justify-between ${
                                            quizStatus === 'pending'
                                                ? 'border-transparent bg-[var(--color-card)] hover:bg-[var(--color-surface-container)] hover:-translate-y-0.5 cursor-pointer'
                                                : isSelected
                                                    ? isCorrect
                                                        ? 'border-[var(--color-success)] bg-green-500/10 text-[var(--color-success)]'
                                                        : 'border-red-500 bg-red-500/10 text-red-500'
                                                    : isCorrect
                                                        ? 'border-[var(--color-success)] bg-green-500/5 text-[var(--color-success)]'
                                                        : 'border-transparent bg-[var(--color-card)] opacity-50'
                                        }`}
                                    >
                                        <span>{option}</span>
                                        {quizStatus !== 'pending' && isCorrect && (
                                            <Check className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                                        )}
                                        {quizStatus !== 'pending' && isSelected && !isCorrect && (
                                            <X className="w-4 h-4 text-red-500 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {quizStatus === 'correct' && (
                            <div className="text-center text-[var(--color-success)] font-bold text-sm flex items-center justify-center gap-1.5">
                                <Check className="w-5 h-5" /> ¡Correcto! Error dominado y guardado en FSRS.
                            </div>
                        )}

                        {quizStatus === 'incorrect' && (
                            <div className="text-center space-y-3">
                                <p className="text-red-500 font-bold text-xs flex items-center justify-center gap-1.5">
                                    <X className="w-4 h-4" /> Opción incorrecta. Estudia los detalles y reintenta el quiz.
                                </p>
                                <button
                                    onClick={() => { setQuizStatus('pending'); setSelectedOption(null); }}
                                    className="px-5 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold shadow-md"
                                >
                                    Reintentar Quiz
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
