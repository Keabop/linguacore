# ReactBits — Catálogo de Componentes

Referencia rápida de los componentes más usados con sus props principales y URLs de docs.

---

## 💬 TEXT ANIMATIONS
URL base: `https://reactbits.dev/text-animations/<slug>`

### BlurText
Texto que aparece con efecto blur/desenfoque animado.
```tsx
<BlurText
  text="Hello World"
  delay={150}           // ms entre cada palabra/char
  animateBy="words"     // "words" | "chars"
  direction="top"       // "top" | "bottom" | "left" | "right"
  onAnimationComplete={() => {}}
  className="text-4xl"
/>
```
URL: https://reactbits.dev/text-animations/blur-text

---

### SplitText
Anima cada letra/palabra por separado con spring physics.
```tsx
<SplitText
  text="Split Animation"
  className="text-5xl font-bold"
  delay={100}
  animationFrom={{ opacity: 0, transform: 'translate3d(0,40px,0)' }}
  animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
  easing="easeOutCubic"
  threshold={0.2}
  rootMargin="-50px"
  onLetterAnimationComplete={() => {}}
/>
```
URL: https://reactbits.dev/text-animations/split-text

---

### CountUp
Contador animado de número a número.
```tsx
<CountUp
  from={0}
  to={1000}
  separator=","
  direction="up"        // "up" | "down"
  duration={2}          // segundos
  className="text-6xl font-bold"
  onStart={() => {}}
  onEnd={() => {}}
/>
```
URL: https://reactbits.dev/text-animations/count-up

---

### CircularText
Texto que sigue un camino circular, puede rotar.
```tsx
<CircularText
  text="REACT BITS • ANIMATED • "
  onHover="speedUp"      // "slowDown" | "speedUp" | "pause" | "goBonkers"
  spinDuration={20}      // segundos por vuelta
  className="text-sm"
/>
```
URL: https://reactbits.dev/text-animations/circular-text

---

### GlitchText
Texto con efecto glitch/corrupción digital.
```tsx
<GlitchText
  speed={1}             // velocidad del glitch
  enableShadows={true}
  enableOnHover={false}
  className="text-4xl font-bold"
>
  Glitch Effect
</GlitchText>
```
URL: https://reactbits.dev/text-animations/glitch-text

---

### TypewriterText (RotatingText)
Efecto de typing / texto que rota entre opciones.
```tsx
<RotatingText
  texts={['React', 'Animated', 'Awesome']}
  mainClassName="text-3xl font-bold"
  rotationInterval={2000}
/>
```
URL: https://reactbits.dev/text-animations/rotating-text

---

### ShinyText
Texto con efecto de brillo que se mueve.
```tsx
<ShinyText
  text="Shiny Text"
  disabled={false}
  speed={3}             // velocidad del brillo
  className="text-2xl"
/>
```
URL: https://reactbits.dev/text-animations/shiny-text

---

### ScrollReveal / GradientText / DecryptedText / FuzzyText
- **ScrollReveal**: Texto que se revela al hacer scroll
- **GradientText**: Texto con gradiente animado
- **DecryptedText**: Efecto de descifrado char a char
- **FuzzyText**: Texto con fuzz/ruido en hover

---

## 🌀 ANIMATIONS
URL base: `https://reactbits.dev/animations/<slug>`

### Magnet
Wrapper que atrae el cursor como un imán.
```tsx
<Magnet padding={50} disabled={false} magnetStrength={2}>
  <button className="btn">Hover me</button>
</Magnet>
```
URL: https://reactbits.dev/animations/magnet

---

### BlobCursor
Cursor personalizado con efecto blob/fluido.
```tsx
<BlobCursor blobType="circle" fillColor="#6366f1" />
// Envuelve toda la página o sección donde se quiere el efecto
```
URL: https://reactbits.dev/animations/blob-cursor

---

### SplashCursor
Cursor con efecto de splash de fluido (WebGL).
```tsx
<SplashCursor />
// Sin props obligatorias, cubre toda la viewport
```
URL: https://reactbits.dev/animations/splash-cursor

