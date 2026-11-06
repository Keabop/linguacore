import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Note } from '../../lib/notes';

const store = vi.hoisted(() => ({
    notes: [] as Note[],
    saveNote: vi.fn(),
    deleteNote: vi.fn(),
}));
vi.mock('../../hooks/useNotes', () => ({
    useNotes: () => ({ notes: store.notes, isLoading: false, isError: false, saveNote: store.saveNote, deleteNote: store.deleteNote }),
}));

import NotebookDock from './NotebookDock';
import { NotebookProvider, useNoteContext, useNotebook, useNotebookController } from './NotebookContext';

let phone = false;
function stubScreen(isPhone: boolean) {
    phone = isPhone;
    window.matchMedia = vi.fn((query: string) => ({
        matches: query.includes('max-width') ? phone : false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
}

function QuoteButton() {
    const notebook = useNotebook();
    return <button onClick={() => notebook?.quote('  an   apple  ')}>citar</button>;
}

function UnitPage() {
    useNoteContext({ key: 'unit:a1-u2', label: 'Unidad 2 · Artículos', path: '/path/a1-u2' });
    return null;
}

function App({ children }: { children?: React.ReactNode }) {
    const notebook = useNotebookController();
    return (
        <NotebookProvider value={notebook}>
            <main className="main-content">{children}</main>
            <NotebookDock side="right" railEdge={null} />
        </NotebookProvider>
    );
}

const renderApp = (children?: React.ReactNode, path = '/path') =>
    render(<MemoryRouter initialEntries={[path]}><App>{children}</App></MemoryRouter>);

const note = (over: Partial<Note>): Note => ({
    id: 'n1', body: 'Nota', quote: null, context_key: 'unit:a1-u1', context_label: 'Unidad 1', context_path: '/path/a1-u1',
    created_at: '2026-11-01T10:00:00Z', updated_at: '2026-11-01T10:00:00Z', ...over,
});

describe('Notebook', () => {
    beforeEach(() => {
        localStorage.clear();
        store.notes = [];
        store.saveNote.mockReset().mockResolvedValue(null);
        store.deleteNote.mockReset().mockResolvedValue(undefined);
        stubScreen(false);
    });

    it('opens with Alt+N on a computer and saves a note with the place it was written in', async () => {
        renderApp(<UnitPage />);
        expect(screen.queryByRole('complementary', { name: 'Libreta' })).not.toBeInTheDocument();

        fireEvent.keyDown(window, { key: 'n', code: 'KeyN', altKey: true });
        const panel = await screen.findByRole('complementary', { name: 'Libreta' });
        expect(within(panel).getByText(/Tu libreta está en blanco/)).toBeInTheDocument();
        expect(within(panel).getByText('Unidad 2 · Artículos')).toBeInTheDocument();

        const text = within(panel).getByRole('textbox', { name: /Escribe lo que quieras recordar/ });
        expect(text).toHaveFocus();
        fireEvent.change(text, { target: { value: 'a + consonante' } });
        fireEvent.click(within(panel).getByRole('button', { name: 'Punto' }));
        await waitFor(() => expect(text).toHaveValue('• a + consonante'));
        fireEvent.click(within(panel).getByRole('button', { name: 'Separación' }));
        await waitFor(() => expect(text).toHaveValue('• a + consonante\n———\n'));

        fireEvent.click(within(panel).getByRole('button', { name: 'Guardar' }));
        await waitFor(() => expect(store.saveNote).toHaveBeenCalledWith({
            id: undefined,
            body: '• a + consonante\n———\n',
            quote: null,
            context: { key: 'unit:a1-u2', label: 'Unidad 2 · Artículos', path: '/path/a1-u2' },
        }));
        expect(await within(panel).findByText('Nota guardada.')).toBeInTheDocument();
        expect(text).toHaveValue('');
    });

    it('falls back to the page the learner is on', async () => {
        renderApp(undefined, '/chat');
        fireEvent.keyDown(window, { key: 'n', code: 'KeyN', altKey: true });
        expect(await screen.findByText('Tutor IA')).toBeInTheDocument();
    });

    it('keeps the note being written when it closes', async () => {
        renderApp();
        fireEvent.keyDown(window, { key: 'n', code: 'KeyN', altKey: true });
        fireEvent.change(await screen.findByRole('textbox'), { target: { value: 'a medias' } });
        fireEvent.click(screen.getByRole('button', { name: 'Cerrar la libreta' }));
        await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());

        fireEvent.keyDown(window, { key: 'n', code: 'KeyN', altKey: true });
        expect(await screen.findByRole('textbox')).toHaveValue('a medias');
        expect(JSON.parse(localStorage.getItem('voxie-notebook-draft')!).body).toBe('a medias');
    });

    it('on a phone, the bubble opens a sheet and comes back when it closes', async () => {
        stubScreen(true);
        renderApp();
        fireEvent.click(screen.getByRole('button', { name: 'Abrir la libreta' }));
        const sheet = await screen.findByRole('dialog', { name: 'Libreta' });
        await waitFor(() => expect(screen.queryByRole('button', { name: 'Abrir la libreta' })).not.toBeInTheDocument());

        fireEvent.click(within(sheet).getByRole('button', { name: 'Agrandar la libreta' }));
        expect(within(sheet).getByRole('button', { name: 'Achicar la libreta' })).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(within(sheet).getByRole('button', { name: 'Cerrar la libreta' }));
        expect(await screen.findByRole('button', { name: 'Abrir la libreta' })).toBeInTheDocument();
    });

    it('a quote opens the notebook with the text quoted, and can be removed', async () => {
        renderApp(<QuoteButton />);
        fireEvent.click(screen.getByRole('button', { name: 'citar' }));
        const panel = await screen.findByRole('complementary', { name: 'Libreta' });
        expect(within(panel).getByText('an apple')).toBeInTheDocument();

        fireEvent.click(within(panel).getByRole('button', { name: 'Quitar la cita' }));
        expect(within(panel).queryByText('an apple')).not.toBeInTheDocument();
    });

    it('lists notes by place, searches them, edits and deletes', async () => {
        store.notes = [
            note({ id: 'n1', body: '• uno\n• dos' }),
            note({ id: 'n2', body: 'Present perfect', context_key: 'page:/chat', context_label: 'Tutor IA', context_path: '/chat', updated_at: '2026-11-05T10:00:00Z' }),
        ];
        renderApp();
        fireEvent.keyDown(window, { key: 'n', code: 'KeyN', altKey: true });
        const panel = await screen.findByRole('complementary', { name: 'Libreta' });

        const groups = within(panel).getAllByRole('region').filter(r => r.tagName === 'SECTION' && r.getAttribute('aria-label'));
        expect(groups.map(g => g.getAttribute('aria-label'))).toEqual(['Tutor IA', 'Unidad 1']);
        expect(within(panel).getAllByRole('listitem').map(li => li.textContent)).toEqual(expect.arrayContaining(['uno', 'dos']));

        fireEvent.change(within(panel).getByRole('searchbox'), { target: { value: 'perfect' } });
        expect(within(panel).queryByText('uno')).not.toBeInTheDocument();
        fireEvent.change(within(panel).getByRole('searchbox'), { target: { value: 'zzz' } });
        expect(within(panel).getByText('Ninguna nota tiene «zzz».')).toBeInTheDocument();
        fireEvent.change(within(panel).getByRole('searchbox'), { target: { value: '' } });

        const first = within(panel).getByText('Present perfect').closest('li')!;
        fireEvent.click(within(first).getByRole('button', { name: 'Editar la nota' }));
        expect(within(panel).getByRole('textbox')).toHaveValue('Present perfect');
        fireEvent.change(within(panel).getByRole('textbox'), { target: { value: 'Present perfect simple' } });
        fireEvent.click(within(panel).getByRole('button', { name: 'Guardar cambios' }));
        await waitFor(() => expect(store.saveNote).toHaveBeenCalledWith(expect.objectContaining({ id: 'n2', body: 'Present perfect simple' })));

        fireEvent.click(within(first).getByRole('button', { name: 'Borrar' }));
        fireEvent.click(within(first).getByRole('button', { name: 'Borrar' }));
        await waitFor(() => expect(store.deleteNote).toHaveBeenCalledWith('n2'));
    });

    it('offers «Anotar» for text selected in the page and quotes it', async () => {
        Range.prototype.getBoundingClientRect = () => ({ top: 200, bottom: 220, left: 40, right: 140, width: 100, height: 20 }) as DOMRect;
        renderApp(<p>The book is on the table.</p>);
        const text = screen.getByText('The book is on the table.').firstChild!;
        const range = document.createRange();
        range.setStart(text, 4);
        range.setEnd(text, 8);
        window.getSelection()!.removeAllRanges();
        window.getSelection()!.addRange(range);
        document.dispatchEvent(new Event('selectionchange'));

        fireEvent.click(await screen.findByRole('button', { name: 'Anotar' }));
        const panel = await screen.findByRole('complementary', { name: 'Libreta' });
        expect(within(panel).getByText('book')).toBeInTheDocument();
        expect(window.getSelection()!.toString()).toBe('');
    });

    it('does not offer «Anotar» for text typed in a field', async () => {
        Range.prototype.getBoundingClientRect = () => ({ top: 200, bottom: 220, left: 40, right: 140, width: 100, height: 20 }) as DOMRect;
        renderApp(<label>campo<textarea defaultValue="mi respuesta" /></label>);
        const field = screen.getByRole('textbox');
        const range = document.createRange();
        range.selectNodeContents(field);
        window.getSelection()!.removeAllRanges();
        window.getSelection()!.addRange(range);
        document.dispatchEvent(new Event('selectionchange'));
        await new Promise(r => setTimeout(r, 200));
        expect(screen.queryByRole('button', { name: 'Anotar' })).not.toBeInTheDocument();
    });

    it('closes with Escape from inside the panel', async () => {
        renderApp();
        fireEvent.keyDown(window, { key: 'n', code: 'KeyN', altKey: true });
        const text = await screen.findByRole('textbox');
        await act(async () => { fireEvent.keyDown(text, { key: 'Escape' }); });
        await waitFor(() => expect(screen.queryByRole('complementary')).not.toBeInTheDocument());
    });
});
