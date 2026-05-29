# LinguaCore Redesign — Design Document
**Date:** 2026-03-25
**Status:** Approved
**Stitch Project:** `projects/17330469477811533363`

---

## 1. Concepto: "The Fluid Scholar"

Diseño editorial + tecnología suave. Ni gamificado ni aburrido — como un tutor inteligente. El objetivo es que LinguaCore se sienta premium, moderno y claramente enfocado en aprender inglés, sin copiar el estilo de Duolingo ni de ninguna app existente.

**Principios clave:**
- Light mode como predeterminado, dark mode como alternativa
- Sin líneas divisoras — la separación se logra solo por cambio de color de fondo
- Esquinas siempre redondeadas (`rounded-full` o `rounded-2xl`)
- Sombras tintadas con el color primario, nunca grises
- Texto nunca negro puro — siempre `#3A264B` (violeta oscuro)

---

## 2. Sistema de Diseño — Paleta de Colores

### Light Mode (predeterminado)

| Token CSS | Valor | Uso |
|---|---|---|
| `--color-primary` | `#702AE1` | CTAs, accents activos |
| `--color-primary-light` | `#B28CFF` | Gradientes, hovers |
| `--color-background` | `#FEF3FF` | Fondo base |
| `--color-surface` | `#FAECFF` | Secciones secundarias |
| `--color-surface-container` | `#F5E2FF` | Contenedores |
| `--color-surface-high` | `#F1DAFF` | Cards elevadas |
| `--color-card` | `#FFFFFF` | Cards sobre surface |
| `--color-on-surface` | `#3A264B` | Texto principal |
| `--color-on-surface-muted` | `#69537B` | Texto secundario |
| `--color-tertiary` | `#9E3657` | Streaks, logros |
| `--color-outline` | `#BDA3D1` | Bordes sutiles (20% opacity) |

### Dark Mode

| Token CSS | Valor |
|---|---|
| `--color-background` | `#180429` |
| `--color-surface` | `#1E0A35` |
| `--color-card` | `#2A1040` |
| `--color-on-surface` | `#F0E6FF` |
| `--color-primary` | `#A67AFF` |

### Niveles CEFR (sin cambios, solo acentos)

| Nivel | Color | Uso |
|---|---|---|
| A1 | `#60A5FA` (blue) | Banda superior de card |
| A2 | `#4ADE80` (green) | Banda superior de card |
| B1 | `#FBBF24` (amber) | Banda superior de card |
| B2 | `#F87171` (red) | Banda superior de card |

---

## 3. Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Headlines / Labels | **Plus Jakarta Sans** | Títulos de página, headings, labels de nav |
| Body / Titles | **Be Vietnam Pro** | Párrafos, descripciones, contenido de lectura |

**Importación:** Google Fonts via `@import` en `index.css`

---

## 4. Componentes

### Sidebar
- Colapsada (64px): solo iconos, tooltip al hover
- Expandida (220px): iconos + labels, logo completo
- Fondo: `#FFFFFF` con sombra `rgba(112,42,225,0.08)`
- Toggle: botón en la parte inferior

### Botones
- **Primary:** gradiente `#702AE1 → #B28CFF` a 135°, `rounded-full`, escala 102% en hover
- **Secondary:** fondo `#EDD3FF`, texto `#702AE1`, sin borde
- **Ghost:** solo texto `#702AE1`, sin fondo

### Cards de Historia
- Fondo `#FFFFFF`, `rounded-2xl`, sombra tintada
- Banda de color arriba (4px) según nivel CEFR
- Título, subtítulo, badge de nivel, Progress Bloom

### Progress Bloom
- Track: `rounded-full`, fondo `#EDD3FF`
- Fill: `#702AE1` con glow `rgba(112,42,225,0.3)` en el extremo
- Reemplaza barras de progreso rectangulares en toda la app

### Dashboard Hero
- Saludo: *"Buenos días, [nombre]"* en headline grande
- Streak card: acento `#9E3657`, número grande, ícono de fuego
- Stats: 3 cards pequeñas flotantes (racha, historias, vocabulario)

### Learning Path Timeline
- Puntos de progreso en timeline vertical
- Unidad activa: card violeta con CTA prominente
- Unidades bloqueadas: `#F5E2FF` con texto `#BDA3D1`
- Mensaje motivacional dinámico arriba

### Inputs
- Fondo: `#EDD3FF`
- Shape: `rounded-xl`
- Focus: borde fantasma violeta 20% opacity

---

## 5. Temas Pro

Implementados como `data-theme` en el elemento `<html>`. Desbloqueados solo para usuarios con plan Pro.

```css
[data-theme="purple"]   /* Default — The Fluid Scholar */
[data-theme="ocean"]    /* Azul/teal */
[data-theme="forest"]   /* Verde esmeralda */
[data-theme="midnight"] /* Oscuro profundo */
```

- Selector en `/account` con preview vivo
- Preferencia persistida en Supabase (columna `theme_preference` en tabla `profiles`)
- Usuarios Free ven el selector pero con lock icon

---

## 6. Orden de Implementación

### Fase 1 — Design System
1. Actualizar tokens en `src/index.css` (Tailwind v4 `@theme`)
2. Instalar Plus Jakarta Sans + Be Vietnam Pro
3. Actualizar `ThemeContext` para soportar temas Pro
4. Crear utilidades CSS para sombras y gradientes

### Fase 2 — Landing + Auth
1. Rediseñar `src/pages/Landing.tsx`
2. Rediseñar `src/pages/Auth.tsx`

### Fase 3 — Dashboard + Sidebar
1. Rediseñar `src/components/Layout.tsx` (sidebar expandible)
2. Rediseñar `src/pages/Dashboard.tsx`

### Fase 4 — Páginas de Contenido
1. `/learn` — story cards rediseñadas
2. `/path` — timeline estilo Stitch
3. `/chat`, `/practice`, `/review` — ajustes visuales con los nuevos tokens

### Fase 5 — Pro Themes
1. Definir 3 temas adicionales en CSS
2. Selector de temas en `/account`
3. Integración con Supabase para persistir preferencia

---

## 7. Referencias

- Stitch Project: `https://stitch.withgoogle.com/project/17330469477811533363`
- Dashboard mockup: `E:/UNIVERSIDAD/stitch_dashboard.png`
- Learning Path mockup: `E:/UNIVERSIDAD/stitch_path.png`
- App actual: `https://linguacore-zeta.vercel.app`
