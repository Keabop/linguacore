/**
 * Normalize an answer string for flexible comparison.
 * Expands contractions, collapses whitespace, lowercases, strips punctuation.
 */

const CONTRACTIONS: [RegExp, string][] = [
    [/\bi'm\b/g, 'i am'],
    [/\byou're\b/g, 'you are'],
    [/\bhe's\b/g, 'he is'],
    [/\bshe's\b/g, 'she is'],
    [/\bit's\b/g, 'it is'],
    [/\bwe're\b/g, 'we are'],
    [/\bthey're\b/g, 'they are'],
    [/\bi've\b/g, 'i have'],
    [/\byou've\b/g, 'you have'],
    [/\bwe've\b/g, 'we have'],
    [/\bthey've\b/g, 'they have'],
    [/\bi'll\b/g, 'i will'],
    [/\byou'll\b/g, 'you will'],
    [/\bhe'll\b/g, 'he will'],
    [/\bshe'll\b/g, 'she will'],
    [/\bit'll\b/g, 'it will'],
    [/\bwe'll\b/g, 'we will'],
    [/\bthey'll\b/g, 'they will'],
    [/\bi'd\b/g, 'i would'],
    [/\byou'd\b/g, 'you would'],
    [/\bhe'd\b/g, 'he would'],
    [/\bshe'd\b/g, 'she would'],
    [/\bwe'd\b/g, 'we would'],
    [/\bthey'd\b/g, 'they would'],
    [/\bisn't\b/g, 'is not'],
    [/\baren't\b/g, 'are not'],
    [/\bwasn't\b/g, 'was not'],
    [/\bweren't\b/g, 'were not'],
    [/\bdon't\b/g, 'do not'],
    [/\bdoesn't\b/g, 'does not'],
    [/\bdidn't\b/g, 'did not'],
    [/\bhasn't\b/g, 'has not'],
    [/\bhaven't\b/g, 'have not'],
    [/\bhadn't\b/g, 'had not'],
    [/\bwon't\b/g, 'will not'],
    [/\bwouldn't\b/g, 'would not'],
    [/\bshouldn't\b/g, 'should not'],
    [/\bcouldn't\b/g, 'could not'],
    [/\bcan't\b/g, 'cannot'],
    [/\blet's\b/g, 'let us'],
    [/\bthat's\b/g, 'that is'],
    [/\bwho's\b/g, 'who is'],
    [/\bwhat's\b/g, 'what is'],
    [/\bthere's\b/g, 'there is'],
    [/\bhere's\b/g, 'here is'],
    [/\bwhere's\b/g, 'where is'],
    [/\bhow's\b/g, 'how is'],
];

function expandContractions(text: string): string {
    let result = text;
    for (const [pattern, replacement] of CONTRACTIONS) {
        result = result.replace(pattern, replacement);
    }
    return result;
}

export function normalizeAnswer(text: string): string {
    let normalized = text.trim().toLowerCase();
    // Strip trailing punctuation (., !, ?)
    normalized = normalized.replace(/[.!?]+$/, '');
    // Expand contractions
    normalized = expandContractions(normalized);
    // Collapse multiple spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
}

/**
 * Compare two answers with flexible matching.
 * Both answers are normalized before comparison.
 */
export function answersMatch(userAnswer: string, correctAnswer: string): boolean {
    return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}
