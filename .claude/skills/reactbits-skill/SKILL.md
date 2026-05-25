---
name: reactbits
description: Use ReactBits animated React components from reactbits.dev. Trigger this skill whenever the user wants to add animations, animated text, animated backgrounds, cursor effects, interactive UI components, or visual polish to a React/Next.js project using ReactBits. Also trigger when the user mentions BlurText, SplitText, Particles, Aurora, Magnet, BlobCursor, CountUp, or any other ReactBits component by name. Use this skill even if the user just says "quiero animar esto" or "hazlo más visual" in a React context — ReactBits is likely the right tool.
---

# ReactBits Skill

ReactBits es una librería de 110+ componentes React animados, interactivos y 100% customizables. Se instalan con copy-paste o CLI y vienen en 4 variantes.

📖 Docs: https://reactbits.dev  
📦 GitHub: https://github.com/DavidHDev/react-bits  
🔑 Licencia: MIT + Commons Clause (uso personal y comercial libre)

---

## Variantes disponibles (elegir UNA)

| Código | Descripción |
|--------|-------------|
| `JS-CSS` | JavaScript + CSS plano |
| `JS-TW` | JavaScript + Tailwind CSS |
| `TS-CSS` | TypeScript + CSS plano |
| `TS-TW` | TypeScript + Tailwind CSS ← recomendado para Voxie |

---

## Instalación

### Opción A — CLI via shadcn (más fácil)
```bash
npx shadcn@latest add @react-bits/<ComponentName>-<VARIANT>

# Ejemplo:
npx shadcn@latest add @react-bits/BlurText-TS-TW
npx shadcn@latest add @react-bits/Particles-TS-TW
```

### Opción B — CLI via jsrepo
```bash
npx jsrepo add https://reactbits.dev/<VARIANT>/<Category>/<ComponentName>

# Ejemplo:
npx jsrepo add https://reactbits.dev/ts-tw/TextAnimations/BlurText
npx jsrepo add https://reactbits.dev/ts-tw/Backgrounds/Particles
```

### Opción C — Copy-paste manual
Ir al componente en reactbits.dev → seleccionar variante → copiar código → pegar en `src/components/`.

---

## Categorías y componentes destacados

Lee el archivo `references/components.md` para el catálogo completo con props y ejemplos de uso.

### Resumen rápido:

| Categoría | URL base | Casos de uso |
|-----------|----------|--------------|
| **Text Animations** | `/text-animations/` | Títulos, subtítulos, contadores, texto animado |
| **Animations** | `/animations/` | Cursores, efectos de hover, interacciones |
| **Components** | `/components/` | Cards, listas, sliders, elementos UI |
| **Backgrounds** | `/backgrounds/` | Fondos animados para hero sections, páginas |

---

## Flujo de trabajo recomendado

1. **Identificar qué quiere animar el usuario** → mapear a una categoría
2. **Elegir la variante** → preguntar si usa Tailwind o CSS plano, JS o TS
3. **Instalar con CLI o copiar el código** desde reactbits.dev
4. **Personalizar via props** — todos los componentes exponen props para colores, velocidad, tamaño, etc.
5. **Importar en el componente React** donde se necesita

---

## Patrón de uso general

```tsx
// 1. Instalar: npx shadcn@latest add @react-bits/BlurText-TS-TW
// 2. Importar
import BlurText from "@/components/ui/BlurText";

// 3. Usar con props
<BlurText
  text="Welcome to Voxie"
  delay={150}
  animateBy="words"
  direction="top"
  className="text-4xl font-bold"
/>
```

---

## Dependencias comunes

La mayoría de componentes usan una de estas — instalar según lo que requiera el componente elegido:

```bash
npm install framer-motion     # Text Animations, la mayoría de efectos
npm install gsap              # Algunos cursores y animaciones avanzadas
npm install @react-spring/web # Alternativa física-based
npm install ogl               # Backgrounds con WebGL (Particles, Aurora, etc.)
```

> Cada componente indica su dependencia en la página de docs.

---

## Customización via props

Todos los componentes exponen props. Ejemplos típicos:

```tsx
// Color, velocidad, tamaño — varían por componente
<Particles
  particleColors={['#6366f1', '#a855f7']}
  particleCount={200}
  speed={0.5}
  className="absolute inset-0"
/>

<CountUp
  from={0}
  to={100}
  duration={2}
  className="text-6xl font-bold text-indigo-500"
/>

<Magnet padding={50} disabled={false}>
  <button>Hover me</button>
</Magnet>
```

---

## Referencia detallada

→ Ver `references/components.md` para props completas, ejemplos y URLs de cada componente.
