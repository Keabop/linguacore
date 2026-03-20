# Voxie UI Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply expressive, dynamic visual polish across the entire Voxie app using ReactBits components, restructure the layout from 3-column to rail sidebar, and enhance all celebrations/transitions.

**Architecture:** Install ReactBits components via copy-paste (TS-TW variant) into `src/components/reactbits/`. Modify existing pages/components in place — no new routing. Layout shifts from 3-column fixed to collapsible rail sidebar + centered content.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion 12, ReactBits (TS-TW variant), ogl (for Aurora/Particles WebGL backgrounds)

---

## Task 0: Install ReactBits dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install ogl (required for Aurora and Particles WebGL backgrounds)**

Run: `cd e:\UNIVERSIDAD\PERSONALES\AppIngles\linguacore && npm install ogl`

**Step 2: Create ReactBits component directory**

Run: `mkdir -p src/components/reactbits`

**Step 3: Install ReactBits components via CLI**

Run each one:
```bash
npx jsrepo add https://reactbits.dev/ts-tw/TextAnimations/BlurText
npx jsrepo add https://reactbits.dev/ts-tw/TextAnimations/SplitText
npx jsrepo add https://reactbits.dev/ts-tw/TextAnimations/CountUp
npx jsrepo add https://reactbits.dev/ts-tw/Backgrounds/Aurora
npx jsrepo add https://reactbits.dev/ts-tw/Backgrounds/Particles
npx jsrepo add https://reactbits.dev/ts-tw/Animations/Magnet
npx jsrepo add https://reactbits.dev/ts-tw/Components/SpotlightCard
npx jsrepo add https://reactbits.dev/ts-tw/Components/AnimatedList
```

If CLI fails, use **Opción C** from the ReactBits skill: go to each component's URL on reactbits.dev, select TS-TW variant, copy the code, and paste into `src/components/reactbits/<ComponentName>.tsx`.

**Step 4: Verify imports resolve**

Run: `cd e:\UNIVERSIDAD\PERSONALES\AppIngles\linguacore && npx tsc --noEmit 2>&1 | head -20`

**Step 5: Commit**

```bash
git add package.json package-lock.json src/components/reactbits/
git commit -m "chore: install ReactBits components and ogl dependency"
```

---

## Task 1: Landing Page — Rediseño completo

**Files:**
- Modify: `src/pages/Landing.tsx`
- Read: `src/components/reactbits/Aurora.tsx` (or wherever installed)
- Read: `src/components/reactbits/SplitText.tsx`
- Read: `src/components/reactbits/BlurText.tsx`
- Read: `src/components/reactbits/SpotlightCard.tsx`
- Read: `src/components/reactbits/CountUp.tsx`
- Read: `src/components/reactbits/Magnet.tsx`

**Step 1: Read all ReactBits component files to understand their exact import paths and props**

Read each file that was installed in Task 0. Note exact import paths.

**Step 2: Rewrite Landing.tsx hero section**

Replace the current hero with:
- **Aurora** background (indigo/purple gradients) behind the entire hero section
- **SplitText** for the title: "Historias, práctica y AI. Todo lo que necesitas." — use `delay={30}` for fast animation (~0.3s total)
- **BlurText** for the subtitle — appears after title with `delay={100}`
- Single CTA "Comenzar gratis" wrapped in **Magnet** with `padding={50}`
- App preview mockup enters from below with parallax (keep existing framer motion but add perspective 3D tilt)
- Remove the old "Potenciado por IA" badge
- Remove the "Ver características" secondary CTA
- Remove GlowOrb components, replace with Aurora

