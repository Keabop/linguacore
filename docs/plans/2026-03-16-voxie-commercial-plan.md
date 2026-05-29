# Plan Comercial: Voxie

**Fecha:** 2026-03-16
**Dominio:** voxie.lat
**Deploy actual:** linguacore-zeta.vercel.app (migrar a voxie.lat)
**Estado:** Pre-lanzamiento

---

## 1. Identidad y Posicionamiento

**Nombre:** Voxie
**Origen:** Del latín "vox" (voz) + terminación amigable
**Tagline:** *"Aprende inglés a tu ritmo, con IA que te entiende"*

**Público objetivo:** Universitarios y profesionales jóvenes de México y LatAm que:
- Necesitan inglés para su carrera/trabajo
- No quieren pagar $200+ MXN por funciones básicas
- Odian la gamificación infantil (vidas, gemas, rachas punitivas)
- Quieren practicar conversación real, no solo rellenar huecos

**Posicionamiento:** La app de inglés que te deja probar todo el nivel A1 gratis para que veas si te funciona. Si te convence, desbloqueas el resto por menos de lo que cuesta un café a la semana.

**Diferenciador real:**
- Duolingo: gamificación, bloquea lecciones si no pagas, tutor IA solo para suscriptores (~$170 MXN/mes)
- Babbel: bloquea casi todo después de la primera unidad (~$200 MXN/mes)
- Voxie: nivel A1 completo gratis con tutor IA incluido, $129 MXN/mes para desbloquear A2→B2 + herramientas avanzadas

---

## 2. Filosofía de Monetización

**Principio fundamental:** Dale una probada real antes de pedir que pague.

El usuario gratuito tiene acceso completo al nivel A1: gramática, vocabulario, historias, ejercicios, speaking y tutor IA. Suficiente para aprender los fundamentos y experimentar el valor de la app. Si le funciona y quiere continuar a A2→B2 con herramientas avanzadas, se suscribe al Plan Pro.

No se usan precios engañosos, urgencia falsa, ni manipulación emocional. El usuario decide con información clara.

---

## 3. Tiers de Usuario

### 🆓 Free (sin límite de tiempo)

**Acceso al nivel A1 completo:**
- Todas las unidades de A1 (gramática, vocabulario, ejercicios)
- Historias interactivas (1 generación por semana)
- Speaking practice con Web Speech API
- Repaso con tarjetas FSRS (10 tarjetas/día)
- Correcciones básicas del tutor

**Tutor IA:**
- 5 mensajes por día en conversación
- 2 conversaciones visibles en el historial

**Estadísticas:**
- Progreso general por unidad (% completado)
- Streak informativo (sin castigo por perderlo)

**Niveles A2→B2:** Visibles en la ruta de aprendizaje con indicador de que requieren Plan Pro. El usuario ve qué le espera pero no accede al contenido.

### 🔑 Plan Pro — $129 MXN/mes | $1,200 MXN/año

**Todo lo de Free, más:**

**Curriculum completo A2→B2:**
- Todas las unidades de A2, B1 y B2 desbloqueadas
- Ejercicios ilimitados en todos los niveles
- Historias ilimitadas
- Tarjetas FSRS ilimitadas por día

**Tutor IA sin límite:**
- Conversaciones ilimitadas
- Historial completo de todas tus conversaciones pasadas
- Correcciones detalladas con explicaciones y variantes de ejemplo

**Tarjetas de error personalizadas:**
- Se generan automáticamente de CADA interacción con el tutor y el evaluador de escritura
- Ejercicios generados por IA enfocados en tus errores recurrentes

**Análisis de errores:**
- Historial completo de todo lo que la IA te corrigió, organizado por categoría (gramática, vocabulario, ortografía, estilo)
- Patrones de error: "Llevas 3 semanas cometiendo el mismo error con third person singular"
- Tendencias semanales: qué mejoró, qué necesita más práctica

**Estadísticas detalladas:**
- Curva de retención de vocabulario
- Errores más frecuentes por categoría
- Progreso semanal comparado
- Palabras dominadas vs en aprendizaje

**Evaluaciones de escritura completas:**
- Versión mejorada de tu texto con explicaciones línea por línea
- Análisis de estilo y sugerencias de nivel

**Trial gratuito:** 7 días de Plan Pro al completar 14 días consecutivos de uso. Sin tarjeta. El usuario experimenta todo y decide si vale la pena.

---

## 4. Reducción de Costos

### 4.1 Caché de IA

**Problema:** Cada llamada a Gemini cuesta dinero. Muchos usuarios generan el mismo contenido.
**Solución:** Tabla `ai_cache` en Supabase con hash del prompt como key.
**Impacto:** Historias, enrichment de vocabulario y planes de estudio se cachean. Reducción estimada del 60-80% en llamadas a Gemini.

