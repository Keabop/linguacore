# Datos de referencia del contenido

Sólo los usan los tests y `npm run content:audit`; no entran al bundle de la app.
Se generan con `node scripts/build-reference-data.mjs <cefrj.csv> <cmudict.dict>`.

| Archivo | Qué es | Fuente y licencia |
|---|---|---|
| `cefrj-vocabulary.json` | Palabra, categoría y nivel CEFR (A1–B2), una fila por variante ortográfica. | The CEFR-J Wordlist Version 1.5. Compiled by Yukio Tono, Tokyo University of Foreign Studies. Uso de investigación y comercial gratuito citando el dataset; copyright de Tono Laboratory, TUFS. Obtenido de https://github.com/openlanguageprofiles/olp-en-cefrj |
| `pronunciations.json` | Pronunciación en ARPAbet (inglés de EE. UU.) de las palabras de la lista; se convierte a IPA con `src/data/arpabet.ts`. | CMU Pronouncing Dictionary, Copyright (C) 1993-2015 Carnegie Mellon University. Licencia BSD en `CMUDICT-LICENSE`. Obtenido de https://github.com/cmusphinx/cmudict |