```tsx
// Hero structure:
<section className="relative z-10 min-h-screen flex flex-col items-center justify-center">
  {/* Aurora background - absolute positioned behind everything */}
  <div className="absolute inset-0 z-0">
    <Aurora colorStops={["#4F46E5", "#6366F1", "#A78BFA"]} speed={0.3} blend={0.6} amplitude={0.8} />
  </div>

  {/* Content */}
  <div className="relative z-10 text-center max-w-4xl px-6">
    <SplitText
      text="Historias, práctica y AI. Todo lo que necesitas."
      className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-white"
      delay={30}
      animationFrom={{ opacity: 0, transform: 'translate3d(0,30px,0)' }}
      animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
    />

    <BlurText
      text="Aprende inglés con historias adaptadas, tutor conversacional y repetición espaciada. Todo con IA."
      delay={80}
      className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mt-6 mb-10"
    />

    <Magnet padding={50}>
      <Link to="/auth" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-base px-10 py-4 rounded-2xl transition-all">
        Comenzar gratis <ArrowRight className="w-4 h-4" />
      </Link>
    </Magnet>
  </div>

  {/* App preview with 3D perspective */}
  <motion.div
    initial={{ opacity: 0, y: 60, rotateX: 8 }}
    animate={{ opacity: 1, y: 0, rotateX: 4 }}
    transition={{ delay: 0.6, duration: 0.8 }}
    style={{ perspective: '1200px' }}
    className="relative z-10 mt-16 max-w-3xl mx-auto px-6"
  >
    {/* Keep existing browser mockup but with subtle perspective tilt */}
  </motion.div>
</section>
```

**Step 3: Rewrite Features section**

- Section title with **BlurText**
- Each feature card wrapped in **SpotlightCard** with `spotlightColor="rgba(99, 102, 241, 0.15)"`
- Cards enter staggered with `whileInView`

```tsx
<SpotlightCard className="bg-bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-6" spotlightColor="rgba(99, 102, 241, 0.15)">
  {/* existing card content */}
</SpotlightCard>
```

**Step 4: Rewrite "Cómo funciona" section — Notion style**

Replace the 3-column grid with alternating left/right blocks:
- Each block: text on one side, screenshot/mockup on the other
- Blocks enter with slide from left/right alternating on scroll
- Use `whileInView` with `initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}`

```tsx
{steps.map((step, i) => (
  <motion.div
    key={step.step}
    initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
    className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
  >
    <div className="flex-1 space-y-3">
      <div className="text-4xl font-extrabold text-primary/30">{step.step}</div>
      <h3 className="text-xl font-bold">{step.title}</h3>
      <p className="text-text-secondary">{step.desc}</p>
    </div>
    <div className="flex-1">
      {/* App screenshot mockup for this step */}
    </div>
  </motion.div>
))}
```

**Step 5: Rewrite Pricing section**

- **CountUp** on prices ($0, $129, $1,200) triggered by `whileInView`
- Pro card with animated indigo glow border (CSS keyframe)
- Checkmarks animate in with stagger

**Step 6: Clean up — remove GlowOrb, old fadeUp/stagger variants**

**Step 7: Verify build**

Run: `cd e:\UNIVERSIDAD\PERSONALES\AppIngles\linguacore && npm run build 2>&1 | tail -20`

**Step 8: Commit**

```bash
git add src/pages/Landing.tsx
git commit -m "feat(landing): redesign with Aurora, SplitText, SpotlightCard, and Notion-style sections"
```

---

## Task 2: Auth Page — Aurora background

**Files:**
- Modify: `src/pages/Auth.tsx`

**Step 1: Add Aurora background behind the auth form**

```tsx
<div className="min-h-screen bg-bg-app flex items-center justify-center px-6 relative overflow-hidden">
  {/* Aurora background */}
  <div className="absolute inset-0 z-0">
    <Aurora colorStops={["#4F46E5", "#6366F1", "#A78BFA"]} speed={0.3} blend={0.5} amplitude={0.6} />
  </div>

  {/* Form — scale + fade entrance */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="w-full max-w-[420px] relative z-10"
  >
    {/* Existing form content */}
  </motion.div>
</div>
```

**Step 2: Verify build**

Run: `cd e:\UNIVERSIDAD\PERSONALES\AppIngles\linguacore && npm run build 2>&1 | tail -10`

**Step 3: Commit**

