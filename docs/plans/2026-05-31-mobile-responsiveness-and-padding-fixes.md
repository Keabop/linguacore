# Mobile Responsiveness and Padding Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Centralize mobile floating bar display logic in the Layout, resolve screen overflow and padding defects across fullscreen views (Chat, Review, Reader), and implement responsive grid layouts for bento statistics, story lists, and color themes on narrow viewports.

**Architecture:** 
1. Centralize the floating bottom bar visibility logic in `Layout.tsx` for paths `/learn/:storyId`, `/chat`, and `/review`.
2. Add dynamic `.no-floating-bar-padding` padding override to `.main-content-inner` in `index.css`.
3. Refactor grid container and cards in `Dashboard.tsx` to use responsive classes, reducing card padding and resizing icons on mobile.
4. Refactor grid structure in `Account.tsx` for themes selector to support 1-column layouts on small viewports.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Vitest.

---

### Task 1: Centralize Floating Bar and Add Dynamic Bottom Padding

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/Layout.tsx`
- Modify: `src/pages/ConversationTutor.tsx`
- Modify: `src/pages/ReviewSession.tsx`

**Step 1: Add dynamic padding utility in `index.css`**
Add the override rule at the bottom of the responsive Mobile `@media (max-width: 1024px)` block in `src/index.css`:
```css
  .main-content-inner.no-floating-bar-padding {
    padding-bottom: 24px !important;
  }
```

**Step 2: Update `Layout.tsx` to handle conditional floating bar and content padding**
Modify `src/components/Layout.tsx` to centralize bar hiding and dynamic inner-padding:
- Check path logic:
```typescript
    const hideFloatingBar = 
        /^\/learn\/.+/.test(location.pathname) || 
        location.pathname === '/chat' || 
        location.pathname === '/review';
```
- Conditionally render `<nav ref={scrollRef} className="floating-bar">` using `{!hideFloatingBar && ...}`
- Apply conditional padding class to `main-content-inner`:
```typescript
            {/* ===== MAIN CONTENT ===== */}
            <div className="main-content">
                <div className={`main-content-inner ${hideFloatingBar ? 'no-floating-bar-padding' : ''}`}>
                    <OfflineBanner syncState={syncState} />
                    <Outlet />
                </div>
            </div>
```

**Step 3: Remove custom CSS style hacks in `ConversationTutor.tsx`**
Find and delete `<style>{`.floating-bar { display: none !important; }`}</style>` in `src/pages/ConversationTutor.tsx`.

**Step 4: Remove custom CSS style hacks in `ReviewSession.tsx`**
Find and delete `<style>{`.floating-bar { display: none !important; }`}</style>` in `src/pages/ReviewSession.tsx`.

**Step 5: Run tests and verify build compilation**
Run: `npm run test:run`
Run: `npm run build`
Expected: ALL tests pass and the production bundle compiles successfully.

**Step 6: Commit**
```bash
git add src/index.css src/components/Layout.tsx src/pages/ConversationTutor.tsx src/pages/ReviewSession.tsx
git commit -m "refactor: centralize mobile floating bar display and fix fullscreen bottom paddings"
```

---

### Task 2: Implement Responsive Bento Stats Grid and Recommended Stories on Dashboard

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Step 1: Refactor stats grid gap and card layout in `Dashboard.tsx`**
Modify the Quick Stats container grid to use responsive gaps:
- Change `<motion.div ... className="grid grid-cols-3 gap-4">` to:
```typescript
            {/* Quick Stats — Bento grid */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="grid grid-cols-3 gap-2.5 sm:gap-4"
            >
```

**Step 2: Make `QuickStat` component card padding and elements adapt natively**
Modify the `QuickStat` component in `src/pages/Dashboard.tsx` to handle small layouts without horizontal overflow:
```typescript
function QuickStat({ icon, value, label, accent, borderAccent }: {
    icon: React.ReactNode; value: number; label: string; accent: string; borderAccent: string;
}) {
    return (
        <div 
            style={{ borderLeftColor: borderAccent }}
            className="bg-[var(--color-card)] rounded-2xl p-3 sm:p-5 md:p-6 shadow-[var(--shadow-card)] text-left hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] border-l-4 transition-all duration-300"
        >
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <span className="text-[9.5px] sm:text-xs font-bold text-[var(--color-on-surface-muted)] truncate">{label}</span>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-md shrink-0`}>
                    {icon}
                </div>
            </div>
            <CountUp from={0} to={value} duration={1.2} className="text-xl sm:text-2xl font-black mt-1.5 sm:mt-2 block" />
        </div>
    );
}
```

**Step 3: Refactor Recommended Stories grid to prevent crowded columns on mobile**
Modify the recommended stories container in `src/pages/Dashboard.tsx`:
- Change `<div className="grid grid-cols-2 gap-5">` to:
```typescript
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
```

**Step 4: Run build check to verify CSS and JSX formatting**
Run: `npm run build`
Expected: Compilation completes without errors.

**Step 5: Commit**
```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: make bento stats and recommended stories responsive on dashboard"
```

---

### Task 3: Refactor Color Theme Palette Grid in Account Settings

**Files:**
- Modify: `src/pages/Account.tsx`

**Step 1: Make theme grid stack to single column on mobile**
Find the theme palette render block in `src/pages/Account.tsx` (around lines 190-200) and change the columns definition:
- Change `<div className="grid grid-cols-2 gap-4 pt-2">` to:
```typescript
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
```

**Step 2: Run all tests and verify all pass**
Run: `npm run test:run`
Expected: PASS

**Step 3: Run production build compilation**
Run: `npm run build`
Expected: SUCCESS

**Step 4: Commit**
```bash
git add src/pages/Account.tsx
git commit -m "feat: optimize theme settings selector grid for narrow viewports"
```
