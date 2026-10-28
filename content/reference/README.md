# Datos de referencia del contenido

Sólo los usan los tests, `npm run content:audit` y `npm run content:phonetics`; no entran al bundle de
la app. Lo que sí llega a la app es el IPA generado (`src/data/vocabulary/phonetics.ts`) y el texto de
`CMUDICT-LICENSE`, que la pantalla de créditos (`/credits`) reproduce como pide su licencia.
Se generan con `node scripts/build-reference-data.mjs <cefrj.csv> <cmudict.dict>`.

| Archivo | Qué es | Fuente y licencia |
|---|---|---|
| `cefrj-vocabulary.json` | Palabra, categoría y nivel CEFR (A1–B2), una fila por variante ortográfica. | The CEFR-J Wordlist Version 1.5. Compiled by Yukio Tono, Tokyo University of Foreign Studies. Retrieved from http://www.cefr-j.org/download.html (via the mirror https://github.com/openlanguageprofiles/olp-en-cefrj) on 27/10/2026. Uso de investigación y comercial gratuito citando el dataset; copyright de Tono Laboratory, TUFS. |
| `pronunciations.json` | Pronunciaciones en ARPAbet (inglés de EE. UU.) de las palabras de la lista; todas las variantes, porque los homógrafos (read, live, close) tienen más de una. Se convierten a IPA con `src/data/arpabet.ts`. | CMU Pronouncing Dictionary, Copyright (C) 1993-2015 Carnegie Mellon University. Licencia BSD en `CMUDICT-LICENSE`. Obtenido de https://github.com/cmusphinx/cmudict el 27/10/2026. |

La cláusula 2 de la licencia de CMUdict pide reproducir su aviso en la documentación de la app:
está en la pantalla de créditos (`src/pages/Credits.tsx`).