### 4.2 Rate Limiting en Endpoints

**Problema:** Un usuario (free o pro) podría abusar de la API.
**Solución:** Rate limiting por usuario en los endpoints de IA:
- Free: 5 mensajes/día tutor, 1 historia/semana, 10 tarjetas FSRS/día
- Pro: Sin límite de mensajes, historias ilimitadas, tarjetas ilimitadas
- Ambos: Máximo 60 requests/minuto para prevenir abuso

### 4.3 Optimización de Prompts

**Problema:** Respuestas largas de Gemini consumen más tokens y pueden dar timeout en Vercel.
**Solución:** Prompts optimizados para respuestas concisas. Pre-generar contenido estático (planes de estudio, ejercicios base) en la DB.

### 4.4 Selección de Modelo

**Estrategia de costos por modelo Gemini:**
- Tareas simples (ejercicios, vocabulario): Gemini 2.0 Flash ($0.10/$0.40 por 1M tokens)
- Tutor conversacional: Gemini 2.0 Flash (balance costo/calidad)
- Evaluaciones complejas: Gemini 2.5 Flash solo si necesario ($0.15/$0.60 por 1M tokens)
- Nunca usar Gemini 2.5 Pro ($1.25/$10.00) para operaciones rutinarias

**Estimación de costos de IA:**
- ~$0.0003 USD por request típico con Gemini 2.0 Flash
- 1,000 requests/día ≈ $9 USD/mes (~$180 MXN)
- Con caché agresivo, reducción a $50-100 MXN/mes para ~500 usuarios activos

---

## 5. Pagos — Mercado Pago

### 5.1 Fase 1: Mercado Pago

**Por qué primero:** El público inicial son universitarios mexicanos. Muchos no tienen tarjeta de crédito internacional. Mercado Pago acepta:
- Tarjeta de débito mexicana
- OXXO
- Transferencia SPEI
- Saldo de Mercado Pago

**Comisión real:** 3.49% + $4 MXN + IVA (16%) por transacción con acceso inmediato al dinero.
**Ingreso neto por suscripción mensual de $129 MXN:** ~$119 MXN después de comisiones.

**Suscripciones:** Mercado Pago soporta suscripciones recurrentes de forma nativa:
- Cobro automático mensual
- Reintentos automáticos en pagos rechazados
- Actualización automática de tarjetas
- Acepta OXXO y CLABE como métodos offline

**Implementación:**
- Checkout Pro de Mercado Pago (redirect al checkout de MP)
- Webhook para activar/desactivar tier_pro en Supabase
- Lógica idempotente en webhooks (MP puede enviar duplicados)

**Precauciones:**
- Cuentas nuevas tienen límites de retiro que aumentan con el historial
- MP puede retener fondos por "revisión de seguridad" en picos de volumen
- Presupuestar ~1-2% de pérdida por contracargos/disputas (MP favorece al comprador)

### 5.2 Fase 2: Lemon Squeezy (futuro)

**Cuándo:** Cuando haya usuarios fuera de México (Colombia, Argentina, Chile, etc.)
**Por qué:** Maneja impuestos internacionales automáticamente, acepta tarjetas internacionales
**Nota:** Se implementará como segundo método de pago, no reemplazo

---

## 6. Landing Page — voxie.lat

**Propósito:** Que el visitante entienda qué es Voxie, por qué es diferente, y se registre.

**Estructura propuesta:**
1. **Hero:** Tagline + CTA "Empieza gratis" + screenshot de la app en móvil
2. **Problema:** "Las apps de inglés te cobran por aprender lo básico. Nosotros te damos todo el nivel A1 gratis."
3. **Cómo funciona:** 3-4 features principales con capturas reales
4. **Pricing:** Free vs Pro, transparente, sin precios tachados ni urgencia falsa
5. **FAQ:** Preguntas comunes
6. **Footer:** Links, contacto

**Prompt de instalación PWA:** Incluir banner/guía visual de cómo agregar la app a la pantalla de inicio:
- Dentro de la landing page (sección dedicada "Instálala como app")
- Dentro de la app después de registrarse (banner dismissable con instrucciones paso a paso)
- Detección de plataforma: instrucciones específicas para iOS Safari vs Android Chrome

---

## 7. Marketing y Distribución

### 7.1 Lanzamiento (Semanas 1-4)

**Canal principal:** Grupos de Facebook de la comunidad universitaria
**Estrategia:** Posts orgánicos mostrando la app en uso, no publicidad genérica

**Mensaje tipo:**
> "Hice una app para aprender inglés con IA. Todo el nivel A1 es gratis — gramática, vocabulario, historias, y hasta un tutor con IA. Sin vidas, sin gemas. Si les interesa: voxie.lat"

