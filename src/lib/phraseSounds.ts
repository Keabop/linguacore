import { firstStepsPhonetics } from '../data/vocabulary/phonetics/firstSteps';
import { soundsLike } from './soundsLike';

/**
 * A «Primeros pasos» phrase in Spanish letters, word by word («Nice to meet you» → «náis tu mit
 * yu»), from the IPA of src/data/vocabulary/phonetics/firstSteps.ts. Empty when a word has none.
 */
export function phraseSounds(en: string): string {
    const words = en.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean);
    const ipa = words.map(w => firstStepsPhonetics[w]);
    return ipa.length && ipa.every(Boolean) ? ipa.map(soundsLike).join(' ') : '';
}
