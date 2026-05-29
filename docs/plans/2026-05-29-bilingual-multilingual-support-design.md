# Diseño del Sistema de Soporte Multilingüe y Bilingüe (Voxie)

**Fecha:** 2026-05-29  
**Estado:** Aprobado  
**Objetivo:** Permitir tres opciones de idioma para la interfaz, instrucciones y guías de la aplicación:
1. **Solo Español (ES):** El estado actual para hispanohablantes.
2. **Solo Inglés (EN):** Todo en inglés para una inmersión completa.
3. **Bilingüe (EN + ES):** Texto de navegación/instrucciones principal en inglés y la traducción correspondiente en español justo debajo en un formato de tipografía más pequeña.

---

## 1. Arquitectura y Gestión de Estado

El idioma de la interfaz se gestionará a través de un estado persistido en el cliente para mantener las capacidades fuera de línea (PWA) e instantáneas de `react-i18next`.

### Claves y Persistencia
- Se almacenará en `localStorage` bajo la clave `voxie-display-language`.
- Valores permitidos: `"es" | "en" | "bilingual"`.
- Por defecto será `"es"`.

### Mecanismo de react-i18next
- Se mantendrán dos diccionarios base en `src/i18n`: `es.json` y `en.json`.
- Si el usuario selecciona el modo `"bilingual"`, el idioma activo en `i18next` se configurará como `"en"` de forma interna para que los textos base se traduzcan por defecto en inglés, pero mantendremos en memoria la referencia de `"es"` para renderizar dinámicamente los subtítulos.

---

## 2. Implementación de los Mecanismos de Traducción

### Hook de Traducción Bilingüe (`src/hooks/useBilingual.ts`)
Proporciona una interfaz única para extraer traducciones en un solo idioma o en ambos de forma simultánea cuando el modo bilingüe está activo.

```typescript
import { useTranslation } from 'react-i18next';

export function useBilingual() {
    const { t, i18n } = useTranslation();
    const currentMode = localStorage.getItem('voxie-display-language') || 'es';

    const bt = (key: string, options?: any) => {
        if (currentMode === 'bilingual') {
            const primary = i18n.t(key, { ...options, lng: 'en' });
            const secondary = i18n.t(key, { ...options, lng: 'es' });
            return { primary, secondary, isBilingual: true };
        } else if (currentMode === 'en') {
            return { primary: i18n.t(key, { ...options, lng: 'en' }), secondary: '', isBilingual: false };
        } else {
            return { primary: i18n.t(key, { ...options, lng: 'es' }), secondary: '', isBilingual: false };
        }
    };

    return { bt, t, mode: currentMode };
}
```

### Componente de Interfaz Reusable (`src/components/ui/Bilingual.tsx`)
Renderiza de forma elegante y centralizada la tipografía de ambos idiomas con clases CSS adaptadas.

```typescript
import { useBilingual } from '../../hooks/useBilingual';

interface BilingualProps {
    textKey: string;
    options?: any;
    className?: string;
    subClassName?: string;
}

export default function Bilingual({ textKey, options, className, subClassName }: BilingualProps) {
    const { bt } = useBilingual();
    const { primary, secondary, isBilingual } = bt(textKey, options);

    if (isBilingual) {
        return (
            <span className="flex flex-col text-left leading-tight py-0.5">
                <span className={className}>{primary}</span>
                <span className={`text-[10px] text-[var(--color-on-surface-muted)]/75 font-semibold mt-0.5 tracking-wide lowercase first-letter:uppercase ${subClassName}`}>
                    {secondary}
                </span>
            </span>
        );
    }

    return <span className={className}>{primary}</span>;
}
```

---

## 3. Integración en la Interfaz (Sidebar y Tarjetas)

Para todas las etiquetas principales (como el menú de navegación y textos de control del Dashboard) se reemplazará la llamada tradicional `{t('key')}` por el componente `<Bilingual>`:
```typescript
<Bilingual textKey="nav.learn" className="text-sm font-semibold" />
```

### Selector en Ajustes (`src/components/SettingsModal.tsx`)
Se reemplaza el indicador de idioma por un selector interactivo de opción múltiple:
```typescript
<select
    value={currentLang}
    onChange={(e) => handleLangChange(e.target.value)}
    className="text-xs text-[var(--color-on-surface)] font-bold px-3 py-1.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-outline-subtle)] focus:outline-none cursor-pointer"
>
    <option value="es">Español</option>
    <option value="en">English</option>
    <option value="bilingual">Bilingüe (EN + ES)</option>
</select>
```

---

## 4. Impacto en Layout y Diseño Estético
Dado que el modo bilingüe aumenta la altura de los textos al añadir un subtítulo, las recientes actualizaciones que expandieron la altura de la barra lateral flotante (`h-12`) y el ancho del menú (`260px`) proveen el espacio de diseño perfecto para alojar los dos idiomas de forma armónica sin romper la maquetación.