```bash
git add src/pages/Auth.tsx
git commit -m "feat(auth): add Aurora background and scale entrance animation"
```

---

## Task 3: Layout — Rail Sidebar + Remove Right Widgets

**Files:**
- Modify: `src/components/Layout.tsx`
- Modify: `src/index.css`

**Step 1: Rewrite Layout.tsx sidebar to rail with hover expand**

Replace the `<aside className="sidebar-nav">` with a rail that:
- Default: 68px wide, shows only icons centered
- On `onMouseEnter`: expands to 240px as overlay (absolute positioned, backdrop blur)
- On `onMouseLeave`: collapses back
- Use `useState` for `expanded` boolean
- Use framer-motion `animate={{ width: expanded ? 240 : 68 }}` with `transition={{ duration: 0.3 }}`
- Text labels: `AnimatePresence` → show with fade when expanded, hide instantly when collapsed
- Active nav item: vertical indigo bar indicator (4px wide, left side) with `layoutId` for spring animation between items

```tsx
const [expanded, setExpanded] = useState(false);

<motion.aside
  onMouseEnter={() => setExpanded(true)}
  onMouseLeave={() => setExpanded(false)}
  animate={{ width: expanded ? 240 : 68 }}
  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
  className="sidebar-rail"
>
  {/* Logo */}
  <div className="flex items-center justify-center h-12 mb-8">
    <img src="/logo.png" alt="Voxie" className="w-7 h-7 rounded-lg object-cover" />
    <AnimatePresence>
      {expanded && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
          className="ml-3 text-xl font-extrabold text-text tracking-tight"
        >
          Voxie
        </motion.span>
      )}
    </AnimatePresence>
  </div>

  {/* Nav items */}
  <nav className="flex-1 space-y-1">
    {navItems.map(item => (
      <NavLink key={item.path} to={item.path} className={({isActive}) => `rail-item ${isActive ? 'active' : ''}`}>
        <div className="relative flex items-center justify-center w-10 h-10">
          {isActive && (
            <motion.div layoutId="activeIndicator" className="absolute -left-3 w-1 h-6 bg-primary rounded-r-full" />
          )}
          <item.icon className="w-5 h-5" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              className="text-sm font-semibold whitespace-nowrap"
            >
              {t(item.labelKey)}
            </motion.span>
          )}
        </AnimatePresence>
      </NavLink>
    ))}
  </nav>

  {/* User area */}
  {/* Similar pattern: avatar always visible, name+badge only when expanded */}
</motion.aside>
```

**Step 2: Remove the entire right sidebar (`<aside className="sidebar-widgets">`) from Layout.tsx**

Delete the entire `sidebar-widgets` aside and all its contents (streak, due cards, progress widgets).

**Step 3: Update index.css**

Replace `.sidebar-nav` styles with `.sidebar-rail`:
```css
.sidebar-rail {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  background: var(--color-bg-sidebar);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 28px 0;
  z-index: 50;
  overflow: hidden;
}

.rail-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  margin: 2px 8px;
  border-radius: 12px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
}

.rail-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text);
}

.rail-item.active {
  background: rgba(99, 102, 241, 0.10);
  color: #FAFAFA;
}
```

Update `.main-content`:
```css
.main-content {
  flex: 1;
  margin-left: 68px;  /* rail width */
  margin-right: 0;    /* no right sidebar */
  min-height: 100dvh;
  display: flex;
  justify-content: center;
}

.main-content-inner {
  width: 100%;
  max-width: 1000px;  /* wider now */
  padding: 48px 50px 56px;
}
```

Remove `.sidebar-widgets` and `.sidebar-nav` styles entirely.

**Step 4: Update page transitions**

In Layout.tsx, change the AnimatePresence transition from y-based to scale-based:
```tsx
<motion.div
  key={location.pathname}
  initial={{ opacity: 0, scale: 0.98 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.98 }}
  transition={{ duration: 0.25 }}
>
  <Outlet />
</motion.div>
```

**Step 5: Verify build + test mobile still works**

