// `npm run eval:check`: runs the real AI evaluators on the sample bank (src/data/evals) and
// checks each score falls in its expected range (every run of it), and that the tutor talks at
// the learner's level. Reads GEMINI_API_KEY from .dev.vars; each run makes about 60 Gemini calls.
import { existsSync, readFileSync } from 'node:fs';
import reference from '../content/reference/cefrj-vocabulary.json';
import { setEnv } from '../server/lib/config';
import { evaluateWriting } from '../server/agents/writing-evaluator';
import { evaluateSpeaking } from '../server/agents/speaking-evaluator';
import { chat } from '../server/agents/conversation-tutor';
import { buildLevelIndex, levelRank, type ReferenceEntry } from '../src/data/contentMetrics';
import { allVocabulary } from '../src/data/vocabulary';
import { evalSamples, injectionSamples, tutorSamples } from '../src/data/evals/samples';
import { aboveLevelShare, checkScore } from '../src/data/evals/check';

if (!existsSync('.dev.vars')) {
    console.error('Falta .dev.vars con GEMINI_API_KEY (ver cerebro/referencia/entorno.md).');
    process.exit(1);
}
const vars = Object.fromEntries(readFileSync('.dev.vars', 'utf8').split(/\r?\n/)
    .map(line => line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map(m => [m[1], m[2]]));
setEnv(vars);

const index = buildLevelIndex(reference as ReferenceEntry[]);
const rows: { id: string; expected: string; got: string; ok: boolean }[] = [];

// Each sample runs more than once: a score that only lands in range sometimes is not calibrated
const RUNS = 2;

/** Runs `call`, waiting out the free tier's per-minute limit (a 429 says how long) up to 3 times. */
async function patiently<T>(call: () => Promise<T>): Promise<T> {
    for (let attempt = 1; ; attempt++) {
        try {
            return await call();
        } catch (e) {
            const wait = (e as Error).message.match(/"retryDelay":"(\d+)s"/);
            if (!wait || attempt === 3) throw e;
            await new Promise(r => setTimeout(r, (Number(wait[1]) + 2) * 1000));
        }
    }
}

for (const s of [...evalSamples, ...injectionSamples]) {
    const scores: number[] = [];
    try {
        for (let run = 0; run < RUNS; run++) {
            scores.push(await patiently(async () => s.skill === 'writing'
                ? (await evaluateWriting({ text: s.answer, prompt: s.prompt, level: s.level, type: 'free-writing', targetGrammar: [] })).score
                : (await evaluateSpeaking({ transcripts: [s.answer], prompts: [s.prompt], level: s.level })).score));
        }
        rows.push({ id: s.id, expected: `${s.expected[0]}–${s.expected[1]}`, got: scores.join(' / '), ok: scores.every(n => checkScore(s, n).ok) });
    } catch (e) {
        rows.push({ id: s.id, expected: `${s.expected[0]}–${s.expected[1]}`, got: `error: ${(e as Error).message}`, ok: false });
    }
}

for (const s of tutorSamples) {
    const known = new Set(allVocabulary.filter(v => levelRank(v.cefrLevel) <= levelRank(s.level)).map(v => v.id));
    try {
        const { reply } = await patiently(() => chat({ messages: s.messages, level: s.level }));
        const share = aboveLevelShare(reply, s.level, index, known);
        rows.push({ id: s.id, expected: `≤ ${Math.round(s.maxAboveLevel * 100)} %`, got: `${Math.round(share * 100)} %`, ok: share <= s.maxAboveLevel });
    } catch (e) {
        rows.push({ id: s.id, expected: `≤ ${Math.round(s.maxAboveLevel * 100)} %`, got: `error: ${(e as Error).message}`, ok: false });
    }
}

console.table(rows);
const failed = rows.filter(r => !r.ok);
console.log(failed.length ? `${failed.length} de ${rows.length} fuera de rango` : `Las ${rows.length} muestras caen en su rango`);
process.exit(failed.length ? 1 : 0);
