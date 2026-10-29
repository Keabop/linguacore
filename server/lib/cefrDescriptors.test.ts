import { describe, expect, it } from 'vitest';
import { CEFR_DESCRIPTORS, descriptorRubric } from './cefrDescriptors';

describe('descriptorRubric', () => {
    it("states the level's descriptor and the scale measured against it", () => {
        const rubric = descriptorRubric('B1', 'writing');
        expect(rubric).toContain(CEFR_DESCRIPTORS.B1.writing);
        expect(rubric).toContain('50–74: it does what the descriptor expects at B1');
    });

    it('uses A1 for an unknown level', () => {
        expect(descriptorRubric('Z9', 'speaking')).toContain(CEFR_DESCRIPTORS.A1.speaking);
    });
});