Run: `cd e:\UNIVERSIDAD\PERSONALES\AppIngles\linguacore && npm run build 2>&1 | tail -10`

**Step 6: Commit**

```bash
git add src/components/Layout.tsx src/index.css
git commit -m "feat(layout): replace 3-column layout with rail sidebar, remove widget sidebar"
```

---

## Task 4: Dashboard — Contextual greeting + enhanced cards

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/i18n/es.json` (add new greeting keys)

**Step 1: Add contextual greeting keys to es.json**

Add under `"dashboard"`:
```json
"greetingDueCards": "Tienes {{count}} tarjetas por repasar",
"greetingStreak": "Llevas {{count}} días seguidos",
"greetingCompleted": "Terminaste la unidad {{unit}}, sigue con la siguiente",
"greetingInactive": "Han pasado {{count}} días desde tu última sesión",
"greetingAllDone": "Todo al día — no hay nada pendiente"
```

**Step 2: Replace static greeting with contextual greeting in Dashboard.tsx**

```tsx
function getContextualGreeting(t: TFunction, dueCards: number, streak: number, lastStudyDate: string | null): string {
  if (dueCards > 5) return t('dashboard.greetingDueCards', { count: dueCards });
  if (streak > 1) return t('dashboard.greetingStreak', { count: streak });
  if (lastStudyDate) {
    const daysSince = Math.floor((Date.now() - new Date(lastStudyDate).getTime()) / 86400000);
    if (daysSince > 2) return t('dashboard.greetingInactive', { count: daysSince });
  }
  if (dueCards === 0) return t('dashboard.greetingAllDone');
  return t('dashboard.greetingDueCards', { count: dueCards });
}
```

Use **BlurText** for the greeting:
```tsx
<BlurText text={greeting} delay={80} className="text-3xl font-extrabold leading-tight" />
```

**Step 3: Wrap dashboard cards with SpotlightCard**

- "Continuar aprendiendo" card: SpotlightCard with level-colored spotlight
- "Por repasar" card: SpotlightCard + CountUp for the number
- Story cards: SpotlightCard + CSS perspective tilt on hover

```tsx
// Continue Learning card
<SpotlightCard spotlightColor={levelSpotlightColor[currentLevel]} className="bg-bg-card border ...">
  {/* existing content */}
  <SplitText text={firstIncompleteUnit.title} className="font-bold text-base" delay={20} />
  <Magnet padding={40}>
    <button className="...">Continuar <ArrowRight /></button>
  </Magnet>
</SpotlightCard>

// Due cards
<SpotlightCard spotlightColor="rgba(99, 102, 241, 0.15)" className="...">
  <CountUp from={0} to={dueCards.length} duration={1.5} className="text-2xl font-extrabold" />
</SpotlightCard>
```

**Step 4: Replace mobile-only stats with always-visible quick stats using CountUp**

Remove `lg:hidden` from quick stats. Use CountUp for all numbers.

**Step 5: Add story card tilt effect**

```tsx
// Add to story cards
<div className="story-card group" style={{ perspective: '800px' }}>
  <motion.div
    whileHover={{ rotateX: -3, rotateY: 5, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    {/* existing story card content */}
  </motion.div>
</div>
```

**Step 6: Remove old mobile-only progress widget (already in Account page)**

**Step 7: Verify build**

Run: `cd e:\UNIVERSIDAD\PERSONALES\AppIngles\linguacore && npm run build 2>&1 | tail -10`

**Step 8: Commit**

```bash
git add src/pages/Dashboard.tsx src/i18n/es.json
git commit -m "feat(dashboard): contextual greeting, SpotlightCard, CountUp, tilt effects"
```

---

## Task 5: Review Session — Card transitions + feedback

**Files:**
- Modify: `src/pages/ReviewSession.tsx`
- Modify: `src/components/ClozeReview.tsx`
- Modify: `src/index.css` (border animation keyframe)

**Step 1: Read ReviewSession.tsx and ClozeReview.tsx to understand current structure**

**Step 2: Add border flash animation keyframes to index.css**

```css
@keyframes border-flash-green {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@keyframes border-flash-red {
  0% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.2); }
  100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0); }
}

