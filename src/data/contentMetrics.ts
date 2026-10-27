// Measures of the teaching content against the plan's targets: story length, how much of a
// story the learner can already read, how often each word comes back, and whether word levels
// agree with the CEFR-J reference list. Used by the content tests and `npm run content:audit`.
import type { CEFRLevel } from '../lib/db';

export type Level = Extract<CEFRLevel, 'A1' | 'A2' | 'B1' | 'B2'>;
export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2'];
export const levelRank = (l: string) => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(l);

/** Targets of the teaching plan (cerebro/contenido/plan-ensenanza.md). */
export const TARGETS = {
    storyWords: { A1: 150, A2: 250, B1: 400, B2: 600 } as Record<Level, number>,
    /** New words taught at each level (the deck grows by this much). */
    deckSize: { A1: 600, A2: 600, B1: 800, B2: 800 } as Record<Level, number>,
    storiesPerUnit: 2,
    /** Share of a story's words at or below its level (Hu & Nation: ~95% for unassisted reading). */
    minCoverage: 0.95,
    /** Stories in which each deck word should appear. */
    minEncounters: 3,
};

/**
 * Levels whose content has been rebuilt under the plan; the content tests enforce the targets
 * only for these. A phase adds its level here when it lands.
 */
export const ENFORCED_LEVELS: Level[] = [];

/** Exam banks that must be free of templated or repeated questions (IELTS and TOEFL join when rebuilt). */
export const ENFORCED_EXAMS = ['placement', 'cambridgeB1', 'cambridgeB2'] as const;

/** A question written from a template ("Passage 1 - Question 3: …") instead of for its text. */
export const isTemplated = (text: string) => /Question \d+|Passage \d+ -/.test(text);

// ---------- Words

const CONTRACTIONS: Record<string, string[]> = {
    "n't": ['not'], "'m": ['am'], "'re": ['are'], "'ve": ['have'], "'ll": ['will'], "'d": ['would'],
};
const IRREGULAR_NEGATIVES: Record<string, string[]> = {
    "can't": ['can', 'not'], "won't": ['will', 'not'], "shan't": ['shall', 'not'],
};

