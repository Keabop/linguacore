/*
 * The three achievement moments of the Jardín system: a correct answer, a streak that
 * goes up and a completed unit. They are the only places that use the spring easing,
 * so they read as a reward. CSS lives in index.css (.celebrate-pop, .answer-nudge).
 */

/** Restart a CSS animation class on an element, even if it is already applied. */
export function replayAnimation(el: HTMLElement | null, className: string) {
    if (!el) return;
    el.classList.remove(className);
    // Force a reflow so the browser sees the class as new
    void el.offsetWidth;
    el.classList.add(className);
    el.addEventListener('animationend', () => el.classList.remove(className), { once: true });
}

/** Correct answer: a short pop. */
export const celebrateCorrect = (el: HTMLElement | null) => replayAnimation(el, 'celebrate-pop');

/** Wrong answer: a short sideways nudge, never a full-screen red flash. */
export const nudgeWrong = (el: HTMLElement | null) => replayAnimation(el, 'answer-nudge');
