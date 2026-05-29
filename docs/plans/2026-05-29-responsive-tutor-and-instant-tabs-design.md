# Plan de Diseño: Tutor IA Responsivo y Optimización de Transición de Pestañas

Este plan detalla las soluciones técnicas y de diseño para corregir los problemas de desbordamiento en el historial del Tutor IA, pulir su interfaz de conversación activa para celulares, y eliminar por completo el molesto parpadeo o refresco visual al cambiar de pestañas en la aplicación.

---

## 1. Objetivos de Diseño

1. **Responsividad Absoluta del Historial:** Asegurar que los mensajes muy largos del usuario inicial truncados en la vista previa del historial no estiren el botón de "Iniciar Conversación" ni generen desbordamiento horizontal en celulares.
2. **Interfaz Móvil Pulida y Premium del Tutor IA:** Rediseñar la pantalla de conversación activa en celulares para que luzca profesional, compacta y de alta gama:
   - Rediseño del encabezado para ahorrar espacio vertical en celulares.
   - Creación de un **Empty State / Onboarding** de bienvenida interactivo y animado antes de recibir el primer mensaje.
   - Burbujas de chat rediseñadas con mejor geometría (bordes asimétricos), fuentes y paddings compactos en celulares.
   - Barra de sugerencias inferior fluida con deslizamiento horizontal sin bordes rígidos.
3. **Pestañas Instantáneas sin Parpadeo (Flicker-Free):** Eliminar la pantalla en blanco y el cargador al cambiar de menú principal (Dashboard, Aprender, Tutor IA, Práctica, Repasar, Cuenta) mediante la combinación de importación estática y optimización de animaciones de Framer Motion.

---

## 2. Detalles de Implementación Técnica

### Fase 1: Corrección Física de Anchos (Historial en `ConversationTutor.tsx`)
- **Problema:** El elemento de texto `<p>` que contiene la previsualización no tiene un límite físico definido en flexbox, lo que causa que se estire al ancho completo del texto y desborde el botón contenedor, el cual a su vez ensancha el contenedor principal y el botón de "Iniciar Conversación".
- **Solución:**
  1. Modificar el contenedor de historial para asegurar control de ancho: `w-full max-w-full overflow-hidden flex flex-col min-w-0`.
  2. Ajustar el botón de la sesión del historial agregando las clases `w-full max-w-full overflow-hidden min-w-0`.
  3. Modificar la etiqueta `<p className="truncate">` para forzar su naturaleza de bloque de ancho completo: `block w-full truncate text-sm`.

### Fase 2: Rediseño Premium de la Conversación Activa en Móviles
- **Encabezado Compacto:**
  - En móviles, el botón "Terminar Sesión" (`t('chat.endSession')`) ocupa demasiado espacio. Se reemplazará con un botón responsivo:
    - Ocultará el texto en celulares y mostrará únicamente un icono de cierre elegante (la `X` de Lucide) mediante clases Tailwind: `hidden sm:inline` para el texto y una `X className="w-3.5 h-3.5 sm:hidden"` para celulares.
- **Pantalla de Bienvenida Interactiva (Empty State):**
  - Cuando `messages.length === 0` (y mientras se inicializa el tutor), renderizaremos una tarjeta de bienvenida premium y estilizada:
    - Un contenedor central con desenfoque de fondo (glassmorphism) y bordes muy redondeados.
    - Un avatar circular del Tutor de IA animado con pulso suave (`animate-pulse`).
    - Un título atractivo: *"Conectando con tu Tutor de IA..."*.
    - Sugerencias visuales interactivas y coloridas de temas para romper el hielo (ej. *"Roleplay en un restaurante"*, *"Simulación de entrevista"*).
- **Burbujas de Chat Adaptables:**
  - Reducir el padding en móviles de `p-4` a `p-3 md:p-4`.
  - Reducir el tamaño de texto de `text-sm` a `text-xs md:text-sm`.
  - Diseñar bordes asimétricos curvos para un estilo premium:
    - Mensajes del usuario: `rounded-2xl rounded-br-sm bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)]`.
    - Mensajes del tutor: `rounded-2xl rounded-bl-sm bg-[var(--color-surface-container-low)]`.
- **Deslizamiento de Sugerencias:**
  - Ajustar el contenedor de sugerencias para que use margen negativo `-mx-4 px-4` en móviles. Esto permite que las sugerencias se deslicen de borde a borde de la pantalla de forma nativa e infinita al hacer swipe horizontal, ocultando la barra de scroll (`scrollbar-none`).

### Fase 3: Optimización del "Refresco de Pantalla" (Instant Tabs)
- **Modificación de Imports en `src/App.tsx`:**
  - Cambiar los imports de carga asíncrona (`lazyRetry`) a imports estáticos tradicionales para las 6 páginas del menú principal:
    ```typescript
    import Dashboard from './pages/Dashboard';
    import StoryList from './pages/StoryList';
    import ConversationTutor from './pages/ConversationTutor';
    import Practice from './pages/Practice';
    import ReviewSession from './pages/ReviewSession';
    import Account from './pages/Account';
    ```
  - Mantener con `lazyRetry` las páginas más pesadas y que no corresponden al flujo continuo de pestañas secundarias: `Landing`, `Auth`, `StoryReader`, `LearningPath`, `UnitFlow`, `Pricing`.
- **Ajustes de Framer Motion en `src/components/Layout.tsx`:**
  - El componente principal de transición de páginas `<AnimatePresence mode="wait">` causa un retraso en blanco de 250ms mientras la pestaña anterior desaparece por completo.
  - Para hacerlo ultra-veloz y flicker-free:
    - Mantendremos un desvanecimiento muy rápido reduciendo la duración de la animación a `0.12s` (o `0.15s`).
    - Reduciremos el movimiento en el eje vertical `y` a `y: 4` para evitar un salto visual brusco al cambiar de pestaña. Esto produce un crossfade súper limpio e instantáneo.

---

## 3. Criterios de Aceptación y Verificación

1. **Responsivo del Historial:** Simular una sesión con un mensaje inicial de más de 200 caracteres y verificar que la tarjeta se trunque con puntos suspensivos (`...`) de forma limpia en un viewport de 320px de ancho sin generar scroll horizontal ni deformar el botón "Iniciar Conversación".
2. **Interfaz en Celulares:** Validar visualmente en herramientas de desarrollo de navegador (modo responsive iPhone SE/12 Pro) que:
   - El encabezado del chat no se desborde ni empuje elementos fuera de la pantalla.
   - Las burbujas de chat tengan tamaño de texto compacto (`text-xs`) y espaciado cómodo (`p-3`) sin colisionar con los bordes de la pantalla.
   - El empty state muestre la tarjeta de bienvenida premium interactiva de forma centrada y pulida.
3. **Flicker-Free Tabs:** Hacer clic rápidamente entre las opciones "Inicio", "Aprender", "Tutor IA", "Práctica", "Repasar" y verificar que la transición sea instantánea (menor a 150ms) sin mostrar el spinner de `PageLoader` ni destellos en blanco.
4. **Pruebas Automatizadas:** Asegurar que `npm run test:run` continúe pasando de forma exitosa y que el build de producción (`npm run build`) compile sin advertencias ni errores.
