# Draggable Sidebar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a draggable and position-adaptable navigation rail (Movable Sidebar) in Voxie (LinguaCore), using Framer Motion for coordinates and acoplamiento visual, with permanent user synchronization in Supabase and offline resilience. Include a one-time onboarding tutorial card pointing to the new drag handle with pulse animations.

**Architecture:** 
1. Build a custom hook `useSidebarPreferences` to load/save position and onboarding status between local storage and Supabase `user_metadata`.
2. Add layout container styles in `index.css` to handle horizontal orientations ('top' and 'bottom') and dynamic margins/paddings.
3. Integrate Framer Motion's dragging system in `Layout.tsx`, display high-fidelity glassmorphic drop zones on drag, calculate screen collisions to snap positions, and trigger dynamic layout changes.
4. Render a glassmorphic onboarding bubble pointing to the handle, disappearing permanently after "Dismiss" is clicked.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase Auth, Lucide React, Vitest.

---

### Task 1: Create Custom Hook `useSidebarPreferences`

**Files:**
- Create: `src/hooks/useSidebarPreferences.ts`
- Create: `src/hooks/useSidebarPreferences.test.ts`

**Step 1: Write the failing test**
Create a test file `src/hooks/useSidebarPreferences.test.ts` to test default state loading, storage interaction, and function calls:
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSidebarPreferences } from './useSidebarPreferences';

// Mock useAuth context
vi.mock('../lib/AuthContext', () => ({
    useAuth: () => ({
        user: {
            user_metadata: {
                sidebar_position: 'right',
                sidebar_onboarding_shown: true
            }
        }
    })
}));

// Mock supabase client
vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            updateUser: vi.fn().mockResolvedValue({ data: {}, error: null })
        }
    }
}));

describe('useSidebarPreferences', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should initialize with default values if local and remote are empty', () => {
        // override mock to return null user
        vi.doMock('../lib/AuthContext', () => ({
            useAuth: () => ({ user: null })
        }));
        
        const { result } = renderHook(() => useSidebarPreferences());
        expect(result.current.position).toBe('left');
        expect(result.current.onboardingShown).toBe(false);
    });

    it('should update position state and save to storage', async () => {
        const { result } = renderHook(() => useSidebarPreferences());
        await act(async () => {
            await result.current.updatePosition('bottom');
        });
        expect(result.current.position).toBe('bottom');
        expect(localStorage.getItem('voxie_sidebar_position')).toBe('bottom');
    });

    it('should complete onboarding state and save to storage', async () => {
        const { result } = renderHook(() => useSidebarPreferences());
        await act(async () => {
            await result.current.completeOnboarding();
        });
        expect(result.current.onboardingShown).toBe(true);
        expect(localStorage.getItem('voxie_sidebar_onboarding_shown')).toBe('true');
    });
});
```

**Step 2: Run test to verify it fails**
Run: `npm run test src/hooks/useSidebarPreferences.test.ts`
Expected: FAIL (File and hook do not exist yet)

**Step 3: Write minimal implementation**
Create `src/hooks/useSidebarPreferences.ts`:
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';

export function useSidebarPreferences() {
    const { user } = useAuth();
    const [position, setPosition] = useState<SidebarPosition>(() => {
        return (localStorage.getItem('voxie_sidebar_position') as SidebarPosition) || 'left';
    });
    const [onboardingShown, setOnboardingShown] = useState<boolean>(() => {
        return localStorage.getItem('voxie_sidebar_onboarding_shown') === 'true';
    });

    // Sync from user metadata when user changes
    useEffect(() => {
        if (user?.user_metadata) {
            const remotePos = user.user_metadata.sidebar_position as SidebarPosition;
            const remoteOnboarding = user.user_metadata.sidebar_onboarding_shown as boolean;
            
            if (remotePos && ['left', 'right', 'top', 'bottom'].includes(remotePos)) {
                setPosition(remotePos);
                localStorage.setItem('voxie_sidebar_position', remotePos);
            }
            if (remoteOnboarding !== undefined) {
                setOnboardingShown(remoteOnboarding);
                localStorage.setItem('voxie_sidebar_onboarding_shown', String(remoteOnboarding));
            }
        }
    }, [user]);

    const updatePosition = async (newPos: SidebarPosition) => {
        setPosition(newPos);
        localStorage.setItem('voxie_sidebar_position', newPos);
        if (user) {
            try {
                await supabase.auth.updateUser({
                    data: { sidebar_position: newPos }
                });
            } catch (err) {
                console.error('Failed to sync position to Supabase:', err);
            }
        }
    };

    const completeOnboarding = async () => {
        setOnboardingShown(true);
        localStorage.setItem('voxie_sidebar_onboarding_shown', 'true');
        if (user) {
            try {
                await supabase.auth.updateUser({
                    data: { sidebar_onboarding_shown: true }
                });
            } catch (err) {
                console.error('Failed to sync onboarding state to Supabase:', err);
            }
        }
    };

    return {
        position,
        onboardingShown,
        updatePosition,
        completeOnboarding
    };
}
```

