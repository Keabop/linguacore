import { Fragment, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/ui/BackButton';
import { LEGAL_DOCS, LEGAL_UPDATED, type LegalDocId } from '../data/legal';
import PageHead from '../components/ui/PageHead';

const linkClass = 'font-semibold text-[var(--color-primary)] underline underline-offset-2';

// [text](/route), an e-mail address or **bold**, in that order of the alternation
const INLINE = /(\[[^\]]+\]\([^)]+\)|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|\*\*[^*]+\*\*)/g;
const EMAIL = /^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/;

/** The few inline marks the legal texts use. */
function inline(text: string): ReactNode[] {
    return text.split(INLINE).map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) return <Link key={i} to={link[2]} className={linkClass}>{link[1]}</Link>;
        if (EMAIL.test(part)) return <a key={i} href={`mailto:${part}`} className={linkClass}>{part}</a>;
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-[var(--color-on-surface)]">{part.slice(2, -2)}</strong>;
        return <Fragment key={i}>{part}</Fragment>;
    });
}

const OTHER_DOCS: LegalDocId[] = ['privacidad', 'terminos', 'cookies'];

/** Privacy notice, terms or cookie policy, from `data/legal.ts`. */
export default function Legal({ doc }: { doc: LegalDocId }) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { title, intro, sections } = LEGAL_DOCS[doc];

    return (
        <div className="py-6 px-4 max-w-3xl mx-auto space-y-8">
            {/* Linked from the sign-up form, the footer and the settings; opened from outside the app, it goes home */}
            <BackButton label={t('common.back')} onClick={() => (location.key === 'default' ? navigate('/') : navigate(-1))} />

            <PageHead
                title={title}
                lead={inline(intro)}
                meta={[
                    t('legal.updated', { date: LEGAL_UPDATED }),
                    !i18n.language.startsWith('es') && t('legal.spanishOnly'),
                ]}
            />

            {sections.map((section, s) => (
                <section key={section.title} className="space-y-3" aria-labelledby={`legal-${s}`}>
                    <h2 id={`legal-${s}`} className="text-lg font-bold">{section.title}</h2>
                    {section.body.map((block, b) =>
                        Array.isArray(block) ? (
                            <ul key={b} className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-on-surface-muted)]">
                                {block.map((item, j) => <li key={j}>{inline(item)}</li>)}
                            </ul>
                        ) : (
                            <p key={b} className="text-sm leading-relaxed text-[var(--color-on-surface-muted)]">{inline(block)}</p>
                        ),
                    )}
                </section>
            ))}

            <nav aria-label={t('legal.otherDocs')} className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--color-outline-subtle)] pt-6 text-sm">
                {OTHER_DOCS.filter(id => id !== doc).map(id => (
                    <Link key={id} to={`/${id}`} className={linkClass}>{LEGAL_DOCS[id].title}</Link>
                ))}
            </nav>
        </div>
    );
}
