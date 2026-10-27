// Builds the reference data in content/reference/ from the original sources.
// Usage: node scripts/build-reference-data.mjs <cefrj-vocabulary-profile-1.5.csv> <cmudict.dict>
// Sources and licences: content/reference/README.md
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const [csvPath, cmuPath] = process.argv.slice(2);
if (!csvPath || !cmuPath) {
    console.error('Usage: node scripts/build-reference-data.mjs <cefrj.csv> <cmudict.dict>');
    process.exit(1);
}

const OUT = 'content/reference';
mkdirSync(OUT, { recursive: true });

// CEFR-J: headword,pos,CEFR,... ; variants come as "analyze/analyse"
const rows = readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1);
const vocabulary = [];
const seen = new Set();
for (const row of rows) {
    const [headword, pos, level] = row.split(',');
    for (const variant of headword.split('/')) {
        const word = variant.trim().toLowerCase();
        const key = `${word}|${pos}|${level}`;
        // Case variants (a.m. / A.M.) collapse into one entry
        if (word && !seen.has(key)) {
            seen.add(key);
            vocabulary.push([word, pos, level]);
        }
    }
}
writeFileSync(`${OUT}/cefrj-vocabulary.json`, JSON.stringify(vocabulary));

// CMUdict, only for the words of the list (first pronunciation of each)
const wanted = new Set(vocabulary.map(([w]) => w));
const pronunciations = {};
for (const line of readFileSync(cmuPath, 'utf8').split('\n')) {
    const match = line.match(/^(\S+?)(?:\(\d+\))?\s+([^#]+)/);
    if (!match) continue;
    const word = match[1].toLowerCase();
    if (wanted.has(word) && !(word in pronunciations)) pronunciations[word] = match[2].trim();
}
writeFileSync(`${OUT}/pronunciations.json`, JSON.stringify(pronunciations));

console.log(`${vocabulary.length} vocabulary entries, ${Object.keys(pronunciations).length} pronunciations`);
