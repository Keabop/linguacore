/**
 * A reading passage: the first line is its title, blank lines separate paragraphs, and a
 * paragraph that starts with its letter ("A  Deep beneath…") shows the letter apart, since
 * heading questions refer to it.
 */
export default function PassageView({ text }: { text: string }) {
    const [title, ...paragraphs] = text.split(/\n\s*\n/);
    return (
        <article className="bg-[var(--color-surface-container)] rounded-2xl p-5 border border-[var(--color-surface-container-highest)] max-h-[45vh] overflow-y-auto text-[15px] leading-relaxed text-[var(--color-on-surface)] space-y-3">
            <h4 className="font-display text-base font-extrabold">{title.trim()}</h4>
            {paragraphs.map((p, i) => {
                const lettered = p.match(/^([A-H])\s{2,}([\s\S]*)$/);
                return lettered ? (
                    <p key={i} className="flex gap-3">
                        <span className="font-mono font-black text-[var(--color-primary)]" aria-label={`Párrafo ${lettered[1]}`}>{lettered[1]}</span>
                        <span>{lettered[2]}</span>
                    </p>
                ) : (
                    <p key={i}>{p}</p>
                );
            })}
        </article>
    );
}
