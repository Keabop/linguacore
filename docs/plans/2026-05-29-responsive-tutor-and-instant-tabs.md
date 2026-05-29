# Responsive Tutor and Instant Tabs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the AI Tutor interface completely responsive and visually premium on mobile devices, and eliminate the screen flicker/white flash during tab transitions in the main app layout.

**Architecture:** 
1. Convert core navigational pages from dynamic lazy-loaded imports to static imports in `src/App.tsx` to prevent React Suspense loading flashes.
2. Optimize Framer Motion transition durations and parameters in `src/components/Layout.tsx` for instantaneous crossfading.
3. Apply flexbox limits, truncation classes, compact paddings, exit-icon headers, and an interactive onboarding welcome card in `src/pages/ConversationTutor.tsx`.

**Tech Stack:** React, TailwindCSS, Framer Motion, Lucide Icons, react-i18next.

---

### Task 1: Convert Core Pages to Static Imports in App.tsx

**Files:**
- Modify: `src/App.tsx`

**Step 1: Write minimal implementation**
We will replace dynamic imports with static imports for `Dashboard`, `StoryList`, `ConversationTutor`, `Practice`, `ReviewSession`, and `Account`. We will keep heavy pages lazy-loaded to optimize first load.

In `src/App.tsx`, modify lines 33-41:
```typescript
// Replace:
// const Dashboard = lazyRetry(() => import('./pages/Dashboard'));
// const StoryList = lazyRetry(() => import('./pages/StoryList'));
// const ReviewSession = lazyRetry(() => import('./pages/ReviewSession'));
// const Account = lazyRetry(() => import('./pages/Account'));
// const ConversationTutor = lazyRetry(() => import('./pages/ConversationTutor'));
// const Practice = lazyRetry(() => import('./pages/Practice'));

// With static imports:
import Dashboard from './pages/Dashboard';
import StoryList from './pages/StoryList';
import ReviewSession from './pages/ReviewSession';
import Account from './pages/Account';
import ConversationTutor from './pages/ConversationTutor';
import Practice from './pages/Practice';
```

And adjust route mapping in `src/App.tsx` lines 79-90 to bypass `<SafeRoute>` for static pages since they no longer require Suspense boundaries.
```typescript
// Replace:
// <Route path="/dashboard" element={<SafeRoute><Dashboard /></SafeRoute>} />
// <Route path="/learn" element={<SafeRoute><StoryList /></SafeRoute>} />
// <Route path="/review" element={<SafeRoute><ReviewSession /></SafeRoute>} />
// <Route path="/account" element={<SafeRoute><Account /></SafeRoute>} />
// <Route path="/chat" element={<SafeRoute><ConversationTutor /></SafeRoute>} />
// <Route path="/practice" element={<SafeRoute><Practice /></SafeRoute>} />

// With direct elements:
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/learn" element={<StoryList />} />
<Route path="/review" element={<ReviewSession />} />
<Route path="/account" element={<Account />} />
<Route path="/chat" element={<ConversationTutor />} />
<Route path="/practice" element={<Practice />} />
```

**Step 2: Run verification**
Run: `npm run build`
Expected: Production build compiles successfully without any dynamic bundle conflicts.

**Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "feat(routing): convert core navigation pages to static imports for flicker-free transitions"
```

---

### Task 2: Optimize Tab Transitions in Layout.tsx

**Files:**
- Modify: `src/components/Layout.tsx`

**Step 1: Write minimal implementation**
We will optimize `<AnimatePresence>` by shortening the transition duration and shifting from a slow fade-slide to an instantaneous crossfade to completely eliminate the blank screen gap.

Modify the motion wrapper in `src/components/Layout.tsx` around lines 213-223:
```typescript
<AnimatePresence mode="wait">
    <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
    >
        <Outlet />
    </motion.div>
</AnimatePresence>
```

**Step 2: Run verification**
Run: `npm run build`
Expected: Passes successfully.

**Step 3: Commit**
```bash
git add src/components/Layout.tsx
git commit -m "style(layout): optimize framer motion exit/enter duration for snappier page transitions"
```

---

### Task 3: Fix Past Sessions Layout Overflow in ConversationTutor.tsx

**Files:**
- Modify: `src/pages/ConversationTutor.tsx`

**Step 1: Write minimal implementation**
Apply Tailwind layout constraints to the history wrapper, button session card, and preview text block.

Modify `ConversationTutor.tsx` around lines 140-210:
1. Outer history wrapper at line 144:
```typescript
<div className="space-y-8 w-full max-w-full overflow-hidden flex flex-col min-w-0">
```
2. Past sessions container at line 174:
```typescript
<div className="space-y-4 w-full max-w-full overflow-hidden flex flex-col min-w-0">
```
3. Ensure button uses truncation and block alignment on preview `<p>` element at lines 185-190:
```typescript
<button key={session.id}
    onClick={() => { setReadonlySession(session); setView('readonly'); }}
    className="w-full min-w-0 max-w-full overflow-hidden text-left bg-[var(--color-card)] rounded-[2rem] p-5 shadow-[var(--shadow-card)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300 space-y-2 flex flex-col justify-between">
    <div className="flex justify-between items-center w-full min-w-0">
        <span className="text-xs text-[var(--color-on-surface-muted)] shrink-0">{dateStr}</span>
        <span className="text-xs bg-[var(--color-surface-container)] px-3 py-0.5 rounded-full text-[var(--color-on-surface-muted)] font-medium shrink-0">{session.level}</span>
    </div>
    <p className="text-sm text-[var(--color-on-surface)] truncate font-medium block w-full min-w-0">{preview}</p>
    <p className="text-xs text-[var(--color-on-surface-muted)] shrink-0">{msgCount} {msgCount === 1 ? 'mensaje' : 'mensajes'}</p>
