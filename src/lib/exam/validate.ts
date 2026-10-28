import { countWords, normalizeAnswer, parseCompleteWords } from './grading';
import { adaptiveSections } from './adaptive';
import { isMultipleChoice, type AssessmentQuestion } from './types';

const flat = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();

/** The text a question is answered from: its passage or its listening script. */
const sourceText = (q: AssessmentQuestion) => flat(`${q.passage ?? ''} ${(q.dialogue ?? []).map(l => l.text).join(' ')}`);

/** Problems that would make a question unanswerable or ambiguous as written (empty when fine). */
export function validateQuestion(q: AssessmentQuestion): string[] {
    const problems: string[] = [];
    if (!q.text?.trim()) problems.push('sin enunciado');
    if (q.section === 'listening' && !q.dialogue?.length && !q.audioSrc) problems.push('escucha sin audio ni guion');
    if (q.evidence && !sourceText(q).includes(flat(q.evidence))) problems.push('la evidencia no aparece en el texto o el guion');

    if (isMultipleChoice(q)) {
        if (q.options.length < 2) problems.push('menos de 2 opciones');
        if (!(q.correctIndex >= 0 && q.correctIndex < q.options.length)) problems.push('correctIndex fuera de rango');
        if (new Set(q.options.map(normalizeAnswer)).size !== q.options.length) problems.push('opciones repetidas');
        return problems;
    }
    switch (q.kind) {
        case 'tfng':
            if (!['true', 'false', 'not-given'].includes(q.answer)) problems.push('respuesta TFNG inválida');
            if (!q.passage && !q.dialogue) problems.push('TFNG sin texto que juzgar');
            break;
        case 'gap':
            if (q.text.split('___').length !== 2) problems.push('el hueco debe aparecer una vez (___)');
            if (!q.answers.length) problems.push('sin respuestas aceptadas');
            if (q.maxWords && q.answers.some(a => countWords(a, q.allowNumber) > q.maxWords!)) {
                problems.push('una respuesta aceptada pasa el límite de palabras');
            }
            break;
        case 'complete-words':
            if (!parseCompleteWords(q.text).some(p => typeof p !== 'string')) problems.push('sin palabras que completar');
            break;
        case 'build-sentence': {
            if (q.pieces.length < 2) problems.push('menos de 2 piezas');
            const sorted = (s: string) => normalizeAnswer(s).split(' ').sort().join(' ');
            if (sorted(q.pieces.join(' ')) !== sorted(q.answer)) problems.push('las piezas no forman la respuesta');
            break;
        }
    }
    return problems;
}

/**
 * Problems with an exam's adaptive layout: every adaptive section needs router, lower and
 * upper items, with both stages after the router (the learner meets them in that order).
 */
export function validateExamStructure(questions: AssessmentQuestion[]): string[] {
    const problems: string[] = [];
    for (const section of adaptiveSections(questions)) {
        const at = (stage: string) => questions.flatMap((q, i) => (q.section === section && q.stage === stage ? [i] : []));
        const [router, lower, upper] = [at('router'), at('lower'), at('upper')];
        if (!router.length || !lower.length || !upper.length) problems.push(`${section}: faltan preguntas router, lower o upper`);
        if (router.length && [...lower, ...upper].some(i => i < Math.max(...router))) problems.push(`${section}: una etapa aparece antes de su router`);
    }
    return problems;
}