---

### Floating / FollowingEyes / Ribbon / Noise
Animaciones de flotación, ojos que siguen el cursor, cintas y ruido.

---

## 🧩 COMPONENTS
URL base: `https://reactbits.dev/components/<slug>`

### AnimatedList
Lista donde los items entran con animación stagger.
```tsx
<AnimatedList delay={1000}>
  {items.map(item => <div key={item.id}>{item.text}</div>)}
</AnimatedList>
```
URL: https://reactbits.dev/components/animated-list

---

### Dock
Dock estilo macOS con efecto de escala en hover.
```tsx
<Dock
  items={[
    { icon: <HomeIcon />, label: 'Home', onClick: () => {} },
    { icon: <SearchIcon />, label: 'Search', onClick: () => {} },
  ]}
  panelHeight={68}
  baseItemSize={50}
  magnification={70}
/>
```
URL: https://reactbits.dev/components/dock

---

### GlassIcons / TiltedCard / ElasticSlider
- **GlassIcons**: Iconos con efecto glassmorphism
- **TiltedCard**: Cards con efecto 3D tilt en hover
- **ElasticSlider**: Slider con física elástica

---

### Lanyard / ProfileCard / InfiniteScroll
- **Lanyard**: Badge/credencial animada
- **ProfileCard**: Card de perfil con efectos
- **InfiniteScroll**: Scroll infinito de elementos

---

### SpotlightCard
Card con efecto spotlight que sigue el cursor.
```tsx
<SpotlightCard
  className="custom-card"
  spotlightColor="rgba(99, 102, 241, 0.15)"
>
  <div>Card content</div>
</SpotlightCard>
```
URL: https://reactbits.dev/components/spotlight-card

---

## 🖼️ BACKGROUNDS
URL base: `https://reactbits.dev/backgrounds/<slug>`

### Particles
Sistema de partículas interactivo (las partículas se mueven al hover).
```tsx
<Particles
  particleColors={['#ffffff', '#6366f1']}
  particleCount={200}
  particleSpread={10}
  speed={0.1}
  particleBaseSize={100}
  moveParticlesOnHover={true}
  alphaParticles={false}
  disableRotation={false}
/>
```
URL: https://reactbits.dev/backgrounds/particles  
Dependencia: `ogl`

---

### Aurora
Fondo con efecto aurora boreal animado (WebGL).
```tsx
<Aurora
  colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
  blend={0.5}
  amplitude={1.0}
  speed={0.5}
/>
```
URL: https://reactbits.dev/backgrounds/aurora  
Dependencia: `ogl`

---

### Beams
Rayos de luz animados.
```tsx
<Beams
  beamWidth={2}
  beamHeight={15}
  beamNumber={12}
  lightColor="#6366f1"
  speed={2}
  noiseIntensity={1.75}
  scale={0.2}
  rotation={0}
/>
```
URL: https://reactbits.dev/backgrounds/beams

---

### GridDistortion
Grid que se distorsiona con el movimiento del cursor.
```tsx
<GridDistortion
  imageSrc="/hero-image.jpg"
  grid={10}
  mouse={0.1}
  strength={0.15}
  relaxation={0.9}
  className="w-full h-screen"
/>
```
URL: https://reactbits.dev/backgrounds/grid-distortion

---

### Iridescence / Threads / Waves / DotGrid / FlowField
Backgrounds avanzados con WebGL para fondos de hero sections.

---

## Uso en Voxie (sugerencias)

| Sección | Componente sugerido |
|---------|---------------------|
| Hero / Landing | `Aurora` + `BlurText` para el título |
| Contador de racha | `CountUp` |
| Lista de lecciones | `AnimatedList` |
| Botones de acción | `Magnet` wrapper |
| Loading states | `GlitchText` o `DecryptedText` |
| Cards de ejercicios | `SpotlightCard` o `TiltedCard` |
| Fondo app | `Particles` con colores del tema |
| Resultados / Score | `CountUp` + `SplitText` |
