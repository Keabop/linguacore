import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Garden from './Garden';

vi.mock('../../hooks/useGardenPlant', () => ({
    useGardenPlant: () => ({ species: 'margarita' }),
}));

describe('Garden', () => {
    it('renders one plant per unit with grown, sprout and seed stages', () => {
        const { container } = render(<Garden total={8} completed={5} label="5 de 8" grow={false} />);
        const plants = container.querySelectorAll('.plant');
        expect(plants).toHaveLength(8);
        expect(container.querySelectorAll('.plant.is-grown')).toHaveLength(5);
        expect(plants[5]).toHaveClass('is-sprout');
        expect(container.querySelectorAll('.plant.is-seed')).toHaveLength(2);
    });

    it("uses the user's species unless one is passed", () => {
        const { container, rerender } = render(<Garden total={2} completed={1} label="x" grow={false} />);
        expect(container.querySelector('.plant')).toHaveClass('sp-margarita');
        rerender(<Garden total={2} completed={1} label="x" grow={false} species="cactus" />);
        expect(container.querySelector('.plant')).toHaveClass('sp-cactus');
    });

    it('has no sprout when every unit is complete', () => {
        const { container } = render(<Garden total={3} completed={3} label="3 de 3" grow={false} />);
        expect(container.querySelectorAll('.plant.is-grown')).toHaveLength(3);
        expect(container.querySelector('.plant.is-sprout')).toBeNull();
    });

    it('exposes the progress as an accessible image', () => {
        render(<Garden total={4} completed={1} label="1 de 4 unidades completas" grow={false} />);
        expect(screen.getByRole('img', { name: '1 de 4 unidades completas' })).toBeInTheDocument();
    });
});