/** Lower-case words of a text, without markup; contractions are split ("don't" → do, not). */
export function tokenize(text: string): string[] {
    const plain = text.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/[’‘]/g, "'");
    const out: string[] = [];
    for (const raw of plain.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []) {
        if (IRREGULAR_NEGATIVES[raw]) { out.push(...IRREGULAR_NEGATIVES[raw]); continue; }
        const m = raw.match(/^([a-z]+?)(n't|'m|'re|'ve|'ll|'d)$/);
        if (m) { out.push(m[1], ...CONTRACTIONS[m[2]]); continue; }
        // Possessive 's and its contraction collapse onto the noun
        out.push(raw.replace(/'s$/, ''));
    }
    return out.filter(Boolean);
}

// base:past:participle for irregular verbs; plural:singular for irregular nouns
const IRREGULAR = `be:was:been be:were:been be:is: be:am: be:are: have:had:had have:has: do:did:done do:does: go:went:gone go:goes:
get:got:gotten make:made:made say:said:said see:saw:seen come:came:come take:took:taken know:knew:known give:gave:given
find:found:found think:thought:thought tell:told:told become:became:become leave:left:left feel:felt:felt bring:brought:brought
begin:began:begun keep:kept:kept hold:held:held write:wrote:written stand:stood:stood hear:heard:heard let:let:let mean:meant:meant
set:set:set meet:met:met run:ran:run pay:paid:paid sit:sat:sat speak:spoke:spoken lie:lay:lain lead:led:led read:read:read
grow:grew:grown lose:lost:lost fall:fell:fallen send:sent:sent build:built:built understand:understood:understood
draw:drew:drawn break:broke:broken spend:spent:spent cut:cut:cut rise:rose:risen drive:drove:driven buy:bought:bought
wear:wore:worn choose:chose:chosen seek:sought:sought throw:threw:thrown catch:caught:caught deal:dealt:dealt win:won:won
forget:forgot:forgotten sell:sold:sold fight:fought:fought teach:taught:taught eat:ate:eaten sing:sang:sung swim:swam:swum
drink:drank:drunk fly:flew:flown sleep:slept:slept wake:woke:woken ride:rode:ridden hide:hid:hidden shake:shook:shaken
steal:stole:stolen forgive:forgave:forgiven freeze:froze:frozen bite:bit:bitten blow:blew:blown feed:fed:fed hang:hung:hung
hit:hit:hit hurt:hurt:hurt put:put:put shut:shut:shut cost:cost:cost light:lit:lit lend:lent:lent bend:bent:bent
stick:stuck:stuck strike:struck:struck swing:swung:swung dig:dug:dug shoot:shot:shot slide:slid:slid spread:spread:spread
burn:burnt:burnt learn:learnt:learnt dream:dreamt:dreamt smell:smelt:smelt spell:spelt:spelt
child:children man:men woman:women person:people foot:feet tooth:teeth mouse:mice life:lives wife:wives knife:knives
leaf:leaves half:halves shelf:shelves wolf:wolves`;

const IRREGULAR_LEMMA = new Map<string, string>();
for (const entry of IRREGULAR.split(/\s+/)) {
    const [base, ...forms] = entry.split(':');
    for (const f of forms) if (f && f !== base) IRREGULAR_LEMMA.set(f, base);
}

/** The word and the dictionary forms it could come from ("studies" → study, "went" → go). */
export function lemmaCandidates(word: string): string[] {
    const w = word.toLowerCase();
    const out = [w];
    const irregular = IRREGULAR_LEMMA.get(w);
    if (irregular) out.push(irregular);
    const add = (s: string) => { if (s.length > 1) out.push(s); };
    if (w.endsWith('ies')) add(w.slice(0, -3) + 'y');
    if (w.endsWith('es')) add(w.slice(0, -2));
    if (w.endsWith('s') && !w.endsWith('ss')) add(w.slice(0, -1));
    if (w.endsWith('ied')) add(w.slice(0, -3) + 'y');
    if (w.endsWith('ed')) { add(w.slice(0, -2)); add(w.slice(0, -1)); undouble(w.slice(0, -2), add); }
    if (w.endsWith('ing')) { add(w.slice(0, -3)); add(w.slice(0, -3) + 'e'); undouble(w.slice(0, -3), add); }
    if (w.endsWith('er')) { add(w.slice(0, -2)); add(w.slice(0, -1)); undouble(w.slice(0, -2), add); }
    if (w.endsWith('est')) { add(w.slice(0, -3)); add(w.slice(0, -2)); undouble(w.slice(0, -3), add); }
    if (w.endsWith('ier')) add(w.slice(0, -3) + 'y');
    if (w.endsWith('iest')) add(w.slice(0, -4) + 'y');
    if (w.endsWith('ly')) { add(w.slice(0, -2)); if (w.endsWith('ily')) add(w.slice(0, -3) + 'y'); }
    return [...new Set(out)];
}

/** "stopped" → "stop": a doubled final consonant before -ed/-ing/-er. */
function undouble(stem: string, add: (s: string) => void) {
    if (stem.length > 2 && stem.at(-1) === stem.at(-2) && !'aeiou'.includes(stem.at(-1)!)) add(stem.slice(0, -1));
}

// ---------- Reference levels

export type ReferenceEntry = [word: string, pos: string, level: string];

/** Lowest CEFR level at which each reference word appears. */
export function buildLevelIndex(entries: ReferenceEntry[]): Map<string, string> {
    const index = new Map<string, string>();
    for (const [word, , level] of entries) {
        const current = index.get(word);
        if (!current || levelRank(level) < levelRank(current)) index.set(word, level);
    }
    return index;
}

/** Level of a word as written in a text, trying its possible dictionary forms. */
export function levelOf(word: string, index: Map<string, string>): string | undefined {
    let best: string | undefined;
    for (const candidate of lemmaCandidates(word)) {
        const level = index.get(candidate);
        if (level && (!best || levelRank(level) < levelRank(best))) best = level;
    }
    return best;
}

// ---------- Stories

export interface CoverageReport {
    words: number;
    /** Share of words at or below the target level (or names/numbers the list does not hold). */
    coverage: number;
    aboveLevel: string[];
    notInList: string[];
}

/**
 * How readable a text is for a learner at `level`. Words the reference list doesn't hold
 * (names, places) don't count against it, but are listed so they can be checked.
 */
export function storyCoverage(content: string, level: string, index: Map<string, string>, known = new Set<string>()): CoverageReport {
    const words = tokenize(content);
    const aboveLevel: string[] = [];
    const notInList: string[] = [];
    let ok = 0;
    for (const w of words) {
        const lvl = levelOf(w, index);
        if (known.has(w) || lemmaCandidates(w).some(c => known.has(c))) ok++;
        else if (lvl === undefined) { ok++; notInList.push(w); }
        else if (levelRank(lvl) <= levelRank(level)) ok++;
        else aboveLevel.push(w);
    }
    return {
        words: words.length,
        coverage: words.length ? ok / words.length : 1,
        aboveLevel: [...new Set(aboveLevel)],
        notInList: [...new Set(notInList)],
    };
}

/** In how many stories each vocabulary word appears, in any of its forms. */
export function storyEncounters(stories: { content: string }[], vocabIds: string[]): Map<string, number> {
    const counts = new Map(vocabIds.map(id => [id, 0]));
    for (const story of stories) {
        const forms = new Set(tokenize(story.content).flatMap(lemmaCandidates));
        for (const id of vocabIds) if (forms.has(id)) counts.set(id, counts.get(id)! + 1);
    }
    return counts;
}

/** Vocabulary entries whose level disagrees with the reference list. */
export function levelMismatches(vocab: { id: string; cefrLevel: string }[], index: Map<string, string>) {
    return vocab
        .map(v => ({ id: v.id, ours: v.cefrLevel, reference: index.get(v.id) }))
        .filter(v => v.reference && v.reference !== v.ours);
}
