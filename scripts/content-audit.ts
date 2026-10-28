// `npm run content:audit`: where the teaching content stands against the plan's targets.
import { allStories, allUnits, allVocabulary } from '../src/data';
import { placementQuestions } from '../src/data/assessments/cefr-questions';
import { cambridgeB1Questions } from '../src/data/assessments/cambridge/b1';
import { cambridgeB2Questions } from '../src/data/assessments/cambridge/b2';
import { ieltsQuestions } from '../src/data/assessments/ielts-questions';
import { toeflQuestions } from '../src/data/assessments/toefl-questions';
import reference from '../content/reference/cefrj-vocabulary.json';
import {
    ENFORCED_LEVELS, LEVELS, TARGETS, buildLevelIndex, checkVocabularyLevels, isTemplated, levelRank, questionKey, storyCoverage,
    storyEncounters, type ReferenceEntry,
} from '../src/data/contentMetrics';

const index = buildLevelIndex(reference as ReferenceEntry[]);
const pct = (n: number) => `${Math.round(n * 100)}%`;
const mark = (ok: boolean) => (ok ? 'ok ' : 'NO ');
const list = (items: string[], max = 12) => items.slice(0, max).join(', ') + (items.length > max ? ` … y ${items.length - max} más` : '');

console.log('\nContenido frente a las metas del plan (cerebro/contenido/plan-ensenanza.md)');
console.log(`Niveles ya exigidos por los tests: ${ENFORCED_LEVELS.join(', ') || 'ninguno'}\n`);

for (const level of LEVELS) {
    const units = allUnits.filter(u => u.level === level && !u.isAssessment);
    const stories = allStories.filter(s => s.level === level);
    const deck = allVocabulary.filter(v => v.cefrLevel === level);
    // Words taught up to this level count as known when reading
    const known = new Set(allVocabulary.filter(v => levelRank(v.cefrLevel) <= levelRank(level)).map(v => v.id));
    const coverage = stories.map(s => storyCoverage(s.content, level, index, known));
    const avgWords = stories.reduce((n, s) => n + s.wordCount, 0) / Math.max(1, stories.length);
    const lowCoverage = coverage.filter(c => c.coverage < TARGETS.minCoverage).length;
    const unknown = [...new Set(coverage.flatMap(c => c.unknown))];
    const pool = allStories.filter(s => levelRank(s.level) <= levelRank(level) + 1);
    const encounters = storyEncounters(pool, deck.map(v => v.id), index);
    const rare = [...encounters.values()].filter(n => n < TARGETS.minEncounters).length;

    console.log(`== ${level}`);
    console.log(`  ${mark(stories.length >= units.length * TARGETS.storiesPerUnit)}historias: ${stories.length} (meta ${units.length * TARGETS.storiesPerUnit}, ${TARGETS.storiesPerUnit} por unidad)`);
    console.log(`  ${mark(avgWords >= TARGETS.storyWords[level])}largo medio: ${Math.round(avgWords)} palabras (meta ${TARGETS.storyWords[level]})`);
    console.log(`  ${mark(lowCoverage === 0)}cobertura: ${lowCoverage} de ${stories.length} historias bajo ${pct(TARGETS.minCoverage)}`);
    if (unknown.length) console.log(`      fuera de la lista y sin enseñar: ${list(unknown)}`);
    console.log(`  ${mark(deck.length >= TARGETS.deckSize[level])}vocabulario del nivel: ${deck.length} (meta ${TARGETS.deckSize[level]})`);
    console.log(`  ${mark(rare === 0)}repetición: ${rare} de ${deck.length} palabras en menos de ${TARGETS.minEncounters} historias`);
}

const check = checkVocabularyLevels(allVocabulary, index);
console.log('\n== Vocabulario frente a CEFR-J');
console.log(`  ${mark(check.mismatched.length === 0)}${check.mismatched.length} con otro nivel: ${list(check.mismatched.map(m => `${m.id} (${m.ours}→${m.reference})`))}`);
console.log(`  ${mark(check.notLemma.length === 0)}${check.notLemma.length} fichas con forma flexionada: ${list(check.notLemma.map(n => `${n.id}→${n.lemma}`))}`);
console.log(`  ${mark(check.missing.length === 0)}${check.missing.length} fuera de la lista: ${list(check.missing)}`);

console.log('\n== Exámenes');
const exams = { Nivelación: placementQuestions, 'Cambridge B1': cambridgeB1Questions, 'Cambridge B2': cambridgeB2Questions, IELTS: ieltsQuestions, TOEFL: toeflQuestions };
for (const [name, qs] of Object.entries(exams)) {
    const templated = qs.filter(q => isTemplated(q.text)).length;
    const repeated = qs.length - new Set(qs.map(questionKey)).size;
    console.log(`  ${mark(templated === 0 && repeated === 0)}${name}: ${qs.length} preguntas, ${templated} con plantilla, ${repeated} enunciados repetidos`);
}
console.log('');