**Step 4: Run test to verify it passes**
Run: `npm run test src/hooks/useSidebarPreferences.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/hooks/useSidebarPreferences.ts src/hooks/useSidebarPreferences.test.ts
git commit -m "feat: add useSidebarPreferences hook and tests"
```

---

### Task 2: Implement Layout Adaptability and CSS

**Files:**
- Modify: `src/index.css`

**Step 1: Check existing style variables**
Examine padding and fixed properties in `src/index.css:366-419` for `.app-layout`, `.sidebar-rail`, and `.main-content`.

**Step 2: Add orientation-specific classes and transitions**
Insert dynamic classes at the bottom of the Layout block in `src/index.css` to enable responsive horizontal views and transition styles:
```css
/* Layout Positioning Adaptations */
.app-layout.pos-left {
  flex-direction: row;
}
.app-layout.pos-right {
  flex-direction: row-reverse;
}
.app-layout.pos-top, .app-layout.pos-bottom {
  flex-direction: column;
}

/* Sidebar Adaptations */
.sidebar-rail.pos-left {
  left: 1.5rem;
  right: auto;
  top: 50%;
  bottom: auto;
  transform: translateY(-50%);
  flex-direction: column;
  height: auto;
  width: 68px;
}
.sidebar-rail.pos-right {
  right: 1.5rem;
  left: auto;
  top: 50%;
  bottom: auto;
  transform: translateY(-50%);
  flex-direction: column;
  height: auto;
  width: 68px;
}
.sidebar-rail.pos-top {
  top: 1.5rem;
  bottom: auto;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  flex-direction: row;
  height: 68px;
  width: 90%;
  max-width: 800px;
  padding: 0 24px;
}
.sidebar-rail.pos-bottom {
  bottom: 1.5rem;
  top: auto;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  flex-direction: row;
  height: 68px;
  width: 90%;
  max-width: 800px;
  padding: 0 24px;
}

/* Main Content Padding Adaptations */
.app-layout.pos-left .main-content {
  padding-left: 108px;
  padding-right: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.app-layout.pos-right .main-content {
  padding-right: 108px;
  padding-left: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.app-layout.pos-top .main-content {
  padding-top: 108px;
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
}
.app-layout.pos-bottom .main-content {
  padding-bottom: 108px;
  padding-left: 0;
  padding-right: 0;
  padding-top: 0;
}

/* Drop Zone Styles during dragging */
.drop-zone-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  pointer-events: none;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 1fr 2fr 1fr;
  padding: 1rem;
  gap: 1rem;
}

.drop-target-area {
  background: rgba(112, 42, 225, 0.03);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 2px dashed rgba(112, 42, 225, 0.15);
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-on-surface-muted);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drop-target-area.active {
  background: rgba(112, 42, 225, 0.15);
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: var(--shadow-elevated);
  transform: scale(1.02);
}

/* Onboarding Tooltip Glow Pulse */
@keyframes drag-glow-pulse {
  0%, 100% { box-shadow: 0 0 0 rgba(112, 42, 225, 0); }
  50% { box-shadow: 0 0 16px var(--color-primary); }
}

.drag-handle-glow {
  animation: drag-glow-pulse 2s infinite;
}
```

**Step 3: Verify style updates compile**
Run: `npm run build` (Ensures Tailwind v4 and CSS build compiles successfully)

**Step 4: Commit**
```bash
git add src/index.css
git commit -m "style: implement adaptable layout and drop zone class styles"
```

---

### Task 3: Integrate Draggable Aside using Framer Motion in Layout

**Files:**
- Modify: `src/components/Layout.tsx`

**Step 1: Import custom hook, Framer Motion features, and Lucide Icons**
Add imports in `src/components/Layout.tsx`:
```typescript
import { useSidebarPreferences, type SidebarPosition } from '../hooks/useSidebarPreferences';
import { GripVertical, GripHorizontal } from 'lucide-react';
```

