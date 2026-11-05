import { describe, expect, it } from 'vitest';
import { FRESH_OPEN_MS, isRestingRoute, shouldApplyNow } from './updatePolicy';

describe('isRestingRoute', () => {
    it('lets the screens between tasks reload', () => {
        expect(isRestingRoute('/dashboard')).toBe(true);
        expect(isRestingRoute('/path/')).toBe(true);
        expect(isRestingRoute('/')).toBe(true);
    });

    it('never interrupts a lesson, a story, the tutor or the sign-in form', () => {
        expect(isRestingRoute('/path/a1-u1')).toBe(false);
        expect(isRestingRoute('/learn/my-family')).toBe(false);
        expect(isRestingRoute('/chat')).toBe(false);
        expect(isRestingRoute('/review/simulator')).toBe(false);
        expect(isRestingRoute('/auth')).toBe(false);
    });
});

describe('shouldApplyNow', () => {
    it('applies a version found while the app is still opening', () => {
        expect(shouldApplyNow({ pathname: '/dashboard', pathnameWhenFound: '/dashboard', foundAfterMs: 2_000 })).toBe(true);
    });

    it('waits on the same screen once the learner is using it', () => {
        expect(shouldApplyNow({ pathname: '/dashboard', pathnameWhenFound: '/dashboard', foundAfterMs: FRESH_OPEN_MS + 1 })).toBe(false);
    });

    it('applies it when the learner moves on to a resting screen', () => {
        expect(shouldApplyNow({ pathname: '/path', pathnameWhenFound: '/path/a1-u1', foundAfterMs: 60_000 })).toBe(true);
    });

    it('never applies it in the middle of a lesson, even right after opening', () => {
        expect(shouldApplyNow({ pathname: '/path/a1-u1', pathnameWhenFound: '/path/a1-u1', foundAfterMs: 1_000 })).toBe(false);
        expect(shouldApplyNow({ pathname: '/path/a1-u2', pathnameWhenFound: '/path', foundAfterMs: 60_000 })).toBe(false);
    });
});
