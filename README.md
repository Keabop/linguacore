# Voxie

App web para aprender inglés con IA (niveles CEFR A1–B2), con historias, repaso espaciado (FSRS), tutor de conversación, simuladores de examen y modo offline.

## Stack

React 19, Vite 7, TypeScript, Tailwind 4, PWA, TanStack Query, Supabase, Gemini (sólo desde el backend) y Mercado Pago. Se publica en Cloudflare Pages: `functions/api/` son las rutas del backend y `server/` el código que comparten (agentes de IA, límites de uso, CORS).

## Desarrollo

```bash
npm install
npm run dev
```

Variables del cliente en `.env.local`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Variables del backend en `.dev.vars` (las lee `wrangler pages dev`; en producción van en Cloudflare Pages → Settings → Variables and Secrets):

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_TEST_PAYER_EMAIL=
APP_URL=
```

Ninguno de los dos archivos se sube a git.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en el puerto 5173 |
| `npm run build` | Revisión de tipos (cliente y funciones) y build de producción |
| `npm run pages` | Build y servidor local de Cloudflare con el backend en el puerto 8788 |
| `npm run test:run` | Pruebas con Vitest |

## Base de datos

Las migraciones viven en `supabase/migrations/` en orden cronológico.
