import { normalizeAnswer, parseCompleteWords } from './grading';
import { isMultipleChoice, type AssessmentQuestion } from './types';

/** Problems that would make a question unanswerable or ambiguous as written (empty when fine). */
export function validateQuestion(q: AssessmentQuestion): string[] {
    const problems: string[] = [];
    if (!q.text?.trim()) problems.push('sin enunciado');
    if (q.section === 'listening' && !q.dialogue?.length && !q.audioSrc) problems.push('escucha sin audio ni guion');

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
            if (q.maxWords && q.answers.some(a => normalizeAnswer(a).split(' ').length > q.maxWords!)) {
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
