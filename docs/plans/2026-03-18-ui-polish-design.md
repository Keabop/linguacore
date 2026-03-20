# Voxie UI Polish — Design Document

**Date:** 2026-03-18
**Status:** Approved
**Style:** Expresivo y dinámico (Brilliant.org-inspired), paleta sofisticada (no RGB/neon)
**References:** linear.app (inmersivo) + notion.so (showcase del producto)
**Library:** ReactBits (reactbits.dev) for animated components

---

## 1. Layout Global — Sidebar → Rail Colapsable

### Current
3-column layout: fixed 240px sidebar + main content + 300px widget sidebar.

### New
- **Default state:** Rail ~68px, solo íconos centrados, logo pequeño arriba, avatar abajo
- **On hover:** Expande a ~240px con animación (300ms ease). Se expande como overlay (position absolute + backdrop blur), el contenido principal NO se mueve (estilo Instagram web)
- **On mouse leave:** Texto fade out instantáneo (sin esperar animación), se siente snappy
- **Mobile:** Bottom bar flotante actual sin cambios
- **Main content:** Max-width ~1000px centrado, breathing room
- **Active item indicator:** Dot o barra lateral indigo con spring transition al cambiar de página

### Widgets eliminados
- Sidebar derecho **desaparece completamente**
- "Por repasar hoy" → solo en Dashboard como card
- Racha + progreso → ya están en Account page

### ReactBits
- **Magnet** effect sutil en íconos del rail al hover
- **AnimatedList** en items de texto al expandir (~0.15s stagger)

---

## 2. Landing Page — Rediseño Completo

### Hero (sin scroll)
- **Fondo:** Aurora (ReactBits) — gradientes indigo/purple moviéndose lentamente sobre #09090B
- **Título:** SplitText — "Historias, práctica y AI. Todo lo que necesitas." palabra por palabra
- **Subtítulo:** BlurText — aparece con blur→focus después del título
- **CTA:** Un solo botón "Comenzar gratis", grande, indigo sólido, con Magnet effect
- **Preview:** Screenshot real del dashboard, entra desde abajo con parallax al scroll. Bordes redondeados, sombra profunda, perspectiva 3D tilt sutil

### Features (scroll 1)
- Título de sección con BlurText
- 6 feature cards con **SpotlightCard** (luz sigue al cursor)
- Entrada staggered al scroll (whileInView)
- Fondo oscuro elevado, ícono, título, descripción corta

### Cómo Funciona (scroll 2) — Estilo Notion
- 3 bloques verticales:
  - Izquierda: número + título + descripción
  - Derecha: screenshot real de la app (Ruta de aprendizaje, ejercicio, review)
- Cada bloque entra con slide lateral (izq→der alternando) al scroll
- El usuario VE la app funcionando

### Pricing (scroll 3)
- 2 cards: Free vs Pro
- Pro card con borde indigo glow animado (box-shadow)
- **CountUp** en precios ($129, $1,200)
- Feature list con checkmarks animados al entrar en viewport

### Footer
- Minimalista: logo + copyright + links básicos

---

## 3. Dashboard

### Saludo Contextual (reemplaza "Hola, sigue aprendiendo")
Frases basadas en datos reales del usuario:
- Tarjetas pendientes: "Tienes 17 tarjetas por repasar"
- Racha activa: "Llevas 5 días seguidos"
- Completó algo reciente: "Terminaste la unidad 3, sigue con la 4"
- Inactividad: "Han pasado 3 días desde tu última sesión"
- Texto con **BlurText** al cargar

### Layout
- Sin widgets laterales. Contenido centrado, max-width ~1000px
- Cards en grid responsive (2 columnas desktop, 1 mobile)

### Cards
- **"Continuar aprendiendo"** — Card principal, más grande. Fondo con gradiente mesh del nivel actual. Título de unidad con SplitText. Barra de progreso con glow del color del nivel. Botón con Magnet effect. SpotlightCard.
- **"Por repasar hoy"** — CountUp desde 0 en el número. Si >10 tarjetas: pulso sutil en borde. SpotlightCard al hover.
- **"Historias recomendadas"** — SpotlightCard + tilt 3D sutil al hover (CSS perspective, máx ~5deg). Gradientes mesh por nivel.
- **"Errores y gramática"** — Solo aparece si hay pendientes. CountUp en número.
- **Estado vacío** — Ícono animado con partículas sutiles + "Todo al día" con BlurText

