import { sileo, type SileoOptions, type SileoPosition } from 'sileo';

/** Returns 'top-center' on mobile (< 768px), 'top-right' on desktop */
function getPosition(): SileoPosition {
    if (typeof window === 'undefined') return 'top-right';
    return window.innerWidth < 768 ? 'top-center' : 'top-right';
}

/** Duration based on text length: short (≤30 chars) = 2s, longer = 3s */
function getDuration(opts: Pick<SileoOptions, 'title' | 'description'>): number {
    const len = (opts.title?.length ?? 0) + (typeof opts.description === 'string' ? opts.description.length : 0);
    return len > 30 ? 3000 : 2000;
}

function fire(method: 'success' | 'error' | 'warning' | 'info', opts: SileoOptions) {
    return sileo[method]({
        ...opts,
        position: opts.position ?? getPosition(),
        duration: opts.duration ?? getDuration(opts),
    });
}

export const toast = {
    success: (opts: SileoOptions) => fire('success', opts),
    error: (opts: SileoOptions) => fire('error', opts),
    warning: (opts: SileoOptions) => fire('warning', opts),
    info: (opts: SileoOptions) => fire('info', opts),
};
