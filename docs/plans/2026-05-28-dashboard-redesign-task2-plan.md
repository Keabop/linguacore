# Dashboard & Stats Cards Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transition the Dashboard to the modern left-aligned, border-accented stats cards, add the milestone badge to the Continue Learning widget, and introduce CEFR level top-bands to the recommended story cards.

**Architecture:** Refactor `QuickStat` props and JSX layout, update stats grid definitions, append the badge into `firstIncompleteUnit` details container, and map stories in recommended lists with dynamic CEFR levels and a top-edge color band.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide-React, Framer Motion

---

### Task 1: Refactor QuickStat Component and its usages

**Files:**
- Modify: `E:\UNIVERSIDAD\Personales\AppIngles\voxie\src\pages\Dashboard.tsx:379-391` (QuickStat definition)
- Modify: `E:\UNIVERSIDAD\Personales\AppIngles\voxie\src\pages\Dashboard.tsx:112-121` (QuickStat usage inside stats grid)

**Step 1: Refactor QuickStat Component**
Update the QuickStat component definition to accept `borderAccent` prop and update its layout.

```tsx
function QuickStat({ icon, value, label, accent, borderAccent }: {
    icon: React.ReactNode; value: number; label: string; accent: string; borderAccent: string;
}) {
    return (
        <div 
            style={{ borderLeftColor: borderAccent }}
            className="bg-[var(--color-card)] rounded-2xl p-6 shadow-[var(--shadow-card)] text-left hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] border-l-4 transition-all duration-300"
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-on-surface-muted)]">{label}</span>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-md shrink-0`}>
                    {icon}
                </div>
            </div>
            <CountUp from={0} to={value} duration={1.2} className="text-2xl font-black mt-2 block" />
        </div>
    );
}
```

**Step 2: Update QuickStat Bento Grid Usages**
Update the Bento grid definitions inside the Dashboard component to supply the specified `borderAccent` values.

```tsx
            {/* Quick Stats — Bento grid */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="grid grid-cols-3 gap-4"
            >
                <QuickStat 
                    icon={<Flame className="w-5 h-5" />} 
                    value={user!.streak} 
                    label={t('dashboard.streak')} 
                    accent="from-orange-400 to-rose-400" 
                    borderAccent="var(--color-tertiary)"
                />
                <QuickStat 
                    icon={<Layers className="w-5 h-5" />} 
                    value={totalCards} 
                    label={t('dashboard.totalCards')} 
                    accent="from-blue-400 to-indigo-400" 
                    borderAccent="var(--color-primary)"
                />
                <QuickStat 
                    icon={<BookOpen className="w-5 h-5" />} 
                    value={readStories?.length ?? 0} 
                    label={t('dashboard.storiesRead')} 
                    accent="from-[var(--color-primary)] to-[var(--color-primary-container)]" 
                    borderAccent="var(--color-success)"
                />
            </motion.div>
```

**Step 3: Verify Compilation**
Run the typescript compiler or vite build command:
`npm run build` or `npx tsc --noEmit`
Expected: Compile successful.

**Step 4: Commit**
```bash
git add E:\UNIVERSIDAD\Personales\AppIngles\voxie\src\pages\Dashboard.tsx
git commit -m "feat: redesign quick stats card component and usage"
```

---

### Task 2: Implement "SIGUIENTE HITO" Badge in Continue Learning widget

**Files:**
- Modify: `E:\UNIVERSIDAD\Personales\AppIngles\voxie\src\pages\Dashboard.tsx:159-166` (First incomplete unit info)

**Step 1: Add Badge element**
Inject the badge code right above `h3` inside the `firstIncompleteUnit` section:

```tsx
                                {/* Unit title + grammar */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-surface-container-low)] text-[var(--color-primary)]">
                                            SIGUIENTE HITO
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-base">{firstIncompleteUnit.title}</h3>
                                    <p className="text-sm text-[var(--color-on-surface-muted)]">{firstIncompleteUnit.grammarTopic}</p>
                                </div>
```

**Step 2: Verify Compilation**
Run the typescript compiler:
`npx tsc --noEmit`
Expected: Compile successful.

**Step 3: Commit**
```bash
git add E:\UNIVERSIDAD\Personales\AppIngles\voxie\src\pages\Dashboard.tsx
git commit -m "feat: add siguiente hito badge to continue learning card"
```

---

### Task 3: Add CEFR Level Band to Recommended Story Cards

**Files:**
- Modify: `E:\UNIVERSIDAD\Personales\AppIngles\voxie\src\pages\Dashboard.tsx:303-335` (Recommended map)

**Step 1: Declare levelColor mapping and Inject Band Element**
Update the map function inside `recommended.map` to calculate the color based on CEFR level and prepend the `h-1` band at the top of the card inner container.

```tsx
                    <div className="grid grid-cols-2 gap-5">
                        {recommended.map((story, i) => {
                            const levelColor = {
                                A1: 'var(--color-level-a1)',
                                A2: 'var(--color-level-a2)',
                                B1: 'var(--color-level-b1)',
                                B2: 'var(--color-level-b2)',
                            }[story.level] || 'var(--color-primary)';

                            return (
                                <motion.div
                                    key={story.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.28 + i * 0.05 }}
                                >
                                    <div
                                        onClick={() => navigate(`/learn/${story.id}`)}
                                        className="bg-[var(--color-card)] rounded-[2rem] overflow-hidden shadow-[var(--shadow-card)] cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[var(--shadow-float)] group"
                                    >
                                        <div style={{ backgroundColor: levelColor }} className="h-1 w-full shrink-0" />
                                        <div
                                            className="h-36 relative flex items-center justify-center overflow-hidden"
                                            style={{ background: getStoryMesh(story.id) }}
                                        >
```

**Step 2: Verify Compilation**
Run:
`npx tsc --noEmit`
Expected: Compile successful.

**Step 3: Commit**
```bash
git add E:\UNIVERSIDAD\Personales\AppIngles\voxie\src\pages\Dashboard.tsx
git commit -m "feat: add cefr level colored top band to recommended story cards"
```