### Transiciones
- **AnimatedList** (ReactBits) para entrada de cards
- Progress bars con animación de llenado en viewport

---

## 4. Cards — Ejercicios, Reviews, Stories

### Story Cards
- **SpotlightCard** + tilt 3D al hover (~5deg perspective)
- Gradientes mesh por nivel se mantienen
- Clic: transición expandiéndose hacia reader (shared layout animation)

### Review Cards (sesión de repaso)
- **Entrada:** Slide desde derecha + fade (como pasar tarjetas)
- **Correcta:** Flash verde recorriendo el borde (border animation)
- **Incorrecta:** Shake sutil + flash rojo en borde
- **Entre cards:** Flip 3D o slide horizontal

### Exercise Cards (UnitFlow)
- **Multiple choice:** Opciones con AnimatedList staggered. Correcta: scale up + borde verde glow. Incorrecta: shake + correcta se ilumina.
- **Fill blank:** Input con glow indigo al focus (se mantiene)
- **Word order:** Chips con sombra elevada al drag, snap satisfactorio al soltar

### UnitFlow Navigation
- Slide entre steps con spring physics (no ease)
- Progress bar con animación de llenado entre steps

---

## 5. Celebraciones y Logros

### Completar Unidad
- **Particles** (ReactBits) como fondo — doradas/indigo flotando (no confetti cayendo)
- Trophy: scale 0 → overshoot(1.3) → settle(1.0) con spring
- "¡Felicidades!" con **SplitText** rápido (~0.3s total)
- Stats con **CountUp** desde 0 (palabras, ejercicios correctos)
- Glow radial pulsante detrás del trophy
- Botón "Continuar" aparece con delay (1.5s) con BlurText

### Subir de Nivel (LevelUpModal)
- **Particles** con colores del nuevo nivel (A2=verde, B1=naranja, B2=rojo)
- Badge del nivel: scale + rotation 360° mientras crece
- **SplitText** rápido (~0.3s) en "¡Nivel X desbloqueado!"
- Features desbloqueadas con **AnimatedList** una por una
- Fondo con **Aurora** del color del nivel

### Completar Sesión de Repaso
- Más sutil — no es logro mayor
- **CountUp** en accuracy % y cards revisadas
- Accuracy >90%: destello dorado en el porcentaje
- Racha nueva: mini Particles breves (2-3 segundos)

---

## 6. Transiciones Globales y Detalles

### Page Transitions
- Cambiar de opacity + y:12 → opacity + scale(0.98→1.0, 0.25s). Evita parpadeo/"salto" vertical.

### Auth Page
- **Aurora** de fondo (continuidad con landing)
- Formulario: scale + fade desde centro

### Pricing Page (standalone)
- Misma estructura del landing pricing
- CountUp en precios, Pro card con glow, toggle mensual/anual con slide

### Sidebar Rail
- Expand: AnimatedList en texto (~0.15s stagger)
- Collapse: fade out instantáneo
- Active item: dot/barra indigo con spring

### Cursor
- **NO** BlobCursor ni efectos globales (molesto en uso prolongado)
- Solo Magnet en CTAs específicos (landing hero, botones "Continuar")

---

## Orden de Implementación

De afuera hacia adentro:
1. Landing page (rediseño completo)
2. Auth page (Aurora + animaciones)
3. Layout global (sidebar rail + eliminar widgets)
4. Dashboard (saludo contextual + cards + AnimatedList)
5. Story cards + Story reader
6. Review session (card transitions + feedback animations)
7. Exercise cards + UnitFlow (AnimatedList + spring physics)
8. Celebraciones (Particles + CountUp + SplitText)
9. Pricing page standalone
10. Page transitions globales

---

## ReactBits Components Used

| Component | Where |
|-----------|-------|
| Aurora | Landing hero, Auth page, LevelUpModal |
| SplitText | Landing title, unit titles, "¡Felicidades!" |
| BlurText | Landing subtitle, saludo contextual, section titles |
| SpotlightCard | Feature cards, dashboard cards, story cards |
| Magnet | CTAs (landing, dashboard "Continuar") |
| CountUp | Stats, precios, review accuracy, celebration stats |
| AnimatedList | Sidebar items, exercise options, feature lists, dashboard cards |
| Particles | Unit completion, level up, racha celebrations |
