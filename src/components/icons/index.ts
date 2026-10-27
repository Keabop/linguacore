import type { ForwardRefExoticComponent, HTMLAttributes, RefAttributes } from 'react';

/** Imperative handle shared by every animated icon. */
export interface AnimatedIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
}

export interface AnimatedIconProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
    size?: number;
    duration?: number;
    isAnimated?: boolean;
    color?: string;
}

export type AnimatedIcon = ForwardRefExoticComponent<AnimatedIconProps & RefAttributes<AnimatedIconHandle>>;

export { BookOpenIcon } from './book-open';
export { CheckIcon } from './check';
export { FlameIcon } from './flame';
export { GraduationCapIcon } from './graduation-cap';
export { HouseIcon } from './house';
export { MapIcon } from './map';
export { MessageCircleIcon } from './message-circle';
export { MicIcon } from './mic';
export { PencilIcon } from './pencil';
export { RefreshCwIcon } from './refresh-cw';
export { SendIcon } from './send';