**Acciones:**
- Publicar en grupos de Facebook de la universidad/comunidad
- Compartir con compañeros directamente (WhatsApp, Telegram)
- Pedir feedback activamente a los primeros usuarios

### 7.2 Crecimiento orgánico (Mes 2+)

- Posts en comunidades de programadores latinos (Reddit, Discord, Twitter/X)
- Testimonios de usuarios reales
- Boca a boca natural de usuarios satisfechos

**Nota:** No se contempla contenido en TikTok/Reels por ahora. La app es operada por una sola persona. Si la app gana tracción natural, se puede evaluar crear contenido en video más adelante.

### 7.3 Sin presupuesto de ads

No se contempla publicidad pagada en esta fase. Todo el crecimiento es orgánico. Cuando haya ingresos recurrentes estables, se puede evaluar ads en Facebook/Instagram.

---

## 8. Notificaciones Push (PWA)

**Máximo 2 notificaciones por día:**

1. **Recordatorio de práctica** (configurable por el usuario, default 8am):
   - "Tienes 8 tarjetas por repasar — toma 3 minutos"
   - Solo si el usuario no ha abierto la app ese día

2. **Dato de aprendizaje** (1 vez al día, horario variable):
   - "Esta semana aprendiste 15 palabras nuevas"
   - "Tu error más común es con present simple — ¿practicamos?"
   - "Llevas 5 días seguidos practicando"

**Reglas:**
- El usuario puede desactivar cada tipo de notificación independientemente
- Si el usuario ya practicó hoy, no se envía el recordatorio
- Nunca se envían notificaciones de marketing o upselling por push

---

## 9. Métricas Clave

| Métrica | Meta mes 1 | Meta mes 3 | Meta mes 6 |
|---------|-----------|-----------|-----------|
| Usuarios registrados | 50-100 | 300-500 | 1,000+ |
| Usuarios activos diarios | 20-30 | 100-150 | 300+ |
| Usuarios Pro | 3-5 | 20-30 | 78+ |
| Ingreso mensual | $400-650 MXN | $2,500-3,900 MXN | $10,000+ MXN |
| Tasa conversión free→pro | 3-5% | 5-7% | 7-10% |

**Punto de equilibrio para $10,000 MXN/mes:** 78 usuarios Pro a $129 MXN/mes (ingreso neto ~$9,300 MXN después de comisiones de MP)

---

## 10. Costos Operativos y Escalamiento

### Cuándo escalar cada servicio

#### Dominio — voxie.lat
- **Comprar en Vercel:** $1.99 USD/año. Vercel vende dominios a precio de costo sin markup. Incluye WHOIS privacy gratis. Simplifica la configuración DNS a cero porque ya está integrado con tu proyecto.
- **Recomendación:** Sí, comprarlo en Vercel es buena idea por simplicidad y precio.

#### Vercel: Hobby → Pro ($20 USD/mes)
| Recurso Hobby | Límite | Cuándo duele |
|---|---|---|
| Bandwidth | 100 GB/mes | ~50,000-100,000 visitas/mes |
| Serverless CPU | 4 horas/mes | ~5,000-10,000 usuarios activos con llamadas IA |
| Function timeout | 60 segundos | No es problema con prompts optimizados |
| Build concurrente | 1 | Molesto pero no bloqueante |

**Escalar cuando:** Tengas ~2,000-5,000 usuarios activos mensuales O el CPU time se acerque al 80% del límite.
**Costo Pro:** $20 USD/mes (~$400 MXN) con $20 USD de crédito para overages incluido.

**IMPORTANTE:** El plan Hobby de Vercel es técnicamente para uso personal/no comercial. Al momento de cobrar suscripciones, se debería migrar a Pro para cumplir con los términos de servicio. Planear esta migración para cuando se active Mercado Pago.

#### Supabase: Free → Pro ($25 USD/mes)
| Recurso Free | Límite | Cuándo duele |
|---|---|---|
| Database | 500 MB | ~1,000-5,000 usuarios con datos de progreso |
| Storage | 1 GB | Depende si guardas audio/imágenes |
| Auth MAU | 50,000 | No será problema |
| Egress | 5 GB/mes | ~2,000-3,000 usuarios activos |

**Problema crítico del Free:** Los proyectos se pausan después de 1 semana sin actividad. Para una app en producción con usuarios reales, esto es inaceptable.
**Escalar cuando:** Al lanzar a producción con usuarios reales. $25 USD/mes (~$500 MXN) es prácticamente obligatorio.
**Costo Pro:** $25 USD/mes con 8 GB de DB, backups diarios, y sin pausas.

#### Gemini API
| Nivel | Requests/día | Costo mensual estimado |
|---|---|---|
| Free tier | ~1,500 RPD (2.0 Flash) | $0 |
| 100 usuarios activos | ~400-800 RPD | $0 (dentro del free tier) |
| 500 usuarios activos | ~2,000-4,000 RPD | $50-100 MXN (con caché) |
| 2,000 usuarios activos | ~8,000-16,000 RPD | $200-500 MXN (con caché) |

