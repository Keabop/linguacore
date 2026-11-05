/**
 * When a new version of the app may replace the open one without the learner noticing.
 *
 * A reload is only safe between tasks: on a screen that holds nothing half done. Lessons,
 * stories, the tutor, the error lab and the simulator are never interrupted; the sign-in form
 * isn't either (it could be half typed).
 */
const RESTING_ROUTES = new Set(['/', '/landing', '/dashboard', '/path', '/learn', '/review', '/practice', '/account', '/pricing']);

export function isRestingRoute(pathname: string): boolean {
    const path = pathname.replace(/\/+$/, '') || '/';
    return RESTING_ROUTES.has(path);
}

/** Right after the app opens nothing is in progress yet: a version found this soon is applied at once */
export const FRESH_OPEN_MS = 10_000;

/** How often an open app asks the server for a new version */
export const CHECK_EVERY_MS = 15 * 60 * 1000;

interface UpdateMoment {
    /** Where the learner is now */
    pathname: string;
    /** Where the learner was when the new version was found */
    pathnameWhenFound: string;
    /** Milliseconds from opening the app to finding the new version */
    foundAfterMs: number;
}

/**
 * Whether to apply a waiting version now: when it was found while the app was still opening, or
 * once the learner moves to another screen, and in both cases only on a resting screen.
 */
export function shouldApplyNow({ pathname, pathnameWhenFound, foundAfterMs }: UpdateMoment): boolean {
    if (!isRestingRoute(pathname)) return false;
    const justOpened = foundAfterMs < FRESH_OPEN_MS && pathname === pathnameWhenFound;
    const movedOn = pathname !== pathnameWhenFound;
    return justOpened || movedOn;
}
