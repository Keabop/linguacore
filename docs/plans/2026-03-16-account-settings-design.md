# Account & Settings System — Design

## Overview

Replace the `/stats` page with a unified `/account` page that combines user profile, statistics, level progress, and access to settings and plan management. Move theme toggle and logout from sidebar into a settings modal.

## Sidebar — User Area (Bottom)

Replace current bottom section (level badge + theme toggle + logout) with:

- Circular avatar with user's initial + display name
- Level badge (existing `LevelBadge` component)
- Entire area is clickable → navigates to `/account`
- Remove "Estadísticas" from nav items (stats now live in `/account`)

## `/account` Page

### Header
- Large avatar (initial-based), user name, email
- Current plan label (Free / Pro)
- Gear icon (top-right) → opens SettingsModal

### Stats Section (visible to all)
- Streak (days)
- Words learned
- Stories read
- Cards reviewed
- Current level with progress bar (`useLevelProgression` — `overallPercent`)

### Pro-Only Stats
- Activity heatmap / detailed activity chart
- Stats by skill (speaking, writing, listening, reading)
- Gated behind `useTier().isPro` — free users see a subtle upsell prompt

## Settings Modal

Opened via gear icon on `/account` page. Contains:

1. **Theme** — Light/Dark toggle (moved from sidebar)
2. **Language** — Interface language (Spanish only for now, prepared for i18n expansion)
3. **Plan & Subscription** → navigates to plan management view
4. **Logout** — with red icon (moved from sidebar)

## Plan Management (inside Settings Modal or sub-view)

### Free User
- Shows "Plan actual: Gratuito"
- "Nivel A1 incluido"
- CTA button → navigates to `/pricing`

### Pro User (active subscription)
- Shows plan type (Mensual/Anual), price, next billing date
- "Cancelar suscripción" button (subtle, red text)

### Cancellation Flow
Confirmation dialog showing:
- List of features they'll lose (A2-B2, unlimited AI tutor, unlimited writing practice, story generation)
- Access continues until end of current billing cycle (e.g., "Tu acceso Pro continúa hasta el 16 de abril, 2026")
- Two buttons: "Mantener Pro" (primary) / "Sí, cancelar" (destructive)
- Calls `api/payments/cancel-subscription.ts` endpoint

### Reactivation
- If subscription is cancelled but still within billing period: show "Plan cancela el [date]" with "Reactivar" button

## Level Progress Fix

- Use `useLevelProgression` hook (unit-based, already correct)
- Show only current level with progress bar and percentage
- Remove old system based on "required words / required stories"
- No "complete to advance" message

## Files

### New
| File | Purpose |
|------|---------|
| `src/pages/Account.tsx` | Unified account page (profile + stats + level) |
| `src/components/SettingsModal.tsx` | Configuration modal (theme, language, plan, logout) |
| `src/components/PlanSection.tsx` | Plan display + cancel/reactivate logic |
| `api/payments/cancel-subscription.ts` | Mercado Pago subscription cancellation endpoint |

### Modified
| File | Changes |
|------|---------|
| `src/components/Layout.tsx` | New user area at sidebar bottom, remove stats from nav, remove theme/logout buttons |
| `src/App.tsx` | Replace `/stats` route with `/account` |
| `src/hooks/useLevelProgression.ts` | Expose next level name if needed |
| `src/i18n/es.json` | Add account/settings/plan translation keys |

### Removed
| File | Reason |
|------|--------|
| `src/pages/Stats.tsx` | Replaced by Account.tsx |

## Navigation Changes

- Sidebar nav: remove "Estadísticas" item
- Sidebar bottom: user area (avatar + name + level) → `/account`
- `/stats` → `/account` (redirect or replace)
