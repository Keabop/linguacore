# Mobile Navigation Restoration in Chat and Review Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the floating bottom navigation bar on mobile for the AI Tutor and Review pages while resizing the chat viewport dynamically to prevent any layout collisions with the input field and suggestions.

**Architecture:** 
1. Update `Layout.tsx` so the floating bottom bar is only hidden on the Story Reader path (`/learn/:storyId`).
2. Adjust `ConversationTutor.tsx` viewport containers (active chat and readonly session views) to responsively scale down in height on mobile (`h-[calc(100dvh-13.5rem)]`) and restore original height on desktop (`lg:h-[calc(100dvh-6rem)]`).

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Vitest.

---

### Task 1: Update Mobile Floating Bar Condition in Layout

**Files:**
- Modify: `src/components/Layout.tsx`

**Step 1: Simplify `hideFloatingBar` condition in Layout**
Modify `src/components/Layout.tsx` so the floating bottom bar is only hidden when reading a story:
- Around line 115-118, change:
```typescript
    const hideFloatingBar = 
        /^\/learn\/.+/.test(location.pathname) || 
        location.pathname === '/chat' || 
        location.pathname === '/review';
```
- To:
```typescript
    const hideFloatingBar = /^\/learn\/.+/.test(location.pathname);
```

**Step 2: Commit layout update**
```bash
git add src/components/Layout.tsx
git commit -m "refactor: allow mobile floating bar in chat and review pages"
```

---

### Task 2: Resize Viewport Container in ConversationTutor

**Files:**
- Modify: `src/pages/ConversationTutor.tsx`

**Step 1: Update Readonly view container height**
Find the outer `div` returned in the readonly view block (around line 217-219) of `src/pages/ConversationTutor.tsx`:
- Change:
```typescript
    // ── READONLY VIEW ──
    if (view === 'readonly' && readonlySession) {
        return (
            <div className="flex flex-col h-[calc(100dvh-6rem)] max-h-[calc(100dvh-6rem)] overflow-x-hidden">
```
- To:
```typescript
    // ── READONLY VIEW ──
    if (view === 'readonly' && readonlySession) {
        return (
            <div className="flex flex-col h-[calc(100dvh-13.5rem)] max-h-[calc(100dvh-13.5rem)] lg:h-[calc(100dvh-6rem)] lg:max-h-[calc(100dvh-6rem)] overflow-x-hidden">
```

**Step 2: Update Active Chat view container height**
Find the outer `div` returned in the active chat view block (around line 280-281) of `src/pages/ConversationTutor.tsx`:
- Change:
```typescript
    // ── CHAT VIEW (active conversation) ──
    return (
        <div className="flex flex-col h-[calc(100dvh-6rem)] max-h-[calc(100dvh-6rem)] overflow-x-hidden">
```
- To:
```typescript
    // ── CHAT VIEW (active conversation) ──
    return (
        <div className="flex flex-col h-[calc(100dvh-13.5rem)] max-h-[calc(100dvh-13.5rem)] lg:h-[calc(100dvh-6rem)] lg:max-h-[calc(100dvh-6rem)] overflow-x-hidden">
```

**Step 3: Run comprehensive verification**
Run: `npm run test:run`
Run: `npm run build`
Expected: ALL test suites pass and compilation completes successfully.

**Step 4: Commit**
```bash
git add src/pages/ConversationTutor.tsx
git commit -m "feat: apply responsive chat viewport heights on mobile to prevent floating bar collisions"
```
