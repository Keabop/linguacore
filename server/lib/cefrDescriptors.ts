/**
 * What a learner can do at each CEFR level, in our own words, after the scales of the CEFR
 * Companion Volume (Council of Europe, 2020): Overall written production, Overall oral
 * production and Overall spoken interaction. The evaluators score against these, so a good A1
 * answer scores well as an A1 answer instead of being marked down for not being B2.
 */
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2';
export type CefrSkill = 'writing' | 'speaking' | 'interaction';

export const CEFR_DESCRIPTORS: Record<CefrLevel, Record<CefrSkill, string>> = {
    A1: {
        writing: 'Writes simple, mostly isolated phrases and sentences about themselves, people they know and everyday things, joined with "and" or "then". Basic errors are expected; what counts is that the meaning gets across.',
        speaking: 'Produces short, mostly isolated phrases about people and places, with long pauses, searching for words and restarting. Relies on memorised expressions.',
        interaction: 'Can interact in a simple way if the other person speaks slowly, repeats and helps. Asks and answers simple questions about immediate needs and very familiar topics.',
    },
    A2: {
        writing: 'Writes a series of simple phrases and sentences linked with "and", "but" and "because" about everyday life, past events and plans. Uses simple structures correctly but still makes basic mistakes, for example with tenses or agreement.',
        speaking: 'Gives a simple description of people, routines, likes and dislikes or past events as a short list of simple sentences. Pauses and false starts are frequent, but the listener follows.',
        interaction: 'Handles short social exchanges and routine tasks that need a simple, direct exchange of information on familiar topics, though they can rarely keep the conversation going on their own.',
    },
    B1: {
        writing: 'Writes straightforward connected text on familiar subjects, putting ideas in a clear sequence, describing experiences and feelings and giving brief reasons and explanations. Reasonably accurate in familiar contexts; errors do not block the meaning.',
        speaking: 'Sustains a fairly fluent, straightforward description or account as a sequence of points, giving reasons and explanations. Pauses to plan and repair are noticeable in longer stretches.',
        interaction: 'Enters unprepared into conversation on familiar topics, gives and asks for opinions and exchanges information, keeping it going with some effort and some searching for words.',
    },
    B2: {
        writing: 'Writes clear, detailed text on a range of subjects, developing an argument with supporting reasons and examples and linking ideas clearly. Good grammatical control and a fairly wide vocabulary; occasional slips, but nothing that causes misunderstanding.',
        speaking: 'Gives clear, detailed descriptions and presentations on a range of subjects, expanding and supporting ideas with relevant examples, at a fairly even pace and with few noticeably long pauses.',
        interaction: 'Interacts with a degree of fluency and spontaneity that makes regular conversation with proficient speakers possible without strain, explaining and defending their views.',
    },
};

export const toCefrLevel = (level: string): CefrLevel => (level in CEFR_DESCRIPTORS ? level as CefrLevel : 'A1');

/** Prompt lines: the level's descriptor, and the 0–100 scale measured against it. */
export function descriptorRubric(level: string, skill: Exclude<CefrSkill, 'interaction'>): string {
    const cefr = toCefrLevel(level);
    return `CEFR ${cefr} descriptor (${skill}): ${CEFR_DESCRIPTORS[cefr][skill]}
Score the answer against this descriptor, not against a perfect native answer:
- 75–100: it goes beyond what the descriptor expects at ${cefr}.
- 50–74: it does what the descriptor expects at ${cefr}, with the errors normal at this level.
- 0–49: it does not reach ${cefr} yet (too short, off task, or errors that block the meaning).`;
}
