import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ user: { id: 'ana', user_metadata: {} as Record<string, unknown> } as { id: string; user_metadata: Record<string, unknown> } | null }));
const updateUser = vi.hoisted(() => vi.fn(async () => ({ data: {}, error: null })));
vi.mock('../lib/AuthContext', () => ({ useAuth: () => ({ user: auth.user }) }));
vi.mock('../lib/supabase', () => ({ supabase: { auth: { updateUser } } }));

import { isGuideNewcomer, useGuide } from './useGuide';

describe('isGuideNewcomer', () => {
    const base = { progressLoaded: true, level: 'A1', unlockedLevels: ['A1'], unitsCompleted: 0 };
    it('is a newcomer only at the very start of A1, once the progress is known', () => {
        expect(isGuideNewcomer(base)).toBe(true);
        expect(isGuideNewcomer({ ...base, progressLoaded: false })).toBe(false);
        expect(isGuideNewcomer({ ...base, unitsCompleted: 1 })).toBe(false);
    });
    it('is not a newcomer after moving up a level, with no unit of the new one done', () => {
        expect(isGuideNewcomer({ ...base, level: 'A2', unlockedLevels: ['A1', 'A2'] })).toBe(false);
        expect(isGuideNewcomer({ ...base, unlockedLevels: ['A1', 'A2'] })).toBe(false);
    });
});

describe('useGuide', () => {
    beforeEach(() => {
        localStorage.clear();
        updateUser.mockClear();
        auth.user = { id: 'ana', user_metadata: {} };
    });

    it('remembers the welcome in the account and in this browser', () => {
        const { result } = renderHook(() => useGuide());
        expect(result.current.welcomeSeen).toBe(false);
        act(() => result.current.markWelcomeSeen());
        expect(result.current.welcomeSeen).toBe(true);
        expect(result.current.opened).toBe(false);
        expect(updateUser).toHaveBeenCalledWith({ data: { guide_welcome_seen: true } });
    });

    it('does not hand one learner\'s marks to the next one on the same device', () => {
        const { result, rerender } = renderHook(() => useGuide());
        act(() => result.current.markOpened());
        expect(result.current.opened).toBe(true);

        auth.user = { id: 'beto', user_metadata: {} };
        rerender();
        expect(result.current.opened).toBe(false);
        expect(result.current.welcomeSeen).toBe(false);
    });

    it('does not write to the account what it already has', () => {
        auth.user = { id: 'ana', user_metadata: { guide_opened: true } };
        const { result } = renderHook(() => useGuide());
        expect(result.current.welcomeSeen).toBe(true);
        act(() => result.current.markOpened());
        expect(updateUser).not.toHaveBeenCalled();
    });
});