</button>
```

**Step 2: Run verification**
Run: `npm run build`
Expected: Compilation passes.

**Step 3: Commit**
```bash
git add src/pages/ConversationTutor.tsx
git commit -m "style(tutor): apply overflow hidden and min-w-0 to prevent history items from stretching layout"
```

---

### Task 4: Polish Active Conversation Header, Empty State & Bubbles

**Files:**
- Modify: `src/pages/ConversationTutor.tsx`

**Step 1: Write minimal implementation**
We will implement the responsive header, the premium welcome state card, custom round margins for chat bubbles, and continuous swipe suggestions.

1. **Header exit button (lines 334-338):**
```typescript
<button onClick={() => setShowEndConfirm(true)}
    className="text-xs bg-[var(--color-error)]/10 text-[var(--color-error)] px-3 py-2 sm:px-4 sm:py-2 rounded-full font-bold hover:bg-[var(--color-error)]/20 hover:-translate-y-0.5 transition-all duration-300 shadow-[var(--shadow-card)] flex items-center gap-1.5 shrink-0"
    disabled={messages.length === 0}>
    <span className="hidden sm:inline">{t('chat.endSession')}</span>
    <span className="sm:hidden font-black text-sm flex items-center justify-center w-4 h-4">×</span>
</button>
```

2. **Empty State & Suggestion Topics Card (lines 343+):**
If `messages.length === 0`, render the welcome state inside the chat viewport instead of a blank page:
```typescript
{messages.length === 0 && (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 space-y-6 flex-1 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-[var(--color-on-surface)]">¡Conéctate con tu Tutor de IA!</h3>
            <p className="text-xs text-[var(--color-on-surface-muted)] leading-relaxed">
                Practica tu inglés de forma interactiva. Di "Hello" o selecciona una de nuestras sugerencias temáticas para comenzar la conversación.
            </p>
        </div>
        <div className="grid grid-cols-1 gap-2.5 w-full pt-2">
            <button onClick={() => sendMessage('Hello! I want to practice casual conversation.')}
                className="text-xs font-semibold text-left bg-[var(--color-card)] border border-[var(--color-outline-subtle)] hover:bg-[var(--color-surface-container)] hover:-translate-y-0.5 transition-all duration-300 p-3 rounded-xl shadow-[var(--shadow-card)] flex items-center gap-2.5 w-full">
                <span className="text-lg">💬</span>
                <div>
                    <p className="text-[var(--color-on-surface)]">Charla casual</p>
                    <p className="text-[10px] text-[var(--color-on-surface-muted)] font-normal">Plática espontánea sobre cualquier tema cotidiano.</p>
                </div>
            </button>
            <button onClick={() => sendMessage('Hi! Let\'s practice a restaurant roleplay.')}
                className="text-xs font-semibold text-left bg-[var(--color-card)] border border-[var(--color-outline-subtle)] hover:bg-[var(--color-surface-container)] hover:-translate-y-0.5 transition-all duration-300 p-3 rounded-xl shadow-[var(--shadow-card)] flex items-center gap-2.5 w-full">
                <span className="text-lg">🍔</span>
                <div>
                    <p className="text-[var(--color-on-surface)]">Roleplay en un Restaurante</p>
                    <p className="text-[10px] text-[var(--color-on-surface-muted)] font-normal">Simula ordenar comida y platicar en un café.</p>
                </div>
            </button>
            <button onClick={() => sendMessage('Hello! I want to prepare for a job interview.')}
                className="text-xs font-semibold text-left bg-[var(--color-card)] border border-[var(--color-outline-subtle)] hover:bg-[var(--color-surface-container)] hover:-translate-y-0.5 transition-all duration-300 p-3 rounded-xl shadow-[var(--shadow-card)] flex items-center gap-2.5 w-full">
                <span className="text-lg">💼</span>
                <div>
                    <p className="text-[var(--color-on-surface)]">Práctica de Entrevista</p>
                    <p className="text-[10px] text-[var(--color-on-surface-muted)] font-normal">Simulación de preguntas y respuestas profesionales.</p>
                </div>
            </button>
        </div>
    </div>
)}
```

3. **Message bubble padding & borders (lines 354-361):**
```typescript
<div
    className={`text-xs md:text-sm leading-relaxed ${msg.role === 'user'
        ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-2xl rounded-br-[0.25rem] p-3.5 md:p-4 shadow-[var(--shadow-elevated)]'
        : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] rounded-2xl rounded-bl-[0.25rem] p-3.5 md:p-4 shadow-[var(--shadow-card)]'
        }`}
>
    {msg.content}
</div>
```

4. **Input Area placeholder text & margin (lines 418, 444):**
- In suggestions (line 418):
```typescript
<div className="flex gap-2.5 overflow-x-auto py-3 shrink-0 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
```
- In input field class definition (line 451), update class with shorter placeholder text:
```typescript
placeholder={t('chat.placeholder')}
className="flex-1 bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] placeholder:text-xs md:placeholder:text-sm rounded-full px-5 py-3 text-xs md:text-sm outline-none focus:shadow-[var(--shadow-elevated)] transition-all duration-300"
```

**Step 2: Run verification**
Run: `npm run build`
Run: `npm run test:run`
Expected: Everything compiles without warnings; all tests pass.

**Step 3: Commit**
```bash
git add src/pages/ConversationTutor.tsx
git commit -m "style(tutor): integrate responsive headers, onboarding card suggestions, and mobile bubble optimizations"
```
