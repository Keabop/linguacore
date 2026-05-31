# Documento de Diseño: Barra de Navegación Arrastrable y Adaptable (Movable Sidebar)

**Fecha:** 2026-05-30  
**Autor:** Antigravity (AI Coding Assistant)  
**Proyecto:** Voxie (LinguaCore)  
**Estado:** Aprobado por el usuario  

---

## 1. Introducción y Contexto
Actualmente, la barra de navegación de Voxie (`.sidebar-rail` en `Layout.tsx`) se encuentra fija en el lateral izquierdo de la pantalla para los usuarios de computadora. Para mejorar la personalización de la interfaz y la usabilidad en pantallas de diferentes tamaños, se implementará una funcionalidad que permita a los usuarios de PC arrastrar y soltar la barra para acoplarla en cuatro posiciones distintas:
*   **Lateral izquierdo** (Posición por defecto)
*   **Lateral derecho**
*   **Centro inferior** (Estilo dock de macOS)
*   **Centro superior**

---

## 2. Requerimientos
*   **Arrastre interactivo (Framer Motion):** Permitir el arrastre libre de la barra de navegación mediante un tirador visual dedicado (`drag handle`).
*   **Zonas de acoplamiento (Drop Zones):** Mostrar cuatro áreas visuales translúcidas (*glassmorphism*) en los bordes de la pantalla al iniciar el arrastre, indicando los posibles destinos de acoplamiento.
*   **Atracción y acoplamiento suave:** Resaltar la zona activa si el tirador está cerca y acoplar la barra con una animación fluida al soltarla.
*   **Persistencia en la nube (Supabase):** Guardar de forma permanente la posición elegida en la propiedad `user_metadata` del perfil del usuario para sincronizarla entre dispositivos.
*   **Persistencia local (Resiliencia Offline):** Guardar en `localStorage` la posición elegida para evitar retardos visuales durante la carga inicial de la aplicación.
*   **Tutorial de inducción (Onboarding):** Mostrar una sola vez un globo informativo flotante al usuario (nuevo o recurrente) explicando cómo arrastrar la barra, el cual se desactivará permanentemente tras hacer clic en "Entendido".

---

## 3. Arquitectura y Modelo de Datos
La posición de la barra y el estado del onboarding se almacenarán en Supabase utilizando la columna `user_metadata` dentro de `auth.users`, lo que evita la necesidad de ejecutar migraciones SQL invasivas en la tabla `profiles`.

### Parámetros a guardar:
```json
{
  "sidebar_position": "left", // 'left' | 'right' | 'top' | 'bottom'
  "sidebar_onboarding_shown": true // boolean
}
```

### Flujo de datos:
1. Al cargar la aplicación en `Layout.tsx`, el hook `useSidebarPreferences` inicializará los estados a partir de `localStorage` (prioritario para carga instantánea) y luego validará/sincronizará con `user.user_metadata` de Supabase una vez que el estado de autenticación esté listo.
2. Al arrastrar y acoplar la barra, se actualizarán tanto el estado de React como el almacenamiento local y la API de Supabase en segundo plano.
3. El estado del onboarding se marcará como visto (`true`) al presionar "Entendido" en el tooltip.

---

## 4. Diseño de Interfaz (UI/UX) y Adaptabilidad CSS
El componente principal en `Layout.tsx` adaptará dinámicamente sus clases de Tailwind y estilos estructurales basados en el estado `position` (`'left' | 'right' | 'top' | 'bottom'`).

### 4.1. Modos de Visualización del Layout
*   **Modo Vertical (Left/Right):**
    *   Fórmula: `flex-col`, ancho dinámico (`68px` cerrado, `260px` en hover), centrado verticalmente.
    *   Tirador: Ubicado en la parte superior del aside.
*   **Modo Horizontal (Top/Bottom):**
    *   Fórmula: `flex-row items-center py-0 px-6 h-17 w-[90%] max-w-4xl`, centrado horizontalmente.
    *   Tirador: Ubicado en el extremo izquierdo.
    *   Elementos del menú: Distribuidos horizontalmente utilizando `space-x-2 space-y-0`. El logotipo se alineará a la izquierda, los botones de navegación al centro y la foto de perfil del usuario a la derecha.

### 4.2. Estilos de las Zonas de Destino (*Glassmorphism*)
Durante el arrastre, se muestran cuatro contenedores overlay:
```css
.drop-zone {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px dashed rgba(112, 42, 225, 0.3);
  transition: all 0.3s ease;
}
.drop-zone.active {
  background: rgba(112, 42, 225, 0.25);
  border-color: var(--color-primary);
  box-shadow: 0 0 20px rgba(112, 42, 225, 0.2);
}
```

---

## 5. Plan de Implementación
1.  **Fase 1: Creación del Hook de Preferencias** (`src/hooks/useSidebarPreferences.ts`) para centralizar la lectura y escritura local y remota.
2.  **Fase 2: Diseño de los Contenedores y Clases Adaptativas** en `src/components/Layout.tsx` e `src/index.css` para soportar las orientaciones horizontales.
3.  **Fase 3: Integración de Framer Motion en Aside** para habilitar el arrastre y renderizar dinámicamente las zonas de destino e iluminarlas.
4.  **Fase 4: Diseño del Componente del Tutorial (Onboarding)** con efecto glassmorphic y animación de pulso sobre el tirador.
5.  **Fase 5: Validación e Pruebas de Funcionamiento** tanto online como simulando desconexión de red.