.border-flash-correct { animation: border-flash-green 0.5s ease; }
.border-flash-incorrect { animation: border-flash-red 0.5s ease; }
```

**Step 3: Add slide transition between review cards**

Use horizontal slide instead of simple fade:
```tsx
<AnimatePresence mode="wait" custom={1}>
  <motion.div
    key={currentCardIndex}
    initial={{ x: 80, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -80, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    {/* current card */}
  </motion.div>
</AnimatePresence>
```

**Step 4: Replace pulse-success/shake with border flash animations**

In ClozeReview (and similar), change:
- correct: `border-flash-correct` class
- incorrect: keep `shake` but add `border-flash-incorrect`

**Step 5: Update session complete screen**

- **CountUp** for accuracy percentage and cards reviewed
- If accuracy > 90%: add gold shimmer on the percentage (CSS gradient animation)

**Step 6: Verify build**

Run: `cd e:\UNIVERSIDAD\PERSONALES\AppIngles\linguacore && npm run build 2>&1 | tail -10`

**Step 7: Commit**

```bash
git add src/pages/ReviewSession.tsx src/components/ClozeReview.tsx src/index.css
git commit -m "feat(review): card slide transitions, border flash feedback, CountUp stats"
```

---

## Task 6: Exercise Cards + UnitFlow — AnimatedList + spring physics

**Files:**
- Modify: `src/pages/UnitFlow.tsx`
- Modify: `src/components/exercises/ExerciseRunner.tsx`
- Modify: `src/components/exercises/MultipleChoiceExercise.tsx`

**Step 1: Read ExerciseRunner.tsx and MultipleChoiceExercise.tsx**

**Step 2: Update UnitFlow slide variants to use spring physics**

```tsx
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};
```

**Step 3: Wrap multiple choice options with staggered animation**

In MultipleChoiceExercise, make options enter one by one:
```tsx
{options.map((opt, i) => (
  <motion.button
    key={opt.id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
    // ... existing props
  >
```

**Step 4: Correct/incorrect feedback on options**

- Correct: `scale: [1, 1.05, 1]` + green border glow
- Incorrect: shake + reveal correct answer with green glow

**Step 5: Verify build**

Run: `cd e:\UNIVERSIDAD\PERSONALES\AppIngles\linguacore && npm run build 2>&1 | tail -10`

**Step 6: Commit**

```bash
git add src/pages/UnitFlow.tsx src/components/exercises/
git commit -m "feat(exercises): spring physics transitions, staggered options, enhanced feedback"
```

---

## Task 7: Celebrations — Particles + CountUp + SplitText

**Files:**
- Modify: `src/components/ui/LevelUpModal.tsx`
- Modify: `src/pages/UnitFlow.tsx` (CelebrationCard function)

**Step 1: Rewrite LevelUpModal with ReactBits components**

Replace confetti with **Particles**, add **SplitText**, **CountUp**, **Aurora**:

```tsx
// Level color map
const levelColors: Record<CEFRLevel, string[]> = {
  A1: ['#60A5FA', '#3B82F6'],
  A2: ['#4ADE80', '#22C55E'],
  B1: ['#FBBF24', '#F59E0B'],
  B2: ['#F87171', '#EF4444'],
};

// Background: Aurora with level colors
<div className="absolute inset-0 z-0 rounded-3xl overflow-hidden">
  <Aurora colorStops={[...levelColors[level], '#09090B']} speed={0.4} blend={0.5} amplitude={0.8} />
</div>

// Replace Confetti with Particles
<div className="absolute inset-0 z-[1] pointer-events-none">
  <Particles
    particleColors={levelColors[level]}
    particleCount={80}
    speed={0.3}
    particleBaseSize={80}
  />
</div>

// Trophy with dramatic entrance
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: [0, 1.3, 1] }}
  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
>
  <div className="relative">
    {/* Radial glow behind trophy */}
    <div className="absolute inset-0 bg-accent-gold/20 blur-2xl rounded-full animate-pulse" />
    <Trophy className="w-16 h-16 text-accent-gold relative z-10" />
  </div>
</motion.div>

// SplitText fast (~0.3s total)
<SplitText
  text={t('levelUp.congratulations')}
  className="text-2xl font-extrabold text-white"
  delay={20}
  animationFrom={{ opacity: 0, transform: 'translate3d(0,20px,0)' }}
  animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
/>

// Continue button with delay
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1.5 }}
>
  <BlurText text={t('levelUp.continue')} delay={50} className="..." />
</motion.div>
```

**Step 2: Rewrite CelebrationCard in UnitFlow.tsx**

Similar pattern:
- Particles (gold/indigo) instead of custom confetti
- Trophy with spring entrance
- SplitText fast for "¡Felicidades!"
- CountUp for stats
- Glow behind trophy
- Continue button with 1.5s delay

**Step 3: Verify build**

Run: `cd e:\UNIVERSIDAD\PERSONALES\AppIngles\linguacore && npm run build 2>&1 | tail -10`

**Step 4: Commit**

```bash
git add src/components/ui/LevelUpModal.tsx src/pages/UnitFlow.tsx
git commit -m "feat(celebrations): Particles, Aurora, SplitText, CountUp for level up and unit completion"
```

---

## Task 8: Pricing Page + Review completion celebration

**Files:**
- Modify: `src/pages/Pricing.tsx`

**Step 1: Read Pricing.tsx**

**Step 2: Add CountUp to prices, animated checkmarks, Pro glow border**

- Prices: `<CountUp from={0} to={129} duration={1.5} />` triggered by whileInView
- Pro card: `border border-primary/30` + animated glow keyframe
- Feature checkmarks: staggered fade-in

**Step 3: Verify build**

Run: `cd e:\UNIVERSIDAD\PERSONALES\AppIngles\linguacore && npm run build 2>&1 | tail -10`

**Step 4: Commit**

```bash
git add src/pages/Pricing.tsx
git commit -m "feat(pricing): CountUp prices, animated checkmarks, Pro card glow"
```

---

## Task 9: Global transitions + final polish

**Files:**
- Modify: `src/index.css` (add new keyframes if needed)
- Modify: `src/pages/StoryList.tsx` (SpotlightCard on story cards)

**Step 1: Add SpotlightCard to StoryList page story cards**

Wrap each story card in SpotlightCard.

**Step 2: Add tilt hover to story cards in StoryList**

Same pattern as dashboard: `whileHover={{ rotateX: -3, rotateY: 5 }}` with perspective.

**Step 3: Final CSS cleanup**

- Remove old `.sidebar-nav` styles if not done in Task 3
- Remove old `.sidebar-widgets` styles
- Verify light mode works with new rail sidebar

**Step 4: Full build verification**

Run: `cd e:\UNIVERSIDAD\PERSONALES\AppIngles\linguacore && npm run build`

Expected: Build succeeds with no errors.

**Step 5: Commit**

```bash
git add src/pages/StoryList.tsx src/index.css
git commit -m "feat(stories): SpotlightCard + tilt hover on story cards, CSS cleanup"
```

---

## Summary

| Task | What | ReactBits Used |
|------|------|---------------|
| 0 | Install dependencies | — |
| 1 | Landing redesign | Aurora, SplitText, BlurText, SpotlightCard, Magnet, CountUp |
| 2 | Auth page | Aurora |
| 3 | Layout rail sidebar | AnimatedList (sidebar items) |
| 4 | Dashboard | BlurText, SpotlightCard, CountUp, Magnet, SplitText |
| 5 | Review session | CountUp |
| 6 | Exercises + UnitFlow | — (Framer Motion spring) |
| 7 | Celebrations | Particles, Aurora, SplitText, CountUp |
| 8 | Pricing page | CountUp |
| 9 | Story cards + cleanup | SpotlightCard |
