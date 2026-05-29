# Design Document: Task 2 — Dashboard & Stats Cards Redesign

## 1. Overview
This document details the visual redesign of the Voxie Dashboard (`Dashboard.tsx`), focusing on the Bento grid stats cards, the Continue Learning widget milestone badge, and adding visual CEFR level bands to the recommended story cards. All underlying business logic, state hooks, query integrations, and reactbits animation components are strictly preserved.

## 2. Design Specification & Approaches

### 2a. QuickStat Bento Cards Redesign
The QuickStat card is transitioned from a centered layout to a modern left-aligned, border-accented card.

**Properties Changes:**
- **Layout:** Change from `text-center`, `p-5`, and `rounded-[2rem]` to `text-left`, `p-6`, and `rounded-2xl`.
- **Accent Border:** Add `borderAccent` parameter to paint the left border with `border-l-4`.
- **Colors:**
  - Study Streak: `var(--color-tertiary)`
  - Total Cards: `var(--color-primary)`
  - Stories Read: `var(--color-success)`
- **Internal Structure:**
  Label and icon are placed on a single horizontal row (`flex justify-between items-center`), with the count (`CountUp`) block-displayed below.

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

### 2b. Continue Learning Milestone Badge
An pill-shaped badge displaying **SIGUIENTE HITO** will be added immediately above the incomplete unit title.

```tsx
<div className="flex items-center gap-2 mb-1">
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-surface-container-low)] text-[var(--color-primary)]">
        SIGUIENTE HITO
    </span>
</div>
```

### 2c. Recommended Story Cards CEFR Band
A thin 4px (`h-1`) horizontal level band is introduced at the very top of each recommended story card. The color is dynamically determined by the story's CEFR level:

```tsx
const levelColor = {
    A1: 'var(--color-level-a1)',
    A2: 'var(--color-level-a2)',
    B1: 'var(--color-level-b1)',
    B2: 'var(--color-level-b2)',
}[story.level] || 'var(--color-primary)';
```

The band is rendered inside the main card container:
```tsx
<div style={{ backgroundColor: levelColor }} className="h-1 w-full shrink-0" />
```

## 3. Verification Plan
1. **Compilation Validation:** Run compilation tests using the TypeScript compiler or Vite build.
2. **Visual Auditing:** Inspect the changed code elements against the specified classes and tags to ensure no side-effects or regressions in logic.
