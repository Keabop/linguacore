import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('useLevelContent', () => {
    it('gives nothing while the level loads, then its content', async () => {
        vi.resetModules();
        const { useLevelContent } = await import('./index');
        const { result } = renderHook(() => useLevelContent('A2'));
        expect(result.current).toBeNull();
        await waitFor(() => expect(result.current).not.toBeNull());
        expect(result.current!.exercises.every(e => e.unitId.startsWith('a2-'))).toBe(true);
    });

    it('never shows the previous level after switching to another', async () => {
        vi.resetModules();
        const { useLevelContent } = await import('./index');
        const { result, rerender } = renderHook(({ level }) => useLevelContent(level), { initialProps: { level: 'A1' as 'A1' | 'B2' } });
        await waitFor(() => expect(result.current).not.toBeNull());
        rerender({ level: 'B2' });
        // Either nothing yet or B2: never A1 content under the B2 level
        expect(result.current === null || result.current.exercises[0].unitId.startsWith('b2-')).toBe(true);
        await waitFor(() => expect(result.current?.exercises[0].unitId.startsWith('b2-')).toBe(true));
    });

    it('gives nothing without a level, and reads the level of any content id', async () => {
        const { levelOfId, useLevelContent } = await import('./index');
        expect(renderHook(() => useLevelContent(null)).result.current).toBeNull();
        expect([levelOfId('a1-u3'), levelOfId('b2-026'), levelOfId('b1-u2-s1'), levelOfId('ai-a1-1730000000'), levelOfId(undefined)])
            .toEqual(['A1', 'B2', 'B1', null, null]);
    });
});

describe('loadLevel', () => {
    it('tries again after a failed download (offline before the service worker cached it)', async () => {
        vi.resetModules();
        let fail = true;
        vi.doMock('./a1', async () => {
            if (fail) throw new Error('Failed to fetch dynamically imported module');
            return vi.importActual('./a1');
        });
        const { loadLevel } = await import('./index');
        await expect(loadLevel('A1')).rejects.toThrow();
        fail = false;
        await expect(loadLevel('A1')).resolves.toHaveProperty('exercises');
        vi.doUnmock('./a1');
    });
});

describe('a level that fails to download', () => {
    it("reaches the screen's error boundary instead of leaving an endless loader", async () => {
        vi.resetModules();
        vi.doMock('./b1', async () => { throw new TypeError('Failed to fetch dynamically imported module: /assets/level-b1-old.js'); });
        const { useLevelContent } = await import('./index');
        const { default: ErrorBoundary } = await import('../../components/ErrorBoundary');
        function Lesson() {
            return useLevelContent('B1') ? <p>Lesson</p> : <p>Loading</p>;
        }
        const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(<ErrorBoundary><Lesson /></ErrorBoundary>);
        expect(screen.getByText('Loading')).toBeInTheDocument();
        // The boundary's error screen, which offers to reload (vitest wraps the mocked module's
        // message, so it can't show its offline variant here)
        expect(await screen.findByText('Algo salió mal')).toBeInTheDocument();
        expect(screen.queryByText('Loading')).toBeNull();
        errors.mockRestore();
        vi.doUnmock('./b1');
    });
});
