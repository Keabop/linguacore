import { useEffect, useRef } from 'react';
import type { AnimatedIcon, AnimatedIconHandle } from './index';

/** Plays an animated icon once when it appears (e.g. the check of a correct answer). */
export default function PlayOnMount({ icon: Icon, size = 20, className }: { icon: AnimatedIcon; size?: number; className?: string }) {
    const ref = useRef<AnimatedIconHandle>(null);

    useEffect(() => {
        ref.current?.startAnimation();
    }, []);

    return <Icon ref={ref} size={size} className={className} isAnimated={false} aria-hidden="true" />;
}