**Escalar cuando:** Superes los 1,500 RPD del free tier, aproximadamente con ~300-500 usuarios activos diarios.
**Reducción de costos:** Caché de IA (60-80% reducción) + selección de modelo barato + prompts cortos.

### Resumen de costos por fase

| Fase | Usuarios | Vercel | Supabase | Gemini | MP comisiones | Total/mes |
|---|---|---|---|---|---|---|
| **Lanzamiento** | 0-100 | $0 (Hobby) | $500 (Pro) | $0 (free tier) | ~$0 | ~$500 MXN |
| **Primeros pagos** | 100-500 | $400 (Pro) | $500 | $0-100 | ~$50-200 | ~$1,000-1,200 MXN |
| **Crecimiento** | 500-2,000 | $400 | $500-600 | $100-300 | ~$200-800 | ~$1,200-2,100 MXN |
| **Meta $10k** | 2,000-5,000 | $400-600 | $600-800 | $200-500 | ~$700-900 | ~$1,900-2,800 MXN |

**Ganancia neta en meta de $10k MXN/mes:** ~$7,200-8,100 MXN después de todos los costos.

---

## 11. Hoja de Ruta de Implementación

### Semana 1: Infraestructura
- [ ] Comprar dominio voxie.lat en Vercel ($1.99 USD)
- [ ] Implementar tabla `ai_cache` en Supabase
- [ ] Implementar sistema de tiers en DB (`tier: 'free' | 'pro'`)
- [ ] Rate limiting en endpoints de IA
- [ ] Migrar Supabase a Pro ($25 USD/mes)

### Semana 2: Gate de Features
- [ ] Lógica de gate en frontend (verificar tier antes de mostrar features Pro)
- [ ] Bloquear niveles A2→B2 para usuarios free (visible pero con candado)
- [ ] Contador de uso diario para features limitadas en free (5 msgs tutor, 10 FSRS, 1 historia/semana, 2 historial)
- [ ] UI informativa de "desbloquea con Pro" mostrando qué incluye

### Semana 3: Pagos + Landing
- [ ] Integrar Mercado Pago Suscripciones (Checkout Pro + webhooks idempotentes)
- [ ] Migrar Vercel a Pro ($20 USD/mes) — requerido para uso comercial
- [ ] Landing page en voxie.lat con pricing transparente
- [ ] Guía de instalación PWA dentro de la app y en la landing

### Semana 4: Lanzamiento Beta
- [ ] Renombrar app de LinguaCore → Voxie (branding, textos, metadata, PWA manifest)
- [ ] Configurar dominio voxie.lat en Vercel
- [ ] Publicar en grupos de Facebook
- [ ] Primeros 10-20 usuarios beta

### Semana 5-8: Iteración
- [ ] Implementar trial de 7 días Pro (se activa al completar 14 días consecutivos de uso)
- [ ] Notificaciones push (máximo 2 por día: recordatorio + dato de aprendizaje)
- [ ] Ajustar basándose en feedback de usuarios reales

---

## 12. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Pocos usuarios pagan | Alta | Free tier A1 genera boca a boca. Los que terminan A1 tienen incentivo natural para continuar |
| Costos de IA se disparan | Media | Caché agresivo + rate limiting + monitoreo semanal + modelo barato (2.0 Flash) |
| Gemini sube precios o cambia API | Baja | Capa de abstracción en `api/lib/gemini.ts` permite cambiar a otro proveedor |
| Mercado Pago retiene fondos | Media-Baja | Mantener documentación del negocio lista, crecer gradualmente sin picos |
| Mercado Pago rechaza pagos | Baja | Ofrecer múltiples métodos (débito, OXXO, SPEI) |
| Competidores copian el modelo | Baja | La ventaja es ejecución + comunidad, no la idea |
| Vercel Hobby se pausa por exceder límites | Media | Monitorear uso, migrar a Pro antes de lanzar pagos |

---

## 13. Principios No Negociables

1. **Sin precios engañosos** — un precio, sin tachados, sin timers falsos, sin "ofertas por tiempo limitado"
2. **A1 completo y gratis para siempre** — el usuario free puede completar todo el nivel A1 sin restricción de tiempo
3. **Sin notificaciones spam** — máximo 2 por día, configurables, y solo si aportan valor
4. **Sin manipulación emocional** — el streak es informativo, no punitivo. No hay castigo por no practicar
5. **Transparencia total** — el usuario sabe exactamente qué obtiene gratis y qué obtiene pagando
6. **Un solo humano opera esto** — no se promete contenido ni soporte que no se pueda mantener solo