**Step 2: Initialize hook and coordinate drag state**
Within the `Layout` component, initialize `useSidebarPreferences` and create local drag tracking states:
```typescript
const { position, onboardingShown, updatePosition, completeOnboarding } = useSidebarPreferences();
const [isDragging, setIsDragging] = useState(false);
const [activeDropZone, setActiveDropZone] = useState<SidebarPosition | null>(null);
const sidebarRef = useRef<HTMLElement>(null);
```

**Step 3: Render Drag Overlays and calculation logic**
Write a collision calculation function triggered during `onDrag`:
```typescript
const handleDrag = (_event: any, info: any) => {
    const x = info.point.x;
    const y = info.point.y;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Split viewport into 4 zones by proximity to screen boundaries
    const distToLeft = x;
    const distToRight = w - x;
    const distToTop = y;
    const distToBottom = h - y;

    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    if (minDist === distToLeft) {
        setActiveDropZone('left');
    } else if (minDist === distToRight) {
        setActiveDropZone('right');
    } else if (minDist === distToTop) {
        setActiveDropZone('top');
    } else {
        setActiveDropZone('bottom');
    }
};

const handleDragEnd = async () => {
    setIsDragging(false);
    if (activeDropZone) {
        await updatePosition(activeDropZone);
    }
    setActiveDropZone(null);
};
```

**Step 4: Update aside container and elements inside `Layout.tsx`**
Refactor the `<motion.aside>` element to:
1. Support Framer Motion's `drag` behaviors (using the `dragConstraints` and `dragElastic` properties).
2. Apply position-specific classes dynamically: `pos-${position}` and `app-layout pos-${position}` to the parent container.
3. Conditionally layout nav items in `flex-row` and hide profile titles when horizontal to maintain a clean dock aesthetic.
4. Render a drag handle icon (`GripVertical` when vertical, `GripHorizontal` when horizontal) at the edge of the sidebar.
5. Render the transparent/glass overlay drop zones during active drag:
```typescript
{isDragging && (
    <div className="drop-zone-overlay">
        <div className={`drop-target-area col-start-1 row-start-2 ${activeDropZone === 'left' ? 'active' : ''}`}>
            <span>Alinear Izquierda</span>
        </div>
        <div className={`drop-target-area col-start-3 row-start-2 ${activeDropZone === 'right' ? 'active' : ''}`}>
            <span>Alinear Derecha</span>
        </div>
        <div className={`drop-target-area col-start-2 row-start-1 ${activeDropZone === 'top' ? 'active' : ''}`}>
            <span>Alinear Arriba</span>
        </div>
        <div className={`drop-target-area col-start-2 row-start-3 ${activeDropZone === 'bottom' ? 'active' : ''}`}>
            <span>Alinear Abajo</span>
        </div>
    </div>
)}
```

**Step 5: Run tests and verify the code compiles**
Run: `npm run build`
Expected: SUCCESS

**Step 6: Commit**
```bash
git add src/components/Layout.tsx
git commit -m "feat: integrate Framer Motion draggable sidebar and drop zone overlays"
```

---

### Task 4: Add Onboarding Tutorial and Glow Handle

**Files:**
- Modify: `src/components/Layout.tsx`

**Step 1: Design onboarding glassmorphic tooltip**
Within `Layout.tsx`, implement the onboarding tooltip element next to the drag handle. Render it only if `!onboardingShown` is true:
```typescript
{!onboardingShown && (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`absolute z-[60] bg-white/90 dark:bg-black/90 backdrop-blur-md p-4 rounded-2xl shadow-[var(--shadow-float)] border border-purple-500/20 max-w-[240px] text-left text-xs ${
            position === 'top' || position === 'bottom'
                ? 'top-full mt-2 left-0'
                : 'left-full ml-4 top-0'
        }`}
    >
        <p className="font-semibold text-[var(--color-on-surface)] leading-relaxed">
            💡 <strong>¡Nueva función!</strong> Arrastra la barra desde el tirador punteado para acoplarla arriba, abajo, a la izquierda o derecha de tu pantalla.
        </p>
        <button
            onClick={completeOnboarding}
            className="mt-3 w-full py-1.5 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] text-white text-[10px] font-black rounded-full shadow-md text-center hover:scale-102 transition-transform duration-200 cursor-pointer"
        >
            Entendido
        </button>
    </motion.div>
)}
```

**Step 2: Add dynamic class name to the Drag Handle**
Apply `.drag-handle-glow` class to the Grip handle element if `!onboardingShown` is active.

**Step 3: Run comprehensive verification**
Run: `npm run build`
Run: `npm run test`
Expected: ALL test suites pass and compilation completes successfully.

**Step 4: Commit**
```bash
git add src/components/Layout.tsx
git commit -m "feat: add sidebar drag handle onboarding tooltip"
```
