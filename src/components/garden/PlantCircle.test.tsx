import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import PlantCircle from './PlantCircle';

/** Top of the stem in viewBox units (the frame is 64 tall, soil at 56). */
const stemTop = (container: HTMLElement) => {
    const d = container.querySelector('.stem')!.getAttribute('d')!;
    return Number(d.trim().split(/[\s,]+/).at(-1));
};

describe('PlantCircle', () => {
    it('keeps a tall plant short enough for its flower to stay inside the circle', () => {
        const { container } = render(<PlantCircle species="girasol" height={88} grow={false} />);
        expect(stemTop(container)).toBe(56 - 44);
    });

    it('keeps the requested height when it fits', () => {
        const { container } = render(<PlantCircle species="tulipan" height={30} grow={false} />);
        expect(stemTop(container)).toBe(56 - 30);
    });

    it('clips anything that would still stick out', () => {
        const { container } = render(<PlantCircle species="girasol" />);
        expect(container.firstElementChild).toHaveClass('overflow-hidden', 'rounded-full');
    });
});
