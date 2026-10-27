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
    "can't": ['can', 'not'], "won't": ['will', 'not'], "shan't": ['shall', 'not'], cannot: ['can', 'not'],
};

export interface Token {
    word: string;
    /** Capitalised: a name if it isn't a known word (sentence starts are checked by the caller). */
    capitalised: boolean;
    sentenceStart: boolean;
}

// Inline tags sit inside words ("<span>walk</span>ed"); block tags separate them
const INLINE_TAGS = /<\/?(?:span|strong|em|b|i|u|mark)\b[^>]*>/gi;

function decodeEntities(text: string): string {
    return text
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
        .replace(/&(rsquo|lsquo|apos);/g, "'")
        .replace(/&[a-z]+;/g, ' ');
}

/** Words of a text without markup, lower-cased; contractions are split ("don't" → do, not). */
export function tokenizeWithNames(text: string): Token[] {
    const plain = decodeEntities(text.replace(INLINE_TAGS, '').replace(/<[^>]+>/g, ' ')).replace(/[’‘]/g, "'");
    const out: Token[] = [];
    let atStart = true;
    for (const m of plain.matchAll(/\p{L}+(?:'\p{L}+)?|[.!?]/gu)) {
        const raw = m[0];
        if (/^[.!?]$/.test(raw)) { atStart = true; continue; }
        const capitalised = /^\p{Lu}/u.test(raw);
        const sentenceStart = atStart;
        atStart = false;
        const lower = raw.toLowerCase();
        const push = (w: string) => w && out.push({ word: w, capitalised, sentenceStart });
        if (IRREGULAR_NEGATIVES[lower]) { IRREGULAR_NEGATIVES[lower].forEach(push); continue; }
        const c = lower.match(/^(\p{L}+?)(n't|'m|'re|'ve|'ll|'d)$/u);
        if (c) { push(c[1]); CONTRACTIONS[c[2]].forEach(push); continue; }
        // Possessive 's and its contraction collapse onto the word
        push(lower.replace(/'s$/, ''));
    }
    return out;
}

export const tokenize = (text: string): string[] => tokenizeWithNames(text).map(t => t.word);

// base:past:participle for irregular verbs; base:plural for irregular nouns
const IRREGULAR = `be:was:been be:were:been be:is: be:am: be:are: have:had:had have:has: do:did:done do:does: go:went:gone go:goes:
get:got:gotten make:made:made say:said:said see:saw:seen come:came:come take:took:taken know:knew:known give:gave:given
find:found:found think:thought:thought tell:told:told become:became:become leave:left:left feel:felt:felt bring:brought:brought
begin:began:begun keep:kept:kept hold:held:held write:wrote:written stand:stood:stood hear:heard:heard let:let:let mean:meant:meant
set:set:set meet:met:met run:ran:run pay:paid:paid sit:sat:sat speak:spoke:spoken lie:lay:lain lay:laid:laid lead:led:led
read:read:read grow:grew:grown lose:lost:lost fall:fell:fallen send:sent:sent build:built:built understand:understood:understood
draw:drew:drawn break:broke:broken spend:spent:spent cut:cut:cut rise:rose:risen drive:drove:driven buy:bought:bought
wear:wore:worn choose:chose:chosen seek:sought:sought throw:threw:thrown catch:caught:caught deal:dealt:dealt win:won:won
forget:forgot:forgotten sell:sold:sold fight:fought:fought teach:taught:taught eat:ate:eaten sing:sang:sung swim:swam:swum
drink:drank:drunk fly:flew:flown sleep:slept:slept wake:woke:woken ride:rode:ridden hide:hid:hidden shake:shook:shaken
steal:stole:stolen forgive:forgave:forgiven freeze:froze:frozen bite:bit:bitten blow:blew:blown feed:fed:fed hang:hung:hung
hit:hit:hit hurt:hurt:hurt put:put:put shut:shut:shut cost:cost:cost light:lit:lit lend:lent:lent bend:bent:bent
stick:stuck:stuck strike:struck:struck swing:swung:swung dig:dug:dug shoot:shot:shot slide:slid:slid spread:spread:spread
burn:burnt:burnt learn:learnt:learnt dream:dreamt:dreamt smell:smelt:smelt spell:spelt:spelt flee:fled:fled weep:wept:wept
sink:sank:sunk sweep:swept:swept creep:crept:crept kneel:knelt:knelt bleed:bled:bled spin:spun:spun sting:stung:stung
swear:swore:sworn tear:tore:torn bear:bore:born wind:wound:wound ring:rang:rung shine:shone:shone show:showed:shown
beat:beat:beaten forbid:forbade:forbidden arise:arose:arisen awake:awoke:awoken mistake:mistook:mistaken
withdraw:withdrew:withdrawn overcome:overcame:overcome undertake:undertook:undertaken
child:children man:men woman:women person:people foot:feet tooth:teeth mouse:mice goose:geese life:lives wife:wives
knife:knives leaf:leaves half:halves shelf:shelves wolf:wolves thief:thieves loaf:loaves`;

const IRREGULAR_LEMMA = new Map<string, string>();
for (const entry of IRREGULAR.split(/\s+/)) {
    const [base, ...forms] = entry.split(':');
    for (const f of forms) if (f && f !== base) IRREGULAR_LEMMA.set(f, base);
}

/** Regular dictionary forms a word could come from, most specific rule first. */
function suffixCandidates(w: string): string[] {
    const out: string[] = [];
    const add = (s: string) => { if (s.length > 1) out.push(s); };
    const undouble = (stem: string) => {
        if (stem.length > 2 && stem.at(-1) === stem.at(-2) && !'aeiou'.includes(stem.at(-1)!)) add(stem.slice(0, -1));
    };
    if (w.endsWith('ies')) add(w.slice(0, -3) + 'y');
    if (w.endsWith('ves')) { add(w.slice(0, -3) + 'f'); add(w.slice(0, -3) + 'fe'); }
    if (w.endsWith('es')) add(w.slice(0, -2));
    if (w.endsWith('s') && !w.endsWith('ss')) add(w.slice(0, -1));
    if (w.endsWith('ied')) add(w.slice(0, -3) + 'y');
    if (w.endsWith('ed')) { undouble(w.slice(0, -2)); add(w.slice(0, -2)); add(w.slice(0, -1)); }
    if (w.endsWith('ying')) add(w.slice(0, -4) + 'ie');
    if (w.endsWith('ing')) { undouble(w.slice(0, -3)); add(w.slice(0, -3)); add(w.slice(0, -3) + 'e'); }
    if (w.endsWith('ier')) add(w.slice(0, -3) + 'y');
    if (w.endsWith('iest')) add(w.slice(0, -4) + 'y');
    if (w.endsWith('er')) { undouble(w.slice(0, -2)); add(w.slice(0, -2)); add(w.slice(0, -1)); }
    if (w.endsWith('est')) { undouble(w.slice(0, -3)); add(w.slice(0, -3)); add(w.slice(0, -2)); }
    if (w.endsWith('ily')) add(w.slice(0, -3) + 'y');
    if (w.endsWith('ly')) add(w.slice(0, -2));
    return out;
}

/** The word and the dictionary forms it could come from ("studies" → study, "went" → go). */
export function lemmaCandidates(word: string): string[] {
    const w = word.toLowerCase();
    const irregular = IRREGULAR_LEMMA.get(w);
    return [...new Set([w, ...(irregular ? [irregular] : []), ...suffixCandidates(w)])];
}

/**
 * The one dictionary form of a word, given the words a lexicon holds. A word the lexicon holds
 * as written is itself ("career" stays career, not care); only otherwise are its forms tried.
 */
export function lemmaOf(word: string, has: (w: string) => boolean): string {
    const w = word.toLowerCase();
    const irregular = IRREGULAR_LEMMA.get(w);
    if (irregular) return irregular;
    if (has(w)) return w;
    return suffixCandidates(w).find(has) ?? w;
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

/** Level of a word as written in a text ("went" takes the level of go). */
export function levelOf(word: string, index: Map<string, string>): string | undefined {
    return index.get(lemmaOf(word, w => index.has(w)));
}

// ---------- Stories

export interface CoverageReport {
    words: number;
    /** Share of words the learner can read: known, at or below the level, or names. */
    coverage: number;
    aboveLevel: string[];
    /** Neither in the reference list nor taught (and not a name): counted as unreadable. */
    unknown: string[];
    names: string[];
}

/** How readable a text is for a learner at `level` who already knows the words in `known`. */
export function storyCoverage(content: string, level: string, index: Map<string, string>, known = new Set<string>()): CoverageReport {
    const tokens = tokenizeWithNames(content);
    const has = (w: string) => index.has(w) || known.has(w);
    const aboveLevel = new Set<string>();
    const unknown = new Set<string>();
    const names = new Set<string>();
    let ok = 0;
    // A capitalised word that is neither in the list nor taught is a name ("Ana", "Patel"),
    // also at the start of a sentence; lower-case unknown words count against the reader
    for (const { word, capitalised } of tokens) {
        const lemma = lemmaOf(word, has);
        const lvl = index.get(lemma);
        if (known.has(lemma) || known.has(word)) ok++;
        else if (lvl !== undefined && levelRank(lvl) <= levelRank(level)) ok++;
        else if (lvl !== undefined) aboveLevel.add(lemma);
        else if (capitalised) { ok++; names.add(word); }
        else unknown.add(word);
    }
    return {
        words: tokens.length,
        coverage: tokens.length ? ok / tokens.length : 1,
        aboveLevel: [...aboveLevel],
        unknown: [...unknown],
        names: [...names],
    };
}

/** Words of a vocabulary id: "figure-out" → [figure, out]. */
const idWords = (id: string) => id.toLowerCase().split(/[-\s]+/);

/**
 * In how many stories each vocabulary word appears, in any of its forms. Multi-word ids
 * ("figure-out") match their words in order, the first one inflected, with at most one word
 * between them ("figure it out").
 */
export function storyEncounters(stories: { content: string }[], vocabIds: string[], index: Map<string, string>): Map<string, number> {
    const ids = new Set(vocabIds.map(id => id.toLowerCase()));
    const has = (w: string) => index.has(w) || ids.has(w);
    const counts = new Map(vocabIds.map(id => [id, 0]));
    for (const story of stories) {
        const words = tokenize(story.content);
        const lemmas = words.map(w => lemmaOf(w, has));
        const lemmaSet = new Set(lemmas);
        for (const id of vocabIds) {
            const parts = idWords(id);
            const found = parts.length === 1
                ? lemmaSet.has(parts[0])
                : lemmas.some((l, i) => l === parts[0] && phraseRestAt(words, i + 1, parts.slice(1)));
            if (found) counts.set(id, counts.get(id)! + 1);
        }
    }
    return counts;
}

function phraseRestAt(words: string[], from: number, rest: string[]): boolean {
    const matches = (start: number) => rest.every((p, k) => words[start + k] === p);
    return matches(from) || matches(from + 1);
}

export interface LevelCheck {
    /** Level differs from the reference list. */
    mismatched: { id: string; ours: string; reference: string }[];
    /** Id is an inflected form (teeth, decided): cards should use the dictionary form. */
    notLemma: { id: string; lemma: string }[];
    /** Not in the list at all; multi-word ids are checked by their first word. */
    missing: string[];
}

/** Vocabulary entries whose level or form disagrees with the reference list. */
export function checkVocabularyLevels(vocab: { id: string; cefrLevel: string }[], index: Map<string, string>): LevelCheck {
    const result: LevelCheck = { mismatched: [], notLemma: [], missing: [] };
    for (const v of vocab) {
        const parts = idWords(v.id);
        const phrase = parts.join(' ');
        if (index.has(phrase)) {
            if (index.get(phrase) !== v.cefrLevel) result.mismatched.push({ id: v.id, ours: v.cefrLevel, reference: index.get(phrase)! });
            continue;
        }
        if (parts.length > 1) {
            // Phrasal verbs aren't in CEFR-J; their verb must not be above the phrase's level
            const head = index.get(lemmaOf(parts[0], w => index.has(w)));
            if (!head) result.missing.push(v.id);
            else if (levelRank(head) > levelRank(v.cefrLevel)) result.mismatched.push({ id: v.id, ours: v.cefrLevel, reference: head });
            continue;
        }
        const lemma = lemmaOf(phrase, w => index.has(w));
        if (lemma !== phrase && index.has(lemma)) result.notLemma.push({ id: v.id, lemma });
        else result.missing.push(v.id);
    }
    return result;
}
